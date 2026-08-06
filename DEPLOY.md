# Deployment Guide - Timeline Studio

## Step 1: Create a GitHub Repository

1. Go to **https://github.com/new**
2. **Repository name**: `project-timeline-studio`
3. **Description**: `Project timeline and Gantt chart management application`
4. Choose **Public** (so Render can access it)
5. Click **Create repository**
6. GitHub will show you commands to push an existing repo. Copy the remote URL.

## Step 2: Push Code to GitHub

Run these commands in PowerShell:

```powershell
cd C:\00-Bhushan\Projects\project-timeline-studio

# Add the remote (replace USERNAME with your GitHub username)
git remote add origin https://github.com/USERNAME/project-timeline-studio.git

# Push to GitHub
git branch -M main
git push -u origin main
```

You should see your code appear on GitHub!

## Step 3: Deploy on Render

1. Go to **https://render.com** and sign up (free account)
2. Click **New +** → **Web Service**
3. **Connect a repository**:
   - Click "Connect your GitHub account" and authorize Render
   - Select `project-timeline-studio` repository
4. **Configure the service**:
   - **Name**: `timeline-studio`
   - **Environment**: `Node`
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/index.js`
   - **Instance Type**: Free

5. **Add environment variables** (very important!):
   - Click **Add Environment Variable** for each:
   
   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | (paste your Neon.tech PostgreSQL URL) |
   | `JWT_ACCESS_SECRET` | (generate: `openssl rand -hex 32`) |
   | `JWT_REFRESH_SECRET` | (generate: `openssl rand -hex 32`) |
   | `NODE_ENV` | `production` |
   | `PORT` | `3000` |
   | `COOKIE_SECURE` | `true` |

6. Click **Create Web Service**

Render will automatically:
- Deploy your code
- Start the server
- Give you a public URL like `https://timeline-studio.onrender.com`

## Step 4: Initialize Database on Render

Once Render shows "Live", run this in PowerShell:

```powershell
$DATABASE_URL = "your-neon-database-url-here"
psql "$DATABASE_URL" -f "C:\00-Bhushan\Projects\project-timeline-studio\server\src\migrations\001_init.sql"
```

## Step 5: Test the Live App

1. Go to your Render URL: `https://timeline-studio.onrender.com`
2. You should see the login/register screen
3. Register with a new account
4. Test the full flow:
   - Create a project
   - Edit the timeline
   - Save a version
   - Log out and log back in
   - Verify data persists

---

## Troubleshooting

### "Build failed"
- Check Render logs: click your service → Logs tab
- Usually missing environment variables

### "Database connection error"
- Verify `DATABASE_URL` is correct in environment variables
- Run the migration SQL again

### "HTTPS certificate error"
- Render auto-generates HTTPS certificates
- May take 5-10 minutes after first deployment
- Try refreshing after a few minutes

---

## Notes

- **Cold starts**: Render's free tier spins down after 15 min of inactivity (30-60s cold start on next request)
- **Auto-deploy**: Every push to `main` branch auto-deploys
- **Free tier limits**: 750 hours/month (should be plenty for testing)
- **Monitoring**: Check Render dashboard for performance metrics

---

**Once deployed, your Timeline Studio is live on the internet!** 🚀
