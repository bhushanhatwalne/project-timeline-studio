# Timeline Studio - Architecture & Design

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser (Client)                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                  HTML/CSS/JavaScript                  │ │
│  │         (Single File: project-timeline-studio.html)   │ │
│  │                                                        │ │
│  │  ┌──────────────────────────────────────────────┐    │ │
│  │  │              State Management                │    │ │
│  │  │  - swimlanes[]  (phases + children)          │    │ │
│  │  │  - projectTitle (string)                     │    │ │
│  │  │  - history[]    (undo snapshots)             │    │ │
│  │  │  - versions[]   (saved snapshots)            │    │ │
│  │  └──────────────────────────────────────────────┘    │ │
│  │                      ↓                                 │ │
│  │  ┌──────────────────────────────────────────────┐    │ │
│  │  │          Mutation Functions                  │    │ │
│  │  │  - onFieldChange()   (edits)                 │    │ │
│  │  │  - deleteRow()       (remove)                │    │ │
│  │  │  - moveRow()         (reorder)               │    │ │
│  │  │  - addChild()        (create)                │    │ │
│  │  │  - loadVersion()     (restore)               │    │ │
│  │  └──────────────────────────────────────────────┘    │ │
│  │                      ↓                                 │ │
│  │  ┌──────────────────────────────────────────────┐    │ │
│  │  │           Render Functions                   │    │ │
│  │  │  - render()           (main dispatcher)      │    │ │
│  │  │  - renderData()       (table view)           │    │ │
│  │  │  - renderTimeline()   (Gantt view)          │    │ │
│  │  │  - renderVersions()   (snapshot gallery)     │    │ │
│  │  └──────────────────────────────────────────────┘    │ │
│  │                      ↓                                 │ │
│  │  ┌──────────────────────────────────────────────┐    │ │
│  │  │            DOM Manipulation                  │    │ │
│  │  │  .innerHTML = ... (replace entire view)    │    │ │
│  │  │  - Lazy: re-render full app on each change │    │ │
│  │  │  - Fast enough for <500 rows               │    │ │
│  │  └──────────────────────────────────────────────┘    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │            Storage Layer (localStorage)               │ │
│  │  - tlStudio.versions.v1  (JSON array of versions)    │ │
│  │  - Auto-persisted on each mutation via saveFlash()   │ │
│  │  - Survives page refresh, lost on clear browser data │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│           External Libraries (CDN)                          │
├─────────────────────────────────────────────────────────────┤
│  - pptxgen.js@3.12.0  (PowerPoint export)                  │
└─────────────────────────────────────────────────────────────┘

                    (Future: Backend API)
                    ↓ (When auth is added)
              ┌─────────────────────┐
              │   Node.js/Express   │
              │   PostgreSQL        │
              │   Real-time Sync    │
              │   JWT Auth          │
              └─────────────────────┘
```

## Data Model

### Swimlane (Phase Container)
```typescript
interface Swimlane {
  id: number;                    // Unique identifier
  name: string;                  // Display name (e.g., "Phase 1: Design")
  phase?: Row;                   // Optional phase header row
  children: Row[];               // Array of tasks/milestones in this phase
}
```

### Row (Task/Milestone/Phase)
```typescript
interface Row {
  id: number;                    // Unique identifier
  title: string;                 // Display name
  type: 'phase' | 'task' | 'milestone' | 'major';  // Item type
  start: string;                 // ISO date string (YYYY-MM-DD)
  end: string;                   // ISO date string (YYYY-MM-DD)
  percent: number;               // 0-100 progress percentage
  assignedTo: string;            // Free text: person/team name(s)
  status: Status;                // Current status
  visible: boolean;              // Show on timeline? (hide without deleting)
  note?: string;                 // Optional long text (shows as 📝)
}

type Status = 'not-started' | 'in-progress' | 'complete' | 'behind-schedule' | 'at-risk';
```

### Version (Saved Snapshot)
```typescript
interface Version {
  id: number;                    // Timestamp or UUID
  name: string;                  // User-given name
  group: string;                 // Business group / category
  savedAt: string;               // ISO timestamp
  data: {
    swimlanes: Swimlane[];
    projectTitle: string;
  };
}
```

## Data Flow Pattern

### User Action → Render Loop
Every mutation follows this pattern:

```
1. User Action (click, input, drag)
   ↓
2. Event Handler (onClick, onChange, etc.)
   ↓
3. pushHistory()  ← Save current state for undo
   ↓
4. Mutate State   ← Modify swimlanes, projectTitle, etc.
   ↓
