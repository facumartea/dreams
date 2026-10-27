const test = require('node:test');
const assert = require('node:assert/strict');
const { create_app } = require('../server/app');
const { OFFICIAL_ORIGIN, official_enabled, official_route } = require('../server/official-policy');
const { memory_database, product } = require('./helpers/admin-fixture.cjs');
async function serve(callback) {
    const database = memory_database(), tokens = [];
    const app = create_app({ database, create_auth_client: token => { tokens.push(token); return database; }, disable_request_log: true, preview_read_only: true, official_api: true, app_base_url: OFFICIAL_ORIGIN, allowed_origins: OFFICIAL_ORIGIN });
    const server = app.listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve));
    const base = 'http://127.0.0.1:' + server.address().port;
    const send = (method, path, token = '', body = {}, origin = OFFICIAL_ORIGIN) => fetch(base + path, { method, headers: { Origin: origin, Cookie: 'dreams_access_token=' + token, 'Content-Type': 'application/json' }, ...(['GET', 'HEAD'].includes(method) ? {} : { body: JSON.stringify(body) }) });
    try { await callback(send, database.state, tokens); } finally { await new Promise(resolve => server.close(resolve)); }
}
test('official capability requires exact origin and explicit boolean', () => {
    assert.equal(official_enabled({ official_api: true, app_base_url: OFFICIAL_ORIGIN }), true);
    for (const options of [{}, { official_api: 'true', app_base_url: OFFICIAL_ORIGIN }, { official_api: true, app_base_url: OFFICIAL_ORIGIN + '/' }, { official_api: true, app_base_url: 'https://preview.invalid' }]) assert.equal(official_enabled(options), false);
    for (const [method, path] of [['POST', '/api/checkout/session'], ['POST', '/api/payments/webhook'], ['PATCH', '/api/admin/users/1'], ['POST', '/api/auth/register/extra'], ['DELETE', '/api/admin/products/0'], ['PUT', '/api/admin/products/1/extra'], ['GET', '/api/anything']]) assert.equal(official_route(method, path), false, method + path);
});
for (const token of ['', 'fixture-customer']) {
    for (const [method, path] of [['POST', '/api/admin/products'], ['PUT', '/api/admin/products/7'], ['DELETE', '/api/admin/products/7'], ['GET', '/admin']]) {
        test(`official ${method} ${path} denies ${token || 'visitor'}`, async () => serve(async (send, state) => {
            assert.equal((await send(method, path, token, product())).status, 403); assert.equal(state.products.length, 1); assert.equal(state.products[0].id, 7);
        }));
    }
}
test('official Admin creates, edits, reloads and deletes fixtures using its JWT; capability stays separate from commercial checkout', async () => serve(async (send, state, tokens) => {
    const config = await (await send('GET', '/api/config')).json(); assert.equal(config.admin_writes_enabled, true); assert.equal(config.preview_read_only, true);
    const input = product(); delete input.id;
    assert.equal((await send('POST', '/api/admin/products', 'fixture-admin', input)).status, 201);
    assert.equal(state.products.length, 2); const id = state.products[1].id;
    assert.equal((await send('PUT', '/api/admin/products/' + id, 'fixture-admin', { ...input, name: 'Updated fixture', stock: 4, image_url: 'https://images.example.invalid/perfume.webp' })).status, 200);
    const rows = await (await send('GET', '/api/admin/products', 'fixture-admin')).json(); assert.equal(rows.find(p => p.id === id).stock, 4); assert.equal(rows.find(p => p.id === id).image_url, 'https://images.example.invalid/perfume.webp');
    assert.equal((await send('DELETE', '/api/admin/products/' + id, 'fixture-admin')).status, 200); assert.equal(state.products.length, 1);
    assert.ok(tokens.every(token => token === 'fixture-admin'));
}));
for (const [method, path] of [['POST', '/api/checkout/session'], ['POST', '/api/payments/webhook'], ['POST', '/api/coupons/validate'], ['PATCH', '/api/admin/users/7'], ['POST', '/api/admin/products/extra']]) {
    test(`official keeps commercial/unknown write blocked: ${method} ${path}`, async () => serve(async (send, state) => {
        assert.equal((await send(method, path, 'fixture-admin')).status, 403); assert.equal(state.orders.length, 0); assert.equal(state.products.length, 1);
    }));
}
test('official mutations preserve origin guard and input validation', async () => serve(async (send, state) => {
    assert.equal((await send('PUT', '/api/admin/products/7', 'fixture-admin', product(), 'https://evil.invalid')).status, 403);
    assert.equal((await send('PUT', '/api/admin/products/7', 'fixture-admin', { ...product(), stock: -1 })).status, 400);
    assert.equal(state.products[0].stock, 2);
}));
