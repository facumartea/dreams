import { official_options, official_target } from './official-backend.mjs';
import { filtered_catalog } from './catalog.mjs';
import { enrich_asset, index_response, preserved_headers } from './seo.mjs';

function unavailable() {
    return Response.json({ error: 'El servicio no está disponible temporalmente.' }, {
        status: 503, headers: { 'Cache-Control': 'no-store' }
    });
}

// Sólo se reemplazan assets públicos explícitos; Auth y API conservan su backend.
const visual_paths = new Set(['/', '/index.html', '/nosotros.html', '/catalogo.html', '/producto.html', '/carrito.html', '/cuenta.html', '/checkout.html', '/checkout-resultado.html', '/css/style.css', '/js/motion.js', '/js/app.js', '/js/catalogo.js', '/js/navigation.js', '/js/catalog-filter-state.js', '/js/carrito.js', '/js/presentation.js', '/js/producto.js', '/js/cuenta.js', '/js/account-cart.js', '/js/reviews.js', '/robots.txt', '/sitemap.xml', '/404.html', '/assets/dreams-social.png', '/admin', '/admin.html', '/js/admin-console-v3.js', '/js/admin-product-search.js', '/js/admin-image-url.js']);
const admin_target = path => ['/admin', '/admin.html', '/js/admin-console-v3.js', '/api/auth/me', '/api/auth/login', '/api/auth/logout', '/api/config'].includes(path) || path.startsWith('/api/admin/');
const header_aliases = new Map([['/js/admin-product-search.js', '/js/admin-console-v3.js'], ['/js/admin-image-url.js', '/js/admin-console-v3.js'], ['/js/cuenta.js', '/js/app.js'], ['/js/account-cart.js', '/js/app.js'], ['/js/reviews.js', '/js/app.js'], ['/js/navigation.js', '/js/app.js'], ['/js/catalog-filter-state.js', '/js/app.js'], ['/assets/dreams-social.png', '/assets/dreams-hero-1024.webp']]);

function visual_request(request, pathname, asset) {
    if (pathname === '/admin' || pathname === '/admin.html') return request;
    const upstream = header_aliases.has(pathname) && asset ? new Request(new URL(header_aliases.get(pathname), request.url), request) : request;
    if (!asset) return upstream;
    const headers = new Headers(request.headers);
    for (const name of ['If-None-Match', 'If-Modified-Since', 'Range', 'If-Range']) headers.delete(name);
    return new Request(upstream, { headers });
}

async function forward_request(request, env, options) {
    if (options.official_service && official_target(new URL(request.url).pathname)) return official_options(env, options).fetch_backend(request);
    if (!options.backend_url) return env.DREAMS.fetch(request);
    const target = new URL(request.url);
    const backend = new URL(options.admin_backend_url && admin_target(target.pathname) ? options.admin_backend_url : options.backend_url);
    target.host = backend.host;
    target.protocol = backend.protocol;
    target.port = backend.port;
    const forwarded = new Request(target, request);
    forwarded.headers.delete('Host');
    // Nunca seguir redirecciones que podrían reenviar cookies o cuerpos privados.
    return (options.fetch_backend || fetch)(new Request(forwarded, { redirect: 'manual' }));
}

function asset_not_modified(request, asset) {
    return (request.headers.get('If-None-Match') || '').split(',').some(value => {
        const tag = value.trim();
        return tag === '*' || tag.replace(/^W\//, '') === asset.etag;
    });
}

async function visual_response(request, upstream, asset) {
    const headers = preserved_headers(upstream);
    for (const name of ['Content-Length', 'Content-Encoding', 'Last-Modified', 'Content-Range', 'Accept-Ranges']) headers.delete(name);
    headers.set('Content-Type', asset.content_type);
    headers.set('ETag', asset.etag);
    if (!/private|no-store/i.test(headers.get('Cache-Control') || '')) headers.set('Cache-Control', 'no-cache');
    await upstream.body?.cancel();
    const status = asset.status || 200;
    const matches = status === 200 && asset_not_modified(request, asset);
    const body = asset.encoding === 'base64' ? Uint8Array.from(atob(asset.body), char => char.charCodeAt(0)) : asset.body;
    return new Response(matches || request.method === 'HEAD' ? null : body, { status: matches ? 304 : status, headers });
}

const approved = value => /^https:\/\/[a-f0-9]{8}-dreams-perfumes\.dreams-perfumes\.workers\.dev$/.test(value || '');

// La interfaz envía JSON sin compresión; no entregar cuerpos comprimidos al parser legacy.
function compressed_api_request(request, path) {
    const encoding = request.headers.get('Content-Encoding')?.trim().toLowerCase();
    return (path === '/api' || path.startsWith('/api/')) && encoding && encoding !== 'identity'
        ? Response.json({ error: 'Enviá la solicitud sin compresión.' }, { status: 415, headers: { 'Cache-Control': 'no-store' } }) : null;
}

const approved_release = options => approved(options.backend_url) && (!options.admin_backend_url || approved(options.admin_backend_url));

async function proxy_response(request, env, visual_assets, options) {
    const pathname = new URL(request.url).pathname, rejected = compressed_api_request(request, pathname);
    if (rejected) return options.seo ? index_response(request, rejected) : rejected;
    const data_options = official_options(env, options);
    const catalog = options.backend_url ? await filtered_catalog(request, data_options) : null;
    if (catalog) return options.seo ? index_response(request, catalog) : catalog;
    let asset = visual_paths.has(pathname) && ['GET', 'HEAD'].includes(request.method) ? visual_assets[pathname] : null;
    const upstream = await forward_request(visual_request(request, pathname, asset), env, options);
    if (asset && upstream.status === 200 && options.seo) asset = await enrich_asset(request, asset, env, data_options);
    const response = !asset || upstream.status !== 200 ? upstream : await visual_response(request, upstream, asset);
    return options.seo ? index_response(request, response) : response;
}

export function create_proxy(visual_assets = {}, options = {}) {
    return {
        async fetch(request, env) {
            if (options.backend_url ? !approved_release(options) : !env.DREAMS?.fetch) return options.seo ? index_response(request, unavailable()) : unavailable();
            try {
                return await proxy_response(request, env, visual_assets, options);
            } catch {
                return options.seo ? index_response(request, unavailable()) : unavailable();
            }
        }
    };
}

export default create_proxy();
