# Project Timeline Studio

## Overview
**Timeline Studio** is a browser-based project timeline management application (Gantt chart) that allows users to create, edit, and visualize project schedules. The application supports multiple swimlanes (phases), tasks, milestones, and version management with localStorage persistence.

### Current Capabilities
- **Data Editor**: Table-based UI for managing tasks, milestones, phases with drag-reorder support
- **Timeline View**: Visual Gantt chart with year/month headers and status indicators
- **Version Management**: Save snapshots of timelines by business group with full CRUD operations
- **Rich History**: Undo/redo with hotkey support (Ctrl+Z, Ctrl+Shift+Z)
- **Export**: PowerPoint (.pptx) export via pptxgen.js library
- **Status Tracking**: 5-state system (not-started, in-progress, complete, behind-schedule, at-risk)
- **Compact Mode**: Toggleable row height reduction for dense layouts

## Architecture

### File Structure
```
project-timeline-studio/
├── CLAUDE.md                          (this file)
├── README.md                          (user documentation)
├── project-timeline-studio.html       (main application - no build needed)
├── .claude/
│   ├── settings.json                  (project settings)
│   └── skills/
│       ├── timeline-export.md
│       ├── timeline-auth.md
│       └── timeline-ui.md
└── docs/
    ├── ROADMAP.md
    ├── API_DESIGN.md
    └── ARCHITECTURE.md
```

### Technology Stack
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3 with CSS variables
- **Storage**: Browser localStorage (v1 versioning scheme)
- **Export**: pptxgen.js@3.12.0 (CDN)
- **Build**: None (standalone HTML file, no build step required)

### Key State Structures
```javascript
// Swimlane (phase) container
{ id, name, phase, children[] }

// Row (task/milestone/phase)
{ id, title, type, start, end, percent, assignedTo, status, visible, note }

// Version (saved snapshot)
{ id, name, group, savedAt, data: { swimlanes, projectTitle } }
```

### Data Flow
1. User edits → `onFieldChange()` → `pushHistory()` → mutations → `saveFlash()` → `render()`
2. Tab changes → `setTab()` → conditional `render*()` calls
3. Drag operations → `moveRow()` → swimlane/children reordering → `render()`
4. Version load → `loadVersion()` → swimlanes replacement → `render()`

## Development Guidelines

### Code Style
- **No build process**: Keep it a single HTML file unless server-side features are added
- **Mutation pattern**: Direct object mutations (e.g., `row.title = val`), no immutability overhead
- **Naming**: camelCase functions, kebab-case CSS, ALLCAPS for constants
- **Comments**: Only for non-obvious WHY; code structure is self-documenting
- **No error handling**: Trust internal constraints; validate at boundaries only

### When Adding Features
1. **Keep the HTML standalone** unless switching to a backend (auth, database, real-time sync)
2. **Extend state objects** with new fields (not wrapper objects)
3. **Follow the render pattern**: mutation → `pushHistory()` → `saveFlash()` → `render()`
4. **Update CSS variables** in `:root` for new color themes
5. **Test in browser**: No unit tests yet; manual QA in Chrome/Firefox/Safari

### localStorage Considerations
- **Key format**: `tlStudio.versions.v1` (version suffix for safe migration)
- **Size limit**: ~5-10MB per browser; warn users on large projects
- **Expiry**: None (persistent until user clears browser data)
- **Multi-tab**: No real-time sync; last-write-wins on page refresh

## Upcoming Features (Planned)

### Phase 1: Authentication & Multi-User (Priority)
- [ ] Backend API (Node/Express or similar)
- [ ] User login with JWT tokens
- [ ] Project ownership and sharing (view/edit permissions)
- [ ] Replace localStorage with server-side database
- [ ] Real-time collaboration (WebSocket or polling)
- [ ] Audit trail (who changed what, when)