5. saveFlash()    ← Persist to localStorage, show "Saving..." feedback
   ↓
6. render()       ← Re-render entire app from new state
   ↓
7. DOM Updated    ← Browser paints new UI
```

### Example: Editing a Task Title
```javascript
// Event handler (HTML: onchange="onFieldChange(...)"):
function onFieldChange(slId, rowId, isPhase, field, val) {
  const row = findRow(slId, rowId, isPhase);
  if (row) {
    pushHistory();                                    // 1
    row[field] = val;                                // 2
    saveFlash();                                      // 3
    render();                                         // 4
  }
}
```

## State Management

### Global State Variables
```javascript
let uid = 100;                           // ID counter for new rows
let projectTitle = "...";                // Project name
let activeTab = "data";                  // Current view: data | timeline | versions
let swimlanes = [];                      // Main data structure
let history = [];                        // Undo snapshots
let future = [];                         // Redo snapshots
let versions = [];                       // Saved versions
let compactMode = false;                 // UI density toggle
```

### No Framework = No Boilerplate
- No React state hooks
- No Redux/Mobx stores
- No component lifecycle methods
- Pure JavaScript mutations
- Full app re-render on every change (fast enough for app size)

## Rendering Strategy

### Full Page Re-Render (Lazy but Safe)
```javascript
function render() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="topbar">...</div>
    <div class="tabstrip">...</div>
    <div class="view">${activeTab === 'data' ? renderData() : ...}</div>
    ${modalMode ? renderModal() : ""}
  `;
  
  // Restore focus/interaction after DOM update
  renderToolbar();
  if(activeTab === "data") renderData();
  else if(activeTab === "timeline") renderTimeline();
  else renderVersions();
}
```

### Why Full Re-Render?
- **Pros**: No virtual DOM overhead, no diff algorithm, simpler to debug
- **Cons**: Slow with 1000+ rows, loses focus/scroll position (mitigated by minimal state)
- **Mitigation**: Compact mode, pagination, virtualization (future)

## Undo/Redo Implementation

### Snapshot-Based History
```javascript
let history = [];  // Array of JSON stringified states
let future = [];   // Array of JSON stringified states

function snapshot() {
  return JSON.stringify({ swimlanes, projectTitle });
}

function pushHistory() {
  history.push(snapshot());
  if (history.length > 60) history.shift();  // Keep last 60
  future = [];  // Clear redo stack
}

function undo() {
  if (history.length === 0) return;
  future.push(snapshot());          // Current state → redo
  restoreSnapshot(history.pop());   // Last state → current
  saveFlash();
  render();
}

function redo() {
  if (future.length === 0) return;
  history.push(snapshot());         // Current state → undo
  restoreSnapshot(future.pop());    // Next state → current
  saveFlash();
  render();
}
```

**Trade-offs**:
- Simple (easy to understand, no complex logic)
- Safe (can always revert to last snapshot)
- Overhead (every snapshot is full JSON serialization)
- Limited depth (60 snapshots = ~500KB memory)

## localStorage Persistence

### Schema
```
Key: "tlStudio.versions.v1"
Value: JSON.stringify([
  { id, name, group, savedAt, data: { swimlanes, projectTitle } },
  { ... },
  { ... }
])

Size: Typically 50KB - 2MB depending on timeline size
Limit: 5-10MB per browser (varies)
Persistence: Until user clears browser data
Sync: No (each tab maintains local copy)
```

### When Data Persists
1. **Auto-save**: Every mutation calls `saveFlash()` → `persistVersions()`
2. **Version save**: User clicks "Save version" → adds to versions array
3. **At browser close**: If refresh is intercepted (future)

### When Data Is Lost
1. User clears browser history/cookies/cache
2. Browser storage quota exceeded
3. Corrupted data (rare, but possible)
4. User's device is lost/replaced

## CSS Architecture

### CSS Variables (Theming Ready)
```css
:root {
  /* Colors */
  --paper: #F3F6F9;              /* Background */
  --surface: #FFFFFF;            /* Cards, inputs */
  --ink: #182430;                /* Text */
  --ink-soft: #57697A;           /* Secondary text */
  --ink-faint: #9FB0BE;          /* Tertiary text */
  
  /* Semantic colors */
  --accent: #0076BC;             /* Primary action */
  --danger: #C0392B;             /* Destructive */
  
  /* Status colors */
  --st-notstarted: #77787B;
  --st-progress: #0076BC;
  --st-complete: #1B7A45;
  --st-risk: #C0392B;
  --st-behind: #D98324;
  
  /* Layout */
  --tl-gutter: 150px;            /* Right-side label column width */
  
  /* Fonts */
  --font-display: Georgia, serif;
  --font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: ui-monospace, 'SFMono-Regular', monospace;
}
```

