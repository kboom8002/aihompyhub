import fs from 'fs';
import path from 'path';

const dir = 'C:\\Users\\User\\aihompyhub\\packages\\database\\src\\migrations';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql'));

const replaceMap = {
  'aud-00000000': 'aaaa1111',
  'bkp-00000000': 'bbbb1111',
  'lane-00000000': 'cccc1111',
  'exec-00000000': 'dddd1111',
  'over-00000000': 'eeee1111',
  'post-00000000': 'ffff1111',
  'pol-00000000': '1a1a1a1a',
  'act-00000000': '2a2a2a2a',
  'sug-00000000': '3a3a3a3a',
  'srca-00000000': '4a4a4a4a',
  'hlth-00000000': '5a5a5a5a',
  'out-00000000': '6a6a6a6a',
  'pipe-00000000': '7a7a7a7a',
  
  "'user-admin-9999'": "'99999999-0000-0000-0000-000000000000'",
  "'user-0000-1111'": "'11110000-0000-0000-0000-000000000000'",
  "'user-0000-2222'": "'22220000-0000-0000-0000-000000000000'",
  
  "'run-abc-123'": "'77777777-0000-0000-0000-123000000000'",
  "'run-def-456'": "'77777777-0000-0000-0000-456000000000'",
  "'run-ghi-789'": "'77777777-0000-0000-0000-789000000000'",

  'pack-00000000': '33333333',
  'exp-00000000': '44444444',
  'bmk-00000000': '55555555',
  'roll-00000000': '66666666',
  'run-00000000': '77777777',
  'tp-00000000': '99999999',
};

for (const file of files) {
   const filepath = path.join(dir, file);
   let content = fs.readFileSync(filepath, 'utf8');
   
   for (const [k, v] of Object.entries(replaceMap)) {
      content = content.replaceAll(k, v);
   }

   // Fallback for ANY string literal that looks like an improper mock UUID
   // formatted like: 'abc-00000000-0000-0000-0000-000000000001'
   content = content.replace(/'[a-z]+-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})'/g, (match, hexPart) => {
      // Just take the hex part and prepend something valid or regenerate
      let randomPrefix = Array.from({length: 8}, () => Math.floor(Math.random()*16).toString(16)).join('');
      return `'${randomPrefix}-${hexPart.substring(9)}'`;
   });

   fs.writeFileSync(filepath, content);
}
console.log('Fixed additional bad UUIDs.');
