const test = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { create_app } = require('../server/app');
const A = '11111111-1111-4111-8111-111111111111', B = '22222222-2222-4222-8222-222222222222';
function fixture() {
    const rows = [], calls = [], users = { A: { id: A, name: 'Ana' }, B: { id: B, name: 'Bruno' }, admin: { id: 'admin', name: 'Moderador' } };
    const auth = { getUser: async token => ({ data: { user: users[token] ? { ...users[token], email: 'private@example.invalid' } : null } }) };
    const client = token => ({ auth, from: table => query(table, token, { rows, calls, users }) });
    return { rows, calls, database: client(), create_auth_client: client };
}
function query(table, token, state) {
    let remove = false; const filters = [];
    const q = { select() { return q; }, order() { return q; }, maybeSingle() { q.single = true; return q; }, eq(key, value) { filters.push([key, value]); return q; } };
    q.insert = async row => {
        state.calls.push(row);
        if (state.rows.some(r => r.user_id === row.user_id && r.operation_id === row.operation_id)) return { error: { code: '23505' } };
        state.rows.push({ ...row, id: state.rows.length + 1, created_at: new Date().toISOString() }); return { error: null };
    };
    q.delete = () => { assert.ok(token, 'own delete must use limited JWT'); remove = true; return q; };
    q.then = (resolve, reject) => Promise.resolve().then(() => query_result(table, token, state, filters, remove, q.single)).then(resolve, reject);
    return q;
}
function query_result(table, token, state, filters, remove, single) {
    if (table === 'profiles') { const user = Object.values(state.users).find(u => u.id === filters[0]?.[1]); return { data: { name: user?.name, role: user?.id === 'admin' ? 'admin' : 'customer' } }; }
    let rows = state.rows.filter(row => filters.every(([key, value]) => row[key] === value));
    if (remove) {
        rows = rows.filter(row => row.user_id === state.users[token]?.id || token === 'admin');
        for (const row of rows) state.rows.splice(state.rows.indexOf(row), 1);
    }
    return { data: single ? rows[0] || null : rows };
}
async function serve(callback) {
    const f = fixture(), app = create_app({ ...f, customer_data_enabled: true, preview_read_only: true, disable_request_log: true });
    const server = app.listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve));
    const base = 'http://127.0.0.1:' + server.address().port;
    const send = (token, path, method = 'GET', body) => fetch(base + path, { method, headers: { Cookie: 'dreams_access_token=' + token, Origin: base, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
    try { await callback(send, f); } finally { await new Promise(resolve => server.close(resolve)); }
}
const payload = () => ({ rating: 5, comment: 'Opinión exclusivamente de prueba.', operation_id: randomUUID() });
test('owner linked from session, no public UUID/email, own delete only; B and visitor direct requests denied', async () => {
    await serve(async (send, f) => {
        assert.equal((await send('A', '/api/reviews', 'POST', payload())).status, 201);
        assert.equal(f.rows[0].user_id, A); assert.equal(f.rows[0].user_name, 'Ana');
        const own = await (await send('A', '/api/reviews')).json(), other = await (await send('B', '/api/reviews')).json();
        assert.equal(own[0].can_delete, true); assert.equal(other[0].can_delete, false);
        assert.doesNotMatch(JSON.stringify(own), /private@|user_id|operation_id/);
        assert.equal((await send('B', '/api/reviews/1', 'DELETE')).status, 404);
        assert.equal((await send('', '/api/reviews/1', 'DELETE')).status, 401);
        assert.equal(f.rows.length, 1);
        assert.equal((await send('A', '/api/reviews/1', 'DELETE')).status, 200);
        assert.equal(f.rows.length, 0);
        assert.equal((await send('A', '/api/reviews/1', 'DELETE')).status, 404);
    });
});
test('idempotent retries preserve one review and conflicting reuse is rejected', async () => {
    await serve(async (send, f) => {
        const body = payload(); assert.equal((await send('A', '/api/reviews', 'POST', body)).status, 201);
        assert.equal((await send('A', '/api/reviews', 'POST', body)).status, 200); assert.equal(f.rows.length, 1);
        assert.equal((await send('A', '/api/reviews', 'POST', { ...body, comment: 'Cambio' })).status, 409);
        assert.equal((await send('B', '/api/reviews', 'POST', body)).status, 201); assert.equal(f.rows.length, 2);
    });
});
test('forged author/role and malformed review are rejected before insert, commercial/Admin preview stays blocked', async () => {
    await serve(async (send, f) => {
        for (const extra of [{ user_id: B }, { user_name: 'Otro' }, { role: 'admin' }, { rating: 9 }, { comment: ' ' }]) assert.equal((await send('A', '/api/reviews', 'POST', { ...payload(), ...extra })).status, 400);
        assert.equal((await send('A', '/api/reviews', 'POST', payload())).status, 429);
        assert.equal(f.rows.length, 0);
        assert.equal((await send('A', '/api/reviews/1', 'DELETE', { user_id: B })).status, 400);
        for (const path of ['/api/admin/reviews/1', '/api/admin/products/1', '/api/checkout/session', '/api/payments/webhook']) assert.equal((await send('admin', path, 'POST', {})).status, 403);
    });
});
test('Auth outage is not reported as incorrect login credentials', async () => {
    const app = create_app({ database: {}, create_auth_client: () => ({ auth: { signInWithPassword: async () => ({ data: {}, error: { status: 503, name: 'AuthRetryableFetchError', message: 'private provider detail' } }) } }), disable_request_log: true });
    const server = app.listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve));
    const base = 'http://127.0.0.1:' + server.address().port;
    try {
        const response = await fetch(base + '/api/auth/login', { method: 'POST', headers: { Origin: base, 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'fixture@example.invalid', password: 'not-a-real-credential' }) });
        assert.equal(response.status, 503); assert.doesNotMatch(JSON.stringify(await response.json()), /private|incorrectos/);
    } finally { await new Promise(resolve => server.close(resolve)); }
});
