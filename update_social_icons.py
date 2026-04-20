import os
import glob
import re

html_files = glob.glob("*.html")

old_pattern = re.compile(r'<div class="social-icons">\s*<a href="#"><i class="fa-brands fa-threads"></i></a>\s*<a href="#"><i class="fa-brands fa-instagram"></i></a>\s*<a href="#"><i class="fa-brands fa-facebook-f"></i></a>\s*</div>')
new_block = '''<div class="social-icons">
            <a href="#" class="brand-ig" title="Instagram"><i class="fa-brands fa-instagram"></i></a>
            <a href="#" class="brand-fb" title="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
            <a href="#" class="brand-tt" title="TikTok"><i class="fa-brands fa-tiktok"></i></a>
        </div>'''

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if old_pattern.search(content):
        content = old_pattern.sub(new_block, content)
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file}")
    else:
        print(f"Skipped {file} (no match)")