### Phase 2: UI Enhancements
- [ ] Responsive design for mobile/tablet
- [ ] Dark mode toggle
- [ ] Search/filter rows
- [ ] Bulk edit (e.g., shift-select to change status on multiple)
- [ ] Inline notes editor (replace window.prompt)
- [ ] Keyboard shortcuts help modal

### Phase 3: Advanced Features
- [ ] Dependency chains (task A → task B auto-scheduling)
- [ ] Resource leveling (assign team capacity, detect overallocation)
- [ ] Critical path analysis
- [ ] Budget tracking (cost per phase/task)
- [ ] Integration with external calendars (Google Calendar, Outlook)
- [ ] Slack/email notifications for milestones

## Backend Integration Points (For Auth Phase)

### API Endpoints (Proposed)
```
POST   /api/auth/login              { email, password } → { token, user }
POST   /api/auth/logout             → { success }
GET    /api/projects                → [{ id, title, owner, updatedAt }]
POST   /api/projects                { title, group } → { id, data }
GET    /api/projects/{id}           → { id, title, swimlanes, permissions }
PUT    /api/projects/{id}           { swimlanes, projectTitle } → { success, version }
GET    /api/projects/{id}/versions  → [{ id, name, group, savedAt }]
POST   /api/projects/{id}/versions  { name, group } → { id }
DELETE /api/projects/{id}/versions/{verId}
```

### Session Management
- JWT tokens in localStorage (or httpOnly cookie if backend sets it)
- Refresh token rotation every 7 days
- Logout clears tokens and redirects to login
- Protected routes check token before rendering editor

### Database Schema (Proposed)
```sql
users (id, email, passwordHash, createdAt, lastLogin)
projects (id, userId, title, ownerGroup, createdAt, updatedAt)
timelines (id, projectId, swimlanes, projectTitle, version, savedAt)
versions (id, projectId, name, group, data, savedAt, createdBy)
permissions (id, projectId, userId, role, grantedAt)  -- view/edit/admin
audit_log (id, projectId, action, changedBy, timestamp, delta)
```

## Testing Strategy
- **Current**: Manual QA in browser DevTools (localStorage inspection)
- **Planned**: Selenium/Cypress for UI flow tests + backend API contract tests
- **Performance**: Monitor localStorage size and timeline render time with 100+ rows

## Security Considerations
- **XSS Prevention**: Use `escapeHtml()` and `escapeAttr()` on all user inputs
- **CSRF**: Add token validation on backend POST/PUT/DELETE
- **SQL Injection**: Prepared statements on backend
- **Access Control**: Verify `userId` matches `projectId` owner on backend
- **Data Validation**: Date ranges, status enums, title length limits

## Known Limitations
1. **No multi-tab sync**: Changes in one tab don't auto-refresh other tabs
2. **No conflict resolution**: Concurrent edits to same version cause last-write-wins
3. **PPTX export**: Basic layout, no styling/colors transferred to slides
4. **Date inputs**: Relies on browser's `<input type="date">` (IE11 not supported)
5. **Performance**: Slow render times with 1000+ rows (consider virtualization)

## Quick Start for Contributors
```bash
# 1. Open file in browser (no server needed)
open project-timeline-studio.html

# 2. Edit HTML/CSS/JS directly in the file
# 3. Refresh browser (F5) to test changes
# 4. Check localStorage in DevTools > Application > Local Storage

# To add a new feature:
# - Add state variable at top of <script>
# - Add mutation function (pushHistory at start, saveFlash at end)
# - Add render logic in appropriate renderXxx() function
# - Add event handler (onclick, onchange, etc.)
# - Test in browser DevTools console
```

## Contact & Support
- **Owner**: Bhushan (bhushan.hatwalne@gmail.com)
- **Current Status**: Standalone HTML, ready for backend integration
- **Next Steps**: Backend API, authentication, multi-user sync

---
*Last updated: 2026-08-06 | Version: 1.0.0*
