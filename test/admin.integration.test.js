const test = require('node:test');
const assert = require('node:assert/strict');
const { create_app } = require('../server/app');

function memory_database({ role = 'admin' } = {}) {
    const state = {
        products: [{ id: 7, brand: 'DREAMS', name: 'Original', gender: 'unisex', category: 'nicho', size_ml: 50, price: 100, stock: 2, intensity: 3, family: 'Ámbar', top_notes: 'bergamota', heart_notes: 'iris', base_notes: 'cedro', description: 'Descripción', image_url: '/assets/perfume.jpg', featured: false }],
        profiles: [{ id: 'user-1', name: 'Admin', role, created_at: '2026-09-01T00:00:00Z' }],
        reviews: [{ id: 3, user_id: 'customer-1', user_name: 'Cliente', rating: 4, comment: 'Muy bueno', created_at: '2026-09-01T00:00:00Z' }],
        inquiries: [], orders: [], coupons: []
    };

    class Query {
        constructor(table) { this.table = table; this.action = 'select'; this.filters = []; this.value = null; this.count = false; }
        select(fields, options = {}) { this.selected = fields; this.count = options.count === 'exact' && options.head === true; return this; }
        insert(value) { this.action = 'insert'; this.value = value; return this; }
        update(value) { this.action = 'update'; this.value = value; return this; }
        delete() { this.action = 'delete'; return this; }
        eq(key, value) { this.filters.push(row => String(row[key]) === String(value)); return this; }
        neq(key, value) { this.filters.push(row => String(row[key]) !== String(value)); return this; }
        lte(key, value) { this.filters.push(row => Number(row[key]) <= Number(value)); return this; }
        order() { return this; }
        limit() { return this; }
        maybeSingle() { return Promise.resolve(this.execute(true)); }
        single() { return Promise.resolve(this.execute(true)); }
        then(resolve, reject) { return Promise.resolve(this.execute(false)).then(resolve, reject); }
        execute(single) {
            const rows = state[this.table] || [];
            const matches = row => this.filters.every(filter => filter(row));
            if (this.count) return { data: null, count: rows.filter(matches).length, error: null };
            if (this.action === 'insert') {
                const values = Array.isArray(this.value) ? this.value : [this.value];
                const created = values.map(value => ({ id: Math.max(0, ...rows.map(row => Number(row.id) || 0)) + 1, ...value }));
                rows.push(...created);
                return { data: single ? created[0] : created, error: null };
            }
            if (this.action === 'update') {
                const found = rows.filter(matches);
                found.forEach(row => Object.assign(row, this.value));
                return { data: single ? (found[0] || null) : found, error: null };
            }
            if (this.action === 'delete') {
                const found = rows.filter(matches);
                state[this.table] = rows.filter(row => !matches(row));
                return { data: single ? (found[0] || null) : found, error: null };
            }
            const found = rows.filter(matches);
            return { data: single ? (found[0] || null) : found, error: null };
        }
    }

    return {
        state,
        auth: {
            getUser: async token => ({ data: { user: token === 'valid-token' ? { id: 'user-1', email: 'admin@example.com', user_metadata: {} } : null } }),
            admin: { signOut: async () => ({ error: null }) }
        },
        from(table) { return new Query(table); }
    };
}

async function serve(app, callback) {
    const server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    try { return await callback(`http://127.0.0.1:${server.address().port}`); }
    finally { await new Promise(resolve => server.close(resolve)); }
}

const product_data = name => ({ brand: 'DREAMS', name, gender: 'hombre', category: 'nicho', size_ml: 100, price: 250, stock: 4, intensity: 4, family: 'Amaderada', top_notes: 'bergamota', heart_notes: 'cedro', base_notes: 'ámbar', description: 'Producto de prueba', image_url: '/assets/perfume.jpg', featured: false });
const admin_options = base => ({ method: 'GET', headers: { Cookie: 'dreams_access_token=valid-token', Origin: base } });

