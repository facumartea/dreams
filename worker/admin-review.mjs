import { createServer } from 'node:http';
import { handleAsNodeRequest } from 'cloudflare:node';
import { createClient } from '@supabase/supabase-js';
import appModule from '../server/app.js';
import adminHtml from '../views/admin.html';
import adminScript from '../public/js/admin.js';
let server;
const reads = new Set(['/admin', '/admin.html', '/js/admin-console-v3.js', '/api/auth/me', '/api/config', '/api/health', '/api/admin/stats', '/api/admin/products', '/api/admin/users', '/api/admin/inquiries', '/api/admin/reviews', '/api/admin/orders', '/api/admin/coupons']);
function expected_environment(env) {
    const origins = appModule.allowed_origin_set(env.APP_ORIGINS);
    if (env.SUPABASE_URL !== 'https://nwsmbemwtexmrtpkgxrz.supabase.co' || !env.SUPABASE_SECRET_KEY) throw new Error('Missing expected project');
    if (!env.APP_BASE_URL?.startsWith('https://') || !origins.has(env.APP_BASE_URL)) throw new Error('Missing expected origins');
    for (const origin of String(env.APP_ORIGINS).split(',')) if (!appModule.normalize_origin(origin)?.startsWith('https://')) throw new Error('Invalid origin');
}
function create_admin_app(env) {
    expected_environment(env);
    const client = access => createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false }, ...(access ? { global: { headers: { Authorization: `Bearer ${access}` } } } : {}) });
    return appModule.create_app({ database: client(), create_auth_client: client, production: true,
        preview_read_only: true, demo_auto_confirm_email: false, checkout_schema_ready: false, disable_request_log: true,
        product_brand_column: 'marca', allowed_origins: env.APP_ORIGINS, app_base_url: env.APP_BASE_URL,
        admin_html: adminHtml, admin_script: adminScript,
        public_directory: '/virtual/public', views_directory: '/virtual/views',
        static_middleware: (_req, _res, next) => next(),
        logger: { warn: () => console.warn('DREAMS Admin session unavailable'), error: () => console.error('DREAMS Admin request failed') }
    });
}
function trusted_request(request) {
    const headers = new Headers(request.headers);
    for (const name of ['x-forwarded-for', 'x-forwarded-host', 'x-forwarded-proto']) headers.delete(name);
    if (headers.get('cf-connecting-ip')) headers.set('x-forwarded-for', headers.get('cf-connecting-ip'));
    headers.set('x-forwarded-proto', 'https'); return new Request(request, { headers });
}
export default {
    async fetch(request, env) {
        const path = new URL(request.url).pathname;
        if (!(request.method === 'GET' && reads.has(path)) && !(request.method === 'POST' && ['/api/auth/login', '/api/auth/logout'].includes(path))) return Response.json({ error: 'Las escrituras del Admin no están habilitadas en esta preview de revisión.' }, { status: 403, headers: { 'Cache-Control': 'no-store' } });
        try {
            if (!server) { server = createServer(create_admin_app(env)); server.listen(8080); }
            return await handleAsNodeRequest(8080, trusted_request(request));
        } catch { console.error('DREAMS Admin runtime unavailable'); return Response.json({ error: 'No pudimos cargar el panel. Reintentá más tarde.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } }); }
    }
};
