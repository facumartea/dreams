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
            admin: {
                signOut: async () => ({ error: null }),
                createUser: async () => ({ data: { user: { id: 'demo-user' } }, error: null })
            }
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

test('cotización no publica WhatsApp sin contacto válido y usa precios del servidor', async () => {
    const row = { id: 1, brand: 'Fixture', name: 'Perfume', stock: 3, price: 150, size_ml: 50 };
    for (const number of ['', '123', '+54 9 11 1234 5678']) {
        const database = database_with(table => {
            assert.equal(table, 'products');
            return { data: [row], error: null };
        });
        await serve(create_app({ database, whatsapp_number: number, disable_request_log: true }), async base => {
            const response = await fetch(`${base}/api/cart/quote`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: [{ id: 1, quantity: 2, price: 1 }] })
            });
            assert.equal(response.status, 200);
            const body = await response.json();
            assert.equal(body.total, 300);
            if (number.length < 8) assert.equal(body.whatsapp_url, null);
            else {
                const url = new URL(body.whatsapp_url);
                assert.equal(url.hostname, 'wa.me');
                assert.equal(url.pathname, '/5491112345678');
                assert.match(url.searchParams.get('text'), /2 × Fixture Perfume — 300 ARS/);
                assert.match(url.searchParams.get('text'), /Subtotal de referencia: 300 ARS/);
                assert.match(url.searchParams.get('text'), /Envío a consultar, no incluido/);
            }
        });
    }
});

