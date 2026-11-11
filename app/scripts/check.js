// comprueba la sintaxis javascript con node; no arranca la aplicacion ni modifica datos.
const { readdirSync, statSync } = require('node:fs');
const { join } = require('node:path');
const { spawnSync } = require('node:child_process');

function listar_archivos_javascript(directory) {
    return readdirSync(directory).flatMap(name => {
        const path = join(directory, name);
        return statSync(path).isDirectory() ? listar_archivos_javascript(path) : (/\.(js|mjs)$/.test(path)) ? [path] : [];
    });
}

const files = ['server', join('public', 'js'), 'scripts', 'test', 'worker', 'pages'].flatMap(directory => listar_archivos_javascript(directory));
for (const file of files) {
    const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' });
    if (result.status !== 0) process.exit(result.status || 1);
}
console.log(`Sintaxis verificada: ${files.length} archivos JavaScript.`);
