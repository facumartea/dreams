import test from 'node:test';
import assert from 'node:assert/strict';
import proxy, { create_proxy } from '../pages/proxy.mjs';

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


test('Pages visual overlay keeps security/cookies and invalidates legacy representation headers', async () => {
    const overlay = create_proxy({ '/': { body: '<main>static fixture</main>', content_type: 'text/html; charset=utf-8', etag: '"new-home"' } });
    const request = new Request('https://dreams-perfumes.pages.dev/', { headers: { 'If-None-Match': '"old-home"', Range: 'bytes=0-4', Cookie: 'session=fixture' } });
    const response = await overlay.fetch(request, { DREAMS: { fetch: async incoming => {
        assert.equal(incoming.headers.get('If-None-Match'), null);
        assert.equal(incoming.headers.get('Range'), null);
        assert.equal(incoming.headers.get('Cookie'), 'session=fixture');
        const upstream = new Response('legacy body', { headers: {
            'Content-Security-Policy': "default-src 'self'", 'Content-Encoding': 'gzip', 'Content-Length': '11', ETag: '"old-home"'
        } });
        upstream.headers.append('Set-Cookie', 'access=fixture; Secure; HttpOnly');
        upstream.headers.append('Set-Cookie', 'refresh=fixture; Secure; HttpOnly');
        return upstream;
    } } });
    assert.equal(await response.text(), '<main>static fixture</main>');
    assert.equal(response.headers.get('Content-Security-Policy'), "default-src 'self'");
    assert.equal(response.headers.getSetCookie().length, 2);
    assert.equal(response.headers.get('Content-Encoding'), null);
    assert.equal(response.headers.get('Content-Length'), null);
    assert.equal(response.headers.get('ETag'), '"new-home"');
    assert.equal(response.headers.get('Cache-Control'), 'no-cache');
});

test('Pages visual overlay serves valid HEAD/304 and never masks upstream failures', async () => {
    const overlay = create_proxy({ '/css/style.css': { body: 'fixture css', content_type: 'text/css', etag: '"new-css"' } });
    const env = { DREAMS: { fetch: async () => new Response('legacy', { status: 200 }) } };
    const head = await overlay.fetch(new Request('https://dreams-perfumes.pages.dev/css/style.css', { method: 'HEAD' }), env);
    assert.equal(head.status, 200);
    assert.equal(await head.text(), '');
    const cached = await overlay.fetch(new Request('https://dreams-perfumes.pages.dev/css/style.css?v=static', { headers: { 'If-None-Match': 'W/"new-css"' } }), env);
    assert.equal(cached.status, 304);
    assert.equal(await cached.text(), '');
    const failed = await overlay.fetch(new Request('https://dreams-perfumes.pages.dev/css/style.css'), { DREAMS: { fetch: async () => new Response('outage', { status: 503 }) } });
    assert.equal(failed.status, 503);
    assert.equal(await failed.text(), 'outage');
});

test('Pages visual overlay cannot replace catalog/cart/auth/API paths or mutations', async () => {
    const asset = { body: 'unexpected visual body', content_type: 'text/html', etag: '"fixture"' };
    const overlay = create_proxy(Object.fromEntries(['/', '/catalogo.html', '/carrito.html', '/cuenta.html', '/api/cart/quote', '/admin'].map(p => [p, asset])));
    for (const [pathname, method] of [['/catalogo.html', 'GET'], ['/carrito.html', 'GET'], ['/cuenta.html', 'GET'], ['/api/cart/quote', 'POST'], ['/admin', 'GET'], ['/', 'POST']]) {
        const request = new Request(`https://dreams-perfumes.pages.dev${pathname}`, { method });
        const upstream = new Response('original route', { status: 403 });
        const response = await overlay.fetch(request, { DREAMS: { fetch: async incoming => {
            assert.equal(incoming, request);
            return upstream;
        } } });
        assert.equal(response, upstream);
    }
});
