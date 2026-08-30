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

test('auth no se cachea y valida credenciales antes de consultar Supabase', async () => {
    const database = database_with(() => ({ data: [], error: null }));
    const app = create_app({ database, disable_request_log: true });
    await serve(app, async base => {
        const response = await fetch(`${base}/api/auth/login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'correo-invalido', password: '12345678' })
        });
        assert.equal(response.status, 400);
        assert.equal(response.headers.get('cache-control'), 'no-store');
        assert.match((await response.json()).error, /correo válido/);
    });
});

test('config pública expone contacto pero nunca el identificador Admin', async () => {
    const database = database_with(() => ({ data: [], error: null }));
    const app = create_app({
        database,
        disable_request_log: true,
        admin_email: 'private-admin@example.com',
        contact_email: ' CONTACT@EXAMPLE.COM '
    });
    await serve(app, async base => {
        const response = await fetch(`${base}/api/config`);
        assert.equal(response.status, 200);
        const body = await response.json();
        assert.equal(body.contact_email, 'contact@example.com');
        assert.equal('admin_email' in body, false);
        assert.doesNotMatch(JSON.stringify(body), /private-admin/);
    });
});

test('checkout permanece cerrado si faltan esquema o credenciales Sandbox', async () => {
    const database = database_with(() => ({ data: [], error: null }));
    const app = create_app({ database, disable_request_log: true });
    await serve(app, async base => {
        const response = await fetch(`${base}/api/checkout/config`);
        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), { enabled: false, provider: null, mode: 'sandbox', show_test_data: false });
    });
});

test('mutaciones rechazan orígenes cruzados y aceptan el mismo origen', async () => {
    const database = database_with(() => ({ data: [], error: null }));
    const app = create_app({ database, disable_request_log: true });
    await serve(app, async base => {
        const cross_site = await fetch(`${base}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Origin: 'https://evil.example' },
            body: JSON.stringify({ email: 'ana@example.com', password: 'password-segura' })
        });
        assert.equal(cross_site.status, 403);
        assert.match((await cross_site.json()).error, /Origen/);

        const same_site = await fetch(`${base}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Origin: base },
            body: JSON.stringify({ email: 'correo-invalido', password: 'password-segura' })
        });
        assert.equal(same_site.status, 400);

        const fetch_metadata = await fetch(`${base}/api/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Sec-Fetch-Site': 'cross-site' },
            body: JSON.stringify({ rating: 5, comment: 'No debe llegar a la ruta.' })
        });
        assert.equal(fetch_metadata.status, 403);
    });
});

test('una allowlist configurada no confía en un Host dinámico', async () => {
    const database = database_with(() => ({ data: [], error: null }));
    const app = create_app({ database, disable_request_log: true, allowed_origins: 'https://dreams.example' });
    await serve(app, async base => {
        const dynamic_host = await fetch(`${base}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Origin: base },
            body: JSON.stringify({ email: 'correo-invalido', password: 'password-segura' })
        });
        assert.equal(dynamic_host.status, 403);

        const configured = await fetch(`${base}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Origin: 'https://dreams.example' },
            body: JSON.stringify({ email: 'correo-invalido', password: 'password-segura' })
        });
        assert.equal(configured.status, 400);
    });
});

test('una opinión autenticada se persiste y reaparece al recargar la lista', async () => {
    const reviews = [];
    const database = database_with(table => {
        if (table === 'profiles') return { data: { name: 'Ana', role: 'customer' }, error: null };
        if (table === 'reviews') return { data: reviews, error: null };
        return { data: [], error: null };
    });
    database.auth.getUser = async token => ({
        data: { user: token === 'valid-token' ? { id: 'user-1', email: 'ana@example.com', user_metadata: {} } : null }
    });
    database.from = table => {
        if (table === 'profiles') return query({ data: { name: 'Ana', role: 'customer' }, error: null });
        if (table === 'reviews') {
            return {
                select() { return { order: async () => ({ data: reviews, error: null }) }; },
                async insert(value) {
                    reviews.unshift({ id: 1, ...value, created_at: '2026-08-29T00:00:00Z' });
                    return { error: null };
                }
            };
        }
        return query({ data: [], error: null });
    };

    const app = create_app({ database, disable_request_log: true });
    await serve(app, async base => {
        const created = await fetch(`${base}/api/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Origin: base, Cookie: 'dreams_access_token=valid-token' },
            body: JSON.stringify({ rating: 5, comment: 'Una experiencia muy cuidada.' })
        });
        assert.equal(created.status, 201);

        const reloaded = await fetch(`${base}/api/reviews`);
        assert.equal(reloaded.status, 200);
        const [review] = await reloaded.json();
        assert.equal(review.comment, 'Una experiencia muy cuidada.');
        assert.equal(review.user_name, 'Ana');
        assert.equal(review.user_id, 'user-1');
    });
});

test('registro pendiente distingue confirmación de correo de una sesión activa', async () => {
    const database = database_with(() => ({ data: [], error: null }));
    database.auth.signUp = async () => ({ data: { user: { id: 'new-user' }, session: null }, error: null });
    const app = create_app({ database, disable_request_log: true });
    await serve(app, async base => {
        const response = await fetch(`${base}/api/auth/register`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Ana', email: ' ANA@EXAMPLE.COM ', password: 'password-segura' })
        });
        assert.equal(response.status, 202);
        const body = await response.json();
        assert.equal(body.authenticated, false);
        assert.equal(body.requires_email_confirmation, true);
        assert.match(body.message, /confirmación/);
    });
});

test('login válido crea cookies y devuelve una redirección explícita', async () => {
    let profile_reads = 0;
    const database = database_with(table => {
        assert.equal(table, 'profiles');
        profile_reads += 1;
        return { data: { name: 'Administración', role: 'admin' }, error: null };
    });
    database.auth.signInWithPassword = async ({ email }) => ({
        data: {
            user: { id: 'admin-user', email, user_metadata: {} },
            session: { access_token: 'access', refresh_token: 'refresh', expires_in: 3600 }
        },
        error: null
    });
    const app = create_app({ database, disable_request_log: true });
    await serve(app, async base => {
        const response = await fetch(`${base}/api/auth/login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: ' ADMIN@EXAMPLE.COM ', password: 'password-segura' })
        });
        assert.equal(response.status, 200);
        const body = await response.json();
        assert.equal(body.authenticated, true);
        assert.equal(body.redirect, '/admin');
        assert.equal(body.user.email, 'admin@example.com');
        assert.match(response.headers.get('set-cookie'), /dreams_access_token=access/);
        assert.equal(profile_reads, 1);
    });
});

test('favoritos retirados devuelve 404 en API y redirige la página histórica', async () => {
    const database = database_with(() => ({ data: [], error: null }));
    const app = create_app({ database, disable_request_log: true });
    await serve(app, async base => {
        const api = await fetch(`${base}/api/favorites`, { redirect: 'manual' });
        assert.equal(api.status, 404);
        const page = await fetch(`${base}/favoritos.html`, { redirect: 'manual' });
        assert.equal(page.status, 301);
        assert.equal(page.headers.get('location'), '/catalogo.html');
    });
});
