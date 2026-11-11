// arranca express en node con las variables del entorno; no incluye secretos en el codigo.
require('dotenv').config({ quiet: true });
const { createClient } = require('@supabase/supabase-js');
global.WebSocket = require('ws');
const { resolve_product_brand_column: detectar_columna_de_marca } = require('./product-schema');
const app_module = require('./app');
const { MercadoPagoProvider } = require('./payments/mercado-pago');
const { DemoPaymentProvider } = require('./payments/demo');

function preparar_opciones_de_la_aplicacion(create_database, database, payment_provider, product_brand_column) {
    return {
        preview_read_only: process.env.PREVIEW_READ_ONLY === 'true',
        presentation_checkout: process.env.PRESENTATION_CHECKOUT_ENABLED === 'true',
        presentation_signing_key: process.env.PRESENTATION_SIGNING_KEY,
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
        payment_provider,
        app_base_url: process.env.APP_BASE_URL,
        checkout_schema_ready: process.env.CHECKOUT_SCHEMA_READY === 'true',
        show_checkout_test_data: process.env.CHECKOUT_SHOW_TEST_DATA === 'true'
    };
}

// exige las variables necesarias y detecta la columna de marca antes de escuchar conexiones.
async function iniciar_servidor() {
    const needed = ['SUPABASE_URL', 'SUPABASE_SECRET_KEY'].filter(key => !process.env[key]);
    if (needed.length) throw new Error(`Faltan variables obligatorias: ${needed.join(', ')}`);

    const client_options = { auth: { autoRefreshToken: false, persistSession: false } };
    const crear_cliente_de_datos = (access_token, auth_options = {}) => createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
        ...client_options, auth: { ...client_options.auth, ...auth_options },
        ...(access_token ? { global: { headers: { Authorization: `Bearer ${access_token}` } } } : {})
    });
    const database = crear_cliente_de_datos();
    const checkout_provider = String(process.env.CHECKOUT_PROVIDER || 'mercado_pago').trim().toLowerCase();
    const payment_provider = checkout_provider === 'demo'
        ? new DemoPaymentProvider()
        : new MercadoPagoProvider({
            access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN,
            webhook_secret: process.env.MERCADO_PAGO_WEBHOOK_SECRET,
            mode: process.env.MERCADO_PAGO_MODE
        });
    const port = Number(process.env.PORT || 8080);
    const product_brand_column = await detectar_columna_de_marca(database);
    const app = app_module.create_app(preparar_opciones_de_la_aplicacion(crear_cliente_de_datos, database, payment_provider, product_brand_column));

    return app.listen(port, '0.0.0.0', () => {
        console.log(`DREAMS funcionando en el puerto ${port} con Supabase.`);
    });
}

if (require.main === module) iniciar_servidor().catch(error => {
    console.error('No se pudo iniciar DREAMS.', { kind: String(error?.code || error?.name || 'unknown').slice(0, 80) });
    process.exitCode = 1;
});
module.exports = { ...app_module, start: iniciar_servidor };
