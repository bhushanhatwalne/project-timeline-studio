const express = require('express');
const { z } = require('zod');
const pool = require('../db');
const { hashPassword, comparePassword } = require('../utils/password');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { sendPasswordResetEmail } = require('../utils/email');
const config = require('../config');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/).regex(/[!@#$%^&*]/),
  displayName: z.string().max(100).optional(),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

function setAuthCookies(res, accessToken, refreshToken) {
  const isProduction = config.nodeEnv === 'production';
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: config.accessTokenTTL * 1000,
  });
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: config.refreshTokenTTL * 1000,
  });
}

function clearAuthCookies(res) {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
}

// POST /api/v1/auth/register
router.post('/register', async (req, res) => {
  try {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        type: 'https://api.timeline.studio/errors#validation_error',
        title: 'Validation Error',
        status: 400,
        detail: parsed.error.errors[0]?.message || 'Invalid input',
        errors: parsed.error.errors,
      });
    }

    const { email, password, displayName } = parsed.data;

    // Check if user exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        type: 'https://api.timeline.studio/errors#conflict',
        title: 'Conflict',
        status: 409,
        detail: 'Email already registered',
      });
    }

    const passwordHash = await hashPassword(password);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, display_name) VALUES ($1, $2, $3) RETURNING id, email, display_name, created_at',
      [email, passwordHash, displayName || null]
    );

    const user = result.rows[0];
    const accessToken = signAccessToken(user.id, user.email);
    const refreshToken = signRefreshToken(user.id);

    // Store refresh token hash
    const refreshTokenHash = require('crypto').createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + config.refreshTokenTTL * 1000);
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshTokenHash, expiresAt]
    );

    setAuthCookies(res, accessToken, refreshToken);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        createdAt: user.created_at,
      },
    });
  } catch (err) {
    console.error('Error in register:', err);
    res.status(500).json({
      type: 'https://api.timeline.studio/errors#internal_error',
      title: 'Internal Server Error',
      status: 500,
      detail: 'An unexpected error occurred',
    });
  }
});

// POST /api/v1/auth/login
router.post('/login', async (req, res) => {
  try {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        type: 'https://api.timeline.studio/errors#validation_error',
        title: 'Validation Error',
        status: 400,
        detail: 'Invalid email or password',
      });
    }

    const { email, password } = parsed.data;

    const result = await pool.query('SELECT id, email, password_hash, display_name FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({
        type: 'https://api.timeline.studio/errors#unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'Invalid email or password',
      });
    }

    const user = result.rows[0];
    const passwordMatch = await comparePassword(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({
        type: 'https://api.timeline.studio/errors#unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'Invalid email or password',
      });
    }

    // Update last login
    await pool.query('UPDATE users SET last_login_at = now() WHERE id = $1', [user.id]);

    const accessToken = signAccessToken(user.id, user.email);
    const refreshToken = signRefreshToken(user.id);

    // Store refresh token hash
    const refreshTokenHash = require('crypto').createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + config.refreshTokenTTL * 1000);
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshTokenHash, expiresAt]
    );

    setAuthCookies(res, accessToken, refreshToken);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
      },
    });
  } catch (err) {
    console.error('Error in login:', err);
    res.status(500).json({
      type: 'https://api.timeline.studio/errors#internal_error',
      title: 'Internal Server Error',
      status: 500,
      detail: 'An unexpected error occurred',
    });
  }
});

