# Timeline Studio - Regression Test Script

**Version:** 1.1.0  
**Date:** 2026-08-10  
**Last Updated:** 2026-08-10

---

## Test Execution Guidelines

- ✅ **Pass**: Feature works as expected
- ❌ **Fail**: Feature broken or doesn't match specification
- ⏭️ **Skip**: Not applicable for this build
- 🔄 **Regression**: Previously working feature broken

**Test Environment:**
- Browser: Chrome/Firefox/Safari (latest)
- Screen Resolution: 1920x1080 (also test on 1366x768)
- Network: Online (with backend running)
- Database: Fresh test data

---

## 1. AUTHENTICATION & LOGIN

### TC-AUTH-001: User Registration
- **Steps:**
  1. Navigate to app
  2. Click "New User Registration"
  3. Enter email, password (min 8 chars, uppercase, number, special char)
  4. Enter display name
  5. Click "Create Account"
- **Expected:** User account created, logged in, redirected to dashboard

### TC-AUTH-002: User Login
- **Steps:**
  1. Navigate to app
  2. Enter existing email and password
  3. Click "Login"
- **Expected:** User logged in, dashboard displays

### TC-AUTH-003: Invalid Credentials
- **Steps:**
  1. Enter wrong password
  2. Click "Login"
- **Expected:** Error message: "Login failed. Please check your email/password."

### TC-AUTH-004: Logout
- **Steps:**
  1. Click user avatar (top-right)
  2. Click "Log Out"
- **Expected:** User logged out, redirected to login screen

### TC-AUTH-005: Password Requirements
- **Steps:**
  1. Try password without uppercase: "password123!"
  2. Try password without number: "Password!"
  3. Try password without special char: "Password123"
  4. Try password less than 8 chars: "Pass1!"
- **Expected:** Each fails with validation message

---

## 2. DASHBOARD

### TC-DASH-001: Dashboard Loads
- **Steps:**
  1. Login successfully
  2. Observe dashboard
- **Expected:** 
  - Sidebar visible with logo and menu items
  - 4 status cards visible (Total, On Track, At Risk, Off Track)
  - Project table below with columns: Project, Status, Progress, Updated

### TC-DASH-002: Status Card Colors
- **Steps:**
  1. Verify color of each card
