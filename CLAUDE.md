# Project Timeline Studio

## Overview
**Timeline Studio** is a project timeline management application (Gantt chart) for creating, editing,
and visualizing project schedules. It started as a standalone HTML file and is now a **full-stack app**:
a single-file vanilla-JS frontend backed by an Express + PostgreSQL API with cookie-based JWT auth,
plus a **remote MCP server** that exposes the signed-in user's project data to MCP clients over SSE
with OAuth 2.1.

- **Live**: https://timeline-studio-nvjh.onrender.com
- **Repo**: https://github.com/bhushanhatwalne/project-timeline-studio

### Current Capabilities
- **Accounts**: register / login / logout, change email, change password, forgot-password (6-digit code by email)
- **Dashboard**: status-card summary (Total / On Track / At Risk / Off Track), searchable + sortable project
  table with pagination (5 per page), project create / rename / duplicate / delete
- **Data Editor**: table UI for phases (swimlanes), tasks and milestones with drag-reorder, resizable columns,
  smart date paste, per-row menu (add above/below, duplicate, note, hide, delete)
- **Timeline View**: Gantt chart with year/month headers, multi-level milestone labels, today marker,
  derived status colors, compact mode
- **Versions**: named snapshots grouped by business group; tile/list views, sort, multi-select bulk delete,
  restore, overwrite-with-current, duplicate, rename, move to another project
- **Autosave**: debounced writes to the server, plus a `sendBeacon` flush on page unload
- **Undo/redo**: 60-step history with `Ctrl+Z` / `Ctrl+Shift+Z` / `Ctrl+Y`
- **Export**: PowerPoint (`.pptx` via pptxgen.js) and Excel/CSV
- **Dark mode** and collapsible dashboard sidebar (both persisted)
- **Remote MCP server**: OAuth-gated SSE endpoint exposing `list_open_projects` plus code/data
  introspection tools

## Architecture

### File Structure
```
project-timeline-studio/
├── CLAUDE.md                            (this file)
├── README.md                            (user + setup + MCP guide)
├── SETUP.md                             (local DB/env setup — partially superseded by README)
├── DEPLOY.md                            (Render deploy notes — see caveat below)
├── PROJECT_STRUCTURE.md
├── SBPP4_PROJECT_GUIDE.md, TESTSCRIPT.md, my Sequence.txt   (working notes / manual QA)
├── project-timeline-studio.html         (THE frontend — single file, no build)
├── package.json / server.js             (root entry: loads server/src/index.js)
├── render.yaml                          (STALE — see Deployment)
├── logo-icon.png
├── .claude/
│   ├── settings.json                    (permissions, rules, mcpServers — see caveat below)
│   └── skills/
│       ├── timeline-auth.md
│       ├── timeline-export.md
│       ├── timeline-status-calc.md
│       └── timeline-ui.md
├── server/                              (Express + Postgres backend)
│   ├── .env.example
│   ├── package.json
│   ├── public/index.html                (deploy copy of the frontend — keep in sync)
│   └── src/
│       ├── index.js                     (app entry: API + static, port 3000)
│       ├── config.js                    (env validation, token TTLs)
│       ├── db.js                        (pg Pool)
│       ├── runMigrations.js             (runs every *.sql in migrations/ on boot)
│       ├── middleware/{auth,ownership}.js
│       ├── routes/{auth,projects,versions}.routes.js
│       ├── utils/{jwt,password,email,run-migration}.js
│       └── migrations/001_init.sql, 002_add_password_reset_tokens.sql, 003_add_mcp_oauth_clients.sql
├── mcp-server/                          (app + API + MCP, ESM — what production runs)
│   ├── server.js                        (Express app, MCP SSE, mounts server/ routes, port 3001)
│   ├── oauthProvider.js                 (OAuth 2.1 authorization server — must stay ESM)
│   ├── projectTools.cjs                 (list_open_projects, mirrors app status logic)
│   ├── package.json
│   └── README.md
├── docs/{ROADMAP,API_DESIGN,ARCHITECTURE}.md
├── screenshots/                         (25 QA screenshots)
├── wireframe/                           (early design explorations)
└── storage/                             (MCP get/save_storage_data scratch JSON — empty by default)
```

### Technology Stack
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3 with CSS variables. No framework, **no build step**.
  CDN deps: Plus Jakarta Sans (Google Fonts), Font Awesome 6.4.0, pptxgenjs 3.12.0.
