const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            // Shift relative imports by one level up
            // Example: from '../../components' -> '../../../components'
            // We need to look for quotes followed by dots.
            // Be careful not to replace things that don't need it.
            // Match from, import, or dynamic import
            // 'from "../../' -> 'from "../../../'
            content = content.replace(/from\s+['"]\.\.\//g, 'from "../');
            content = content.replace(/import\s+['"]\.\.\//g, 'import "../');
            
            // Wait, simply prefixing an extra '../' to any import that starts with '../' or '../../' will shift it up by one directory.
            // But doing it indiscriminately on "../" might break cases.
            // Let's explicitly replace any relative import path string in 'from "...'  or 'import "...'
            
            let newContent = content.replace(/(from|import)\s+(['"])((?:\.\.\/)+)(.*)\2/g, (match, p1, p2, p3, p4) => {
                return `${p1} ${p2}../${p3}${p4}${p2}`;
            });
            
            if (content !== newContent) {
                fs.writeFileSync(fullPath, newContent, 'utf8');
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

const targetDir = path.join(__dirname, 'apps/storefront/app/[locale]/[tenantSlug]');
console.log(`Processing ${targetDir}`);
processDir(targetDir);
