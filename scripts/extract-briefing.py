import pathlib
import re
import zlib

root = pathlib.Path(__file__).resolve().parents[1]
data = (root / 'references/Portfolio Layout  (1).pdf').read_bytes()
objects = {int(number): body for number, body in re.findall(rb'(\d+) 0 obj(.*?)endobj', data, re.S)}


def stream(body):
    match = re.search(rb'stream\r?\n(.*?)\r?\nendstream', body, re.S)
    return zlib.decompress(match[1]).decode('latin1') if match and b'/FlateDecode' in body else ''


maps = {}
for number, body in objects.items():
    reference = re.search(rb'/ToUnicode (\d+) 0 R', body)
    if reference:
        cmap = stream(objects[int(reference[1])])
        mapping = {}
        for block in re.findall(r'beginbfchar(.*?)endbfchar', cmap, re.S):
            for source, target in re.findall(r'<(\w+)>\s*<(\w+)>', block):
                mapping[int(source, 16)] = bytes.fromhex(target).decode('utf-16-be')
        for block in re.findall(r'beginbfrange(.*?)endbfrange', cmap, re.S):
            for start, end, target in re.findall(r'<(\w+)>\s*<(\w+)>\s*<(\w+)>', block):
                for offset, character in enumerate(range(int(start, 16), int(end, 16) + 1)):
                    mapping[character] = chr(int(target, 16) + offset)
        maps[number] = mapping
output = []
for body in objects.values():
    content = stream(body)
    if ' Tj' not in content:
        continue
    current_font = None
    for token in re.finditer(r'/F(\d+) [\d.]+ Tf|<([0-9A-Fa-f]+)> Tj|EMC', content):
        if token[1]:
            current_font = int(token[1])
        elif token[2]:
            output.append(''.join(maps.get(current_font, {}).get(int(token[2][position:position + 4], 16), '') for position in range(0, len(token[2]), 4)))
        else:
            output.append('\n')
(root / 'docs/BRIEFING_EXTRACTED.txt').write_text(''.join(output), encoding='utf-8')
print('Briefing extracted with embedded font Unicode maps.')