// POST /api/v1/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
      return res.status(401).json({
        type: 'https://api.timeline.studio/errors#unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'Missing refresh token',
      });
    }

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return res.status(401).json({
        type: 'https://api.timeline.studio/errors#unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'Invalid or expired refresh token',
      });
    }

    // Check if refresh token exists and is not revoked
    const refreshTokenHash = require('crypto').createHash('sha256').update(refreshToken).digest('hex');
    const tokenResult = await pool.query(
      'SELECT * FROM refresh_tokens WHERE user_id = $1 AND token_hash = $2 AND revoked_at IS NULL AND expires_at > now()',
      [payload.sub, refreshTokenHash]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(401).json({
        type: 'https://api.timeline.studio/errors#unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'Refresh token is invalid or revoked',
      });
    }

    // Get user info
    const userResult = await pool.query('SELECT email FROM users WHERE id = $1', [payload.sub]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({
        type: 'https://api.timeline.studio/errors#unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'User not found',
      });
    }

    const user = userResult.rows[0];

    // Revoke old refresh token
    await pool.query('UPDATE refresh_tokens SET revoked_at = now() WHERE id = $1', [tokenResult.rows[0].id]);

    // Issue new tokens
    const accessToken = signAccessToken(payload.sub, user.email);
    const newRefreshToken = signRefreshToken(payload.sub);

    // Store new refresh token hash
    const newRefreshTokenHash = require('crypto').createHash('sha256').update(newRefreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + config.refreshTokenTTL * 1000);
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [payload.sub, newRefreshTokenHash, expiresAt]
    );

    setAuthCookies(res, accessToken, newRefreshToken);

    res.json({ success: true });
  } catch (err) {
    console.error('Error in refresh:', err);
    res.status(500).json({
      type: 'https://api.timeline.studio/errors#internal_error',
      title: 'Internal Server Error',
      status: 500,
      detail: 'An unexpected error occurred',
    });
  }
});

// POST /api/v1/auth/logout
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh_token;
    if (refreshToken) {
      const refreshTokenHash = require('crypto').createHash('sha256').update(refreshToken).digest('hex');
      await pool.query('UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND token_hash = $2', [
        req.user.id,
        refreshTokenHash,
      ]);
    }

    clearAuthCookies(res);

    res.json({ success: true });
  } catch (err) {
    console.error('Error in logout:', err);
    res.status(500).json({
      type: 'https://api.timeline.studio/errors#internal_error',
      title: 'Internal Server Error',
      status: 500,
      detail: 'An unexpected error occurred',
    });
  }
});

// GET /api/v1/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, display_name, created_at FROM users WHERE id = $1', [req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        type: 'https://api.timeline.studio/errors#not_found',
        title: 'Not Found',
        status: 404,
        detail: 'User not found',
      });
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      createdAt: user.created_at,
    });
  } catch (err) {
    console.error('Error in GET /me:', err);
    res.status(500).json({
      type: 'https://api.timeline.studio/errors#internal_error',
      title: 'Internal Server Error',
      status: 500,
      detail: 'An unexpected error occurred',
    });
  }
});

// PUT /api/v1/auth/change-password
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const schema = z.object({
      currentPassword: z.string(),
      newPassword: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/).regex(/[!@#$%^&*]/),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        type: 'https://api.timeline.studio/errors#validation_error',
        title: 'Validation Error',
        status: 400,
        detail: parsed.error.errors[0]?.message || 'Invalid input',
      });
    }

    const { currentPassword, newPassword } = parsed.data;
    const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        type: 'https://api.timeline.studio/errors#not_found',
        title: 'Not Found',
        status: 404,
        detail: 'User not found',
      });
    }

    const passwordMatch = await comparePassword(currentPassword, result.rows[0].password_hash);
    if (!passwordMatch) {
      return res.status(401).json({
        type: 'https://api.timeline.studio/errors#unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'Current password is incorrect',
      });
    }

    const newPasswordHash = await hashPassword(newPassword);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newPasswordHash, req.user.id]);

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    console.error('Error in change-password:', err);
    res.status(500).json({
      type: 'https://api.timeline.studio/errors#internal_error',
      title: 'Internal Server Error',
      status: 500,
      detail: 'An unexpected error occurred',
    });
  }
});

