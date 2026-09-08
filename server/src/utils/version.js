const { execSync } = require('child_process');
const path = require('path');

const packageVersion = require('../../package.json').version;

// Render injects the full commit SHA the service was deployed from; git isn't
// available in that environment, so this only shells out for local dev.
function resolveCommit() {
  if (process.env.RENDER_GIT_COMMIT) {
    return process.env.RENDER_GIT_COMMIT.slice(0, 7);
  }
  try {
    return execSync('git rev-parse --short HEAD', {
      cwd: path.join(__dirname, '../../..'),
      stdio: ['ignore', 'pipe', 'ignore'],
    }).toString().trim();
  } catch {
    return 'unknown';
  }
}

// Computed once at process startup — a new build is a new deploy/restart.
module.exports = {
  version: packageVersion,
  commit: resolveCommit(),
};
