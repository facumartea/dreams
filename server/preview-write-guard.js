const writes = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const allowed_posts = new Set([
    '/api/cart/quote', '/api/auth/google', '/api/auth/register', '/api/auth/login', '/api/auth/logout',
    '/api/presentation/session', '/api/presentation/payment', '/api/presentation/result'
]);

function blocked_message(path) {
    if (path.startsWith('/api/admin/')) return 'No podés modificar el catálogo, usuarios ni datos administrativos desde esta preview.';
    if (path.startsWith('/api/checkout/') || path.startsWith('/api/payments/')) return 'El checkout y los pagos comerciales no están habilitados en esta preview.';
    if (path.startsWith('/api/coupons/')) return 'Los cupones comerciales no están habilitados en esta preview.';
    if (path.startsWith('/api/reviews')) return 'No podés publicar ni modificar opiniones desde esta preview.';
    if (path.startsWith('/api/inquiries')) return 'El envío de consultas no está habilitado en esta preview.';
    return 'Esta operación de escritura no está habilitada en esta preview.';
}

function preview_write_guard(enabled, customer_data = false) {
    return (request, response, next) => {
        // La excepción es POST exacto: no habilitar prefijos ni escrituras administrativas.
        if (!enabled || !writes.has(request.method)) return next();
        if (request.method === 'POST' && allowed_posts.has(request.path)) return next();
        if (customer_data && ((request.method === 'POST' && ['/api/cart/account', '/api/reviews'].includes(request.path)) || (request.method === 'DELETE' && /^\/api\/reviews\/[1-9]\d*$/.test(request.path)))) return next();
        return response.status(403).json({ error: blocked_message(request.path), code: 'preview_write_blocked' });
    };
}

module.exports = { preview_write_guard };
