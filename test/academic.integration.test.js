const test = require('node:test');
const assert = require('node:assert/strict');
const { create_app } = require('../server/app');

function db(role = 'customer') {
    const state = { writes: 0 };
    return { state, auth: { getUser: async token => ({ data: { user: token === 'verified' ? { id: 'fixture', email: 'fixture@example.com', user_metadata: { role: 'admin' } } : null } }) }, from(table) {
        if (!['products', 'profiles'].includes(table)) throw new Error('Commercial data must not be accessed by presentation');
        const q = { select() { return q; }, eq() { return q; }, in() { return q; }, maybeSingle() { return q; }, then(resolve, reject) { return Promise.resolve({ data: table === 'profiles' ? { name: 'Fixture', role } : [{ id: 7, brand: 'Fixture', name: 'Test product', price: 120, stock: 3 }], error: null }).then(resolve, reject); } };
        for (const method of ['insert', 'upsert', 'update', 'delete']) q[method] = () => { state.writes++; throw new Error('No writes allowed'); };
        return q;
    } };
}
async function serve(options, fn) {
    const app = create_app({ database: db(), disable_request_log: true, logger: { error() {}, warn() {} }, ...options });
    const server = app.listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve));
    try { await fn(`http://127.0.0.1:${server.address().port}`); } finally { await new Promise(resolve => server.close(resolve)); }
}
const post = (base, path, body, cookie = '') => fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: base, Cookie: cookie }, body: JSON.stringify(body) });
const enabled = { presentation_checkout: true, presentation_signing_key: 'a'.repeat(64), preview_read_only: true };

test('presentation is disabled by default and requires its own signing secret, independently of commercial schema', async () => {
    await serve({ presentation_checkout: true }, async base => { assert.equal((await post(base, '/api/presentation/session', {})).status, 404); assert.equal((await (await fetch(base + '/api/checkout/config')).json()).enabled, false); });
    await serve(enabled, async base => { const config = await (await fetch(base + '/api/checkout/config')).json(); assert.equal(config.enabled, true); assert.equal(config.provider, 'presentation_demo'); assert.equal((await post(base, '/api/checkout/session', {})).status, 403); });
});
test('signed presentation recalculates products, isolates stock/orders, replays deterministically and verifies all outcomes', async () => {
    const database = db();
    await serve({ ...enabled, database }, async base => {
        for (const scenario of ['approved', 'rejected', 'pending', 'error']) {
            const created = await post(base, '/api/presentation/session', { items: [{ id: 7, quantity: 2 }], scenario, intent_id: require('node:crypto').randomUUID() });
            assert.equal(created.status, 200);
            const cookie = created.headers.getSetCookie()[0].split(';')[0];
            const data = await created.json(); assert.equal(data.subtotal, 240); assert.equal(data.shipping, null);
            const pay = await post(base, '/api/presentation/payment', { ticket: data.ticket }, cookie); const receipt = await pay.json();
            assert.equal(receipt.status, scenario);
            assert.deepEqual(await (await post(base, '/api/presentation/payment', { ticket: data.ticket }, cookie)).json(), receipt);
            const result = await (await post(base, '/api/presentation/result', { receipt: receipt.receipt }, cookie)).json();
            assert.equal(result.status, scenario); assert.equal(result.subtotal, 240); assert.equal(result.simulated, true); assert.match(result.reference, /^DEMO-/);
            assert.equal((await post(base, '/api/presentation/payment', { ticket: data.ticket }, 'dreams_presentation=11111111-1111-4111-8111-111111111111')).status, 400);
            assert.equal((await post(base, '/api/presentation/result', { receipt: receipt.receipt.slice(0, -5) + 'wrong' }, cookie)).status, 400);
            assert.equal((await post(base, '/api/presentation/payment', { ticket: receipt.receipt }, cookie)).status, 400);
        }
    });
    assert.equal(database.state.writes, 0);
});
test('presentation rejects sensitive fields, browser totals, invalid scenarios and unavailable quantities', async () => {
    await serve(enabled, async base => {
        const body = { items: [{ id: 7, quantity: 1 }], scenario: 'approved', intent_id: require('node:crypto').randomUUID() };
        for (const extra of [{ card_number: '4242424242424242' }, { cvv: '123' }, { total: 1 }, { buyer_email: 'x@example.com' }, { scenario: 'paid' }, { items: [{ id: 7, quantity: 1, price: 1 }] }]) assert.equal((await post(base, '/api/presentation/session', { ...body, ...extra })).status, 400);
        assert.equal((await post(base, '/api/presentation/session', { ...body, items: [{ id: 7, quantity: 4 }] })).status, 409);
        assert.equal((await post(base, '/api/presentation/result', { receipt: 'forged' })).status, 400);
    });
});
test('all admin modules reject anonymous and user-editable admin metadata; preview blocks writes even for an administrator', async () => {
    for (const role of ['customer', 'admin']) await serve({ database: db(role), preview_read_only: true }, async base => {
        for (const path of ['/admin', '/admin.html', '/api/admin/stats', '/api/admin/products', '/api/admin/users', '/api/admin/inquiries', '/api/admin/reviews', '/api/admin/orders', '/api/admin/coupons']) {
            assert.equal((await fetch(base + path)).status, 403, path);
            if (role === 'customer') assert.equal((await fetch(base + path, { headers: { Cookie: 'dreams_access_token=verified' } })).status, 403, path);
        }
        assert.equal((await post(base, '/api/admin/products', {}, 'dreams_access_token=verified')).status, 403);
        assert.equal((await post(base, '/api/auth/register', { email: 'no-write@example.com', password: 'not-used', name: 'Test' })).status, 403);
    });
});
test('Google fails clearly while unconfigured and callbacks without PKCE cannot create sessions', async () => {
    await serve({}, async base => {
        assert.equal((await (await fetch(base + '/api/auth/google/config')).json()).enabled, false);
        assert.equal((await post(base, '/api/auth/google', {})).status, 503);
        const response = await fetch(base + '/api/auth/google/callback?code=forged', { redirect: 'manual' });
        assert.equal(response.status, 303); assert.equal(response.headers.get('location'), '/cuenta.html?auth_error=1');
        assert.equal(response.headers.getSetCookie().some(cookie => cookie.startsWith('dreams_access_token=')), false);
    });
});
test('Google binds code exchange to HttpOnly PKCE cookie and server profile; no email/metadata promotion or open redirects', async () => {
    const calls = [];
    const create_oauth_client = storage => ({ auth: {
        signInWithOAuth: async options => { calls.push(options); storage.setItem('dreams-google-code-verifier', 'fixture-verifier'); return { data: { url: 'https://fixture.supabase.co/auth/v1/authorize?provider=google' } }; },
        exchangeCodeForSession: async code => { assert.equal(storage.getItem('dreams-google-code-verifier'), 'fixture-verifier'); return code === 'good' ? { data: { user: { id: 'fixture', email: 'fixture@example.com', user_metadata: { role: 'admin' } }, session: { access_token: 'fixture-token', refresh_token: 'fixture-refresh', expires_in: 3600 } } } : { error: new Error('Invalid exchange'), data: {} }; }
    } });
    await serve({ google_access_ready: true, create_oauth_client, google_provider_enabled: async () => true, app_base_url: 'https://preview.example', production: true }, async base => {
        const start = await post(base, '/api/auth/google', { next: 'https://attacker.example', email: 'admindreams@gmail.com' });
        assert.equal(start.status, 200); const header = start.headers.getSetCookie()[0]; assert.match(header, /HttpOnly/); assert.match(header, /Secure/); assert.match(header, /Max-Age=600/);
        const result = await fetch(base + '/api/auth/google/callback?code=good', { headers: { Cookie: header.split(';')[0] }, redirect: 'manual' });
        assert.equal(result.headers.get('location'), '/cuenta.html'); assert.equal(result.headers.getSetCookie().length, 3);
        assert.equal(calls[0].provider, 'google'); assert.equal(calls[0].options.redirectTo, 'https://preview.example/api/auth/google/callback');
        const cancelled = await fetch(base + '/api/auth/google/callback?error=access_denied', { headers: { Cookie: header.split(';')[0] }, redirect: 'manual' }); assert.equal(cancelled.headers.get('location'), '/cuenta.html?auth_error=1');
    });
});