- **Backend**: Node.js + Express, PostgreSQL (Neon), `pg`, `bcryptjs` (12 rounds), `jsonwebtoken`,
  `zod` validation, `nodemailer` (password-reset email), `cookie-parser`
- **MCP**: `@modelcontextprotocol/sdk` — SSE transport + `mcpAuthRouter` OAuth 2.1 with PKCE
- **Hosting**: Render (free tier) + Neon Postgres

### Two Server Entry Points
There are **two** ways to serve the app, and they are not interchangeable:

| | `server/src/index.js` | `mcp-server/server.js` |
|---|---|---|
| Module system | CommonJS | ESM (imports the CJS routes via `createRequire`) |
| Default port | 3000 | 3001 |
| Serves frontend from | `server/public/index.html` | `project-timeline-studio.html` (repo root) |
| API routes | ✅ auth / projects / versions | ✅ same routes, re-mounted |
| MCP endpoints | ❌ | ✅ `/sse`, `/message`, OAuth metadata |
| Rate limiting / helmet | rate limit on `/api/v1/auth`; helmet commented out | ❌ neither |
| Used by | local backend-only work | **production (Render)** and MCP dev |

`server/public/index.html` is currently a byte-identical copy of `project-timeline-studio.html`.
**Edit the root file, then copy it to `server/public/` if you touch the `server/` entry point.**
Production serves the root file directly, so the copy only matters for the `server/`-rooted path.

### Request Flow
```
Browser ──> mcp-server/server.js (Express)
              ├── /                       → project-timeline-studio.html
              ├── /api/v1/auth/*          → server/src/routes/auth.routes.js
              ├── /api/v1/projects/*      → projects.routes.js, versions.routes.js
              ├── /.well-known/oauth-*    → mcpAuthRouter (metadata, register, authorize, token)
              ├── /sse  (Bearer required) → new Server + SSEServerTransport per connection
              └── /message?sessionId=…    → transport.handlePostMessage
MCP client ──> OAuth (email + password login page) ──> Bearer token ──> /sse ──> tools
```

### Key State Structures
```javascript
// Swimlane (phase) container — the unit stored in projects.swimlanes JSONB
{ id, name, phase, children[] }

// Row (task/milestone/phase). `status` is PERSISTED BUT IGNORED for display — see Status below.
{ id, title, type, start, end, percent, assignedTo, status, visible, note }

// Version (saved snapshot) — server shape
{ id, name, group, savedAt, data: { swimlanes, projectTitle } }
```

### Frontend State & Data Flow
Top-level mutable state in `<script>`: `swimlanes`, `projectTitle`, `activeTab`, `authUser`,
`myProjects`, `currentProjectId`, `versions`, `history`/`future`, plus dashboard sort/page and
modal state.

1. `boot()` → `GET /api/v1/auth/me` → `renderDashboard()` or `renderAuthScreen()`
2. Edit → `onFieldChange()` → `pushHistory()` → mutate → `saveFlash()` → `render()`
3. `saveFlash()` debounces **800 ms**, then `PUT /api/v1/projects/:id`; on failure retries after 3 s.
   `beforeunload` flushes a pending save with `navigator.sendBeacon`.
4. Tab change → `setTab()` → `render()` dispatches to `renderData` / `renderTimeline` /
   `renderVersions` / `renderAccountSettings`
5. Drag → `moveRow()` → reorder swimlanes/children → `render()`
6. `apiFetch()` wraps `fetch` with `credentials: 'include'`, a 15 s abort timeout, and a **single**
   401 → `POST /api/v1/auth/refresh` → retry; a second 401 clears `authUser` and shows the login screen.

### Status Is Derived, Not Stored
This is the single most important behavioral rule. `row.status` exists in the data and in the
`<select>` on the Data tab, but **display status is recomputed live** from `percent` vs. date-based
planned progress:

- `calculatePlannedProgress(start, end)` → 0 before start, 100 after end, else % of elapsed days
- `calculateTaskStatus(task)` → `Complete` (100%) | `Not Started` (0% and start in the future) |
  `On Track` (actual ≥ planned − 10) | `At Risk` (actual ≥ planned − 20) | `Off Track`
