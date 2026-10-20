import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { create_proxy } from '../pages/proxy.mjs';
import { SITE_ORIGIN, page_metadata, product_metadata, replace_metadata, limited_json, product_content } from '../pages/seo.mjs';
const backend_url = 'https://d5df723d-dreams-perfumes.dreams-perfumes.workers.dev';
const sample = { id: 7, name: 'Éclat <script>alert(1)</script>', brand: 'Maison & Fils', description: 'Una descripción real del registro de prueba.', image_url: 'https://images.example/asset?id=7', gender: 'unisex' };
const assets = {};
for (const route of ['/', '/catalogo.html', '/producto.html', '/cuenta.html', '/404.html', '/robots.txt', '/sitemap.xml']) {
    const file = route === '/' ? 'index.html' : route.slice(1);
    assets[route] = { body: await readFile(new URL(`../public/${file}`, import.meta.url), 'utf8'), etag: '"initial"', content_type: file.endsWith('.xml') ? 'application/xml' : 'text/html' };
}
function setup({ data = sample, status = 200, denied = 0 } = {}) {
    const calls = [];
    const proxy = create_proxy(assets, { backend_url, seo: true, fetch_backend: async request => {
        calls.push(request);
        if (new URL(request.url).pathname.startsWith('/api/products')) return Response.json(data, { status });
        return new Response('upstream', { status: denied || 200, headers: { 'X-Robots-Tag': 'noindex', 'Content-Security-Policy': "script-src 'self'", 'Cache-Control': 'private, no-store' } });
    } });
    const get = (path, init = {}, origin = SITE_ORIGIN) => proxy.fetch(new Request(origin + path, init), {});
    return { get, calls };
}

test('initial public HTML has unique official metadata; private shells remain noindex', async () => {
    const titles = new Set();
    for (const page of ['index', 'catalogo', 'nosotros', 'producto', 'carrito', 'cuenta', 'checkout', 'checkout-resultado', '404']) {
        const body = await readFile(new URL(`../public/${page}.html`, import.meta.url), 'utf8');
        assert.match(body, /<html lang="es">/); assert.doesNotMatch(body, /up\.railway\.app|meta name="keywords"/);
        const title = body.match(/<title>(.*?)<\/title>/)[1]; assert.ok(!titles.has(title)); titles.add(title);
        for (const key of ['title', 'description', 'type', 'url', 'image', 'image:alt', 'site_name', 'locale']) assert.equal((body.match(new RegExp(`property="og:${key}"`, 'g')) || []).length, page === '404' && key === 'url' ? 0 : 1);
        assert.match(body, /name="twitter:card" content="summary_large_image"/);
        if (['carrito', 'cuenta', 'checkout', 'checkout-resultado', '404'].includes(page)) assert.match(body, /name="robots" content="noindex,follow"/);
    }
});

test('product HTML includes real metadata and non-JavaScript content without injecting database HTML', async () => {
    const f = setup(); const response = await f.get('/producto.html?id=7&redirect=https://untrusted.example', { headers: { Cookie: 'access=fixture', Origin: SITE_ORIGIN } });
    const html = await response.text();
    assert.equal(response.status, 200); assert.match(html, /<title>Éclat &lt;script&gt;/); assert.match(html, /Maison &amp; Fils/);
    assert.match(html, /<noscript><section class="detail-layout">/); assert.match(html, /Una descripción real/);
    assert.doesNotMatch(html, /<script>alert\(1\)|"offers"|"aggregateRating"/);
    assert.match(html, /content="https:\/\/dreams-perfumes.pages.dev\/producto.html\?id=7"/);
    const api = f.calls[1]; assert.equal(api.url, backend_url + '/api/products/7');
    assert.equal(api.redirect, 'manual'); assert.equal(api.headers.get('cookie'), null); assert.equal(api.headers.get('origin'), null);
    assert.equal(f.calls.length, 2); assert.equal(response.headers.get('cache-control'), 'private, no-store');
    assert.equal(response.headers.get('x-robots-tag'), 'index, follow');
});

test('missing products and invalid identifiers have genuine noindex 404 responses', async () => {
    for (const id of ['', '0', '-7', '7%2Fadmin', 'https://evil.example', '1e4']) {
        const f = setup(), response = await f.get('/producto.html?id=' + id);
        assert.equal(response.status, 404); assert.equal(f.calls.length, 1); assert.match(await response.text(), /Perfume no encontrado/);
        assert.match(response.headers.get('x-robots-tag'), /noindex/);
    }
    assert.equal((await setup({ status: 404 }).get('/producto.html?id=7')).status, 404);
    const unavailable = await setup({ status: 503 }).get('/producto.html?id=7'); assert.equal(unavailable.status, 503);
    assert.doesNotMatch(await unavailable.text(), /public data unavailable|stack/);
});

test('denials, mutations and API routes do not trigger public metadata reads or mask permissions', async () => {
    for (const [path, method] of [['/producto.html?id=7', 'GET'], ['/api/admin/products', 'PUT'], ['/api/auth/register', 'POST']]) {
        const f = setup({ denied: 403 }), response = await f.get(path, { method });
        assert.equal(response.status, 403); assert.equal(await response.text(), 'upstream'); assert.equal(f.calls.length, 1);
        assert.match(response.headers.get('x-robots-tag'), /noindex/);
    }
});