- **Expected:**
  - Total Projects: Light blue background (#E8F4FF) with blue border
  - On Track: Light green (#E6F4EA) with green border
  - At Risk: Light amber (#FFF3E0) with orange border
  - Off Track: Light red (#FFEBEE) with red border

### TC-DASH-003: Sidebar Collapse Toggle
- **Steps:**
  1. Scroll to bottom of sidebar
  2. Click the white **←** button
  3. Sidebar should collapse to 70px
  4. Click **→** to expand
- **Expected:**
  - Collapsed: Only emoji icons visible, text hidden
  - Expanded: Full menu text visible
  - Toggle icon changes from « to »
  - State persists on refresh

### TC-DASH-004: Project Selection
- **Steps:**
  1. Click on a project in the table
- **Expected:** Project editor opens with Data tab active

### TC-DASH-005: Create New Project
- **Steps:**
  1. Click **+ New Project** button
  2. Enter project name
- **Expected:** New project created, editor opens

### TC-DASH-006: Duplicate Project
- **Steps:**
  1. Click project row's **⋮** menu
  2. Click "📋 Duplicate"
- **Expected:** New project created with "(Copy)" suffix, listed in table

### TC-DASH-007: Rename Project
- **Steps:**
  1. Click project row's **⋮** menu
  2. Click "✏️ Rename"
  3. Enter new name
  4. Click "Save Changes"
- **Expected:** Project name updated in table

### TC-DASH-008: Delete Project
- **Steps:**
  1. Click project row's **⋮** menu
  2. Click "🗑️ Delete"
  3. Confirm deletion
- **Expected:** Project removed from dashboard

---

## 3. DATA TAB - TABLE LAYOUT

### TC-DATA-001: Table Columns Display
- **Steps:**
  1. Open a project
  2. Verify all columns visible
- **Expected:** Title, Type, Duration, Start, End, %, Assigned to, Status, Action icons

### TC-DATA-002: Column Auto-Adjusting Width
- **Steps:**
  1. Resize browser window to different widths (1920px, 1366px, 768px)
  2. Observe column behavior
- **Expected:** Columns adjust proportionally, no horizontal scroll until very narrow

### TC-DATA-003: Column Resizing (User Drag)
- **Steps:**
  1. Hover over column border in header
  2. Drag right/left
- **Expected:** Column width changes, adjacent columns adjust

### TC-DATA-004: Drag-and-Drop Reorder
- **Steps:**
  1. Click drag handle (☶) on a row
  2. Drag up/down within swimlane
- **Expected:** Row reorders, list updates instantly

### TC-DATA-005: Swimlane Drag-and-Drop
- **Steps:**
  1. Drag swimlane header
- **Expected:** Swimlane moves to new position

---

## 4. DATA TAB - INPUT FIELDS

### TC-INPUT-001: Title Editing
- **Steps:**
  1. Click on Title field
  2. Edit text
  3. Click outside or press Enter
- **Expected:** Changes saved, auto-saved indicator shows

### TC-INPUT-002: Date Input - Manual Entry
- **Steps:**
  1. Click Start date field
  2. Type date (browser date picker)
  3. Confirm
- **Expected:** Date accepted, duration updates

### TC-INPUT-003: Date Input - Copy/Paste (YYYY-MM-DD)
- **Steps:**
  1. Copy: `2026-12-25`
  2. Paste into date field
- **Expected:** Date accepted, field updates

### TC-INPUT-004: Date Input - Copy/Paste (MM/DD/YYYY)
- **Steps:**
  1. Copy: `12/25/2026`
  2. Paste into date field
- **Expected:** Converted to YYYY-MM-DD format, accepted

### TC-INPUT-005: Date Input - Copy/Paste (M/D/YYYY)
- **Steps:**
  1. Copy: `9/15/2026`
  2. Paste into date field
- **Expected:** Converted to YYYY-MM-DD, accepted

### TC-INPUT-006: Date Input - Copy/Paste (MMDDYYYY)
- **Steps:**
  1. Copy: `12252026`
  2. Paste into date field
- **Expected:** Converted to YYYY-MM-DD, accepted

### TC-INPUT-007: Percentage Input
- **Steps:**
  1. Click % field
  2. Enter value 0-100
- **Expected:** Value accepted, status updates

### TC-INPUT-008: Type Dropdown
- **Steps:**
  1. Click Type dropdown
  2. Select different type (Task, Milestone, Major Milestone, Phase)
- **Expected:** Type changes, icon updates

### TC-INPUT-009: Assigned To Field
- **Steps:**
  1. Click field
  2. Type name
- **Expected:** Name accepted, field truncates with ellipsis if too long

### TC-INPUT-010: Status Auto-Calculation
- **Steps:**
  1. Set percent to 100%
  2. Verify status is "Complete"
  3. Set percent to 0%, start date to future
  4. Verify status is "Not Started"
  5. Set percent to 50%, start date to past
  6. Verify status shows "On Track" or other based on variance
- **Expected:** All status calculations match specification

---

## 5. DATA TAB - ADD/DELETE ROWS

### TC-ROWS-001: Add Swimlane
- **Steps:**
  1. Click **+ Swimlane**
  2. Verify new swimlane appears
- **Expected:** New swimlane with placeholder name, no tasks

### TC-ROWS-002: Add Task to Swimlane
- **Steps:**
  1. Click **+ Task** within swimlane
- **Expected:** New task added, visible in table

### TC-ROWS-003: Add Milestone
- **Steps:**
  1. Click **+ Milestone**
  2. Verify type is "Milestone"
- **Expected:** New milestone created

### TC-ROWS-004: Add Row Above/Below
- **Steps:**
  1. Click **⋮** on a row
  2. Select "Add above" or "Add below"
- **Expected:** New row inserted in correct position

### TC-ROWS-005: Duplicate Row
- **Steps:**
  1. Click **⋮**
  2. Click "Duplicate"
- **Expected:** Exact copy created below original

### TC-ROWS-006: Delete Row
- **Steps:**
  1. Click **⋮**
  2. Click "Delete"
  3. Confirm
- **Expected:** Row removed, swimlane updates

### TC-ROWS-007: Hide Row (Eye Icon)
- **Steps:**
  1. Click eye icon (👁) in row
  2. Icon changes to 🚫
  3. Switch to Timeline tab
- **Expected:** Row hidden from timeline but still in Data tab

### TC-ROWS-008: Show Row
- **Steps:**
  1. Click 🚫 icon to restore visibility
- **Expected:** Eye icon returns, row visible on Timeline

---

## 6. STATUS CALCULATION

### TC-STATUS-001: Not Started (Future Date)
- **Steps:**
  1. Create task with 0% and start date in future
  2. Check status on Data tab
  3. Check project status on Dashboard
- **Expected:** Status = "Not Started", project = "Not Started"

### TC-STATUS-002: On Track (Good Progress)
- **Steps:**
  1. Create task: Start = 30 days ago, End = 30 days from now, Percent = 50%
  2. Check status
- **Expected:** Status = "On Track"

### TC-STATUS-003: At Risk (Slightly Behind)
- **Steps:**
  1. Create task: Start = 60 days ago, End = 30 days away, Percent = 20%
  2. Check status
- **Expected:** Status = "At Risk"

### TC-STATUS-004: Off Track (Very Behind)
- **Steps:**
  1. Create task: Start = 90 days ago, End = 10 days away, Percent = 10%
  2. Check status
- **Expected:** Status = "Off Track"

### TC-STATUS-005: Complete (100%)
- **Steps:**
  1. Set percent to 100%
- **Expected:** Status = "Complete"

### TC-STATUS-006: Project Status - All Started Tasks
- **Steps:**
  1. Create 3 tasks with past start dates, various percents
  2. Check project status on Dashboard
- **Expected:** Status based on worst task variance

### TC-STATUS-007: Project Status - Mixed (Started + Future)
- **Steps:**
  1. Create 2 tasks: one started (50%), one future (0%)
  2. Check project status
- **Expected:** Status based on started task, not future task

### TC-STATUS-008: Future Project Shows "Not Started"
- **Steps:**
  1. Duplicate a project with all tasks dated in future
  2. Verify Dashboard shows "Not Started"
- **Expected:** Project status = "Not Started", not "On Track"

---

## 7. TIMELINE VIEW

### TC-TIMELINE-001: Timeline Renders
- **Steps:**
  1. Add tasks with dates spanning multiple months
  2. Click Timeline tab
- **Expected:** Gantt chart displays with year/month headers

### TC-TIMELINE-002: Task Bars Display
- **Steps:**
  1. Verify bars for each task
- **Expected:** Bars span start to end date, colored by status

### TC-TIMELINE-003: Status Colors on Timeline
- **Steps:**
  1. Verify colors match status
- **Expected:** Complete = green, On Track = blue, At Risk = amber, etc.

### TC-TIMELINE-004: Today Line
- **Steps:**
  1. Create task spanning today
  2. View Timeline
- **Expected:** Red vertical line marking "Today"

### TC-TIMELINE-005: Compact Mode Toggle
- **Steps:**
  1. Click Compact button
  2. Row heights decrease by ~50%
  3. Click again to expand
- **Expected:** Toggles row height, saves preference

### TC-TIMELINE-006: Milestone Display
- **Steps:**
  1. Add Milestone type
  2. View on Timeline
- **Expected:** Diamond marker visible

### TC-TIMELINE-007: Major Milestone Display
- **Steps:**
  1. Add Major Milestone type
  2. View on Timeline
- **Expected:** Star marker visible

---

## 8. VERSIONS TAB

### TC-VER-001: Save Version
- **Steps:**
  1. Edit timeline
  2. Click **💾 Save version**
  3. Enter name and group
  4. Click Save
- **Expected:** Version saved, card appears in Versions tab

### TC-VER-002: Load Version
- **Steps:**
  1. Go to Versions tab
  2. Click version card
  3. Click "Load"
- **Expected:** Timeline restored to that version, Data tab opens

### TC-VER-003: Overwrite Version
- **Steps:**
  1. Edit timeline
  2. Click version's **⋮** menu
  3. Select "Overwrite"
- **Expected:** Version updated with current changes

### TC-VER-004: Duplicate Version
- **Steps:**
  1. Click **⋮** on version card
  2. Select "Duplicate"
- **Expected:** New version created with "(Copy)" suffix

### TC-VER-005: Rename Version
- **Steps:**
  1. Click **⋮**
  2. Select "Rename"
  3. Enter new name
- **Expected:** Version name updated

### TC-VER-006: Delete Version
- **Steps:**
  1. Click **⋮**
  2. Select "Delete"
  3. Confirm
- **Expected:** Version removed

### TC-VER-007: Group Organization
- **Steps:**
  1. Save multiple versions with different groups (e.g., "Design", "Dev")
  2. Verify grouping in Versions tab
- **Expected:** Versions organized by group with collapsible headers

---

## 9. UNDO/REDO

### TC-UNDO-001: Undo Single Change
- **Steps:**
  1. Make a change (edit title)
  2. Press Ctrl+Z
- **Expected:** Change reverted

### TC-UNDO-002: Undo Multiple Changes
- **Steps:**
  1. Make 3 changes
  2. Press Ctrl+Z three times
- **Expected:** All changes reverted in reverse order

### TC-UNDO-003: Redo Change
- **Steps:**
  1. Undo a change
  2. Press Ctrl+Shift+Z
- **Expected:** Change reapplied

### TC-UNDO-004: Redo Multiple Changes
- **Steps:**
  1. Undo 3 changes
  2. Redo 2 changes
- **Expected:** 2 changes reapplied

### TC-UNDO-005: Undo Limit (60 steps)
- **Steps:**
  1. Make 70 small changes
  2. Press Ctrl+Z repeatedly
- **Expected:** Can undo last 60 changes, earlier ones lost

---

## 10. EXPORT

### TC-EXPORT-001: Export to PowerPoint
- **Steps:**
  1. Click **⬇ Export PPTX**
  2. Save file
- **Expected:** File downloads as .pptx

### TC-EXPORT-002: PPTX Content
- **Steps:**
  1. Open exported .pptx in PowerPoint
  2. Verify slides
- **Expected:** One slide per swimlane, timeline bars rendered

### TC-EXPORT-003: PPTX Colors
- **Steps:**
  1. Check bar colors in presentation
- **Expected:** Colors match status (at least approximately)

---

## 11. AUTO-SAVE

### TC-SAVE-001: Auto-Save Indicator
- **Steps:**
  1. Edit field
  2. Watch for auto-save indicator
- **Expected:** Changes auto-save within 2 seconds

### TC-SAVE-002: Persistence Across Refresh
- **Steps:**
  1. Add swimlane and task
  2. Refresh page (F5)
- **Expected:** Data persists

### TC-SAVE-003: Persistence Across Tab Close
- **Steps:**
  1. Add swimlane
  2. Close tab
  3. Reopen project
- **Expected:** Swimlane still exists

### TC-SAVE-004: localStorage Size Check
- **Steps:**
  1. Create very large timeline (500+ rows)
  2. Attempt to save
- **Expected:** Saves successfully or warns if nearing limit

---

## 12. BROWSER COMPATIBILITY

### TC-BROWSER-001: Chrome
- **Steps:** Run all critical tests on latest Chrome
- **Expected:** All pass

### TC-BROWSER-002: Firefox
- **Steps:** Run all critical tests on latest Firefox
- **Expected:** All pass

### TC-BROWSER-003: Safari
- **Steps:** Run all critical tests on latest Safari
- **Expected:** All pass

### TC-BROWSER-004: Edge
- **Steps:** Run all critical tests on Edge
- **Expected:** All pass

---

## 13. RESPONSIVE DESIGN

### TC-RESP-001: Desktop (1920x1080)
- **Steps:** Open app, verify layout
- **Expected:** All elements visible, sidebar on left

### TC-RESP-002: Tablet (1024x768)
- **Steps:** Resize or use tablet device
- **Expected:** Layout adapts, still usable

### TC-RESP-003: Mobile (375x667)
- **Steps:** Resize or use mobile device
- **Expected:** Sidebar collapses or adapts (future feature)

---

## 14. PERFORMANCE

### TC-PERF-001: Table Rendering (100 rows)
- **Steps:** Create timeline with 100 rows, open Data tab
- **Expected:** Loads within 2 seconds

### TC-PERF-002: Table Rendering (500 rows)
- **Steps:** Create timeline with 500 rows
- **Expected:** Loads within 5 seconds, still responsive

### TC-PERF-003: Timeline Rendering (100 rows)
- **Steps:** Switch to Timeline tab with 100 tasks
- **Expected:** Renders within 2 seconds

### TC-PERF-004: Undo Performance
- **Steps:** Undo 30 changes rapidly
- **Expected:** Each undo is instant

---

## 15. EDGE CASES & VALIDATION

### TC-EDGE-001: Empty Title
- **Steps:** Leave title blank
- **Expected:** Either fills with default or allows blank

### TC-EDGE-002: Invalid Date Range (End Before Start)
- **Steps:** Set End date before Start date
- **Expected:** Either auto-corrects or shows warning

### TC-EDGE-003: Percent > 100%
- **Steps:** Enter 150 in % field
- **Expected:** Either caps at 100 or allows with warning

### TC-EDGE-004: Long Title (500 chars)
- **Steps:** Paste very long text in Title
- **Expected:** Truncates with ellipsis or wraps gracefully

### TC-EDGE-005: Special Characters in Title
- **Steps:** Type: `Project #1 & "Stuff" (test) [draft]`
- **Expected:** Saved and displayed correctly

### TC-EDGE-006: Emoji in Title
- **Steps:** Paste emoji: `🚀 Launch Project`
- **Expected:** Displays correctly

### TC-EDGE-007: Same Start/End Date
- **Steps:** Set both to same date
- **Expected:** Duration shows 0 or 1 day, no error

### TC-EDGE-008: Very Old Dates (1900)
- **Steps:** Set date to 1900-01-01
- **Expected:** Accepted, displays correctly

### TC-EDGE-009: Far Future Dates (2100)
- **Steps:** Set date to 2100-12-31
- **Expected:** Accepted, displays correctly

---

## 16. DATA INTEGRITY

### TC-DATA-001: No Data Loss on Disconnect
- **Steps:**
  1. Start editing
  2. Simulate offline (DevTools > Network > Offline)
  3. Complete edit
  4. Go back online
- **Expected:** Data not lost, syncs when connection restored

### TC-DATA-002: No Duplicate Rows on Double-Click
- **Steps:**
  1. Double-click **+ Task** rapidly
- **Expected:** Only one row added

### TC-DATA-003: Concurrent Edit Prevention
- **Steps:**
  1. Open same project in two tabs
  2. Edit in both simultaneously
- **Expected:** Last write wins (no error), or warning shown

---

## 17. REGRESSION - PREVIOUSLY FIXED BUGS

### TC-REG-001: Status Shows "On Track" for Future Projects ✅ FIXED
- **Steps:**
  1. Duplicate a project
  2. Change ALL task dates to future
  3. Check Dashboard status
- **Expected:** Status = "Not Started", NOT "On Track"

### TC-REG-002: Date Input Copy/Paste ✅ FIXED
- **Steps:**
  1. Copy date in format: 09/15/2026
  2. Paste into date field
- **Expected:** Accepted and converted to YYYY-MM-DD

### TC-REG-003: Sidebar Toggle Visibility ✅ FIXED
- **Steps:**
  1. Collapse sidebar using **←** button
- **Expected:** Button visible, sidebar collapses properly

---

## Test Results Summary

| Category | Total Tests | Passed | Failed | Skipped | Notes |
|----------|-----------|--------|--------|---------|-------|
| Authentication | 5 | _ | _ | _ | |
| Dashboard | 8 | _ | _ | _ | |
| Data Table | 5 | _ | _ | _ | |
| Input Fields | 10 | _ | _ | _ | |
| Rows | 8 | _ | _ | _ | |
| Status | 8 | _ | _ | _ | |
| Timeline | 7 | _ | _ | _ | |
| Versions | 7 | _ | _ | _ | |
| Undo/Redo | 5 | _ | _ | _ | |
| Export | 3 | _ | _ | _ | |
| Auto-Save | 4 | _ | _ | _ | |
| Browser | 4 | _ | _ | _ | |
| Responsive | 3 | _ | _ | _ | |
| Performance | 4 | _ | _ | _ | |
| Edge Cases | 9 | _ | _ | _ | |
| Data Integrity | 3 | _ | _ | _ | |
| Regression | 3 | _ | _ | _ | |
| **TOTAL** | **123** | **_** | **_** | **_** | |

---

## Sign-Off

**Tested By:** ________________  
**Date:** ________________  
**Overall Result:** ☐ PASS ☐ FAIL ☐ PASS WITH ISSUES

**Critical Issues Found:**
- [ ] None
- [ ] List below:

---

**Approved By:** ________________  
**Date:** ________________
