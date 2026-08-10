# Timeline Studio

A lightweight, browser-based project timeline and Gantt chart tool for planning, tracking, and sharing project schedules.

## Features

✨ **What You Can Do**
- Create swimlanes (phases) and organize tasks within them
- Add milestones and major events to your timeline
- Track task progress with dynamic status indicators (Not Started, On Track, At Risk, Off Track, Complete)
- Drag-and-drop to reorder phases and tasks
- Undo/redo with keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z)
- Save multiple versions of your timeline by business group
- View the same data as an interactive Gantt chart
- Export your timeline to PowerPoint slides
- **Dashboard with status overview** — See all projects at a glance with color-coded status cards
- **Collapsible sidebar** — Minimize navigation panel to maximize workspace (state persists)
- **Professional data table** — Auto-adjusting columns with copy/paste date support
- **Advanced date input** — Paste dates in multiple formats (YYYY-MM-DD, MM/DD/YYYY, MMDDYYYY)
- All data saved locally in your browser (no account required yet)

## Getting Started

### 1. Open the Application
Simply open `project-timeline-studio.html` in any modern web browser. No installation, no server, no login required.

```bash
# Windows
start project-timeline-studio.html

# macOS
open project-timeline-studio.html

# Linux
xdg-open project-timeline-studio.html
```

### 2. Create Your First Timeline
- The **Data** tab shows an editable table of all your timeline items
- Click **+ Swimlane** to create a phase (e.g., "Phase 1: Discovery")
- Click **+ Task** to add work items to a swimlane
- Click **+ Milestone** to mark important dates
- Edit any field directly in the table

### 3. View as a Gantt Chart
- Switch to the **Timeline** tab to see your schedule visualized
- Bars show task duration, colored by status
- Year and month headers scale to your date range
- Hover over bars to see details

### 4. Save Your Work
- Your timeline is auto-saved to your browser's local storage
- Click **💾 Save version** to create a named snapshot
- Assign each version to a **business group** for easy organization
- Open the **Versions** tab to manage, duplicate, or restore past versions

## User Guide

### Dashboard
After logging in, you'll see the **Dashboard** showing:
- **Status Cards** — Color-coded summary of all projects:
  - 🔵 **Total Projects** (Blue)
  - 🟢 **On Track** (Green) — Tasks progressing as planned
  - 🟡 **At Risk** (Amber) — Tasks slightly delayed
  - 🔴 **Off Track** (Red) — Tasks significantly delayed
- **Project Table** — List of all your projects with status, progress bar, and last updated date
- **Sidebar Navigation** — Access your projects, templates, reports, and settings
  - Click **←** button at bottom-right to collapse sidebar and maximize workspace
  - Sidebar state is saved automatically

### Table Columns (Data Tab)

| Column | Purpose |
|--------|---------|
| **Title** | Name of the swimlane, task, or milestone |
| **Type** | Phase, Task, Milestone, or Major Milestone |
| **Duration** | Auto-calculated days/weeks between start and end dates |
| **Start** | Calendar date when the item begins |
| **End** | Calendar date when the item finishes |
| **%** | Progress percentage (0–100) |
| **Assigned to** | Person/team responsible (free text) |
| **Status** | Not Started, In Progress, Complete, Behind Schedule, At Risk |

### Status Indicators
Status is **automatically calculated** based on task progress and dates:

- ⚪ **Not Started** — Percent = 0% AND start date is in the future
- 🟢 **On Track** — Progress meets or exceeds plan (variance ≥ -10%)
- 🟡 **At Risk** — Slight delay in progress (variance between -10% and -20%)
- 🔴 **Off Track** — Significant delay (variance < -20%)
- 🟢 **Complete** — Percent = 100%

**Project Status** aggregates task statuses:
- If no tasks have started → **Not Started**
- If any task is in progress → Determined by worst schedule variance
- If all tasks complete → **Complete**

### Row Menu (⋯ Button)
Right-click on any row or click the **⋯** button to:
- Add rows above/below
- Duplicate the row
- Add a note (visible as 📝 in the title cell)
- Hide from timeline (removes it from the Gantt view without deleting)
- Delete the row

### Timeline Tab
- **Compact Mode** toggle to reduce row height for dense timelines
- **Today** line marked in red (if today falls within your date range)
- Bars are clickable (hoverable in future releases)
- Milestones shown as diamond shapes, major milestones as stars

