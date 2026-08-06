# Timeline Studio - API Design Specification

## Overview
This document defines the RESTful API for Timeline Studio backend services. These endpoints are planned for Phase 1 (Authentication & Backend) and will replace current localStorage-based persistence.

## API Principles
- **Stateless**: No server-side session state (JWT-based)
- **Versioned**: All endpoints versioned as `/api/v1/...`
- **Paginated**: List endpoints support `?page=1&limit=20`
- **Filtered**: Support common filters like `?status=complete&assignedTo=john`
- **Sorted**: Support `?sort=createdAt` and `?sort=-updatedAt` (- for descending)
- **Time-based**: All timestamps in ISO 8601 format (UTC)
- **Consistent errors**: All errors follow RFC 7807 Problem Details format

## Base URL
```
Development:  http://localhost:3000/api/v1
Staging:      https://staging-api.timeline.studio/api/v1
Production:   https://api.timeline.studio/api/v1
```

## Authentication

### Header Format
```
Authorization: Bearer <JWT_TOKEN>
```

### JWT Token Structure
```javascript
{
  "sub": "user_id_uuid",
  "email": "user@example.com",
  "iat": 1691234567,
  "exp": 1691321000,
  "iss": "timeline-studio",
  "aud": "timeline-studio-app"
}
```

### Token Lifecycle
- **Access Token**: 1 hour expiry
- **Refresh Token**: 7 day expiry
- **Refresh endpoint**: `POST /auth/refresh` returns new access token

### No Auth Required
- `POST /auth/register`
- `POST /auth/login`
- `GET /health` (status check)

## Error Response Format

All errors follow RFC 7807:
```json
{
  "type": "https://api.timeline.studio/docs/errors#validation_error",
  "title": "Validation Error",
  "status": 400,
  "detail": "Email already registered",
  "instance": "/api/v1/auth/register",
  "timestamp": "2026-08-06T10:30:00Z",
  "errors": [
    {
      "field": "email",
      "code": "duplicate",
      "message": "Email is already registered"
    }
  ]
}
```

## Authentication Endpoints

### POST /auth/register
Create a new user account.

**Request**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "displayName": "John Doe"
  }'
```

**Request Body**
| Field | Type | Required | Rules |
|-------|------|----------|-------|
| email | string | Yes | Must be valid email, unique |
| password | string | Yes | Min 8 chars, 1 uppercase, 1 number, 1 special char |
| displayName | string | No | Max 100 chars |

**Response (201 Created)**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "rt_eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "displayName": "John Doe",
    "createdAt": "2026-08-06T10:30:00Z"
  }
}
```

**Possible Errors**
- `400 Bad Request`: Email already registered, password too weak
- `422 Unprocessable Entity`: Validation failed

---

### POST /auth/login
Authenticate user and receive tokens.

**Request**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

**Request Body**
| Field | Type | Required |
|-------|------|----------|
| email | string | Yes |
| password | string | Yes |

**Response (200 OK)**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "rt_eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "displayName": "John Doe"
  }
}
```

**Possible Errors**
- `401 Unauthorized`: Invalid email or password
- `429 Too Many Requests`: Rate limited (5 attempts per 15 min)

---

### POST /auth/refresh
Get a new access token using refresh token.

**Request**
```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "rt_eyJhbGciOiJIUzI1NiIs..."
  }'
```

**Response (200 OK)**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600
}
```

**Possible Errors**
- `401 Unauthorized`: Invalid or expired refresh token

---

### POST /auth/logout
Revoke current session (clear refresh token on server).

**Request**
```bash
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Authorization: Bearer <token>"
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### GET /auth/me
Get current authenticated user.

**Request**
```bash
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer <token>"
```

**Response (200 OK)**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "displayName": "John Doe",
  "createdAt": "2026-08-06T10:30:00Z",
  "lastLogin": "2026-08-06T14:00:00Z"
}
```

**Possible Errors**
- `401 Unauthorized`: Invalid or missing token

---

## Project Endpoints

### GET /projects
List all projects accessible to user (owned + shared).

**Request**
```bash
curl -X GET "http://localhost:3000/api/v1/projects?page=1&limit=20&sort=-updatedAt" \
  -H "Authorization: Bearer <token>"
```

**Query Parameters**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | integer | 1 | Page number (0-indexed) |
| limit | integer | 20 | Items per page (max 100) |
| sort | string | -updatedAt | Sort field (prefix `-` for descending) |
| search | string | | Search in title |

