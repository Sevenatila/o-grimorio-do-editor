import json
import pathlib
import shutil

workspace = pathlib.Path(__file__).resolve().parents[1]
sources = [
    pathlib.Path('D:/Area de trabalho/Eagle Media/LibreChat/node_modules'),
    pathlib.Path('D:/Area de trabalho/Eagle Media/Whatspower/node_modules'),
    pathlib.Path('C:/Users/atila/AppData/Local/npm-cache/_npx/9833c18b2d85bc59/node_modules'),
]
destination = workspace / 'node_modules'
visited = set()


def install(name, preferred=None):
    if name in visited:
        return
    visited.add(name)
    candidates = ([preferred] if preferred else []) + sources
    source = next((root / name for root in candidates if (root / name / 'package.json').exists()), None)
    if not source:
        print('Unavailable locally:', name)
        return
    target = destination / name
    shutil.copytree(source, target, dirs_exist_ok=True)
    manifest = json.loads((target / 'package.json').read_text(encoding='utf-8'))
    print(name, manifest['version'])
    for dependency in manifest.get('dependencies', {}):
        install(dependency, source / 'node_modules')
    for dependency in manifest.get('optionalDependencies', {}):
        if 'win32' in dependency:
            install(dependency)


for package in ['react', 'react-dom', 'vite', 'typescript', '@types/react', '@types/react-dom', 'playwright']:
    install(package)
bin_directory = destination / '.bin'
bin_directory.mkdir(exist_ok=True)
for command, entry in {'vite': 'vite/bin/vite.js', 'tsc': 'typescript/bin/tsc'}.items():
    (bin_directory / (command + '.cmd')).write_text('@node "%~dp0../' + entry + '" %*\n')
