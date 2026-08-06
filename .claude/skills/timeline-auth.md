# Skill: Timeline Authentication & Backend Integration

## Overview
Guidance for adding user authentication, backend API, and multi-user collaboration to Timeline Studio.

## When to Use This Skill
When implementing:
- User login/logout
- Project ownership and access control
- Real-time sync across browsers/devices
- Server-side database persistence
- Audit logs and version history

## Architecture Decision Points

### 1. Backend Technology
**Decision**: Choose one based on your preferences
- **Node.js + Express**: Lightweight, JavaScript-full-stack, fast setup
- **Python + Flask/Django**: Battle-tested, great ORM, easier to scale
- **Go**: High-performance, concurrent connections, minimal overhead
- **Recommendation for this project**: Node.js + Express (to keep JS stack unified)

### 2. Authentication Method
**JWT Tokens** (recommended for this use case):
- Store token in localStorage with expiry (7-day refresh)
- Include token in `Authorization: Bearer <token>` header on API calls
- Implement refresh endpoint to get new token when expired
- Log out by clearing localStorage

**Session Cookies** (alternative):
- httpOnly cookie set by server (prevents XSS access)
- Automatic inclusion in all requests (no manual header needed)
- Better security but requires CSRF token validation

### 3. Database Schema
```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  passwordHash VARCHAR(255) NOT NULL,
  displayName VARCHAR(255),
  createdAt TIMESTAMP DEFAULT NOW(),
  lastLogin TIMESTAMP,
  UNIQUE(email)
);

-- Projects (top-level ownership)
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  ownerGroup VARCHAR(255),
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  archivedAt TIMESTAMP
);

-- Timelines (current state)
CREATE TABLE timelines (
  id UUID PRIMARY KEY,
  projectId UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  swimlanes JSONB NOT NULL,
  projectTitle VARCHAR(255),
  version INT DEFAULT 1,
  updatedAt TIMESTAMP DEFAULT NOW(),
  updatedBy UUID REFERENCES users(id)
);

-- Versions (saved snapshots)
CREATE TABLE versions (
  id UUID PRIMARY KEY,
  projectId UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  group VARCHAR(255),
  swimlanes JSONB NOT NULL,
  projectTitle VARCHAR(255),
  savedAt TIMESTAMP DEFAULT NOW(),
  savedBy UUID REFERENCES users(id),
  FOREIGN KEY(projectId) REFERENCES projects(id) ON DELETE CASCADE
);

-- Permissions (sharing)
CREATE TABLE permissions (
  id UUID PRIMARY KEY,
  projectId UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK(role IN ('viewer', 'editor', 'admin')),
  grantedAt TIMESTAMP DEFAULT NOW(),
  grantedBy UUID REFERENCES users(id),
  UNIQUE(projectId, userId)
);

-- Audit Log
CREATE TABLE audit_log (
  id UUID PRIMARY KEY,
  projectId UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  changedBy UUID REFERENCES users(id),
  delta JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

### 4. API Endpoints (RESTful)

#### Authentication
```
POST /api/auth/register
  { email, password, displayName } → { token, user: { id, email, displayName } }

POST /api/auth/login
  { email, password } → { token, user, expiresIn }

POST /api/auth/refresh
  { refreshToken } → { token, expiresIn }

POST /api/auth/logout
  → { success }

GET /api/auth/me
  [Authorization header] → { user: { id, email, displayName } }
```

#### Projects
```
GET /api/projects
  [Authorization header] → [{ id, title, ownerGroup, role, updatedAt }]

POST /api/projects
  { title, ownerGroup? } → { id, title, swimlanes: [], projectTitle: "" }

GET /api/projects/:id
  [Authorization header] → { id, title, ownerGroup, swimlanes, projectTitle, role }

PUT /api/projects/:id
  { swimlanes, projectTitle } → { id, version, updatedAt }

DELETE /api/projects/:id
  → { success }

PATCH /api/projects/:id
  { title, ownerGroup, archivedAt? } → { success }
```

#### Versions
```
GET /api/projects/:id/versions
  [Authorization header] → [{ id, name, group, savedAt, savedBy }]

POST /api/projects/:id/versions
  { name, group } → { id }