**Response (200 OK)**
```json
{
  "data": [
    {
      "id": "proj_123456",
      "title": "Credit Services Phase 1",
      "ownerGroup": "Credit Services",
      "owner": {
        "id": "user_123",
        "email": "owner@example.com",
        "displayName": "Alice"
      },
      "role": "editor",
      "createdAt": "2026-07-01T10:30:00Z",
      "updatedAt": "2026-08-06T14:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1
  }
}
```

---

### POST /projects
Create a new project.

**Request**
```bash
curl -X POST http://localhost:3000/api/v1/projects \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Project",
    "ownerGroup": "Engineering"
  }'
```

**Request Body**
| Field | Type | Required | Rules |
|-------|------|----------|-------|
| title | string | Yes | Max 255 chars |
| ownerGroup | string | No | Max 100 chars |

**Response (201 Created)**
```json
{
  "id": "proj_123456",
  "title": "New Project",
  "ownerGroup": "Engineering",
  "owner": {
    "id": "user_123",
    "email": "user@example.com"
  },
  "role": "admin",
  "createdAt": "2026-08-06T14:00:00Z",
  "updatedAt": "2026-08-06T14:00:00Z",
  "swimlanes": [],
  "projectTitle": "New Project"
}
```

---

### GET /projects/:projectId
Get project details with current timeline data.

**Request**
```bash
curl -X GET http://localhost:3000/api/v1/projects/proj_123456 \
  -H "Authorization: Bearer <token>"
```

**Response (200 OK)**
```json
{
  "id": "proj_123456",
  "title": "Credit Services Phase 1",
  "ownerGroup": "Credit Services",
  "owner": { ... },
  "role": "editor",
  "createdAt": "2026-07-01T10:30:00Z",
  "updatedAt": "2026-08-06T14:00:00Z",
  "swimlanes": [
    {
      "id": 1,
      "name": "Phase 1",
      "phase": {
        "id": 2,
        "title": "Phase 1",
        "type": "phase",
        "start": "2026-09-01",
        "end": "2026-10-31",
        "percent": 50,
        "assignedTo": "Team A",
        "status": "in-progress",
        "visible": true
      },
      "children": [
        {
          "id": 3,
          "title": "Requirement Gathering",
          "type": "task",
          "start": "2026-09-01",
          "end": "2026-09-15",
          "percent": 100,
          "assignedTo": "John, Jane",
          "status": "complete",
          "visible": true,
          "note": "Completed with stakeholder sign-off"
        }
      ]
    }
  ],
  "projectTitle": "Credit Services Phase 1"
}
```

**Possible Errors**
- `403 Forbidden`: User doesn't have access
- `404 Not Found`: Project doesn't exist

---

### PUT /projects/:projectId
Update project data (swimlanes and title).

**Request**
```bash
curl -X PUT http://localhost:3000/api/v1/projects/proj_123456 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "swimlanes": [...],
    "projectTitle": "Updated Title"
  }'
```

**Request Body**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| swimlanes | array | Yes | Full swimlanes array (replaces existing) |
| projectTitle | string | Yes | Project display name |

**Response (200 OK)**
```json
{
  "success": true,
  "id": "proj_123456",
  "version": 42,
  "updatedAt": "2026-08-06T14:30:00Z",
  "updatedBy": "user_123"
}
```

**Possible Errors**
- `400 Bad Request`: Invalid swimlanes structure
- `403 Forbidden`: User doesn't have edit permission
- `409 Conflict`: Concurrent edit detected (version mismatch)

---

### PATCH /projects/:projectId
Update project metadata (title, ownerGroup, archived status).

**Request**
```bash
curl -X PATCH http://localhost:3000/api/v1/projects/proj_123456 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Title",
    "ownerGroup": "New Group",
    "archivedAt": null
  }'
```

**Response (200 OK)**
```json
{
  "success": true,
  "id": "proj_123456"
}
```

---

### DELETE /projects/:projectId
Delete project permanently (soft delete, keep audit trail).

**Request**
```bash
curl -X DELETE http://localhost:3000/api/v1/projects/proj_123456 \
  -H "Authorization: Bearer <token>"
```

**Response (204 No Content)**
(No response body)

**Possible Errors**
- `403 Forbidden`: Only owner can delete
- `404 Not Found`: Project doesn't exist

---

## Version Endpoints

### GET /projects/:projectId/versions
List all saved versions for a project.

**Request**
```bash
curl -X GET "http://localhost:3000/api/v1/projects/proj_123456/versions?limit=50" \
  -H "Authorization: Bearer <token>"
```

**Response (200 OK)**
```json
{
  "data": [
    {
      "id": "ver_789",
      "name": "Client Review - v2",
      "group": "Credit Services",
      "savedAt": "2026-08-05T15:00:00Z",
      "savedBy": {
        "id": "user_123",
        "displayName": "Alice"
      },
      "stats": {
        "swimlanes": 1,
        "tasks": 8,
        "milestones": 3
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 12
  }
}
```

