import os
import re

files = [
    'client/src/pages/cleaning/tabs/StaffTab.jsx',
    'client/src/pages/cleaning/tabs/OverviewTab.jsx',
    'client/src/pages/cleaning/tabs/AreaConfigTab.jsx'
]

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove import api
    content = re.sub(r'import\s+{\s*api\s*}\s*from\s*[\'\"].*?api[\'\"];?\n?', '', content)
    
    # Add token = localStorage.getItem('token') || ''
    if 'const token = localStorage.getItem' not in content:
        content = re.sub(r'(export default function.*?{)', r'\1\n  const token = localStorage.getItem(\'token\') || \'\';', content)
    
    # Replace api.get
    content = re.sub(r'api\.get\((.*?)\)', r'fetch(\1, { headers: { Authorization: `Bearer ${token}` } }).then(res => { if(!res.ok) throw new Error(); return res.json(); }).then(data => ({ data }))', content)
    
    # Replace api.post
    content = re.sub(r'api\.post\((.*?),\s*(.*?)\)', r'fetch(\1, { method: \'POST\', headers: { \'Content-Type\': \'application/json\', Authorization: `Bearer ${token}` }, body: JSON.stringify(\2) })', content)
    
    # Replace api.put
    content = re.sub(r'api\.put\((.*?),\s*(.*?)\)', r'fetch(\1, { method: \'PUT\', headers: { \'Content-Type\': \'application/json\', Authorization: `Bearer ${token}` }, body: JSON.stringify(\2) })', content)

    # Prefix api paths with /api
    content = content.replace('\'/cleaning', '\'/api/cleaning')
    content = content.replace('\'/employees', '\'/api/employees')
    content = content.replace('`/cleaning', '`/api/cleaning')

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
