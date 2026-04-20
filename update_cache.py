import glob
import re

html_files = glob.glob("*.html")
pattern = re.compile(r'styles\.css\?v=\d+')

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = pattern.sub('styles.css?v=12', content)
    
    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated cache buster in {file}")

