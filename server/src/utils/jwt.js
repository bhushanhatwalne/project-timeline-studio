const jwt = require('jsonwebtoken');
const config = require('../config');

function signAccessToken(userId, email) {
  return jwt.sign(
    { sub: userId, email },
    config.jwtAccessSecret,
    { expiresIn: config.accessTokenTTL, issuer: 'timeline-studio', audience: 'timeline-studio-app' }
  );
}

function signRefreshToken(userId) {
  return jwt.sign(
    { sub: userId },
    config.jwtRefreshSecret,
    { expiresIn: config.refreshTokenTTL, issuer: 'timeline-studio', audience: 'timeline-studio-app' }
  );
}

function verifyAccessToken(token) {
  try {
    return jwt.verify(token, config.jwtAccessSecret, { issuer: 'timeline-studio', audience: 'timeline-studio-app' });
  } catch (err) {
    return null;
  }
}

function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, config.jwtRefreshSecret, { issuer: 'timeline-studio', audience: 'timeline-studio-app' });
  } catch (err) {
    return null;
  }
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