- `calculateProjectStatus(swimlanes)` → `Not Started` if nothing started; else `Off Track` if any task
  is off track, `At Risk` if any is at risk, `On Track` if any incomplete, else `Complete`.
  **Only task children count — swimlane phase rows are excluded.**
- `calculateProjectProgress()` averages task `percent`

`mcp-server/projectTools.cjs` **duplicates this logic on purpose** so `list_open_projects` matches what
the UI shows. **If you change the status rules in the HTML, change `projectTools.cjs` too.**

### Persistence Split
The server is the source of truth for project data. localStorage now holds only UI preferences:

| Key | Purpose |
|---|---|
| `darkModeEnabled` | theme toggle |
| `dashboardSidebarCollapsed` | sidebar state |
| `dataTableColumnWidths` | Data-tab column widths |
| `versionsViewMode` | `tile` / `list` |
| `versionsSortBy` | `date` / `name` / `swimlanes` |
| `tlStudio.versions.v1` | **legacy only** — `maybeImportLocalStorageVersions()` offers a one-time import into the account, then removes the key |

## API Reference (implemented)

### Auth — `/api/v1/auth`
```
POST   /register          { email, password, displayName? } → 201 + httpOnly cookies
POST   /login             { email, password }               → 200 + cookies
POST   /refresh           (refresh_token cookie)            → rotates both tokens
POST   /logout            (auth)                            → revokes refresh token, clears cookies
GET    /me                (auth)                            → { id, email, displayName }
PUT    /change-password   (auth) { currentPassword, newPassword }
PUT    /change-email      (auth) { newEmail, password }
POST   /forgot-password   { email }                          → emails a 6-digit code (15 min TTL)
POST   /reset-password    { email, token, newPassword }
```
Password policy (zod): min 8 chars, ≥1 uppercase, ≥1 digit, ≥1 of `!@#$%^&*`.
Access token TTL 15 min, refresh 30 days; both are `httpOnly` cookies (`secure` in production,
`sameSite=lax`). Refresh tokens are stored as SHA-256 hashes and rotated on use.

### Projects — `/api/v1/projects`
```
GET    /                  → [{ id, title, createdAt, updatedAt }]
POST   /                  { title } → { id, ... }
GET    /:projectId        → { id, title, swimlanes, ... }
PUT    /:projectId        { swimlanes, projectTitle }
DELETE /:projectId
```

### Versions — `/api/v1/projects/:projectId/versions`
```
GET    /                          GET    /:verId
POST   /                          PUT    /:verId
DELETE /:verId
POST   /:verId/restore                    (load snapshot into the project)
POST   /:verId/overwrite-with-current
POST   /:verId/move                       (move version to another project)
```

`GET /api/v1/health` → `{ status: 'ok' }`.

All project/version routes run `authMiddleware` then `ownershipMiddleware`, which **returns 404 (not
403) when the row belongs to another user** — do not "fix" this into a 403; it avoids leaking existence.
Errors use an RFC-7807-style body: `{ type, title, status, detail }`.

## MCP Server

### Endpoints
- `GET /sse` — SSE stream, `requireBearerAuth`. One `Server` **and** one `SSEServerTransport` per
  connection, tracked in a `sessions` Map keyed by `transport.sessionId`. A shared `Server` throws
  "Already connected to a transport" — keep the per-connection factory (`createMcpServer()`).
- `POST /message?sessionId=…` — client → server messages; body is passed explicitly as
  `transport.handlePostMessage(req, res, req.body)` because `express.json()` has already consumed the
  stream ("stream is not readable" otherwise).
- OAuth 2.1 metadata / dynamic client registration / `/authorize` / `/token` via `mcpAuthRouter`.

### OAuth Provider (`mcp-server/oauthProvider.js`)
- Reuses the app's `users` table, bcrypt hashes, and JWT helpers — MCP clients log in with the same
  email + password as the web app, via a server-rendered login page on `/authorize`.
- **Must stay ESM.** `InvalidTokenError` has to be the same class object that the SDK's `bearerAuth`
  `instanceof` check uses. Requiring the SDK from a `.cjs` file resolves the CJS build, silently breaks
  the check, and turns every invalid-token 401 into a 500.
- Registered clients are persisted in the `mcp_oauth_clients` table (not an in-memory Map), because
  Render restarts would otherwise invalidate cached client IDs with `invalid_client`.
