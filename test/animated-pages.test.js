const { test } = require('node:test');
const assert = require('node:assert/strict');
const backend = 'https://6e5be7b8-dreams-perfumes.dreams-perfumes.workers.dev';
const origin = 'https://dreams-preview.pages.dev';
const factory = async fetcher => (await import('../pages/animated-proxy.mjs')).create_animated_proxy(backend, fetcher);

test('animated preview preserves mutation origin, session cookies and body for backend authorization', async () => {
    const proxy = await factory(async request => {
        assert.equal(request.url, backend + '/api/cart/quote');
        assert.equal(request.method, 'POST');
        assert.equal(request.headers.get('origin'), origin);
        assert.equal(request.headers.get('cookie'), 'dreams_access_token=test');
        assert.equal(request.redirect, 'manual');
        assert.deepEqual(await request.json(), { items: [{ id: 1, quantity: 2 }] });
        return Response.json({ error: 'Operación protegida' }, { status: 403 });
    });
    const response = await proxy.fetch(new Request(origin + '/api/cart/quote', { method: 'POST', headers: { Origin: origin, Cookie: 'dreams_access_token=test' }, body: JSON.stringify({ items: [{ id: 1, quantity: 2 }] }) }));
    assert.equal(response.status, 403);
    assert.equal((await response.json()).error, 'Operación protegida');
    assert.match(response.headers.get('x-robots-tag'), /noindex/);
});

test('preview preserves host-only secure cookies and upstream cache/range semantics', async () => {
    const cookie = 'dreams_refresh_token=test; Path=/; HttpOnly; Secure; SameSite=Lax';
    const proxy = await factory(async () => new Response('bytes', { status: 206, headers: { 'Content-Range': 'bytes 0-4/100', 'Cache-Control': 'private, no-store', 'Set-Cookie': cookie } }));
    const response = await proxy.fetch(new Request(origin + '/assets/video.mp4', { headers: { Range: 'bytes=0-4' } }));
    assert.equal(response.status, 206);
    assert.equal(response.headers.get('set-cookie'), cookie);
    assert.equal(response.headers.get('cache-control'), 'private, no-store');
    assert.equal(response.headers.get('content-range'), 'bytes 0-4/100');
});

test('preview rewrites only its own redirect origins without following them', async () => {
    for (const [location, expected] of [[backend + '/cuenta.html?x=1', origin + '/cuenta.html?x=1'], ['https://academic-review-dreams-perfumes.dreams-perfumes.workers.dev/admin', origin + '/admin'], ['https://example.com/login', 'https://example.com/login'], ['/cuenta.html', origin + '/cuenta.html']]) {
        const proxy = await factory(async () => new Response(null, { status: 302, headers: { Location: location } }));
        const response = await proxy.fetch(new Request(origin));
        assert.equal(response.status, 302);
        assert.equal(response.headers.get('location'), expected);
    }
});

test('preview disallows indexing and fails closed without returning upstream internals', async () => {
    const proxy = await factory(async () => { throw new Error('private upstream failure'); });
    const robots = await proxy.fetch(new Request(origin + '/robots.txt'));
    assert.match(await robots.text(), /Disallow: \//);
    const response = await proxy.fetch(new Request(origin + '/api/products'));
    assert.equal(response.status, 503);
    assert.match(response.headers.get('x-robots-tag'), /noindex/);
    assert.doesNotMatch(await response.text(), /private upstream/);
});

test('preview cannot target arbitrary URLs or the official Pages origin', async () => {
    const { create_animated_proxy } = await import('../pages/animated-proxy.mjs');
    for (const target of ['http://127.0.0.1', 'https://dreams-perfumes.pages.dev', backend + '/path', backend + '.evil.example']) assert.throws(() => create_animated_proxy(target), /Invalid preview backend/);
});
