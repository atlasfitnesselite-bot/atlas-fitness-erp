const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            if (content.includes('fetch(') && content.includes('res.data')) {
                content = content.replace(/await fetch\(/g, 'await api(');
                content = content.replace(/body:\s*JSON\.stringify\((.*?)\)/g, 'data: ');
                
                content = content.replace(/catch \((.*?)\) \{\s*console\.error\(\1\)\s*\}/g, 'catch () {\n      console.error();\n      if (.response && .response.data && .response.data.message) alert(.response.data.message);\n    }');
                
                if (!content.includes('import api from')) {
                     content = "import api from '@/lib/api';\n" + content;
                }
                
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Modified ' + fullPath);
                modified = true;
            }
        }
    }
}

processDir(path.join(process.cwd(), 'client', 'src'));
console.log('Done');
