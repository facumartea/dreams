// entrada del backend oficial; delega en express y deja retirados los mecanismos temporales de qa.
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
function comprobar_entorno_esperado(env) {
    if (env.SUPABASE_URL !== 'https://nwsmbemwtexmrtpkgxrz.supabase.co' || !env.SUPABASE_SECRET_KEY) throw new Error('Missing expected project');
    if (env.APP_BASE_URL !== policy.OFFICIAL_ORIGIN || env.APP_ORIGINS !== policy.OFFICIAL_ORIGIN) throw new Error('Missing exact official origin');
}
function crear_aplicacion_oficial(env) {
    comprobar_entorno_esperado(env);
    const crear_cliente = access => create_official_database(env, access);
    const obtener_clave_de_firma = purpose => createHmac('sha256', env.SUPABASE_SECRET_KEY).update(purpose).digest('hex');
    return appModule.create_app({ database: crear_cliente(), create_auth_client: crear_cliente, production: true,
        official_api: true, preview_read_only: true, customer_data_enabled: true, account_cart_enabled: true,
        account_cart_signing_key: obtener_clave_de_firma('DREAMS account cart official v1'),
        presentation_checkout: true, presentation_signing_key: obtener_clave_de_firma('DREAMS academic official v1'), presentation_issuer: 'dreams-official-v1',
        demo_auto_confirm_email: false, checkout_schema_ready: false, google_access_ready: false, disable_request_log: true,
        email_confirmation_required: async () => false,
        product_brand_column: 'marca', allowed_origins: env.APP_ORIGINS, app_base_url: env.APP_BASE_URL,
        contact_email: 'facundo.martearena@dantebariloche.edu.ar', whatsapp_number: '542944160065',
        admin_html: adminHtml, admin_script: adminScript, public_directory: '/virtual/public', views_directory: '/virtual/views',
        static_middleware: (_req, _res, siguiente) => siguiente(),
        logger: { warn: () => console.warn('DREAMS official session unavailable'), error: () => console.error('DREAMS official request failed') }
    });
}
function preparar_solicitud_de_origen_confiable(solicitud) {
    const headers = new Headers(solicitud.headers);
    for (const name of ['x-forwarded-for', 'x-forwarded-host', 'x-forwarded-proto']) headers.delete(name);
    if (headers.get('cf-connecting-ip')) headers.set('x-forwarded-for', headers.get('cf-connecting-ip'));
    headers.set('x-forwarded-proto', 'https'); return new Request(solicitud, { headers });
}
function informar_version_oficial(respuesta, env) {
    const headers = new Headers(respuesta.headers);
    if (env.CF_VERSION_METADATA?.id) headers.set('X-Dreams-Backend-Version', env.CF_VERSION_METADATA.id);
    return new Response(respuesta.body, { status: respuesta.status, statusText: respuesta.statusText, headers });
}
async function atender_solicitud_oficial(solicitud, env) {
    const url = new URL(solicitud.url);
    if (url.origin !== policy.OFFICIAL_ORIGIN || !policy.official_route(solicitud.method, url.pathname)) return informar_version_oficial(Response.json({ error: 'Esta operación no está habilitada.' }, { status: 403, headers: { 'Cache-Control': 'no-store' } }), env);
    try {
        comprobar_entorno_esperado(env);
        const legacy = await legacy_presentation(solicitud);
        if (legacy) return informar_version_oficial(legacy, env);
        if (!server) { server = createServer(crear_aplicacion_oficial(env)); server.listen(8080); }
        return informar_version_oficial(await handleAsNodeRequest(8080, preparar_solicitud_de_origen_confiable(solicitud)), env);
    } catch { console.error('DREAMS official runtime unavailable'); return informar_version_oficial(Response.json({ error: 'El servicio no está disponible temporalmente.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } }), env); }
}
export { atender_solicitud_oficial as fetch_official };

export default {
    fetch: atender_solicitud_oficial,
    // absorber eventos antiguos durante la propagacion de la retirada del cron.
    // produccion no conserva diagnostico, qa ni acceso a la contrasena temporal.
    scheduled() {}
};
