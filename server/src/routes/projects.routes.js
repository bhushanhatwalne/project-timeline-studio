const express = require('express');
const { z } = require('zod');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');
const ownershipMiddleware = require('../middleware/ownership');

const router = express.Router();

const CreateProjectSchema = z.object({
  title: z.string().min(1).max(255),
});

const UpdateProjectSchema = z.object({
  swimlanes: z.array(z.any()).default([]),
  projectTitle: z.string().min(1).max(255),
});

// GET /api/v1/projects
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, created_at, updated_at FROM projects WHERE user_id = $1 ORDER BY updated_at DESC',
      [req.user.id]
    );

    res.json(
      result.rows.map((row) => ({
        id: row.id,
        title: row.title,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }))
    );
  } catch (err) {
    console.error('Error in GET /projects:', err);
    res.status(500).json({
      type: 'https://api.timeline.studio/errors#internal_error',
      title: 'Internal Server Error',
      status: 500,
      detail: 'An unexpected error occurred',
    });
  }
});

// POST /api/v1/projects
router.post('/', authMiddleware, async (req, res) => {
  try {
    const parsed = CreateProjectSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        type: 'https://api.timeline.studio/errors#validation_error',
        title: 'Validation Error',
        status: 400,
        detail: 'Invalid input',
        errors: parsed.error.errors,
      });
    }

    const { title } = parsed.data;

    const result = await pool.query(
      'INSERT INTO projects (user_id, title, swimlanes) VALUES ($1, $2, $3) RETURNING id, title, swimlanes, updated_at',
      [req.user.id, title, JSON.stringify([])]
    );

    const project = result.rows[0];
    res.status(201).json({
      id: project.id,
      title: project.title,
      swimlanes: project.swimlanes,
      projectTitle: title,
      updatedAt: project.updated_at,
    });
  } catch (err) {
    console.error('Error in POST /projects:', err);
    res.status(500).json({
      type: 'https://api.timeline.studio/errors#internal_error',
      title: 'Internal Server Error',
      status: 500,
      detail: 'An unexpected error occurred',
    });
  }
});

// GET /api/v1/projects/:projectId
router.get('/:projectId', authMiddleware, ownershipMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, title, swimlanes, updated_at FROM projects WHERE id = $1', [req.projectId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        type: 'https://api.timeline.studio/errors#not_found',
        title: 'Not Found',
        status: 404,
        detail: 'Project not found',
      });
    }

    const project = result.rows[0];
    res.json({
      id: project.id,
      title: project.title,
      swimlanes: typeof project.swimlanes === 'string' ? JSON.parse(project.swimlanes) : project.swimlanes,
      updatedAt: project.updated_at,
    });
  } catch (err) {
    console.error('Error in GET /projects/:projectId:', err);
    res.status(500).json({
      type: 'https://api.timeline.studio/errors#internal_error',
      title: 'Internal Server Error',
      status: 500,
      detail: 'An unexpected error occurred',
    });
  }
});

// PUT /api/v1/projects/:projectId
router.put('/:projectId', authMiddleware, ownershipMiddleware, async (req, res) => {
  try {
    const parsed = UpdateProjectSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        type: 'https://api.timeline.studio/errors#validation_error',
        title: 'Validation Error',
        status: 400,
        detail: 'Invalid input',
        errors: parsed.error.errors,
      });
    }

    const { swimlanes, projectTitle } = parsed.data;

    const result = await pool.query(
      'UPDATE projects SET swimlanes = $1, title = $2, updated_at = now() WHERE id = $3 RETURNING updated_at',
      [JSON.stringify(swimlanes), projectTitle, req.projectId]
    );

    res.json({
      success: true,
      updatedAt: result.rows[0].updated_at,
    });
  } catch (err) {
    console.error('Error in PUT /projects/:projectId:', err);
    res.status(500).json({
      type: 'https://api.timeline.studio/errors#internal_error',
      title: 'Internal Server Error',
      status: 500,
      detail: 'An unexpected error occurred',
    });
  }
});

// DELETE /api/v1/projects/:projectId
router.delete('/:projectId', authMiddleware, ownershipMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM projects WHERE id = $1', [req.projectId]);
    res.status(204).send();
  } catch (err) {
    console.error('Error in DELETE /projects/:projectId:', err);
    res.status(500).json({
      type: 'https://api.timeline.studio/errors#internal_error',
      title: 'Internal Server Error',
      status: 500,
      detail: 'An unexpected error occurred',
    });
  }
});

module.exports = router;
