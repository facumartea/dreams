import { prepare_browser_qa } from '../private-browser-qa.mjs';
import { fetch_official } from '../official.mjs';
const id = 'a88d8d4e-ada3-4bfa-a6f5-db39d2dc9c19';
const user = { id, email: 'qa-fixture@example.com', user_metadata: { name: 'QA' } };
let auth_calls = 0;
globalThis.fetch = async (input) => {
    const url = new URL(typeof input === 'string' ? input : input.url);
    if (url.hostname !== 'nwsmbemwtexmrtpkgxrz.supabase.co') throw new Error('Unexpected fixture host');
    if (url.pathname === '/auth/v1/token') {
        auth_calls++;
        return Response.json({ user, access_token: 'fixture-access', refresh_token: 'fixture-refresh', expires_in: 3600, token_type: 'bearer' });
    }
    if (url.pathname === '/rest/v1/profiles') return Response.json({ role: 'admin', name: 'QA' });
    throw new Error('Unexpected fixture path');
};
export default {
    async fetch(_request, env) {
        let stored;
        const configured = { ...env, QA_RUN_ID: 'pr56-local-browser-grant', QA_EXPIRES_AT: String(Date.now() + 600000),
            QA_BROWSER_VAULT: { get: async () => null, put: async (_key, value) => { stored = value; } } };
        try {
            const ready = await prepare_browser_qa(configured, {
                create_database: () => ({ auth: { admin: { getUserById: async () => ({ data: { user } }) } } }),
                fetch: (url, init) => fetch_official(new Request(url, init), env)
            });
            return Response.json({ ready, encrypted: Boolean(JSON.parse(stored).ciphertext), auth_calls });
        } catch (error) { return Response.json({ ready: false, stage: error.message, auth_calls }); }
    }
};
