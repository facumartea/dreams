import { createClient } from '@supabase/supabase-js';

export const official_project_url = 'https://nwsmbemwtexmrtpkgxrz.supabase.co';
export function create_official_database(env, access, fetcher) {
    return createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
        global: {
            ...(fetcher ? { fetch: fetcher } : {}),
            ...(access ? { headers: { Authorization: `Bearer ${access}` } } : {})
        }
    });
}
