// Rechaza mutaciones de otros orígenes sin confiar en una cabecera arbitraria.
function check_mutation_origin(configured, request, response, next) {
    if (!unsafe_methods.has(request.method)) return next();

    const origin_header = request.get('origin');
    const referer_header = request.get('referer');
    const fetch_site = String(request.get('sec-fetch-site') || '').toLowerCase();
    if (!origin_header && !referer_header) {
        const has_session_cookie = /(?:^|;\s*)dreams_(?:access|refresh)_token=/.test(String(request.headers.cookie || ''));
        return fetch_site === 'cross-site' || has_session_cookie
        ? response.status(403).json({ error: 'Origen de solicitud no permitido.' })
        : next();
    }

    const supplied_origin = normalize_origin(origin_header || referer_header);
    const request_origin = normalize_origin(`${request.protocol}://${request.get('host') || ''}`);
    const trusted = configured.size ? configured : new Set([request_origin].filter(Boolean));
    return supplied_origin && trusted.has(supplied_origin)
    ? next()
    : response.status(403).json({ error: 'Origen de solicitud no permitido.' });
}

// Fallo de proveedor marca la orden comercial y propaga error sin filtrar su mensaje.
async function request_commercial_preference(context, request, response, quote, order_id) {
    const { database, payment_provider, app_base_url, checkout_mode, fail_if, logger } = context;
    try {
        const checkout = await payment_provider.create_checkout({ order_id, items: quote.items, total: quote.total, discount: quote.discount, payer_email: request.user.email, app_base_url });
        fail_if(await database.from('orders').update({ provider_preference_id: checkout.preference_id }).eq('id', order_id));
        response.status(201).json({
            order_id,
            provider: payment_provider.name,
            checkout_url: checkout.checkout_url || null,
            requires_demo_payment: checkout.requires_demo_payment === true,
            mode: checkout_mode,
            warnings: quote.warnings
        });
    } catch (error) {
        const failed = await database.from('orders').update({ status: 'error', status_detail: 'preference_creation_failed' }).eq('id', order_id);
        if (failed.error) logger.error?.('No se pudo marcar la orden fallida.', { kind: error_kind(failed.error) });
        throw error;
    }
}

// Actualización condicional: un reintento nunca procesa dos veces el pedido demo.
async function persist_demo_payment(context, order, payment, response) {
    const { database, fail_if } = context;
    const updated = fail_if(await database.from('orders').update({
        provider_payment_id: payment.id,
        status: payment.status,
        status_detail: payment.status_detail,
        paid_at: payment.paid_at
    }).eq('id', order.id).eq('status', 'created').select('id').maybeSingle());
    if (!updated) return response.status(409).json({ error: 'Este pedido de prueba ya fue procesado.' });
    response.json({ order_id: order.id, order_number: order_number(order), status: payment.status, status_detail: payment.status_detail });
}

// Responsabilidad process demo payment result; preserva la secuencia original.
async function process_demo_payment_result(context, request, response, order) {
    const { payment_provider } = context;
    const order_id = order.id;
    if (order.status !== 'created') return response.status(409).json({ error: 'Este pedido de prueba ya fue procesado.' });

    let payment;
    try {
        payment = await payment_provider.process_payment({ order_id, scenario: request.body.scenario });
    } catch (error) {
        if (error?.code === 'DEMO_SCENARIO_INVALID') return response.status(400).json({ error: 'Resultado de prueba inválido.' });
        throw error;
    }
    return persist_demo_payment(context, order, payment, response);
}

async function handle_demo_payment(context, request, response) {
    const { checkout_enabled, payment_provider, fail_if, database } = context;
    if (!checkout_enabled || payment_provider?.name !== 'demo' || typeof payment_provider.process_payment !== 'function') {
        return response.status(404).json({ error: 'El pago de prueba no está disponible.' });
    }
    if (request.body.card_number || request.body.cvv || request.body.expiry) {
        return response.status(400).json({ error: 'Los datos ficticios de tarjeta no deben enviarse al servidor.' });
    }
    const order_id = String(request.body.order_id || '');
    if (!/^[0-9a-f-]{36}$/i.test(order_id)) return response.status(400).json({ error: 'ID de pedido inválido.' });
    const order = fail_if(await database.from('orders').select('id,user_id,provider,status,total,currency,created_at').eq('id', order_id).eq('user_id', request.user.id).maybeSingle());
    if (!order || order.provider !== 'demo') return response.status(404).json({ error: 'Pedido de prueba no encontrado.' });
    return process_demo_payment_result(context, request, response, order);

}

async function handle_checkout_session(context, request, response) {
    const { checkout_enabled, app_base_url, database, product_brand_column, payment_provider, fail_if, checkout_mode, logger } = context;
    if (!checkout_enabled || !app_base_url) return response.status(503).json({ error: 'El pago online todavía no está disponible.' });
    const quote = await quote_cart(database, request.body.items, request.body.coupon_code, product_brand_column);
    if (quote.error) return response.status(400).json({ error: quote.error });
    if (request.body.coupon_code && !quote.coupon) return response.status(409).json({ error: 'Cupón inválido.' });
    if (!quote.items.length || quote.total <= 0) return response.status(409).json({ error: 'No hay productos disponibles para pagar.' });

    const order_id = randomUUID();
    const order = commercial_order_snapshot(order_id, request, payment_provider, quote);
    fail_if(await database.from('orders').insert(order));
    return request_commercial_preference(context, request, response, quote, order_id);
}

// Snapshot comercial separado: el checkout académico nunca llama estos helpers.
function commercial_order_snapshot(order_id, request, payment_provider, quote) {
    return {
        ...commercial_order_identity(order_id, request, payment_provider),
        ...commercial_order_totals(quote),
        items: quote.items.map(item => ({ id: item.id, brand: item.brand, name: item.name, size_ml: item.size_ml, price: item.price, quantity: item.quantity })),
        paid_at: null
    };
}
function commercial_order_identity(order_id, request, payment_provider) {
    return { id: order_id, user_id: request.user.id, provider: payment_provider.name,
        provider_preference_id: null, provider_payment_id: null, status: 'created',
        status_detail: null, currency: 'ARS' };
}
function commercial_order_totals(quote) {
    return { subtotal: quote.subtotal, discount: quote.discount, total: quote.total,
        coupon_id: quote.coupon?.id || null, coupon_code: quote.coupon?.code || null,
        coupon_percent: quote.coupon?.discount_percent || null };
}

