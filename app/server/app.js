// arma las rutas express y comprueba entradas, origen, sesion y rol antes de operar.
const { official_enabled: esta_habilitada_la_funcion_oficial } = require('./official-policy');
const { install_account_cart: registrar_cuenta_carrito } = require('./account-cart');
const { install_reviews: registrar_opiniones } = require('./reviews');
const path = require('node:path');
const { auth_limiters: crear_limites_de_autenticacion } = require('./auth-limits');
const { customer_registration: preparar_registro_del_cliente } = require('./customer-registration');
const { preview_write_guard: bloquear_escrituras_de_prueba } = require('./preview-write-guard');
const { auth_cookie: crear_cookie_de_autenticacion, session: guardar_cookies_de_sesion } = require('./auth-cookies');
const { google_routes: preparar_rutas_de_google } = require('./google-auth');
const { presentation_checkout: preparar_compra_academica, academic_summary: resumir_compra_academica } = require('./presentation-checkout');
const contacts = require('./contacts');
const { randomUUID } = require('node:crypto');
const { normalize_product_brand: normalizar_marca_del_perfume, product_write_payload: preparar_datos_para_guardar_perfume, brand_column: obtener_columna_de_marca } = require('./product-schema');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const { rateLimit } = require('express-rate-limit');

const GENERIC_ERROR = 'No se pudo completar la operación.';
const obtener_tipo_de_error = error => String(error?.code || error?.name || 'unknown').slice(0, 80);
const normalizar_correo = value => String(value || '').trim().toLowerCase();
const es_correo_valido = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
const esperar = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const unsafe_methods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const es_error_temporal_de_autenticacion = error => error && (error.status >= 500 || error.name === 'AuthRetryableFetchError');

const IMAGE_URL_ERROR = 'La URL ingresada no apunta a una imagen válida o el servidor no permite mostrarla. Usá una URL HTTPS directa.';

function validar_url_de_imagen(value) { return require('../public/js/admin-image-url').es_url_de_imagen_admitida(value) ? null : IMAGE_URL_ERROR; }

function normalizar_origen(value) {
    try {
        const parsed = new URL(String(value || '').trim());
        if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) return null;
        return parsed.origin;
    } catch (error) {
        return null;
    }
}

function leer_origenes_permitidos(value) {
    const entries = Array.isArray(value) ? value : String(value || '').split(',');
    return new Set(entries.map(normalizar_origen).filter(Boolean));
}

// rechaza escrituras de otros origenes incluso cuando el navegador conserva cookies de sesion.
function proteger_origen_de_las_escrituras(configured_origins) {
    const configured = leer_origenes_permitidos(configured_origins);
    return (solicitud, respuesta, siguiente) => {
        if (!unsafe_methods.has(solicitud.method)) return siguiente();

        const origin_header = solicitud.get('origin');
        const referer_header = solicitud.get('referer');
        const fetch_site = String(solicitud.get('sec-fetch-site') || '').toLowerCase();
        if (!origin_header && !referer_header) {
            const has_session_cookie = /(?:^|;\s*)dreams_(?:access|refresh)_token=/.test(String(solicitud.headers.cookie || ''));
            return fetch_site === 'cross-site' || has_session_cookie
                ? respuesta.status(403).json({ error: 'Origen de solicitud no permitido.' })
                : siguiente();
        }

        const supplied_origin = normalizar_origen(origin_header || referer_header);
        const request_origin = normalizar_origen(`${solicitud.protocol}://${solicitud.get('host') || ''}`);
        const trusted = configured.size ? configured : new Set([request_origin].filter(Boolean));
        return supplied_origin && trusted.has(supplied_origin)
            ? siguiente()
            : respuesta.status(403).json({ error: 'Origen de solicitud no permitido.' });
    };
}

async function consultar_base_de_datos(query_factory, wait = esperar) {
    let result = await query_factory();
    if (result?.error?.code === 'PGRST303') {
        await wait(1200);
        result = await query_factory();
    }
    return result;
}

function leer_cookies_de_la_solicitud(header = '') {
    return Object.fromEntries(header.split(';').filter(Boolean).map(part => {
        const separator = part.indexOf('=');
        if (separator < 0) return ['', ''];
        return [decodeURIComponent(part.slice(0, separator).trim()), decodeURIComponent(part.slice(separator + 1))];
    }).filter(([name]) => name));
}

function borrar_cookies_de_sesion(respuesta, production) {
    const suffix = `; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${production ? '; Secure' : ''}`;
    respuesta.setHeader('Set-Cookie', [`dreams_access_token=${suffix}`, `dreams_refresh_token=${suffix}`]);
}

const interpretar_id = value => {
    const id = Number(value);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
};

const normalizar_codigo_del_cupon = value => String(value || '').trim().toUpperCase();

function crear_referencia_del_pedido(order) {
    const id = String(order?.id || '').replace(/-/g, '').toUpperCase();
    const year = new Date(order?.created_at || Date.now()).getUTCFullYear();
    return `DRM-${Number.isSafeInteger(year) ? year : new Date().getUTCFullYear()}-${id.slice(0, 12)}`;
}

function preparar_datos_del_cupon(value) {
    const code = normalizar_codigo_del_cupon(value?.code);
    const discount_percent = Number(value?.discount_percent);
    if (!/^[A-Z0-9_-]{3,40}$/.test(code)) return { error: 'El código debe tener entre 3 y 40 caracteres: letras, números, guion o guion bajo.' };
    if (!Number.isFinite(discount_percent) || discount_percent <= 0 || discount_percent > 100) return { error: 'El porcentaje debe ser mayor que 0 y menor o igual a 100.' };
    return { data: { code, discount_percent, active: value?.active !== false } };
}

function preparar_datos_de_opinion(value) {
    const rating = Number(value?.rating);
    const comment = String(value?.comment || '').trim();
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { error: 'La puntuación debe estar entre 1 y 5.' };
    if (!comment || comment.length > 1000) return { error: 'La opinión debe tener entre 1 y 1000 caracteres.' };
    return { data: { rating, comment } };
}

function calcular_totales_con_descuento(subtotal, discount_percent = 0) {
    const safe_subtotal = Math.max(0, Number(subtotal) || 0);
    const safe_percent = Math.min(100, Math.max(0, Number(discount_percent) || 0));
    const discount = Math.round((safe_subtotal * safe_percent / 100) * 100) / 100;
    return { subtotal: safe_subtotal, discount, total: Math.max(0, Math.round((safe_subtotal - discount) * 100) / 100) };
}

async function validar_condiciones_del_cupon(database, coupon, user_id) {
    // no interpretar condiciones arbitrarias ni omitir limites ya configurados.
    if (coupon.conditions && Object.keys(coupon.conditions).length) return 'Este cupón tiene condiciones especiales y no puede aplicarse en este checkout.';
    if (coupon.per_user_limit && !user_id) return 'Iniciá sesión para validar el límite por cuenta de este cupón.';
    if (!coupon.max_uses && !coupon.per_user_limit) return null;
    const used = await database.from('orders').select('id,user_id').eq('coupon_id', coupon.id).eq('status', 'approved');
    if (used.error) throw used.error;
    if (coupon.max_uses && used.data.length >= coupon.max_uses) return 'Este cupón alcanzó su límite de usos.';
    if (coupon.per_user_limit && used.data.filter(row => row.user_id === user_id).length >= coupon.per_user_limit) return 'Alcanzaste el límite de usos de este cupón.';
    return null;
}