test('Admin carga, crea, edita y elimina productos válidos con persistencia', async () => {
    const database = memory_database();
    const app = create_app({ database, create_auth_client: () => database, disable_request_log: true });
    await serve(app, async base => {
        const initial = await fetch(`${base}/api/admin/products`, admin_options(base));
        assert.equal(initial.status, 200);
        assert.equal((await initial.json())[0].id, 7);

        const updated = await fetch(`${base}/api/admin/products/7`, { ...admin_options(base), method: 'PUT', headers: { ...admin_options(base).headers, 'Content-Type': 'application/json' }, body: JSON.stringify(product_data('Editado')) });
        assert.equal(updated.status, 200);
        assert.equal((await updated.json()).name, 'Editado');

        const public_product = await fetch(`${base}/api/products/7`);
        assert.equal((await public_product.json()).name, 'Editado');

        const created = await fetch(`${base}/api/admin/products`, { ...admin_options(base), method: 'POST', headers: { ...admin_options(base).headers, 'Content-Type': 'application/json' }, body: JSON.stringify(product_data('Temporal')) });
        assert.equal(created.status, 201);
        const created_id = (await created.json()).id;

        const deleted = await fetch(`${base}/api/admin/products/${created_id}`, { ...admin_options(base), method: 'DELETE' });
        assert.equal(deleted.status, 200);
        assert.equal(database.state.products.some(item => item.id === created_id), false);
    });
});

test('Admin distingue ID inexistente y un usuario normal no puede mutar', async () => {
    const admin_db = memory_database();
    await serve(create_app({ database: admin_db, create_auth_client: () => admin_db, disable_request_log: true }), async base => {
        const missing = await fetch(`${base}/api/admin/products/999`, { ...admin_options(base), method: 'PUT', headers: { ...admin_options(base).headers, 'Content-Type': 'application/json' }, body: JSON.stringify(product_data('No existe')) });
        assert.equal(missing.status, 404);
        assert.match((await missing.json()).error, /no encontrado/i);
    });

    const customer_db = memory_database({ role: 'customer' });
    await serve(create_app({ database: customer_db, create_auth_client: () => customer_db, disable_request_log: true }), async base => {
        const denied = await fetch(`${base}/api/admin/products`, admin_options(base));
        assert.equal(denied.status, 403);
    });
});

test('Admin edita y elimina opiniones persistentes', async () => {
    const database = memory_database();
    const app = create_app({ database, create_auth_client: () => database, disable_request_log: true });
    await serve(app, async base => {
        const updated = await fetch(`${base}/api/admin/reviews/3`, { ...admin_options(base), method: 'PUT', headers: { ...admin_options(base).headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ rating: 5, comment: 'Excelente experiencia' }) });
        assert.equal(updated.status, 200);
        assert.equal((await updated.json()).rating, 5);
        assert.equal(database.state.reviews[0].comment, 'Excelente experiencia');

        const deleted = await fetch(`${base}/api/admin/reviews/3`, { ...admin_options(base), method: 'DELETE' });
        assert.equal(deleted.status, 200);
        assert.equal(database.state.reviews.length, 0);
    });
});


test('Pedidos y cupones Admin usan el cliente JWT y no la conexión global', async () => {
    const server_database = memory_database();
    const original_from = server_database.from.bind(server_database);
    server_database.from = table => {
        if (table === 'orders' || table === 'coupons') throw new Error('La conexión global no debe consultar tablas Admin.');
        return original_from(table);
    };
    const authenticated_database = memory_database();
    await serve(create_app({ database: server_database, create_auth_client: () => authenticated_database, disable_request_log: true }), async base => {
        const orders = await fetch(`${base}/api/admin/orders`, admin_options(base));
        const coupons = await fetch(`${base}/api/admin/coupons`, admin_options(base));
        assert.equal(orders.status, 200);
        assert.equal(coupons.status, 200);
        assert.deepEqual(await orders.json(), []);
        assert.deepEqual(await coupons.json(), []);
    });
});
