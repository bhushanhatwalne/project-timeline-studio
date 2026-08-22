// Timeline Studio Server - Express Backend + MCP Integration
console.log('[BOOT] Starting Timeline Studio...');

// Load environment from server/.env
require('dotenv').config({ path: './server/.env' });

// Start Express Backend (handles app, auth, APIs)
console.log('[BOOT] Initializing Express backend...');
require('./server/src/index.js');

// MCP Server runs separately via Claude Code configuration
// This allows the app to work standalone while also supporting Claude integration
console.log('[BOOT] Ready for MCP integration via Claude Code settings');
