const express = require('express');
const { z } = require('zod');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');
const ownershipMiddleware = require('../middleware/ownership');

const router = express.Router({ mergeParams: true });

const CreateVersionSchema = z.object({
  name: z.string().min(1).max(255),
  group: z.string().max(255).optional(),
});

const UpdateVersionSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  group: z.string().max(255).optional(),
});

// GET /api/v1/projects/:projectId/versions
router.get('/', authMiddleware, ownershipMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, business_group, saved_at FROM versions WHERE project_id = $1 ORDER BY saved_at DESC',
      [req.projectId]
    );

    res.json(
      result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        group: row.business_group,
        savedAt: row.saved_at,
      }))
    );
  } catch (err) {
    console.error('Error in GET /versions:', err);
    res.status(500).json({
      type: 'https://api.timeline.studio/errors#internal_error',
      title: 'Internal Server Error',
      status: 500,
      detail: 'An unexpected error occurred',
    });
  }
});

// GET /api/v1/projects/:projectId/versions/:verId
router.get('/:verId', authMiddleware, ownershipMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, business_group, project_title, swimlanes, saved_at FROM versions WHERE id = $1 AND project_id = $2',
      [req.params.verId, req.projectId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        type: 'https://api.timeline.studio/errors#not_found',
        title: 'Not Found',
        status: 404,
        detail: 'Version not found',
      });
    }

    const version = result.rows[0];
    res.json({
      id: version.id,
      name: version.name,
      group: version.business_group,
      projectTitle: version.project_title,
      swimlanes: typeof version.swimlanes === 'string' ? JSON.parse(version.swimlanes) : version.swimlanes,
      savedAt: version.saved_at,
    });
  } catch (err) {
    console.error('Error in GET /versions/:verId:', err);
    res.status(500).json({
      type: 'https://api.timeline.studio/errors#internal_error',
      title: 'Internal Server Error',
      status: 500,
      detail: 'An unexpected error occurred',
    });
  }
});

// POST /api/v1/projects/:projectId/versions
router.post('/', authMiddleware, ownershipMiddleware, async (req, res) => {
  try {
    const parsed = CreateVersionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        type: 'https://api.timeline.studio/errors#validation_error',
        title: 'Validation Error',
        status: 400,
        detail: 'Invalid input',
        errors: parsed.error.errors,
      });
    }

    const { name, group } = parsed.data;

    // Get current project state
    const projectResult = await pool.query('SELECT title, swimlanes FROM projects WHERE id = $1', [req.projectId]);
    const project = projectResult.rows[0];

    const result = await pool.query(
      'INSERT INTO versions (project_id, name, business_group, project_title, swimlanes) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, business_group, saved_at',
      [req.projectId, name, group || null, project.title, JSON.stringify(project.swimlanes)]
    );

    const version = result.rows[0];
    res.status(201).json({
      id: version.id,
      name: version.name,
      group: version.business_group,
      savedAt: version.saved_at,
    });
  } catch (err) {
    console.error('Error in POST /versions:', err);
    res.status(500).json({
      type: 'https://api.timeline.studio/errors#internal_error',
      title: 'Internal Server Error',
      status: 500,
      detail: 'An unexpected error occurred',
    });
  }
});

// PUT /api/v1/projects/:projectId/versions/:verId
router.put('/:verId', authMiddleware, ownershipMiddleware, async (req, res) => {
  try {
    const parsed = UpdateVersionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        type: 'https://api.timeline.studio/errors#validation_error',
        title: 'Validation Error',
        status: 400,
        detail: 'Invalid input',
        errors: parsed.error.errors,
      });
    }

    const { name, group } = parsed.data;

    // Build dynamic update query
    const updateFields = [];
    const params = [];
    let paramIndex = 1;

    if (name) {
      updateFields.push(`name = $${paramIndex++}`);
      params.push(name);
    }
    if (group !== undefined) {
      updateFields.push(`business_group = $${paramIndex++}`);
      params.push(group || null);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        type: 'https://api.timeline.studio/errors#validation_error',
        title: 'Validation Error',
        status: 400,
        detail: 'No fields to update',
      });
    }

    params.push(req.params.verId);
    params.push(req.projectId);

    await pool.query(
      `UPDATE versions SET ${updateFields.join(', ')} WHERE id = $${paramIndex} AND project_id = $${paramIndex + 1}`,
      params
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Error in PUT /versions/:verId:', err);
    res.status(500).json({
      type: 'https://api.timeline.studio/errors#internal_error',
      title: 'Internal Server Error',
      status: 500,
      detail: 'An unexpected error occurred',
    });
  }
});

// DELETE /api/v1/projects/:projectId/versions/:verId
router.delete('/:verId', authMiddleware, ownershipMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM versions WHERE id = $1 AND project_id = $2', [req.params.verId, req.projectId]);
    res.status(204).send();
  } catch (err) {
    console.error('Error in DELETE /versions/:verId:', err);
    res.status(500).json({
      type: 'https://api.timeline.studio/errors#internal_error',
      title: 'Internal Server Error',
      status: 500,
      detail: 'An unexpected error occurred',
    });
  }
});

// POST /api/v1/projects/:projectId/versions/:verId/restore
router.post('/:verId/restore', authMiddleware, ownershipMiddleware, async (req, res) => {
  try {
    const versionResult = await pool.query(
      'SELECT swimlanes, project_title FROM versions WHERE id = $1 AND project_id = $2',
      [req.params.verId, req.projectId]
    );

    if (versionResult.rows.length === 0) {
      return res.status(404).json({
        type: 'https://api.timeline.studio/errors#not_found',
        title: 'Not Found',
        status: 404,
        detail: 'Version not found',
      });
    }

    const version = versionResult.rows[0];

    res.json({
      success: true,
      swimlanes: typeof version.swimlanes === 'string' ? JSON.parse(version.swimlanes) : version.swimlanes,
      projectTitle: version.project_title,
    });
  } catch (err) {
    console.error('Error in POST /versions/:verId/restore:', err);
    res.status(500).json({
      type: 'https://api.timeline.studio/errors#internal_error',
      title: 'Internal Server Error',
      status: 500,
      detail: 'An unexpected error occurred',
    });
  }
});

// POST /api/v1/projects/:projectId/versions/:verId/overwrite-with-current
router.post('/:verId/overwrite-with-current', authMiddleware, ownershipMiddleware, async (req, res) => {
  try {
    // Get current project state
    const projectResult = await pool.query('SELECT title, swimlanes FROM projects WHERE id = $1', [req.projectId]);
    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        type: 'https://api.timeline.studio/errors#not_found',
        title: 'Not Found',
        status: 404,
        detail: 'Project not found',
      });
    }

    const project = projectResult.rows[0];

    // Update version with current project state
    const result = await pool.query(
      'UPDATE versions SET swimlanes = $1, project_title = $2, saved_at = now() WHERE id = $3 AND project_id = $4 RETURNING saved_at',
      [JSON.stringify(project.swimlanes), project.title, req.params.verId, req.projectId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        type: 'https://api.timeline.studio/errors#not_found',
        title: 'Not Found',
        status: 404,
        detail: 'Version not found',
      });
    }

    res.json({
      success: true,
      savedAt: result.rows[0].saved_at,
    });
  } catch (err) {
    console.error('Error in POST /versions/:verId/overwrite-with-current:', err);
    res.status(500).json({
      type: 'https://api.timeline.studio/errors#internal_error',
      title: 'Internal Server Error',
      status: 500,
      detail: 'An unexpected error occurred',
    });
  }
});

module.exports = router;
