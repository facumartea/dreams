import { createHmac, randomUUID } from 'node:crypto';
import { create_official_database } from './official-client.mjs';
import { diagnose_supabase } from './supabase-diagnostic.mjs';
const origin = 'https://dreams-perfumes.pages.dev';
let attempted_run;

function check(context, id, condition, details = {}) {
    context.checks.push({ id, result: condition ? 'PASS' : 'FAIL', ...details });
    if (!condition) throw new Error(id);
}

function actor_for(env, run, label) {
    return { label, cookies: new Map(), email: `qa-dreams-${run}-${label}@example.com`,
        password: createHmac('sha256', env.SUPABASE_SECRET_KEY).update(`qa:${run}:${label}`).digest('base64url') + '!Aa1' };
}

async function call(context, actor, method, path, body) {
    const headers = new Headers({ Origin: origin, 'cf-connecting-ip': '192.0.2.56' });
    if (actor) headers.set('Cookie', [...actor.cookies].map(([key, value]) => `${key}=${value}`).join('; '));
    if (body !== undefined) headers.set('Content-Type', 'application/json');
    const response = await context.dispatch(new Request(origin + path, { method, headers,
        ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(20000) }));
    const set = response.headers.getSetCookie();
    if (actor && set.length) {
        check(context, `${actor.label}-secure-cookies`, set.every(c => /; HttpOnly/i.test(c) && /; Secure/i.test(c) && /; SameSite=Lax/i.test(c)));
        for (const cookie of set) {
            const pair = cookie.split(';')[0], split = pair.indexOf('=');
            actor.cookies.set(pair.slice(0, split), pair.slice(split + 1));
        }
    }
    const data = response.headers.get('Content-Type')?.includes('application/json') ? await response.json() : await response.text();
    return { status: response.status, data };
}

async function request(context, actor, id, method, path, body, status = 200) {
    const result = await call(context, actor, method, path, body);
    check(context, id, result.status === status, { observed_status: result.status, expected_status: status });
    return result.data;
}

async function register(context, actor) {
    const data = await request(context, actor, `${actor.label}-registration`, 'POST', '/api/auth/register',
        { name: `QA DREAMS ${actor.label}`, email: actor.email, password: actor.password });
    check(context, `${actor.label}-registration-session`, data.authenticated === true && data.user?.is_admin === false && Boolean(data.user?.id));
    actor.id = data.user.id;
    const profile = await context.db.from('profiles').select('role').eq('id', actor.id).single();
    check(context, `${actor.label}-customer-profile`, !profile.error && profile.data?.role === 'customer');
}

async function sessions(context, a, b) {
    await request(context, a, 'logout-real', 'POST', '/api/auth/logout', {});
    const anonymous = await request(context, a, 'logout-session-read', 'GET', '/api/auth/me');
    check(context, 'logout-cleared-session', anonymous.user === null);
    const login = await request(context, a, 'login-real', 'POST', '/api/auth/login', { email: a.email, password: a.password });
    check(context, 'login-same-user', login.user?.id === a.id);
    await request(context, null, 'wrong-password', 'POST', '/api/auth/login', { email: b.email, password: b.password + 'wrong' }, 401);
    a.cookies.set('dreams_access_token', 'expired-qa-token');
    const refreshed = await request(context, a, 'refresh-real', 'GET', '/api/auth/me');
    check(context, 'refresh-same-user', refreshed.user?.id === a.id && a.cookies.get('dreams_access_token') !== 'expired-qa-token');
    const reloaded = await request(context, a, 'session-reload', 'GET', '/api/auth/me');
    check(context, 'session-persisted', reloaded.user?.id === a.id);
    await request(context, null, 'anonymous-admin-denied', 'GET', '/admin', undefined, 403);
    await request(context, a, 'customer-admin-denied', 'GET', '/admin', undefined, 403);
    await request(context, a, 'customer-admin-write-denied', 'POST', '/api/admin/products', {}, 403);
}

async function cart_operation(context, actor, id, operation, operation_id = randomUUID()) {
    return request(context, actor, id, 'POST', '/api/cart/account', { operation_id, operation, scope: actor.scope });
}

