import test from 'node:test';
import assert from 'node:assert/strict';
import proxy from '../pages/proxy.mjs';

test('Pages preserves same-origin mutations, cookies, private headers and body without redirecting to workers.dev', async () => {
    const request = new Request('https://dreams-perfumes.pages.dev/api/cart/quote', {
        method: 'POST', headers: { Origin: 'https://dreams-perfumes.pages.dev', Cookie: 'dreams_access_token=fixture', 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [{ id: 1, quantity: 1 }] })
    });
    const upstream = new Response('fixture', { headers: { 'Cache-Control': 'no-store', Location: '/cuenta.html' } });
    upstream.headers.append('Set-Cookie', 'dreams_access_token=fixture; Secure; HttpOnly; SameSite=Lax');
    upstream.headers.append('Set-Cookie', 'dreams_refresh_token=fixture; Secure; HttpOnly; SameSite=Lax');
    const response = await proxy.fetch(request, { DREAMS: { fetch: async incoming => {
        assert.equal(incoming, request);
        assert.equal(incoming.headers.get('origin'), 'https://dreams-perfumes.pages.dev');
        assert.equal(incoming.headers.get('cookie'), 'dreams_access_token=fixture');
        assert.equal(incoming.method, 'POST');
        assert.deepEqual(await incoming.json(), { items: [{ id: 1, quantity: 1 }] });
        return upstream;
    } } });
    assert.equal(response, upstream);
    assert.equal(response.headers.getSetCookie().length, 2);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    assert.equal(response.headers.get('Location'), '/cuenta.html');
});

test('Pages preserves upstream authorization and not-found failures', async () => {
    for (const status of [403, 404, 503]) {
        const response = await proxy.fetch(new Request('https://dreams-perfumes.pages.dev/admin'), {
            DREAMS: { fetch: async () => new Response('fixture', { status }) }
        });
        assert.equal(response.status, status);
    }
});

test('Pages fails closed without a backend or when its Service binding throws', async () => {
    for (const env of [{}, { DREAMS: { fetch: async () => { throw new Error('fixture-secret-not-for-client'); } } }]) {
        const response = await proxy.fetch(new Request('https://dreams-perfumes.pages.dev/'), env);
        assert.equal(response.status, 503);
        assert.equal(response.headers.get('Cache-Control'), 'no-store');
        assert.doesNotMatch(await response.text(), /fixture-secret/);
    }
});
