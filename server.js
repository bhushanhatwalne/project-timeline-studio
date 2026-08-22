#!/usr/bin/env node

// Load environment variables from server/.env
require('dotenv').config({ path: './server/.env' });

// Start Express Backend Server
// This serves the monolithic Timeline Studio app with authentication
require('./server/src/index.js');
