// Inventario AST: cuenta líneas físicas inclusivas sin excluir callbacks ni tests.
const { parse } = require('acorn');
const { readFileSync } = require('node:fs');
const { execFileSync } = require('node:child_process');
const function_types = new Set(['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression']);

function walk(node, visit, parent = null) {
    if (!node || typeof node !== 'object') return;
    if (typeof node.type === 'string') visit(node, parent);
    for (const [key, value] of Object.entries(node)) {
        if (key === 'loc') continue;
        if (Array.isArray(value)) value.forEach(child => walk(child, visit, node));
        else if (value && typeof value === 'object') walk(value, visit, node);
    }
}

function function_name(node, parent) {
    return node.id?.name || parent?.key?.name || parent?.id?.name || `callback@${node.loc.start.line}`;
}

function inventory(file) {
    const source = readFileSync(file, 'utf8');
    const ast = parse(source, { ecmaVersion: 'latest', sourceType: file.endsWith('.mjs') ? 'module' : 'script', locations: true });
    const functions = [];
    walk(ast, (node, parent) => {
        if (!function_types.has(node.type)) return;
        const start = parent?.method || parent?.type === 'MethodDefinition' ? parent.loc.start.line : node.loc.start.line;
        functions.push({ file, name: function_name(node, parent), start,
            end: node.loc.end.line, lines: node.loc.end.line - start + 1 });
    });
    return functions;
}

function tracked_sources() {
    // Git limita el alcance a código mantenido, no dependencias ni dist/ generados.
    return execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { encoding: 'utf8' }).split('\0')
        .filter(file => /\.(js|mjs|cjs)$/.test(file) && !/^(dist|node_modules)\//.test(file));
}

function main() {
    const functions = tracked_sources().flatMap(inventory);
    const violations = functions.filter(item => item.lines > 20);
    const report = { limit: 20, total: functions.length, violations, functions };
    console.log(process.argv.includes('--summary') ? `Funciones JS: ${functions.length}; fuera de límite: ${violations.length}.` : JSON.stringify(report, null, 2));
    if (violations.length) process.exitCode = 1;
}

if (require.main === module) main();
module.exports = { inventory, walk, tracked_sources };
