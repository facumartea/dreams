// inventario con parser, limite y funcionamiento sin git.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { inventory } from '../scripts/function-inventory.mjs';

test('inventario cuenta comentarios, callbacks y métodos sin requerir .git', async t => {
    const root = await mkdtemp(join(tmpdir(), 'dreams-inventory-'));
    t.after(() => rm(root, { recursive: true, force: true }));
    await writeFile(join(root, 'source.js'), 'function largo() {\n' + '// comentario\n'.repeat(39) + '}\nclass Ejemplo {\nmetodo() {\nreturn [1].map(x => x);\n}\n}\n');
    await mkdir(join(root, 'node_modules'));
    await writeFile(join(root, 'node_modules', 'generated.js'), 'not javascript');
    const result = await inventory(root);
    assert.equal(result.files, 1);
    assert.equal(result.violations.length, 1);
    assert.equal(result.violations[0].lines, 41);
    assert.ok(result.records.some(row => row.name === 'metodo'));
    assert.ok(result.records.some(row => row.kind === 'ArrowFunctionExpression'));
});

test('inventario distingue módulo, main explícito y scripts inline de HTML', async t => {
    const root = await mkdtemp(join(tmpdir(), 'dreams-main-'));
    t.after(() => rm(root, { recursive: true, force: true }));
    await writeFile(join(root, 'page.html'), '<html>\n<script>\nfunction inline() {\nreturn true;\n}\n</script>\n</html>');
    await writeFile(join(root, 'entry.js'), 'const data = [\n' + '1,\n'.repeat(45) + '];\nif (data.length) {\n' + '// interior\n'.repeat(39) + '}\n');
    const result = await inventory(root);
    assert.equal(result.violations.length, 1);
    assert.equal(result.violations[0].kind, 'ProgramBlock');
    assert.equal(result.violations[0].lines, 41);
    assert.equal(result.records.find(row => row.name === 'inline').start, 3);
});

// exportar el inventario no debe recrear las antiguas carpetas de entrega ni necesitar git.
test('el reporte opcional se genera fuera de la documentación sin requerir .git', async t => {
    const root = await mkdtemp(join(tmpdir(), 'dreams-inventory-output-'));
    t.after(() => rm(root, { recursive: true, force: true }));
    await writeFile(join(root, 'source.js'), 'function ejemplo() { return true; }');
    const script = fileURLToPath(new URL('../scripts/function-inventory.mjs', import.meta.url));
    await promisify(execFile)(process.execPath, [script, root, '--write']);
    const report = JSON.parse(await readFile(join(root, 'app/dist/inventario-funciones.json'), 'utf8'));
    assert.equal(report.limit, 40);
    assert.equal(report.files, 1);
    assert.equal(report.violations.length, 0);
    assert.ok(report.records.some(row => row.name === 'ejemplo'));
});