test('HEAD and conditional requests use the metadata representation rather than stale generic ETags', async () => {
    const f = setup(), first = await f.get('/producto.html?id=7'), etag = first.headers.get('etag');
    assert.notEqual(etag, '"initial"');
    const head = await f.get('/producto.html?id=7', { method: 'HEAD' }); assert.equal(head.headers.get('etag'), etag); assert.equal(await head.text(), '');
    const cached = await f.get('/producto.html?id=7', { headers: { 'If-None-Match': etag } }); assert.equal(cached.status, 304); assert.equal(await cached.text(), '');
    const changed = await setup({ data: { ...sample, name: 'Otro nombre real' } }).get('/producto.html?id=7'); assert.notEqual(changed.headers.get('etag'), etag);
});

test('catalog categories preserve canonical meaning, link real products and noindex search combinations', async () => {
    const f = setup({ data: [sample, { ...sample, id: 8, gender: 'mujer', brand: null }] });
    const category = await f.get('/catalogo.html?gender=unisex'), html = await category.text();
    assert.match(html, /<title>Perfumes unisex \| DREAMS<\/title>/); assert.match(html, /href="\/producto.html\?id=7"/);
    assert.doesNotMatch(html, /href="\/producto.html\?id=8"/); assert.match(html, /catalogo.html\?gender=unisex/);
    const filtered = await f.get('/catalogo.html?gender=mujer&q=%3Cscript%3E'); assert.match(filtered.headers.get('x-robots-tag'), /noindex/);
    assert.match(await filtered.text(), /name="robots" content="noindex,follow"/);
    assert.equal((await f.get('/catalogo.html')).status, 200);
});

test('sitemap contains only public canonical real URLs and preview cannot be indexed', async () => {
    const f = setup({ data: [sample, { ...sample, id: 8 }] }); const response = await f.get('/sitemap.xml'), xml = await response.text();
    assert.equal((xml.match(/<loc>/g) || []).length, 8); assert.match(xml, /producto.html\?id=7/);
    assert.doesNotMatch(xml, /cuenta|carrito|checkout|admin|lastmod|railway|workers.dev/);
    const preview = 'https://seo-review.dreams-perfumes.pages.dev';
    const html = await f.get('/', {}, preview); assert.match(html.headers.get('x-robots-tag'), /noindex, nofollow/);
    assert.match(await html.text(), /name="robots" content="noindex,nofollow"/);
    const robots = await f.get('/robots.txt', {}, preview); assert.equal(await robots.text(), 'User-agent: *\nDisallow: /\n');
    const account = await f.get('/cuenta.html'); assert.match(account.headers.get('x-robots-tag'), /noindex/);
    assert.equal((await f.get('/404.html')).status, 404);
});

test('public metadata refuses oversized/HTML data and never follows image or data redirects', async () => {
    await assert.rejects(limited_json(new Response('html', { headers: { 'Content-Type': 'text/html' } })));
    await assert.rejects(limited_json(Response.json({ text: 'x'.repeat(100) }), 20));
    const redirect = setup({ status: 302 }); assert.equal((await redirect.get('/producto.html?id=7')).status, 503);
    const missing_brand = product_metadata({ ...sample, brand: null, description: '.', image_url: 'javascript:alert(1)' });
    assert.doesNotMatch(missing_brand.title + missing_brand.description, /undefined|null|de \|/);
    assert.equal(missing_brand.image, SITE_ORIGIN + '/assets/dreams-social.png');
    assert.equal(product_metadata({ ...sample, image_url: '' }).image, missing_brand.image);
    assert.equal(product_metadata({ ...sample, name: 'Bleu de Chanel', brand: 'Chanel' }).title, 'Bleu de Chanel | DREAMS');
    assert.doesNotMatch(product_content({ ...sample, brand: null }), /class="eyebrow">DREAMS/);
});

test('social asset remains binary and cookie refresh/private caching survives metadata policies', async () => {
    const image = { body: Buffer.from([137, 80, 78, 71]).toString('base64'), encoding: 'base64', content_type: 'image/png', etag: '"png"' };
    const f = create_proxy({ '/assets/dreams-social.png': image }, { seo: true });
    const response = await f.fetch(new Request(SITE_ORIGIN + '/assets/dreams-social.png'), { DREAMS: { fetch: async request => {
        assert.equal(new URL(request.url).pathname, '/assets/dreams-hero-1024.webp');
        const result = new Response('old', { headers: { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } });
        result.headers.append('Set-Cookie', 'access=fixture; Secure; HttpOnly'); result.headers.append('Set-Cookie', 'refresh=fixture; Secure; HttpOnly'); return result;
    } } });
    assert.deepEqual([...new Uint8Array(await response.arrayBuffer())], [137, 80, 78, 71]);
    assert.equal(response.headers.getSetCookie().length, 2); assert.equal(response.headers.get('cache-control'), 'private, no-store');
    assert.equal(response.headers.get('content-type'), 'image/png'); assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
});

test('unknown and inherited-property gender names cannot create canonical category URLs', async () => {
    for (const gender of ['__proto__', 'constructor', 'toString', 'otra']) {
        const response = await setup({ data: [sample] }).get('/catalogo.html?gender=' + gender);
        const html = await response.text();
        assert.match(html, /<link id="canonical-url" rel="canonical" href="https:\/\/dreams-perfumes.pages.dev\/catalogo.html">/);
        assert.match(html, /href="\/producto.html\?id=7"/);
    }
});

test('local HTTP entrypoints still use HTTPS for the immutable server destination', async () => {
    const f = setup(); const response = await f.get('/', {}, 'http://127.0.0.1:4177');
    assert.equal(f.calls[0].url, backend_url + '/'); assert.equal(response.status, 200);
    assert.match(response.headers.get('x-robots-tag'), /noindex/);
});
