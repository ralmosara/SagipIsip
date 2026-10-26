import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

async function restoreVectors() {
  console.log('========================================================');
  console.log('🔄 RESTORING SAGIPISIP VECTOR DATABASE');
  console.log('========================================================');

  const sqlFile = path.resolve(__dirname, '..', '..', 'sagipisip_vectors.sql');

  if (!fs.existsSync(sqlFile)) {
    console.error(`❌ SQL dump file not found at: ${sqlFile}`);
    process.exit(1);
  }

  const fileSizeMB = (fs.statSync(sqlFile).size / (1024 * 1024)).toFixed(1);
  console.log(`Found backup file: ${sqlFile} (${fileSizeMB} MB)`);
  console.log('Restoring 18,047 vector chunks into PostgreSQL...');

  const startTime = Date.now();

  try {
    // Pipe the SQL file directly into the postgres container via docker exec
    execSync(
      `docker exec -i sagipisip_postgres psql -U sagipisip -d sagipisip_db < "${sqlFile}"`,
      { stdio: 'inherit', shell: 'cmd.exe' }
    );

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n✅ Vectors restored successfully in ${elapsed}s!`);
    console.log('No re-extraction or re-embedding needed.');
  } catch (err) {
    console.error('❌ Restore failed:', err);
    process.exit(1);
  }
}

restoreVectors();
