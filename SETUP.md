# Setup Instructions for Phase 1 Implementation

## Step 1: Set Up Neon.tech Database

1. Go to [https://neon.tech](https://neon.tech) and create a free account (no credit card required)
2. Create a new project
3. In the Neon console, copy the **Pooled Connection String** (should look like):
   ```
   postgresql://neondb_owner:PASSWORD@ep-wild-dream-awuswj2x.c-12.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
4. Save this URL — you'll need it in the next step

## Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp server/.env.example server/.env
   ```

2. Edit `server/.env` and fill in the values:
   - **DATABASE_URL**: Paste the Neon connection string from Step 1
   - **JWT_ACCESS_SECRET**: Generate a random secret:
     ```bash
     openssl rand -hex 32
     ```
   - **JWT_REFRESH_SECRET**: Generate another random secret:
     ```bash
     openssl rand -hex 32
     ```
   - Leave other values as-is for local development

## Step 3: Initialize the Database

1. Install `psql` if you don't have it (PostgreSQL client tools)
   - On macOS: `brew install postgresql`
   - On Windows: Download from https://www.postgresql.org/download/windows/
   - On Linux: `sudo apt-get install postgresql-client`

2. Run the migration:
   ```bash
   psql "$DATABASE_URL" -f server/src/migrations/001_init.sql
   ```

3. Verify the tables were created (optional):
   ```bash
   psql "$DATABASE_URL" -c "SELECT tablename FROM pg_tables WHERE schemaname='public';"
   ```

## Step 4: Test the Backend

1. Start the development server:
   ```bash
   cd server
   npm run dev
   ```

2. You should see:
   ```
   🚀 Timeline Studio server running on port 3000
   Environment: development
   ```

3. In a **separate terminal**, test the auth endpoints (see VERIFICATION in the plan for full curl tests):
   ```bash
   # Test registration
   curl -i -c cookies.txt -X POST http://localhost:3000/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"TestPass123!","displayName":"Test User"}'
   
   # Test /me endpoint
   curl -i -b cookies.txt http://localhost:3000/api/v1/auth/me
   ```

If you see a 201 response on registration and 200 on `/me`, the backend is working!

## Step 5: Next Steps

Once auth is working, proceed with:
- Phase C: Project/version endpoints testing
- Phase D: Frontend integration (moving and updating `project-timeline-studio.html`)
- Phase E: GitHub and Render deployment

---

## Troubleshooting

### `Error: Missing required environment variable: DATABASE_URL`
- Make sure `server/.env` exists and has the `DATABASE_URL` value from Neon

### `ECONNREFUSED` when connecting to Neon
- Double-check the connection string is correct
- Ensure you're using the **Pooled Connection String** (not the regular one)
- Neon requires SSL — the connection string should have `?sslmode=require`

### `psql: command not found`
- PostgreSQL client tools aren't installed. Install them per Step 3 above.

### `password authentication failed`
- The credentials in the connection string are incorrect
- Copy the connection string again from the Neon console

### `relation "users" does not exist`
- The migration SQL wasn't run, or failed silently
- Check Neon's SQL editor to see if the tables exist
- If not, paste the contents of `server/src/migrations/001_init.sql` into Neon's web editor and run it

---

**Questions?** Refer to the implementation plan at `C:\Users\bhatw\.claude\plans\flickering-finding-locket.md`.