- Authorization codes stay in an in-memory Map with a 5-minute TTL (a restart mid-flow just means
  re-authorizing).
- Issuer URL comes from `PUBLIC_URL` → `RENDER_EXTERNAL_URL` → `http://localhost:$PORT`.
  The SDK only allows plain `http` for localhost.

### Tools
| Tool | Notes |
|---|---|
| `list_open_projects` | **The real product tool.** Reads the authenticated user's projects from Postgres (`extra.authInfo.extra.userId`), derives status + current task, filters out `Complete`. |
| `read_html`, `extract_javascript`, `extract_css`, `list_functions` | Dev introspection of `project-timeline-studio.html` (truncated output). |
| `analyze_data_structure`, `create_sample_timeline` | Schema doc + fixture generator. |
| `get_storage_data`, `save_storage_data` | JSON scratch files under `storage/`. |

Tool handlers catch their own errors and return them as text content, so a failing tool reports a
message rather than killing the connection.

## Development Guidelines

### Code Style
- **No frontend build**: keep the app one HTML file with embedded CSS/JS.
- **Mutation pattern**: direct object mutation (`row.title = val`), no immutability layer.
- **Naming**: camelCase functions, kebab-case CSS, ALLCAPS constants.
- **Comments**: only for non-obvious WHY. The non-obvious constraints (ESM-only OAuth provider,
  per-connection MCP `Server`, duplicated status logic) are already commented — preserve those.
- **CSS variables**: all colors/spacing come from `:root`; dark mode overrides the same variables.
- **XSS**: run user text through `escapeHtml()` and attributes through `escapeAttr()` before
  interpolating into template strings.
- **Error handling**: validate at boundaries (zod on request bodies, try/catch around `localStorage`
  and DB calls). Don't add defensive handling for states internal code can't reach.

### When Adding Features
1. Frontend change → edit `project-timeline-studio.html`; mirror to `server/public/index.html` only if
   you rely on the `server/`-rooted entry point.
2. Extend the row/swimlane objects with new fields rather than wrapping them.
3. Follow `pushHistory()` → mutate → `saveFlash()` → `render()` for every data-changing action.
4. New API route → add to the matching `*.routes.js`, guard with `authMiddleware` +
   `ownershipMiddleware`, validate with zod. Both entry points pick it up automatically.
5. New table/column → add a numbered `.sql` file in `server/src/migrations/`. `runMigrations()` runs
   **every** `.sql` file in sorted order on every boot, so statements must be idempotent
   (`CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`).
6. New MCP tool → add to the `tools` array **and** the `CallToolRequestSchema` handler in
   `mcp-server/server.js`; put data queries in `projectTools.cjs`.
7. Manual QA in Chrome/Firefox/Safari; there are still no automated tests.

### Environment Variables
Required (`server/.env` locally, Render dashboard in production):
```
DATABASE_URL          Postgres connection string (Neon pooled, ?sslmode=require)
JWT_ACCESS_SECRET     openssl rand -hex 32
JWT_REFRESH_SECRET    openssl rand -hex 32
```
Optional: `PORT`, `NODE_ENV`, `COOKIE_SECURE`, `PUBLIC_URL`,
`EMAIL_SERVICE` / `EMAIL_USER` / `EMAIL_PASSWORD` (password-reset mail; without these the reset code
is only logged, not emailed).

`config.js` throws on boot if any required var is missing. Note that `db.js` sets
`ssl.rejectUnauthorized: false` unconditionally.

### Deployment
Render builds from `main` on push. **Production root directory is `mcp-server`**
(commit `f182d50` merged the auth backend into the MCP server for exactly this reason), so the live
service runs `mcp-server/server.js` and serves the root HTML file.

⚠️ **`render.yaml` is stale** — it still declares `rootDir: server` / `node src/index.js`, which
would deploy the app *without* MCP endpoints. The live service is configured in the Render dashboard,
not from this blueprint. Update or delete `render.yaml` rather than trusting it.

## Database Schema (actual)
```sql
users              (id uuid pk, email unique, password_hash, display_name, created_at, last_login_at)
projects           (id uuid pk, user_id fk→users, title, swimlanes jsonb, created_at, updated_at)
versions           (id uuid pk, project_id fk→projects, name, business_group, project_title,
                    swimlanes jsonb, saved_at)
refresh_tokens     (id uuid pk, user_id fk→users, token_hash, expires_at, revoked_at, created_at)
mcp_oauth_clients  (client_id pk, metadata jsonb, created_at)
```
Indexes on `projects.user_id`, `versions.project_id`, `refresh_tokens.user_id`. All FKs cascade on
user/project delete.

