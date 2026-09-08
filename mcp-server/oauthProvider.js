// OAuth 2.1 authorization server for the Timeline Studio MCP endpoint.
// Login is backed by the SAME users table and JWT/refresh-token infra as the
// main app (server/src/routes/auth.routes.js), so an MCP client authenticates
// with the user's existing Timeline Studio email + password.
//
// This file must stay ESM (not .cjs): InvalidTokenError has to be the SAME
// class object that bearerAuth.js's `instanceof` check uses, and that only
// happens if both resolve the SDK's "import" condition (the esm build).
// Requiring the SDK from a .cjs file resolves the "require" condition (the
// cjs build) instead — a different class object, which silently breaks the
// instanceof check and turns every invalid-token 401 into a 500.
import { randomUUID, createHash } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { InvalidTokenError, InvalidGrantError } from '@modelcontextprotocol/sdk/server/auth/errors.js';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Self-contained env loading: this module may be evaluated (via static ESM
// import) before server.js's own dotenv call runs, so server/src/config.js
// must not be the first thing to read process.env.
require('dotenv').config({ path: path.join(__dirname, '..', 'server', '.env') });

const pool = require('../server/src/db.js');
const { comparePassword } = require('../server/src/utils/password.js');
const { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } = require('../server/src/utils/jwt.js');
const config = require('../server/src/config.js');

const AUTH_CODE_TTL_MS = 5 * 60 * 1000;

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderLoginPage({ client, params, error }) {
  const hidden = {
    client_id: client.client_id,
    redirect_uri: params.redirectUri,
    response_type: 'code',
    code_challenge: params.codeChallenge,
    code_challenge_method: 'S256',
  };
  if (params.state !== undefined) hidden.state = params.state;
  if (params.resource !== undefined) hidden.resource = params.resource.toString();
  if (params.scopes?.length) hidden.scope = params.scopes.join(' ');

  const hiddenInputs = Object.entries(hidden)
    .map(([name, value]) => `<input type="hidden" name="${escapeAttr(name)}" value="${escapeAttr(value)}">`)
    .join('\n      ');

  const clientName = client.client_name ? escapeAttr(client.client_name) : 'this application';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Sign in — Timeline Studio</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
  .card { background: #1e293b; padding: 2rem; border-radius: 12px; width: 320px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
  h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
  p.desc { color: #94a3b8; font-size: 0.875rem; margin-top: 0; }
  label { display: block; margin-top: 1rem; font-size: 0.8rem; color: #cbd5e1; }
  input[type=email], input[type=password] { width: 100%; box-sizing: border-box; padding: 0.5rem; margin-top: 0.25rem; border-radius: 6px; border: 1px solid #334155; background: #0f172a; color: #e2e8f0; }
  button { width: 100%; margin-top: 1.5rem; padding: 0.6rem; border: none; border-radius: 6px; background: #6366f1; color: white; font-weight: 600; cursor: pointer; }
  button:hover { background: #4f46e5; }
  .error { color: #f87171; font-size: 0.85rem; margin-top: 1rem; }
</style>
</head>
<body>
  <div class="card">
    <h1>Sign in to Timeline Studio</h1>
    <p class="desc">Authorize ${clientName} to access your Timeline Studio account.</p>
    ${error ? `<p class="error">${escapeAttr(error)}</p>` : ''}
    <form method="POST" action="/authorize">
      ${hiddenInputs}
      <label>Email
        <input type="email" name="email" required autofocus>
      </label>
      <label>Password
        <input type="password" name="password" required>
      </label>
      <button type="submit">Sign in</button>
    </form>
  </div>
</body>
</html>`;
}

// Persisted to Postgres (not an in-memory Map): Render restarts/redeploys the
// process often, and an in-memory store would silently invalidate every
// client mcp-remote had already registered, breaking its cached refresh
// tokens with "invalid_client" until it re-registers and the user logs in
// again.
class McpClientsStore {
  async getClient(clientId) {
    const result = await pool.query('SELECT metadata FROM mcp_oauth_clients WHERE client_id = $1', [clientId]);
    return result.rows[0]?.metadata;
  }
  async registerClient(clientMetadata) {
    await pool.query(
      'INSERT INTO mcp_oauth_clients (client_id, metadata) VALUES ($1, $2) ON CONFLICT (client_id) DO UPDATE SET metadata = EXCLUDED.metadata',
      [clientMetadata.client_id, JSON.stringify(clientMetadata)]
    );
    return clientMetadata;
  }
}

class TimelineStudioOAuthProvider {
  constructor() {
    this.clientsStore = new McpClientsStore();
    this.codes = new Map(); // code -> { client, params, userId, email, createdAt }
  }

  async authorize(client, params, res) {
    const req = res.req;

    if (req.method !== 'POST') {
      res.status(200).send(renderLoginPage({ client, params }));
      return;
    }

    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    const result = await pool.query('SELECT id, email, password_hash FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    const passwordMatch = user ? await comparePassword(password, user.password_hash) : false;

    if (!user || !passwordMatch) {
      res.status(401).send(renderLoginPage({ client, params, error: 'Invalid email or password' }));
      return;
    }

    const code = randomUUID();
    this.codes.set(code, { client, params, userId: user.id, email: user.email, createdAt: Date.now() });

    const target = new URL(params.redirectUri);
    target.searchParams.set('code', code);
    if (params.state !== undefined) target.searchParams.set('state', params.state);
    res.redirect(target.toString());
  }

  async challengeForAuthorizationCode(client, authorizationCode) {
    const codeData = this.codes.get(authorizationCode);
    if (!codeData) throw new InvalidGrantError('Invalid authorization code');
    return codeData.params.codeChallenge;
  }

  async exchangeAuthorizationCode(client, authorizationCode) {
    const codeData = this.codes.get(authorizationCode);
    if (!codeData) throw new InvalidGrantError('Invalid authorization code');
    if (codeData.client.client_id !== client.client_id) {
      throw new InvalidGrantError('Authorization code was not issued to this client');
    }
    this.codes.delete(authorizationCode);
    if (Date.now() - codeData.createdAt > AUTH_CODE_TTL_MS) {
      throw new InvalidGrantError('Authorization code expired');
    }

    const accessToken = signAccessToken(codeData.userId, codeData.email);
    const refreshToken = signRefreshToken(codeData.userId);
    await this._storeRefreshToken(codeData.userId, refreshToken);

    return {
      access_token: accessToken,
      token_type: 'bearer',
      expires_in: config.accessTokenTTL,
      refresh_token: refreshToken,
      scope: (codeData.params.scopes || []).join(' '),
    };
  }

  async exchangeRefreshToken(client, refreshToken) {
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) throw new InvalidGrantError('Invalid or expired refresh token');

    const refreshTokenHash = createHash('sha256').update(refreshToken).digest('hex');
    const tokenResult = await pool.query(
      'SELECT id FROM refresh_tokens WHERE user_id = $1 AND token_hash = $2 AND revoked_at IS NULL AND expires_at > now()',
      [payload.sub, refreshTokenHash]
    );
    if (tokenResult.rows.length === 0) throw new InvalidGrantError('Refresh token is invalid or revoked');

    const userResult = await pool.query('SELECT email FROM users WHERE id = $1', [payload.sub]);
    if (userResult.rows.length === 0) throw new InvalidGrantError('User not found');

    await pool.query('UPDATE refresh_tokens SET revoked_at = now() WHERE id = $1', [tokenResult.rows[0].id]);

    const newAccessToken = signAccessToken(payload.sub, userResult.rows[0].email);
    const newRefreshToken = signRefreshToken(payload.sub);
    await this._storeRefreshToken(payload.sub, newRefreshToken);

    return {
      access_token: newAccessToken,
      token_type: 'bearer',
      expires_in: config.accessTokenTTL,
      refresh_token: newRefreshToken,
    };
  }

  async verifyAccessToken(token) {
    const payload = verifyAccessToken(token);
    if (!payload) throw new InvalidTokenError('Invalid or expired access token');
    return {
      token,
      clientId: 'timeline-studio-mcp',
      scopes: [],
      expiresAt: payload.exp,
      extra: { userId: payload.sub, email: payload.email },
    };
  }

  async _storeRefreshToken(userId, refreshToken) {
    const refreshTokenHash = createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + config.refreshTokenTTL * 1000);
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [userId, refreshTokenHash, expiresAt]
    );
  }
}

export function createOAuthProvider() {
  return new TimelineStudioOAuthProvider();
}
