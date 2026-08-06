# Skill: Timeline Export & Integrations

## Overview
Guidance for expanding export capabilities and integrating Timeline Studio with external tools and platforms.

## When to Use This Skill
When implementing:
- Enhanced export formats (PDF, SVG, JSON)
- Calendar integrations (Google Calendar, Outlook)
- Issue tracker sync (Jira, Asana, Linear)
- Slack notifications
- Email reports
- API webhooks

## Current Export: PowerPoint (PPTX)

**Status**: Working | **Library**: pptxgen.js@3.12.0

### How It Works
```javascript
function exportPptx() {
  const prs = new PptxGenJS();
  const rows = allRows();
  
  swimlanes.forEach((sl, idx) => {
    const slide = prs.addSlide();
    // Add swimlane title, task bars, legend
  });
  
  prs.save({ fileName: `timeline-${projectTitle}.pptx` });
}
```

**Limitations**:
- Colors and fonts simplified
- Large timelines (100+ rows) create unwieldy presentations
- No interactive elements (viewer can't edit)

## Easy Wins (No Backend Required)

### 1. Export to JSON
```javascript
function exportJson() {
  const data = {
    projectTitle,
    swimlanes,
    exportedAt: new Date().toISOString(),
    format: "timeline-studio-v1"
  };
  
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `timeline-${projectTitle}-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Add button to toolbar:
// <button class="btn" onclick="exportJson()">⬇ Export JSON</button>
```

**Effort**: 1 hour | **Value**: Medium (data portability) | **Use Case**: Backup/migration

### 2. Import from JSON
```javascript
function importJson(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (data.format !== 'timeline-studio-v1') {
        alert('Invalid file format');
        return;
      }
      
      if (!confirm(`Load "${data.projectTitle}"? Current unsaved changes will be lost.`)) return;
      
      pushHistory();
      projectTitle = data.projectTitle;
      swimlanes = data.swimlanes;
      saveFlash();
      render();
    } catch (err) {
      alert('Error parsing file: ' + err.message);
    }
  };
  reader.readAsText(file);
}

// Add file input:
// <input type="file" accept=".json" onchange="importJson(this.files[0])" />
```

**Effort**: 2 hours | **Value**: High (backup restore) | **Use Case**: Backup restore

### 3. Export to Markdown Table
```javascript
function exportMarkdown() {
  const rows = allRows();
  let md = `# ${escapeHtml(projectTitle)}\n\n`;
  
  let currentSwimlane = null;
  rows.forEach(r => {
    if (currentSwimlane !== r.swimlaneId) {
      currentSwimlane = r.swimlaneId;
      const sl = swimlanes.find(s => s.id === r.swimlaneId);
      md += `## ${escapeHtml(sl.name)}\n\n`;
      md += '| Title | Type | Start | End | % | Status |\n';
      md += '|-------|------|-------|-----|----|--------|\n';
    }
    
    const row = r.row;
    md += `| ${escapeHtml(row.title)} | ${row.type} | ${row.start} | ${row.end} | ${row.percent}% | ${row.status} |\n`;
  });
  
  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `timeline-${projectTitle}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
```

**Effort**: 2 hours | **Value**: Medium (sharing via GitHub/Slack) | **Use Case**: Documentation

### 4. Export to iCal (Calendar)
```javascript
function exportIcal() {
  const rows = allRows().filter(r => r.row.type !== 'phase' && r.row.visible);
  
  let ical = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Timeline Studio//NONSGML v1.0//EN
CALSCALE:GREGORIAN
X-WR-CALNAME:${escapeHtml(projectTitle)}
X-WR-TIMEZONE:UTC

`;

  rows.forEach(r => {
    const row = r.row;
    const startDate = row.start.replace(/-/g, '');
    const endDate = row.end.replace(/-/g, '');
    
    ical += `BEGIN:VEVENT
UID:${row.id}@timeline-studio
DTSTAMP:${new Date().toISOString().replace(/[:-]/g, '')}
DTSTART;VALUE=DATE:${startDate}
DTEND;VALUE=DATE:${endDate}
SUMMARY:${escapeHtml(row.title)}
DESCRIPTION:${escapeHtml(row.assignedTo || '')}
STATUS:${row.status === 'complete' ? 'CONFIRMED' : 'TENTATIVE'}
END:VEVENT

`;
  });
  
  ical += 'END:VCALENDAR';
  
  const blob = new Blob([ical], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `timeline-${projectTitle}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
```

**Effort**: 3 hours | **Value**: High (calendar integration) | **Use Case**: Sync to Google Calendar, Outlook, Apple Calendar

### 5. Export to SVG
```javascript
function exportSvg() {
  // Re-render the timeline view as SVG instead of HTML/CSS
  // This is complex but gives a vector-based output that scales infinitely
  // Libraries like D3.js or Vega can help here
  
  // Simplified approach: use html2svg library
  // https://github.com/uselesscode/html2svg
}
```

**Effort**: 6 hours | **Value**: Medium (shareable, web-friendly) | **Use Case**: Embed in websites

## Medium-Effort: API Exports

### 6. Google Workspace Add-on
Embed Timeline Studio in Google Sheets/Docs:
- User installs add-on
- Add-on fetches project data via API
- Inserts timeline summary into doc
- Can bi-directionally sync edits

**Effort**: 20-30 hours | **Value**: High (enterprise use) | **Use Case**: Corporate integration

### 7. Zapier / Make Integration
Enable trigger-action workflows:
- **Trigger**: "When a milestone is marked complete in Timeline Studio"
- **Actions**: Send Slack message, create Jira issue, send email, etc.

**How**:
1. Register as Zapier app partner
2. Expose webhook endpoints for version saves, status changes, milestone hits
3. Users create Zaps in Zapier UI without coding

**Effort**: 15-20 hours | **Value**: High (automation) | **Use Case**: Cross-tool workflows

## Hard: Real-Time Integrations

### 8. Jira Sync
Two-way sync: Timeline Studio ↔ Jira Tasks

```javascript
// When user marks task complete in Timeline Studio:
async function onTaskComplete(row) {
  if (row.jiraKey) {
    // Transition issue in Jira
    const response = await fetch(`https://api.atlassian.com/agile/1.0/issues/${row.jiraKey}/transitions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jiraToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ transition: { id: '31' } }) // Done status
    });
  }
}

