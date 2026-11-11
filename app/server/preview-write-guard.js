// bloquea las escrituras de un entorno de lectura; permite solo las excepciones expresas.
const { official_route: comprobar_ruta_oficial } = require('./official-policy');
const writes = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const allowed_posts = new Set([
    '/api/cart/quote', '/api/auth/google', '/api/auth/register', '/api/auth/login', '/api/auth/logout',
    '/api/presentation/session', '/api/presentation/payment', '/api/presentation/result'
]);

function bloqueado_mensaje(path) {
    if (path.startsWith('/api/admin/')) return 'No podés modificar el catálogo, usuarios ni datos administrativos desde esta preview.';
    if (path.startsWith('/api/checkout/') || path.startsWith('/api/payments/')) return 'El checkout y los pagos comerciales no están habilitados en esta preview.';
    if (path.startsWith('/api/coupons/')) return 'Los cupones comerciales no están habilitados en esta preview.';
    if (path.startsWith('/api/reviews')) return 'No podés publicar ni modificar opiniones desde esta preview.';
    if (path.startsWith('/api/inquiries')) return 'El envío de consultas no está habilitado en esta preview.';
    return 'Esta operación de escritura no está habilitada en esta preview.';
}

function bloquear_escrituras_de_prueba(enabled, customer_data = false, official = false) {
    return (solicitud, respuesta, siguiente) => {
        // la excepcion es post exacto: no habilitar prefijos ni escrituras administrativas.
        if (!enabled || !writes.has(solicitud.method)) return siguiente();
        if (official && comprobar_ruta_oficial(solicitud.method, solicitud.path)) return siguiente();
        if (solicitud.method === 'POST' && allowed_posts.has(solicitud.path)) return siguiente();
        if (customer_data && ((solicitud.method === 'POST' && ['/api/cart/account', '/api/reviews'].includes(solicitud.path)) || (solicitud.method === 'DELETE' && /^\/api\/reviews\/[1-9]\d*$/.test(solicitud.path)))) return siguiente();
        return respuesta.status(403).json({ error: bloqueado_mensaje(solicitud.path), code: 'preview_write_blocked' });
    };
}

module.exports = { preview_write_guard: bloquear_escrituras_de_prueba };