// revisa las reglas disponibles y calcula el descuento en servidor, sin consumir usos.
async function resolver_cupon(database, code, subtotal, user_id = null) {
    const normalized = normalizar_codigo_del_cupon(code);
    if (!normalized) return { ...calcular_totales_con_descuento(subtotal), coupon: null, coupon_error: null };
    if (!/^[A-Z0-9_-]{3,40}$/.test(normalized)) return { ...calcular_totales_con_descuento(subtotal), coupon: null, coupon_error: 'Cupón inválido.' };
    const result = await database.from('coupons').select('id,code,discount_percent,active,expires_at,minimum_purchase,max_uses,per_user_limit,conditions').eq('code', normalized).eq('active', true).maybeSingle();
    if (result.error) throw result.error;
    const coupon = result.data;
    const expired = coupon?.expires_at && new Date(coupon.expires_at).getTime() <= Date.now();
    const below_minimum = coupon?.minimum_purchase !== null && Number(subtotal) < Number(coupon?.minimum_purchase);
    if (!coupon || coupon.active !== true || expired || below_minimum) return { ...calcular_totales_con_descuento(subtotal), coupon: null, coupon_error: expired ? 'El cupón está vencido.' : below_minimum ? 'No alcanzaste la compra mínima del cupón.' : 'Cupón inválido o inactivo.' };
    const restricted = await validar_condiciones_del_cupon(database, coupon, user_id);
    if (restricted) return { ...calcular_totales_con_descuento(subtotal), coupon: null, coupon_error: restricted };
    const totals = calcular_totales_con_descuento(subtotal, coupon.discount_percent);
    return {
        ...totals,
        coupon: { id: coupon.id, code: coupon.code, discount_percent: Number(coupon.discount_percent) },
        coupon_error: null
    };
}

const preparar_datos_del_perfume = row => ({
    ...normalizar_marca_del_perfume(row),
    featured: Boolean(row.featured),
    stock: Number(row.stock || 0),
    notes: {
        salida: String(row.top_notes).split(',').map(value => value.trim()),
        corazon: String(row.heart_notes).split(',').map(value => value.trim()),
        fondo: String(row.base_notes).split(',').map(value => value.trim())
    }
});

function es_tipo_de_campo_valido(key, value) {
    const numeric = ['size_ml', 'price', 'stock', 'intensity'].includes(key);
    return numeric ? typeof value === 'number' || typeof value === 'string' : typeof value === 'string';
}

function validar_datos(value) {
    const fields = ['brand', 'name', 'gender', 'category', 'size_ml', 'price', 'stock', 'intensity', 'family', 'top_notes', 'heart_notes', 'base_notes', 'description', 'image_url'];
    if (!value || typeof value !== 'object' || fields.some(key => !es_tipo_de_campo_valido(key, value[key]) || String(value[key]).trim() === '')) return 'Completá todos los campos del producto.';
    // validar tipos antes de number(null)/boolean('false') para no inventar stock ni destacados.
    if (value.featured !== undefined && typeof value.featured !== 'boolean') return 'La opción de destacado debe ser verdadera o falsa.';
    if (!['hombre', 'mujer', 'unisex'].includes(value.gender)) return 'Género inválido.';
    if (!['diseñador', 'nicho'].includes(value.category)) return 'Categoría inválida.';
    const size = Number(value.size_ml), price = Number(value.price), stock = Number(value.stock), intensity = Number(value.intensity);
    if (!Number.isSafeInteger(size) || size <= 0 || !Number.isFinite(price) || price < 0 || !Number.isSafeInteger(stock) || stock < 0 || !Number.isSafeInteger(intensity) || intensity < 1 || intensity > 5) return 'Precio, stock, tamaño e intensidad deben ser válidos.';
    const limits = { brand: 120, name: 160, family: 200, top_notes: 500, heart_notes: 500, base_notes: 500, description: 2000, image_url: 2000 };
    if (Object.entries(limits).some(([key, limit]) => String(value[key]).trim().length > limit)) return 'Uno o más campos superan la longitud permitida.';
    const image_error = validar_url_de_imagen(value.image_url);
    if (image_error) return image_error;
}

function preparar_datos(value) {
    const validation_error = validar_datos(value);
    if (validation_error) return { e: validation_error };
    const output = {};
    for (const key of ['brand', 'name', 'gender', 'category', 'family', 'top_notes', 'heart_notes', 'base_notes', 'description', 'image_url']) output[key] = String(value[key]).trim();
    for (const key of ['size_ml', 'price', 'stock', 'intensity']) output[key] = Number(value[key]);
    output.featured = Boolean(value.featured);
    return { o: output };
}

function normalizar_productos_del_carrito(items) {
    if (!Array.isArray(items) || items.length === 0 || items.length > 30) return { error: 'El carrito debe contener entre 1 y 30 productos.' };
    const quantities = new Map();
    for (const item of items) {
        const id = interpretar_id(item?.id), quantity = Number(item?.quantity);
        if (!id || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 99) return { error: 'El carrito contiene un producto o una cantidad inválida.' };
        quantities.set(id, Math.min(99, (quantities.get(id) || 0) + quantity));
    }
    return { quantities };
}

// consulta precios y stock actuales; no acepta importes enviados por el navegador.
async function cotizar_carrito(database, items, coupon_code = '', product_brand_column = 'brand', user_id = null) {
    const normalized = normalizar_productos_del_carrito(items);
    if (normalized.error) return normalized;
    const ids = [...normalized.quantities.keys()];
    const result = await database.from('products').select(`id,${obtener_columna_de_marca(product_brand_column)},name,price,stock,image_url,size_ml`).in('id', ids);
    if (result.error) throw result.error;
    const products = new Map(result.data.map(item => [Number(item.id), normalizar_marca_del_perfume(item)])), warnings = [], quoted = [];
    for (const [id, requested] of normalized.quantities) {
        const item = products.get(id);
        if (!item) { warnings.push(`El producto ${id} ya no está disponible.`); continue; }
        const stock = Math.max(0, Number(item.stock) || 0);
        if (stock === 0) { warnings.push(`${item.brand} ${item.name} está agotado.`); continue; }
        const quantity = Math.min(requested, stock);
        if (quantity < requested) warnings.push(`La cantidad de ${item.brand} ${item.name} se ajustó al stock disponible (${stock}).`);
        quoted.push({ ...item, id, price: Number(item.price), stock, quantity });
    }
    const subtotal = quoted.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return { items: quoted, warnings, ...(await resolver_cupon(database, coupon_code, subtotal, user_id)) };
}

async function consultar_estado_de_la_base(database, product_brand_column = 'brand', checkout_ready = false) {
    const schemas = {
        products: `id,${obtener_columna_de_marca(product_brand_column)},name,price,stock,image_url,gender,category,featured,family,size_ml,top_notes,heart_notes,base_notes`,
        profiles: 'id,name,role', reviews: 'id,user_id,user_name,rating,comment,created_at',
        inquiries: 'id,product_id,product_name'
    };
    if (checkout_ready) Object.assign(schemas, { orders: 'id,user_id,provider,status,total,items', coupons: 'id,code,discount_percent,active' });
    await Promise.all(Object.entries(schemas).map(async ([table, columns]) => {
        const result = await consultar_base_de_datos(() => {
            const query = database.from(table).select(columns, { head: true });
            return typeof query.abortSignal === 'function' ? query.abortSignal(AbortSignal.timeout(5000)) : query;
        });
        if (result.error) throw result.error;
    }));
    return true;
}

