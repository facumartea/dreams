// herramientas privadas de pruebas autorizadas; no son rutas publicas ni se activan por defecto.
import { createHmac, randomUUID } from 'node:crypto';
import { create_official_database } from './official-client.mjs';
import { diagnose_supabase } from './supabase-diagnostic.mjs';
const origin = 'https://dreams-perfumes.pages.dev';
let active_run;
const phase_names = ['registration_sessions', 'cart_isolation', 'review_ownership', 'academic_compatibility', 'admin_modules', 'admin_persistence', 'admin_stock_featured', 'admin_coupons', 'admin_moderation'];

function comprobar_resultado(context, id, condition, details = {}) {
    context.checks.push({ id, result: condition ? 'PASS' : 'FAIL', ...details });
    if (!condition) throw new Error(id);
}

function usuario_para(env, run, label) {
    return { label, qa_run: run, cookies: new Map(), email: `qa-dreams-${run}-${label}@example.com`,
        password: createHmac('sha256', env.SUPABASE_SECRET_KEY).update(`qa:${run}:${label}`).digest('base64url') + '!Aa1' };
}

async function hacer_llamada(context, actor, method, path, body) {
    const headers = new Headers({ Origin: origin, 'cf-connecting-ip': actor?.label === 'a' ? '192.0.2.56' : actor?.label === 'b' ? '192.0.2.57' : actor?.label === 'admin' ? '192.0.2.58' : '192.0.2.59' });
    if (actor) headers.set('Cookie', [...actor.cookies].map(([key, value]) => `${key}=${value}`).join('; '));
    const payload = body === undefined ? undefined : JSON.stringify(body);
    if (payload !== undefined) {
        headers.set('Content-Type', 'application/json');
        // la llamada interna evita la red: express necesita esta longitud explicita.
        headers.set('Content-Length', String(new TextEncoder().encode(payload).length));
    }
    const response = await context.dispatch(new Request(origin + path, { method, headers,
        ...(payload === undefined ? {} : { body: payload }), signal: AbortSignal.timeout(20000) }));
    const set = response.headers.getSetCookie();
    if (actor && set.length) {
        comprobar_resultado(context, `${actor.label}-secure-cookies`, set.every(c => /; HttpOnly/i.test(c) && /; Secure/i.test(c) && /; SameSite=Lax/i.test(c)));
        for (const cookie of set) {
            const pair = cookie.split(';')[0], split = pair.indexOf('=');
            actor.cookies.set(pair.slice(0, split), pair.slice(split + 1));
        }
    }
    const data = response.headers.get('Content-Type')?.includes('application/json') ? await response.json() : await response.text();
    return { status: response.status, data };
}

async function hacer_peticion(context, actor, id, method, path, body, status = 200) {
    const result = await hacer_llamada(context, actor, method, path, body);
    comprobar_resultado(context, id, result.status === status, { observed_status: result.status, expected_status: status });
    return result.data;
}

async function registrar(context, actor) {
    const data = await hacer_peticion(context, actor, `${actor.label}-registration`, 'POST', '/api/auth/register',
        { name: prueba_nombre(actor.qa_run || context.run, actor.label), email: actor.email, password: actor.password });
    comprobar_resultado(context, `${actor.label}-registration-session`, data.authenticated === true && data.user?.is_admin === false && Boolean(data.user?.id));
    actor.id = data.user.id;
    const profile = await context.db.from('profiles').select('role').eq('id', actor.id).single();
    comprobar_resultado(context, `${actor.label}-customer-profile`, !profile.error && profile.data?.role === 'customer');
}

async function sesiones(context, a, b) {
    await hacer_peticion(context, a, 'logout-real', 'POST', '/api/auth/logout', {});
    const anonymous = await hacer_peticion(context, a, 'logout-session-read', 'GET', '/api/auth/me');
    comprobar_resultado(context, 'logout-cleared-session', anonymous.user === null);
    const login = await hacer_peticion(context, a, 'login-real', 'POST', '/api/auth/login', { email: a.email, password: a.password });
    comprobar_resultado(context, 'login-same-user', login.user?.id === a.id);
    await hacer_peticion(context, null, 'wrong-password', 'POST', '/api/auth/login', { email: b.email, password: b.password + 'wrong' }, 401);
    a.cookies.set('dreams_access_token', 'expired-qa-token');
    const refreshed = await hacer_peticion(context, a, 'refresh-real', 'GET', '/api/auth/me');
    comprobar_resultado(context, 'refresh-same-user', refreshed.user?.id === a.id && a.cookies.get('dreams_access_token') !== 'expired-qa-token');
    const reloaded = await hacer_peticion(context, a, 'session-reload', 'GET', '/api/auth/me');
    comprobar_resultado(context, 'session-persisted', reloaded.user?.id === a.id);
    await hacer_peticion(context, null, 'anonymous-admin-denied', 'GET', '/admin', undefined, 403);
    await hacer_peticion(context, a, 'customer-admin-denied', 'GET', '/admin', undefined, 403);
    await hacer_peticion(context, a, 'customer-admin-write-denied', 'POST', '/api/admin/products', {}, 403);
}

