require('dotenv').config();
const pool = require('../db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('[MIGRATION] Starting migration...');

    // Read migration SQL file
    const migrationPath = path.join(__dirname, '../migrations/002_add_password_reset_tokens.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Execute migration
    await pool.query(sql);
    console.log('[MIGRATION] ✓ Migration completed successfully');
    process.exit(0);
  } catch (err) {
    if (err.message.includes('already exists')) {
      console.log('[MIGRATION] ✓ Table already exists, skipping');
      process.exit(0);
    }
    console.error('[MIGRATION] ✗ Migration failed:', err.message);
    process.exit(1);
  }
}

runMigration();
