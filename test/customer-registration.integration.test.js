const test = require('node:test');
const assert = require('node:assert/strict');
const { create_app } = require('../server/app');

const input = { name: 'Prueba', email: 'fixture@example.invalid', password: 'fixture-password' };

function fixture(options = {}) {
    const state = { calls: 0, profiles: [], signed: false };
    const user = { id: 'customer-fixture', email: input.email, user_metadata: { role: 'admin' } };
    const auth = {
        signUp: async values => signup_fixture(state, user, values, options),
        getUser: async token => ({ data: { user: state.signed && token === 'fixture-access' ? user : null } }),
        signInWithPassword: async () => { state.signed = true; return { data: { user, session: fixture_session() }, error: null }; },
        admin: { createUser() { throw new Error('Administrative signup forbidden'); }, signOut: async () => { state.signed = false; return { error: null }; } }
    };
    const database = { auth, from: table => profile_query(table, state, options) };
    return { state, database, create_auth_client: () => ({ auth }) };
}

function fixture_session() {
    return { access_token: 'fixture-access', refresh_token: 'fixture-refresh', expires_in: 3600 };
}

function signup_fixture(state, user, values, options) {
    state.calls++;
    state.values = values;
    if (options.auth_error) return { data: {}, error: { code: 'user_already_exists', message: 'private provider detail' } };
    state.signed = !options.no_session;
    return { data: { user, session: options.no_session ? null : fixture_session() }, error: null };
}

function profile_query(table, state, options) {
    assert.equal(table, 'profiles');
    const query = { select() { return query; }, eq() { return query; }, maybeSingle() { return query; } };
    query.upsert = (value, config) => {
        state.profiles.push(value); state.profile_config = config;
        return Promise.resolve({ error: options.profile_error ? { code: 'private-error' } : null });
    };
    query.then = (resolve, reject) => Promise.resolve({ data: state.profiles[0], error: null }).then(resolve, reject);
    return query;
}

async function serve(options, callback) {
    const f = fixture(options);
    const app = create_app({ ...f, preview_read_only: true, production: true, disable_request_log: true, ...options });
    const server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    try { await callback('http://127.0.0.1:' + server.address().port, f.state); }
    finally { await new Promise(resolve => server.close(resolve)); }
}

function send(base, path, body = input, method = 'POST', cookie = '', origin = base) {
    return fetch(base + path, { method, headers: { 'Content-Type': 'application/json', Origin: origin, Cookie: cookie }, body: JSON.stringify(body) });
}

function assert_session_cookies(response) {
    const cookies = response.headers.getSetCookie();
    assert.equal(cookies.length, 2);
    for (const cookie of cookies) assert.match(cookie, /HttpOnly; SameSite=Lax;.*Secure/);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    return cookies.map(value => value.split(';')[0]).join('; ');
}

async function assert_customer_lifecycle(base, state) {
    const registered = await send(base, '/api/auth/register');
    assert.equal(registered.status, 200);
    const cookie = assert_session_cookies(registered);
    assert.equal((await registered.json()).authenticated, true);
    assert.deepEqual(state.values.options.data, { name: input.name });
    assert.deepEqual(state.profiles, [{ id: 'customer-fixture', name: input.name, role: 'customer' }]);
    assert.deepEqual(state.profile_config, { onConflict: 'id', ignoreDuplicates: true });
    const me = await (await fetch(base + '/api/auth/me', { headers: { Cookie: cookie } })).json();
    assert.equal(me.user.is_admin, false);
    assert.equal((await fetch(base + '/admin', { headers: { Cookie: cookie } })).status, 403);
    const logout = await send(base, '/api/auth/logout', {}, 'POST', cookie);
    assert.equal(logout.status, 200);
    assert.match(logout.headers.getSetCookie()[0], /Max-Age=0/);
    assert.equal((await (await fetch(base + '/api/auth/me', { headers: { Cookie: cookie } })).json()).user, null);
    await assert_new_login(base);
}

