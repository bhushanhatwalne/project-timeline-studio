const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const config = require('./config');

const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/projects.routes');
const versionRoutes = require('./routes/versions.routes');

const app = express();

// Security middleware
app.use(helmet());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// API routes
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/projects/:projectId/versions', versionRoutes);

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve static frontend
app.use(express.static(path.join(__dirname, '../public')));

// Catch-all: serve index.html for client-side routing
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

// Error handling middleware
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

// Start server
const PORT = config.port;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Timeline Studio server running on port ${PORT}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Available at: http://127.0.0.1:${PORT} or http://localhost:${PORT}`);
  console.log(`Public directory: ${path.join(__dirname, '../public')}`);
});
