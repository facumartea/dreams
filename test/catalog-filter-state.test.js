const test = require('node:test');
const assert = require('node:assert/strict');
const model = require('../public/js/catalog-filter-state');

test('filtros conservan todos los parámetros funcionales y separan el borrador', () => {
    const applied = model.parse('?search=rosa&brand=Byredo&gender=mujer&category=nicho&sort=price_asc&max_price=200000');
    assert.equal(model.count(applied), 6);
    const pending = { ...applied, brand: 'Dior', search: 'nuevo' };
    assert.deepEqual(applied.brand, ['Byredo']);
    assert.equal(model.parse(model.params(pending).toString()).search, 'nuevo');
    assert.deepEqual(model.parse(model.params(applied).toString()).brand, ['Byredo']);
});

test('limpiar un borrador no altera aplicados; confirmar restablece valores sin perder otros parámetros', () => {
    const applied = model.parse('?gender=hombre&brand=Dior');
    const clean = model.params(model.defaults, '?gender=hombre&brand=Dior&utm_source=clase&page=4');
    assert.equal(clean.toString(), 'utm_source=clase');
    assert.deepEqual(applied.gender, ['hombre']);
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

test('varias marcas y géneros sobreviven URL/recarga sin parámetros duplicados', () => {
    const value = { brand: ['Dior', 'Chanel', 'Dior'], gender: ['unisex', 'mujer'], sort: 'name' };
    const params = model.params(value, '?brand=anterior&brand=otro&page=9&utm_source=prueba');
    assert.equal(params.getAll('brand').length, 1);
    assert.equal(params.getAll('gender').length, 1);
    assert.equal(params.has('page'), false);
    assert.deepEqual(model.parse(params.toString()), model.normalize(value));
    assert.equal(model.count(value), 3); // Grupos activos: marcas, géneros y orden.
    assert.equal(params.get('utm_source'), 'prueba');
});

test('listas se normalizan sin mutar aplicados ni aceptar enums u objetos', () => {
    const applied = model.normalize({ brand: [' Dior ', 'Chanel', null], gender: ['mujer', 'unisex', 'admin'] });
    const pending = model.normalize(applied);
    pending.brand.push('Byredo');
    assert.deepEqual(applied.brand, ['Chanel', 'Dior']);
    assert.deepEqual(applied.gender, ['mujer', 'unisex']);
    assert.deepEqual(model.parse('?brand=%5Bbad&gender=__proto__').brand, []);
    assert.deepEqual(model.parse('?gender=mujer&gender=unisex&gender=mujer').gender, ['mujer', 'unisex']);
});
