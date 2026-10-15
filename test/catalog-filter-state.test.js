const test = require('node:test');
const assert = require('node:assert/strict');
const model = require('../public/js/catalog-filter-state');

test('filtros conservan todos los parámetros funcionales y separan el borrador', () => {
    const applied = model.parse('?search=rosa&brand=Byredo&gender=mujer&category=nicho&sort=price_asc&max_price=200000');
    assert.equal(model.count(applied), 6);
    const pending = { ...applied, brand: 'Dior', search: 'nuevo' };
    assert.equal(applied.brand, 'Byredo');
    assert.equal(model.parse(model.params(pending).toString()).search, 'nuevo');
    assert.equal(model.parse(model.params(applied).toString()).brand, 'Byredo');
});

test('limpiar un borrador no altera aplicados; confirmar restablece valores sin perder otros parámetros', () => {
    const applied = model.parse('?gender=hombre&brand=Dior');
    const clean = model.params(model.defaults, '?gender=hombre&brand=Dior&utm_source=clase&page=4');
    assert.equal(clean.toString(), 'utm_source=clase');
    assert.equal(applied.gender, 'hombre');
    assert.equal(model.count(model.defaults), 0);
});

test('enum inválido y precios no finitos no producen filtros espurios', () => {
    assert.deepEqual(model.parse('?gender=other&category=otro&sort=wrong&max_price=Infinity'), model.defaults);
    for (const price of ['-1', '0', 'bad']) assert.equal(model.parse('?max_price=' + price).max_price, '');
    assert.equal(model.parse('?max_price=1234.50').max_price, '1234.5');
});

test('búsqueda y marcas se serializan como texto sin crear parámetros adicionales', () => {
    const state = model.normalize({ search: '  iris & gender=unisex  ', brand: 'L’Artisan & Co' });
    const params = model.params(state);
    assert.equal(params.get('gender'), null);
    assert.equal(params.get('search'), 'iris & gender=unisex');
    assert.equal(params.get('brand'), 'L’Artisan & Co');
    assert.equal(model.count(model.parse(params.toString())), 2);
});