// PUT /api/v1/auth/change-email
router.put('/change-email', authMiddleware, async (req, res) => {
  try {
    const schema = z.object({
      newEmail: z.string().email(),
      password: z.string(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        type: 'https://api.timeline.studio/errors#validation_error',
        title: 'Validation Error',
        status: 400,
        detail: parsed.error.errors[0]?.message || 'Invalid input',
      });
    }

    const { newEmail, password } = parsed.data;

    // Check if new email already exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [newEmail, req.user.id]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        type: 'https://api.timeline.studio/errors#conflict',
        title: 'Conflict',
        status: 409,
        detail: 'Email already in use',
      });
    }

    // Verify current password
    const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        type: 'https://api.timeline.studio/errors#not_found',
        title: 'Not Found',
        status: 404,
        detail: 'User not found',
      });
    }

    const passwordMatch = await comparePassword(password, result.rows[0].password_hash);
    if (!passwordMatch) {
      return res.status(401).json({
        type: 'https://api.timeline.studio/errors#unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'Password is incorrect',
      });
    }

    await pool.query('UPDATE users SET email = $1 WHERE id = $2', [newEmail, req.user.id]);
    res.json({ success: true, message: 'Email changed successfully' });
  } catch (err) {
    console.error('Error in change-email:', err);
    res.status(500).json({
      type: 'https://api.timeline.studio/errors#internal_error',
      title: 'Internal Server Error',
      status: 500,
      detail: 'An unexpected error occurred',
    });
  }
});

// POST /api/v1/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const schema = z.object({
      email: z.string().email(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        type: 'https://api.timeline.studio/errors#validation_error',
        title: 'Validation Error',
        status: 400,
        detail: 'Invalid email',
      });
    }

    const { email } = parsed.data;

    // Check if user exists
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      // For security, don't reveal if email exists
      return res.status(200).json({
        success: true,
        message: 'If this email exists, a reset link will be sent',
      });
    }

    const userId = userResult.rows[0].id;

    // Generate reset token (6-digit code for now)
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const resetTokenHash = require('crypto').createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store reset token
    await pool.query(
      'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [userId, resetTokenHash, expiresAt]
    );

    // Send email with reset token (don't wait more than 6 seconds)
    let emailSent = false;
    try {
      const emailPromise = sendPasswordResetEmail(email, resetToken);
      const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(false), 6000));
      emailSent = await Promise.race([emailPromise, timeoutPromise]);
    } catch (err) {
      console.error('[FORGOT-PASSWORD] Email send error:', err.message);
      emailSent = false;
    }

    res.status(200).json({
      success: true,
      message: emailSent
        ? 'If this email exists, a reset code has been sent'
        : 'Reset code generated (email service unavailable)',
      resetToken: !emailSent ? resetToken : undefined,
      expiresIn: '15 minutes',
    });
  } catch (err) {
    console.error('Error in forgot-password:', err);
    res.status(500).json({
      type: 'https://api.timeline.studio/errors#internal_error',
      title: 'Internal Server Error',
      status: 500,
      detail: 'An unexpected error occurred',
    });
  }
});

// POST /api/v1/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      resetToken: z.string().length(6),
      newPassword: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/).regex(/[!@#$%^&*]/),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        type: 'https://api.timeline.studio/errors#validation_error',
        title: 'Validation Error',
        status: 400,
        detail: parsed.error.errors[0]?.message || 'Invalid input',
        errors: parsed.error.errors,
      });
    }

    const { email, resetToken, newPassword } = parsed.data;

    // Get user by email
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({
        type: 'https://api.timeline.studio/errors#unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'Invalid email or reset token',
      });
    }

    const userId = userResult.rows[0].id;
    const resetTokenHash = require('crypto').createHash('sha256').update(resetToken).digest('hex');

    // Find valid reset token
    const tokenResult = await pool.query(
      'SELECT id FROM password_reset_tokens WHERE user_id = $1 AND token_hash = $2 AND expires_at > now() AND used_at IS NULL',
      [userId, resetTokenHash]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(401).json({
        type: 'https://api.timeline.studio/errors#unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'Invalid or expired reset token',
      });
    }

    // Update password
    const newPasswordHash = await hashPassword(newPassword);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newPasswordHash, userId]);

    // Mark token as used
    await pool.query('UPDATE password_reset_tokens SET used_at = now() WHERE id = $1', [tokenResult.rows[0].id]);

    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (err) {
    console.error('Error in reset-password:', err);
    res.status(500).json({
      type: 'https://api.timeline.studio/errors#internal_error',
      title: 'Internal Server Error',
      status: 500,
      detail: 'An unexpected error occurred',
    });
  }
});

module.exports = router;
