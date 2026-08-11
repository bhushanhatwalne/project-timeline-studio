console.log('[INIT] Starting Timeline Studio server...');
const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

console.log('[INIT] Loading config...');
const config = require('./config');
console.log('[INIT] ✓ config loaded');

console.log('[INIT] Loading database...');
const pool = require('./db');
console.log('[INIT] ✓ database loaded');

console.log('[INIT] Running database migrations...');
const runMigrations = require('./runMigrations');

console.log('[INIT] Loading routes...');
let authRoutes, projectRoutes, versionRoutes;
try {
  authRoutes = require('./routes/auth.routes');
  console.log('[INIT] ✓ auth.routes loaded');
} catch (err) {
  console.error('[INIT] ✗ Failed to load auth.routes:', err.message);
  throw err;
}
try {
  projectRoutes = require('./routes/projects.routes');
  console.log('[INIT] ✓ projects.routes loaded');
} catch (err) {
  console.error('[INIT] ✗ Failed to load projects.routes:', err.message);
  throw err;
}
try {
  versionRoutes = require('./routes/versions.routes');
  console.log('[INIT] ✓ versions.routes loaded');
} catch (err) {
  console.error('[INIT] ✗ Failed to load versions.routes:', err.message);
  throw err;
}

console.log('[INIT] Creating Express app...');
const app = express();
console.log('[INIT] ✓ Express app created');

// Trust proxy (required for Render and other reverse proxies)
app.set('trust proxy', 1);

// Security middleware (temporarily disabled for debugging)
// app.use(helmet());

console.log('[INIT] Configuring middleware...');
// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
console.log('[INIT] ✓ Middleware configured');

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Debug middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

console.log('[INIT] Mounting API routes...');
// API routes
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/projects/:projectId/versions', versionRoutes);
console.log('[INIT] ✓ API routes mounted');

// Health check
console.log('[INIT] Adding health check route...');
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok' });
});
console.log('[INIT] ✓ Health check route added');

// Serve static frontend
console.log('[INIT] Configuring static file serving...');
app.use(express.static(path.join(__dirname, '../public')));
console.log('[INIT] ✓ Static file serving configured');

// Catch-all: serve index.html for client-side routing
console.log('[INIT] Adding catch-all route...');
app.get('*', (req, res) => {
  const filePath = path.join(__dirname, '../public/index.html');
  console.log(`[${new Date().toISOString()}] Catch-all route: ${req.path} → ${filePath}`);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error(`[${new Date().toISOString()}] sendFile error:`, err);
      res.status(500).send('File not found');
    }
  });
});
console.log('[INIT] ✓ Catch-all route added');

// Error handling middleware
console.log('[INIT] Adding error handling middleware...');
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Unhandled error:`, err.message || err);
  if (res.headersSent) return;
  res.status(500).json({
    type: 'https://api.timeline.studio/errors#internal_error',
    title: 'Internal Server Error',
    status: 500,
    detail: 'An unexpected error occurred',
  });
});
console.log('[INIT] ✓ Error handling middleware added');

(async () => {
  try {
    console.log('[STARTUP] Starting server initialization...');

    // Run database migrations
    console.log('[STARTUP] Running database migrations...');
    await runMigrations();
    console.log('[STARTUP] ✓ Database migrations completed');

    // Start server
    const PORT = config.port;
    const publicDir = path.join(__dirname, '../public');

    console.log(`[STARTUP] Public directory path: ${publicDir}`);
    console.log(`[STARTUP] Public directory exists: ${fs.existsSync(publicDir)}`);
    if (fs.existsSync(publicDir)) {
      const files = fs.readdirSync(publicDir);
      console.log(`[STARTUP] Files in public dir:`, files);
    } else {
      console.log(`[STARTUP] ⚠️ PUBLIC DIRECTORY DOES NOT EXIST`);
      console.log(`[STARTUP] __dirname: ${__dirname}`);
    }

    const indexPath = path.join(publicDir, 'index.html');
    console.log(`[STARTUP] index.html path: ${indexPath}`);
    console.log(`[STARTUP] index.html exists: ${fs.existsSync(indexPath)}`);

    console.log(`[STARTUP] Starting app.listen on port ${PORT}...`);
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Timeline Studio server running on port ${PORT}`);
      console.log(`Environment: ${config.nodeEnv}`);
    });
    console.log('[STARTUP] ✓ app.listen() called successfully');
  } catch (err) {
    console.error('[STARTUP] FATAL ERROR:', err.message);
    console.error('[STARTUP] Stack:', err.stack);
    process.exit(1);
  }
})()
