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

export function create_animated_proxy(backend, fetch_backend = fetch) {
    if (!/^https:\/\/[a-f0-9]{8}-dreams-perfumes\.dreams-perfumes\.workers\.dev$/.test(backend)) throw new Error('Invalid preview backend');
    return { async fetch(request) {
        if (new URL(request.url).pathname === '/robots.txt') return new Response('User-agent: *\nDisallow: /\n', { headers: { 'Content-Type': 'text/plain', 'X-Robots-Tag': 'noindex, nofollow, noarchive' } });
        const target = new URL(request.url);
        target.host = new URL(backend).host;
        const forwarded = new Request(target, request);
        forwarded.headers.delete('Host');
        try {
            // Cuerpo, cookies y Origin originales: el backend conserva sus permisos y CSRF.
            const response = await fetch_backend(new Request(forwarded, { redirect: 'manual' }));
            return preview_response(response, request, backend);
        } catch {
            return Response.json({ error: 'El servicio no está disponible temporalmente.' }, { status: 503, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow, noarchive' } });
        }
    } };
}