async function assert_new_login(base) {
    const login = await send(base, '/api/auth/login', input);
    assert.equal(login.status, 200);
    const cookie = assert_session_cookies(login);
    assert.equal((await login.json()).user.is_admin, false);
    const me = await (await fetch(base + '/api/auth/me', { headers: { Cookie: cookie } })).json();
    assert.equal(me.user.is_admin, false);
    assert.equal(me.user.id, 'customer-fixture');
}

test('preview admite signup normal, cookies, customer, logout y login sin bypass Admin', async () => {
    await serve({}, assert_customer_lifecycle);
});

test('solo POST exacto de registro se exceptúa; las escrituras comerciales y Admin siguen cerradas', async () => {
    await serve({}, async (base, state) => {
        const actions = [['/api/admin/products/1', 'PUT'], ['/api/admin/products', 'POST'], ['/api/admin/users/1', 'PATCH'],
            ['/api/checkout/session', 'POST'], ['/api/payments/webhook', 'POST'], ['/api/reviews', 'POST'],
            ['/api/inquiries', 'POST'], ['/api/auth/register', 'PATCH'], ['/api/auth/register/extra', 'POST']];
        for (const [path, method] of actions) {
            const response = await send(base, path, {}, method);
            assert.equal(response.status, 403, path);
            const body = await response.json();
            assert.equal(body.code, 'preview_write_blocked');
            assert.doesNotMatch(body.error, /Esta vista de prueba permite consultas/);
        }
        assert.equal(state.calls, 0);
        assert.deepEqual(state.profiles, []);
    });
});

test('registro conserva origen y rechaza rol/metadata elegidos por cliente', async () => {
    await serve({}, async (base, state) => {
        assert.equal((await send(base, '/api/auth/register', input, 'POST', '', 'https://evil.invalid')).status, 403);
        for (const extra of [{ role: 'admin' }, { is_admin: true }, { app_metadata: { role: 'admin' } }, { user_metadata: { role: 'admin' } }]) {
            assert.equal((await send(base, '/api/auth/register', { ...input, ...extra })).status, 400);
        }
        assert.equal(state.calls, 0);
        assert.deepEqual(state.profiles, []);
    });
});

test('nombre, correo y contraseña inválidos no llegan al proveedor', async () => {
    await serve({}, async (base, state) => {
        for (const extra of [{ name: ' ' }, { name: 'a'.repeat(81) }, { email: 'invalid' }, { password: 'short' }, { password: 'a'.repeat(129) }, { name: {} }]) {
            assert.equal((await send(base, '/api/auth/register', { ...input, ...extra })).status, 400);
        }
        assert.equal(state.calls, 0);
    });
});

test('cuenta existente no filtra errores ni crea perfil o cookies', async () => {
    await serve({ auth_error: true }, async (base, state) => {
        const response = await send(base, '/api/auth/register');
        assert.equal(response.status, 400);
        assert.doesNotMatch(JSON.stringify(await response.json()), /private|exists/);
        assert.equal(response.headers.getSetCookie().length, 0);
        assert.deepEqual(state.profiles, []);
    });
});

test('sesión ausente y fallo de perfil no se presentan como acceso exitoso', async () => {
    await serve({ no_session: true }, async base => {
        const response = await send(base, '/api/auth/register');
        assert.equal(response.status, 202);
        assert.equal((await response.json()).authenticated, false);
        assert.equal(response.headers.getSetCookie().length, 0);
    });
    await serve({ profile_error: true }, async base => {
        const response = await send(base, '/api/auth/register');
        assert.equal(response.status, 503);
        assert.doesNotMatch(JSON.stringify(await response.json()), /private-error/);
        assert.equal(response.headers.getSetCookie().length, 0);
    });
});

test('rate limit de Auth sigue aplicando a la excepción de registro', async () => {
    await serve({}, async (base, state) => {
        for (let i = 0; i < 20; i++) assert.equal((await send(base, '/api/auth/register', {})).status, 400);
        assert.equal((await send(base, '/api/auth/register', {})).status, 429);
        assert.equal(state.calls, 0);
    });
});
