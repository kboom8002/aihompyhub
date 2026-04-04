import fs from 'fs';
import path from 'path';

const migrationsDir = 'C:\\Users\\User\\aihompyhub\\packages\\database\\src\\migrations';
const outputFile = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\204af3d1-2e96-4085-8511-3ff6c3d0a1d5\\artifacts\\full_schema_migration.sql';

const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
let buf = '-- COMPLETE CLOUD ROLLOUT MIGRATION (SPRINT 0 to 10)\n\n';

for (const file of files) {
   buf += `\n\n---------------------------------------------\n`;
   buf += `-- MIGRATION: ${file}\n`;
   buf += `---------------------------------------------\n\n`;
   buf += fs.readFileSync(path.join(migrationsDir, file), 'utf8');
}

fs.writeFileSync(outputFile, buf);
console.log('Successfully concatenated migrations.');
