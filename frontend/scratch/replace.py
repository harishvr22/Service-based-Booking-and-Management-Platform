import os
import re

html_files = [
    'admin_complaints.html',
    'admin_monitoring.html',
    'admin_providers.html',
    'admin_roles.html',
    'announcements.html',
    'users.html',
    'admin_dashboard.html'
]

old_profile_pattern = re.compile(r'(\s*)<div class="admin-profile">(\s*<div class="admin-avatar">AR</div>\s*<div class="admin-info">\s*<div class="name">Alex Reed</div>\s*<div class="role">SUPER ADMIN</div>\s*</div>\s*)</div>')

new_profile = r'\1<a href="admin_profile.html" style="text-decoration: none; display: block;">\1<div class="admin-profile" style="background: rgba(255,255,255,0.05); border: 1px solid var(--orange);">\2</div>\1</a>'

for file in html_files:
    path = os.path.join('d:\\project\\service based booking and management system\\frontend\\html', file)
    if not os.path.exists(path): continue
    
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace profile block
    content = old_profile_pattern.sub(new_profile, content)
    
    # Add common script if not present
    if 'admin_common.js' not in content:
        content = content.replace('</body>', '    <script src="../javascript/admin_common.js"></script>\n</body>')
        
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
print('Done!')
