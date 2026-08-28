const { readdirSync, statSync } = require('node:fs');
const { join } = require('node:path');
const { spawnSync } = require('node:child_process');

function javascript_files(directory) {
    return readdirSync(directory).flatMap(name => {
        const path = join(directory, name);
        return statSync(path).isDirectory() ? javascript_files(path) : path.endsWith('.js') ? [path] : [];
    });
}

const files = ['server', join('public', 'js'), 'scripts', 'test'].flatMap(directory => javascript_files(directory));
for (const file of files) {
    const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' });
    if (result.status !== 0) process.exit(result.status || 1);
}
console.log(`Sintaxis verificada: ${files.length} archivos JavaScript.`);
