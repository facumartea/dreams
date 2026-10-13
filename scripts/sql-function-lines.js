// PostgreSQL reconoce las funciones; no cuenta declaraciones mediante regex.
const { parse } = require('libpg-query');
const { readFileSync } = require('node:fs');
const { execFileSync } = require('node:child_process');

function sql_files() {
    return execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(file => file.endsWith('.sql'));
}

function declaration_text(source, statement) {
    const bytes = Buffer.from(source);
    const start = statement.stmt_location || 0;
    const text = bytes.subarray(start, statement.stmt_len ? start + statement.stmt_len : undefined).toString('utf8');
    // Sólo elimina comentarios ANTERIORES a la declaración, no los interiores.
    const leading = text.match(/^(?:\s+|--[^\n]*(?:\n|$)|\/\*[\s\S]*?\*\/)*/)?.[0] || '';
    return { text: text.slice(leading.length), prefix: bytes.subarray(0, start).toString('utf8') + leading };
}

async function sql_inventory(file) {
    const source = readFileSync(file, 'utf8');
    const ast = await parse(source);
    return ast.stmts.filter(item => (item.stmt.CreateFunctionStmt || item.stmt.DoStmt)).map(item => {
        const { text, prefix } = declaration_text(source, item);
        const start = prefix.split('\n').length;
        const lines = text.split('\n').length;
        return { file, name: item.stmt.CreateFunctionStmt ? item.stmt.CreateFunctionStmt.funcname.map(part => part.String.sval).join('.') : 'bloque anónimo DO', start, lines, end: start + lines - 1 };
    });
}

async function main() {
    const functions = (await Promise.all(sql_files().map(sql_inventory))).flat();
    const violations = functions.filter(item => item.lines > 20);
    const report = { language: 'SQL/PLpgSQL', limit: 20, total: functions.length, violations, functions };
    console.log(process.argv.includes('--summary') ? `Funciones SQL: ${functions.length}; fuera de límite: ${violations.length}.` : JSON.stringify(report, null, 2));
    if (violations.length) process.exitCode = 1;
}
if (require.main === module) main().catch(() => { console.error('No se pudo analizar SQL.'); process.exitCode = 1; });
module.exports = { sql_inventory };