// contexto por aplicacion: no comparte sesiones ni clientes entre cuentas.
function preparar_contexto_de_la_aplicacion(options) {
    const database = options.database;
    const product_brand_column = obtener_columna_de_marca(options.product_brand_column || 'brand');
    if (!database) throw new TypeError('create_app requiere una base de datos.');
    const production = options.production ?? process.env.NODE_ENV === 'production';
    const logger = options.logger || console;
    const create_auth_client = options.create_auth_client || (() => database);
    const configured_contact_email = normalizar_correo(options.contact_email || contacts.emails[1]);
    const contact_email = es_correo_valido(configured_contact_email) ? configured_contact_email : 'contacto@example.com';
    const whatsapp_number = String(options.whatsapp_number ?? contacts.whatsapp_number).replace(/\D/g, '');
    const payment_provider = options.payment_provider || null;
    const demo_auto_confirm_email = options.demo_auto_confirm_email === true;
    const checkout_mode = ['production', 'sandbox', 'demo'].includes(payment_provider?.mode) ? payment_provider.mode : 'sandbox';
    const app_base_url = normalizar_origen(options.app_base_url);
    const checkout_enabled = Boolean(payment_provider?.configured && app_base_url && options.checkout_schema_ready);
    const show_test_data = checkout_mode === 'demo' || (checkout_mode === 'sandbox' && Boolean(options.show_checkout_test_data));
    const presentation = preparar_compra_academica({ enabled: options.presentation_checkout, signing_key: options.presentation_signing_key, issuer: options.presentation_issuer, quote_cart: cotizar_carrito, database, product_brand_column, production });
    const public_directory = options.public_directory || path.join(__dirname, '..', 'public');
    const views_directory = options.views_directory || path.join(__dirname, '..', 'views');
    const app = express();
    const manejar_errores_de_la_ruta = handler => (solicitud, respuesta, siguiente) => Promise.resolve(handler(solicitud, respuesta, siguiente)).catch(siguiente);
    const content_security_policy = { directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'"], styleSrc: ["'self'", 'https://fonts.googleapis.com'], fontSrc: ["'self'", 'https://fonts.gstatic.com'], imgSrc: ["'self'", 'data:', 'https:'], connectSrc: ["'self'"], objectSrc: ["'none'"], baseUri: ["'self'"], formAction: ["'self'"], frameAncestors: ["'none'"], upgradeInsecureRequests: production ? [] : null } };
    return {
        options, database, product_brand_column, production, logger,
        create_auth_client, contact_email, whatsapp_number, payment_provider, demo_auto_confirm_email,
        checkout_mode, app_base_url, checkout_enabled, show_test_data, presentation,
        public_directory, views_directory, app, async_route: manejar_errores_de_la_ruta, content_security_policy,
    };
}

function registrar_controles_http({
    options, app, content_security_policy,
}) {
    app.set('trust proxy', 1);
    app.use(helmet({ contentSecurityPolicy: content_security_policy, crossOriginEmbedderPolicy: false }));
    if (!options.disable_request_log) app.use(morgan((tokens, solicitud, respuesta) => `${solicitud.method} ${solicitud.path} ${respuesta.statusCode}`));
    app.use(express.json({ limit: '1mb' }), express.urlencoded({ extended: true, limit: '1mb' }));
    app.use(proteger_origen_de_las_escrituras(options.allowed_origins));
    app.use((solicitud, respuesta, siguiente) => {
        if (solicitud.path === '/api' || solicitud.path.startsWith('/api/') || ['/admin', '/admin.html'].includes(solicitud.path) || /dreams_(access|refresh)_token=/.test(solicitud.headers.cookie || '')) respuesta.setHeader('Cache-Control', 'no-store');
        siguiente();
    });
}

function registrar_limites_y_estaticos({
    options, presentation, public_directory, app,
}) {
    app.use('/api/auth', crear_limites_de_autenticacion());
    app.use('/api/inquiries', rateLimit({ windowMs: 900000, limit: 10, standardHeaders: true, legacyHeaders: false, message: { error: 'Demasiadas consultas. Probá nuevamente en unos minutos.' } }));
    app.use('/api/cart/config', rateLimit({ windowMs: 60000, limit: 120, standardHeaders: true, legacyHeaders: false, message: { error: 'Demasiadas consultas. Probá nuevamente en un minuto.' } }));
    app.use('/api/cart/account', rateLimit({ windowMs: 900000, limit: 180, standardHeaders: true, legacyHeaders: false, message: { error: 'Demasiados cambios del carrito. Probá nuevamente en unos minutos.' } }));
    app.use('/api/cart', rateLimit({ skip: solicitud => ['/account', '/config'].includes(solicitud.path), windowMs: 900000, limit: 30, standardHeaders: true, legacyHeaders: false, message: { error: 'Demasiadas verificaciones del carrito. Probá nuevamente en unos minutos.' } }));
    app.use('/api/presentation', rateLimit({ windowMs: 900000, limit: 60, standardHeaders: true, legacyHeaders: false, message: { error: 'Demasiados intentos. Probá nuevamente en unos minutos.' } }));
    app.use('/api/checkout', rateLimit({ skip: solicitud => !unsafe_methods.has(solicitud.method), windowMs: 900000, limit: 15, standardHeaders: true, legacyHeaders: false, message: { error: 'Demasiados intentos de pago. Probá nuevamente en unos minutos.' } }));
    app.use('/api/coupons', rateLimit({ windowMs: 900000, limit: 30, standardHeaders: true, legacyHeaders: false, message: { error: 'Demasiados intentos. Probá nuevamente en unos minutos.' } }));
    app.use('/api/payments/webhook', rateLimit({ windowMs: 60000, limit: 120, standardHeaders: true, legacyHeaders: false, message: { error: 'Demasiadas notificaciones.' } }));
    const review_limiter = rateLimit({ windowMs: 3600000, limit: 5, standardHeaders: true, legacyHeaders: false, message: { error: 'Publicaste varias opiniones. Probá nuevamente más tarde.' } });
    app.use('/api/reviews', (solicitud, respuesta, siguiente) => solicitud.method === 'POST' ? review_limiter(solicitud, respuesta, siguiente) : siguiente());
    app.use(bloquear_escrituras_de_prueba(options.preview_read_only, options.customer_data_enabled, esta_habilitada_la_funcion_oficial(options)));
    app.use(options.static_middleware || express.static(public_directory));
}

function preparar_cargador_de_perfiles(database) {
    async function obtener_perfil_del_usuario(user) {
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

    return obtener_perfil_del_usuario;
}

function registrar_control_de_sesion({
    database, production, logger, create_auth_client, app,
    async_route, profile_for,
}) {
    app.use(async_route(async (solicitud, respuesta, siguiente) => {
        try {
            const cookies = leer_cookies_de_la_solicitud(solicitud.headers.cookie);
            let token = cookies.dreams_access_token, user = null;
            if (token) {
                const result = await database.auth.getUser(token);
                if (es_error_temporal_de_autenticacion(result.error)) throw result.error;
                user = result.data?.user || null;
            }
            if (!user && cookies.dreams_refresh_token) {
                const auth = create_auth_client();
                const refreshed = await auth.auth.refreshSession({ refresh_token: cookies.dreams_refresh_token });
                if (es_error_temporal_de_autenticacion(refreshed.error)) throw refreshed.error;
                if (refreshed.data?.session) {
                    guardar_cookies_de_sesion(respuesta, refreshed.data.session, production);
                    token = refreshed.data.session.access_token;
                    user = refreshed.data.user;
                } else if (refreshed.error) {
                    borrar_cookies_de_sesion(respuesta, production);
                }
            }
            if (!user) return siguiente();
            const profile = await profile_for(user);
            solicitud.access_token = token;
            solicitud.user = { id: user.id, name: profile?.name || user.email, email: user.email, is_admin: profile?.role === 'admin' };
            siguiente();
        } catch (error) {
            solicitud.auth_unavailable = true;
            logger.warn?.('No se pudo restaurar la sesión.', { kind: obtener_tipo_de_error(error) });
            siguiente();
        }
    }));
}

// asocia cada ruta a los controles de sesion y rol; devuelve errores sin filtrar detalles privados.
function preparar_rutas_y_permisos(context) {
    const { app, create_auth_client, async_route } = context;
    const exigir_sesion = (solicitud, respuesta, siguiente) => solicitud.user ? siguiente() : respuesta.status(401).json({ error: 'Necesitás iniciar sesión.' });
    const exigir_administrador = (solicitud, respuesta, siguiente) => solicitud.user?.is_admin ? siguiente() : respuesta.status(403).json({ error: 'Acceso reservado al administrador.' });
    const crear_cliente_autorizado_del_panel = solicitud => create_auth_client(solicitud.access_token);
    const registrar_ruta = (method, url, ...handlers) => app[method](url, ...handlers.map(handler => handler === exigir_sesion || handler === exigir_administrador ? handler : async_route(handler)));
    const rechazar_error_de_datos = result => { if (result.error) throw result.error; return result.data; };
    Object.assign(context, { login: exigir_sesion, admin: exigir_administrador, admin_database: crear_cliente_autorizado_del_panel, route: registrar_ruta, fail_if: rechazar_error_de_datos });
}

function registrar_modulos_del_cliente({
    options, database, product_brand_column, create_auth_client, route,
    login,
}) {
    registrar_cuenta_carrito({ route, login, database, enabled: options.account_cart_enabled, signing_key: options.account_cart_signing_key || options.presentation_signing_key, product_brand_column });
    registrar_opiniones({ route, login, database, create_auth_client });
}

function registrar_ruta_para_consultar_carrito_por_cuenta({
    options, route,
}) {
    route('get', '/api/cart/config', async (_request, respuesta) => respuesta.json({ account_cart: options.account_cart_enabled === true }));
}

function registrar_rutas_academicas({
    presentation, app, route,
}) {
    presentation.install(app, route);
}

function registrar_rutas_de_google({
    options, production, logger, app_base_url, app,
    profile_for,
}) {
    preparar_rutas_de_google(app, { create_oauth_client: options.create_oauth_client, provider_enabled: async () => options.google_access_ready === true && await (options.google_provider_enabled || (async () => false))(), app_base_url, production, profile_for, logger });
}

function registrar_ruta_para_consultar_estado_de_google({
    options, app_base_url, route,
}) {
    route('get', '/api/auth/google/config', async (solicitud, respuesta) => respuesta.json({ enabled: Boolean(options.google_access_ready === true && options.create_oauth_client && app_base_url && await (options.google_provider_enabled || (async () => false))()) }));
}

function registrar_ruta_para_consultar_configuracion_de_registro({
    options, route,
}) {
    route('get', '/api/auth/config', async (solicitud, respuesta) => respuesta.json({ email_confirmation_required: options.email_confirmation_required ? await options.email_confirmation_required() : true }));
}

function registrar_ruta_para_leer_configuracion_publica({
    options, contact_email, whatsapp_number, demo_auto_confirm_email, route,
}) {
    route('get', '/api/config', async (solicitud, respuesta) => respuesta.json({ whatsapp_number, contact_email, contacts, app_name: 'DREAMS', demo_auto_confirm_email, preview_read_only: options.preview_read_only === true, admin_writes_enabled: esta_habilitada_la_funcion_oficial(options) }));
}

function registrar_ruta_para_consultar_modo_de_compra({
    payment_provider, checkout_mode, checkout_enabled, show_test_data, presentation,
    route,
}) {
    route('get', '/api/checkout/config', async (solicitud, respuesta) => respuesta.json({ enabled: presentation.ready || checkout_enabled, provider: presentation.ready ? 'presentation_demo' : checkout_enabled ? payment_provider.name : null, mode: presentation.ready ? 'demo' : checkout_mode, show_test_data: presentation.ready || show_test_data }));
}

function registrar_ruta_para_listar_perfumes({
    database, product_brand_column, route, fail_if,
}) {
    route('get', '/api/products', async (solicitud, respuesta) => {
        const search = String(solicitud.query.search || '').trim().replace(/[^\p{L}\p{N}\s'-]/gu, '').slice(0, 80);
        const sort = String(solicitud.query.sort || 'featured');
        const result = await consultar_base_de_datos(() => {
            let query = database.from('products').select('*');
            for (const key of ['brand', 'gender', 'category']) if (solicitud.query[key]) query = query.eq(key === 'brand' ? product_brand_column : key, String(solicitud.query[key]).slice(0, 60));
            if (+solicitud.query.max_price > 0) query = query.lte('price', +solicitud.query.max_price);
            if (search) query = query.or(`name.ilike.%${search}%,${product_brand_column}.ilike.%${search}%,family.ilike.%${search}%`);
            query = sort === 'price_asc' ? query.order('price') : sort === 'price_desc' ? query.order('price', { ascending: false }) : sort === 'name' ? query.order('name') : query.order('featured', { ascending: false }).order('id', { ascending: false });
            const limit = interpretar_id(solicitud.query.limit);
            return limit ? query.limit(Math.min(limit, 100)) : query;
        });
        respuesta.json(fail_if(result).map(preparar_datos_del_perfume));
    });
}

function registrar_ruta_para_ver_perfume({
    database, route, fail_if,
}) {
    route('get', '/api/products/:id', async (solicitud, respuesta) => {
        const id = interpretar_id(solicitud.params.id);
        if (!id) return respuesta.status(400).json({ error: 'ID de producto inválido.' });
        const data = fail_if(await consultar_base_de_datos(() => database.from('products').select('*').eq('id', id).maybeSingle()));
        return data ? respuesta.json(preparar_datos_del_perfume(data)) : respuesta.status(404).json({ error: 'Perfume no encontrado.' });
    });
}

function registrar_ruta_para_listar_marcas({
    database, product_brand_column, route, fail_if,
}) {
    route('get', '/api/brands', async (solicitud, respuesta) => respuesta.json([...new Set(fail_if(await consultar_base_de_datos(() => database.from('products').select(product_brand_column).order(product_brand_column))).map(item => normalizar_marca_del_perfume(item).brand))]));
}

function registrar_ruta_para_crear_cuenta({
    options, database, production, logger, create_auth_client,
    demo_auto_confirm_email, route,
}) {
    route('post', '/api/auth/register', preparar_registro_del_cliente({ database, create_auth_client, production, demo_auto_confirm_email, logger, email_confirmation_required: options.email_confirmation_required }));
}

function registrar_ruta_para_iniciar_sesion({
    production, create_auth_client, demo_auto_confirm_email, profile_for, login,
    admin, route,
}) {
    route('post', '/api/auth/login', async (solicitud, respuesta) => {
        const email = normalizar_correo(solicitud.body.email), password = String(solicitud.body.password || '');
        if (!es_correo_valido(email) || !password || password.length > 128) return respuesta.status(400).json({ error: 'Ingresá un correo válido y tu contraseña.' });
        const result = await create_auth_client().auth.signInWithPassword({ email, password });
        if (es_error_temporal_de_autenticacion(result.error)) return respuesta.status(503).json({ error: 'No pudimos iniciar tu sesión. Reintentá más tarde.' });
        if (result.error || !result.data.session || !result.data.user) {
            const confirmation_required = !demo_auto_confirm_email && result.error?.code === 'email_not_confirmed';
            return respuesta.status(401).json({ error: confirmation_required ? 'Primero confirmá tu cuenta desde el correo que te enviamos.' : 'Correo o contraseña incorrectos.' });
        }
        const profile = await profile_for(result.data.user);
        guardar_cookies_de_sesion(respuesta, result.data.session, production);
        const user = { id: result.data.user.id, name: profile?.name || email, email, is_admin: profile?.role === 'admin' };
        respuesta.json({ message: 'Sesión iniciada.', authenticated: true, redirect: user.is_admin ? '/admin' : '/cuenta.html', user });
    });
}

function registrar_ruta_para_cerrar_sesion({
    production, logger, create_auth_client, admin, route,
}) {
    route('post', '/api/auth/logout', async (solicitud, respuesta) => {
        if (solicitud.access_token) {
            const result = await create_auth_client().auth.admin.signOut(solicitud.access_token, 'local');
            if (result.error) logger.warn?.('No se pudo revocar la sesión remota.', { kind: obtener_tipo_de_error(result.error) });
        }
        borrar_cookies_de_sesion(respuesta, production);
        respuesta.json({ message: 'Sesión cerrada.' });
    });
}

function registrar_ruta_para_consultar_sesion({
    route,
}) {
    route('get', '/api/auth/me', async (solicitud, respuesta) => solicitud.auth_unavailable
        ? respuesta.status(503).json({ error: 'No pudimos comprobar tu sesión. Reintentá más tarde.' }) : respuesta.json({ user: solicitud.user || null }));
}

function registrar_ruta_para_cotizar_carrito({
    database, product_brand_column, whatsapp_number, presentation, route,
}) {
    route('post', '/api/cart/quote', async (solicitud, respuesta) => {
        const quote = await cotizar_carrito(database, solicitud.body.items, solicitud.body.coupon_code, product_brand_column, solicitud.user?.id);
        if (quote.error) return respuesta.status(400).json({ error: quote.error });
        const lines = quote.items.map(item => `${item.quantity} × ${item.brand} ${item.name} — ${item.price * item.quantity} ARS`);
        const summary = presentation.ready ? resumir_compra_academica(quote.subtotal, quote) : null;
        const text = ['Hola DREAMS, quiero consultar por este carrito:', ...lines, summary ? `Total: ${summary.total} ARS. ${summary.shipping_label}.` : `Subtotal de productos: ${quote.total} ARS. Envío a consultar, no incluido.`].join('\n');
        respuesta.json({ ...quote, ...(summary || {}), whatsapp_url: quote.items.length && /^\d{8,15}$/.test(whatsapp_number) ? `https://wa.me/${whatsapp_number}?text=${encodeURIComponent(text)}` : null });
    });
}

function registrar_ruta_para_validar_cupon({
    database, product_brand_column, route,
}) {
    route('post', '/api/coupons/validate', async (solicitud, respuesta) => {
        const quote = await cotizar_carrito(database, solicitud.body.items, solicitud.body.code, product_brand_column);
        if (quote.error) return respuesta.status(400).json({ error: quote.error });
        if (!quote.coupon) return respuesta.status(404).json({ error: 'Cupón inválido.', subtotal: quote.subtotal, discount: 0, total: quote.total });
        respuesta.json({ coupon: quote.coupon, subtotal: quote.subtotal, discount: quote.discount, total: quote.total });
    });
}

function crear_pedido_comercial(order_id, solicitud, payment_provider, quote) {
    return {
        id: order_id,
        user_id: solicitud.user.id,
        provider: payment_provider.name,
        provider_preference_id: null,
        provider_payment_id: null,
        status: 'created',
        status_detail: null,
        currency: 'ARS',
        subtotal: quote.subtotal,
        discount: quote.discount,
        total: quote.total,
        coupon_id: quote.coupon?.id || null,
        coupon_code: quote.coupon?.code || null,
        coupon_percent: quote.coupon?.discount_percent || null,
        items: quote.items.map(item => ({ id: item.id, brand: item.brand, name: item.name, size_ml: item.size_ml, price: item.price, quantity: item.quantity })),
        paid_at: null
    };
}

function registrar_ruta_para_iniciar_compra({
    database, product_brand_column, logger, payment_provider, checkout_mode,
    app_base_url, checkout_enabled, login, route, fail_if,
}) {
    route('post', '/api/checkout/session', login, async (solicitud, respuesta) => {
        if (!checkout_enabled || !app_base_url) return respuesta.status(503).json({ error: 'El pago online todavía no está disponible.' });
        const quote = await cotizar_carrito(database, solicitud.body.items, solicitud.body.coupon_code, product_brand_column, solicitud.user?.id);
        if (quote.error) return respuesta.status(400).json({ error: quote.error });
        if (solicitud.body.coupon_code && !quote.coupon) return respuesta.status(409).json({ error: 'Cupón inválido.' });
        if (!quote.items.length || quote.total <= 0) return respuesta.status(409).json({ error: 'No hay productos disponibles para pagar.' });

        const order_id = randomUUID();
        const order = crear_pedido_comercial(order_id, solicitud, payment_provider, quote);
        fail_if(await database.from('orders').insert(order));
        try {
            const checkout = await payment_provider.create_checkout({ order_id, items: quote.items, total: quote.total, discount: quote.discount, payer_email: solicitud.user.email, app_base_url });
            fail_if(await database.from('orders').update({ provider_preference_id: checkout.preference_id }).eq('id', order_id));
            respuesta.status(201).json({
                order_id,
                provider: payment_provider.name,
                checkout_url: checkout.checkout_url || null,
                requires_demo_payment: checkout.requires_demo_payment === true,
                mode: checkout_mode,
                warnings: quote.warnings
            });
        } catch (error) {
            const failed = await database.from('orders').update({ status: 'error', status_detail: 'preference_creation_failed' }).eq('id', order_id);
            if (failed.error) logger.error?.('No se pudo marcar la orden fallida.', { kind: obtener_tipo_de_error(failed.error) });
            throw error;
        }
    });
}

function registrar_ruta_para_simular_pago({
    database, payment_provider, checkout_enabled, login, route,
    fail_if,
}) {
    route('post', '/api/checkout/demo-payment', login, async (solicitud, respuesta) => {
        if (!checkout_enabled || payment_provider?.name !== 'demo' || typeof payment_provider.process_payment !== 'function') {
            return respuesta.status(404).json({ error: 'El pago de prueba no está disponible.' });
        }
        if (solicitud.body.card_number || solicitud.body.cvv || solicitud.body.expiry) {
            return respuesta.status(400).json({ error: 'Los datos ficticios de tarjeta no deben enviarse al servidor.' });
        }
        const order_id = String(solicitud.body.order_id || '');
        if (!/^[0-9a-f-]{36}$/i.test(order_id)) return respuesta.status(400).json({ error: 'ID de pedido inválido.' });
        const order = fail_if(await database.from('orders').select('id,user_id,provider,status,total,currency,created_at').eq('id', order_id).eq('user_id', solicitud.user.id).maybeSingle());
        if (!order || order.provider !== 'demo') return respuesta.status(404).json({ error: 'Pedido de prueba no encontrado.' });
        if (order.status !== 'created') return respuesta.status(409).json({ error: 'Este pedido de prueba ya fue procesado.' });

        let payment;
        try {
            payment = await payment_provider.process_payment({ order_id, scenario: solicitud.body.scenario });
        } catch (error) {
            if (error?.code === 'DEMO_SCENARIO_INVALID') return respuesta.status(400).json({ error: 'Resultado de prueba inválido.' });
            throw error;
        }
        const updated = fail_if(await database.from('orders').update({
            provider_payment_id: payment.id,
            status: payment.status,
            status_detail: payment.status_detail,
            paid_at: payment.paid_at
        }).eq('id', order.id).eq('status', 'created').select('id').maybeSingle());
        if (!updated) return respuesta.status(409).json({ error: 'Este pedido de prueba ya fue procesado.' });
        respuesta.json({ order_id: order.id, order_number: crear_referencia_del_pedido(order), status: payment.status, status_detail: payment.status_detail });
    });
}

function registrar_ruta_para_confirmar_compra({
    database, payment_provider, checkout_mode, checkout_enabled, login,
    route, fail_if,
}) {
    route('post', '/api/checkout/confirm', login, async (solicitud, respuesta) => {
        if (!checkout_enabled || payment_provider?.name !== 'mercado_pago') return respuesta.status(503).json({ error: 'La confirmación de Mercado Pago no está disponible.' });
        const order_id = String(solicitud.body.order_id || '');
        const payment_id = String(solicitud.body.payment_id || '');
        if (!/^[0-9a-f-]{36}$/i.test(order_id) || !/^\d{1,30}$/.test(payment_id)) return respuesta.status(400).json({ error: 'Datos de pago inválidos.' });
        const order = fail_if(await database.from('orders').select('*').eq('id', order_id).eq('user_id', solicitud.user.id).maybeSingle());
        if (!order) return respuesta.status(404).json({ error: 'Pedido no encontrado.' });
        const payment = await payment_provider.get_payment(payment_id);
        if (payment.order_id !== order.id || payment.currency !== order.currency || payment.amount !== Number(order.total) || (checkout_mode === 'sandbox' && payment.live_mode)) {
            return respuesta.status(409).json({ error: 'El pago recibido no coincide con el pedido.' });
        }
        fail_if(await database.from('orders').update({ provider_payment_id: payment.id, status: payment.status, status_detail: payment.status_detail, paid_at: payment.status === 'approved' ? payment.paid_at : null }).eq('id', order.id));
        respuesta.json({ order_id: order.id, order_number: crear_referencia_del_pedido(order), status: payment.status, status_detail: payment.status_detail });
    });
}

function registrar_ruta_para_consultar_pedido({
    database, login, route, fail_if,
}) {
    route('get', '/api/orders/:id', login, async (solicitud, respuesta) => {
        const order_id = String(solicitud.params.id || '');
        if (!/^[0-9a-f-]{36}$/i.test(order_id)) return respuesta.status(400).json({ error: 'ID de pedido inválido.' });
        const order = fail_if(await database.from('orders').select('id,status,status_detail,currency,total,items,created_at,paid_at').eq('id', order_id).eq('user_id', solicitud.user.id).maybeSingle());
        return order ? respuesta.json({ ...order, order_number: crear_referencia_del_pedido(order) }) : respuesta.status(404).json({ error: 'Pedido no encontrado.' });
    });
}

function registrar_ruta_para_notificar_pago({
    database, payment_provider, checkout_mode, checkout_enabled, route,
    fail_if,
}) {
    route('post', '/api/payments/webhook', async (solicitud, respuesta) => {
        if (!checkout_enabled || payment_provider?.name !== 'mercado_pago' || solicitud.body?.type !== 'payment') return respuesta.status(200).json({ received: true });
        const payment_id = String(solicitud.body?.data?.id || solicitud.query['data.id'] || '');
        if (!/^\d{1,30}$/.test(payment_id) || !payment_provider.verify_webhook(solicitud.headers, payment_id)) return respuesta.status(401).json({ error: 'Notificación no válida.' });
        const payment = await payment_provider.get_payment(payment_id);
        if (!/^[0-9a-f-]{36}$/i.test(payment.order_id)) return respuesta.status(200).json({ received: true });
        const order = fail_if(await database.from('orders').select('id,total,currency').eq('id', payment.order_id).maybeSingle());
        if (!order || payment.currency !== order.currency || payment.amount !== Number(order.total) || (checkout_mode === 'sandbox' && payment.live_mode)) return respuesta.status(200).json({ received: true });
        fail_if(await database.from('orders').update({ provider_payment_id: payment.id, status: payment.status, status_detail: payment.status_detail, paid_at: payment.status === 'approved' ? payment.paid_at : null }).eq('id', order.id));
        respuesta.json({ received: true });
    });
}

function registrar_ruta_para_guardar_consulta({
    database, whatsapp_number, route, fail_if,
}) {
    route('post', '/api/inquiries', async (solicitud, respuesta) => {
        const id = interpretar_id(solicitud.body.product_id);
        if (!id) return respuesta.status(400).json({ error: 'ID de producto inválido.' });
        const found = fail_if(await database.from('products').select('id,name').eq('id', id).maybeSingle());
        if (!found) return respuesta.status(404).json({ error: 'Producto no encontrado.' });
        fail_if(await database.from('inquiries').insert({ user_id: solicitud.user?.id || null, product_id: found.id, product_name: found.name, user_name: solicitud.user?.name || null, user_email: solicitud.user?.email || null }));
        respuesta.json({ message: 'Consulta registrada.', whatsapp_url: `https://wa.me/${whatsapp_number}?text=${encodeURIComponent(`Hola DREAMS, quiero consultar por ${found.name}. ¿Está disponible?`)}` });
    });
}

function registrar_ruta_para_leer_estadisticas_del_panel({
    admin, admin_database, route,
}) {
    route('get', '/api/admin/stats', admin, async (solicitud, respuesta) => {
        const db = admin_database(solicitud);
        const tables = ['products', 'profiles', 'inquiries', 'reviews'];
        const counts = await Promise.all(tables.map(async table => { const result = await db.from(table).select('*', { count: 'exact', head: true }); if (result.error) throw result.error; return result.count || 0; }));
        const orders = await db.from('orders').select('*', { count: 'exact', head: true });
        if (orders.error) throw orders.error;
        const low = await db.from('products').select('*', { count: 'exact', head: true }).lte('stock', 2);
        if (low.error) throw low.error;
        respuesta.json({ products: counts[0], users: counts[1], inquiries: counts[2], reviews: counts[3], orders: orders.count || 0, low_stock: low.count || 0 });
    });
}

function registrar_ruta_para_listar_perfumes_del_panel({
    admin, admin_database, route, fail_if,
}) {
    route('get', '/api/admin/products', admin, async (solicitud, respuesta) => respuesta.json(fail_if(await admin_database(solicitud).from('products').select('*').order('id', { ascending: false })).map(row => ({ ...preparar_datos_del_perfume(row), stock: typeof row.stock === 'number' && Number.isSafeInteger(row.stock) && row.stock >= 0 ? row.stock : null }))));
}

function registrar_ruta_para_crear_perfumes_del_panel({
    product_brand_column, admin, admin_database, route, fail_if,
}) {
    route('post', '/api/admin/products', admin, async (solicitud, respuesta) => {
        const parsed = preparar_datos(solicitud.body);
        if (parsed.e) return respuesta.status(400).json({ error: parsed.e });
        respuesta.status(201).json(preparar_datos_del_perfume(fail_if(await admin_database(solicitud).from('products').insert(preparar_datos_para_guardar_perfume(parsed.o, product_brand_column)).select().single())));
    });
}

function registrar_ruta_para_actualizar_perfumes_del_panel_por_id({
    product_brand_column, admin, admin_database, route, fail_if,
}) {
    route('put', '/api/admin/products/:id', admin, async (solicitud, respuesta) => {
        const id = interpretar_id(solicitud.params.id);
        if (!id) return respuesta.status(400).json({ error: 'ID de producto inválido.' });
        const parsed = preparar_datos(solicitud.body);
        if (parsed.e) return respuesta.status(400).json({ error: parsed.e });
        const db = admin_database(solicitud);
        const existing = fail_if(await db.from('products').select('id').eq('id', id).maybeSingle());
        if (!existing) return respuesta.status(404).json({ error: 'Producto no encontrado.' });
        const data = fail_if(await db.from('products').update(preparar_datos_para_guardar_perfume(parsed.o, product_brand_column)).eq('id', id).select().maybeSingle());
        return data ? respuesta.json(preparar_datos_del_perfume(data)) : respuesta.status(503).json({ error: 'El producto existe, pero no pudo actualizarse por la configuración de permisos.' });
    });
}

function registrar_ruta_para_eliminar_perfumes_del_panel_por_id({
    admin, admin_database, route, fail_if,
}) {
    route('delete', '/api/admin/products/:id', admin, async (solicitud, respuesta) => {
        const id = interpretar_id(solicitud.params.id);
        if (!id) return respuesta.status(400).json({ error: 'ID de producto inválido.' });
        const db = admin_database(solicitud);
        const existing = fail_if(await db.from('products').select('id').eq('id', id).maybeSingle());
        if (!existing) return respuesta.status(404).json({ error: 'Producto no encontrado.' });
        const data = fail_if(await db.from('products').delete().eq('id', id).select('id').maybeSingle());
        return data ? respuesta.json({ message: 'Producto eliminado.' }) : respuesta.status(503).json({ error: 'El producto existe, pero no pudo eliminarse por la configuración de permisos.' });
    });
}

function registrar_ruta_para_listar_usuarios_del_panel({
    admin, admin_database, route, fail_if,
}) {
    route('get', '/api/admin/users', admin, async (solicitud, respuesta) => respuesta.json(fail_if(await admin_database(solicitud).from('profiles').select('id,name,role,created_at').order('created_at', { ascending: false })).map(value => ({ ...value, email: null, is_admin: value.role === 'admin' }))));
}

function registrar_ruta_para_listar_consultas_del_panel({
    product_brand_column, admin, admin_database, route, fail_if,
}) {
    route('get', '/api/admin/inquiries', admin, async (solicitud, respuesta) => respuesta.json(fail_if(await admin_database(solicitud).from('inquiries').select(`*,products(${product_brand_column},name)`).order('id', { ascending: false }).limit(100)).map(value => ({ ...value, brand: value.products ? normalizar_marca_del_perfume(value.products).brand : null, name: value.products?.name || value.product_name }))));
}

function registrar_ruta_para_listar_opiniones_del_panel({
    admin, admin_database, route, fail_if,
}) {
    route('get', '/api/admin/reviews', admin, async (solicitud, respuesta) => respuesta.json(fail_if(await admin_database(solicitud).from('reviews').select('*').order('id', { ascending: false }))));
}

function registrar_ruta_para_actualizar_opiniones_del_panel_por_id({
    admin, admin_database, route, fail_if,
}) {
    route('put', '/api/admin/reviews/:id', admin, async (solicitud, respuesta) => {
        const id = interpretar_id(solicitud.params.id);
        if (!id) return respuesta.status(400).json({ error: 'ID de opinión inválido.' });
        const parsed = preparar_datos_de_opinion(solicitud.body);
        if (parsed.error) return respuesta.status(400).json({ error: parsed.error });
        const updated = fail_if(await admin_database(solicitud).from('reviews').update(parsed.data).eq('id', id).select('*').maybeSingle());
        return updated ? respuesta.json(updated) : respuesta.status(404).json({ error: 'Opinión no encontrada.' });
    });
}

function registrar_ruta_para_eliminar_opiniones_del_panel_por_id({
    admin, admin_database, route, fail_if,
}) {
    route('delete', '/api/admin/reviews/:id', admin, async (solicitud, respuesta) => {
        const id = interpretar_id(solicitud.params.id);
        if (!id) return respuesta.status(400).json({ error: 'ID de opinión inválido.' });
        const deleted = fail_if(await admin_database(solicitud).from('reviews').delete().eq('id', id).select('id').maybeSingle());
        return deleted ? respuesta.json({ message: 'Opinión eliminada.' }) : respuesta.status(404).json({ error: 'Opinión no encontrada.' });
    });
}

function registrar_ruta_para_listar_pedidos_del_panel({
    admin, admin_database, route, fail_if,
}) {
    route('get', '/api/admin/orders', admin, async (solicitud, respuesta) => respuesta.json(fail_if(await admin_database(solicitud).from('orders').select('id,user_id,provider,status,status_detail,currency,subtotal,discount,total,coupon_code,items,created_at,paid_at').order('created_at', { ascending: false }).limit(100)).map(value => ({ ...value, order_number: crear_referencia_del_pedido(value) }))));
}

function registrar_ruta_para_listar_cupones_del_panel({
    admin, admin_database, route, fail_if,
}) {
    route('get', '/api/admin/coupons', admin, async (solicitud, respuesta) => respuesta.json(fail_if(await admin_database(solicitud).from('coupons').select('id,code,discount_percent,active,created_at,updated_at').order('created_at', { ascending: false }))));
}

function registrar_ruta_para_crear_cupones_del_panel({
    admin, admin_database, route, fail_if,
}) {
    route('post', '/api/admin/coupons', admin, async (solicitud, respuesta) => {
        const parsed = preparar_datos_del_cupon(solicitud.body);
        if (parsed.error) return respuesta.status(400).json({ error: parsed.error });
        const db = admin_database(solicitud);
        const existing = fail_if(await db.from('coupons').select('id').eq('code', parsed.data.code).maybeSingle());
        if (existing) return respuesta.status(409).json({ error: 'Ya existe un cupón con ese código.' });
        const created = fail_if(await db.from('coupons').insert(parsed.data).select('id,code,discount_percent,active,created_at,updated_at').single());
        respuesta.status(201).json(created);
    });
}

function registrar_ruta_para_actualizar_cupones_del_panel_por_id({
    admin, admin_database, route, fail_if,
}) {
    route('put', '/api/admin/coupons/:id', admin, async (solicitud, respuesta) => {
        const id = interpretar_id(solicitud.params.id);
        if (!id) return respuesta.status(400).json({ error: 'ID de cupón inválido.' });
        const parsed = preparar_datos_del_cupon(solicitud.body);
        if (parsed.error) return respuesta.status(400).json({ error: parsed.error });
        const db = admin_database(solicitud);
        const existing = fail_if(await db.from('coupons').select('id').eq('code', parsed.data.code).neq('id', id).maybeSingle());
        if (existing) return respuesta.status(409).json({ error: 'Ya existe un cupón con ese código.' });
        const updated = fail_if(await db.from('coupons').update(parsed.data).eq('id', id).select('id,code,discount_percent,active,created_at,updated_at').maybeSingle());
        return updated ? respuesta.json(updated) : respuesta.status(404).json({ error: 'Cupón no encontrado.' });
    });
}

function registrar_ruta_para_eliminar_cupones_del_panel_por_id({
    admin, admin_database, route, fail_if,
}) {
    route('delete', '/api/admin/coupons/:id', admin, async (solicitud, respuesta) => {
        const id = interpretar_id(solicitud.params.id);
        if (!id) return respuesta.status(400).json({ error: 'ID de cupón inválido.' });
        const deleted = fail_if(await admin_database(solicitud).from('coupons').delete().eq('id', id).select('id').maybeSingle());
        return deleted ? respuesta.json({ message: 'Cupón eliminado.' }) : respuesta.status(404).json({ error: 'Cupón no encontrado.' });
    });
}

function registrar_ruta_para_entregar_script_del_panel({
    options, public_directory, admin, route,
}) {
    route('get', '/js/admin-console-v3.js', async (solicitud, respuesta) => options.admin_script ? respuesta.type('application/javascript').send(options.admin_script) : respuesta.sendFile(path.join(public_directory, 'js', 'admin.js')));
}

function registrar_ruta_para_abrir_panel({
    options, views_directory, admin, route,
}) {
    route('get', ['/admin', '/admin.html'], admin, async (solicitud, respuesta) => options.admin_html ? respuesta.type('html').send(options.admin_html) : respuesta.sendFile(path.join(views_directory, 'admin.html')));
}

function registrar_ruta_para_redirigir_ruta_anterior({
    route,
}) {
    route('get', ['/favoritos', '/favoritos.html'], async (solicitud, respuesta) => respuesta.redirect(301, '/catalogo.html'));
}

function registrar_ruta_para_consultar_estado_del_backend({
    options, database, product_brand_column, logger, route,
}) {
    route('get', '/api/health', async (solicitud, respuesta) => {
        try {
            await consultar_estado_de_la_base(database, product_brand_column, options.checkout_schema_ready === true);
            respuesta.json({ status: 'ok', api: true, database: 'ok' });
        } catch (error) {
            logger.error?.('Healthcheck de Supabase falló.', { kind: obtener_tipo_de_error(error) });
            respuesta.status(503).json({ status: 'unavailable', api: true, database: 'unavailable' });
        }
    });
}

function registrar_respuestas_finales({
    options, logger, public_directory, app,
}) {
    app.use((solicitud, respuesta) => solicitud.path.startsWith('/api/')
        ? respuesta.status(404).json({ error: 'Ruta API no encontrada.' })
        : options.not_found_html ? respuesta.status(404).type('html').send(options.not_found_html) : respuesta.status(404).sendFile(path.join(public_directory, '404.html')));
    app.use((error, solicitud, respuesta, siguiente) => {
        if (respuesta.headersSent) return siguiente(error);
        logger.error?.('Error inesperado de API.', { method: solicitud.method, path: solicitud.path, kind: obtener_tipo_de_error(error) });
        respuesta.status(500).json({ error: GENERIC_ERROR });
    });
}

const application_installers = [
    registrar_controles_http,
    registrar_limites_y_estaticos,
    registrar_control_de_sesion,
    preparar_rutas_y_permisos,
    registrar_modulos_del_cliente,
    registrar_ruta_para_consultar_carrito_por_cuenta,
    registrar_rutas_academicas,
    registrar_rutas_de_google,
    registrar_ruta_para_consultar_estado_de_google,
    registrar_ruta_para_consultar_configuracion_de_registro,
    registrar_ruta_para_leer_configuracion_publica,
    registrar_ruta_para_consultar_modo_de_compra,
    registrar_ruta_para_listar_perfumes,
    registrar_ruta_para_ver_perfume,
    registrar_ruta_para_listar_marcas,
    registrar_ruta_para_crear_cuenta,
    registrar_ruta_para_iniciar_sesion,
    registrar_ruta_para_cerrar_sesion,
    registrar_ruta_para_consultar_sesion,
    registrar_ruta_para_cotizar_carrito,
    registrar_ruta_para_validar_cupon,
    registrar_ruta_para_iniciar_compra,
    registrar_ruta_para_simular_pago,
    registrar_ruta_para_confirmar_compra,
    registrar_ruta_para_consultar_pedido,
    registrar_ruta_para_notificar_pago,
    registrar_ruta_para_guardar_consulta,
    registrar_ruta_para_leer_estadisticas_del_panel,
    registrar_ruta_para_listar_perfumes_del_panel,
    registrar_ruta_para_crear_perfumes_del_panel,
    registrar_ruta_para_actualizar_perfumes_del_panel_por_id,
    registrar_ruta_para_eliminar_perfumes_del_panel_por_id,
    registrar_ruta_para_listar_usuarios_del_panel,
    registrar_ruta_para_listar_consultas_del_panel,
    registrar_ruta_para_listar_opiniones_del_panel,
    registrar_ruta_para_actualizar_opiniones_del_panel_por_id,
    registrar_ruta_para_eliminar_opiniones_del_panel_por_id,
    registrar_ruta_para_listar_pedidos_del_panel,
    registrar_ruta_para_listar_cupones_del_panel,
    registrar_ruta_para_crear_cupones_del_panel,
    registrar_ruta_para_actualizar_cupones_del_panel_por_id,
    registrar_ruta_para_eliminar_cupones_del_panel_por_id,
    registrar_ruta_para_entregar_script_del_panel,
    registrar_ruta_para_abrir_panel,
    registrar_ruta_para_redirigir_ruta_anterior,
    registrar_ruta_para_consultar_estado_del_backend,
    registrar_respuestas_finales,
];

// arma una instancia aislada de express con las opciones recibidas; no comparte sesiones.
function crear_aplicacion(options = {}) {
    const context = preparar_contexto_de_la_aplicacion(options);
    context.profile_for = preparar_cargador_de_perfiles(context.database);
    for (const install of application_installers) install(context);
    return context.app;
}

module.exports = { create_app: crear_aplicacion, validate: validar_datos, validate_product_image_url: validar_url_de_imagen, IMAGE_URL_ERROR, payload: preparar_datos, coupon_payload: preparar_datos_del_cupon, review_payload: preparar_datos_de_opinion, normalize_coupon_code: normalizar_codigo_del_cupon, discounted_totals: calcular_totales_con_descuento, resolve_coupon: resolver_cupon, order_number: crear_referencia_del_pedido, database_health: consultar_estado_de_la_base, auth_cookie: crear_cookie_de_autenticacion, session: guardar_cookies_de_sesion, parse_id: interpretar_id, normalize_cart_items: normalizar_productos_del_carrito, quote_cart: cotizar_carrito, execute_database_query: consultar_base_de_datos, normalize_origin: normalizar_origen, allowed_origin_set: leer_origenes_permitidos, mutation_origin_guard: proteger_origen_de_las_escrituras, GENERIC_ERROR };