async function preparar_operacion_del_carrito(context, actor, id, operation, operation_id = randomUUID()) {
    return hacer_peticion(context, actor, id, 'POST', '/api/cart/account', { operation_id, operation, scope: actor.scope });
}

async function carritos(context, a, b, product) {
    for (const actor of [a, b]) {
        const data = await hacer_peticion(context, actor, `${actor.label}-cart-read`, 'GET', '/api/cart/account');
        comprobar_resultado(context, `${actor.label}-cart-owner`, data.user_id === actor.id && data.items.length === 0);
        actor.scope = data.scope;
    }
    const operation = { type: 'merge', items: [{ id: product.id, quantity: 1 }] }, id = randomUUID();
    await preparar_operacion_del_carrito(context, a, 'visitor-cart-merge', operation, id);
    const replay = await preparar_operacion_del_carrito(context, a, 'visitor-cart-replay', operation, id);
    comprobar_resultado(context, 'visitor-cart-no-duplicate', replay.items.length === 1 && replay.items[0].quantity === 1);
    const other = await hacer_peticion(context, b, 'b-cart-isolation-read', 'GET', '/api/cart/account');
    comprobar_resultado(context, 'cart-isolation', other.items.length === 0 && other.user_id === b.id);
    const persisted = await hacer_peticion(context, a, 'a-cart-reload', 'GET', '/api/cart/account');
    comprobar_resultado(context, 'cart-persistence', persisted.items[0]?.id === product.id && persisted.items[0]?.quantity === 1);
    await hacer_peticion(context, b, 'cart-cross-account-scope-denied', 'POST', '/api/cart/account',
        { operation_id: randomUUID(), scope: a.scope, operation: { type: 'clear' } }, 409);
}

async function opiniones(context, a, b) {
    const operation_id = randomUUID(), comment = `QA DREAMS ${context.run}: opinión de prueba controlada`;
    await hacer_peticion(context, a, 'review-create', 'POST', '/api/reviews', { rating: 4, comment, operation_id }, 201);
    await hacer_peticion(context, a, 'review-replay', 'POST', '/api/reviews', { rating: 4, comment, operation_id });
    const list = await hacer_peticion(context, a, 'review-reload', 'GET', '/api/reviews');
    const own = list.filter(row => row.comment === comment);
    comprobar_resultado(context, 'review-persisted-once', own.length === 1 && own[0].can_delete === true);
    context.review_id = own[0].id;
    await hacer_peticion(context, b, 'review-other-delete-denied', 'DELETE', `/api/reviews/${own[0].id}`, {}, 404);
    await hacer_peticion(context, a, 'review-own-delete', 'DELETE', `/api/reviews/${own[0].id}`, {});
    const after = await hacer_peticion(context, a, 'review-delete-reload', 'GET', '/api/reviews');
    comprobar_resultado(context, 'review-own-delete-persisted', !after.some(row => row.id === own[0].id));
    context.review_id = null;
}

async function academico(context, a, product) {
    const items = [{ id: product.id, quantity: 1 }];
    const quote = await hacer_peticion(context, a, 'academic-quote', 'POST', '/api/cart/quote', { items });
    comprobar_resultado(context, 'academic-free-shipping', quote.shipping === 0 && quote.total === quote.subtotal);
    const link = new URL(quote.whatsapp_url);
    comprobar_resultado(context, 'whatsapp-recipient-summary', link.hostname === 'wa.me' && link.pathname === '/542944160065' && link.searchParams.get('text')?.includes(product.name));
    const ticket = await hacer_peticion(context, a, 'academic-session', 'POST', '/api/presentation/session', { items, intent_id: randomUUID() });
    const receipt = await hacer_peticion(context, a, 'academic-payment', 'POST', '/api/presentation/payment', { ticket: ticket.ticket });
    const replay = await hacer_peticion(context, a, 'academic-double-submit', 'POST', '/api/presentation/payment', { ticket: ticket.ticket });
    comprobar_resultado(context, 'academic-stable-reference', receipt.reference === replay.reference && Boolean(receipt.reference));
    const result = await hacer_peticion(context, a, 'academic-result', 'POST', '/api/presentation/result', { receipt: receipt.receipt });
    comprobar_resultado(context, 'academic-completed', result.simulated === true && result.status === 'completed' && result.reference === receipt.reference);
}

