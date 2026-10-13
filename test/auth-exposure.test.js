// Verifica el contrato público y los logs sin usar contraseñas ni cuentas reales.
const test = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { create_app } = require('../server/app');

function auth_fixture(password, throws) {
    const user = { id: 'fixture-user', email: 'fixture@example.invalid', user_metadata: { role: 'admin', password } };
    const auth = { signInWithPassword: async () => {
        if (throws) throw new Error(password);
        return { data: { user, session: { access_token: 'fixture-access', refresh_token: 'fixture-refresh', expires_in: 3600 } } };
    } };
    return { auth, from: () => ({ select() { return this; }, eq() { return this; },
        maybeSingle: async () => ({ data: { name: 'Cliente fixture', role: 'customer' }, error: null }) }) };
}

async function with_auth_fixture(throws, action) {
    const password = randomUUID();
    const logs = [];
    const database = auth_fixture(password, throws);
    const app = create_app({ database, disable_request_log: true, logger: { error: (...args) => logs.push(args) } });
    const server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    try { await action(base, password, logs); }
    finally { await new Promise(resolve => server.close(resolve)); }
}

function submit_login(base, password) {
    return fetch(base + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: base },
        body: JSON.stringify({ email: 'fixture@example.invalid', password }) });
}

test('login no devuelve password/tokens ni autoriza metadata admin; cookies siguen privadas', async () => {
    await with_auth_fixture(false, async (base, password, logs) => {
        const response = await submit_login(base, password);
        const body = await response.json();
        assert.equal(response.status, 200);
        assert.equal(body.user.is_admin, false);
        assert.equal(JSON.stringify(body).includes(password), false);
        assert.equal(JSON.stringify(body).includes('fixture-access'), false);
        assert.equal(JSON.stringify(logs).includes(password), false);
        response.headers.getSetCookie().forEach(cookie => assert.match(cookie, /HttpOnly; SameSite=Lax/));
    });
});

test('un error Auth no expone mensaje del proveedor ni password en respuesta o logs', async () => {
    await with_auth_fixture(true, async (base, password, logs) => {
        const response = await submit_login(base, password);
        assert.equal(response.status, 500);
        assert.equal((await response.text()).includes(password), false);
        assert.equal(JSON.stringify(logs).includes(password), false);
        assert.equal(logs.length, 1);
    });
});