test('checkout requiere proveedor, URL y esquema: demo por sí solo no habilita compra', async () => {
    const { DemoPaymentProvider } = require('../server/payments/demo');
    const { MercadoPagoProvider } = require('../server/payments/mercado-pago');
    const database = database_with(() => { throw new Error('Config must not read or write commercial data'); });
    const ready = { payment_provider: new DemoPaymentProvider(), app_base_url: 'https://preview.example', checkout_schema_ready: true };
    for (const [override, enabled] of [
        [{ checkout_schema_ready: false }, false],
        [{ app_base_url: '' }, false],
        [{ payment_provider: new MercadoPagoProvider({ access_token: '', webhook_secret: '' }) }, false],
        [{}, true]
    ]) {
        await serve(create_app({ database, ...ready, ...override, disable_request_log: true }), async base => {
            const response = await fetch(`${base}/api/checkout/config`);
            assert.equal(response.status, 200);
            const body = await response.json();
            assert.equal(body.enabled, enabled);
            assert.equal(body.provider, enabled ? 'demo' : null);
        });
    }
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

test('modo demo confirma el alta en servidor e inicia sesión sin correo', async () => {
    const database = database_with(() => ({ data: null, error: null }));
    let created_payload;
    database.auth.admin.createUser = async value => {
        created_payload = value;
        return { data: { user: { id: 'demo-user' } }, error: null };
    };
    const auth = { auth: { signInWithPassword: async ({ email }) => ({
        data: {
            user: { id: 'demo-user', email },
            session: { access_token: 'demo-access', refresh_token: 'demo-refresh', expires_in: 3600 }
        },
        error: null
    }) } };
    const app = create_app({ database, create_auth_client: () => auth, demo_auto_confirm_email: true, disable_request_log: true });
    await serve(app, async base => {
        const response = await fetch(`${base}/api/auth/register`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', Origin: base },
            body: JSON.stringify({ name: 'Ana', email: ' ANA@EXAMPLE.COM ', password: 'password-segura' })
        });
        assert.equal(response.status, 201);
        const body = await response.json();
        assert.equal(body.authenticated, true);
        assert.equal(body.demo, true);
        assert.equal(body.user.is_admin, false);
        assert.equal(created_payload.email_confirm, true);
        assert.deepEqual(created_payload.user_metadata, { name: 'Ana' });
        assert.match(response.headers.get('set-cookie'), /dreams_access_token=demo-access/);
        assert.doesNotMatch(JSON.stringify(body), /confirm|correo enviado/i);
    });
});

test('modo demo no enumera usuarios mediante errores de confirmación', async () => {
    const database = database_with(() => ({ data: [], error: null }));
    database.auth.signInWithPassword = async () => ({ data: {}, error: { code: 'email_not_confirmed' } });
    const app = create_app({ database, demo_auto_confirm_email: true, disable_request_log: true });
    await serve(app, async base => {
        const response = await fetch(`${base}/api/auth/login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', Origin: base },
            body: JSON.stringify({ email: 'ana@example.com', password: 'password-segura' })
        });
        assert.equal(response.status, 401);
        const body = await response.json();
        assert.equal(body.error, 'Correo o contraseña incorrectos.');
        assert.doesNotMatch(body.error, /confirm/i);
    });
});

test('una mutación autenticada sin Origin ni Referer se rechaza', async () => {
    const database = database_with(() => ({ data: [], error: null }));
    const app = create_app({ database, disable_request_log: true });
    await serve(app, async base => {
        const response = await fetch(`${base}/api/reviews`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: 'dreams_access_token=token' },
            body: JSON.stringify({ rating: 5, comment: 'No debe procesarse.' })
        });
        assert.equal(response.status, 403);
        assert.match((await response.json()).error, /Origen/);
    });
});

test('cabeceras defensivas bloquean framing, sniffing y downgrade HTTPS', async () => {
    const database = database_with(() => ({ data: [], error: null }));
    const app = create_app({ database, production: true, disable_request_log: true });
    await serve(app, async base => {
        const response = await fetch(`${base}/`);
        assert.equal(response.status, 200);
        assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
        assert.equal(response.headers.get('x-frame-options'), 'SAMEORIGIN');
        assert.match(response.headers.get('strict-transport-security') || '', /max-age=/);
        assert.match(response.headers.get('referrer-policy') || '', /no-referrer/);
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

test('rutas web inexistentes responden una página 404 real', async () => {
    const database = database_with(() => ({ data: [], error: null }));
    const app = create_app({ database, disable_request_log: true });
    await serve(app, async base => {
        const response = await fetch(`${base}/pagina-que-no-existe`);
        assert.equal(response.status, 404);
        assert.match(await response.text(), /Esta página no existe/);
    });
});

test('login y registro aíslan dos sesiones del cliente privilegiado', async () => {
    const database = database_with(() => ({ data: { name: 'Cliente', role: 'customer' }, error: null }));
    database.auth.signInWithPassword = database.auth.signUp = async () => assert.fail('no autenticar en el cliente privilegiado');
    const clients = [];
    const create_auth_client = () => {
        const client = { session: null, auth: {} };
        const sign = async ({ email }) => {
            client.session = email;
            return { data: { user: { id: email, email }, session: { access_token: email, refresh_token: `refresh-${email}`, expires_in: 3600 } }, error: null };
        };
        client.auth.signInWithPassword = client.auth.signUp = sign;
        clients.push(client);
        return client;
    };
    await serve(create_app({ database, create_auth_client, disable_request_log: true }), async base => {
        const responses = await Promise.all(['ana', 'bea'].map(name => fetch(base + '/api/auth/login', {
            method: 'POST', headers: { 'Content-Type': 'application/json', Origin: base }, body: JSON.stringify({ email: `${name}@example.com`, password: 'test-password' })
        })));
        assert.deepEqual(responses.map(response => response.status), [200, 200]);
        assert.match(responses[0].headers.get('set-cookie'), /ana%40example.com/);
        assert.match(responses[1].headers.get('set-cookie'), /bea%40example.com/);
        const registered = await fetch(base + '/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: base }, body: JSON.stringify({ name: 'Cris', email: 'cris@example.com', password: 'test-password' }) });
        assert.equal(registered.status, 200);
        assert.equal(new Set(clients).size, 3);
        assert.deepEqual(clients.map(client => client.session), ['ana@example.com', 'bea@example.com', 'cris@example.com']);
        assert.equal((await fetch(base + '/api/auth/me').then(response => response.json())).user, null);
    });
});

test('refresh usa cliente aislado; logout revoca local y borra ambas cookies', async () => {
    const database = database_with(() => ({ data: { name: 'Ana', role: 'customer' }, error: null }));
    database.auth.getUser = async token => ({ data: { user: token === 'new-access' ? { id: 'ana', email: 'ana@example.com' } : null } });
    database.auth.admin.signOut = async () => assert.fail('logout no usa cliente global');
    let refreshes = 0, revokes = 0;
    const create_auth_client = () => ({ auth: {
        refreshSession: async input => {
            assert.equal(input.refresh_token, 'old-refresh'); refreshes++;
            return { data: { user: { id: 'ana', email: 'ana@example.com' }, session: { access_token: 'new-access', refresh_token: 'new-refresh', expires_in: 3600 } }, error: null };
        },
        admin: { signOut: async (token, scope) => { assert.equal(token, 'new-access'); assert.equal(scope, 'local'); revokes++; return { error: null }; } }
    } });
    await serve(create_app({ database, create_auth_client, disable_request_log: true }), async base => {
        const restored = await fetch(base + '/api/auth/me', { headers: { Cookie: 'dreams_access_token=expired; dreams_refresh_token=old-refresh' } });
        assert.equal((await restored.json()).user.id, 'ana');
        assert.match(restored.headers.get('set-cookie'), /new-access/);
        const logout = await fetch(base + '/api/auth/logout', { method: 'POST', headers: { Cookie: 'dreams_access_token=new-access', Origin: base } });
        assert.equal(logout.status, 200);
        assert.equal(logout.headers.getSetCookie().length, 2);
        for (const cookie of logout.headers.getSetCookie()) assert.match(cookie, /Max-Age=0/);
        assert.equal(refreshes, 1); assert.equal(revokes, 1);
    });
});

test('health detecta esquema incompleto, incluye checkout cuando está habilitado', async () => {
    const calls = [];
    const database = database_with(table => ({ data: [], error: table === 'coupons' ? { code: '42703', message: 'private details' } : null }));
    const original = database.from;
    database.from = table => { calls.push(table); return original(table); };
    await serve(create_app({ database, checkout_schema_ready: true, product_brand_column: 'marca', disable_request_log: true, logger: { error() {} } }), async base => {
        const response = await fetch(base + '/api/health');
        assert.equal(response.status, 503);
        assert.ok(calls.includes('orders') && calls.includes('coupons') && calls.includes('profiles'));
        assert.doesNotMatch(await response.text(), /private details/);
    });
});

test('home puede limitar productos en servidor sin recortar catálogo completo', async () => {
    let requested;
    const database = database_with(() => ({ data: [], error: null }));
    database.from = () => { const q = query({ data: [], error: null }); q.limit = n => { requested = n; return q; }; return q; };
    await serve(create_app({ database, disable_request_log: true }), async base => {
        assert.equal((await fetch(base + '/api/products?limit=8')).status, 200);
        assert.equal(requested, 8);
        requested = undefined;
        await fetch(base + '/api/products'); assert.equal(requested, undefined);
        await fetch(base + '/api/products?limit=10000'); assert.equal(requested, 100);
    });
});
