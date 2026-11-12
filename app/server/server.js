// arranque local: prepara la conexion y escucha en el puerto configurado; no carga datos iniciales.
require('dotenv').config({ quiet: true });
const { createClient } = require('@supabase/supabase-js');
global.WebSocket = require('ws');
const { resolve_product_brand_column } = require('./product-schema');
const app_module = require('./app');

// reune las opciones del entorno para crear express; no activa un servicio por el solo hecho de importarlo.
// el carrito local se habilita de forma expresa; su firma nunca usa una clave copiada de produccion.
function application_options(create_database, database, product_brand_column) {
    return {
        preview_read_only: process.env.PREVIEW_READ_ONLY === 'true',
        presentation_checkout: process.env.PRESENTATION_CHECKOUT_ENABLED === 'true',
        presentation_signing_key: process.env.PRESENTATION_SIGNING_KEY,
        account_cart_enabled: process.env.ACCOUNT_CART_ENABLED === 'true',
        account_cart_signing_key: process.env.ACCOUNT_CART_SIGNING_KEY || process.env.PRESENTATION_SIGNING_KEY,
        google_access_ready: process.env.GOOGLE_ACCESS_READY === 'true',
        create_oauth_client: storage => create_database(null, { flowType: 'pkce', storage, storageKey: 'dreams-google', persistSession: true }),
        google_provider_enabled: async () => {
            const response = await fetch(`${process.env.SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: process.env.SUPABASE_SECRET_KEY } });
            if (!response.ok) return false;
            return (await response.json()).external?.google === true;
        },
        product_brand_column,
        database,
        create_auth_client: create_database,
        production: process.env.NODE_ENV === 'production',
        contact_email: process.env.CONTACT_EMAIL,
        whatsapp_number: process.env.WHATSAPP_NUMBER,
        allowed_origins: process.env.APP_ORIGINS,
        demo_auto_confirm_email: process.env.DEMO_AUTO_CONFIRM_EMAIL === 'true',
        app_base_url: process.env.APP_BASE_URL,
    };
}

// exige url y clave del mismo entorno, detecta el campo de marca y abre el puerto; un error impide arrancar.
async function start() {
    const needed = ['SUPABASE_URL', 'SUPABASE_SECRET_KEY'].filter(key => !process.env[key]);
    if (needed.length) throw new Error(`Faltan variables obligatorias: ${needed.join(', ')}`);

    const client_options = { auth: { autoRefreshToken: false, persistSession: false } };
    const create_database = (access_token, auth_options = {}) => createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
        ...client_options, auth: { ...client_options.auth, ...auth_options },
        ...(access_token ? { global: { headers: { Authorization: `Bearer ${access_token}` } } } : {})
    });
    const database = create_database();
    const port = Number(process.env.PORT || 8080);
    const product_brand_column = await resolve_product_brand_column(database);
    const app = app_module.create_app(application_options(create_database, database, product_brand_column));

    return app.listen(port, '0.0.0.0', () => {
        console.log(`DREAMS funcionando en el puerto ${port} con Supabase.`);
    });
}

if (require.main === module) start().catch(error => {
    console.error('No se pudo iniciar DREAMS.', { kind: String(error?.code || error?.name || 'unknown').slice(0, 80) });
    process.exitCode = 1;
});
module.exports = { ...app_module, start };