async function register_demo_account(context, request, response, name, email, password) {
    const { database, create_auth_client, production, logger, fail_if } = context;
    const created = await database.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { name } });
    if (created.error || !created.data?.user) return response.status(400).json({ error: 'No se pudo crear la cuenta con esos datos.' });
    fail_if(await database.from('profiles').upsert({ id: created.data.user.id, name, role: 'customer' }, { onConflict: 'id', ignoreDuplicates: true }));
    const auth = create_auth_client();
    const signed_in = await auth.auth.signInWithPassword({ email, password });
    if (signed_in.error || !signed_in.data?.session || !signed_in.data?.user) {
        logger.error?.('La cuenta demo se creó pero no pudo iniciar sesión.', { kind: error_kind(signed_in.error) });
        return response.status(503).json({ error: 'La cuenta se creó, pero no pudimos iniciar la sesión. Probá ingresar nuevamente.' });
    }
    session(response, signed_in.data.session, production);
    return response.status(201).json({ message: 'Cuenta demo creada. Ya podés usar DREAMS.', authenticated: true, demo: true, user: { id: created.data.user.id, name, email, is_admin: false } });
}

// Valida access token y renueva con cliente aislado antes de confiar en el usuario.
async function resolve_session_user(cookies, response, context) {
    const { database, create_auth_client, production } = context;
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
    return { user, token };
}

async function restore_request_session(context, request, response, next) {
    const { database, create_auth_client, production, profile_for, logger } = context;
    try {
        const cookies = parse_cookie_header(request.headers.cookie);
        const { user, token } = await resolve_session_user(cookies, response, context);
        if (!user) return next();
        const profile = await profile_for(user);
        request.access_token = token;
        request.user = { id: user.id, name: profile?.name || user.email, email: user.email, is_admin: profile?.role === 'admin' };
        next();
    } catch (error) {
        logger.warn?.('No se pudo restaurar la sesión.', { kind: error_kind(error) });
        next();
    }
}

const path = require('node:path');
const { supported_image_url } = require('../public/js/admin-image-url');
const { auth_cookie, session } = require('./auth-cookies');
const { google_routes } = require('./google-auth');
const { presentation_checkout, academic_summary } = require('./presentation-checkout');
const contacts = require('./contacts');
const { randomUUID } = require('node:crypto');
const { normalize_product_brand, product_write_payload, brand_column } = require('./product-schema');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const { rateLimit } = require('express-rate-limit');

const GENERIC_ERROR = 'No se pudo completar la operación.';
const error_kind = error => String(error?.code || error?.name || 'unknown').slice(0, 80);
const normalize_email = value => String(value || '').trim().toLowerCase();
const valid_email = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
const delay = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const unsafe_methods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const IMAGE_URL_ERROR = 'La URL ingresada no apunta a una imagen válida o el servidor no permite mostrarla. Usá una URL HTTPS directa.';

function validate_product_image_url(value) {
    return supported_image_url(value) ? null : IMAGE_URL_ERROR;
}

function normalize_origin(value) {
    try {
        const parsed = new URL(String(value || '').trim());
        if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) return null;
        return parsed.origin;
    } catch (error) {
        return null;
    }
}

function allowed_origin_set(value) {
    const entries = Array.isArray(value) ? value : String(value || '').split(',');
    return new Set(entries.map(normalize_origin).filter(Boolean));
}

function mutation_origin_guard(configured_origins) {
    const configured = allowed_origin_set(configured_origins);
    return (request, response, next) => check_mutation_origin(configured, request, response, next);
}

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

function clear_session(response, production) {
    const suffix = `; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${production ? '; Secure' : ''}`;
    response.setHeader('Set-Cookie', [`dreams_access_token=${suffix}`, `dreams_refresh_token=${suffix}`]);
}

const parse_id = value => {
    const id = Number(value);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
};

const normalize_coupon_code = value => String(value || '').trim().toUpperCase();

function order_number(order) {
    const id = String(order?.id || '').replace(/-/g, '').toUpperCase();
    const year = new Date(order?.created_at || Date.now()).getUTCFullYear();
    return `DRM-${Number.isSafeInteger(year) ? year : new Date().getUTCFullYear()}-${id.slice(0, 12)}`;
}

function coupon_payload(value) {
    const code = normalize_coupon_code(value?.code);
    const discount_percent = Number(value?.discount_percent);
    if (!/^[A-Z0-9_-]{3,40}$/.test(code)) return { error: 'El código debe tener entre 3 y 40 caracteres: letras, números, guion o guion bajo.' };
    if (!Number.isFinite(discount_percent) || discount_percent <= 0 || discount_percent > 100) return { error: 'El porcentaje debe ser mayor que 0 y menor o igual a 100.' };
    return { data: { code, discount_percent, active: value?.active !== false } };
}

function review_payload(value) {
    const rating = Number(value?.rating);
    const comment = String(value?.comment || '').trim();
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { error: 'La puntuación debe estar entre 1 y 5.' };
    if (!comment || comment.length > 1000) return { error: 'La opinión debe tener entre 1 y 1000 caracteres.' };
    return { data: { rating, comment } };
}

function discounted_totals(subtotal, discount_percent = 0) {
    const safe_subtotal = Math.max(0, Number(subtotal) || 0);
    const safe_percent = Math.min(100, Math.max(0, Number(discount_percent) || 0));
    const discount = Math.round((safe_subtotal * safe_percent / 100) * 100) / 100;
    return { subtotal: safe_subtotal, discount, total: Math.max(0, Math.round((safe_subtotal - discount) * 100) / 100) };
}

async function resolve_coupon(database, code, subtotal) {
    const normalized = normalize_coupon_code(code);
    if (!normalized) return { ...discounted_totals(subtotal), coupon: null, coupon_error: null };
    if (!/^[A-Z0-9_-]{3,40}$/.test(normalized)) return { ...discounted_totals(subtotal), coupon: null, coupon_error: 'Cupón inválido.' };
    const result = await database.from('coupons').select('id,code,discount_percent,active,expires_at,minimum_purchase').eq('code', normalized).eq('active', true).maybeSingle();
    if (result.error) throw result.error;
    const coupon = result.data;
    const expired = coupon?.expires_at && new Date(coupon.expires_at).getTime() <= Date.now();
    const below_minimum = coupon?.minimum_purchase !== null && Number(subtotal) < Number(coupon?.minimum_purchase);
    if (!coupon || coupon.active !== true || expired || below_minimum) return { ...discounted_totals(subtotal), coupon: null, coupon_error: 'Cupón inválido.' };
    const totals = discounted_totals(subtotal, coupon.discount_percent);
    return {
        ...totals,
        coupon: { id: coupon.id, code: coupon.code, discount_percent: Number(coupon.discount_percent) },
        coupon_error: null
    };
}

