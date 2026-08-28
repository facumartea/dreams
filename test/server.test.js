const test = require('node:test');
const assert = require('node:assert/strict');

process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_SECRET_KEY = 'test-only-placeholder';
const { app, validate, payload, database_health } = require('../server/server');

test('validación de producto rechaza números y URLs inseguros', () => {
    const valid = {
        brand: 'DREAMS', name: 'Noche', gender: 'unisex', category: 'nicho', size_ml: 100,
        price: 1000, stock: 2, intensity: 4, family: 'amaderada', top_notes: 'bergamota',
        heart_notes: 'iris', base_notes: 'cedro', description: 'Descripción', image_url: '/assets/dreams-bottle.png'
    };
    assert.equal(validate(valid), undefined);
    assert.match(validate({ ...valid, stock: 1.5 }), /válidos/);
    assert.match(validate({ ...valid, price: 'NaN' }), /válidos/);
    assert.match(validate({ ...valid, image_url: 'javascript:alert(1)' }), /HTTPS/);
    assert.equal(payload({ ...valid, brand: '  DREAMS  ' }).o.brand, 'DREAMS');
});

test('readiness falla cuando Supabase devuelve error', async () => {
    const database = { from: () => ({ select: async () => ({ error: new Error('offline') }) }) };
    await assert.rejects(database_health(database), /offline/);
});

test('la respuesta HTTP incluye CSP sin unsafe-inline', async t => {
    const server = app.listen(0, '127.0.0.1');
    t.after(() => new Promise(resolve => server.close(resolve)));
    await new Promise(resolve => server.once('listening', resolve));
    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}/`);
    assert.equal(response.status, 200);
    const csp = response.headers.get('content-security-policy');
    assert.match(csp, /script-src 'self'/);
    assert.doesNotMatch(csp, /unsafe-inline/);
});
