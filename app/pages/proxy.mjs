// reenvia solicitudes al backend permitido conservando metodo, cuerpo, origen y cookies.
import { official_options, official_target } from './official-backend.mjs';
import { filtered_catalog } from './catalog.mjs';
import { enrich_asset, index_response, preserved_headers } from './seo.mjs';

function no_disponible() {
    return Response.json({ error: 'El servicio no está disponible temporalmente.' }, {
        status: 503, headers: { 'Cache-Control': 'no-store' }
    });
}

// solo se reemplazan assets publicos explicitos; auth y api conservan su backend.
const visual_paths = new Set(['/', '/index.html', '/nosotros.html', '/catalogo.html', '/producto.html', '/carrito.html', '/cuenta.html', '/checkout.html', '/checkout-resultado.html', '/css/style.css', '/js/motion.js', '/js/app.js', '/js/catalogo.js', '/js/navigation.js', '/js/catalog-filter-state.js', '/js/carrito.js', '/js/presentation.js', '/js/academic-inputs.js', '/js/producto.js', '/js/cuenta.js', '/js/account-cart.js', '/js/reviews.js', '/robots.txt', '/sitemap.xml', '/404.html', '/assets/dreams-social.png', '/admin', '/admin.html', '/js/admin-console-v3.js', '/js/admin-product-search.js', '/js/admin-image-url.js']);
const panel_destino = path => ['/admin', '/admin.html', '/js/admin-console-v3.js', '/api/auth/me', '/api/auth/login', '/api/auth/logout', '/api/config'].includes(path) || path.startsWith('/api/admin/');
const header_aliases = new Map([['/js/academic-inputs.js', '/js/app.js'], ['/js/admin-product-search.js', '/js/admin-console-v3.js'], ['/js/admin-image-url.js', '/js/admin-console-v3.js'], ['/js/cuenta.js', '/js/app.js'], ['/js/account-cart.js', '/js/app.js'], ['/js/reviews.js', '/js/app.js'], ['/js/navigation.js', '/js/app.js'], ['/js/catalog-filter-state.js', '/js/app.js'], ['/assets/dreams-social.png', '/assets/dreams-hero-1024.webp']]);

function visual_solicitud(solicitud, pathname, asset) {
    if (pathname === '/admin' || pathname === '/admin.html') return solicitud;
    // los scripts nuevos toman headers del recurso base: no dependen de existir en el legado.
    const public_script = /^\/js\/[a-z0-9-]+\.js$/.test(pathname) && pathname !== '/js/admin-console-v3.js';
    const alias = header_aliases.get(pathname) || (public_script ? '/js/app.js' : null);
    const upstream = alias && asset ? new Request(new URL(alias, solicitud.url), solicitud) : solicitud;
    if (!asset) return upstream;
    const headers = new Headers(solicitud.headers);
    for (const name of ['If-None-Match', 'If-Modified-Since', 'Range', 'If-Range']) headers.delete(name);
    return new Request(upstream, { headers });
}

async function reenviar_solicitud(solicitud, env, options) {
    if (options.official_service && official_target(new URL(solicitud.url).pathname)) return official_options(env, options).fetch_backend(solicitud);
    if (!options.backend_url) return env.DREAMS.fetch(solicitud);
    const target = new URL(solicitud.url);
    const backend = new URL(options.admin_backend_url && panel_destino(target.pathname) ? options.admin_backend_url : options.backend_url);
    target.host = backend.host;
    target.protocol = backend.protocol;
    target.port = backend.port;
    const forwarded = new Request(target, solicitud);
    forwarded.headers.delete('Host');
    // nunca seguir redirecciones que podrian reenviar cookies o cuerpos privados.
    return (options.fetch_backend || fetch)(new Request(forwarded, { redirect: 'manual' }));
}

function comprobar_cache_del_recurso(solicitud, asset) {
    return (solicitud.headers.get('If-None-Match') || '').split(',').some(value => {
        const tag = value.trim();
        return tag === '*' || tag.replace(/^W\//, '') === asset.etag;
    });
}

async function visual_respuesta(solicitud, upstream, asset) {
    const headers = preserved_headers(upstream);
    for (const name of ['Content-Length', 'Content-Encoding', 'Last-Modified', 'Content-Range', 'Accept-Ranges']) headers.delete(name);
    headers.set('Content-Type', asset.content_type);
    headers.set('ETag', asset.etag);
    if (!/private|no-store/i.test(headers.get('Cache-Control') || '')) headers.set('Cache-Control', 'no-cache');
    await upstream.body?.cancel();
    const status = asset.status || 200;
    const matches = status === 200 && comprobar_cache_del_recurso(solicitud, asset);
    const body = asset.encoding === 'base64' ? Uint8Array.from(atob(asset.body), char => char.charCodeAt(0)) : asset.body;
    return new Response(matches || solicitud.method === 'HEAD' ? null : body, { status: matches ? 304 : status, headers });
}

const aprobado = value => /^https:\/\/[a-f0-9]{8}-dreams-perfumes\.dreams-perfumes\.workers\.dev$/.test(value || '');

// la interfaz envia json sin compresion; no entregar cuerpos comprimidos al parser legacy.
function preparar_solicitud_comprimida(solicitud, path) {
    const encoding = solicitud.headers.get('Content-Encoding')?.trim().toLowerCase();
    return (path === '/api' || path.startsWith('/api/')) && encoding && encoding !== 'identity'
        ? Response.json({ error: 'Enviá la solicitud sin compresión.' }, { status: 415, headers: { 'Cache-Control': 'no-store' } }) : null;
}

const aprobado_publicacion = options => aprobado(options.backend_url) && (!options.admin_backend_url || aprobado(options.admin_backend_url));

async function preparar_respuesta_del_proxy(solicitud, env, visual_assets, options) {
    const pathname = new URL(solicitud.url).pathname, rejected = preparar_solicitud_comprimida(solicitud, pathname);
    if (rejected) return options.seo ? index_response(solicitud, rejected) : rejected;
    const data_options = official_options(env, options);
    const catalog = options.backend_url ? await filtered_catalog(solicitud, data_options) : null;
    if (catalog) return options.seo ? index_response(solicitud, catalog) : catalog;
    const bundled_path = visual_paths.has(pathname) || /^\/js\/[a-z0-9-]+\.js$/.test(pathname);
    let asset = bundled_path && Object.hasOwn(visual_assets, pathname) && ['GET', 'HEAD'].includes(solicitud.method) ? visual_assets[pathname] : null;
    const upstream = await reenviar_solicitud(visual_solicitud(solicitud, pathname, asset), env, options);
    if (asset && upstream.status === 200 && options.seo) asset = await enrich_asset(solicitud, asset, env, data_options);
    const response = !asset || upstream.status !== 200 ? upstream : await visual_respuesta(solicitud, upstream, asset);
    return options.seo ? index_response(solicitud, response) : response;
}

function crear_proxy(visual_assets = {}, options = {}) {
    return {
        async fetch(solicitud, env) {
            if (options.backend_url ? !aprobado_publicacion(options) : !env.DREAMS?.fetch) return options.seo ? index_response(solicitud, no_disponible()) : no_disponible();
            try {
                return await preparar_respuesta_del_proxy(solicitud, env, visual_assets, options);
            } catch {
                return options.seo ? index_response(solicitud, no_disponible()) : no_disponible();
            }
        }
    };
}
export { crear_proxy as create_proxy };

export default crear_proxy();
