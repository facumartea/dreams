// maneja el acceso google con pkce y destinos permitidos; no convierte correos en administradores.
const { auth_cookie: crear_cookie_de_autenticacion, session: guardar_cookies_de_sesion } = require('./auth-cookies');
const COOKIE = 'dreams_google_pkce';
const es_destino_permitido = value => ['/checkout.html', '/admin', '/cuenta.html'].includes(value) ? value : '/cuenta.html';

function preparar_rutas_de_google(app, { create_oauth_client, provider_enabled, app_base_url, production, profile_for, logger }) {
    const limpiar = respuesta => respuesta.append('Set-Cookie', crear_cookie_de_autenticacion(COOKIE, '', 0, production));
    app.post('/api/auth/google', async (solicitud, respuesta, siguiente) => {
        try {
            if (!create_oauth_client || !app_base_url || !await provider_enabled()) return respuesta.status(503).json({ error: 'El acceso Google todavía requiere configuración del proveedor. Intentá nuevamente cuando esté habilitado.' });
            const values = {};
            const storage = { getItem: key => values[key] ?? null, setItem: (key, value) => { values[key] = value; }, removeItem: key => { delete values[key]; } };
            const auth = create_oauth_client(storage);
            const result = await auth.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${app_base_url}/api/auth/google/callback`, skipBrowserRedirect: true } });
            if (result.error || !result.data?.url || !Object.keys(values).length) throw new Error('OAuth unavailable');
            respuesta.append('Set-Cookie', crear_cookie_de_autenticacion(COOKIE, JSON.stringify({ values, next: es_destino_permitido(solicitud.body.next) }), 600, production));
            respuesta.json({ url: result.data.url });
        } catch (error) { siguiente(error); }
    });
    app.get('/api/auth/google/callback', async (solicitud, respuesta) => {
        limpiar(respuesta);
        try {
            const raw = String(solicitud.headers.cookie || '').split(';').find(part => part.trim().startsWith(`${COOKIE}=`));
            if (solicitud.query.error || !raw || !solicitud.query.code || typeof solicitud.query.code !== 'string') throw new Error('OAuth cancelled');
            const saved = JSON.parse(decodeURIComponent(raw.trim().slice(COOKIE.length + 1)));
            if (!saved.values || typeof saved.values !== 'object') throw new Error('Missing PKCE');
            const storage = { getItem: key => saved.values[key] ?? null, setItem() {}, removeItem() {} };
            const result = await create_oauth_client(storage).auth.exchangeCodeForSession(solicitud.query.code);
            if (result.error || !result.data?.session || !result.data?.user) throw new Error('Invalid OAuth exchange');
            const profile = await profile_for(result.data.user);
            guardar_cookies_de_sesion(respuesta, result.data.session, production, true);
            const target = es_destino_permitido(saved.next);
            respuesta.redirect(303, profile?.role === 'admin' && target === '/cuenta.html' ? '/admin' : target);
        } catch (error) {
            logger.warn?.('No se pudo completar Google.', { kind: 'oauth_callback_failed' });
            respuesta.redirect(303, '/cuenta.html?auth_error=1');
        }
    });
}
module.exports = { google_routes: preparar_rutas_de_google, allowed_next: es_destino_permitido };
