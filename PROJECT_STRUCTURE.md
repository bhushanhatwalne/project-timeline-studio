# Project Structure Overview

## Directory Layout
```
project-timeline-studio/
├── project-timeline-studio.html       Main application (single file, no build)
├── CLAUDE.md                          Project documentation & guidelines
├── README.md                          User-facing documentation
├── PROJECT_STRUCTURE.md               This file
│
├── .claude/                           Claude Code configuration
│   ├── settings.json                  Project-specific settings & rules
│   └── skills/                        Development guides for different areas
│       ├── timeline-auth.md           Authentication & backend integration
│       ├── timeline-ui.md             UI enhancements & UX improvements
│       └── timeline-export.md         Export formats & integrations
│
└── docs/                              Technical documentation
    ├── ARCHITECTURE.md                System design & data flow
    ├── ROADMAP.md                     2-year development plan
    └── API_DESIGN.md                  RESTful API specification (Phase 1)
```

## Quick Navigation

### For Users
- Start here: **README.md** — How to use Timeline Studio
- Features guide: **README.md** — All features explained
- Troubleshooting: **README.md** → Troubleshooting section

### For Developers
- Project overview: **CLAUDE.md** — Architecture, tech stack, guidelines
- System design: **docs/ARCHITECTURE.md** — Data models, rendering, state management
- Development roadmap: **docs/ROADMAP.md** — What's coming, when, and how much it costs
- Skills & guides:
  - **skills/timeline-auth.md** — How to add authentication (Phase 1)
  - **skills/timeline-ui.md** — How to improve UI/UX
  - **skills/timeline-export.md** — How to add integrations and exports
- API design: **docs/API_DESIGN.md** — Complete REST API spec (for backend dev)

### For Project Managers
- Roadmap: **docs/ROADMAP.md** — Timeline, effort estimates, team requirements
- Status: **CLAUDE.md** → Known Limitations section
- What's next: **docs/ROADMAP.md** → Phase 1 (Q3-Q4 2026)

---

## Key Files Explained

### CLAUDE.md
**Purpose**: Comprehensive project guide for developers
**Contains**:
- Architecture overview with diagrams
- Tech stack and dependencies
- Code style guidelines
- Known limitations
- Backend integration points
- Database schema (for Phase 1)
- Security considerations

**When to read**: Before starting any development work

---

### README.md
**Purpose**: User documentation and guide
**Contains**:
- Feature list and quick start
- User guide (all columns, tabs, menus)
- Data storage explanation
- Browser support
- Limitations and tips
- Troubleshooting

**When to read**: Before first use, or to learn all features

---

### .claude/settings.json
**Purpose**: Configure Claude Code for this project
**Contains**:
- Allowed permissions (bash, read, edit, write, etc.)
- Project-specific rules (e.g., "keep HTML standalone")
- Environment variables
- Security guidelines

**When to update**: When adding new tools or changing rules

---

### docs/ARCHITECTURE.md
**Purpose**: Deep dive into system design
**Contains**:
- System overview diagram
- Data models (Swimlane, Row, Version)
- State management approach
- Rendering strategy
- Undo/redo implementation
- Performance characteristics
- Browser compatibility matrix
- Future architecture (with backend)

**When to read**: When designing new features or troubleshooting

---

### docs/ROADMAP.md
**Purpose**: 2-year development plan with timelines and costs
**Contains**:
- Phase 1-5 breakdown (Auth, Collab, Integrations, Mobile, Enterprise)
- Effort estimates and team requirements
- Budget projection ($47K+ total)
- Success metrics and KPIs
- Risk mitigation strategies
- Release governance

**When to read**: For planning, prioritization, and resource allocation

---

### docs/API_DESIGN.md
**Purpose**: Complete REST API specification for backend developers
**Contains**:
- Authentication endpoints (register, login, refresh)
- Project CRUD operations
- Version management endpoints
- Permission/sharing endpoints
- Error response format
- Rate limiting policy
- cURL examples for all endpoints

**When to use**: When building the Phase 1 backend

---

### skills/timeline-auth.md
**Purpose**: Step-by-step guide to implementing authentication
**Contains**:
- Architecture decisions (JWT vs sessions, tech stack choices)
- Database schema for users, projects, permissions
- API endpoint design
- Frontend refactoring needed
- Security checklist
- Rollout strategy

**When to use**: Starting Phase 1 (Q3 2026)

---

