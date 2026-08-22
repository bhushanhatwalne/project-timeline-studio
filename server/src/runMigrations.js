const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function runMigrations() {
  console.log('[MIGRATIONS] Starting...');

  const migrationsDir = path.join(__dirname, 'migrations');
  const migrationFiles = fs.readdirSync(migrationsDir).sort();

  try {
    for (const file of migrationFiles) {
      if (!file.endsWith('.sql')) continue;

      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8').trim();

      if (!sql) {
        console.log(`[MIGRATIONS] Skipping empty file ${file}`);
        continue;
      }

      console.log(`[MIGRATIONS] Running ${file}...`);
      await pool.query(sql);
      console.log(`[MIGRATIONS] ✓ ${file} completed`);
    }

    console.log('[MIGRATIONS] ✓ All migrations completed successfully');
  } catch (err) {
    console.error('[MIGRATIONS] ✗ Error running migrations:', err);
    throw err;
  }
}

if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('[MIGRATIONS] Done');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[MIGRATIONS] Failed:', err);
      process.exit(1);
    });
}

module.exports = runMigrations;
