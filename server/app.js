const path = require('node:path');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const { rateLimit } = require('express-rate-limit');

const GENERIC_ERROR = 'No se pudo completar la operación.';
const error_kind = error => String(error?.code || error?.name || 'unknown').slice(0, 80);
const normalize_email = value => String(value || '').trim().toLowerCase();
const valid_email = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

async function execute_database_query(query_factory, wait = delay) {
    let result = await query_factory();
    if (result?.error?.code === 'PGRST303') {
        await wait(1200);
        result = await query_factory();
    }
    return result;
}

function parse_cookie_header(header = '') {
    return Object.fromEntries(header.split(';').filter(Boolean).map(part => {
        const separator = part.indexOf('=');
        if (separator < 0) return ['', ''];
        return [decodeURIComponent(part.slice(0, separator).trim()), decodeURIComponent(part.slice(separator + 1))];
    }).filter(([name]) => name));
}

function auth_cookie(name, value, max_age, production = process.env.NODE_ENV === 'production') {
    return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${max_age}${production ? '; Secure' : ''}`;
}

function session(response, current_session, production = process.env.NODE_ENV === 'production') {
    const configured_age = Number(current_session.expires_in);
    const access_age = Number.isSafeInteger(configured_age) && configured_age > 0 ? configured_age : 3600;
    response.setHeader('Set-Cookie', [
        auth_cookie('dreams_access_token', current_session.access_token, access_age, production),
        auth_cookie('dreams_refresh_token', current_session.refresh_token, 2592000, production)
    ]);
}

function clear_session(response, production) {
    const suffix = `; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${production ? '; Secure' : ''}`;
    response.setHeader('Set-Cookie', [`dreams_access_token=${suffix}`, `dreams_refresh_token=${suffix}`]);
}

const parse_id = value => {
    const id = Number(value);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
};

const product = row => ({
    ...row,
    featured: Boolean(row.featured),
    stock: Number(row.stock || 0),
    notes: {
        salida: String(row.top_notes).split(',').map(value => value.trim()),
        corazon: String(row.heart_notes).split(',').map(value => value.trim()),
        fondo: String(row.base_notes).split(',').map(value => value.trim())
    }
});

function validate(value) {
    const fields = ['brand', 'name', 'gender', 'category', 'size_ml', 'price', 'stock', 'intensity', 'family', 'top_notes', 'heart_notes', 'base_notes', 'description', 'image_url'];
    if (!value || typeof value !== 'object' || fields.some(key => value[key] === undefined || String(value[key]).trim() === '')) return 'Completá todos los campos del producto.';
    if (!['hombre', 'mujer', 'unisex'].includes(value.gender)) return 'Género inválido.';
    if (!['diseñador', 'nicho'].includes(value.category)) return 'Categoría inválida.';
    const size = Number(value.size_ml), price = Number(value.price), stock = Number(value.stock), intensity = Number(value.intensity);
    if (!Number.isSafeInteger(size) || size <= 0 || !Number.isFinite(price) || price < 0 || !Number.isSafeInteger(stock) || stock < 0 || !Number.isSafeInteger(intensity) || intensity < 1 || intensity > 5) return 'Precio, stock, tamaño e intensidad deben ser válidos.';
    const limits = { brand: 120, name: 160, family: 200, top_notes: 500, heart_notes: 500, base_notes: 500, description: 2000, image_url: 2000 };
    if (Object.entries(limits).some(([key, limit]) => String(value[key]).trim().length > limit)) return 'Uno o más campos superan la longitud permitida.';
    const image = String(value.image_url).trim();
    if (!image.startsWith('/') && !/^https:\/\//i.test(image)) return 'La imagen debe usar una ruta local o una URL HTTPS.';
}

function payload(value) {
    const validation_error = validate(value);
    if (validation_error) return { e: validation_error };
    const output = {};
    for (const key of ['brand', 'name', 'gender', 'category', 'family', 'top_notes', 'heart_notes', 'base_notes', 'description', 'image_url']) output[key] = String(value[key]).trim();
    for (const key of ['size_ml', 'price', 'stock', 'intensity']) output[key] = Number(value[key]);
    output.featured = Boolean(value.featured);
    return { o: output };
}

function normalize_cart_items(items) {
    if (!Array.isArray(items) || items.length === 0 || items.length > 30) return { error: 'El carrito debe contener entre 1 y 30 productos.' };
    const quantities = new Map();
    for (const item of items) {
        const id = parse_id(item?.id), quantity = Number(item?.quantity);
        if (!id || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 99) return { error: 'El carrito contiene un producto o una cantidad inválida.' };
        quantities.set(id, Math.min(99, (quantities.get(id) || 0) + quantity));
    }
    return { quantities };
}

async function quote_cart(database, items) {
    const normalized = normalize_cart_items(items);
    if (normalized.error) return normalized;
    const ids = [...normalized.quantities.keys()];
    const result = await database.from('products').select('id,brand,name,price,stock,image_url,size_ml').in('id', ids);
    if (result.error) throw result.error;
    const products = new Map(result.data.map(item => [Number(item.id), item])), warnings = [], quoted = [];
    for (const [id, requested] of normalized.quantities) {
        const item = products.get(id);
        if (!item) { warnings.push(`El producto ${id} ya no está disponible.`); continue; }
        const stock = Math.max(0, Number(item.stock) || 0);
        if (stock === 0) { warnings.push(`${item.brand} ${item.name} está agotado.`); continue; }
        const quantity = Math.min(requested, stock);
        if (quantity < requested) warnings.push(`La cantidad de ${item.brand} ${item.name} se ajustó al stock disponible (${stock}).`);
        quoted.push({ ...item, id, price: Number(item.price), stock, quantity });
    }
    return { items: quoted, total: quoted.reduce((sum, item) => sum + item.price * item.quantity, 0), warnings };
}

async function database_health(database) {
    const result = await execute_database_query(() => database.from('products').select('id', { count: 'exact', head: true }));
    if (result.error) throw result.error;
    return true;
}

function create_app(options = {}) {
    const database = options.database;
    if (!database) throw new TypeError('create_app requiere una base de datos.');
    const production = options.production ?? process.env.NODE_ENV === 'production';
    const logger = options.logger || console;
    const create_auth_client = options.create_auth_client || (() => database);
    const admin_email = String(options.admin_email || 'admin@dreamsperfumes.com').toLowerCase();
    const whatsapp_number = String(options.whatsapp_number || '').replace(/\D/g, '');
    const public_directory = options.public_directory || path.join(__dirname, '..', 'public');
    const views_directory = options.views_directory || path.join(__dirname, '..', 'views');
    const app = express();
    const async_route = handler => (request, response, next) => Promise.resolve(handler(request, response, next)).catch(next);
    const content_security_policy = { directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'"], styleSrc: ["'self'", 'https://fonts.googleapis.com'], fontSrc: ["'self'", 'https://fonts.gstatic.com'], imgSrc: ["'self'", 'data:', 'https://images.unsplash.com'], connectSrc: ["'self'"], objectSrc: ["'none'"], baseUri: ["'self'"], formAction: ["'self'"], frameAncestors: ["'none'"], upgradeInsecureRequests: production ? [] : null } };

    app.set('trust proxy', 1);
    app.use(helmet({ contentSecurityPolicy: content_security_policy, crossOriginEmbedderPolicy: false }));
    if (!options.disable_request_log) app.use(morgan(production ? 'combined' : 'dev'));
    app.use(express.json({ limit: '1mb' }), express.urlencoded({ extended: true, limit: '1mb' }));
    app.use('/api/auth', (request, response, next) => {
        response.setHeader('Cache-Control', 'no-store');
        next();
    });
    app.use('/api/auth', rateLimit({ windowMs: 900000, limit: 20, standardHeaders: true, legacyHeaders: false, message: { error: 'Demasiados intentos. Probá nuevamente en unos minutos.' } }));
    app.use('/api/inquiries', rateLimit({ windowMs: 900000, limit: 10, standardHeaders: true, legacyHeaders: false, message: { error: 'Demasiadas consultas. Probá nuevamente en unos minutos.' } }));
    app.use('/api/cart', rateLimit({ windowMs: 900000, limit: 30, standardHeaders: true, legacyHeaders: false, message: { error: 'Demasiadas verificaciones del carrito. Probá nuevamente en unos minutos.' } }));
    app.use(express.static(public_directory));

    async function profile_for(user) {
        let result = await database.from('profiles').select('name,role').eq('id', user.id).maybeSingle();
        if (result.error) throw result.error;
        if (result.data) return result.data;
        const name = String(user.user_metadata?.name || user.email || 'Cliente').trim().slice(0, 80) || 'Cliente';
        const created = await database.from('profiles').upsert({ id: user.id, name, role: 'customer' }, { onConflict: 'id', ignoreDuplicates: true });
        if (created.error) throw created.error;
        result = await database.from('profiles').select('name,role').eq('id', user.id).maybeSingle();
        if (result.error) throw result.error;
        return result.data;
    }

    app.use(async_route(async (request, response, next) => {
        try {
            const cookies = parse_cookie_header(request.headers.cookie);
            let token = cookies.dreams_access_token, user = null;
            if (token) {
                const result = await database.auth.getUser(token);
                user = result.data.user;
            }
            if (!user && cookies.dreams_refresh_token) {
                const auth = create_auth_client();
                const refreshed = await auth.auth.refreshSession({ refresh_token: cookies.dreams_refresh_token });
                if (refreshed.data.session) {
                    session(response, refreshed.data.session, production);
                    token = refreshed.data.session.access_token;
                    user = refreshed.data.user;
                } else if (refreshed.error) {
                    clear_session(response, production);
                }
            }
            if (!user) return next();
            const profile = await profile_for(user);
            request.access_token = token;
            request.user = { id: user.id, name: profile?.name || user.email, email: user.email, is_admin: profile?.role === 'admin' };
            next();
        } catch (error) {
            logger.warn?.('No se pudo restaurar la sesión.', { kind: error_kind(error) });
            next();
        }
    }));

    const login = (request, response, next) => request.user ? next() : response.status(401).json({ error: 'Necesitás iniciar sesión.' });
    const admin = (request, response, next) => request.user?.is_admin ? next() : response.status(403).json({ error: 'Acceso reservado al administrador.' });
    const route = (method, url, ...handlers) => app[method](url, ...handlers.map(handler => handler === login || handler === admin ? handler : async_route(handler)));
    const fail_if = result => { if (result.error) throw result.error; return result.data; };

    route('get', '/api/config', async (request, response) => response.json({ whatsapp_number, admin_email, app_name: 'DREAMS' }));
    route('get', '/api/products', async (request, response) => {
        const search = String(request.query.search || '').trim().replace(/[^\p{L}\p{N}\s'-]/gu, '').slice(0, 80);
        const sort = String(request.query.sort || 'featured');
        const result = await execute_database_query(() => {
            let query = database.from('products').select('*');
            for (const key of ['brand', 'gender', 'category']) if (request.query[key]) query = query.eq(key, String(request.query[key]).slice(0, 60));
            if (+request.query.max_price > 0) query = query.lte('price', +request.query.max_price);
            if (search) query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%,family.ilike.%${search}%`);
            return sort === 'price_asc' ? query.order('price') : sort === 'price_desc' ? query.order('price', { ascending: false }) : sort === 'name' ? query.order('name') : query.order('featured', { ascending: false }).order('id', { ascending: false });
        });
        response.json(fail_if(result).map(product));
    });
    route('get', '/api/products/:id', async (request, response) => {
        const id = parse_id(request.params.id);
        if (!id) return response.status(400).json({ error: 'ID de producto inválido.' });
        const data = fail_if(await execute_database_query(() => database.from('products').select('*').eq('id', id).maybeSingle()));
        return data ? response.json(product(data)) : response.status(404).json({ error: 'Perfume no encontrado.' });
    });
    route('get', '/api/brands', async (request, response) => response.json([...new Set(fail_if(await execute_database_query(() => database.from('products').select('brand').order('brand'))).map(item => item.brand))]));
    route('post', '/api/auth/register', async (request, response) => {
        const name = String(request.body.name || '').trim().slice(0, 80), email = normalize_email(request.body.email), password = String(request.body.password || '');
        if (!name || !valid_email(email) || password.length < 8 || password.length > 128) return response.status(400).json({ error: 'Completá un nombre, correo válido y una contraseña de 8 a 128 caracteres.' });
        const result = await database.auth.signUp({ email, password, options: { data: { name } } });
        if (result.error) return response.status(400).json({ error: 'No se pudo crear la cuenta con esos datos.' });
        if (result.data.user) fail_if(await database.from('profiles').upsert({ id: result.data.user.id, name, role: 'customer' }, { onConflict: 'id', ignoreDuplicates: true }));
        if (result.data.session) {
            session(response, result.data.session, production);
            return response.json({ message: 'Cuenta creada correctamente.', authenticated: true, user: { id: result.data.user.id, name, email, is_admin: false } });
        }
        response.status(202).json({ message: 'Te enviamos un correo de confirmación. Abrilo antes de iniciar sesión.', authenticated: false, requires_email_confirmation: true });
    });
    route('post', '/api/auth/login', async (request, response) => {
        const email = normalize_email(request.body.email), password = String(request.body.password || '');
        if (!valid_email(email) || !password || password.length > 128) return response.status(400).json({ error: 'Ingresá un correo válido y tu contraseña.' });
        const result = await database.auth.signInWithPassword({ email, password });
        if (result.error || !result.data.session || !result.data.user) {
            const confirmation_required = result.error?.code === 'email_not_confirmed';
            return response.status(401).json({ error: confirmation_required ? 'Primero confirmá tu cuenta desde el correo que te enviamos.' : 'Correo o contraseña incorrectos.' });
        }
        const profile = await profile_for(result.data.user);
        session(response, result.data.session, production);
        const user = { id: result.data.user.id, name: profile?.name || email, email, is_admin: profile?.role === 'admin' };
        response.json({ message: 'Sesión iniciada.', authenticated: true, redirect: user.is_admin ? '/admin' : '/cuenta.html', user });
    });
    route('post', '/api/auth/logout', async (request, response) => {
        if (request.access_token) {
            const result = await database.auth.admin.signOut(request.access_token, 'local');
            if (result.error) logger.warn?.('No se pudo revocar la sesión remota.', { kind: error_kind(result.error) });
        }
        clear_session(response, production);
        response.json({ message: 'Sesión cerrada.' });
    });
    route('get', '/api/auth/me', async (request, response) => response.json({ user: request.user || null }));
    route('get', '/api/reviews', async (request, response) => response.json(fail_if(await execute_database_query(() => database.from('reviews').select('id,user_name,rating,comment,created_at').order('id', { ascending: false })))));
    route('post', '/api/reviews', login, async (request, response) => {
        const rating = +request.body.rating, comment = String(request.body.comment || '').trim().slice(0, 1000);
        if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !comment) return response.status(400).json({ error: 'Completá una puntuación y una opinión.' });
        fail_if(await database.from('reviews').insert({ user_id: request.user.id, user_name: request.user.name, rating, comment }));
        response.json({ message: 'Opinión publicada.' });
    });
    route('post', '/api/cart/quote', async (request, response) => {
        const quote = await quote_cart(database, request.body.items);
        if (quote.error) return response.status(400).json({ error: quote.error });
        const lines = quote.items.map(item => `${item.quantity} × ${item.brand} ${item.name} — ${item.price * item.quantity} ARS`);
        const text = ['Hola DREAMS, quiero consultar por este carrito:', ...lines, `Total de referencia: ${quote.total} ARS`].join('\n');
        response.json({ ...quote, whatsapp_url: quote.items.length ? `https://wa.me/${whatsapp_number}?text=${encodeURIComponent(text)}` : null });
    });
    route('post', '/api/inquiries', async (request, response) => {
        const id = parse_id(request.body.product_id);
        if (!id) return response.status(400).json({ error: 'ID de producto inválido.' });
        const found = fail_if(await database.from('products').select('id,name').eq('id', id).maybeSingle());
        if (!found) return response.status(404).json({ error: 'Producto no encontrado.' });
        fail_if(await database.from('inquiries').insert({ user_id: request.user?.id || null, product_id: found.id, product_name: found.name, user_name: request.user?.name || null, user_email: request.user?.email || null }));
        response.json({ message: 'Consulta registrada.', whatsapp_url: `https://wa.me/${whatsapp_number}?text=${encodeURIComponent(`Hola DREAMS, quiero consultar por ${found.name}. ¿Está disponible?`)}` });
    });
    route('get', '/api/admin/stats', admin, async (request, response) => {
        const tables = ['products', 'profiles', 'inquiries', 'reviews'];
        const counts = await Promise.all(tables.map(async table => { const result = await database.from(table).select('*', { count: 'exact', head: true }); if (result.error) throw result.error; return result.count || 0; }));
        const low = await database.from('products').select('*', { count: 'exact', head: true }).lte('stock', 2);
        if (low.error) throw low.error;
        response.json({ products: counts[0], users: counts[1], inquiries: counts[2], reviews: counts[3], low_stock: low.count || 0 });
    });
    route('get', '/api/admin/products', admin, async (request, response) => response.json(fail_if(await database.from('products').select('*').order('id', { ascending: false })).map(product)));
    route('post', '/api/admin/products', admin, async (request, response) => {
        const parsed = payload(request.body);
        if (parsed.e) return response.status(400).json({ error: parsed.e });
        response.status(201).json(product(fail_if(await database.from('products').insert(parsed.o).select().single())));
    });
    route('put', '/api/admin/products/:id', admin, async (request, response) => {
        const id = parse_id(request.params.id);
        if (!id) return response.status(400).json({ error: 'ID de producto inválido.' });
        const parsed = payload(request.body);
        if (parsed.e) return response.status(400).json({ error: parsed.e });
        const data = fail_if(await database.from('products').update(parsed.o).eq('id', id).select().maybeSingle());
        return data ? response.json(product(data)) : response.status(404).json({ error: 'Producto no encontrado.' });
    });
    route('delete', '/api/admin/products/:id', admin, async (request, response) => {
        const id = parse_id(request.params.id);
        if (!id) return response.status(400).json({ error: 'ID de producto inválido.' });
        const data = fail_if(await database.from('products').delete().eq('id', id).select('id').maybeSingle());
        return data ? response.json({ message: 'Producto eliminado.' }) : response.status(404).json({ error: 'Producto no encontrado.' });
    });
    route('get', '/api/admin/users', admin, async (request, response) => response.json(fail_if(await database.from('profiles').select('id,name,role,created_at').order('created_at', { ascending: false })).map(value => ({ ...value, email: null, is_admin: value.role === 'admin' }))));
    route('get', '/api/admin/inquiries', admin, async (request, response) => response.json(fail_if(await database.from('inquiries').select('*,products(brand,name)').order('id', { ascending: false }).limit(100)).map(value => ({ ...value, brand: value.products?.brand || null, name: value.products?.name || value.product_name }))));
    route('get', '/api/admin/reviews', admin, async (request, response) => response.json(fail_if(await database.from('reviews').select('*').order('id', { ascending: false }))));
    route('get', ['/admin', '/admin.html'], admin, async (request, response) => response.sendFile(path.join(views_directory, 'admin.html')));
    route('get', ['/favoritos', '/favoritos.html'], async (request, response) => response.redirect(301, '/catalogo.html'));
    route('get', '/api/health', async (request, response) => {
        try {
            await database_health(database);
            response.json({ status: 'ok', api: true, database: 'ok' });
        } catch (error) {
            logger.error?.('Healthcheck de Supabase falló.', { kind: error_kind(error) });
            response.status(503).json({ status: 'unavailable', api: true, database: 'unavailable' });
        }
    });

    app.use((request, response) => request.path.startsWith('/api/') ? response.status(404).json({ error: 'Ruta API no encontrada.' }) : response.sendFile(path.join(public_directory, 'index.html')));
    app.use((error, request, response, next) => {
        if (response.headersSent) return next(error);
        logger.error?.('Error inesperado de API.', { method: request.method, path: request.path, kind: error_kind(error) });
        response.status(500).json({ error: GENERIC_ERROR });
    });
    return app;
}

module.exports = { create_app, validate, payload, database_health, auth_cookie, session, parse_id, normalize_cart_items, quote_cart, execute_database_query, GENERIC_ERROR };
