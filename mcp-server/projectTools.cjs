// Project-data MCP tools — read-only queries against the same Postgres data
// the Timeline Studio app itself uses, scoped to the authenticated user.
const pool = require('../server/src/db.js');

const STATUS_PRIORITY = ['at-risk', 'behind-schedule', 'in-progress', 'not-started', 'complete'];

function parseSwimlanes(raw) {
  if (!raw) return [];
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

function allRows(swimlanes) {
  return swimlanes.flatMap((lane) => (Array.isArray(lane.children) ? lane.children : []));
}

function deriveStatus(rows) {
  const visibleRows = rows.filter((row) => row.visible !== false);
  if (visibleRows.length === 0) return 'not-started';
  const statuses = new Set(visibleRows.map((row) => row.status));
  for (const status of STATUS_PRIORITY) {
    if (statuses.has(status)) return status;
  }
  return 'not-started';
}

function pickCurrentTask(rows) {
  const candidates = rows.filter((row) => row.visible !== false && ['in-progress', 'at-risk', 'behind-schedule'].includes(row.status));
  if (candidates.length === 0) return null;

  candidates.sort((a, b) => {
    const rank = (status) => (status === 'in-progress' ? 0 : 1);
    const rankDiff = rank(a.status) - rank(b.status);
    if (rankDiff !== 0) return rankDiff;
    return new Date(a.end) - new Date(b.end);
  });

  const task = candidates[0];
  return {
    title: task.title,
    type: task.type,
    status: task.status,
    start: task.start,
    end: task.end,
    percent: task.percent,
    assignedTo: task.assignedTo || null,
  };
}

async function listOpenProjects(userId) {
  const result = await pool.query(
    'SELECT id, title, swimlanes, updated_at FROM projects WHERE user_id = $1 ORDER BY updated_at DESC',
    [userId]
  );

  return result.rows
    .map((project) => {
      const rows = allRows(parseSwimlanes(project.swimlanes));
      return {
        id: project.id,
        title: project.title,
        status: deriveStatus(rows),
        currentTask: pickCurrentTask(rows),
        updatedAt: project.updated_at,
      };
    })
    .filter((project) => project.status !== 'complete');
}

module.exports = { listOpenProjects };