async function panel_usuario(context, env) {
    if (!env.DREAMS_QA_ADMIN_PASSWORD) return null;
    const found = await context.db.auth.admin.getUserById('a88d8d4e-ada3-4bfa-a6f5-db39d2dc9c19');
    comprobar_resultado(context, 'existing-admin-identity', !found.error && Boolean(found.data?.user?.email));
    const actor = { label: 'admin', cookies: new Map() };
    context.admin = actor;
    const data = await hacer_peticion(context, actor, 'existing-admin-login', 'POST', '/api/auth/login',
        { email: found.data.user.email, password: env.DREAMS_QA_ADMIN_PASSWORD });
    comprobar_resultado(context, 'existing-admin-role', data.user?.is_admin === true && data.user.id === found.data.user.id);
    return actor;
}

function preparar_datos_del_producto(run) {
    return { brand: 'DREAMS QA', name: `QA ${run}`, gender: 'unisex', category: 'nicho', size_ml: 50, price: 125,
        stock: 2, intensity: 3, family: 'Prueba', top_notes: 'Prueba', heart_notes: 'Prueba', base_notes: 'Prueba',
        description: 'Recurso exclusivo de QA, no comercial', image_url: '/assets/dreams-bottle.png', featured: false };
}

async function panel_stock_y_destacados(context, actor, id, fields) {
    for (const stock of [0, 1, 2]) {
        await hacer_peticion(context, actor, `admin-stock-${stock}-save`, 'PUT', `/api/admin/products/${id}`, { ...fields, stock });
        const rows = await hacer_peticion(context, actor, `admin-stock-${stock}-reload`, 'GET', '/api/admin/products');
        comprobar_resultado(context, `admin-stock-${stock}-persisted`, rows.find(p => p.id === id)?.stock === stock);
    }
    await hacer_peticion(context, actor, 'admin-featured-save', 'PUT', `/api/admin/products/${id}`, { ...fields, featured: true });
    const featured = await hacer_peticion(context, actor, 'admin-featured-home-read', 'GET', '/api/products?limit=8');
    comprobar_resultado(context, 'admin-featured-persisted', featured.some(p => p.id === id && p.featured === true));
}

async function panel_cupones(context, actor) {
    const code = `QA_${context.run.replaceAll('-', '_').toUpperCase()}`;
    const saved = await hacer_peticion(context, actor, 'admin-coupon-create', 'POST', '/api/admin/coupons', { code, discount_percent: 5, active: false }, 201);
    context.coupon_id = saved.id;
    await hacer_peticion(context, actor, 'admin-coupon-edit', 'PUT', `/api/admin/coupons/${saved.id}`, { code, discount_percent: 7, active: false });
    const rows = await hacer_peticion(context, actor, 'admin-coupon-reload', 'GET', '/api/admin/coupons');
    comprobar_resultado(context, 'admin-coupon-persisted', rows.some(row => row.id === saved.id && Number(row.discount_percent) === 7 && row.active === false));
    await hacer_peticion(context, actor, 'admin-coupon-delete-qa', 'DELETE', `/api/admin/coupons/${saved.id}`);
    context.coupon_id = null;
}

async function panel_opinion_moderacion(context, admin, owner) {
    const comment = `QA moderación ${context.run}`;
    await hacer_peticion(context, owner, 'moderation-qa-review-create', 'POST', '/api/reviews', { rating: 4, comment, operation_id: randomUUID() }, 201);
    const rows = await hacer_peticion(context, admin, 'moderation-qa-review-read', 'GET', '/api/admin/reviews');
    const own = rows.find(row => row.comment === comment && row.user_id === owner.id);
    comprobar_resultado(context, 'moderation-qa-identity', Boolean(own));
    context.review_id = own.id;
    await hacer_peticion(context, admin, 'admin-review-edit', 'PUT', `/api/admin/reviews/${own.id}`, { rating: 3, comment: `${comment} editada` });
    const changed = await hacer_peticion(context, admin, 'admin-review-reload', 'GET', '/api/admin/reviews');
    comprobar_resultado(context, 'admin-review-persisted', changed.some(row => row.id === own.id && row.rating === 3 && row.comment === `${comment} editada`));
    await hacer_peticion(context, admin, 'admin-review-delete', 'DELETE', `/api/admin/reviews/${own.id}`);
    context.review_id = null;
}

