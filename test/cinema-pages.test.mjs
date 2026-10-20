import test from 'node:test';
import assert from 'node:assert/strict';
import { create_animated_proxy } from '../pages/animated-proxy.mjs';
const backend = 'https://6e5be7b8-dreams-perfumes.dreams-perfumes.workers.dev';
const origin = 'https://dreams-preview.pages.dev';
const asset = { body: 'cinema', content_type: 'application/javascript', etag: '"v1"' };

test('homepage overlay preserves private session policies and both refresh cookies', async () => {
    const headers = new Headers({ 'Cache-Control': 'private, no-store' });
    headers.append('Set-Cookie', 'dreams_access_token=fixture; HttpOnly; Secure; SameSite=Lax');
    headers.append('Set-Cookie', 'dreams_refresh_token=fixture; HttpOnly; Secure; SameSite=Lax');
    const proxy = create_animated_proxy(backend, async () => new Response('original', { headers }), { '/': asset });
    const response = await proxy.fetch(new Request(origin, { headers: { Cookie: 'dreams_refresh_token=fixture' } }));
    assert.equal(await response.text(), 'cinema');
    assert.equal(response.headers.get('cache-control'), 'private, no-store');
    assert.equal(response.headers.getSetCookie().length, 2);
    assert.match(response.headers.getSetCookie()[1], /HttpOnly; Secure/);
});

test('cinematic assets reuse real backend policies while API and other pages stay untouched', async () => {
    const requests = [];
    const fetcher = async request => { requests.push(request); return new Response('original', { headers: { 'Content-Security-Policy': "default-src 'self'", 'Content-Encoding': 'gzip', 'Content-Length': '8' } }); };
    const proxy = create_animated_proxy(backend, fetcher, { '/js/cinema-video.js': asset, '/admin': asset });
    const response = await proxy.fetch(new Request(origin + '/js/cinema-video.js'));
    assert.equal(await response.text(), 'cinema'); assert.match(response.headers.get('x-robots-tag'), /noindex/);
    assert.equal(response.headers.get('content-security-policy'), "default-src 'self'");
    assert.equal(response.headers.get('content-encoding'), null); assert.equal(requests[0].url, backend + '/js/hero-video.js');
    for (const path of ['/api/products', '/catalogo.html', '/admin']) {
        assert.equal(await (await proxy.fetch(new Request(origin + path))).text(), 'original');
        assert.equal(requests.at(-1).url, backend + path);
    }
});

test('visual overlay never masks backend denial, errors or POST and preserves conditional requests', async () => {
    for (const status of [403, 404, 503]) {
        const proxy = create_animated_proxy(backend, async () => new Response('denied', { status }), { '/': asset });
        const response = await proxy.fetch(new Request(origin));
        assert.equal(response.status, status); assert.equal(await response.text(), 'denied');
    }
    const proxy = create_animated_proxy(backend, async () => new Response('original'), { '/': asset });
    assert.equal(await (await proxy.fetch(new Request(origin, { method: 'POST', body: 'body' }))).text(), 'original');
    const cached = await proxy.fetch(new Request(origin, { headers: { 'If-None-Match': 'W/"v1"' } }));
    assert.equal(cached.status, 304); assert.equal(await cached.text(), ''); assert.equal(cached.headers.get('etag'), '"v1"');
    const head = await proxy.fetch(new Request(origin, { method: 'HEAD' }));
    assert.equal(head.status, 200); assert.equal(await head.text(), '');
});
