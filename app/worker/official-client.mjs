// crea el cliente supabase con variables del entorno; la clave permanece fuera del navegador.
import { createClient } from '@supabase/supabase-js';

export const official_project_url = 'https://nwsmbemwtexmrtpkgxrz.supabase.co';
function crear_cliente_de_datos_oficial(env, access, fetcher) {
    return createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
        global: {
            ...(fetcher ? { fetch: fetcher } : {}),
            ...(access ? { headers: { Authorization: `Bearer ${access}` } } : {})
        }
    });
}
export { crear_cliente_de_datos_oficial as create_official_database };
