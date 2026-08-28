const test = require('node:test');
const assert = require('node:assert/strict');

process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_SECRET_KEY = 'test-only-placeholder';
const { app, validate, payload, database_health, auth_cookie, session, parse_id, normalize_cart_items, quote_cart, execute_database_query } = require('../server/server');

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

test('parse_id sólo acepta enteros positivos seguros', () => {
    assert.equal(parse_id('42'), 42);
    for (const value of ['', 'abc', '1.5', '-1', '0', Number.MAX_SAFE_INTEGER + 1]) assert.equal(parse_id(value), null);
});

test('readiness falla cuando Supabase devuelve error', async () => {
    const database = { from: () => ({ select: async () => ({ error: new Error('offline') }) }) };
    await assert.rejects(database_health(database), /offline/);
});

test('consultas reintentan una sola vez ante el desfase JWT transitorio', async () => {
    let calls = 0, waits = 0;
    const result = await execute_database_query(async () => {
        calls += 1;
        return calls === 1 ? { error: { code: 'PGRST303' } } : { data: ['ok'], error: null };
    }, async milliseconds => {
        waits += 1;
        assert.equal(milliseconds, 1200);
    });
    assert.deepEqual(result.data, ['ok']);
    assert.equal(calls, 2);
    assert.equal(waits, 1);

    calls = 0;
    await execute_database_query(async () => {
        calls += 1;
        return { error: { code: 'OTHER' } };
    }, async () => assert.fail('no debe esperar'));
    assert.equal(calls, 1);
});

test('carrito valida cantidades y se reconcilia con precio y stock del servidor', async () => {
    assert.match(normalize_cart_items([]).error, /entre 1 y 30/);
    assert.match(normalize_cart_items([{ id: 1, quantity: 0 }]).error, /cantidad inválida/);
    const database = {
        from(table) {
            assert.equal(table, 'products');
            return {
                select(columns) {
                    assert.match(columns, /price,stock/);
                    return {
                        async in(column, ids) {
                            assert.equal(column, 'id');
                            assert.deepEqual(ids, [1, 2, 3]);
                            return { error: null, data: [
                                { id: 1, brand: 'DREAMS', name: 'Uno', price: 150, stock: 2, image_url: '/one.png', size_ml: 50 },
                                { id: 2, brand: 'DREAMS', name: 'Dos', price: 200, stock: 0, image_url: '/two.png', size_ml: 100 }
                            ] };
                        }
                    };
                }
            };
        }
    };
    const quote = await quote_cart(database, [{ id: 1, quantity: 3 }, { id: 2, quantity: 1 }, { id: 3, quantity: 1 }]);
    assert.equal(quote.total, 300);
    assert.equal(quote.items[0].quantity, 2);
    assert.equal(quote.items[0].price, 150);
    assert.equal(quote.warnings.length, 3);
});

test('cookies de sesión separan expiración de access y refresh', () => {
    const headers = {};
    const response = { setHeader(name, value) { headers[name] = value; } };
    session(response, { access_token: 'access value', refresh_token: 'refresh value', expires_in: 900 });
    assert.equal(headers['Set-Cookie'].length, 2);
    assert.match(headers['Set-Cookie'][0], /dreams_access_token=access%20value/);
    assert.match(headers['Set-Cookie'][0], /Max-Age=900/);
    assert.match(headers['Set-Cookie'][1], /Max-Age=2592000/);
    assert.match(auth_cookie('test', 'a b', 60), /HttpOnly; SameSite=Lax/);
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

test('rutas API rechazan IDs inválidos y no exponen favoritos', async t => {
    const server = app.listen(0, '127.0.0.1');
    t.after(() => new Promise(resolve => server.close(resolve)));
    await new Promise(resolve => server.once('listening', resolve));
    const { port } = server.address();
    const base = `http://127.0.0.1:${port}`;

    const invalid_product = await fetch(`${base}/api/products/not-an-id`);
    assert.equal(invalid_product.status, 400);
    assert.deepEqual(await invalid_product.json(), { error: 'ID de producto inválido.' });

    const removed_favorite = await fetch(`${base}/api/favorites/1`, { method: 'PUT' });
    assert.equal(removed_favorite.status, 404);

    const missing = await fetch(`${base}/api/not-a-route`);
    assert.equal(missing.status, 404);
});
