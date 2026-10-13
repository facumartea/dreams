// Sólo reemplaza assets visuales explícitos; API, cookies y permisos siguen en DREAMS.
const visual_paths = new Set(['/', '/index.html', '/nosotros.html', '/catalogo.html', '/producto.html', '/carrito.html', '/cuenta.html', '/checkout.html', '/checkout-resultado.html', '/css/style.css', '/js/motion.js', '/js/app.js', '/js/catalogo.js', '/js/navigation.js', '/js/featured-carousel.js', '/js/carrito.js', '/js/presentation.js']);

function unavailable() {
    return Response.json({ error: 'El servicio no está disponible temporalmente.' }, {
        status: 503, headers: { 'Cache-Control': 'no-store' }
    });
}

function visual_request(request, pathname, asset) {
    // Un script nuevo toma cabeceras defensivas de una ruta ya existente.
    let upstream = ['/js/navigation.js', '/js/featured-carousel.js'].includes(pathname) && asset ? new Request(new URL('/js/app.js', request.url), request) : request;
    if (!asset) return upstream;
    const headers = new Headers(request.headers);
    for (const name of ['If-None-Match', 'If-Modified-Since', 'Range', 'If-Range']) headers.delete(name);
    return new Request(upstream, { headers });
}

async function request_backend(request, env, options) {
    if (!options.backend_url) return env.DREAMS.fetch(request);
    const target = new URL(request.url);
    target.host = new URL(options.backend_url).host;
    const forwarded = new Request(target, request);
    forwarded.headers.delete('Host');
    // Nunca seguir redirecciones al reenviar cookies o un cuerpo privado.
    return (options.fetch_backend || fetch)(new Request(forwarded, { redirect: 'manual' }));
}

async function visual_response(request, upstream, asset) {
    const headers = new Headers(upstream.headers);
    for (const name of ['Content-Length', 'Content-Encoding', 'Last-Modified', 'Content-Range', 'Accept-Ranges']) headers.delete(name);
    headers.set('Content-Type', asset.content_type);
    headers.set('ETag', asset.etag);
    headers.set('Cache-Control', 'no-cache');
    await upstream.body?.cancel();
    const matches = (request.headers.get('If-None-Match') || '').split(',').some(value => {
        const tag = value.trim();
        return tag === '*' || tag.replace(/^W\//, '') === asset.etag;
    });
    return new Response(matches || request.method === 'HEAD' ? null : asset.body, { status: matches ? 304 : 200, headers });
}

async function proxy_fetch(request, env, visual_assets, options) {
    const valid_backend = /^https:\/\/[a-f0-9]{8}-dreams-perfumes\.dreams-perfumes\.workers\.dev$/.test(options.backend_url || '');
    if (options.backend_url ? !valid_backend : !env.DREAMS?.fetch) return unavailable();
    try {
        const pathname = new URL(request.url).pathname;
        const asset = visual_paths.has(pathname) && ['GET', 'HEAD'].includes(request.method) ? visual_assets[pathname] : null;
        const upstream = await request_backend(visual_request(request, pathname, asset), env, options);
        if (!asset || upstream.status !== 200) return upstream;
        return await visual_response(request, upstream, asset);
    } catch { return unavailable(); }
}

// Destino inmutable pre-video: jamás un alias de preview que pueda cambiar.
export function create_proxy(visual_assets = {}, options = {}) {
    return { fetch: (request, env) => proxy_fetch(request, env, visual_assets, options) };
}
export default create_proxy();
