import re

with open('src/components/game/HologramEvolution.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

start_marker = 'export const PLANT_CARDS: Record<string, PlantCard> = {'
start_idx = text.find(start_marker)
obj_start = start_idx + len(start_marker)
brace_depth = 1
in_str = False
str_char = ''
escape = False
obj_end = obj_start

for i in range(obj_start, len(text)):
    ch = text[i]
    if escape:
        escape = False
        continue
    if ch == '\\':
        escape = True
        continue
    if in_str:
        if ch == str_char:
            in_str = False
        continue
    if ch in ('"', "'", '`'):
        in_str = True
        str_char = ch
        continue
    if ch == '{' or ch == '[':
        brace_depth += 1
    elif ch == '}' or ch == ']':
        brace_depth -= 1
        if brace_depth == 0:
            obj_end = i
            break

body = text[obj_start:obj_end]

entries = []
current = ''
depth = 0
in_str = False
str_char = ''
escape = False

for ch in body:
    if escape:
        current += ch
        escape = False
        continue
    if ch == '\\':
        current += ch
        escape = True
        continue
    if in_str:
        current += ch
        if ch == str_char:
            in_str = False
        continue
    if ch in ('"', "'", '`'):
        current += ch
        in_str = True
        str_char = ch
        continue
    if ch == '{' or ch == '[':
        depth += 1
        current += ch
        continue
    if ch == '}' or ch == ']':
        depth -= 1
        current += ch
        continue
    if ch == ',' and depth == 0:
        entries.append(current)
        current = ''
        continue
    current += ch
if current.strip():
    entries.append(current)

seen = set()
for entry in entries:
    match = re.match(r"\s*['\"]?(\w+)['\"]?\s*:", entry)
    if match:
        key = match.group(1)
        if key in seen:
            print('DUPLICATE:', key)
        seen.add(key)
    else:
        print('NO KEY:', entry[:100].replace('\n', ' '))

print('Total entries:', len(entries))
print('Total unique keys:', len(seen))
