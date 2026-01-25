# Script to remove duplicate initializeApp function
with open('src/main.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Keep lines up to 1215 (before the duplicate function)
# Then add the call to initializeApp
new_lines = lines[:1215]  # Lines 0-1214 (up to restoreSidebarState();)
new_lines.append('\n')
new_lines.append('// Call initializeApp (defined earlier at line 214)\n')
new_lines.append('initializeApp();\n')

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("✅ Fixed: Removed duplicate initializeApp function")
