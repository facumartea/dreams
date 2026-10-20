function preview_response(response, request, backend) {
    const headers = new Headers(response.headers);
    headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    const location = headers.get('Location');
    if (location) {
        const url = new URL(location, backend);
        // Sólo nuestras redirecciones absolutas cambian de origen; nunca destinos externos.
        if ([backend, 'https://academic-review-dreams-perfumes.dreams-perfumes.workers.dev'].includes(url.origin)) {
            const origin = new URL(request.url).origin;
            headers.set('Location', origin + url.pathname + url.search + url.hash);
        }
    }
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

const visual_paths = new Set(['/', '/index.html', '/css/cinema.css', '/js/cinema-video.js', '/js/cinema-scroll.js']);

function upstream_request(request, backend, asset) {
    const target = new URL(request.url);
    target.host = new URL(backend).host;
    if (asset && target.pathname.startsWith('/js/')) target.pathname = '/js/hero-video.js';
    if (asset && target.pathname.startsWith('/css/')) target.pathname = '/css/style.css';
    const headers = new Headers(request.headers);
    headers.delete('Host');
    if (asset) for (const name of ['If-None-Match', 'If-Modified-Since', 'Range', 'If-Range']) headers.delete(name);
    return new Request(target, new Request(request, { headers, redirect: 'manual' }));
}

async function overlay_response(request, upstream, asset) {
    const headers = new Headers(upstream.headers);
    for (const name of ['Content-Length', 'Content-Encoding', 'Last-Modified', 'Content-Range', 'Accept-Ranges']) headers.delete(name);
    headers.set('Content-Type', asset.content_type);
    headers.set('ETag', asset.etag);
    if (!/private|no-store/i.test(headers.get('Cache-Control') || '')) headers.set('Cache-Control', 'no-cache');
    const matches = (request.headers.get('If-None-Match') || '').split(',').some(tag => tag.trim() === '*' || tag.trim().replace(/^W\//, '') === asset.etag);
    await upstream.body?.cancel();
    return new Response(request.method === 'HEAD' || matches ? null : asset.body, { status: matches ? 304 : 200, headers });
}

export function create_animated_proxy(backend, fetch_backend = fetch, visual_assets = {}) {
    if (!/^https:\/\/[a-f0-9]{8}-dreams-perfumes\.dreams-perfumes\.workers\.dev$/.test(backend)) throw new Error('Invalid preview backend');
    return { async fetch(request) {
        if (new URL(request.url).pathname === '/robots.txt') return new Response('User-agent: *\nDisallow: /\n', { headers: { 'Content-Type': 'text/plain', 'X-Robots-Tag': 'noindex, nofollow, noarchive' } });
        const pathname = new URL(request.url).pathname;
        const asset = visual_paths.has(pathname) && ['GET', 'HEAD'].includes(request.method) ? visual_assets[pathname] : null;
        try {
            // Cuerpo, cookies y Origin originales: el backend conserva sus permisos y CSRF.
            const upstream = await fetch_backend(upstream_request(request, backend, asset));
            const response = asset && upstream.status === 200 ? await overlay_response(request, upstream, asset) : upstream;
            return preview_response(response, request, backend);
        } catch {
            return Response.json({ error: 'El servicio no está disponible temporalmente.' }, { status: 503, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow, noarchive' } });
        }
    } };
}
