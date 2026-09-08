# Timeline Studio

A project timeline and Gantt chart tool for planning, tracking, and sharing project schedules — with
user accounts, cloud storage, and a **remote MCP server** so AI assistants can read your project status.

**Live app:** https://timeline-studio-nvjh.onrender.com

---

## Contents

- [What you can do](#what-you-can-do)
- [Part 1 — Get started in 5 minutes (hosted app)](#part-1--get-started-in-5-minutes-hosted-app)
- [Part 2 — Build your first timeline](#part-2--build-your-first-timeline)
- [Part 3 — Run Timeline Studio locally](#part-3--run-timeline-studio-locally)
- [Part 4 — Deploy your own instance](#part-4--deploy-your-own-instance)
- [Part 5 — Connect an MCP client (remote MCP configuration)](#part-5--connect-an-mcp-client-remote-mcp-configuration)
- [Reference](#reference)
- [Troubleshooting](#troubleshooting)

---

## What you can do

✨ **Planning**
- Create swimlanes (phases) and organize tasks and milestones inside them
- Drag-and-drop to reorder rows, or move tasks between phases
- Paste dates in several formats; resize and persist table columns
- Undo/redo with `Ctrl+Z` / `Ctrl+Shift+Z`

📊 **Tracking**
- Status is **calculated automatically** from progress vs. schedule — Not Started, On Track, At Risk,
  Off Track, Complete
- Dashboard status cards and a searchable, sortable project table
- Gantt view with year/month headers, today marker, and compact mode

💾 **Saving & sharing**
- Every account gets cloud storage — projects follow you across devices and browsers
- Named version snapshots grouped by business group, with restore / duplicate / move / bulk delete
- Export to PowerPoint (`.pptx`) or Excel/CSV

🤖 **AI access**
- A built-in MCP server lets Claude (or any MCP client) ask *"what projects am I behind on?"* and get a
  real answer from your live data, after an OAuth login with your Timeline Studio account

🌙 **Comfort**
- Dark mode and a collapsible sidebar, both remembered between visits

---

## Part 1 — Get started in 5 minutes (hosted app)

### Step 1. Open the app

Go to **https://timeline-studio-nvjh.onrender.com**

> The app runs on Render's free tier and sleeps after ~15 minutes of inactivity. The **first** load
> after a nap can take 30–60 seconds. Later loads are fast.

### Step 2. Create your account

1. Click **New User Registration**
2. Enter your email, a display name (optional), and a password that meets **all** of:
   - at least 8 characters
   - at least 1 uppercase letter
   - at least 1 number
   - at least 1 special character from `! @ # $ % ^ & *`
3. Click **Create Account** — we email a **6-digit verification code** to that address
4. Enter the code on the next screen and click **Verify & Continue** to confirm your account and land
   on the Dashboard (valid for 15 minutes; use **Resend code** if it expires or doesn't arrive)

Forgot your password later? Click **Forgot password?** on the login screen, enter your email, and
you'll receive a **6-digit reset code** valid for 15 minutes.

### Step 3. Create your first project

1. On the Dashboard, click **+ New Project**
2. Give it a name and confirm
3. Click the project row to open the editor

### Step 4. Know your way around

| Where | What it's for |
|---|---|
| **Dashboard** | Status cards, project list, search, sort, pagination |
| **Data** tab | The editable table — this is where you add and edit everything |
| **Timeline** tab | The Gantt chart view of the same data |
| **Versions** tab | Saved snapshots of the timeline |
| **⚙ (top right)** | Account settings — change email, change password, import legacy data |
| **🌙 / ☀ (top right)** | Dark mode toggle |

Your work **saves itself** — the dot next to "Saved" in the toolbar flashes while a save is in flight.
There's no Save button for normal edits.

---

## Part 2 — Build your first timeline

### Step 1. Add a phase

On the **Data** tab, click **+ Swimlane** and name it (e.g. *"Phase 1: Discovery"*).
A swimlane is a container — the phase row's dates and progress are derived from the tasks inside it.

### Step 2. Add tasks and milestones

- **+ Task** — a work item with a start date, end date, and % complete
- **+ Milestone** — a point-in-time marker (shown as a diamond on the timeline; *Major Milestone* shows
  as a star)

If you click **+ Task** on an empty project, a swimlane is created for you automatically.

### Step 3. Fill in the columns

| Column | What to enter |
|---|---|
| **Title** | Name of the phase, task, or milestone |
| **Type** | Phase, Task, Milestone, or Major Milestone |
| **Duration** | *Auto-calculated* from start and end |
| **Start** / **End** | Dates — type them or paste (see tip below) |
| **%** | Progress, 0–100 |
| **Assigned to** | Person or team (free text) |
| **Status** | *Auto-calculated* — see below |

💡 **Date paste tip:** click a date field and paste any of `2026-09-15`, `09/15/2026`, `9/15/2026`, or
`09152026`.

### Step 4. Understand the status colors

Status is **derived from your numbers**, not something you set. Timeline Studio compares your actual
`%` against the *planned* progress for today's date:

| Status | Rule |
|---|---|
| ⚪ **Not Started** | 0% complete **and** the start date is in the future |
| 🟢 **On Track** | Actual ≥ planned − 10 points |
| 🟡 **At Risk** | Actual ≥ planned − 20 points |
| 🔴 **Off Track** | Actual is more than 20 points behind plan |
| 🟢 **Complete** | 100% |

**Project status** rolls up from its tasks: nothing started → *Not Started*; any task off track →
*Off Track*; else any at risk → *At Risk*; else any incomplete → *On Track*; all done → *Complete*.

So to move a project to green, either update the `%` or move the dates.

### Step 5. Use the row menu

Click the **⋯** button at the end of any row to:
- Add a row above or below
- Duplicate the row
- Add a note (appears as a label next to the title)
- Hide from timeline (keeps the data, removes the bar from the Gantt view)
- Delete the row

Drag the dotted grip handle on the left edge of a row to reorder it, or to move a task into a
different swimlane.

### Step 6. Check the Gantt view

Switch to the **Timeline** tab. Toggle **Compact** in the top bar to halve row spacing for dense
schedules. Today's date is marked with a red line when it falls inside your range.

### Step 7. Save a version snapshot

Versions are point-in-time copies you can return to.

1. Click **💾 Save version** in the toolbar
2. Give it a name and a **business group** (the grouping used on the Versions tab)
3. Open the **Versions** tab to manage them

On the Versions tab you can switch between tile and list view, sort by date/name/size, select multiple
versions for bulk delete, and use each card's **⋯** menu to **restore**, **overwrite with current**,
**duplicate**, **rename**, or **move to another project**.

### Step 8. Export

Click **⬇ Export** in the toolbar and choose:
- **📑 Export to PowerPoint** — a Gantt slide with bars colored by status
- **📊 Export to Excel** — a flat CSV table of every visible row

Only rows visible on the timeline are exported — unhide anything you want included.

---

## Part 3 — Run Timeline Studio locally

Do this if you want to develop the app or host your own copy.

### Prerequisites

- **Node.js 18+** and npm
- **Git**
- A **PostgreSQL** database — [Neon](https://neon.tech) has a free tier with no credit card

### Step 1. Clone the repository

```bash
git clone https://github.com/bhushanhatwalne/project-timeline-studio.git
cd project-timeline-studio
```

### Step 2. Create a database

1. Sign up at [https://neon.tech](https://neon.tech) and create a project
2. Copy the **pooled connection string**, which looks like:
   ```
   postgresql://user:password@ep-xxxx-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

### Step 3. Configure environment variables

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```ini
DATABASE_URL=postgresql://...        # from Step 2
JWT_ACCESS_SECRET=<random hex>       # openssl rand -hex 32
JWT_REFRESH_SECRET=<random hex>      # openssl rand -hex 32
PORT=3001
NODE_ENV=development
COOKIE_SECURE=false
```

On Windows PowerShell, generate a secret without OpenSSL:

```powershell
-join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Max 256) })
```

Optional — to actually **email** password-reset codes (otherwise the code is only printed to the
server log):

```ini
EMAIL_SERVICE=gmail
EMAIL_USER=you@gmail.com
EMAIL_PASSWORD=<app password, not your account password>
```

### Step 4. Install dependencies

```bash
cd server && npm install
cd ../mcp-server && npm install
```

### Step 5. Start the server

From the `mcp-server` directory:

```bash
npm start
```

You should see:

```
[MIGRATIONS] ✓ Completed
Timeline Studio App & MCP Server running on port 3001
MCP OAuth issuer: http://localhost:3001/
```

Database tables are created automatically on boot. Open **http://localhost:3001** and register an
account.

> **Why `mcp-server` and not `server`?** `mcp-server/server.js` serves the web app, the REST API, **and**
> the MCP endpoints — it's the same entry point production uses. `server/src/index.js` (run from the repo
> root with `npm install && npm start`, port 3000) serves the app and API only, with no MCP.

### Step 6. Create the password-reset table (one-time)

⚠️ Known gap: the migration file for `password_reset_tokens` is empty, so **forgot-password will fail
on a fresh database** until you create the table. Run this once against your database (Neon's SQL
Editor works, or `psql "$DATABASE_URL"`):

```sql
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Skip this if you don't need password reset locally.

### Step 7. Verify the API

```bash
curl http://localhost:3001/api/v1/health
# {"status":"ok"}

curl -i -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!","displayName":"Test User"}'
```

Registration no longer logs you in directly — the account is created unverified and a 6-digit code is
emailed to it. Without `EMAIL_USER`/`EMAIL_PASSWORD` configured, the code comes back in the response
body instead (`verificationCode`) so local testing still works:

```bash
curl -i -c cookies.txt -X POST http://localhost:3001/api/v1/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","code":"<the 6-digit code>"}'

curl -i -b cookies.txt http://localhost:3001/api/v1/auth/me
```

A `201` on register, `200` on `/verify-email`, and `200` on `/me` means the backend is healthy.

---

## Part 4 — Deploy your own instance

### Step 1. Push to GitHub

```bash
git remote add origin https://github.com/<your-username>/project-timeline-studio.git
git branch -M main
git push -u origin main
```

### Step 2. Create the Render web service

1. Sign up at [https://render.com](https://render.com)
2. **New +** → **Web Service** → connect your GitHub repo
3. Configure it as follows — the **root directory matters**:

   | Setting | Value |
   |---|---|
   | Name | `timeline-studio` |
   | Runtime | Node |
   | **Root Directory** | **`mcp-server`** |
   | Build Command | `npm install && cd ../server && npm install` |
   | Start Command | `node server.js` |
   | Instance Type | Free |

   Rooting at `mcp-server` is what gives you the MCP endpoints. Rooting at `server` deploys the app
   without them.

   > ⚠️ The `render.yaml` in this repo is **out of date** (it still points at `server/`). Configure the
   > service in the Render dashboard, or fix the blueprint first.

### Step 3. Add environment variables

| Key | Value |
|---|---|
| `DATABASE_URL` | your Postgres connection string |
| `JWT_ACCESS_SECRET` | random 32-byte hex |
| `JWT_REFRESH_SECRET` | random 32-byte hex |
| `NODE_ENV` | `production` |
| `COOKIE_SECURE` | `true` |
| `EMAIL_USER` / `EMAIL_PASSWORD` | *(optional)* for reset emails |

`PORT` is provided by Render. `PUBLIC_URL` is optional — Render's `RENDER_EXTERNAL_URL` is used
automatically as the OAuth issuer.

### Step 4. Deploy and verify

Click **Create Web Service**. Migrations run on boot. When the service is Live:

1. Open `https://<your-service>.onrender.com` — you should see the login screen
2. Register, create a project, edit it, save a version
3. Log out and back in to confirm the data persisted
4. Run the `password_reset_tokens` SQL from [Part 3, Step 6](#step-6-create-the-password-reset-table-one-time)

Every push to `main` auto-deploys.

---

## Part 5 — Connect an MCP client (remote MCP configuration)

Timeline Studio ships a **remote MCP server** over SSE, protected by **OAuth 2.1 with PKCE**. Your MCP
client logs in with your normal Timeline Studio email and password, and then sees only *your* projects.

**Endpoint:** `https://timeline-studio-nvjh.onrender.com/sse`
(local: `http://localhost:3001/sse`)

### Step 1. Make sure you have a Timeline Studio account

The MCP login page uses the **same credentials as the web app**. Register in the browser first
([Part 1](#part-1--get-started-in-5-minutes-hosted-app)) — there's no sign-up flow inside the OAuth
screen. Create at least one project with tasks, or the tools will return an empty list.

### Step 2A. Configure Claude Code

```bash
claude mcp add --transport sse timeline-studio https://timeline-studio-nvjh.onrender.com/sse
```

Then inside Claude Code:

```
/mcp
```

Select **timeline-studio** and authenticate. Your browser opens the Timeline Studio sign-in page —
enter your email and password, and you'll be redirected back. The connection then shows as connected.

For a local server, use `http://localhost:3001/sse` instead.

### Step 2B. Configure Claude Desktop

Claude Desktop speaks stdio, so bridge to the remote server with `mcp-remote`. Edit your config file:

- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "timeline-studio": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://timeline-studio-nvjh.onrender.com/sse"]
    }
  }
}
```

Restart Claude Desktop. On first use, `mcp-remote` opens a browser window for the Timeline Studio
login, then caches the tokens locally (under `~/.mcp-auth`) and refreshes them automatically.

### Step 2C. Any other MCP client

Point the client at the SSE URL and let it run the standard OAuth 2.1 flow. The server publishes
everything a client needs for discovery and dynamic client registration:

```
GET  /.well-known/oauth-authorization-server
GET  /.well-known/oauth-protected-resource
POST /register              (dynamic client registration)
GET  /authorize             (renders the Timeline Studio sign-in page)
POST /authorize             (email + password submit)
POST /token                 (authorization_code and refresh_token grants)
GET  /sse                   (SSE stream — requires Bearer token)
POST /message?sessionId=…   (client → server messages — requires Bearer token)
```

Details that matter when writing a client:
- **PKCE is required** (`code_challenge_method=S256`)
- Authorization codes expire after **5 minutes**
- Access tokens last **15 minutes**; refresh tokens last **30 days** and are **rotated on every use** —
  store the new refresh token each time
- Registered clients are persisted server-side, so they survive deploys

### Step 3. Verify the connection

Ask your assistant something that needs live data:

> *"Using Timeline Studio, which of my projects are off track and what's the current task on each?"*

It should call **`list_open_projects`** and answer from your real projects. If it says it has no such
tool, the server isn't connected — see [MCP troubleshooting](#mcp-troubleshooting) below.

### Step 4. What the tools do

**Project data (the useful one):**

| Tool | Returns |
|---|---|
| `list_open_projects` | Your projects that aren't fully complete, each with a derived status (`On Track` / `At Risk` / `Off Track` / `Not Started`), the current ongoing task (title, type, status, dates, %, assignee), and `updatedAt`. Scoped to the logged-in user. |

**Development helpers** (useful when working *on* Timeline Studio, not on your schedules):

| Tool | Returns |
|---|---|
| `read_html` | Size and opening excerpt of `project-timeline-studio.html` |
| `extract_javascript` / `extract_css` | The app's embedded JS / CSS (truncated) |
| `list_functions` | Every function declared in the app |
| `analyze_data_structure` | The swimlane / row schema |
| `create_sample_timeline` | Generated fixture data (`swimlanes`, `tasksPerSwimLane`) |
| `get_storage_data` / `save_storage_data` | Read/write scratch JSON under `storage/` |

All tools are **read-only with respect to your projects** — nothing an MCP client does can modify or
delete a timeline today. Write tools are on the roadmap.

### MCP troubleshooting

| Symptom | Fix |
|---|---|
| Browser never opens / connection hangs | The Render free tier may be cold-starting. Wait a minute and retry. |
| `invalid_client` | Your client's cached registration is gone. For `mcp-remote`, delete `~/.mcp-auth` and reconnect. |
| `401` on every call | Access token expired and refresh failed. Re-authenticate (`/mcp` in Claude Code, or clear `~/.mcp-auth`). |
| "Invalid email or password" | These are your **web app** credentials. Confirm them by logging in at the app URL first. |
| `list_open_projects` returns `[]` | You have no incomplete projects — fully complete projects are filtered out by design. |
| Tools missing after a redeploy | Reconnect the client; SSE sessions don't survive a restart. |
| Local server: `SSE session not initialized` | The client posted to `/message` with a stale `sessionId`. Reconnect. |

> **Note for contributors:** the `mcpServers` entry in `.claude/settings.json` is stale — it tries to
> launch `mcp-server/server.js` as a **stdio** server, but that file is now an HTTP/SSE app. Use the
> remote SSE URL as described above.

---

## Reference

### Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+Z` | Undo (60 steps of history) |
| `Ctrl+Shift+Z` or `Ctrl+Y` | Redo |

### Where your data lives

- **Projects, versions, and accounts** live in PostgreSQL on the server. They sync across devices and
  browsers automatically.
- **Only UI preferences** stay in your browser: dark mode, sidebar state, table column widths, and the
  Versions tab view/sort settings.
- Timelines saved in the old standalone (pre-account) version can be imported: open **⚙ Account
  Settings → Import Data from Original App** and follow the two steps there.

### REST API

Cookie-based auth (`httpOnly` access + refresh tokens). All project and version routes are scoped to
the authenticated owner.

```
POST   /api/v1/auth/register             { email, password, displayName? }  → unverified, no cookies yet
POST   /api/v1/auth/verify-email         { email, code }                    → confirms + logs in
POST   /api/v1/auth/resend-verification  { email }
POST   /api/v1/auth/login                { email, password }                → 403 if unverified
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
GET    /api/v1/auth/me
PUT    /api/v1/auth/change-password      { currentPassword, newPassword }
PUT    /api/v1/auth/change-email         { newEmail, password }
POST   /api/v1/auth/forgot-password      { email }
POST   /api/v1/auth/reset-password       { email, token, newPassword }

GET    /api/v1/projects
POST   /api/v1/projects                  { title }
GET    /api/v1/projects/:id
PUT    /api/v1/projects/:id              { swimlanes, projectTitle }
DELETE /api/v1/projects/:id

GET    /api/v1/projects/:id/versions
POST   /api/v1/projects/:id/versions     { name, group }
GET    /api/v1/projects/:id/versions/:verId
PUT    /api/v1/projects/:id/versions/:verId
DELETE /api/v1/projects/:id/versions/:verId
POST   /api/v1/projects/:id/versions/:verId/restore
POST   /api/v1/projects/:id/versions/:verId/overwrite-with-current
POST   /api/v1/projects/:id/versions/:verId/move

GET    /api/v1/health
```

### Browser support

Chrome 90+, Firefox 88+, Safari 14+, Edge 90+. Cookies must be enabled. No mobile layout yet.

### Current limitations

- **No sharing or collaboration** — one owner per project; no view/edit permissions or audit trail
- **No multi-tab sync** — two tabs editing the same project is last-write-wins
- **No mobile layout** — usable on a tablet, cramped on a phone
- **PPTX export is basic**; "Excel" export is really CSV
- **MCP tools are read-only** for project data
- **Free-tier cold starts** of 30–60 seconds after idle
- **Slow rendering** past ~1000 rows

---

## Troubleshooting

### The app takes forever to load
The free Render instance sleeps after ~15 minutes idle. The first request wakes it (30–60 s). Later
requests are fast.

### I got logged out unexpectedly
Access tokens last 15 minutes and refresh silently. If the refresh also fails (long sleep, cleared
cookies, server restart), you're returned to the login screen. Log back in — nothing is lost, since
edits save within a second of being made.

### My edits didn't save
Watch the dot and label next to **Saved** in the toolbar. "Saving…" means in flight; "Save failed —
retrying" means it will retry in 3 seconds. If it stays failed, check your connection and reload — the
last successful save is what the server has. Saves are debounced by ~0.8 s, so don't close the tab the
instant you finish typing (the app also attempts a last-gasp save on unload).

### A project shows the wrong status
Status is computed, never stored. Check the task `%` values and the start/end dates — a task at 40%
that's 70% through its window is *Off Track* by design. Phase rows don't count toward project status;
only tasks do.

### Rows are missing from the Timeline tab
They're hidden. On the **Data** tab, open the row's **⋯** menu and pick **Show on timeline**.

### Export produced an empty file
Only visible rows export. Unhide what you need first. Large timelines can take a few seconds.

### Password reset says something went wrong
Two likely causes: the `password_reset_tokens` table doesn't exist on your instance (see
[Part 3, Step 6](#step-6-create-the-password-reset-table-one-time)), or `EMAIL_USER` /
`EMAIL_PASSWORD` aren't configured, in which case the code is written to the server log instead of
being emailed.

### "Missing required environment variable"
`server/.env` is missing `DATABASE_URL`, `JWT_ACCESS_SECRET`, or `JWT_REFRESH_SECRET`. The server
refuses to boot without all three.

### `ECONNREFUSED` or SSL errors connecting to the database
Use Neon's **pooled** connection string and keep `?sslmode=require` on the end.

### Performance is sluggish
Turn on **Compact** mode, hide finished phases, or split a very large plan across projects.

---

## Contributing

The frontend is one file with no build step: edit `project-timeline-studio.html` and refresh the
browser. If you work through the `server/` entry point, copy your changes to `server/public/index.html`
too — production serves the root file directly.

See [`CLAUDE.md`](CLAUDE.md) for architecture, the two server entry points, the derived-status rules,
migration conventions, and known gaps. Deeper design notes live in [`docs/`](docs/).

## Feedback

Feature requests and bug reports: **bhushan.hatwalne@gmail.com**

### On the roadmap
- Sharing with view/edit permissions, and an audit trail
- Real-time collaboration
- Session hardening: single active session, idle logout, lockout after repeated failed logins
- Responsive mobile layout
- Row search/filter and bulk edit
- Write-capable MCP tools (create and update timelines from an assistant)
- Dependency chains, critical path, resource leveling, budget tracking
- Google Calendar / Outlook sync and Slack notifications

---

## Version history

### v1.2.0 (2026-08-26)
- 🤖 **Remote MCP server** — OAuth 2.1 + PKCE over SSE, with `list_open_projects` returning live,
  per-user project status
- 🔐 MCP login reuses Timeline Studio accounts; OAuth client registrations persist across deploys
- 🐛 Fixed MCP concurrent SSE connections, `POST /message` body handling, and expired tokens returning
  500 instead of 401
- 🐛 `list_open_projects` now derives status the same way the UI does

### v1.1.0 (2026-08-10)
- ☁️ **Accounts and cloud storage** — Express + PostgreSQL backend, JWT cookie auth, autosave
- 📊 Dashboard with status cards, search, sort, and pagination
- 🌙 Dark mode; collapsible sidebar; resizable data-table columns
- 📥 Excel/CSV export alongside PowerPoint
- 🔑 Forgot-password flow with emailed reset codes
- 🐛 Fixed project status calculation for future-dated projects

### v1.0.0 (2026-08-06)
- Timeline creation, Gantt visualization, version snapshots, PowerPoint export, localStorage
  persistence

---

**Current version: 1.2.0** · Full-stack on Render + Neon · MCP-enabled

*Last updated: 2026-08-26*
