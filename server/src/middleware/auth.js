const { verifyAccessToken } = require('../utils/jwt');

function authMiddleware(req, res, next) {
  // Try to get token from httpOnly cookie first, then from Authorization header (for curl testing)
  const token = req.cookies.access_token || (req.headers.authorization?.startsWith('Bearer ') && req.headers.authorization.slice(7));

  if (!token) {
    return res.status(401).json({
      type: 'https://api.timeline.studio/errors#unauthorized',
      title: 'Unauthorized',
      status: 401,
      detail: 'Missing or invalid access token',
    });
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    return res.status(401).json({
      type: 'https://api.timeline.studio/errors#unauthorized',
      title: 'Unauthorized',
      status: 401,
      detail: 'Invalid or expired access token',
    });
  }

  req.user = { id: payload.sub, email: payload.email };
  next();
}

module.exports = authMiddleware;
