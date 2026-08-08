const fs = require('fs');

const files = [
    'client/src/pages/cleaning/tabs/StaffTab.jsx',
    'client/src/pages/cleaning/tabs/OverviewTab.jsx',
    'client/src/pages/cleaning/tabs/AreaConfigTab.jsx'
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Remove import api
    content = content.replace(/import\s*{\s*api\s*}\s*from\s*['"].*?api['"];?\n?/g, '');
    
    // Add token = localStorage.getItem('token') || ''
    if (!content.includes('const token = localStorage.getItem')) {
        content = content.replace(/(export default function.*?{)/, '$1\n  const token = localStorage.getItem(\'token\') || \'\';');
    }
    
    // Replace api.get
    content = content.replace(/api\.get\((.*?)\)/g, 'fetch($1, { headers: { Authorization: `Bearer ${token}` } }).then(res => { if(!res.ok) throw new Error(); return res.json(); }).then(data => ({ data }))');
    
    // Replace api.post
    content = content.replace(/api\.post\((.*?),\s*(.*?)\)/g, 'fetch($1, { method: \'POST\', headers: { \'Content-Type\': \'application/json\', Authorization: `Bearer ${token}` }, body: JSON.stringify($2) })');
    
    // Replace api.put
    content = content.replace(/api\.put\((.*?),\s*(.*?)\)/g, 'fetch($1, { method: \'PUT\', headers: { \'Content-Type\': \'application/json\', Authorization: `Bearer ${token}` }, body: JSON.stringify($2) })');

    // Prefix api paths with /api
    content = content.replace(/'\/cleaning/g, "'/api/cleaning");
    content = content.replace(/'\/employees/g, "'/api/employees");
    content = content.replace(/`\/cleaning/g, "`/api/cleaning");

    fs.writeFileSync(file, content, 'utf8');
});
