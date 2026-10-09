import test from 'node:test';
import assert from 'node:assert/strict';
import proxy, { create_proxy } from '../pages/proxy.mjs';

test('Pinned Pages release preserves query, mutation body, origin and session without following redirects', async () => {
    const request = new Request('https://dreams-perfumes.pages.dev/api/presentation/payment?fixture=1', {
        method: 'POST', headers: { Origin: 'https://dreams-perfumes.pages.dev', Cookie: 'session=fixture', 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket: 'fixture' })
    });
    const response = await create_proxy({}, {
        backend_url: 'https://40e7b0a3-dreams-perfumes.dreams-perfumes.workers.dev',
        fetch_backend: async incoming => {
            assert.equal(incoming.url, 'https://40e7b0a3-dreams-perfumes.dreams-perfumes.workers.dev/api/presentation/payment?fixture=1');
            assert.equal(incoming.redirect, 'manual');
            assert.equal(incoming.headers.get('origin'), 'https://dreams-perfumes.pages.dev');
            assert.equal(incoming.headers.get('cookie'), 'session=fixture');
            assert.deepEqual(await incoming.json(), { ticket: 'fixture' });
            return new Response(null, { status: 302, headers: { Location: '/cuenta.html', 'Cache-Control': 'no-store', 'Set-Cookie': 'session=fixture; Secure; HttpOnly; Path=/' } });
        }
    }).fetch(request, { DREAMS: { fetch: () => { throw new Error('moving production must not be called'); } } });
    assert.equal(response.status, 302);
    assert.equal(response.headers.get('location'), '/cuenta.html');
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.match(response.headers.get('set-cookie'), /Secure; HttpOnly/);
});

test('Pinned Pages release rejects moving or foreign destinations and never falls back on outage', async () => {
    let calls = 0;
    const env = { DREAMS: { fetch: () => { calls++; return new Response('wrong release'); } } };
    for (const backend_url of ['https://academic-review-dreams-perfumes.dreams-perfumes.workers.dev', 'https://example.com', 'http://40e7b0a3-dreams-perfumes.dreams-perfumes.workers.dev']) {
        const response = await create_proxy({}, { backend_url, fetch_backend: () => { calls++; } }).fetch(new Request('https://dreams-perfumes.pages.dev/'), env);
        assert.equal(response.status, 503);
    }
    const response = await create_proxy({}, { backend_url: 'https://40e7b0a3-dreams-perfumes.dreams-perfumes.workers.dev', fetch_backend: async () => { throw new Error('private fixture'); } }).fetch(new Request('https://dreams-perfumes.pages.dev/'), env);
    assert.equal(response.status, 503);
    assert.doesNotMatch(await response.text(), /private fixture/);
    assert.equal(calls, 0);
});

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

test('Pages public shell cannot replace API/Admin paths or mutations', async () => {
    const asset = { body: 'unexpected visual body', content_type: 'text/html', etag: '"fixture"' };
    const overlay = create_proxy(Object.fromEntries(['/', '/catalogo.html', '/carrito.html', '/cuenta.html', '/api/cart/quote', '/admin'].map(p => [p, asset])));
    for (const [pathname, method] of [['/api/cart/quote', 'POST'], ['/admin', 'GET'], ['/', 'POST']]) {
        const request = new Request(`https://dreams-perfumes.pages.dev${pathname}`, { method });
        const upstream = new Response('original route', { status: 403 });
        const response = await overlay.fetch(request, { DREAMS: { fetch: async incoming => {
            assert.equal(incoming, request);
            return upstream;
        } } });
        assert.equal(response, upstream);
    }
});


test('Pages public HTML overlays never mask denied or failed upstream access', async () => {
    for (const pathname of ['/catalogo.html', '/carrito.html', '/cuenta.html', '/checkout.html']) {
        const overlay = create_proxy({ [pathname]: { body: 'public shell', content_type: 'text/html', etag: '"shell"' } });
        for (const status of [403, 404, 503]) {
            const response = await overlay.fetch(new Request(`https://dreams-perfumes.pages.dev${pathname}`), {
                DREAMS: { fetch: async () => new Response('upstream failure', { status }) }
            });
            assert.equal(response.status, status);
            assert.equal(await response.text(), 'upstream failure');
        }
    }
});

test('New navigation asset inherits same-origin script security headers without exposing another route', async () => {
    const overlay = create_proxy({ '/js/navigation.js': { body: 'public navigation', content_type: 'application/javascript', etag: '"navigation"' } });
    const response = await overlay.fetch(new Request('https://dreams-perfumes.pages.dev/js/navigation.js'), {
        DREAMS: { fetch: async incoming => {
            assert.equal(new URL(incoming.url).pathname, '/js/app.js');
            return new Response('old script', { headers: { 'Content-Security-Policy': "default-src 'self'", 'X-Content-Type-Options': 'nosniff' } });
        } }
    });
    assert.equal(response.status, 200);
    assert.equal(await response.text(), 'public navigation');
    assert.equal(response.headers.get('X-Content-Type-Options'), 'nosniff');
    assert.equal(response.headers.get('Content-Type'), 'application/javascript');
});
