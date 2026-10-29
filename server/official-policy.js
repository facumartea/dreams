const OFFICIAL_ORIGIN = 'https://dreams-perfumes.pages.dev';
const reads = new Set(['/admin', '/admin.html', '/js/admin-console-v3.js', '/api/health', '/api/config', '/api/products', '/api/brands', '/api/reviews', '/api/cart/config', '/api/cart/account', '/api/auth/me', '/api/auth/config', '/api/auth/google/config', '/api/auth/google/callback', '/api/checkout/config', '/api/admin/stats', '/api/admin/products', '/api/admin/users', '/api/admin/inquiries', '/api/admin/reviews', '/api/admin/orders', '/api/admin/coupons']);
const posts = new Set(['/api/auth/register', '/api/auth/login', '/api/auth/logout', '/api/auth/google', '/api/cart/quote', '/api/cart/account', '/api/reviews', '/api/inquiries', '/api/presentation/session', '/api/presentation/payment', '/api/presentation/result', '/api/admin/products', '/api/admin/coupons']);
function official_enabled(options) {
    return options.official_api === true && options.app_base_url === OFFICIAL_ORIGIN;
}
function official_route(method, path) {
    if (['GET', 'HEAD'].includes(method)) return reads.has(path) || /^\/api\/products\/[1-9]\d*$/.test(path);
    if (method === 'POST') return posts.has(path);
    if (['PUT', 'DELETE'].includes(method) && /^\/api\/admin\/(products|coupons|reviews)\/[1-9]\d*$/.test(path)) return true;
    return method === 'DELETE' && /^\/api\/reviews\/[1-9]\d*$/.test(path);
}
module.exports = { OFFICIAL_ORIGIN, official_enabled, official_route };
