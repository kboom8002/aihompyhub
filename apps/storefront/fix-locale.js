const fs = require('fs');
const path = require('path');
const targetDirs = ['answers', 'compare', 'consultation', 'media', 'portfolio', 'products', 'routines', 'solutions', 'trust', path.join('trust', 'experts')];
const basePath = path.join(process.cwd(), 'apps', 'storefront', 'app', '[locale]', '[tenantSlug]');
targetDirs.forEach(dir => {
    const f = path.join(basePath, dir, 'page.tsx');
    if (fs.existsSync(f)) {
        let content = fs.readFileSync(f, 'utf8');
        if (!content.includes('const locale =')) {
            content = content.replace(/const params = await props\.params;(\r?\n)/, "const params = await props.params;\n  const locale = params.locale || 'ko';\n");
            fs.writeFileSync(f, content, 'utf8');
            console.log('Fixed locale in:', f);
        }
    }
});
