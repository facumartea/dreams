// entrada del backend privado oficial: usa el cliente servidor y restringe las rutas disponibles.
import { createServer } from 'node:http';
import { createHmac } from 'node:crypto';
import { handleAsNodeRequest } from 'cloudflare:node';
import { create_official_database } from './official-client.mjs';
import appModule from '../server/app.js';
import policy from '../server/official-policy.js';
import { legacy_presentation } from './official-legacy.mjs';
import adminHtml from '../views/admin.html';
import adminScript from '../public/js/admin.js';
let server;
function expected_environment(env) {
    if (env.SUPABASE_URL !== 'https://nwsmbemwtexmrtpkgxrz.supabase.co' || !env.SUPABASE_SECRET_KEY) throw new Error('Missing expected project');
    if (env.APP_BASE_URL !== policy.OFFICIAL_ORIGIN || env.APP_ORIGINS !== policy.OFFICIAL_ORIGIN) throw new Error('Missing exact official origin');
}
// compone la entrada del servicio privado con dependencias y rutas oficiales; no arranca un puerto como node local.
function create_official_app(env) {
    expected_environment(env);
    const client = access => create_official_database(env, access);
    const signing_key = purpose => createHmac('sha256', env.SUPABASE_SECRET_KEY).update(purpose).digest('hex');
    return appModule.create_app({ database: client(), create_auth_client: client, production: true,
        official_api: true, preview_read_only: true, customer_data_enabled: true, account_cart_enabled: true,
        account_cart_signing_key: signing_key('DREAMS account cart official v1'),
        presentation_checkout: true, presentation_signing_key: signing_key('DREAMS academic official v1'), presentation_issuer: 'dreams-official-v1',
        demo_auto_confirm_email: false, checkout_schema_ready: false, google_access_ready: false, disable_request_log: true,
        email_confirmation_required: async () => false,
        product_brand_column: 'marca', allowed_origins: env.APP_ORIGINS, app_base_url: env.APP_BASE_URL,
        contact_email: 'facundo.martearena@dantebariloche.edu.ar', whatsapp_number: '542944160065',
        admin_html: adminHtml, admin_script: adminScript, public_directory: '/virtual/public', views_directory: '/virtual/views',
        static_middleware: (_req, _res, next) => next(),
        logger: { warn: () => console.warn('DREAMS official session unavailable'), error: () => console.error('DREAMS official request failed') }
    });
}
function trusted_request(request) {
    const headers = new Headers(request.headers);
    for (const name of ['x-forwarded-for', 'x-forwarded-host', 'x-forwarded-proto']) headers.delete(name);
    if (headers.get('cf-connecting-ip')) headers.set('x-forwarded-for', headers.get('cf-connecting-ip'));
    headers.set('x-forwarded-proto', 'https'); return new Request(request, { headers });
}
function official_version_response(response, env) {
    const headers = new Headers(response.headers);
    if (env.CF_VERSION_METADATA?.id) headers.set('X-Dreams-Backend-Version', env.CF_VERSION_METADATA.id);
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
export async function fetch_official(request, env) {
    const url = new URL(request.url);
    if (url.origin !== policy.OFFICIAL_ORIGIN || !policy.official_route(request.method, url.pathname)) return official_version_response(Response.json({ error: 'Esta operación no está habilitada.' }, { status: 403, headers: { 'Cache-Control': 'no-store' } }), env);
    try {
        expected_environment(env);
        const legacy = await legacy_presentation(request);
        if (legacy) return official_version_response(legacy, env);
        if (!server) { server = createServer(create_official_app(env)); server.listen(8080); }
        return official_version_response(await handleAsNodeRequest(8080, trusted_request(request)), env);
    } catch { console.error('DREAMS official runtime unavailable'); return official_version_response(Response.json({ error: 'El servicio no está disponible temporalmente.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } }), env); }
}

export default {
    fetch: fetch_official,
    // absorber eventos antiguos durante la propagacion de la retirada del cron.
    // produccion no conserva diagnostico, qa ni acceso a la contrasena temporal.
    scheduled() {}
};