PUT /api/projects/:id/versions/:verId
  { name, group } → { success }

DELETE /api/projects/:id/versions/:verId
  → { success }

POST /api/projects/:id/versions/:verId/restore
  → { success, swimlanes, projectTitle }
```

#### Sharing
```
GET /api/projects/:id/permissions
  [admin only] → [{ userId, userEmail, role, grantedAt }]

POST /api/projects/:id/permissions
  { userId, role } → { success }

PUT /api/projects/:id/permissions/:userId
  { role } → { success }

DELETE /api/projects/:id/permissions/:userId
  → { success }
```

## Frontend Changes Required

### 1. Add Login/Register Page
```html
<!-- Before main app loads -->
<div id="auth-container">
  <form id="loginForm">
    <input type="email" placeholder="Email" required />
    <input type="password" placeholder="Password" required />
    <button type="submit">Login</button>
    <a href="#register">Create Account</a>
  </form>
</div>
```

### 2. Replace localStorage with API Calls
```javascript
// OLD: Push changes to history and localStorage
function pushHistory() { history.push(snapshot()); }
function saveFlash() { localStorage.setItem(VER_STORAGE_KEY, JSON.stringify(versions)); }

// NEW: Push to server
async function saveTimeline() {
  const response = await fetch(`/api/projects/${projectId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ swimlanes, projectTitle })
  });
  if (!response.ok) handleError(response);
  saveFlash(); // Still show UI feedback
}
```

### 3. Add Token Management
```javascript
let authToken = localStorage.getItem('auth_token');
let authUser = JSON.parse(localStorage.getItem('auth_user') || '{}');

function setAuthToken(token, user) {
  authToken = token;
  authUser = user;
  localStorage.setItem('auth_token', token);
  localStorage.setItem('auth_user', JSON.stringify(user));
}

function clearAuth() {
  authToken = null;
  authUser = {};
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
}
```

### 4. Add Request Interceptor
```javascript
async function apiCall(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  
  const response = await fetch(endpoint, { ...options, headers });
  if (response.status === 401) {
    clearAuth();
    window.location.href = '/login';
    return;
  }
  return response;
}
```

## Migration Strategy

### Phase 1: Parallel Mode (Current App + Backend Coexist)
1. Deploy backend API alongside existing HTML
2. Add login screen but keep localStorage fallback for non-logged-in users
3. Logged-in users' data syncs to server; localStorage acts as cache
4. Add banner: "Your changes will be saved once you log in"

### Phase 2: Full Migration
1. Deprecate localStorage for authenticated users
2. Move all data to server, reload from `/api/projects/{id}` on page load
3. Keep localStorage only for offline draft mode (optional)

### Phase 3: Real-Time Sync (Optional)
1. Add WebSocket connection on login
2. Broadcast mutations to all connected clients
3. Implement conflict resolution (last-write-wins or three-way merge)

## Security Checklist

- [ ] Hash passwords with bcrypt (10+ salt rounds)
- [ ] Use HTTPS only (enforce in .env)
- [ ] Validate all inputs on server (never trust client)
- [ ] Check user.id === project.userId before mutations
- [ ] Rate-limit login attempts (e.g., 5 attempts per 15 min)
- [ ] Implement CSRF token validation on state-changing endpoints
- [ ] Sanitize all user input (title, assignedTo, notes) before storing
- [ ] Use prepared statements / parameterized queries (prevent SQL injection)
- [ ] Implement refresh token rotation (issue new token with each refresh)
- [ ] Log all access to audit_log table
- [ ] Add "forgot password" flow with time-limited tokens
- [ ] Implement email verification for new accounts

## Rollout Checklist

- [ ] Deploy backend API to staging
- [ ] Update HTML to add login/register screens
- [ ] Test auth flow in browser
- [ ] Test permission checks on backend (manually modify DB)
- [ ] Test offline behavior (simulate network down)
- [ ] Update CLAUDE.md to document new API
- [ ] Update README.md with login instructions
- [ ] Backup existing localStorage data before switching users over
- [ ] Monitor server logs for errors during rollout
- [ ] Add error tracking (e.g., Sentry)

---

**Status**: Planning | **Priority**: High | **Effort**: 60-80 hours
