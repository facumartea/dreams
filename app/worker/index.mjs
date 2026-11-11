// adapta express al worker y evita compartir el cliente autenticado entre solicitudes.
import { createServer } from 'node:http';
import { handleAsNodeRequest } from 'cloudflare:node';
import { createClient } from '@supabase/supabase-js';
import appModule from '../server/app.js';
import payments from '../server/payments/mercado-pago.js';
import demoPayments from '../server/payments/demo.js';
import adminHtml from '../views/admin.html';
import notFoundHtml from '../public/404.html';
import adminScript from '../public/js/admin.js';

let server;

function crear_cliente_de_prueba(env) {
    return (accessToken, authOptions = {}) => createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
        auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false, ...authOptions },
        global: {
            fetch: async (...args) => {
                const response = await fetch(...args);
                if (!response.ok) console.error('DREAMS Supabase HTTP failed', { status: response.status });
                return response;
            },
            ...(accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {})
        }
    });
}

function servir_archivos_estaticos(env) {
    return async (solicitud, respuesta, siguiente) => {
            if (!['GET', 'HEAD'].includes(solicitud.method) || solicitud.path.startsWith('/api/') || ['/admin', '/admin.html', '/favoritos', '/favoritos.html'].includes(solicitud.path)) return siguiente();
            try {
                const assetUrl = new URL(solicitud.originalUrl, 'https://assets.internal');
                if (assetUrl.pathname === '/') assetUrl.pathname = '/index.html';
                const asset = await env.ASSETS.fetch(new Request(assetUrl, { method: solicitud.method }));
                if (asset.status === 404) return siguiente();
                respuesta.status(asset.status);
                for (const [name, value] of asset.headers) {
                    if (name === 'cache-control' && respuesta.getHeader('Cache-Control') === 'no-store') continue;
                    if (!['content-security-policy', 'set-cookie'].includes(name)) respuesta.setHeader(name, value);
                }
                respuesta.send(solicitud.method === 'HEAD' ? undefined : Buffer.from(await asset.arrayBuffer()));
            } catch (error) { siguiente(error); }
        };
}

function preparar_opciones_del_worker(env, createDatabase, paymentProvider) {
    return {
        database: createDatabase(), create_auth_client: createDatabase,
        preview_read_only: env.PREVIEW_READ_ONLY === 'true',
        presentation_checkout: env.PRESENTATION_CHECKOUT_ENABLED === 'true',
        presentation_signing_key: env.PRESENTATION_SIGNING_KEY,
        google_access_ready: env.GOOGLE_ACCESS_READY === 'true',
        create_oauth_client: storage => createDatabase(null, { flowType: 'pkce', storage, storageKey: 'dreams-google', persistSession: true }),
        google_provider_enabled: async () => {
            const response = await fetch(`${env.SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: env.SUPABASE_SECRET_KEY } });
            if (!response.ok) return false;
            return (await response.json()).external?.google === true;
        },
        product_brand_column: env.PRODUCT_BRAND_COLUMN || 'marca',
        production: env.NODE_ENV !== 'development',
        disable_request_log: true,
        logger: { error: (_, metadata) => console.error('DREAMS API request failed', { kind: metadata?.kind }), warn: (_, metadata) => console.warn('DREAMS session operation failed', { kind: metadata?.kind }) },
        allowed_origins: env.APP_ORIGINS,
        app_base_url: env.APP_BASE_URL,
        contact_email: env.CONTACT_EMAIL, whatsapp_number: env.WHATSAPP_NUMBER,
        demo_auto_confirm_email: env.DEMO_AUTO_CONFIRM_EMAIL === 'true',
        checkout_schema_ready: env.CHECKOUT_SCHEMA_READY === 'true',
        show_checkout_test_data: env.CHECKOUT_SHOW_TEST_DATA === 'true',
        payment_provider: paymentProvider,
        public_directory: '/virtual/public', views_directory: '/virtual/views',
        admin_html: adminHtml, not_found_html: notFoundHtml, admin_script: adminScript,
        static_middleware: servir_archivos_estaticos(env)
    };
}

function crear_aplicacion_del_worker(env) {
    if (env.NODE_ENV !== 'development') {
        const base = appModule.normalize_origin(env.APP_BASE_URL);
        const origins = appModule.allowed_origin_set(env.APP_ORIGINS);
        const entries = String(env.APP_ORIGINS || '').split(',').map(value => value.trim()).filter(Boolean);
        if (!base?.startsWith('https://') || !origins.has(base) || !entries.length || entries.some(value => !appModule.normalize_origin(value)?.startsWith('https://'))) throw new Error('Missing exact HTTPS application origins');
    }
    if (!env.SUPABASE_URL || !env.SUPABASE_SECRET_KEY) throw new Error('Missing server Supabase configuration');
    const createDatabase = crear_cliente_de_prueba(env);
    const paymentProvider = env.CHECKOUT_PROVIDER === 'demo'
        ? new demoPayments.DemoPaymentProvider()
        : new payments.MercadoPagoProvider({ access_token: env.MERCADO_PAGO_ACCESS_TOKEN, webhook_secret: env.MERCADO_PAGO_WEBHOOK_SECRET, mode: env.MERCADO_PAGO_MODE });
    return appModule.create_app(preparar_opciones_del_worker(env, createDatabase, paymentProvider));
}

export default {
    async fetch(solicitud, env) {
        try {
            if (!server) {
                server = createServer(crear_aplicacion_del_worker(env));
                server.listen(8080);
            }
            // los limites usan solo la ip de cliente informada por cloudflare.
            const headers = new Headers(solicitud.headers);
            headers.delete('x-forwarded-for');
            headers.delete('x-forwarded-host');
            headers.delete('x-forwarded-proto');
            const clientIp = solicitud.headers.get('cf-connecting-ip');
            if (clientIp) headers.set('x-forwarded-for', clientIp);
            headers.set('x-forwarded-proto', new URL(solicitud.url).protocol.slice(0, -1));
            return await handleAsNodeRequest(8080, new Request(solicitud, { headers }));
        } catch (error) {
            console.error('DREAMS Worker request failed', { kind: error?.name, code: error?.code});
            return Response.json({ error: 'El servicio no está disponible temporalmente.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
        }
    }
};
