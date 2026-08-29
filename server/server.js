require('dotenv').config({ quiet: true });
const { createClient } = require('@supabase/supabase-js');
global.WebSocket = require('ws');
const { seed_database } = require('./seed');
const app_module = require('./app');

const needed = ['SUPABASE_URL', 'SUPABASE_SECRET_KEY'].filter(key => !process.env[key]);
if (needed.length) throw new Error(`Faltan variables obligatorias: ${needed.join(', ')}`);

const client_options = { auth: { autoRefreshToken: false, persistSession: false } };
const create_database = () => createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, client_options);
const database = create_database();
const port = Number(process.env.PORT || 8080);
const app = app_module.create_app({
    database,
    create_auth_client: create_database,
    production: process.env.NODE_ENV === 'production',
    contact_email: process.env.CONTACT_EMAIL,
    whatsapp_number: process.env.WHATSAPP_NUMBER,
    allowed_origins: process.env.APP_ORIGINS
});

function start() {
    return app.listen(port, '0.0.0.0', () => {
        console.log(`DREAMS funcionando en el puerto ${port} con Supabase.`);
        seed_database(database)
            .then(() => console.log('Catálogo y administrador sincronizados con Supabase.'))
            .catch(error => console.error('No se pudo sincronizar el catálogo inicial:', error));
    });
}

if (require.main === module) start();
module.exports = { ...app_module, app, start };
