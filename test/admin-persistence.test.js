const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { readFileSync } = require('node:fs');
const expected = { brand: 'DREAMS', name: 'QA', gender: 'unisex', category: 'nicho', size_ml: 50, price: 100,
    stock: 2, intensity: 3, family: 'Ámbar', top_notes: 'bergamota', heart_notes: 'iris', base_notes: 'cedro',
    description: 'Prueba local', image_url: '/assets/dreams-bottle.png', featured: true };

function harness(read) {
    const context = vm.createContext({ document: { addEventListener() {} }, Intl });
    vm.runInContext(readFileSync(require.resolve('../public/js/admin.js'), 'utf8'), context);
    context.admin_fetch = read;
    return context;
}

for (const key of Object.keys(expected)) {
    test(`persistencia Admin rechaza discrepancia en ${key}`, async () => {
        const changed = typeof expected[key] === 'number' ? expected[key] + 1 : key === 'featured' ? false : 'diferente';
        const h = harness(async () => [{ id: 7, ...expected, [key]: changed }]);
        await assert.rejects(h.confirm_product_persistence({ id: 7 }, expected), /confirmar todos/);
    });
}

test('persistencia confirma todos los campos, incluida imagen y destacado', async () => {
    let requested;
    const h = harness(async path => { requested = path; return [{ id: 7, ...expected }]; });
    await h.confirm_product_persistence({ id: 7 }, expected);
    assert.equal(requested, '/api/admin/products');
});
test('persistencia admite números serializados como formulario y texto normalizado', async () => {
    const h = harness(async () => [{ id: 7, ...expected }]);
    await h.confirm_product_persistence({ id: '7' }, { ...expected, price: '100', name: ' QA ' });
});
for (const [name, read] of [['producto ausente', []], ['respuesta no array', {}], ['otro ID', [{ id: 8, ...expected }]]]) {
    test(`persistencia rechaza ${name}`, async () => {
        await assert.rejects(harness(async () => read).confirm_product_persistence({ id: 7 }, expected));
    });
}
for (const id of [undefined, 0, -1, 1.5]) {
    test(`persistencia rechaza identificador inválido ${id}`, async () => {
        let reads = 0;
        await assert.rejects(harness(async () => { reads++; return []; }).confirm_product_persistence({ id }, expected));
        assert.equal(reads, 0);
    });
}
test('caída de lectura posterior conserva el formulario y no anuncia éxito ni repite el alta', async () => {
    const h = harness(async () => { throw new Error('lectura interrumpida'); });
    const message = { textContent: '' };
    h.document.getElementById = () => message;
    let resets = 0, writes = 0;
    h.reset_form = () => { resets++; };
    h.set_product_save_pending = () => {};
    h.admin_fetch = async (_path, options) => { if (options) { writes++; return { id: 7 }; } throw new Error('lectura interrumpida'); };
    await h.commit_product('', expected);
    assert.equal(writes, 1);
    assert.equal(resets, 0);
    assert.match(message.textContent, /Revisá el listado/);
    assert.doesNotMatch(message.textContent, /correctamente/);
});
