// Selecciona proveedor sin confundir el demo histórico con la presentación académica.
function node_payment_provider() {
    const checkout_provider = String(process.env.CHECKOUT_PROVIDER || 'mercado_pago').trim().toLowerCase();
    const payment_provider = checkout_provider === 'demo'
    ? new DemoPaymentProvider()
    : new MercadoPagoProvider({
        access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN,
        webhook_secret: process.env.MERCADO_PAGO_WEBHOOK_SECRET,
        mode: process.env.MERCADO_PAGO_MODE
    });
    return payment_provider;
}

// Cliente por operación: desactiva persistencia y evita sesiones compartidas en servidor.
function node_database_factory() {
    const client_options = { auth: { autoRefreshToken: false, persistSession: false } };
    const create_database = (access_token, auth_options = {}) => createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
        ...client_options, auth: { ...client_options.auth, ...auth_options },
        ...(access_token ? { global: { headers: { Authorization: `Bearer ${access_token}` } } } : {})
    });
    return create_database;
}

// Configura PKCE/flags y clientes Auth exclusivamente en el servidor Node.
function node_auth_options(database, create_database, payment_provider, product_brand_column) {
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
    };
}

// Conserva los flags de comercio y los orígenes vigentes al construir Express.
function node_application_options(database, create_database, payment_provider, product_brand_column) {
    return {
        allowed_origins: process.env.APP_ORIGINS,
        demo_auto_confirm_email: process.env.DEMO_AUTO_CONFIRM_EMAIL === 'true',
        payment_provider,
        app_base_url: process.env.APP_BASE_URL,
        checkout_schema_ready: process.env.CHECKOUT_SCHEMA_READY === 'true',
        show_checkout_test_data: process.env.CHECKOUT_SHOW_TEST_DATA === 'true',
    };
}

require('dotenv').config({ quiet: true });
const { createClient } = require('@supabase/supabase-js');
global.WebSocket = require('ws');
const { resolve_product_brand_column } = require('./product-schema');
const app_module = require('./app');
const { MercadoPagoProvider } = require('./payments/mercado-pago');
const { DemoPaymentProvider } = require('./payments/demo');

async function start() {
    const needed = ['SUPABASE_URL', 'SUPABASE_SECRET_KEY'].filter(key => !process.env[key]);
    if (needed.length) throw new Error(`Faltan variables obligatorias: ${needed.join(', ')}`);

    const create_database = node_database_factory();
    const database = create_database();
    const payment_provider = node_payment_provider();
    const port = Number(process.env.PORT || 8080);
    const product_brand_column = await resolve_product_brand_column(database);
    const app = app_module.create_app({ ...node_auth_options(database, create_database, payment_provider, product_brand_column), ...node_application_options(database, create_database, payment_provider, product_brand_column) });

    return app.listen(port, '0.0.0.0', () => {
        console.log(`DREAMS funcionando en el puerto ${port} con Supabase.`);
    });
}

if (require.main === module) start().catch(error => {
    console.error('No se pudo iniciar DREAMS.', { kind: String(error?.code || error?.name || 'unknown').slice(0, 80) });
    process.exitCode = 1;
});
module.exports = { ...app_module, start };
