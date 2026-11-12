// rechazo de tipos invalidos en stock, precio y demas campos.
const test = require('node:test');
const assert = require('node:assert/strict');
const { payload } = require('../server/app');
const valid = { brand: 'DREAMS QA', name: 'QA tipos', gender: 'unisex', category: 'nicho', size_ml: 50, price: 125,
    stock: 3, intensity: 3, family: 'Prueba', top_notes: 'Prueba', heart_notes: 'Prueba', base_notes: 'Prueba',
    description: 'Recurso exclusivo QA', image_url: '/assets/dreams-bottle.png', featured: false };
const wrong = [['null', null], ['boolean false', false], ['boolean true', true], ['array numérico', [1]], ['objeto', { value: 1 }]];
for (const field of ['price', 'stock', 'size_ml', 'intensity']) {
    for (const [label, value] of wrong) {
        test(`tipo Admin ${field}: ${label} no se convierte silenciosamente a número`, () => {
            assert.ok(payload({ ...valid, [field]: value }).e);
        });
    }
}
for (const [label, value] of [['null', null], ['número', 123], ['array', ['QA']], ['objeto con toString', { toString: 'QA' }]]) {
    test(`marca Admin ${label} se rechaza sin persistir texto coercionado`, () => {
        assert.ok(payload({ ...valid, brand: value }).e);
    });
}
for (const value of ['false', 0, 1, null]) {
    test(`destacado Admin ${JSON.stringify(value)} no se convierte a true/false implícito`, () => {
        assert.ok(payload({ ...valid, featured: value }).e);
    });
}
test('formulario conserva números decimales y enteros en strings, incluido stock0', () => {
    const parsed = payload({ ...valid, price: '125.50', size_ml: '50', stock: '0', intensity: '3' });
    assert.equal(parsed.e, undefined); assert.equal(parsed.o.price, 125.5); assert.equal(parsed.o.stock, 0);
});
test('omitir destacado sigue equivalendo al valor false compatible', () => {
    const value = { ...valid }; delete value.featured;
    assert.equal(payload(value).o.featured, false);
});
