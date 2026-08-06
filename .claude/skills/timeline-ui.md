# Skill: Timeline UI Enhancements

## Overview
Guidance for improving the user interface and user experience of Timeline Studio.

## When to Use This Skill
When implementing:
- Dark mode / theme switching
- Responsive design for mobile
- Improved edit experience (inline editors, modals)
- Search and filtering
- Keyboard navigation
- Accessibility improvements

## Quick Wins (High-Value, Low-Effort)

### 1. Dark Mode Toggle
```javascript
let darkMode = localStorage.getItem('theme') === 'dark';

function toggleDarkMode() {
  darkMode = !darkMode;
  localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  applyTheme();
  render();
}

function applyTheme() {
  const root = document.documentElement;
  if (darkMode) {
    root.style.setProperty('--paper', '#0F1419');
    root.style.setProperty('--surface', '#1A2332');
    root.style.setProperty('--ink', '#E8EEF5');
    root.style.setProperty('--ink-soft', '#A8B5C5');
    // ... add other dark mode colors
  }
}
```

**Effort**: 2 hours | **Impact**: Medium | **User Request**: High

### 2. Responsive Sidebar Layout
```css
@media (max-width: 768px) {
  .app { flex-direction: column; }
  .topbar { flex-wrap: wrap; }
  .tabs { width: 100%; }
  table.data { font-size: 11px; }
  table.data th, table.data td { padding: 4px 6px; }
  .tl-row-label { font-size: 11px; }
}
```

**Effort**: 3 hours | **Impact**: High | **User Request**: Growing

### 3. Better Inline Date Picker
Replace `<input type="date">` with a calendar widget:
```javascript
// Use Flatpickr library (lightweight, no jQuery)
// https://flatpickr.js.org/

import flatpickr from "https://cdn.jsdelivr.net/npm/flatpickr";
flatpickr(".date-in", {
  mode: "single",
  dateFormat: "Y-m-d",
  onChange: (selectedDates) => {
    // Handle date change
  }
});
```

**Effort**: 4 hours | **Impact**: Medium | **User Request**: Medium

### 4. Search and Filter Rows
```javascript
let searchTerm = "";

function setSearchTerm(term) {
  searchTerm = term.toLowerCase();
  render();
}

function filterRows(rows) {
  if (!searchTerm) return rows;
  return rows.filter(r =>
    r.row.title.toLowerCase().includes(searchTerm) ||
    r.row.assignedTo.toLowerCase().includes(searchTerm) ||
    r.row.note?.toLowerCase().includes(searchTerm)
  );
}

// In renderData():
const filteredRows = filterRows(allRows());
// ... render filtered rows instead of allRows()
```

Add search input to toolbar:
```html
<input type="text" placeholder="🔍 Search rows..." 
  value="${searchTerm}" 
  oninput="setSearchTerm(this.value)" 
  style="padding: 7px 12px; border: 1px solid var(--line); border-radius: 6px; font-size: 13px;" />
```

**Effort**: 3 hours | **Impact**: Medium | **User Request**: Growing

### 5. Keyboard Shortcuts Help Modal
```javascript
let showHelp = false;

function toggleHelpModal() {
  showHelp = !showHelp;
  render();
}

// In render():
${showHelp ? `
  <div class="modal-overlay" onclick="if(event.target===this) toggleHelpModal()">
    <div class="modal-card" style="width: 500px; max-height: 70vh; overflow-y: auto;">
      <h3>Keyboard Shortcuts</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td><code>Ctrl+Z</code></td><td>Undo</td></tr>
        <tr><td><code>Ctrl+Shift+Z</code></td><td>Redo</td></tr>
        <tr><td><code>Ctrl+F</code></td><td>Search rows</td></tr>
        <tr><td><code>?</code></td><td>Show this help</td></tr>
      </table>
      <button class="btn primary" onclick="toggleHelpModal()">Close</button>
    </div>
  </div>
` : ""}
```

**Effort**: 1 hour | **Impact**: Low | **User Request**: Low

## Medium-Effort Features

### 6. Bulk Edit (Multi-Select)
```javascript
let selectedRows = new Set(); // row IDs

function toggleRowSelect(rowId) {
  if (selectedRows.has(rowId)) {
    selectedRows.delete(rowId);
  } else {
    selectedRows.add(rowId);
  }
  render();
}

function bulkUpdateStatus(newStatus) {
  pushHistory();
  selectedRows.forEach(rowId => {
    const row = findRowById(rowId);
    if (row) row.status = newStatus;
  });
  selectedRows.clear();
  saveFlash();
  render();
}

// In Data tab, add checkbox column:
// <input type="checkbox" onchange="toggleRowSelect(${rowId})" 
//        ${selectedRows.has(rowId) ? 'checked' : ''} />
```