### Versions Tab
- View all saved snapshots organized by business group
- Click a card to open that version in the editor
- Use the **⋯** menu to:
  - Overwrite a version with current changes
  - Duplicate a version
  - Rename or move to another group
  - Delete permanently

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` or `Ctrl+Y` | Redo |

### Drag to Reorder
- Click and drag the **☶** handle on the left of any row
- Drag swimlane headers to reorder phases
- Drag tasks to move them between swimlanes or reorder within a phase

### Export to PowerPoint
- Click **⬇ Export PPTX** to download your timeline as a presentation
- Each swimlane becomes a slide
- Gantt bars are rendered as horizontal rectangles with colors matching status

## Data Storage

Your timeline is stored in your browser's **local storage**, which means:
- ✅ No account needed, no login required
- ✅ No data sent to any server (private by default)
- ✅ Persists until you manually clear browser data
- ⚠️ Lost if you clear browser history (check your browser's privacy settings)
- ⚠️ Not synced across devices

**Save versions** frequently if your timeline is critical. Versions are also stored locally but can be exported/imported in future releases.

## Browser Support

Works on any modern browser:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Limitations

- **Single-user only**: Changes made in one tab don't auto-sync to other open tabs
- **Local storage size**: Most browsers allow 5–10 MB; very large timelines may hit this limit
- **No multi-device sync**: Timeline doesn't follow you to other computers
- **Basic PPTX export**: Colors and formatting are simplified in exported slides

## Tips & Tricks

1. **Long swimlane names**: Use the **Data** tab for clear editing; the **Timeline** tab will abbreviate them
2. **Planning with phases**: Create a swimlane for each team/workstream (e.g., "Design", "Development", "QA")
3. **Dependency chains**: Use milestone dates as signposts; explicitly list "Unblock on Milestone X" in assignee field as a note
4. **Version naming**: Use a date prefix for snapshots (e.g., "2026-08-06 - v2 Client Review")
5. **Hide completed phases**: Eye icon (👁) toggles visibility on the timeline without deleting
6. **Paste dates easily**: In the Data tab, paste dates in any of these formats:
   - `2026-09-15` (standard)
   - `09/15/2026` (US format)
   - `9/15/2026` (short US format)
   - `09152026` (compact)
7. **Maximize workspace**: Click the **←** button in the sidebar footer to collapse navigation
8. **Future-dated projects**: Projects with all tasks starting in the future show as "Not Started" on the dashboard

## Troubleshooting

### Data Disappeared
- Check if you're looking at a saved version instead of the current timeline
- Open DevTools (F12) → Application → Local Storage → find `tlStudio.versions.v1` to see saved versions
- Use Undo (Ctrl+Z) if you accidentally deleted something

### Timeline Not Showing Rows
- Check the eye icon (👁) on the Data tab — hidden rows don't appear on the Timeline tab
- Click the eye icon to toggle visibility

### Export Failed
- Ensure your browser allows downloads (check security settings)
- Try a different browser if the error persists
- File size: Timelines with 500+ rows may take a few seconds to export

### Performance Slow
- Switch to **Compact Mode** to reduce rendering load
- Split large timelines into multiple versions by phase
- Close other tabs to free up browser memory

## Feedback & Feature Requests

Timeline Studio is actively being developed! To request features or report bugs:
- Email: aadyanaik9@gmail.com

### Planned Features
- **User accounts** — Save timelines to the cloud and collaborate
- **Sharing** — Send timelines to teammates with view/edit permissions
- **Real-time sync** — See collaborators' changes as they edit
- **Mobile app** — Responsive design for phones and tablets
- **Integrations** — Sync with Jira, Asana, Google Calendar
- **Advanced analytics** — Critical path, resource leveling, cost tracking

---

---

## Version History

### v1.1.0 (2026-08-10)
**UI/UX Improvements:**
- ✨ Collapsible sidebar on dashboard with persistent state
- ✨ Status-based color-coded cards (Blue, Green, Amber, Red)
- ✨ Professional data table with auto-adjusting columns
- ✨ Enhanced date input with copy/paste support (multiple formats)
- 🐛 Fixed project status calculation for future-dated projects
- 🐛 Improved form field focus states and visual feedback

### v1.0.0 (2026-08-06)
Initial release with core features:
- Timeline creation and management
- Gantt chart visualization
- Version snapshots
- PowerPoint export
- Local storage persistence

---

**Current Version: 1.1.0** | No backend required | All data in your browser | Made with ❤️

*Last updated: 2026-08-10*
