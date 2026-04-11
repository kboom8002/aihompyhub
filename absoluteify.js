const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'apps/storefront');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let newContent = content.replace(/(from|import)\s+(['"])(\.\.\/.*?)(['"])/g, (match, p1, p2, p3, p4) => {
                // p3 is the relative path, e.g. ../../lib/tenant
                const absoluteTarget = path.resolve(path.dirname(fullPath), p3);
                // Convert back to relative from the root of storefront
                // absoluteTarget = C:\Users\User\aihompyhub\apps\storefront\lib\tenant
                // baseDir = C:\Users\User\aihompyhub\apps\storefront
                let relativeToRoot = path.relative(baseDir, absoluteTarget);
                // Handle windows slashes
                relativeToRoot = relativeToRoot.replace(/\\/g, '/');
                
                // If it goes outside storefront, keep it as is (rare but possible)
                if (relativeToRoot.startsWith('..')) {
                    return match;
                }
                
                // Convert to @ alias format
                return `${p1} ${p2}@/${relativeToRoot}${p4}`;
            });
            if (content !== newContent) {
                fs.writeFileSync(fullPath, newContent, 'utf8');
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

// target dir is just existing tenantSlug
const targetDir = path.join(__dirname, 'apps/storefront/app/[tenantSlug]');
processDir(targetDir);
