const pool = require('../db');

async function ownershipMiddleware(req, res, next) {
  const { projectId } = req.params;

  try {
    const result = await pool.query('SELECT user_id FROM projects WHERE id = $1', [projectId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        type: 'https://api.timeline.studio/errors#not_found',
        title: 'Not Found',
        status: 404,
        detail: 'Project not found',
      });
    }

    const project = result.rows[0];
    if (project.user_id !== req.user.id) {
      return res.status(404).json({
        type: 'https://api.timeline.studio/errors#not_found',
        title: 'Not Found',
        status: 404,
        detail: 'Project not found',
      });
    }

    req.projectId = projectId;
    next();
  } catch (err) {
    console.error('Error in ownershipMiddleware:', err);
    res.status(500).json({
      type: 'https://api.timeline.studio/errors#internal_error',
      title: 'Internal Server Error',
      status: 500,
      detail: 'An unexpected error occurred',
    });
  }
}

module.exports = ownershipMiddleware;
