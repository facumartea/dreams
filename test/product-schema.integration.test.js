const test = require('node:test');
const assert = require('node:assert/strict');
const { create_app } = require('../server/app');

function database() {
    const rows = [{ id: 1, marca: 'Marca de prueba', name: 'Fragancia de prueba', gender: 'unisex', category: 'nicho', price: 123, stock: 4, size_ml: 50, top_notes: 'Salida', heart_notes: 'Corazón', base_notes: 'Fondo' }];
    const calls = [];
    return {
        rows, calls,
        auth: { getUser: async () => ({ data: { user: { id: 'admin-test', email: 'test@example.com' } } }) },
        from(table) {
            const filters = [];
            let fields = '*', action = 'select', value;
            const q = {
                select(selected = '*') { fields = selected; calls.push(['select', table, selected]); assert.doesNotMatch(selected, /\bbrand\b/); return q; },
                eq(column, expected) { assert.notEqual(column, 'brand'); filters.push(row => String(row[column]) === String(expected)); return q; },
                in(column, ids) { filters.push(row => ids.includes(row[column])); return q; },
                order(column) { assert.notEqual(column, 'brand'); return q; },
                or(expression) { calls.push(['or', expression]); assert.match(expression, /marca.ilike/); return q; },
                limit() { return q; },
                insert(input) { action = 'insert'; value = input; return q; },
                update(input) { action = 'update'; value = input; return q; },
                maybeSingle() { return Promise.resolve(execute(true)); },
                single() { return Promise.resolve(execute(true)); },
                then(resolve, reject) { return Promise.resolve(execute(false)).then(resolve, reject); }
            };
            function execute(single) {
                if (table === 'profiles') return { data: { name: 'Admin de prueba', role: 'admin' }, error: null };
                if (table === 'inquiries') return { data: [{ id: 1, product_name: rows[0].name, products: { marca: rows[0].marca, name: rows[0].name } }], error: null };
                assert.equal(table, 'products');
                const found = rows.filter(row => filters.every(filter => filter(row)));
                if (action !== 'select') {
                    assert.equal(Object.hasOwn(value, 'brand'), false);
                    assert.equal(value.marca, 'Marca de prueba');
                    if (action === 'insert') { const row = { id: 2, ...value }; rows.push(row); return { data: row, error: null }; }
                    found.forEach(row => Object.assign(row, value));
                }
                const data = fields === 'marca' ? found.map(row => ({ marca: row.marca })) : found;
                return { data: single ? data[0] || null : data, error: null };
            }
            return q;
        }
    };
}

async function serve(callback) {
    const db = database();
    const app = create_app({ database: db, create_auth_client: () => db, product_brand_column: 'marca', disable_request_log: true });
    const server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    try { await callback(`http://127.0.0.1:${server.address().port}`, db); }
    finally { await new Promise(resolve => server.close(resolve)); }
}

test('esquema real marca: catálogo, búsqueda, filtros, marcas, detalle y carrito conservan brand', async () => {
    await serve(async (base, db) => {
        for (const route of ['/api/products?brand=Marca%20de%20prueba&search=Fragancia', '/api/products/1']) {
            const response = await fetch(base + route);
            assert.equal(response.status, 200);
            const data = await response.json();
            const item = Array.isArray(data) ? data[0] : data;
            assert.equal(item.brand, 'Marca de prueba');
            assert.equal(Object.hasOwn(item, 'marca'), false);
        }
        assert.deepEqual(await (await fetch(base + '/api/brands')).json(), ['Marca de prueba']);
        const quote = await fetch(base + '/api/cart/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: [{ id: 1, quantity: 2 }] }) });
        assert.equal(quote.status, 200);
        const cart = await quote.json();
        assert.equal(cart.items[0].brand, 'Marca de prueba');
        assert.equal(cart.total, 246);
        assert.ok(db.calls.some(call => call[0] === 'or'));
    });
});

test('esquema real marca: Admin escribe marca y devuelve brand, incluidas consultas', async () => {
    await serve(async (base, db) => {
        const headers = { Cookie: 'dreams_access_token=test', Origin: base, 'Content-Type': 'application/json' };
        const body = { brand: 'Marca de prueba', name: 'Fragancia de prueba', gender: 'unisex', category: 'nicho', size_ml: 50, price: 123, stock: 4, intensity: 3, family: 'Familia', top_notes: 'Salida', heart_notes: 'Corazón', base_notes: 'Fondo', description: 'Prueba aislada', image_url: '/assets/dreams-bottle.png' };
        for (const [method, path] of [['POST', '/api/admin/products'], ['PUT', '/api/admin/products/1']]) {
            const response = await fetch(base + path, { method, headers, body: JSON.stringify(body) });
            assert.equal(response.status, method === 'POST' ? 201 : 200);
            assert.equal((await response.json()).brand, body.brand);
        }
        const inquiries = await fetch(base + '/api/admin/inquiries', { headers });
        assert.equal(inquiries.status, 200);
        assert.equal((await inquiries.json())[0].brand, body.brand);
        assert.equal(db.rows.every(row => !Object.hasOwn(row, 'brand')), true);
    });
});
