import { readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parse } from 'acorn';

const excluded = new Set(['node_modules', '.git', 'dist', '.wrangler', 'coverage', '.pnpm-store']);
const functions = new Set(['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression']);

export async function source_files(root) {
    const entries = await readdir(root, { withFileTypes: true });
    const groups = await Promise.all(entries.filter(e => !excluded.has(e.name)).map(async entry => {
        const file = resolve(root, entry.name);
        if (entry.isSymbolicLink()) return [];
        if (entry.isDirectory()) return source_files(file);
        return /\.(?:js|mjs|cjs|html)$/.test(entry.name) ? [file] : [];
    }));
    return groups.flat().sort();
}

function function_name(node, parent) {
    return node.id?.name || parent?.key?.name || parent?.id?.name ||
        (parent?.type === 'CallExpression' ? `callback:${parent.callee.name || parent.callee.property?.name || 'llamada'}` : 'anónima');
}

function walk(node, parent, records, file, offset) {
    if (!node || typeof node !== 'object') return;
    if (functions.has(node.type)) records.push({ file, name: function_name(node, parent), kind: node.type,
        start: node.loc.start.line + offset, end: node.loc.end.line + offset,
        lines: node.loc.end.line - node.loc.start.line + 1 });
    for (const [key, value] of Object.entries(node)) {
        if (key === 'loc') continue;
        if (Array.isArray(value)) value.forEach(child => walk(child, node, records, file, offset));
        else if (value?.type) walk(value, node, records, file, offset);
    }
}

function script_blocks(source, file) {
    if (!file.endsWith('.html')) return [{ source, offset: 0 }];
    // Sólo JavaScript inline propio; los scripts externos se inventarían por archivo.
    return [...source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
        .filter(match => !/\bsrc\s*=/.test(match[1]) && !/application\/ld\+json/.test(match[1]))
        .map(match => ({ source: match[2], offset: source.slice(0, match.index + match[0].indexOf('>') + 1).split('\n').length - 1 }));
}

function main_blocks(tree, file, records, offset) {
    // Cada sentencia ejecutable superior es un bloque, no el archivo completo.
    // Declaraciones de datos, imports y registros de callbacks no son un main.
    for (const node of tree.body) {
        if (!['IfStatement', 'ForStatement', 'ForOfStatement', 'ForInStatement',
            'WhileStatement', 'DoWhileStatement', 'TryStatement', 'BlockStatement'].includes(node.type)) continue;
        const start = node.loc.start.line + offset;
        const end = node.loc.end.line + offset;
        records.push({ file, name: 'bloque ejecutable superior', kind: 'ProgramBlock', start, end, lines: end - start + 1 });
    }
}

export async function inventory(root) {
    const records = [];
    const files = await source_files(root);
    for (const path of files) {
        const file = relative(root, path).replaceAll('\\', '/');
        for (const block of script_blocks(await readFile(path, 'utf8'), file)) {
            const tree = parse(block.source, { ecmaVersion: 'latest', sourceType: 'module', locations: true, allowHashBang: true });
            walk(tree, null, records, file, block.offset);
            main_blocks(tree, file, records, block.offset);
        }
    }
    return { limit: 40, files: files.length, records, violations: records.filter(row => row.lines > 40) };
}

async function main() {
    const root = resolve(process.argv[2] || '.');
    const result = await inventory(root);
    if (process.argv.includes('--write')) await writeFile(resolve(root, 'docs/entrega-2026/inventario-funciones.json'), JSON.stringify(result, null, 2) + '\n');
    console.log(JSON.stringify({ files: result.files, records: result.records.length, violations: result.violations }, null, 2));
    if (result.violations.length && !process.argv.includes('--report-only')) process.exitCode = 1;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await main();
