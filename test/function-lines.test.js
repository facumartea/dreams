// Regresión del medidor: callbacks y métodos cuentan; texto ficticio no es código.
const test = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, writeFileSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { inventory } = require('../scripts/function-lines');
const { sql_inventory } = require('../scripts/sql-function-lines');

function fixture_source(text, action, extension = 'js') {
    const directory = mkdtempSync(join(tmpdir(), 'dreams-lines-'));
    const path = join(directory, `fixture.${extension}`);
    writeFileSync(path, text);
    return Promise.resolve().then(() => action(path)).finally(() => rmSync(directory, { recursive: true }));
}

test('AST cuenta líneas inclusivas, comentarios, callbacks y métodos sin analizar strings como funciones', async () => {
    const body = Array.from({ length: 18 }, (_, index) => index === 3 ? '    // Comentario contado.' : '    void 0;').join('\n');
    const source = `function exact() {\n${body}\n}\nconst callback = () => {\n${body}\n\n};\nconst object = { method(\n) {\n    return 1;\n} };\nconst text = "function fake() {}";`;
    await fixture_source(source, path => {
        const functions = inventory(path);
        assert.deepEqual(functions.map(item => item.lines), [20, 21, 4]);
        assert.equal(functions.length, 3);
    });
});

test('PostgreSQL AST reconoce funciones y bloques DO; ignora menciones en comentarios', async () => {
    const source = '-- create function ficticia()\nCREATE FUNCTION rubric_function() RETURNS int LANGUAGE sql AS $$\n-- Comentario interior contado\nSELECT 1;\n$$;\nDO $$ BEGIN PERFORM 1; END $$;';
    await fixture_source(source, async path => {
        const functions = await sql_inventory(path);
        assert.deepEqual(functions.map(item => item.name), ['rubric_function', 'bloque anónimo DO']);
        assert.equal(functions[0].start, 2);
        assert.equal(functions[0].lines, 4);
    }, 'sql');
});
