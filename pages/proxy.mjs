function unavailable() {
    return Response.json({ error: 'El servicio no está disponible temporalmente.' }, {
        status: 503, headers: { 'Cache-Control': 'no-store' }
    });
}

// Only the explicitly packaged visual assets are replaced. All other routes,
// API bodies, authentication, cookies and authorization remain in DREAMS.
const visual_paths = new Set(['/', '/index.html', '/css/style.css', '/js/motion.js']);

export function create_proxy(visual_assets = {}) {
    return {
        async fetch(request, env) {
            if (!env.DREAMS?.fetch) return unavailable();
            try {
                const pathname = new URL(request.url).pathname;
                const asset = visual_paths.has(pathname) && ['GET', 'HEAD'].includes(request.method) ? visual_assets[pathname] : null;
                let upstream_request = request;
                if (asset) {
                    const headers = new Headers(request.headers);
                    for (const name of ['If-None-Match', 'If-Modified-Since', 'Range', 'If-Range']) headers.delete(name);
                    upstream_request = new Request(request, { headers });
                }
                const upstream = await env.DREAMS.fetch(upstream_request);
                if (!asset || upstream.status !== 200) return upstream;
                const headers = new Headers(upstream.headers);
                for (const name of ['Content-Length', 'Content-Encoding', 'Last-Modified', 'Content-Range', 'Accept-Ranges']) headers.delete(name);
                headers.set('Content-Type', asset.content_type);
                headers.set('ETag', asset.etag);
                // Prevent cached legacy motion/CSS from crossing this visual release.
                headers.set('Cache-Control', 'no-cache');
                await upstream.body?.cancel();
                const matches = (request.headers.get('If-None-Match') || '').split(',').some(value => {
                    const tag = value.trim();
                    return tag === '*' || tag.replace(/^W\//, '') === asset.etag;
                });
                return new Response(matches || request.method === 'HEAD' ? null : asset.body, {
                    status: matches ? 304 : 200, headers
                });
            } catch {
                return unavailable();
            }
        }
    };
}

export default create_proxy();