### skills/timeline-ui.md
**Purpose**: Guide to UI enhancements (quick wins first)
**Contains**:
- Quick wins (dark mode, responsive design, search)
- Medium-effort features (bulk edit, rich notes)
- Advanced features (drag-to-change-dates)
- Accessibility improvements
- Implementation roadmap

**When to use**: When improving UX or adding polish features

---

### skills/timeline-export.md
**Purpose**: Guide to export formats and integrations
**Contains**:
- Easy wins (JSON, CSV, iCal export)
- Medium-effort integrations (Jira, Google Calendar)
- Webhook architecture
- Library recommendations
- Implementation roadmap

**When to use**: When adding export features or integrations (Phase 3)

---

## Development Workflow

### Starting a New Feature
1. **Define**: What are we building? (feature name, use case)
2. **Research**: Read relevant skill file (timeline-auth.md, timeline-ui.md, etc.)
3. **Design**: Update ARCHITECTURE.md if needed, get feedback
4. **Implement**: Follow code style in CLAUDE.md, keep HTML standalone
5. **Test**: Manual QA in browser, check localStorage, test undo/redo
6. **Document**: Update README.md, ARCHITECTURE.md, or appropriate skill file
7. **Release**: Update ROADMAP.md with actual effort, bump version number

### Making Code Changes
1. Edit the `project-timeline-studio.html` file directly
2. Refresh browser (F5) to test
3. Open DevTools (F12) to check:
   - Console for errors
   - localStorage for data persistence
   - Network tab for API calls (future)
4. Test across browsers before committing

### When Adding New Rules
1. Update `.claude/settings.json` → rules section
2. Document the rationale in CLAUDE.md
3. Add to relevant skill file

---

## Important Principles

### Code Style
✅ Keep it simple — No frameworks, no build step
✅ Mutation pattern — pushHistory() → mutate → saveFlash() → render()
✅ CSS variables — Use :root for all theming
✅ Comments — Only WHY, not WHAT
✅ Escape user input — Use escapeHtml() and escapeAttr()

### Architecture
✅ Standalone HTML — No dependencies except pptxgen.js (CDN)
✅ Full re-render — Simpler than virtual DOM, fast enough
✅ localStorage only (Phase 0) — Move to backend in Phase 1
✅ Snapshot-based undo — Easy to understand, no conflict resolution

### When Stuck
1. Check ARCHITECTURE.md for how things work
2. Read the relevant skill file for guidance
3. Review CLAUDE.md for code style guidelines
4. Search the HTML for similar existing code
5. Test in browser console with `swimlanes` and `render()`

---

## File Modification Checklist

When making changes, consider updating:
- [ ] `project-timeline-studio.html` — The actual code
- [ ] `CLAUDE.md` — If adding new guidelines or changing architecture
- [ ] `README.md` — If adding user-facing features
- [ ] `docs/ARCHITECTURE.md` — If changing state management or rendering
- [ ] `docs/ROADMAP.md` — If shifting Phase priorities or estimates
- [ ] `.claude/settings.json` — If new permissions or rules needed
- [ ] Relevant skill file — If new approach to a feature area

---

## Status by Phase

### ✅ Phase 0 (Current, v1.0.0)
- Standalone HTML with localStorage
- Data, Timeline, Versions tabs
- Undo/redo, drag-and-drop
- PowerPoint export
- Full CRUD for tasks/milestones/phases

### 🚀 Phase 1 (Q3-Q4 2026)
- User authentication (JWT)
- Backend API (Node/Express/PostgreSQL)
- Project ownership and sharing
- Real-time database instead of localStorage

### 📋 Phase 2 (Q1 2027)
- Real-time sync (WebSocket)
- Activity/audit log
- Comments and mentions
- Slack/email notifications

### 🔗 Phase 3 (Q2 2027)
- Export formats (JSON, CSV, iCal)
- Jira integration
- Google Calendar sync
- Custom webhooks

### 📱 Phase 4 (Q3 2027)
- Mobile-responsive design
- Native mobile apps (React Native/Flutter)
- Dark mode
- Advanced analytics

### 🏢 Phase 5 (Q4 2027+)
- Enterprise features (SSO, RBAC, 2FA)
- White-labeling
- Custom integrations
- Scaling to 1000+ users

---

## Contact & Support

**Project Lead**: Bhushan (aadyanaik9@gmail.com)

For questions about:
- Architecture → Read docs/ARCHITECTURE.md
- Features → Read README.md
- Implementation → Read relevant skill file
- Phase planning → Read docs/ROADMAP.md

---

**Last Updated**: 2026-08-06 | **Version**: 1.0.0