// Polling: Check Jira for updates every 5 minutes
setInterval(async () => {
  const jiraIssues = await fetchJiraEpicIssues(epicKey);
  // Compare with local swimlanes, sync status/dates if changed
}, 5 * 60 * 1000);
```

**Effort**: 30-40 hours | **Value**: Very High (agile team adoption) | **Use Case**: Enterprise agile teams

### 9. Google Calendar Sync
Bi-directional sync of milestones:
```javascript
// On milestone save, create Google Calendar event
async function syncMilestoneToGoogleCalendar(milestone) {
  const event = {
    summary: milestone.title,
    start: { date: milestone.start },
    end: { date: milestone.end },
    description: `Milestone in Timeline Studio project: ${projectTitle}`
  };
  
  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${googleToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(event)
  });
  
  if (response.ok) {
    const created = await response.json();
    milestone.googleCalendarEventId = created.id; // Store link for updates
  }
}
```

**Effort**: 15-20 hours | **Value**: Medium-High (calendar teams) | **Use Case**: Scheduling

## Webhook Architecture (For Backend)

```
Timeline Studio ← API Webhooks → External Services
                                  - Slack
                                  - Email
                                  - Jira
                                  - Google Calendar
                                  - Custom apps
```

### Webhook Events to Support
```javascript
const WEBHOOK_EVENTS = [
  'version.created',      // User saved a new version
  'timeline.updated',     // Changes to current timeline
  'task.status_changed',  // Task moved to new status
  'milestone.reached',    // Milestone date == today
  'phase.completed',      // All tasks in phase are complete
];

// User registers webhook:
// POST /api/webhooks
// { url: "https://example.com/my-webhook", events: ["task.status_changed"] }

// When task status changes:
// POST https://example.com/my-webhook
// { event: "task.status_changed", data: { taskId, oldStatus, newStatus, timestamp } }
```

**Effort**: 15-20 hours (backend) | **Value**: Very High (extensibility) | **Use Case**: Custom integrations

## Implementation Roadmap

### Phase 1: Easy Wins (1-2 weeks)
- [ ] Export JSON (1h)
- [ ] Import JSON (2h)
- [ ] Export Markdown (2h)
- [ ] Export iCal (3h)

### Phase 2: Medium (3-4 weeks)
- [ ] SVG export (6h)
- [ ] Zapier integration (15-20h)
- [ ] Webhook infrastructure (15-20h)

### Phase 3: Deep Integrations (2-3 months)
- [ ] Jira sync (30-40h)
- [ ] Google Calendar bi-directional (15-20h)
- [ ] Microsoft Project/Teams integration (20-30h)

## Testing Each Export Format

```javascript
// Test checklist for each export format:
// [ ] File downloads with correct name
// [ ] File opens in expected application
// [ ] Data integrity (all rows, correct dates, colors)
// [ ] Performance (< 5s for 500+ rows)
// [ ] Large timelines don't crash
// [ ] Special characters (accents, emoji) don't break format
// [ ] Re-importing preserves structure
```

## Libraries & Services

### Useful Libraries
- **CSV**: Papa Parse (csv-parse)
- **Excel**: SheetJS (xlsx)
- **PDF**: PDFKit, html2pdf
- **iCal**: ical.js
- **SVG**: D3.js, Vega, Plotly
- **Google API**: google-auth-library-nodejs
- **Slack**: @slack/bolt
- **Jira**: jira.js

### External Services
- **Calendar APIs**: Google Calendar, Microsoft Graph, Apple iCloud
- **Messaging**: Slack API, Microsoft Teams, Discord
- **Issue Tracking**: Jira Cloud API, GitHub API, Linear API
- **Automation**: Zapier, Make (n8n), IFTTT
- **Email**: SendGrid, Mailgun, AWS SES

---

**Status**: Planning | **Priority**: Medium-High | **Scalability**: Modular (add one at a time)
