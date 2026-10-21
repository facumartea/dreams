import { test } from 'node:test';
import assert from 'node:assert/strict';
import { create_proxy } from '../pages/proxy.mjs';
const backend_url = 'https://d5df723d-dreams-perfumes.dreams-perfumes.workers.dev';
const auth_backend_url = 'https://12345678-dreams-perfumes.dreams-perfumes.workers.dev';

test('Auth aislado conserva cookies/origen/cuerpo y no cambia destino de checkout, Admin o catálogo', async () => {
    const calls = [];
    const proxy = create_proxy({}, { backend_url, auth_backend_url, fetch_backend: async req => { calls.push(req); return Response.json({ user: null }, { headers: { 'Cache-Control': 'no-store', 'Set-Cookie': 'fixture=only; Secure; HttpOnly; SameSite=Lax' } }); } });
    for (const path of ['/api/auth/login', '/api/auth/register', '/api/auth/logout', '/api/auth/me', '/api/auth/config', '/api/checkout/session', '/api/admin/products', '/api/products']) {
        const method = /login|register|logout|checkout/.test(path) ? 'POST' : 'GET';
        const req = new Request('https://dreams-perfumes.pages.dev' + path, { method, headers: { Cookie: 'fixture=only', Origin: 'https://dreams-perfumes.pages.dev' }, ...(method === 'POST' ? { body: '{}' } : {}) });
        const response = await proxy.fetch(req, {}), forwarded = calls.at(-1);
        assert.equal(new URL(forwarded.url).origin, path.startsWith('/api/auth/') ? auth_backend_url : backend_url);
        assert.equal(forwarded.headers.get('Cookie'), 'fixture=only');
        assert.equal(forwarded.headers.get('Origin'), 'https://dreams-perfumes.pages.dev');
        if (method === 'POST') assert.equal(await forwarded.text(), '{}');
        assert.equal(response.headers.get('cache-control'), 'no-store');
        assert.match(response.headers.get('set-cookie'), /HttpOnly/);
    }
});

test('destinos Auth no aprobados fallan cerrados sin red, sin seguir redirects con credenciales', async () => {
    for (const target of ['http://12345678-dreams-perfumes.dreams-perfumes.workers.dev', 'https://evil.invalid', 'https://dreams-perfumes.pages.dev']) {
        const proxy = create_proxy({}, { backend_url, auth_backend_url: target, fetch_backend: () => assert.fail('network forbidden') });
        assert.equal((await proxy.fetch(new Request('https://dreams-perfumes.pages.dev/api/auth/me'), {})).status, 503);
    }
    const proxy = create_proxy({}, { backend_url, auth_backend_url, fetch_backend: async req => { assert.equal(req.redirect, 'manual'); return new Response(null, { status: 302, headers: { Location: 'https://evil.invalid' } }); } });
    assert.equal((await proxy.fetch(new Request('https://dreams-perfumes.pages.dev/api/auth/me'), {})).status, 302);
});

test('customer data routes are explicit and never route administrative/commercial writes to the isolated backend', async () => {
    for (const customer_data of [false, true]) {
        const seen = [];
        const proxy = create_proxy({}, { backend_url, auth_backend_url, customer_data, fetch_backend: async req => { seen.push(new URL(req.url)); return Response.json({}); } });
        for (const path of ['/api/cart/account', '/api/cart/config', '/api/reviews', '/api/reviews/123', '/api/reviews/123/extra', '/api/cart/quote', '/api/checkout/session', '/api/admin/reviews/123']) {
            await proxy.fetch(new Request('https://dreams-perfumes.pages.dev' + path), {});
            const isolated = ['/api/cart/account', '/api/cart/config', '/api/reviews', '/api/reviews/123'].includes(path);
            assert.equal(seen.at(-1).origin, isolated && customer_data ? auth_backend_url : backend_url);
        }
    }
});
test('new customer scripts get existing upstream security headers without requiring old backend copies', async () => {
    for (const path of ['/js/account-cart.js', '/js/reviews.js']) {
        const proxy = create_proxy({ [path]: { body: '/* fixture */', content_type: 'application/javascript', etag: '"fixture"' } }, {
            backend_url, fetch_backend: async req => { assert.equal(new URL(req.url).pathname, '/js/app.js'); return new Response('old', { headers: { 'Content-Security-Policy': "default-src 'self'" } }); }
        });
        const response = await proxy.fetch(new Request('https://dreams-perfumes.pages.dev' + path), {});
        assert.equal(response.status, 200); assert.equal(await response.text(), '/* fixture */'); assert.match(response.headers.get('Content-Security-Policy'), /self/);
    }
});