async function carts(context, a, b, product) {
    for (const actor of [a, b]) {
        const data = await request(context, actor, `${actor.label}-cart-read`, 'GET', '/api/cart/account');
        check(context, `${actor.label}-cart-owner`, data.user_id === actor.id && data.items.length === 0);
        actor.scope = data.scope;
    }
    const operation = { type: 'merge', items: [{ id: product.id, quantity: 1 }] }, id = randomUUID();
    await cart_operation(context, a, 'visitor-cart-merge', operation, id);
    const replay = await cart_operation(context, a, 'visitor-cart-replay', operation, id);
    check(context, 'visitor-cart-no-duplicate', replay.items.length === 1 && replay.items[0].quantity === 1);
    const other = await request(context, b, 'b-cart-isolation-read', 'GET', '/api/cart/account');
    check(context, 'cart-isolation', other.items.length === 0 && other.user_id === b.id);
    const persisted = await request(context, a, 'a-cart-reload', 'GET', '/api/cart/account');
    check(context, 'cart-persistence', persisted.items[0]?.id === product.id && persisted.items[0]?.quantity === 1);
    await request(context, b, 'cart-cross-account-scope-denied', 'POST', '/api/cart/account',
        { operation_id: randomUUID(), scope: a.scope, operation: { type: 'clear' } }, 409);
}

async function reviews(context, a, b) {
    const operation_id = randomUUID(), comment = `QA DREAMS ${context.run}: opinión de prueba controlada`;
    await request(context, a, 'review-create', 'POST', '/api/reviews', { rating: 4, comment, operation_id }, 201);
    await request(context, a, 'review-replay', 'POST', '/api/reviews', { rating: 4, comment, operation_id });
    const list = await request(context, a, 'review-reload', 'GET', '/api/reviews');
    const own = list.filter(row => row.comment === comment);
    check(context, 'review-persisted-once', own.length === 1 && own[0].can_delete === true);
    context.review_id = own[0].id;
    await request(context, b, 'review-other-delete-denied', 'DELETE', `/api/reviews/${own[0].id}`, {}, 404);
    await request(context, a, 'review-own-delete', 'DELETE', `/api/reviews/${own[0].id}`, {});
    const after = await request(context, a, 'review-delete-reload', 'GET', '/api/reviews');
    check(context, 'review-own-delete-persisted', !after.some(row => row.id === own[0].id));
    context.review_id = null;
}

async function academic(context, a, product) {
    const items = [{ id: product.id, quantity: 1 }];
    const quote = await request(context, a, 'academic-quote', 'POST', '/api/cart/quote', { items });
    check(context, 'academic-free-shipping', quote.shipping === 0 && quote.total === quote.subtotal);
    const link = new URL(quote.whatsapp_url);
    check(context, 'whatsapp-recipient-summary', link.hostname === 'wa.me' && link.pathname === '/542944160065' && link.searchParams.get('text')?.includes(product.name));
    const ticket = await request(context, a, 'academic-session', 'POST', '/api/presentation/session', { items, intent_id: randomUUID() });
    const receipt = await request(context, a, 'academic-payment', 'POST', '/api/presentation/payment', { ticket: ticket.ticket });
    const replay = await request(context, a, 'academic-double-submit', 'POST', '/api/presentation/payment', { ticket: ticket.ticket });
    check(context, 'academic-stable-reference', receipt.reference === replay.reference && Boolean(receipt.reference));
    const result = await request(context, a, 'academic-result', 'POST', '/api/presentation/result', { receipt: receipt.receipt });
    check(context, 'academic-completed', result.simulated === true && result.status === 'completed' && result.reference === receipt.reference);
}

async function admin_actor(context, env) {
    if (!env.DREAMS_QA_ADMIN_PASSWORD) return null;
    const found = await context.db.auth.admin.getUserById('a88d8d4e-ada3-4bfa-a6f5-db39d2dc9c19');
    check(context, 'existing-admin-identity', !found.error && Boolean(found.data?.user?.email));
    const actor = { label: 'admin', cookies: new Map() };
    const data = await request(context, actor, 'existing-admin-login', 'POST', '/api/auth/login',
        { email: found.data.user.email, password: env.DREAMS_QA_ADMIN_PASSWORD });
    check(context, 'existing-admin-role', data.user?.is_admin === true && data.user.id === found.data.user.id);
    await request(context, actor, 'existing-admin-page', 'GET', '/admin');
    return actor;
}

