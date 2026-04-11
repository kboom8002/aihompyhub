const fs = require('fs');
const path = require('path');
const p = path.join(process.cwd(), 'apps', 'storefront', 'app', '[locale]', '[tenantSlug]');

function recursiveSearch(dir) {
   let results = [];
   const list = fs.readdirSync(dir);
   list.forEach(file => {
       const filePath = path.join(dir, file);
       const stat = fs.statSync(filePath);
       if (stat && stat.isDirectory()) results = results.concat(recursiveSearch(filePath));
       else if (file === 'page.tsx' || file === 'layout.tsx') results.push(filePath);
   });
   return results;
}

const files = recursiveSearch(p);
files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    let init = content;
    
    // Replace , translations from select
    content = content.replace(/\.select\('([^']+),\s*translations'\)/g, ".select('$1')");
    content = content.replace(/\.select\('translations,\s*([^']+)'\)/g, ".select('$1')");
    
    // Exact specific replacements
    content = content.replace(/\.select\('\*,\s*json_payload,\s*translations'\)/g, ".select('*, json_payload')");
    content = content.replace(/\.select\('id,\s*title,\s*updated_at,\s*created_at,\s*json_payload,\s*translations'\)/g, ".select('id, title, updated_at, created_at, json_payload')");
    content = content.replace(/\.select\('\*,\s*translations'\)/g, ".select('*')");

    if (content !== init) {
        fs.writeFileSync(f, content, 'utf8');
        console.log('Fixed translations select in:', f);
    }
});