async function panel_perfumes(context, actor) {
    const original = preparar_datos_del_producto(context.run);
    const saved = await hacer_peticion(context, actor, 'admin-product-create', 'POST', '/api/admin/products', original, 201);
    comprobar_resultado(context, 'qa-created-product-identity', saved.name === original.name && saved.brand === original.brand);
    context.product_id = saved.id;
    context.admin = actor;
    const changed = { ...original, name: `${original.name} editado`, price: 150, image_url: '/assets/dreams-hero-640.webp' };
    await hacer_peticion(context, actor, 'admin-product-update', 'PUT', `/api/admin/products/${saved.id}`, changed);
    const reloaded = await hacer_peticion(context, actor, 'admin-product-persistence-read', 'GET', '/api/admin/products');
    const row = reloaded.find(p => p.id === saved.id);
    comprobar_resultado(context, 'admin-product-persistence', row?.name === changed.name && Number(row?.price) === 150 && row?.image_url === changed.image_url);
    await hacer_peticion(context, actor, 'admin-product-edit-preserves-image', 'PUT', `/api/admin/products/${saved.id}`, { ...changed, price: 175 });
    const detail = await hacer_peticion(context, actor, 'admin-product-detail', 'GET', `/api/products/${saved.id}`);
    comprobar_resultado(context, 'admin-image-persistence', detail.image_url === changed.image_url && Number(detail.price) === 175);
    const catalog = await hacer_peticion(context, actor, 'admin-product-catalog', 'GET', '/api/products');
    comprobar_resultado(context, 'admin-catalog-persistence', catalog.some(p => p.id === saved.id && p.image_url === changed.image_url));
    await hacer_peticion(context, actor, 'admin-product-delete-qa', 'DELETE', `/api/admin/products/${saved.id}`);
    context.product_id = null;
    const absent = await hacer_llamada(context, actor, 'GET', `/api/products/${saved.id}`);
    comprobar_resultado(context, 'admin-qa-product-cleaned', absent.status === 404);
}

async function limpiar(context, a, b) {
    if (context.review_id && a.id && a.cookies.get('dreams_access_token')) {
        const deleted = await hacer_llamada(context, a, 'DELETE', `/api/reviews/${context.review_id}`, {});
        comprobar_resultado(context, 'review-cleanup-qa', [200, 404].includes(deleted.status));
    }
    if (context.product_id && context.admin) await hacer_peticion(context, context.admin, 'product-cleanup-qa', 'DELETE', `/api/admin/products/${context.product_id}`);
    if (context.coupon_id && context.admin) await hacer_peticion(context, context.admin, 'coupon-cleanup-qa', 'DELETE', `/api/admin/coupons/${context.coupon_id}`);
    for (const actor of [a, b, context.extra, context.admin].filter(Boolean)) {
        const token = actor.cookies.get('dreams_access_token');
        if (!token) continue;
        // solo las cuentas qa: revocar tambien sesiones de un intento previo interrumpido.
        if (actor.label !== 'admin') {
            const revoked = await context.db.auth.admin.signOut(decodeURIComponent(token), 'global');
            comprobar_resultado(context, `${actor.label}-qa-refresh-sessions-revoked`, !revoked.error);
        }
        await hacer_peticion(context, actor, `${actor.label}-final-logout`, 'POST', '/api/auth/logout', {});
    }
}

async function sesion_usuario(context, actor) {
    const data = await hacer_peticion(context, actor, `${actor.label}-qa-login`, 'POST', '/api/auth/login', { email: actor.email, password: actor.password });
    comprobar_resultado(context, `${actor.label}-qa-customer-identity`, data.user?.id === actor.id && data.user?.is_admin === false);
}

