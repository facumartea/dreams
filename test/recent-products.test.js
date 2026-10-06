const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { readFileSync } = require('node:fs');
const source = readFileSync(require.resolve('../public/js/app.js'), 'utf8');
const functions = source.slice(source.indexOf('function get_recent_products()'), source.indexOf('function render_recent_products()'));

test('historial corrupto o storage bloqueado no rompe detalle', () => {
    for (const value of ['{', '{}', 'null', '123', '"text"', '[null, {}, 5, {"id":-1}]']) {
        const context = vm.createContext({ localStorage: { getItem: () => value, setItem() { throw new Error('quota'); } } });
        vm.runInContext(functions, context);
        assert.equal(vm.runInContext('get_recent_products().length', context), 0);
        assert.doesNotThrow(() => vm.runInContext('save_recent_product({ id: 2, name: "Real", brand: "Real" })', context));
    }
});

test('historial preserva productos válidos y limita a seis sin duplicar', () => {
    let stored = JSON.stringify(Array.from({ length: 9 }, (_, i) => ({ id: i + 1, name: 'Test', brand: 'Test' })));
    const context = vm.createContext({ localStorage: { getItem: () => stored, setItem: (_, value) => { stored = value; } } });
    vm.runInContext(functions, context);
    vm.runInContext('save_recent_product({ id: 2, name: "Test", brand: "Test" })', context);
    const rows = JSON.parse(stored);
    assert.equal(rows.length, 6); assert.equal(rows[0].id, 2); assert.equal(rows.filter(row => row.id === 2).length, 1);
});