test('configuration reads do not consume the checkout submission budget', async () => {
    await serve({}, async base => {
        for (let i = 0; i < 25; i++) assert.equal((await fetch(base + '/api/checkout/config')).status, 200);
        for (let i = 0; i < 15; i++) assert.equal((await post(base, '/api/checkout/session', {})).status, 401);
        assert.equal((await post(base, '/api/checkout/session', {})).status, 429);
    });
});

test('Google provider alone cannot hide legacy access before explicit flow validation', async () => {
    await serve({ create_oauth_client() { throw new Error('Must not start OAuth'); }, google_provider_enabled: async () => true, app_base_url: 'https://preview.example' }, async base => {
        assert.equal((await (await fetch(base + '/api/auth/google/config')).json()).enabled, false);
        assert.equal((await post(base, '/api/auth/google', {})).status, 503);
    });
});

test('Admin translates a non-JSON upstream failure into a controlled error', async () => {
    const vm = require('node:vm');
    const context = vm.createContext({ document: { addEventListener() {} }, fetch: async () => ({ ok: false, json: async () => { throw new SyntaxError('upstream html'); } }) });
    vm.runInContext(require('node:fs').readFileSync(require.resolve('../public/js/admin.js'), 'utf8'), context);
    await assert.rejects(context.admin_fetch('/api/admin/products'), /Ocurrió un error/);
});

test('Admin renders order labels in Spanish without changing stored statuses or providers', async () => {
    const vm = require('node:vm');
    const nodes = { 'admin-orders': { innerHTML: '' }, 'order-total': { textContent: '' } };
    const orders = ['created', 'approved', 'rejected', 'pending', 'cancelled', 'error'].map((status, i) => ({ status, provider: i % 2 ? 'mercado_pago' : 'demo', order_number: `DRM-${i}`, created_at: '2026-10-08T00:00:00Z', total: 100, items: [] }));
    const original = structuredClone(orders);
    const context = vm.createContext({ document: { addEventListener() {}, getElementById: id => nodes[id] }, escape_html: require('../public/js/safe').escape_html, fetch: async () => ({ ok: true, json: async () => orders }) });
    vm.runInContext(require('node:fs').readFileSync(require.resolve('../public/js/admin.js'), 'utf8'), context);
    await context.load_orders();
    for (const label of ['Creado', 'Aprobado', 'Rechazado', 'Pendiente', 'Cancelado', 'Error', 'Mercado Pago', 'Simulación de prueba']) assert.ok(nodes['admin-orders'].innerHTML.includes(label), label);
    assert.doesNotMatch(nodes['admin-orders'].innerHTML, />approved<|>pending<|>mercado_pago<|>demo</);
    assert.deepEqual(orders, original);
});
