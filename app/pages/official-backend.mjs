// lee el destino aprobado del backend; el navegador no puede elegir otro servidor.
const official_origin = 'https://dreams-perfumes.pages.dev';
function obtener_destino_oficial(path) {
    return path === '/api' || path.startsWith('/api/') || ['/admin', '/admin.html', '/js/admin-console-v3.js'].includes(path);
}
export { obtener_destino_oficial as official_target };
function preparar_opciones_oficiales(env, options) {
    if (!options.official_service) return options;
    if (options.official_service !== 'dreams-official-backend') throw new Error('Unexpected official service');
    return { ...options, fetch_backend: solicitud => {
        if (!env.DREAMS_OFFICIAL?.fetch) throw new Error('Missing private official binding');
        const url = new URL(solicitud.url), target = new URL(official_origin);
        target.pathname = url.pathname; target.search = url.search;
        return env.DREAMS_OFFICIAL.fetch(new Request(target, solicitud));
    } };
}
export { preparar_opciones_oficiales as official_options };