function product_payload(run) {
    return { brand: 'DREAMS QA', name: `QA ${run}`, gender: 'unisex', category: 'nicho', size_ml: 50, price: 125,
        stock: 2, intensity: 3, family: 'Prueba', top_notes: 'Prueba', heart_notes: 'Prueba', base_notes: 'Prueba',
        description: 'Recurso exclusivo de QA, no comercial', image_url: '/assets/dreams-bottle.png', featured: false };
}

async function admin_stock_and_featured(context, actor, id, fields) {
    for (const stock of [0, 1, 2]) {
        await request(context, actor, `admin-stock-${stock}-save`, 'PUT', `/api/admin/products/${id}`, { ...fields, stock });
        const rows = await request(context, actor, `admin-stock-${stock}-reload`, 'GET', '/api/admin/products');
        check(context, `admin-stock-${stock}-persisted`, rows.find(p => p.id === id)?.stock === stock);
    }
    await request(context, actor, 'admin-featured-save', 'PUT', `/api/admin/products/${id}`, { ...fields, featured: true });
    const featured = await request(context, actor, 'admin-featured-home-read', 'GET', '/api/products?limit=8');
    check(context, 'admin-featured-persisted', featured.some(p => p.id === id && p.featured === true));
}

async function admin_coupons(context, actor) {
    const code = `QA_${context.run.replaceAll('-', '_').toUpperCase()}`;
    const saved = await request(context, actor, 'admin-coupon-create', 'POST', '/api/admin/coupons', { code, discount_percent: 5, active: false }, 201);
    context.coupon_id = saved.id;
    await request(context, actor, 'admin-coupon-edit', 'PUT', `/api/admin/coupons/${saved.id}`, { code, discount_percent: 7, active: false });
    const rows = await request(context, actor, 'admin-coupon-reload', 'GET', '/api/admin/coupons');
    check(context, 'admin-coupon-persisted', rows.some(row => row.id === saved.id && Number(row.discount_percent) === 7 && row.active === false));
    await request(context, actor, 'admin-coupon-delete-qa', 'DELETE', `/api/admin/coupons/${saved.id}`);
    context.coupon_id = null;
}

async function admin_products(context, actor) {
    for (const module of ['stats', 'products', 'users', 'inquiries', 'reviews', 'orders', 'coupons']) {
        await request(context, actor, `admin-${module}-read`, 'GET', `/api/admin/${module}`);
    }
    const original = product_payload(context.run);
    const saved = await request(context, actor, 'admin-product-create', 'POST', '/api/admin/products', original, 201);
    check(context, 'qa-created-product-identity', saved.name === original.name && saved.brand === original.brand);
    context.product_id = saved.id;
    context.admin = actor;
    const changed = { ...original, name: `${original.name} editado`, price: 150, image_url: '/assets/dreams-hero-640.webp' };
    await request(context, actor, 'admin-product-update', 'PUT', `/api/admin/products/${saved.id}`, changed);
    const reloaded = await request(context, actor, 'admin-product-persistence-read', 'GET', '/api/admin/products');
    const row = reloaded.find(p => p.id === saved.id);
    check(context, 'admin-product-persistence', row?.name === changed.name && Number(row?.price) === 150 && row?.image_url === changed.image_url);
    await request(context, actor, 'admin-product-edit-preserves-image', 'PUT', `/api/admin/products/${saved.id}`, { ...changed, price: 175 });
    const detail = await request(context, actor, 'admin-product-detail', 'GET', `/api/products/${saved.id}`);
    check(context, 'admin-image-persistence', detail.image_url === changed.image_url && Number(detail.price) === 175);
    await admin_stock_and_featured(context, actor, saved.id, { ...changed, price: 175 });
    await admin_coupons(context, actor);
    const catalog = await request(context, actor, 'admin-product-catalog', 'GET', '/api/products');
    check(context, 'admin-catalog-persistence', catalog.some(p => p.id === saved.id && p.image_url === changed.image_url));
    await request(context, actor, 'admin-product-delete-qa', 'DELETE', `/api/admin/products/${saved.id}`);
    context.product_id = null;
    const absent = await call(context, actor, 'GET', `/api/products/${saved.id}`);
    check(context, 'admin-qa-product-cleaned', absent.status === 404);
}