**Effort**: 5 hours | **Impact**: Medium | **User Request**: Moderate

### 7. Rich Text Editor for Notes
Replace `window.prompt()` with a modal editor:
```javascript
let noteEditMode = { rowId: null, content: "" };

function openNoteEditor(rowId, row) {
  noteEditMode = { rowId, content: row.note || "" };
  render();
}

function closeNoteEditor() {
  noteEditMode = { rowId: null, content: "" };
  render();
}

function saveNote() {
  const row = findRowById(noteEditMode.rowId);
  if (row) {
    pushHistory();
    row.note = noteEditMode.content;
    saveFlash();
  }
  closeNoteEditor();
  render();
}

// In render, if noteEditMode.rowId:
// <modal with textarea for noteEditMode.content>
```

**Effort**: 4 hours | **Impact**: Medium | **User Request**: Low

### 8. Dependency Links
Show which tasks block/unblock others:
```javascript
// Add field to row:
{ ..., dependencies: [] } // [{ type: 'blockedBy', taskId }]

// In timeline, draw connector lines between dependent tasks
function renderDependencies() {
  // ... draw SVG lines between bars
}
```

**Effort**: 8 hours | **Impact**: High | **User Request**: Moderate

## Advanced Features (High-Effort)

### 9. Drag-to-Change-Dates
Click and drag a task bar in the Timeline view to shift its dates:
```javascript
function onBarDragStart(e, rowId) {
  // record original start/end
  barDragState = { rowId, startX: e.clientX, originalStart, originalEnd };
}

function onBarDragMove(e) {
  // calculate delta days
  // update row.start and row.end in real-time
}

function onBarDragEnd(e) {
  // finalize: pushHistory(), saveFlash(), render()
}
```

**Effort**: 10 hours | **Impact**: High | **User Request**: High

### 10. Export to CSV
```javascript
function exportCsv() {
  const rows = allRows();
  const csv = [
    ["Swimlane", "Title", "Type", "Start", "End", "Duration", "%", "Assigned To", "Status"],
    ...rows.map(r => [
      r.swimlaneId,
      r.row.title,
      r.row.type,
      r.row.start,
      r.row.end,
      durationLabel(r.row.start, r.row.end),
      r.row.percent,
      r.row.assignedTo,
      r.row.status
    ])
  ];
  
  const csvContent = csv.map(row =>
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `timeline-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
```

**Effort**: 3 hours | **Impact**: Medium | **User Request**: Low

### 11. Import from CSV
```javascript
function parseAndImportCsv(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const csv = e.target.result;
    const rows = csv.split('\n').map(r => r.split(','));
    // Parse headers, map to swimlanes/children structure
    // pushHistory(), update swimlanes, render()
  };
  reader.readAsText(file);
}
```

**Effort**: 6 hours | **Impact**: Medium | **User Request**: Low

## Accessibility Improvements

### WCAG 2.1 AA Compliance
- [ ] Add `aria-labels` to all buttons
- [ ] Use semantic HTML (`<button>`, `<nav>`, `<main>`)
- [ ] Ensure color contrast ≥ 4.5:1 for text
- [ ] Support keyboard navigation (Tab, Enter, Arrow keys)
- [ ] Add `role="region"` to main content areas
- [ ] Test with screen reader (NVDA, JAWS)

**Effort**: 8 hours | **Impact**: Low (unless targeting WCAG compliance) | **User Request**: Low

## Implementation Roadmap

### Week 1: Quick Wins
- [ ] Dark mode toggle (2h)
- [ ] Responsive CSS media queries (3h)
- [ ] Search/filter (3h)

### Week 2: Medium Features
- [ ] Keyboard shortcuts help (1h)
- [ ] Rich note editor modal (4h)
- [ ] Bulk edit checkboxes (5h)

### Week 3: Advanced
- [ ] Drag-to-change-dates on timeline (10h)
- [ ] CSV export/import (9h)
- [ ] Accessibility audit (8h)

## Testing Checklist

For each feature:
- [ ] Works on Chrome, Firefox, Safari, Edge
- [ ] Mobile responsiveness (iPhone, iPad, Android)
- [ ] Keyboard navigation (no mouse)
- [ ] Screen reader compatibility
- [ ] Undo/redo after feature use
- [ ] Performance with 500+ rows
- [ ] localStorage size still under limit

---

**Status**: Planning | **Roadmap Priority**: High | **Community Demand**: Medium-High