### Layout Structure
```
┌─────────────────────────────────────────┐
│         .topbar (header bar)            │ 24px height
├─────────────────────────────────────────┤
│    .tabstrip (tab buttons + toolbar)    │ 52px height
├─────────────────────────────────────────┤
│                                         │
│         .view (main content)            │ flex: 1
│                                         │
│     (Data table / Timeline / Versions)  │
│                                         │
└─────────────────────────────────────────┘
```

## Performance Characteristics

### Rendering Speed
| Rows | Time | Notes |
|------|------|-------|
| 50 | <50ms | Instant |
| 200 | 100-150ms | Noticeable |
| 500 | 300-500ms | Slow but usable |
| 1000+ | 1s+ | Very slow, consider virtualization |

### Memory Usage
| Rows | RAM | Notes |
|------|-----|-------|
| 100 | 1-2MB | Negligible |
| 500 | 5-10MB | Monitors needed |
| 1000+ | 20-50MB | localStorage may hit limit |

### Optimization Opportunities
1. **Virtualization**: Render only visible rows (10x speedup for 1000+ rows)
2. **Incremental render**: Diff DOM changes instead of full replace
3. **Web Workers**: Offload JSON stringification to background thread
4. **Indexed DB**: Replace localStorage for larger datasets (unlimited size)

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| localStorage | ✓ | ✓ | ✓ | ✓ |
| <input type="date"> | ✓ | ✓ | ✓ | ✓ |
| CSS Grid | ✓ | ✓ | ✓ | ✓ |
| Flexbox | ✓ | ✓ | ✓ | ✓ |
| Drag & Drop | ✓ | ✓ | ✓ | ✓ |
| Blob + Download | ✓ | ✓ | ✓ | ✓ |

## Security Model

### Current (Standalone HTML)
- **No authentication**: Anyone with file access can edit
- **No encryption**: Data stored in plaintext in localStorage
- **No validation**: Trust user input (XSS mitigated via escapeHtml)
- **Threat model**: Assumes single-user, single-device

### Post-Auth (With Backend)
- **Authentication**: JWT tokens, refresh rotation
- **Authorization**: Role-based access (viewer/editor/admin)
- **Encryption**: HTTPS + possible field-level encryption
- **Validation**: Server validates all inputs
- **Audit**: Track all changes with user/timestamp
- **Threat model**: Multi-user, shared devices, network untrusted

## Testing Strategy

### Current (Manual)
1. Open HTML in browser
2. Use DevTools (F12) to inspect state
3. Test data tab, timeline tab, versions tab
4. Check localStorage for data persistence
5. Test undo/redo
6. Test export

### Future (Automated)
```javascript
// Unit tests (Jest/Mocha)
describe('Mutations', () => {
  test('onFieldChange updates row field', () => {
    const row = { title: 'Old', ... };
    onFieldChange(1, 2, false, 'title', 'New');
    expect(row.title).toBe('New');
  });
});

// Integration tests (Cypress/Selenium)
describe('User workflows', () => {
  test('User can create and save a timeline', () => {
    cy.visit('/');
    cy.contains('+ Task').click();
    cy.get('input[title="Title"]').type('New Task');
    cy.contains('Save version').click();
    cy.contains('Version saved').should('be.visible');
  });
});

// Performance tests
describe('Performance', () => {
  test('Render 500 rows in < 1s', () => {
    // Load timeline with 500 rows
    // Measure render time
    // Assert < 1000ms
  });
});
```

## Future Architecture (Post-Auth)

```
┌──────────────────┐          ┌─────────────────┐
│  Browser/Client  │          │  Backend Server │
├──────────────────┤          ├─────────────────┤
│                  │ HTTP/WS  │                 │
│ Timeline Studio  ├──────────→ API Gateway    │
│ (React/Vue SPA)  │          │                 │
│                  │← JSON/WS │                 │
│ (Local cache)    │          │ PostgreSQL DB   │
│                  │          │ Redis Cache     │
└──────────────────┘          │ WebSocket Hub   │
                              │                 │
                              │ Auth Service    │
                              │ Audit Logging   │
                              │ Notifications   │
                              └─────────────────┘
```

---

**Version 1.0** | Last updated: 2026-08-06
