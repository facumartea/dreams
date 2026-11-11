import test from 'node:test';
import assert from 'node:assert/strict';
import { create_proxy } from '../pages/proxy.mjs';
import { legacy_presentation } from '../worker/official-legacy.mjs';
const origin = 'https://dreams-perfumes.pages.dev';
const options = { backend_url: 'https://d5df723d-dreams-perfumes.dreams-perfumes.workers.dev', official_service: 'dreams-official-backend' };
test('private binding keeps request body, Cookie, Origin, method and fails closed when missing', async () => {
    let received, legacy = 0;
    const proxy = create_proxy({}, { ...options, fetch_backend: async () => { legacy++; return new Response('legacy'); } });
    const request = () => new Request(origin + '/api/auth/register', { method: 'POST', headers: { Origin: origin, Cookie: 'fixture=private' }, body: '{"fixture":true}' });
    const env = { DREAMS_OFFICIAL: { fetch: async r => { received = r; return Response.json({ ok: true }); } } };
    assert.equal((await proxy.fetch(request(), env)).status, 200); assert.equal(received.url, origin + '/api/auth/register'); assert.equal(received.headers.get('Cookie'), 'fixture=private'); assert.equal(received.headers.get('Origin'), origin); assert.equal(await received.text(), '{"fixture":true}');
    assert.equal((await proxy.fetch(request(), {})).status, 503); assert.equal(legacy, 0);
});
test('multi-filter catalog reads use the private binding too', async () => {
    let calls = 0;
    const proxy = create_proxy({}, { ...options, fetch_backend: () => { throw new Error('legacy forbidden'); } });
    const response = await proxy.fetch(new Request(origin + '/api/products?gender=mujer&gender=hombre'), { DREAMS_OFFICIAL: { fetch: async r => { calls++; assert.equal(new URL(r.url).origin, origin); return Response.json([{ id: 1, gender: 'mujer' }, { id: 2, gender: 'unisex' }]); } } });
    assert.equal(response.status, 200); assert.equal(calls, 1); assert.deepEqual((await response.json()).map(p => p.id), [1]);
});
const token = payload => Buffer.from(JSON.stringify(payload)).toString('base64url') + '.fixture-signature';
test('only historical v2 presentation references select the immutable legacy verifier', async () => {
    let calls = 0;
    const request = payload => new Request(origin + '/api/presentation/payment', { method: 'POST', headers: { Cookie: 'dreams_presentation=fixture', Origin: origin }, body: JSON.stringify({ ticket: token(payload) }) });
    const fetcher = async r => { calls++; assert.match(r.url, /^https:\/\/d5df723d-/); assert.equal(r.redirect, 'manual'); assert.equal(r.headers.get('Cookie'), 'dreams_presentation=fixture'); return Response.json({ error: 'invalid signature fixture' }, { status: 400 }); };
    assert.equal((await legacy_presentation(request({ version: 2 }), fetcher)).status, 400);
    for (const payload of [{ version: 2, issuer: 'dreams-official-v1' }, { version: 3 }, { version: 2, issuer: 'unknown' }]) assert.equal(await legacy_presentation(request(payload), fetcher), null);
    assert.equal(calls, 1);
    assert.equal(await legacy_presentation(new Request(origin + '/api/presentation/payment', { method: 'POST', body: 'x'.repeat(33000) }), fetcher), null);
});
