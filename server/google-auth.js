const { auth_cookie, session } = require('./auth-cookies');
const COOKIE = 'dreams_google_pkce';
const allowed_next = value => ['/checkout.html', '/admin', '/cuenta.html'].includes(value) ? value : '/cuenta.html';

function google_routes(app, { create_oauth_client, provider_enabled, app_base_url, production, profile_for, logger }) {
    const clear = response => response.append('Set-Cookie', auth_cookie(COOKIE, '', 0, production));
    app.post('/api/auth/google', async (request, response, next) => {
        try {
            if (!create_oauth_client || !app_base_url || !await provider_enabled()) return response.status(503).json({ error: 'El acceso Google todavía requiere configuración del proveedor. Intentá nuevamente cuando esté habilitado.' });
            const values = {};
            const storage = { getItem: key => values[key] ?? null, setItem: (key, value) => { values[key] = value; }, removeItem: key => { delete values[key]; } };
            const auth = create_oauth_client(storage);
            const result = await auth.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${app_base_url}/api/auth/google/callback`, skipBrowserRedirect: true } });
            if (result.error || !result.data?.url || !Object.keys(values).length) throw new Error('OAuth unavailable');
            response.append('Set-Cookie', auth_cookie(COOKIE, JSON.stringify({ values, next: allowed_next(request.body.next) }), 600, production));
            response.json({ url: result.data.url });
        } catch (error) { next(error); }
    });
    app.get('/api/auth/google/callback', async (request, response) => {
        clear(response);
        try {
            const raw = String(request.headers.cookie || '').split(';').find(part => part.trim().startsWith(`${COOKIE}=`));
            if (request.query.error || !raw || !request.query.code || typeof request.query.code !== 'string') throw new Error('OAuth cancelled');
            const saved = JSON.parse(decodeURIComponent(raw.trim().slice(COOKIE.length + 1)));
            if (!saved.values || typeof saved.values !== 'object') throw new Error('Missing PKCE');
            const storage = { getItem: key => saved.values[key] ?? null, setItem() {}, removeItem() {} };
            const result = await create_oauth_client(storage).auth.exchangeCodeForSession(request.query.code);
            if (result.error || !result.data?.session || !result.data?.user) throw new Error('Invalid OAuth exchange');
            const profile = await profile_for(result.data.user);
            session(response, result.data.session, production, true);
            const target = allowed_next(saved.next);
            response.redirect(303, profile?.role === 'admin' && target === '/cuenta.html' ? '/admin' : target);
        } catch (error) {
            logger.warn?.('No se pudo completar Google.', { kind: 'oauth_callback_failed' });
            response.redirect(303, '/cuenta.html?auth_error=1');
        }
    });
}
module.exports = { google_routes, allowed_next };