async function registro_fase(context, env, state) {
    const existed = state.a.id && state.b.id;
    for (const actor of [state.a, state.b]) {
        if (actor.id) await sesion_usuario(context, actor);
        else await registrar(context, actor);
    }
    if (existed) {
        context.extra = usuario_para(env, context.run, 'c');
        await registrar(context, context.extra);
    }
    // recuperar solo carritos qa de un intento que alcanzo el limite de free.
    for (const actor of [state.a, state.b]) {
        const result = await context.db.rpc('dreams_cart_operation', { p_user_id: actor.id, p_operation_id: randomUUID(), p_operation: { type: 'clear' } });
        comprobar_resultado(context, `${actor.label}-prior-qa-cart-cleared`, !result.error);
    }
    await sesiones(context, state.a, state.b);
}

async function comprobar_disponibilidad_del_perfume(context, actor) {
    const rows = await hacer_peticion(context, actor, 'catalog-read', 'GET', '/api/products');
    const product = rows.find(p => Number(p.stock) > 0);
    comprobar_resultado(context, 'available-readonly-product', Boolean(product));
    return product;
}

async function panel_modulo_lecturas(context, admin) {
    await hacer_peticion(context, admin, 'existing-admin-page', 'GET', '/admin');
    for (const module of ['stats', 'products', 'users', 'inquiries', 'reviews', 'orders', 'coupons']) {
        await hacer_peticion(context, admin, `admin-${module}-read`, 'GET', `/api/admin/${module}`);
    }
}

async function panel_stock_fase(context, admin) {
    const fields = { ...preparar_datos_del_producto(context.run), name: `QA stock ${context.run}` };
    const saved = await hacer_peticion(context, admin, 'stock-qa-product-create', 'POST', '/api/admin/products', fields, 201);
    comprobar_resultado(context, 'stock-qa-product-identity', saved.name === fields.name && saved.brand === fields.brand);
    context.product_id = saved.id;
    await panel_stock_y_destacados(context, admin, saved.id, fields);
    await hacer_peticion(context, admin, 'stock-qa-product-delete', 'DELETE', `/api/admin/products/${saved.id}`);
    context.product_id = null;
}

async function cliente_fase(context, state, phase) {
    await sesion_usuario(context, state.a);
    if (phase !== 'academic_compatibility') await sesion_usuario(context, state.b);
    if (phase === 'review_ownership') return opiniones(context, state.a, state.b);
    const product = await comprobar_disponibilidad_del_perfume(context, state.a);
    return phase === 'cart_isolation' ? carritos(context, state.a, state.b, product) : academico(context, state.a, product);
}

async function panel_fase(context, env, state, phase) {
    const admin = await panel_usuario(context, env);
    comprobar_resultado(context, 'existing-admin-secret-available', Boolean(admin));
    if (phase === 'admin_modules') return panel_modulo_lecturas(context, admin);
    if (phase === 'admin_persistence') return panel_perfumes(context, admin);
    if (phase === 'admin_stock_featured') return panel_stock_fase(context, admin);
    if (phase === 'admin_coupons') return panel_cupones(context, admin);
    await sesion_usuario(context, state.a);
    return panel_opinion_moderacion(context, admin, state.a);
}

async function ejecutar_fase(context, env, state, phase) {
    context.before = await comerciales_copia(context);
    try {
        if (phase === 'registration_sessions') await registro_fase(context, env, state);
        else if (phase.startsWith('admin_')) await panel_fase(context, env, state, phase);
        else await cliente_fase(context, state, phase);
    } finally { await limpiar(context, state.a, state.b); }
    await confirmar_comerciales_sin_cambios(context);
    // marcador en operaciones del carrito exclusivo qa; no requiere nueva tabla.
    const marked = await context.db.rpc('dreams_cart_operation', { p_user_id: state.a.id,
        p_operation_id: crear_identificador_de_fase(context, phase), p_operation: { type: 'clear' } });
    comprobar_resultado(context, 'phase-recorded', !marked.error);
    state.completed.add(phase);
}

async function comerciales_copia(context) {
    const products = await context.db.from('products').select('id,stock').order('id');
    const orders = await context.db.from('orders').select('id', { count: 'exact', head: true });
    comprobar_resultado(context, 'business-snapshot-readable', !products.error && !orders.error);
    return { products: JSON.stringify(products.data), orders: orders.count };
}

async function confirmar_comerciales_sin_cambios(context) {
    const after = await comerciales_copia(context);
    comprobar_resultado(context, 'commercial-stock-unchanged', context.before.products === after.products);
    comprobar_resultado(context, 'commercial-orders-unchanged', context.before.orders === after.orders);
}

function prueba_nombre(run, label) { return `QA DREAMS ${run} ${label}`; }