---

### POST /projects/:projectId/versions
Create a new version (snapshot) of current timeline.

**Request**
```bash
curl -X POST http://localhost:3000/api/v1/projects/proj_123456/versions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Client Review - v2",
    "group": "Credit Services"
  }'
```

**Response (201 Created)**
```json
{
  "id": "ver_789",
  "name": "Client Review - v2",
  "group": "Credit Services",
  "savedAt": "2026-08-06T14:30:00Z",
  "savedBy": {
    "id": "user_123",
    "displayName": "Alice"
  }
}
```

---

### PUT /projects/:projectId/versions/:verId
Update version name/group.

**Request**
```bash
curl -X PUT http://localhost:3000/api/v1/projects/proj_123456/versions/ver_789 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Client Review - v3",
    "group": "Executive"
  }'
```

**Response (200 OK)**
```json
{ "success": true }
```

---

### DELETE /projects/:projectId/versions/:verId
Delete a saved version.

**Request**
```bash
curl -X DELETE http://localhost:3000/api/v1/projects/proj_123456/versions/ver_789 \
  -H "Authorization: Bearer <token>"
```

**Response (204 No Content)**

---

### POST /projects/:projectId/versions/:verId/restore
Restore (load) a previous version.

**Request**
```bash
curl -X POST http://localhost:3000/api/v1/projects/proj_123456/versions/ver_789/restore \
  -H "Authorization: Bearer <token>"
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Version restored to current timeline",
  "timestamp": "2026-08-06T14:30:00Z"
}
```

---

## Permission Endpoints

### GET /projects/:projectId/permissions
List all users with access to this project.

**Request** (Admin/Owner only)
```bash
curl -X GET http://localhost:3000/api/v1/projects/proj_123456/permissions \
  -H "Authorization: Bearer <token>"
```

**Response (200 OK)**
```json
{
  "data": [
    {
      "id": "perm_123",
      "userId": "user_456",
      "userEmail": "teammate@example.com",
      "displayName": "Bob",
      "role": "editor",
      "grantedAt": "2026-08-01T10:30:00Z",
      "grantedBy": {
        "displayName": "Alice"
      }
    }
  ]
}
```

---

### POST /projects/:projectId/permissions
Grant access to another user.

**Request**
```bash
curl -X POST http://localhost:3000/api/v1/projects/proj_123456/permissions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userEmail": "colleague@example.com",
    "role": "editor"
  }'
```

**Request Body**
| Field | Type | Required | Options |
|-------|------|----------|---------|
| userEmail | string | Yes | Must be registered user |
| role | string | Yes | viewer, editor, admin |

**Response (201 Created)**
```json
{
  "id": "perm_123",
  "userId": "user_456",
  "userEmail": "colleague@example.com",
  "role": "editor",
  "grantedAt": "2026-08-06T14:30:00Z"
}
```

**Possible Errors**
- `400 Bad Request`: User not found, invalid role
- `409 Conflict`: User already has access

---

### PUT /projects/:projectId/permissions/:userId
Update user's role.

**Request**
```bash
curl -X PUT http://localhost:3000/api/v1/projects/proj_123456/permissions/user_456 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "admin"
  }'
```

**Response (200 OK)**
```json
{ "success": true }
```

---

### DELETE /projects/:projectId/permissions/:userId
Revoke user's access.

**Request**
```bash
curl -X DELETE http://localhost:3000/api/v1/projects/proj_123456/permissions/user_456 \
  -H "Authorization: Bearer <token>"
```

**Response (204 No Content)**

---

## Rate Limiting

All endpoints are rate-limited:
- **Anonymous**: 20 requests/minute
- **Authenticated**: 100 requests/minute per user
- **Premium**: 1000 requests/minute

Headers returned with each response:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1691234667
```

---

## Webhook Events (Phase 2)

Future webhook support for automation:
```
POST /api/webhooks { url, events }
  - project.created
  - project.updated
  - version.created
  - timeline.changed (swimlanes modified)
  - permission.granted
  - user.joined
```

---

## Testing

### Test with cURL
All examples above can be tested directly in terminal.

### Test with Postman
1. Download [Postman](https://www.postman.com)
2. Import `timeline-studio-api.postman_collection.json` (to be created)
3. Set `baseUrl` and `token` variables
4. Run requests

### Test with API Documentation
Interactive docs available at:
```
http://localhost:3000/api/docs
```

---

**Version 1.0** | Last updated: 2026-08-06