⚠️ **`password_reset_tokens` has no migration.** `002_add_password_reset_tokens.sql` is an empty file
(`runMigrations()` skips empty files), but `auth.routes.js` inserts into and selects from
`password_reset_tokens`. On a fresh database, forgot-password/reset-password fail. Create the table
manually or fill in migration 002:
```sql
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Testing Strategy
- **Current**: manual QA in the browser; `TESTSCRIPT.md` and `my Sequence.txt` hold the checklists;
  `screenshots/` records found issues. `curl` against `/api/v1/*` for backend checks.
- **Planned**: Cypress/Playwright UI flows + API contract tests.
- **Performance**: watch render time past 100+ rows; 1000+ rows needs virtualization.

## Security Notes
- Passwords: bcrypt, 12 rounds. Tokens: `httpOnly` cookies, refresh rotated and hash-stored.
- SQL: parameterized queries everywhere (`$1, $2, …`).
- Access control: `ownershipMiddleware` on every project/version route.
- XSS: `escapeHtml()` / `escapeAttr()` in the frontend, `escapeAttr()` in the OAuth login page.
- MCP: every MCP endpoint is behind `requireBearerAuth`; `list_open_projects` scopes to
  `authInfo.extra.userId`.
- ⚠️ **Gaps to be aware of**: `helmet()` is commented out in `server/src/index.js`; the production
  entry point (`mcp-server/server.js`) has **no rate limiting and no helmet** — the 10-request/15-min
  auth limiter only exists on the `server/` entry point. `cors()` is applied with no origin allowlist.
  No CSRF token on state-changing requests (cookies are `sameSite=lax`).

## Known Limitations
1. **`password_reset_tokens` table is not created by migrations** (see above)
2. **`render.yaml` doesn't match the live service** (see Deployment)
3. **`.claude/settings.json` `mcpServers` entry is stale** — it launches `mcp-server/server.js` as a
   stdio server, but that file is now an HTTP/SSE Express app with no stdio transport. Use the remote
   SSE URL instead (see README).
4. **Duplicated frontend**: `server/public/index.html` must be manually re-copied
5. **Duplicated status logic** between the HTML and `projectTools.cjs`
6. **No multi-tab sync**; concurrent edits are last-write-wins
7. **No sharing/permissions**: every project has exactly one owner; no `permissions` or `audit_log` table
8. **PPTX export** is basic; Excel export is really CSV
9. **Render free tier** spins down after ~15 min idle (30–60 s cold start)
10. **Verbose console logging** in both server and frontend (`[SAVE]`, `[INIT]`, `[RENDER]`, …)
11. **Performance**: slow render past ~1000 rows

## Roadmap (remaining)
- [ ] Sharing and view/edit permissions; audit trail
- [ ] Real-time collaboration (WebSocket or polling)
- [ ] Session policy from `my Sequence.txt`: single active session, 30-min idle logout, account lockout
      after 3 failed attempts
- [ ] Responsive/mobile layout
- [ ] Search/filter rows, bulk edit, inline notes editor, shortcuts help modal
- [ ] Write MCP tools (create/update projects from an MCP client)
- [ ] Dependency chains, critical path, resource leveling, budget tracking
- [ ] Calendar (Google/Outlook) and Slack/email notifications

## Quick Start
```bash
# Full app + MCP (matches production)
cp server/.env.example server/.env      # fill DATABASE_URL + both JWT secrets
cd server && npm install && cd ../mcp-server && npm install
npm start                                # → http://localhost:3001

# App + API only
npm install                              # root; postinstall installs server/ deps
npm start                                # → http://localhost:3000
```
Migrations run automatically on boot. See `README.md` for the full walkthrough including MCP client
configuration.

## Contact & Support
- **Owner**: Bhushan (bhushan.hatwalne@gmail.com)
- **Current Status**: Deployed full-stack app on Render + Neon with a remote MCP server
- **Next Steps**: sharing/permissions, session hardening, write-capable MCP tools

---
*Last updated: 2026-08-26 | Version: 1.2.0*