function crear_identificador_de_fase(context, phase) {
    const h = createHmac('sha256', context.secret).update(`qa-phase:${context.run}:${context.version}:${phase}`).digest('hex');
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-8${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

async function preparar_estado_de_fase(context, env) {
    const run = env.QA_CREDENTIAL_RUN_ID || context.run;
    const a = usuario_para(env, run, 'a'), b = usuario_para(env, run, 'b');
    const rows = await context.db.from('profiles').select('id,name,role').in('name', [prueba_nombre(run, 'a'), prueba_nombre(run, 'b')]);
    comprobar_resultado(context, 'qa-identity-marker-readable', !rows.error);
    for (const actor of [a, b]) {
        const matches = rows.data.filter(row => row.name === prueba_nombre(run, actor.label));
        comprobar_resultado(context, `${actor.label}-qa-profile-unambiguous`, matches.length <= 1 && matches.every(row => row.role === 'customer'));
        actor.id = matches[0]?.id;
    }
    const ids = phase_names.map(phase => crear_identificador_de_fase(context, phase));
    const operations = a.id ? await context.db.from('account_cart_operations').select('operation_id').eq('user_id', a.id).in('operation_id', ids) : { data: [] };
    comprobar_resultado(context, 'qa-phases-readable', !operations.error);
    return { a, b, completed: new Set(phase_names.filter((phase, index) => operations.data.some(row => row.operation_id === ids[index]))) };
}

async function ejecutar_oficial_prueba(env, dispatch, services = {}) {
    const run = String(env.QA_RUN_ID || ''), expires = Number(env.QA_EXPIRES_AT);
    if (!/^pr56-[a-z0-9-]{1,32}$/.test(run) || !Number.isFinite(expires) || Date.now() >= expires || expires - Date.now() > 1800000 || active_run === run) return null;
    active_run = run;
    const context = { run, dispatch, secret: env.SUPABASE_SECRET_KEY, version: env.CF_VERSION_METADATA?.id, checks: [] };
    const report = { type: 'dreams-private-authenticated-qa-v2', run, source_commit: env.QA_SOURCE_COMMIT, secret_source_version: env.QA_SECRET_SOURCE_VERSION, backend_version: context.version, started_at: new Date().toISOString(), checks: context.checks };
    try {
        context.db = (services.create_database || create_official_database)(env);
        comprobar_resultado(context, 'expected-project-url', env.SUPABASE_URL === 'https://nwsmbemwtexmrtpkgxrz.supabase.co');
        const state = await (services.read_state || preparar_estado_de_fase)(context, env);
        const phase = phase_names.find(name => !state.completed.has(name));
        report.phase = phase || 'complete';
        if (phase === 'registration_sessions') await comprobar_lectura_inicial(context, env, report, services);
        if (phase) await ejecutar_fase(context, env, state, phase);
        report.completed_phases = [...state.completed];
        report.status = state.completed.size === phase_names.length ? 'PASS' : 'PHASE_PASS';
    } catch { report.status = 'FAIL'; report.failed_check = context.checks.find(c => c.result === 'FAIL')?.id || 'runtime_or_provider_failure'; }
    report.completed_at = new Date().toISOString();
    // ningun usuario, correo, contrasena, cookie, ticket ni header se registra.
    for (const item of context.checks) (services.log || console.log)('DREAMS private QA check', { type: 'dreams-private-qa-check-v1', run, phase: report.phase, backend_version: context.version, ...item });
    report.totals = { pass: context.checks.filter(item => item.result === 'PASS').length, fail: context.checks.filter(item => item.result === 'FAIL').length };
    (services.log || console.log)('DREAMS private QA', report);
    active_run = null;
    return report;
}
export { ejecutar_oficial_prueba as run_official_qa };

async function comprobar_lectura_inicial(context, env, report, services) {
    const read = await (services.diagnose || diagnose_supabase)(env);
    report.candidate_read = { raw_status: read.raw_apikey_only?.status, sdk_status: read.candidate_sdk?.status,
        project_key_pair: read.project_key_pair, project_url_matches: read.project_url_matches,
        key_format: read.shape, apikey_unchanged: read.candidate_sdk?.apikey_unchanged, checked_at: new Date().toISOString() };
    comprobar_resultado(context, 'candidate-direct-sdk-read', read.raw_apikey_only?.status === 200 && read.candidate_sdk?.succeeded === true && read.project_key_pair === 'verified_by_read');
    comprobar_resultado(context, 'server-key-type', read.shape?.kind === 'modern_secret' || read.shape?.jwt_project === 'expected_service_role_claims');
}
