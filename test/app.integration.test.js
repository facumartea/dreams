const test = require('node:test');
const assert = require('node:assert/strict');
const { create_app, GENERIC_ERROR } = require('../server/app');

function query(result) {
    const builder = {};
    for (const method of ['select', 'eq', 'lte', 'or', 'order', 'in', 'insert', 'upsert', 'update', 'delete', 'limit', 'single', 'maybeSingle']) {
        builder[method] = () => builder;
    }
    builder.then = (resolve, reject) => Promise.resolve(typeof result === 'function' ? result() : result).then(resolve, reject);
    return builder;
}

function database_with(handler) {
    return {
        auth: {
            getUser: async () => ({ data: { user: null } }),
            signUp: async () => ({ data: {}, error: null }),
            signInWithPassword: async () => ({ data: {}, error: new Error('invalid') }),
            admin: { signOut: async () => ({ error: null }) }
        },
        from(table) { return query(() => handler(table)); }
    };
}

async function serve(app, callback) {
    const server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    try {
        return await callback(`http://127.0.0.1:${server.address().port}`);
    } finally {
        await new Promise(resolve => server.close(resolve));
    }
}

test('create_app exige una dependencia de base explícita', () => {
    assert.throws(() => create_app(), /requiere una base de datos/);
});

test('la app usa una DB inyectada y transforma productos', async () => {
    const row = {
        id: 4, brand: 'DREAMS', name: 'Noche', featured: 1, stock: '3',
        top_notes: 'bergamota, limón', heart_notes: 'iris', base_notes: 'cedro'
    };
    const database = database_with(table => {
        assert.equal(table, 'products');
        return { data: [row], error: null };
    });
    const app = create_app({ database, disable_request_log: true });
    await serve(app, async base => {
        const response = await fetch(`${base}/api/products`);
        assert.equal(response.status, 200);
        const [item] = await response.json();
        assert.equal(item.featured, true);
        assert.equal(item.stock, 3);
        assert.deepEqual(item.notes.salida, ['bergamota', 'limón']);
    });
});

test('errores de DB responden JSON uniforme sin filtrar detalles', async () => {
    const logs = [];
    const database = database_with(() => ({ data: null, error: new Error('SUPABASE_SECRET_INTERNAL') }));
    const app = create_app({ database, disable_request_log: true, logger: { error: (...values) => logs.push(values), warn() {} } });
    await serve(app, async base => {
        const response = await fetch(`${base}/api/products`);
        assert.equal(response.status, 500);
        const body = await response.json();
        assert.deepEqual(body, { error: GENERIC_ERROR });
        assert.doesNotMatch(JSON.stringify(body), /SUPABASE_SECRET_INTERNAL/);
    });
    assert.equal(logs.length, 1);
    assert.equal(logs[0][1].path, '/api/products');
    assert.doesNotMatch(JSON.stringify(logs), /SUPABASE_SECRET_INTERNAL/);
});

test('rechazos inesperados de una consulta llegan al middleware central', async () => {
    const database = database_with(() => Promise.reject(new Error('network detail')));
    const app = create_app({ database, disable_request_log: true, logger: { error() {}, warn() {} } });
    await serve(app, async base => {
        const response = await fetch(`${base}/api/reviews`);
        assert.equal(response.status, 500);
        assert.deepEqual(await response.json(), { error: GENERIC_ERROR });
    });
});

test('readiness mantiene 503 específico cuando la DB falla', async () => {
    const database = database_with(() => ({ data: null, error: new Error('offline') }));
    const app = create_app({ database, disable_request_log: true, logger: { error() {}, warn() {} } });
    await serve(app, async base => {
        const response = await fetch(`${base}/api/health`);
        assert.equal(response.status, 503);
        assert.deepEqual(await response.json(), { status: 'unavailable', api: true, database: 'unavailable' });
    });
});

test('la CSP se conserva en la app creada por factory', async () => {
    const database = database_with(() => ({ data: [], error: null }));
    const app = create_app({ database, disable_request_log: true });
    await serve(app, async base => {
        const response = await fetch(`${base}/`);
        assert.equal(response.status, 200);
        const csp = response.headers.get('content-security-policy');
        assert.match(csp, /script-src 'self'/);
        assert.doesNotMatch(csp, /unsafe-inline/);
    });
});
