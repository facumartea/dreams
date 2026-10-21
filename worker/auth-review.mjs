import { createServer } from 'node:http';
import { createHmac } from 'node:crypto';
import { handleAsNodeRequest } from 'cloudflare:node';
import { createClient } from '@supabase/supabase-js';
import appModule from '../server/app.js';

let server;
const auth_routes = new Set(['POST /api/auth/register', 'POST /api/auth/login', 'POST /api/auth/logout', 'GET /api/auth/me', 'GET /api/auth/config', 'GET /api/health', 'GET /api/cart/config', 'GET /api/cart/account', 'POST /api/cart/account', 'GET /api/reviews', 'POST /api/reviews']);

function validate_environment(env) {
    const origins = appModule.allowed_origin_set(env.APP_ORIGINS);
    const entries = String(env.APP_ORIGINS || '').split(',').filter(Boolean);
    if (!env.SUPABASE_SECRET_KEY || env.SUPABASE_URL !== 'https://nwsmbemwtexmrtpkgxrz.supabase.co') throw new Error('Missing expected Auth project');
    if (!env.APP_BASE_URL?.startsWith('https://') || !origins.has(env.APP_BASE_URL) || !entries.length || entries.some(value => !appModule.normalize_origin(value)?.startsWith('https://'))) throw new Error('Missing exact HTTPS Auth origins');
}

async function email_confirmation_required(env) {
    const response = await fetch(`${env.SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: env.SUPABASE_SECRET_KEY }, signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error('Auth settings unavailable');
    return (await response.json()).mailer_autoconfirm !== true;
}

function create_auth_app(env) {
    validate_environment(env);
    const client = access => createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
        auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
        ...(access ? { global: { headers: { Authorization: `Bearer ${access}` } } } : {})
    });
    return appModule.create_app({
        database: client(), create_auth_client: client, production: true, disable_request_log: true,
        preview_read_only: true, demo_auto_confirm_email: false, checkout_schema_ready: false,
        customer_data_enabled: true, account_cart_enabled: true,
        account_cart_signing_key: createHmac('sha256', env.SUPABASE_SECRET_KEY).update('dreams-account-cart-signing-v1').digest('hex'),
        email_confirmation_required: () => email_confirmation_required(env), product_brand_column: 'marca',
        allowed_origins: env.APP_ORIGINS, app_base_url: env.APP_BASE_URL,
        logger: { warn: () => console.warn('DREAMS Auth session unavailable'), error: () => console.error('DREAMS Auth request failed') },
        static_middleware: (_request, _response, next) => next(), public_directory: '/virtual/public', views_directory: '/virtual/views'
    });
}

function verified_request(request) {
    const headers = new Headers(request.headers);
    for (const name of ['x-forwarded-for', 'x-forwarded-host', 'x-forwarded-proto']) headers.delete(name);
    const client_ip = request.headers.get('cf-connecting-ip');
    if (client_ip) headers.set('x-forwarded-for', client_ip);
    headers.set('x-forwarded-proto', new URL(request.url).protocol.slice(0, -1));
    return new Request(request, { headers });
}

export default {
    async fetch(request, env) {
        const path = new URL(request.url).pathname;
        if (!auth_routes.has(`${request.method} ${path}`) && !(request.method === 'DELETE' && /^\/api\/reviews\/[1-9]\d*$/.test(path))) return Response.json({ error: 'Esta ruta no está habilitada en el servicio de acceso.' }, { status: 403, headers: { 'Cache-Control': 'no-store' } });
        try {
            if (!server) { server = createServer(create_auth_app(env)); server.listen(8080); }
            return await handleAsNodeRequest(8080, verified_request(request));
        } catch {
            console.error('DREAMS Auth runtime unavailable');
            return Response.json({ error: 'El acceso no está disponible temporalmente. Reintentá más tarde.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
        }
    }
};
