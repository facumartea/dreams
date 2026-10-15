function unavailable() {
    return Response.json({ error: 'El servicio no está disponible temporalmente.' }, {
        status: 503, headers: { 'Cache-Control': 'no-store' }
    });
}

// Sólo se reemplazan assets públicos explícitos; Auth y API conservan su backend.
const visual_paths = new Set(['/', '/index.html', '/nosotros.html', '/catalogo.html', '/producto.html', '/carrito.html', '/cuenta.html', '/checkout.html', '/checkout-resultado.html', '/css/style.css', '/js/motion.js', '/js/app.js', '/js/catalogo.js', '/js/navigation.js', '/js/catalog-filter-state.js', '/js/carrito.js', '/js/presentation.js']);
const header_aliases = new Set(['/js/navigation.js', '/js/catalog-filter-state.js']);

function visual_request(request, pathname, asset) {
    const upstream = header_aliases.has(pathname) && asset ? new Request(new URL('/js/app.js', request.url), request) : request;
    if (!asset) return upstream;
    const headers = new Headers(request.headers);
    for (const name of ['If-None-Match', 'If-Modified-Since', 'Range', 'If-Range']) headers.delete(name);
    return new Request(upstream, { headers });
}

async function forward_request(request, env, options) {
    if (!options.backend_url) return env.DREAMS.fetch(request);
    const target = new URL(request.url);
    target.host = new URL(options.backend_url).host;
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
    const headers = new Headers(upstream.headers);
    for (const name of ['Content-Length', 'Content-Encoding', 'Last-Modified', 'Content-Range', 'Accept-Ranges']) headers.delete(name);
    headers.set('Content-Type', asset.content_type);
    headers.set('ETag', asset.etag);
    headers.set('Cache-Control', 'no-cache');
    await upstream.body?.cancel();
    const matches = asset_not_modified(request, asset);
    return new Response(matches || request.method === 'HEAD' ? null : asset.body, { status: matches ? 304 : 200, headers });
}

export function create_proxy(visual_assets = {}, options = {}) {
    const valid_backend = /^https:\/\/[a-f0-9]{8}-dreams-perfumes\.dreams-perfumes\.workers\.dev$/.test(options.backend_url || '');
    return {
        async fetch(request, env) {
            if (options.backend_url ? !valid_backend : !env.DREAMS?.fetch) return unavailable();
            try {
                const pathname = new URL(request.url).pathname;
                const asset = visual_paths.has(pathname) && ['GET', 'HEAD'].includes(request.method) ? visual_assets[pathname] : null;
                const upstream = await forward_request(visual_request(request, pathname, asset), env, options);
                return !asset || upstream.status !== 200 ? upstream : await visual_response(request, upstream, asset);
            } catch {
                return unavailable();
            }
        }
    };
}

export default create_proxy();
