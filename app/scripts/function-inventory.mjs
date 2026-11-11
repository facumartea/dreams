// cuenta funciones con un parser, incluyendo lineas vacias y comentarios; funciona sin git.
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parse } from 'acorn';

const excluded = new Set(['node_modules', '.git', 'dist', '.wrangler', 'coverage', '.pnpm-store']);
const functions = new Set(['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression']);

async function listar_archivos_propios(root) {
    const entries = await readdir(root, { withFileTypes: true });
    const groups = await Promise.all(entries.filter(e => !excluded.has(e.name)).map(async entry => {
        const file = resolve(root, entry.name);
        if (entry.isSymbolicLink()) return [];
        if (entry.isDirectory()) return listar_archivos_propios(file);
        return /\.(?:js|mjs|cjs|html)$/.test(entry.name) ? [file] : [];
    }));
    return groups.flat().sort();
}
export { listar_archivos_propios as source_files };

function obtener_nombre_de_funcion(node, parent) {
    return node.id?.name || parent?.key?.name || parent?.id?.name ||
        (parent?.type === 'CallExpression' ? `callback:${parent.callee.name || parent.callee.property?.name || 'llamada'}` : 'anónima');
}

function recorrer_codigo(node, parent, records, file, offset) {
    if (!node || typeof node !== 'object') return;
    if (functions.has(node.type)) records.push({ file, name: obtener_nombre_de_funcion(node, parent), kind: node.type,
        start: node.loc.start.line + offset, end: node.loc.end.line + offset,
        lines: node.loc.end.line - node.loc.start.line + 1 });
    for (const [key, value] of Object.entries(node)) {
        if (key === 'loc') continue;
        if (Array.isArray(value)) value.forEach(child => recorrer_codigo(child, node, records, file, offset));
        else if (value?.type) recorrer_codigo(value, node, records, file, offset);
    }
}

function extraer_scripts_del_html(source, file) {
    if (!file.endsWith('.html')) return [{ source, offset: 0 }];
    // solo javascript inline propio; los scripts externos se inventarian por archivo.
    return [...source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
        .filter(match => !/\bsrc\s*=/.test(match[1]) && !/application\/ld\+json/.test(match[1]))
        .map(match => ({ source: match[2], offset: source.slice(0, match.index + match[0].indexOf('>') + 1).split('\n').length - 1 }));
}

function revisar_bloques_principales(tree, file, records, offset) {
    // cada sentencia ejecutable superior es un bloque, no el archivo completo.
    // declaraciones de datos, imports y registros de callbacks no son un main.
    for (const node of tree.body) {
        if (!['IfStatement', 'ForStatement', 'ForOfStatement', 'ForInStatement',
            'WhileStatement', 'DoWhileStatement', 'TryStatement', 'BlockStatement'].includes(node.type)) continue;
        const start = node.loc.start.line + offset;
        const end = node.loc.end.line + offset;
        records.push({ file, name: 'bloque ejecutable superior', kind: 'ProgramBlock', start, end, lines: end - start + 1 });
    }
}

async function inventariar_funciones(root) {
    const records = [];
    const files = await listar_archivos_propios(root);
    for (const path of files) {
        const file = relative(root, path).replaceAll('\\', '/');
        for (const block of extraer_scripts_del_html(await readFile(path, 'utf8'), file)) {
            const tree = parse(block.source, { ecmaVersion: 'latest', sourceType: 'module', locations: true, allowHashBang: true });
            recorrer_codigo(tree, null, records, file, block.offset);
            revisar_bloques_principales(tree, file, records, block.offset);
        }
    }
    return { limit: 40, files: files.length, records, violations: records.filter(row => row.lines > 40) };
}
export { inventariar_funciones as inventory };

async function ejecutar_programa() {
    const root = resolve(process.argv[2] || '.');
    const result = await inventariar_funciones(root);
    if (process.argv.includes('--write')) {
        // el reporte generado no se mezcla ni se versiona con los documentos de entrega.
        await mkdir(resolve(root, 'app/dist'), { recursive: true });
        await writeFile(resolve(root, 'app/dist/inventario-funciones.json'), JSON.stringify(result, null, 2) + '\n');
    }
    console.log(JSON.stringify({ files: result.files, records: result.records.length, violations: result.violations }, null, 2));
    if (result.violations.length && !process.argv.includes('--report-only')) process.exitCode = 1;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await ejecutar_programa();
