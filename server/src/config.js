require('dotenv').config();

console.log('[CONFIG] Environment variables check:');
console.log(`  DATABASE_URL: ${process.env.DATABASE_URL ? 'SET' : 'MISSING'}`);
console.log(`  JWT_ACCESS_SECRET: ${process.env.JWT_ACCESS_SECRET ? 'SET' : 'MISSING'}`);
console.log(`  JWT_REFRESH_SECRET: ${process.env.JWT_REFRESH_SECRET ? 'SET' : 'MISSING'}`);
console.log(`  NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`  PORT: ${process.env.PORT || '3000'}`);

const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  accessTokenTTL: 15 * 60, // 15 minutes in seconds
  refreshTokenTTL: 30 * 24 * 60 * 60, // 30 days in seconds
};

// Validate required env vars
const requiredVars = ['databaseUrl', 'jwtAccessSecret', 'jwtRefreshSecret'];
for (const varName of requiredVars) {
  if (!config[varName]) {
    console.error(`[CONFIG] Missing: ${varName}`);
    throw new Error(`Missing required environment variable: ${varName}`);
  }
}

console.log('[CONFIG] All required environment variables are set');
module.exports = config;