const product = row => ({
    ...normalize_product_brand(row),
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
    const image_error = validate_product_image_url(value.image_url);
    if (image_error) return image_error;
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

async function quote_cart(database, items, coupon_code = '', product_brand_column = 'brand') {
    const normalized = normalize_cart_items(items);
    if (normalized.error) return normalized;
    const ids = [...normalized.quantities.keys()];
    const result = await database.from('products').select(`id,${brand_column(product_brand_column)},name,price,stock,image_url,size_ml`).in('id', ids);
    if (result.error) throw result.error;
    const products = new Map(result.data.map(item => [Number(item.id), normalize_product_brand(item)])), warnings = [], quoted = [];
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
    return { items: quoted, warnings, ...(await resolve_coupon(database, coupon_code, subtotal)) };
}

async function database_health(database, product_brand_column = 'brand', checkout_ready = false) {
    const schemas = {
        products: `id,${brand_column(product_brand_column)},name,price,stock,image_url,gender,category,featured,family,size_ml,top_notes,heart_notes,base_notes`,
        profiles: 'id,name,role', reviews: 'id,user_id,user_name,rating,comment,created_at',
        inquiries: 'id,product_id,product_name'
    };
    if (checkout_ready) Object.assign(schemas, { orders: 'id,user_id,provider,status,total,items', coupons: 'id,code,discount_percent,active' });
    await Promise.all(Object.entries(schemas).map(async ([table, columns]) => {
        const result = await execute_database_query(() => {
            const query = database.from(table).select(columns, { head: true });
            return typeof query.abortSignal === 'function' ? query.abortSignal(AbortSignal.timeout(5000)) : query;
        });
        if (result.error) throw result.error;
    }));
    return true;
}

// Configura una etapa sin alterar el orden de ejecución.
function configure_database(context) {
    const { options } = context;
    const database = options.database;
    const product_brand_column = brand_column(options.product_brand_column || 'brand');
    Object.assign(context, { database, product_brand_column });
}

// Configura una etapa sin alterar el orden de ejecución.
function require_database(context) {
    const { database } = context;
    if (!database) throw new TypeError('create_app requiere una base de datos.');
}

// Configura una etapa sin alterar el orden de ejecución.
function configure_runtime_and_contact(context) {
    const { options, database } = context;
    const production = options.production ?? process.env.NODE_ENV === 'production';
    const logger = options.logger || console;
    const create_auth_client = options.create_auth_client || (() => database);
    const configured_contact_email = normalize_email(options.contact_email || contacts.emails[1]);
    const contact_email = valid_email(configured_contact_email) ? configured_contact_email : 'contacto@example.com';
    Object.assign(context, { production, logger, create_auth_client, configured_contact_email, contact_email });
}

// Configura una etapa sin alterar el orden de ejecución.
function configure_payment_mode(context) {
    const { options } = context;
    const whatsapp_number = String(options.whatsapp_number ?? contacts.whatsapp_number).replace(/\D/g, '');
    const payment_provider = options.payment_provider || null;
    const demo_auto_confirm_email = options.demo_auto_confirm_email === true;
    const checkout_mode = ['production', 'sandbox', 'demo'].includes(payment_provider?.mode) ? payment_provider.mode : 'sandbox';
    const app_base_url = normalize_origin(options.app_base_url);
    Object.assign(context, { whatsapp_number, payment_provider, demo_auto_confirm_email, checkout_mode, app_base_url });
}

// Configura una etapa sin alterar el orden de ejecución.
function configure_checkout_and_paths(context) {
    const { payment_provider, app_base_url, options, checkout_mode, database, product_brand_column, production } = context;
    const checkout_enabled = Boolean(payment_provider?.configured && app_base_url && options.checkout_schema_ready);
    const show_test_data = checkout_mode === 'demo' || (checkout_mode === 'sandbox' && Boolean(options.show_checkout_test_data));
    const presentation = presentation_checkout({ enabled: options.presentation_checkout, signing_key: options.presentation_signing_key, quote_cart, database, product_brand_column, production });
    const public_directory = options.public_directory || path.join(__dirname, '..', 'public');
    const views_directory = options.views_directory || path.join(__dirname, '..', 'views');
    Object.assign(context, { checkout_enabled, show_test_data, presentation, public_directory, views_directory });
}

// Configura una etapa sin alterar el orden de ejecución.
function create_express_runtime(context) {
    const { production } = context;
    const app = express();
    const async_route = handler => (request, response, next) => Promise.resolve(handler(request, response, next)).catch(next);
    const content_security_policy = { directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'"], styleSrc: ["'self'", 'https://fonts.googleapis.com'], fontSrc: ["'self'", 'https://fonts.gstatic.com'], imgSrc: ["'self'", 'data:', 'https:'], connectSrc: ["'self'"], objectSrc: ["'none'"], baseUri: ["'self'"], formAction: ["'self'"], frameAncestors: ["'none'"], upgradeInsecureRequests: production ? [] : null } };
    Object.assign(context, { app, async_route, content_security_policy });
}

// Configura una etapa sin alterar el orden de ejecución.
function configure_trusted_proxy(context) {
    const { app } = context;
    app.set('trust proxy', 1);
}

// Configura una etapa sin alterar el orden de ejecución.
function install_security_headers(context) {
    const { app, content_security_policy } = context;
    app.use(helmet({ contentSecurityPolicy: content_security_policy, crossOriginEmbedderPolicy: false }));
}

// Configura una etapa sin alterar el orden de ejecución.
function install_request_logger(context) {
    const { options, app } = context;
    if (!options.disable_request_log) app.use(morgan((tokens, request, response) => `${request.method} ${request.path} ${response.statusCode}`));
}

// Configura una etapa sin alterar el orden de ejecución.
function install_body_parsers(context) {
    const { app } = context;
    app.use(express.json({ limit: '1mb' }), express.urlencoded({ extended: true, limit: '1mb' }));
}

// Configura una etapa sin alterar el orden de ejecución.
function install_mutation_origin_guard(context) {
    const { app, options } = context;
    app.use(mutation_origin_guard(options.allowed_origins));
}

// Configura una etapa sin alterar el orden de ejecución.
function install_private_no_cache(context) {
    const { app } = context;
    app.use((request, response, next) => {
        if (request.path === '/api' || request.path.startsWith('/api/') || ['/admin', '/admin.html'].includes(request.path) || /dreams_(access|refresh)_token=/.test(request.headers.cookie || '')) response.setHeader('Cache-Control', 'no-store');
        next();
    });
}

// Configura una etapa sin alterar el orden de ejecución.
function limit_auth_requests(context) {
    const { app } = context;
    app.use('/api/auth', rateLimit({ windowMs: 900000, limit: 20, standardHeaders: true, legacyHeaders: false, message: { error: 'Demasiados intentos. Probá nuevamente en unos minutos.' } }));
}

// Configura una etapa sin alterar el orden de ejecución.
function limit_inquiries(context) {
    const { app } = context;
    app.use('/api/inquiries', rateLimit({ windowMs: 900000, limit: 10, standardHeaders: true, legacyHeaders: false, message: { error: 'Demasiadas consultas. Probá nuevamente en unos minutos.' } }));
}

// Configura una etapa sin alterar el orden de ejecución.
function limit_cart_quotes(context) {
    const { app } = context;
    app.use('/api/cart', rateLimit({ windowMs: 900000, limit: 30, standardHeaders: true, legacyHeaders: false, message: { error: 'Demasiadas verificaciones del carrito. Probá nuevamente en unos minutos.' } }));
}

// Configura una etapa sin alterar el orden de ejecución.
function limit_academic_requests(context) {
    const { app } = context;
    app.use('/api/presentation', rateLimit({ windowMs: 900000, limit: 60, standardHeaders: true, legacyHeaders: false, message: { error: 'Demasiados intentos. Probá nuevamente en unos minutos.' } }));
}

// Configura una etapa sin alterar el orden de ejecución.
function limit_checkout_mutations(context) {
    const { app } = context;
    app.use('/api/checkout', rateLimit({ skip: request => !unsafe_methods.has(request.method), windowMs: 900000, limit: 15, standardHeaders: true, legacyHeaders: false, message: { error: 'Demasiados intentos de pago. Probá nuevamente en unos minutos.' } }));
}

// Configura una etapa sin alterar el orden de ejecución.
function limit_coupon_requests(context) {
    const { app } = context;
    app.use('/api/coupons', rateLimit({ windowMs: 900000, limit: 30, standardHeaders: true, legacyHeaders: false, message: { error: 'Demasiados intentos. Probá nuevamente en unos minutos.' } }));
}

// Configura una etapa sin alterar el orden de ejecución.
function limit_webhook_requests(context) {
    const { app } = context;
    app.use('/api/payments/webhook', rateLimit({ windowMs: 60000, limit: 120, standardHeaders: true, legacyHeaders: false, message: { error: 'Demasiadas notificaciones.' } }));
}

// Configura una etapa sin alterar el orden de ejecución.
function configure_review_limiter(context) {
    const review_limiter = rateLimit({ windowMs: 3600000, limit: 5, standardHeaders: true, legacyHeaders: false, message: { error: 'Publicaste varias opiniones. Probá nuevamente más tarde.' } });
    Object.assign(context, { review_limiter });
}

// Configura una etapa sin alterar el orden de ejecución.
function limit_review_publications(context) {
    const { app, review_limiter } = context;
    app.use('/api/reviews', (request, response, next) => request.method === 'POST' ? review_limiter(request, response, next) : next());
}

// Configura una etapa sin alterar el orden de ejecución.
function protect_preview_writes(context) {
    const { app, options } = context;
    app.use((request, response, next) => {
        const safe = ['/api/cart/quote', '/api/auth/google', '/api/auth/login', '/api/auth/logout', '/api/presentation/session', '/api/presentation/payment', '/api/presentation/result'];
        if (options.preview_read_only && unsafe_methods.has(request.method) && !safe.includes(request.path)) return response.status(403).json({ error: 'Esta vista de prueba permite consultas; las operaciones comerciales están protegidas.' });
        next();
    });
}

// Configura una etapa sin alterar el orden de ejecución.
function install_static_assets(context) {
    const { app, options, public_directory } = context;
    app.use(options.static_middleware || express.static(public_directory));
}

// Consulta de perfil; la autoridad proviene de profiles.role.
async function profile_for(context, user) {
    const { database } = context;
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

// Configura una etapa sin alterar el orden de ejecución.
function install_session_restoration(context) {
    const { app, async_route, database, create_auth_client, production, profile_for, logger } = context;
    app.use(async_route((request, response, next) => restore_request_session(context, request, response, next)));
}

// Configura una etapa sin alterar el orden de ejecución.
function configure_login_guard(context) {
    const login = (request, response, next) => request.user ? next() : response.status(401).json({ error: 'Necesitás iniciar sesión.' });
    Object.assign(context, { login });
}

// Configura una etapa sin alterar el orden de ejecución.
function configure_admin_guard(context) {
    const admin = (request, response, next) => request.user?.is_admin ? next() : response.status(403).json({ error: 'Acceso reservado al administrador.' });
    Object.assign(context, { admin });
}

// Configura una etapa sin alterar el orden de ejecución.
function configure_admin_database(context) {
    const { create_auth_client } = context;
    const admin_database = request => create_auth_client(request.access_token);
    Object.assign(context, { admin_database });
}

// Configura una etapa sin alterar el orden de ejecución.
function configure_async_router(context) {
    const { app, login, admin, async_route } = context;
    const route = (method, url, ...handlers) => app[method](url, ...handlers.map(handler => handler === login || handler === admin ? handler : async_route(handler)));
    Object.assign(context, { route });
}

// Configura una etapa sin alterar el orden de ejecución.
function configure_database_result_guard(context) {
    const fail_if = result => { if (result.error) throw result.error; return result.data; };
    Object.assign(context, { fail_if });
}

// Configura una etapa sin alterar el orden de ejecución.
function install_academic_checkout(context) {
    const { presentation, app, route } = context;
    presentation.install(app, route);
}

// Configura una etapa sin alterar el orden de ejecución.
function install_google_access(context) {
    const { app, options, app_base_url, production, profile_for, logger } = context;
    google_routes(app, { create_oauth_client: options.create_oauth_client, provider_enabled: async () => options.google_access_ready === true && await (options.google_provider_enabled || (async () => false))(), app_base_url, production, profile_for, logger });
}

// Registra api_auth_google_config con su autorización existente.
function install_api_auth_google_config(context) {
    const { route, options, app_base_url } = context;
    route('get', '/api/auth/google/config', async (request, response) => response.json({ enabled: Boolean(options.google_access_ready === true && options.create_oauth_client && app_base_url && await (options.google_provider_enabled || (async () => false))()) }));
}

// Registra api_config con su autorización existente.
function install_api_config(context) {
    const { route, whatsapp_number, contact_email, demo_auto_confirm_email, options } = context;
    route('get', '/api/config', async (request, response) => response.json({ whatsapp_number, contact_email, contacts, app_name: 'DREAMS', demo_auto_confirm_email, preview_read_only: options.preview_read_only === true }));
}

// Registra api_checkout_config con su autorización existente.
function install_api_checkout_config(context) {
    const { route, presentation, checkout_enabled, payment_provider, checkout_mode, show_test_data } = context;
    route('get', '/api/checkout/config', async (request, response) => response.json({ enabled: presentation.ready || checkout_enabled, provider: presentation.ready ? 'presentation_demo' : checkout_enabled ? payment_provider.name : null, mode: presentation.ready ? 'demo' : checkout_mode, show_test_data: presentation.ready || show_test_data }));
}

// Registra api_products con su autorización existente.
function install_api_products(context) {
    const { route, database, product_brand_column, fail_if } = context;
    route('get', '/api/products', async (request, response) => {
        const search = String(request.query.search || '').trim().replace(/[^\p{L}\p{N}\s'-]/gu, '').slice(0, 80);
        const sort = String(request.query.sort || 'featured');
        const result = await execute_database_query(() => {
            let query = database.from('products').select('*');
            for (const key of ['brand', 'gender', 'category']) if (request.query[key]) query = query.eq(key === 'brand' ? product_brand_column : key, String(request.query[key]).slice(0, 60));
            if (+request.query.max_price > 0) query = query.lte('price', +request.query.max_price);
            if (search) query = query.or(`name.ilike.%${search}%,${product_brand_column}.ilike.%${search}%,family.ilike.%${search}%`);
            query = sort === 'price_asc' ? query.order('price') : sort === 'price_desc' ? query.order('price', { ascending: false }) : sort === 'name' ? query.order('name') : query.order('featured', { ascending: false }).order('id', { ascending: false });
            const limit = parse_id(request.query.limit);
            return limit ? query.limit(Math.min(limit, 100)) : query;
        });
        response.json(fail_if(result).map(product));
    });
}

// Registra api_products_id con su autorización existente.
function install_api_products_id(context) {
    const { route, fail_if, database } = context;
    route('get', '/api/products/:id', async (request, response) => {
        const id = parse_id(request.params.id);
        if (!id) return response.status(400).json({ error: 'ID de producto inválido.' });
        const data = fail_if(await execute_database_query(() => database.from('products').select('*').eq('id', id).maybeSingle()));
        return data ? response.json(product(data)) : response.status(404).json({ error: 'Perfume no encontrado.' });
    });
}

// Registra api_brands con su autorización existente.
function install_api_brands(context) {
    const { route, fail_if, database, product_brand_column } = context;
    route('get', '/api/brands', async (request, response) => response.json([...new Set(fail_if(await execute_database_query(() => database.from('products').select(product_brand_column).order(product_brand_column))).map(item => normalize_product_brand(item).brand))]));
}

// Registra api_auth_register con su autorización existente.
function install_api_auth_register(context) {
    const { route, demo_auto_confirm_email, database, admin, fail_if, create_auth_client, logger, production, options } = context;
    route('post', '/api/auth/register', async (request, response) => {
        const name = String(request.body.name || '').trim().slice(0, 80), email = normalize_email(request.body.email), password = String(request.body.password || '');
        if (!name || !valid_email(email) || password.length < 8 || password.length > 128) return response.status(400).json({ error: 'Completá un nombre, correo válido y una contraseña de 8 a 128 caracteres.' });
        if (demo_auto_confirm_email) return register_demo_account(context, request, response, name, email, password);
        const result = await create_auth_client().auth.signUp({ email, password, options: { data: { name } } });
        if (result.error) return response.status(400).json({ error: 'No se pudo crear la cuenta con esos datos.' });
        if (result.data.user) fail_if(await database.from('profiles').upsert({ id: result.data.user.id, name, role: 'customer' }, { onConflict: 'id', ignoreDuplicates: true }));
        if (result.data.session) {
            session(response, result.data.session, production);
            return response.json({ message: 'Cuenta creada correctamente.', authenticated: true, user: { id: result.data.user.id, name, email, is_admin: false } });
        }
        response.status(202).json({ message: 'Te enviamos un correo de confirmación. Abrilo antes de iniciar sesión.', authenticated: false, requires_email_confirmation: true });
    });
}

// Registra api_auth_login con su autorización existente.
function install_api_auth_login(context) {
    const { route, create_auth_client, demo_auto_confirm_email, profile_for, production } = context;
    route('post', '/api/auth/login', async (request, response) => {
        const email = normalize_email(request.body.email), password = String(request.body.password || '');
        if (!valid_email(email) || !password || password.length > 128) return response.status(400).json({ error: 'Ingresá un correo válido y tu contraseña.' });
        const result = await create_auth_client().auth.signInWithPassword({ email, password });
        if (result.error || !result.data.session || !result.data.user) {
            const confirmation_required = !demo_auto_confirm_email && result.error?.code === 'email_not_confirmed';
            return response.status(401).json({ error: confirmation_required ? 'Primero confirmá tu cuenta desde el correo que te enviamos.' : 'Correo o contraseña incorrectos.' });
        }
        const profile = await profile_for(result.data.user);
        session(response, result.data.session, production);
        const user = { id: result.data.user.id, name: profile?.name || email, email, is_admin: profile?.role === 'admin' };
        response.json({ message: 'Sesión iniciada.', authenticated: true, redirect: user.is_admin ? '/admin' : '/cuenta.html', user });
    });
}

// Registra api_auth_logout con su autorización existente.
function install_api_auth_logout(context) {
    const { route, create_auth_client, admin, logger, production } = context;
    route('post', '/api/auth/logout', async (request, response) => {
        if (request.access_token) {
            const result = await create_auth_client().auth.admin.signOut(request.access_token, 'local');
            if (result.error) logger.warn?.('No se pudo revocar la sesión remota.', { kind: error_kind(result.error) });
        }
        clear_session(response, production);
        response.json({ message: 'Sesión cerrada.' });
    });
}

// Registra api_auth_me con su autorización existente.
function install_api_auth_me(context) {
    const { route } = context;
    route('get', '/api/auth/me', async (request, response) => response.json({ user: request.user || null }));
}

// Registra api_reviews con su autorización existente.
function install_api_reviews_get(context) {
    const { route, fail_if, database } = context;
    route('get', '/api/reviews', async (request, response) => response.json(fail_if(await execute_database_query(() => database.from('reviews').select('id,user_name,rating,comment,created_at').order('id', { ascending: false })))));
}

// Registra api_reviews con su autorización existente.
function install_api_reviews_post(context) {
    const { route, login, fail_if, database } = context;
    route('post', '/api/reviews', login, async (request, response) => {
        const rating = +request.body.rating, comment = String(request.body.comment || '').trim().slice(0, 1000);
        if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !comment) return response.status(400).json({ error: 'Completá una puntuación y una opinión.' });
        fail_if(await database.from('reviews').insert({ user_id: request.user.id, user_name: request.user.name, rating, comment }));
        response.status(201).json({ message: 'Opinión publicada.' });
    });
}

// Registra api_cart_quote con su autorización existente.
function install_api_cart_quote(context) {
    const { route, database, presentation, product_brand_column, whatsapp_number } = context;
    route('post', '/api/cart/quote', async (request, response) => {
        const quote = await quote_cart(database, request.body.items, presentation.ready ? '' : request.body.coupon_code, product_brand_column);
        if (quote.error) return response.status(400).json({ error: quote.error });
        const lines = quote.items.map(item => `${item.quantity} × ${item.brand} ${item.name} — ${item.price * item.quantity} ARS`);
        const summary = presentation.ready ? academic_summary(quote.subtotal) : null;
        const text = ['Hola DREAMS, quiero consultar por este carrito:', ...lines, summary ? `Total: ${summary.total} ARS. ${summary.shipping_label}.` : `Subtotal de productos: ${quote.total} ARS. Envío a consultar, no incluido.`].join('\n');
        response.json({ ...quote, ...(summary || {}), whatsapp_url: quote.items.length && /^\d{8,15}$/.test(whatsapp_number) ? `https://wa.me/${whatsapp_number}?text=${encodeURIComponent(text)}` : null });
    });
}

// Registra api_coupons_validate con su autorización existente.
function install_api_coupons_validate(context) {
    const { route, database, product_brand_column } = context;
    route('post', '/api/coupons/validate', async (request, response) => {
        const quote = await quote_cart(database, request.body.items, request.body.code, product_brand_column);
        if (quote.error) return response.status(400).json({ error: quote.error });
        if (!quote.coupon) return response.status(404).json({ error: 'Cupón inválido.', subtotal: quote.subtotal, discount: 0, total: quote.total });
        response.json({ coupon: quote.coupon, subtotal: quote.subtotal, discount: quote.discount, total: quote.total });
    });
}

// Registra api_checkout_session con su autorización existente.
function install_api_checkout_session(context) {
    const { route, login, checkout_enabled, app_base_url, database, product_brand_column, payment_provider, fail_if, checkout_mode, logger } = context;
    route('post', '/api/checkout/session', login, (request, response) => handle_checkout_session(context, request, response));
}

// Registra api_checkout_demo_payment con su autorización existente.
function install_api_checkout_demo_payment(context) {
    const { route, login, checkout_enabled, payment_provider, fail_if, database } = context;
    route('post', '/api/checkout/demo-payment', login, (request, response) => handle_demo_payment(context, request, response));
}

// Registra api_checkout_confirm con su autorización existente.
function install_api_checkout_confirm(context) {
    const { route, login, checkout_enabled, payment_provider, fail_if, database, checkout_mode } = context;
    route('post', '/api/checkout/confirm', login, async (request, response) => {
        if (!checkout_enabled || payment_provider?.name !== 'mercado_pago') return response.status(503).json({ error: 'La confirmación de Mercado Pago no está disponible.' });
        const order_id = String(request.body.order_id || '');
        const payment_id = String(request.body.payment_id || '');
        if (!/^[0-9a-f-]{36}$/i.test(order_id) || !/^\d{1,30}$/.test(payment_id)) return response.status(400).json({ error: 'Datos de pago inválidos.' });
        const order = fail_if(await database.from('orders').select('*').eq('id', order_id).eq('user_id', request.user.id).maybeSingle());
        if (!order) return response.status(404).json({ error: 'Pedido no encontrado.' });
        const payment = await payment_provider.get_payment(payment_id);
        if (payment.order_id !== order.id || payment.currency !== order.currency || payment.amount !== Number(order.total) || (checkout_mode === 'sandbox' && payment.live_mode)) {
            return response.status(409).json({ error: 'El pago recibido no coincide con el pedido.' });
        }
        fail_if(await database.from('orders').update({ provider_payment_id: payment.id, status: payment.status, status_detail: payment.status_detail, paid_at: payment.status === 'approved' ? payment.paid_at : null }).eq('id', order.id));
        response.json({ order_id: order.id, order_number: order_number(order), status: payment.status, status_detail: payment.status_detail });
    });
}

// Registra api_orders_id con su autorización existente.
function install_api_orders_id(context) {
    const { route, login, fail_if, database } = context;
    route('get', '/api/orders/:id', login, async (request, response) => {
        const order_id = String(request.params.id || '');
        if (!/^[0-9a-f-]{36}$/i.test(order_id)) return response.status(400).json({ error: 'ID de pedido inválido.' });
        const order = fail_if(await database.from('orders').select('id,status,status_detail,currency,total,items,created_at,paid_at').eq('id', order_id).eq('user_id', request.user.id).maybeSingle());
        return order ? response.json({ ...order, order_number: order_number(order) }) : response.status(404).json({ error: 'Pedido no encontrado.' });
    });
}

// Registra api_payments_webhook con su autorización existente.
function install_api_payments_webhook(context) {
    const { route, checkout_enabled, payment_provider, fail_if, database, checkout_mode } = context;
    route('post', '/api/payments/webhook', async (request, response) => {
        if (!checkout_enabled || payment_provider?.name !== 'mercado_pago' || request.body?.type !== 'payment') return response.status(200).json({ received: true });
        const payment_id = String(request.body?.data?.id || request.query['data.id'] || '');
        if (!/^\d{1,30}$/.test(payment_id) || !payment_provider.verify_webhook(request.headers, payment_id)) return response.status(401).json({ error: 'Notificación no válida.' });
        const payment = await payment_provider.get_payment(payment_id);
        if (!/^[0-9a-f-]{36}$/i.test(payment.order_id)) return response.status(200).json({ received: true });
        const order = fail_if(await database.from('orders').select('id,total,currency').eq('id', payment.order_id).maybeSingle());
        if (!order || payment.currency !== order.currency || payment.amount !== Number(order.total) || (checkout_mode === 'sandbox' && payment.live_mode)) return response.status(200).json({ received: true });
        fail_if(await database.from('orders').update({ provider_payment_id: payment.id, status: payment.status, status_detail: payment.status_detail, paid_at: payment.status === 'approved' ? payment.paid_at : null }).eq('id', order.id));
        response.json({ received: true });
    });
}

// Registra api_inquiries con su autorización existente.
function install_api_inquiries(context) {
    const { route, fail_if, database, whatsapp_number } = context;
    route('post', '/api/inquiries', async (request, response) => {
        const id = parse_id(request.body.product_id);
        if (!id) return response.status(400).json({ error: 'ID de producto inválido.' });
        const found = fail_if(await database.from('products').select('id,name').eq('id', id).maybeSingle());
        if (!found) return response.status(404).json({ error: 'Producto no encontrado.' });
        fail_if(await database.from('inquiries').insert({ user_id: request.user?.id || null, product_id: found.id, product_name: found.name, user_name: request.user?.name || null, user_email: request.user?.email || null }));
        response.json({ message: 'Consulta registrada.', whatsapp_url: `https://wa.me/${whatsapp_number}?text=${encodeURIComponent(`Hola DREAMS, quiero consultar por ${found.name}. ¿Está disponible?`)}` });
    });
}

// Registra api_admin_stats con su autorización existente.
function install_api_admin_stats(context) {
    const { route, admin, admin_database } = context;
    route('get', '/api/admin/stats', admin, async (request, response) => {
        const db = admin_database(request);
        const tables = ['products', 'profiles', 'inquiries', 'reviews'];
        const counts = await Promise.all(tables.map(async table => { const result = await db.from(table).select('*', { count: 'exact', head: true }); if (result.error) throw result.error; return result.count || 0; }));
        const orders = await db.from('orders').select('*', { count: 'exact', head: true });
        if (orders.error) throw orders.error;
        const low = await db.from('products').select('*', { count: 'exact', head: true }).lte('stock', 2);
        if (low.error) throw low.error;
        response.json({ products: counts[0], users: counts[1], inquiries: counts[2], reviews: counts[3], orders: orders.count || 0, low_stock: low.count || 0 });
    });
}

// Registra api_admin_products con su autorización existente.
function install_api_admin_products_get(context) {
    const { route, admin, fail_if, admin_database } = context;
    route('get', '/api/admin/products', admin, async (request, response) => response.json(fail_if(await admin_database(request).from('products').select('*').order('id', { ascending: false })).map(product)));
}

// Registra api_admin_products con su autorización existente.
function install_api_admin_products_post(context) {
    const { route, admin, fail_if, admin_database, product_brand_column } = context;
    route('post', '/api/admin/products', admin, async (request, response) => {
        const parsed = payload(request.body);
        if (parsed.e) return response.status(400).json({ error: parsed.e });
        response.status(201).json(product(fail_if(await admin_database(request).from('products').insert(product_write_payload(parsed.o, product_brand_column)).select().single())));
    });
}

// Registra api_admin_products_id con su autorización existente.
function install_api_admin_products_id_put(context) {
    const { route, admin, admin_database, fail_if, product_brand_column } = context;
    route('put', '/api/admin/products/:id', admin, async (request, response) => {
        const id = parse_id(request.params.id);
        if (!id) return response.status(400).json({ error: 'ID de producto inválido.' });
        const parsed = payload(request.body);
        if (parsed.e) return response.status(400).json({ error: parsed.e });
        const db = admin_database(request);
        const existing = fail_if(await db.from('products').select('id').eq('id', id).maybeSingle());
        if (!existing) return response.status(404).json({ error: 'Producto no encontrado.' });
        const data = fail_if(await db.from('products').update(product_write_payload(parsed.o, product_brand_column)).eq('id', id).select().maybeSingle());
        return data ? response.json(product(data)) : response.status(503).json({ error: 'El producto existe, pero no pudo actualizarse por la configuración de permisos.' });
    });
}

// Registra api_admin_products_id con su autorización existente.
function install_api_admin_products_id_delete(context) {
    const { route, admin, admin_database, fail_if } = context;
    route('delete', '/api/admin/products/:id', admin, async (request, response) => {
        const id = parse_id(request.params.id);
        if (!id) return response.status(400).json({ error: 'ID de producto inválido.' });
        const db = admin_database(request);
        const existing = fail_if(await db.from('products').select('id').eq('id', id).maybeSingle());
        if (!existing) return response.status(404).json({ error: 'Producto no encontrado.' });
        const data = fail_if(await db.from('products').delete().eq('id', id).select('id').maybeSingle());
        return data ? response.json({ message: 'Producto eliminado.' }) : response.status(503).json({ error: 'El producto existe, pero no pudo eliminarse por la configuración de permisos.' });
    });
}

// Registra api_admin_users con su autorización existente.
function install_api_admin_users(context) {
    const { route, admin, fail_if, admin_database } = context;
    route('get', '/api/admin/users', admin, async (request, response) => response.json(fail_if(await admin_database(request).from('profiles').select('id,name,role,created_at').order('created_at', { ascending: false })).map(value => ({ ...value, email: null, is_admin: value.role === 'admin' }))));
}

// Registra api_admin_inquiries con su autorización existente.
function install_api_admin_inquiries(context) {
    const { route, admin, fail_if, admin_database, product_brand_column } = context;
    route('get', '/api/admin/inquiries', admin, async (request, response) => response.json(fail_if(await admin_database(request).from('inquiries').select(`*,products(${product_brand_column},name)`).order('id', { ascending: false }).limit(100)).map(value => ({ ...value, brand: value.products ? normalize_product_brand(value.products).brand : null, name: value.products?.name || value.product_name }))));
}

// Registra api_admin_reviews con su autorización existente.
function install_api_admin_reviews(context) {
    const { route, admin, fail_if, admin_database } = context;
    route('get', '/api/admin/reviews', admin, async (request, response) => response.json(fail_if(await admin_database(request).from('reviews').select('*').order('id', { ascending: false }))));
}

// Registra api_admin_reviews_id con su autorización existente.
function install_api_admin_reviews_id_put(context) {
    const { route, admin, fail_if, admin_database } = context;
    route('put', '/api/admin/reviews/:id', admin, async (request, response) => {
        const id = parse_id(request.params.id);
        if (!id) return response.status(400).json({ error: 'ID de opinión inválido.' });
        const parsed = review_payload(request.body);
        if (parsed.error) return response.status(400).json({ error: parsed.error });
        const updated = fail_if(await admin_database(request).from('reviews').update(parsed.data).eq('id', id).select('*').maybeSingle());
        return updated ? response.json(updated) : response.status(404).json({ error: 'Opinión no encontrada.' });
    });
}

// Registra api_admin_reviews_id con su autorización existente.
function install_api_admin_reviews_id_delete(context) {
    const { route, admin, fail_if, admin_database } = context;
    route('delete', '/api/admin/reviews/:id', admin, async (request, response) => {
        const id = parse_id(request.params.id);
        if (!id) return response.status(400).json({ error: 'ID de opinión inválido.' });
        const deleted = fail_if(await admin_database(request).from('reviews').delete().eq('id', id).select('id').maybeSingle());
        return deleted ? response.json({ message: 'Opinión eliminada.' }) : response.status(404).json({ error: 'Opinión no encontrada.' });
    });
}

// Registra api_admin_orders con su autorización existente.
function install_api_admin_orders(context) {
    const { route, admin, fail_if, admin_database } = context;
    route('get', '/api/admin/orders', admin, async (request, response) => response.json(fail_if(await admin_database(request).from('orders').select('id,user_id,provider,status,status_detail,currency,subtotal,discount,total,coupon_code,items,created_at,paid_at').order('created_at', { ascending: false }).limit(100)).map(value => ({ ...value, order_number: order_number(value) }))));
}

// Registra api_admin_coupons con su autorización existente.
function install_api_admin_coupons_get(context) {
    const { route, admin, fail_if, admin_database } = context;
    route('get', '/api/admin/coupons', admin, async (request, response) => response.json(fail_if(await admin_database(request).from('coupons').select('id,code,discount_percent,active,created_at,updated_at').order('created_at', { ascending: false }))));
}

// Registra api_admin_coupons con su autorización existente.
function install_api_admin_coupons_post(context) {
    const { route, admin, admin_database, fail_if } = context;
    route('post', '/api/admin/coupons', admin, async (request, response) => {
        const parsed = coupon_payload(request.body);
        if (parsed.error) return response.status(400).json({ error: parsed.error });
        const db = admin_database(request);
        const existing = fail_if(await db.from('coupons').select('id').eq('code', parsed.data.code).maybeSingle());
        if (existing) return response.status(409).json({ error: 'Ya existe un cupón con ese código.' });
        const created = fail_if(await db.from('coupons').insert(parsed.data).select('id,code,discount_percent,active,created_at,updated_at').single());
        response.status(201).json(created);
    });
}

// Registra api_admin_coupons_id con su autorización existente.
function install_api_admin_coupons_id_put(context) {
    const { route, admin, admin_database, fail_if } = context;
    route('put', '/api/admin/coupons/:id', admin, async (request, response) => {
        const id = parse_id(request.params.id);
        if (!id) return response.status(400).json({ error: 'ID de cupón inválido.' });
        const parsed = coupon_payload(request.body);
        if (parsed.error) return response.status(400).json({ error: parsed.error });
        const db = admin_database(request);
        const existing = fail_if(await db.from('coupons').select('id').eq('code', parsed.data.code).neq('id', id).maybeSingle());
        if (existing) return response.status(409).json({ error: 'Ya existe un cupón con ese código.' });
        const updated = fail_if(await db.from('coupons').update(parsed.data).eq('id', id).select('id,code,discount_percent,active,created_at,updated_at').maybeSingle());
        return updated ? response.json(updated) : response.status(404).json({ error: 'Cupón no encontrado.' });
    });
}

// Registra api_admin_coupons_id con su autorización existente.
function install_api_admin_coupons_id_delete(context) {
    const { route, admin, fail_if, admin_database } = context;
    route('delete', '/api/admin/coupons/:id', admin, async (request, response) => {
        const id = parse_id(request.params.id);
        if (!id) return response.status(400).json({ error: 'ID de cupón inválido.' });
        const deleted = fail_if(await admin_database(request).from('coupons').delete().eq('id', id).select('id').maybeSingle());
        return deleted ? response.json({ message: 'Cupón eliminado.' }) : response.status(404).json({ error: 'Cupón no encontrado.' });
    });
}

// Registra js_admin_console_v3_js con su autorización existente.
function install_js_admin_console_v3_js_67(context) {
    const { route, options, public_directory } = context;
    route('get', '/js/admin-console-v3.js', async (request, response) => options.admin_script ? response.type('application/javascript').send(options.admin_script) : response.sendFile(path.join(public_directory, 'js', 'admin.js')));
}

// Registra private_pages con su autorización existente.
function install_private_pages_get_admin(context) {
    const { route, admin, options, views_directory } = context;
    route('get', ['/admin', '/admin.html'], admin, async (request, response) => options.admin_html ? response.type('html').send(options.admin_html) : response.sendFile(path.join(views_directory, 'admin.html')));
}

// Registra private_pages con su autorización existente.
function install_private_pages_get_favoritos(context) {
    const { route } = context;
    route('get', ['/favoritos', '/favoritos.html'], async (request, response) => response.redirect(301, '/catalogo.html'));
}

// Registra api_health con su autorización existente.
function install_api_health(context) {
    const { route, database, product_brand_column, options, logger } = context;
    route('get', '/api/health', async (request, response) => {
        try {
            await database_health(database, product_brand_column, options.checkout_schema_ready === true);
            response.json({ status: 'ok', api: true, database: 'ok' });
        } catch (error) {
            logger.error?.('Healthcheck de Supabase falló.', { kind: error_kind(error) });
            response.status(503).json({ status: 'unavailable', api: true, database: 'unavailable' });
        }
    });
}

// Configura una etapa sin alterar el orden de ejecución.
function install_not_found(context) {
    const { app, options, public_directory } = context;
    app.use((request, response) => request.path.startsWith('/api/')
    ? response.status(404).json({ error: 'Ruta API no encontrada.' })
    : options.not_found_html ? response.status(404).type('html').send(options.not_found_html) : response.status(404).sendFile(path.join(public_directory, '404.html')));
}

// Configura una etapa sin alterar el orden de ejecución.
function install_error_handler(context) {
    const { app, logger } = context;
    app.use((error, request, response, next) => {
        if (response.headersSent) return next(error);
        logger.error?.('Error inesperado de API.', { method: request.method, path: request.path, kind: error_kind(error) });
        response.status(500).json({ error: GENERIC_ERROR });
    });
}

function install_profile_factory(context) {
    context.profile_for = user => profile_for(context, user);
}
// Orquesta etapas ordenadas; cada petición conserva sus verificaciones y contratos.
function create_app(options = {}) {
    const context = { options };
    app_stages.forEach(stage => stage(context));
    return context.app;
}

const app_stages = [
    configure_database,
    require_database,
    configure_runtime_and_contact,
    configure_payment_mode,
    configure_checkout_and_paths,
    create_express_runtime,
    configure_trusted_proxy,
    install_security_headers,
    install_request_logger,
    install_body_parsers,
    install_mutation_origin_guard,
    install_private_no_cache,
    limit_auth_requests,
    limit_inquiries,
    limit_cart_quotes,
    limit_academic_requests,
    limit_checkout_mutations,
    limit_coupon_requests,
    limit_webhook_requests,
    configure_review_limiter,
    limit_review_publications,
    protect_preview_writes,
    install_static_assets,
    install_profile_factory,
    install_session_restoration,
    configure_login_guard,
    configure_admin_guard,
    configure_admin_database,
    configure_async_router,
    configure_database_result_guard,
    install_academic_checkout,
    install_google_access,
    install_api_auth_google_config,
    install_api_config,
    install_api_checkout_config,
    install_api_products,
    install_api_products_id,
    install_api_brands,
    install_api_auth_register,
    install_api_auth_login,
    install_api_auth_logout,
    install_api_auth_me,
    install_api_reviews_get,
    install_api_reviews_post,
    install_api_cart_quote,
    install_api_coupons_validate,
    install_api_checkout_session,
    install_api_checkout_demo_payment,
    install_api_checkout_confirm,
    install_api_orders_id,
    install_api_payments_webhook,
    install_api_inquiries,
    install_api_admin_stats,
    install_api_admin_products_get,
    install_api_admin_products_post,
    install_api_admin_products_id_put,
    install_api_admin_products_id_delete,
    install_api_admin_users,
    install_api_admin_inquiries,
    install_api_admin_reviews,
    install_api_admin_reviews_id_put,
    install_api_admin_reviews_id_delete,
    install_api_admin_orders,
    install_api_admin_coupons_get,
    install_api_admin_coupons_post,
    install_api_admin_coupons_id_put,
    install_api_admin_coupons_id_delete,
    install_js_admin_console_v3_js_67,
    install_private_pages_get_admin,
    install_private_pages_get_favoritos,
    install_api_health,
    install_not_found,
    install_error_handler,
];


module.exports = { create_app, validate, validate_product_image_url, IMAGE_URL_ERROR, payload, coupon_payload, review_payload, normalize_coupon_code, discounted_totals, resolve_coupon, order_number, database_health, auth_cookie, session, parse_id, normalize_cart_items, quote_cart, execute_database_query, normalize_origin, allowed_origin_set, mutation_origin_guard, GENERIC_ERROR };
