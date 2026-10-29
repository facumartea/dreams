import { fetch_official } from '../official.mjs';
let auth_calls = 0, profile_writes = 0;
const native_fetch = globalThis.fetch;
const user = { id: 'a1111111-1111-4111-8111-111111111111', email: 'qa@example.com', user_metadata: { name: 'QA' } };

globalThis.fetch = async (input, init) => {
    const url = new URL(typeof input === 'string' ? input : input.url);
    if (url.hostname !== 'nwsmbemwtexmrtpkgxrz.supabase.co') return native_fetch(input, init);
    if (url.pathname === '/auth/v1/signup') {
        auth_calls++;
        return Response.json({ user, access_token: 'fixture-access', refresh_token: 'fixture-refresh', expires_in: 3600, token_type: 'bearer' });
    }
    if (url.pathname === '/rest/v1/profiles' && init?.method === 'POST') {
        profile_writes++;
        return new Response(null, { status: 201 });
    }
    throw new Error('Unexpected fixture route');
};

export default {
    async fetch(request, env) {
        auth_calls = 0; profile_writes = 0;
        const body = JSON.stringify({ name: 'QA', email: 'qa@example.com', password: 'fixture-Aa12345!' });
        const headers = new Headers({ Origin: 'https://dreams-perfumes.pages.dev', 'Content-Type': 'application/json', 'cf-connecting-ip': '192.0.2.90' });
        if (new URL(request.url).searchParams.has('length')) headers.set('Content-Length', String(new TextEncoder().encode(body).length));
        const response = await fetch_official(new Request('https://dreams-perfumes.pages.dev/api/auth/register', { method: 'POST', headers, body }), env);
        const data = await response.json();
        return Response.json({ status: response.status, auth_calls, profile_writes, authenticated: data.authenticated === true,
            input_rejected: data.error?.startsWith('Completá un nombre') === true, cookie_count: response.headers.getSetCookie().length });
    }
};
