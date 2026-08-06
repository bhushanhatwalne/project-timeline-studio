require('dotenv').config();

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
    throw new Error(`Missing required environment variable: ${varName}`);
  }
}

module.exports = config;
