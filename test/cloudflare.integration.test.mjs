import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createTestHarness } from 'wrangler';

// HTTP fixtures only: the real Worker, Express and Supabase SDK run in workerd.
// No credentials or requests to the real Supabase project are used here.
test('Workers preserva rutas, sesiones aisladas, Admin, errores y caché privada', { timeout: 60000 }, async t => {
    const calls = [];
    const tokens = new Map();
    const fixture = createServer(async (req, res) => {
        const url = new URL(req.url, 'http://fixture');
        calls.push({ path: url.pathname, authorization: req.headers.authorization, query: url.search });
        res.setHeader('Content-Type', 'application/json');
        if (url.pathname.endsWith('/settings')) return res.end(JSON.stringify({ external: { google: true } }));
        if (url.pathname.endsWith('/token')) {
            let body = ''; for await (const chunk of req) body += chunk;
            const { email } = JSON.parse(body);
            const user = { id: email, email, aud: 'authenticated', role: 'authenticated', user_metadata: {} };
            const token = `${Buffer.from('{}').toString('base64url')}.${Buffer.from(JSON.stringify({ sub: email, exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url')}.fixture`;
            tokens.set(token, user);
            return res.end(JSON.stringify({ access_token: token, refresh_token: `refresh-${email}`, expires_in: 3600, token_type: 'bearer', user }));
        }
        if (url.pathname.endsWith('/user')) return res.end(JSON.stringify(tokens.get(req.headers.authorization?.slice(7)) || { id: null }));
        if (url.pathname.endsWith('/logout')) return res.end('{}');
        if (url.pathname.endsWith('/profiles')) return res.end(JSON.stringify({ name: 'Fixture', role: url.search.includes('admin%40') || url.search.includes('admin@') ? 'admin' : 'customer' }));
        if (url.pathname.endsWith('/products')) return res.end(JSON.stringify([{ id: 1, marca: 'Fixture', name: 'Fixture', price: 10, stock: 1, size_ml: 50 }]));
        return res.end('[]');
    });
    fixture.listen(0, '127.0.0.1');
    await new Promise(resolve => fixture.once('listening', resolve));
    t.after(() => new Promise(resolve => fixture.close(resolve)));
    const harness = createTestHarness({ workers: [{ configPath: './wrangler.jsonc', vars: { NODE_ENV: 'production', APP_BASE_URL: 'https://preview.example', APP_ORIGINS: 'https://preview.example', GOOGLE_ACCESS_READY: 'true' }, secrets: { SUPABASE_URL: `http://127.0.0.1:${fixture.address().port}`, SUPABASE_SECRET_KEY: 'sb_secret_WORKER_FIXTURE' } }] });
    t.after(() => harness.close());
    const { url } = await harness.listen();
    for (const [path, status] of [['/', 200], ['/catalogo.html', 200], ['/js/admin-console-v3.js', 200], ['/admin', 403], ['/api/missing', 404], ['/missing', 404], ['/favoritos.html', 301]]) {
        const response = await harness.fetch(path, { redirect: 'manual' });
        assert.equal(response.status, status, path);
        assert.match(response.headers.get('content-security-policy'), /script-src 'self'/);
        if (path.startsWith('/api/') || path === '/admin') assert.equal(response.headers.get('cache-control'), 'no-store');
    }
    const google = await harness.fetch('/api/auth/google', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://preview.example' }, body: JSON.stringify({ next: '/checkout.html' }) });
    assert.equal(google.status, 200);
    assert.match((await google.json()).url, /provider=google/);
    assert.match(google.headers.getSetCookie()[0], /dreams_google_pkce=.*HttpOnly.*Secure/);
    const login = async email => {
        const response = await harness.fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://preview.example' }, body: JSON.stringify({ email, password: 'fixture-password' }) });
        assert.equal(response.status, 200);
        assert.equal(response.headers.get('cache-control'), 'no-store');
        const cookies = response.headers.getSetCookie(); assert.equal(cookies.length, 2);
        for (const cookie of cookies) { assert.match(cookie, /HttpOnly/); assert.match(cookie, /SameSite=Lax/); assert.match(cookie, /; Secure/); }
        return cookies.map(cookie => cookie.split(';')[0]).join('; ');
    };
    const cookie = await login('ana@example.com');
    await login('bea@example.com');
    const products = await harness.fetch('/api/products?limit=8');
    assert.equal(products.status, 200);
    assert.equal((await products.json())[0].brand, 'Fixture');
    assert.equal(calls.filter(call => call.path.endsWith('/products')).at(-1).authorization, 'Bearer sb_secret_WORKER_FIXTURE');
    const me = await harness.fetch('/api/auth/me', { headers: { Cookie: cookie } });
    assert.equal((await me.json()).user.email, 'ana@example.com');
    assert.equal((await harness.fetch('/admin', { headers: { Cookie: cookie } })).status, 403);
    const adminCookie = await login('admin@example.com');
    const admin = await harness.fetch('/admin', { headers: { Cookie: adminCookie } });
    assert.equal(admin.status, 200); assert.equal(admin.headers.get('cache-control'), 'no-store');
    assert.match(await admin.text(), /DREAMS/);
    const adminProducts = await harness.fetch('/api/admin/products', { headers: { Cookie: adminCookie } });
    assert.equal(adminProducts.status, 200);
    assert.notEqual(calls.filter(call => call.path.endsWith('/products')).at(-1).authorization, 'Bearer sb_secret_WORKER_FIXTURE');
    const logout = await harness.fetch('/api/auth/logout', { method: 'POST', headers: { Cookie: cookie, Origin: 'https://preview.example' } });
    assert.equal(logout.status, 200); assert.equal(logout.headers.getSetCookie().length, 2);
    for (const header of logout.headers.getSetCookie()) assert.match(header, /Max-Age=0/);
    const crossOrigin = await harness.fetch('/api/cart/quote', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://attacker.invalid' }, body: '{}' });
    assert.equal(crossOrigin.status, 403);
    assert.ok(url.port);
});


test('Worker remoto falla cerrado si falta origen HTTPS configurado', { timeout: 60000 }, async t => {
    const harness = createTestHarness({ workers: [{ configPath: './wrangler.jsonc', env: 'preview', secrets: { SUPABASE_URL: 'https://fixture.invalid', SUPABASE_SECRET_KEY: 'sb_secret_FIXTURE' } }] });
    t.after(() => harness.close());
    await harness.listen();
    const response = await harness.fetch('/api/config');
    assert.equal(response.status, 503);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.doesNotMatch(await response.text(), /fixture|secret|Supabase/);
});
