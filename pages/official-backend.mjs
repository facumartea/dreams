const official_origin = 'https://dreams-perfumes.pages.dev';
export function official_target(path) {
    return path === '/api' || path.startsWith('/api/') || ['/admin', '/admin.html', '/js/admin-console-v3.js'].includes(path);
}
export function official_options(env, options) {
    if (!options.official_service) return options;
    if (options.official_service !== 'dreams-official-backend') throw new Error('Unexpected official service');
    return { ...options, fetch_backend: request => {
        if (!env.DREAMS_OFFICIAL?.fetch) throw new Error('Missing private official binding');
        const url = new URL(request.url), target = new URL(official_origin);
        target.pathname = url.pathname; target.search = url.search;
        return env.DREAMS_OFFICIAL.fetch(new Request(target, request));
    } };
}