async function cleanup(context, a, b) {
    if (context.review_id && a.id) {
        const deleted = await call(context, a, 'DELETE', `/api/reviews/${context.review_id}`, {});
        check(context, 'review-cleanup-qa', [200, 404].includes(deleted.status));
    }
    if (context.product_id && context.admin) {
        await request(context, context.admin, 'product-cleanup-qa', 'DELETE', `/api/admin/products/${context.product_id}`);
    }
    if (context.coupon_id && context.admin) {
        await request(context, context.admin, 'coupon-cleanup-qa', 'DELETE', `/api/admin/coupons/${context.coupon_id}`);
    }
    for (const actor of [a, b, context.admin].filter(Boolean)) {
        if (!actor.id && actor.label !== 'admin') continue;
        if (actor.scope) await cart_operation(context, actor, `${actor.label}-cart-clear-qa`, { type: 'clear' });
        await request(context, actor, `${actor.label}-final-logout`, 'POST', '/api/auth/logout', {});
    }
}

async function customer_qa(context, env) {
    const a = actor_for(env, context.run, 'a'), b = actor_for(env, context.run, 'b');
    try {
        await register(context, a);
        await register(context, b);
        await sessions(context, a, b);
        const products = await request(context, a, 'catalog-read', 'GET', '/api/products');
        const product = products.find(p => Number(p.stock) > 0);
        check(context, 'available-readonly-product', Boolean(product));
        await carts(context, a, b, product);
        await reviews(context, a, b);
        await academic(context, a, product);
        const admin = await admin_actor(context, env);
        if (admin) await admin_products(context, admin);
        else context.checks.push({ id: 'admin-persistence', result: 'BLOCKED', reason: 'existing_admin_session_required' });
    } finally {
        await cleanup(context, a, b).catch(() => context.checks.push({ id: 'qa-cleanup', result: 'FAIL' }));
    }
}

async function business_snapshot(context) {
    const products = await context.db.from('products').select('id,stock').order('id');
    const orders = await context.db.from('orders').select('id', { count: 'exact', head: true });
    check(context, 'business-snapshot-readable', !products.error && !orders.error);
    return { products: JSON.stringify(products.data), orders: orders.count };
}

async function confirm_business_unchanged(context) {
    const after = await business_snapshot(context);
    check(context, 'commercial-stock-unchanged', context.before.products === after.products);
    check(context, 'commercial-orders-unchanged', context.before.orders === after.orders);
}

export async function run_official_qa(env, dispatch, services = {}) {
    const run = String(env.QA_RUN_ID || ''), expires = Number(env.QA_EXPIRES_AT);
    if (!/^pr56-[a-z0-9-]{1,32}$/.test(run) || !Number.isFinite(expires) || Date.now() >= expires || expires - Date.now() > 1800000 || attempted_run === run) return null;
    attempted_run = run;
    const context = { run, dispatch, checks: [] };
    const report = { type: 'dreams-private-authenticated-qa-v1', run, source_commit: env.QA_SOURCE_COMMIT, secret_source_version: env.QA_SECRET_SOURCE_VERSION, backend_version: env.CF_VERSION_METADATA?.id, started_at: new Date().toISOString(), checks: context.checks };
    try {
        context.db = (services.create_database || create_official_database)(env);
        const read = await (services.diagnose || diagnose_supabase)(env);
        report.candidate_read = { raw_status: read.raw_apikey_only?.status, sdk_status: read.candidate_sdk?.status, project_key_pair: read.project_key_pair, project_url_matches: read.project_url_matches, key_format: read.shape, apikey_unchanged: read.candidate_sdk?.apikey_unchanged, checked_at: new Date().toISOString() };
        check(context, 'candidate-direct-sdk-read', read.raw_apikey_only?.status === 200 && read.candidate_sdk?.succeeded === true && read.project_key_pair === 'verified_by_read');
        check(context, 'server-key-type', read.shape?.kind === 'modern_secret' || read.shape?.jwt_project === 'expected_service_role_claims');
        context.before = await business_snapshot(context);
        await customer_qa(context, env);

        report.status = context.checks.some(c => c.result === 'FAIL') ? 'FAIL' : context.checks.some(c => c.result === 'BLOCKED') ? 'PARTIAL' : 'PASS';
    } catch (error) { report.status = 'FAIL'; report.failed_check = context.checks.find(c => c.result === 'FAIL')?.id || 'runtime_or_provider_failure'; }
    if (context.before) await confirm_business_unchanged(context).catch(() => { report.status = 'FAIL'; });
    report.completed_at = new Date().toISOString();
    // Nunca incluir usuarios, correos, contraseñas, cookies, tickets ni headers.
    (services.log || console.log)('DREAMS private QA', report);
    return report;
}
