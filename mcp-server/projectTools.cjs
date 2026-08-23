// Project-data MCP tools — read-only queries against the same Postgres data
// the Timeline Studio app itself uses, scoped to the authenticated user.
//
// Status is NOT read from the stored row.status field — the app itself
// ignores that field for display and instead recomputes status live from
// percent-complete vs. a date-based "planned progress", via
// calculateTaskStatus/calculateProjectStatus in project-timeline-studio.html.
// This mirrors that logic exactly so the tool matches what the app shows.
const pool = require('../server/src/db.js');

const TASK_URGENCY = ['Off Track', 'At Risk', 'On Track'];

function parseSwimlanes(raw) {
  if (!raw) return [];
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

function calculatePlannedProgress(start, end) {
  try {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const today = new Date();
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 0;
    if (today <= startDate) return 0;
    if (today >= endDate) return 100;
    const totalDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
    const elapsedDays = (today - startDate) / (1000 * 60 * 60 * 24);
    return Math.round((elapsedDays / totalDays) * 100);
  } catch {
    return 0;
  }
}

function calculateTaskStatus(task) {
  try {
    const actual = task.percent || 0;
    const planned = calculatePlannedProgress(task.start, task.end);

    if (actual === 100) return 'Complete';

    if (actual === 0) {
      const startDate = new Date(task.start);
      if (!isNaN(startDate.getTime()) && startDate > new Date()) return 'Not Started';
    }

    if (actual >= planned - 10) return 'On Track';
    if (actual >= planned - 20) return 'At Risk';
    return 'Off Track';
  } catch {
    return 'On Track';
  }
}

function calculateProjectStatus(swimlanes) {
  if (!swimlanes || swimlanes.length === 0) return 'Not Started';

  let hasStartedTask = false;
  let hasOffTrackTask = false;
  let hasAtRiskTask = false;
  let hasIncompleteTask = false;
  const today = new Date();

  swimlanes.forEach((swimlane) => {
    (swimlane.children || []).forEach((child) => {
      const taskStatus = calculateTaskStatus(child);
      if (taskStatus === 'Off Track') hasOffTrackTask = true;
      if (taskStatus === 'At Risk') hasAtRiskTask = true;
      if (taskStatus !== 'Complete' && taskStatus !== 'Not Started') hasIncompleteTask = true;

      const percent = child.percent || 0;
      if (percent > 0 || new Date(child.start) <= today) hasStartedTask = true;
    });
  });

  if (!hasStartedTask) return 'Not Started';
  if (hasOffTrackTask) return 'Off Track';
  if (hasAtRiskTask) return 'At Risk';
  if (hasIncompleteTask) return 'On Track';
  return 'Complete';
}

function pickCurrentTask(swimlanes) {
  const candidates = swimlanes
    .flatMap((lane) => (Array.isArray(lane.children) ? lane.children : []))
    .filter((row) => row.visible !== false)
    .map((row) => ({ row, status: calculateTaskStatus(row) }))
    .filter(({ status }) => TASK_URGENCY.includes(status));

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => {
    const rankDiff = TASK_URGENCY.indexOf(a.status) - TASK_URGENCY.indexOf(b.status);
    if (rankDiff !== 0) return rankDiff;
    return new Date(a.row.end) - new Date(b.row.end);
  });

  const { row, status } = candidates[0];
  return {
    title: row.title,
    type: row.type,
    status,
    start: row.start,
    end: row.end,
    percent: row.percent,
    assignedTo: row.assignedTo || null,
  };
}

async function listOpenProjects(userId) {
  const result = await pool.query(
    'SELECT id, title, swimlanes, updated_at FROM projects WHERE user_id = $1 ORDER BY updated_at DESC',
    [userId]
  );

  return result.rows
    .map((project) => {
      const swimlanes = parseSwimlanes(project.swimlanes);
      return {
        id: project.id,
        title: project.title,
        status: calculateProjectStatus(swimlanes),
        currentTask: pickCurrentTask(swimlanes),
        updatedAt: project.updated_at,
      };
    })
    .filter((project) => project.status !== 'Complete');
}

module.exports = { listOpenProjects };
