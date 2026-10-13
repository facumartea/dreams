// Confirmaciones académicas firmadas: sin pedidos, stock ni pasarela comercial.
const { createHmac, timingSafeEqual, randomUUID } = require('node:crypto');
const { auth_cookie } = require('./auth-cookies');
const academic_summary = subtotal => ({ subtotal, shipping: 0, shipping_label: 'Envío gratis', total: subtotal });
const valid_intent = value => /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value || '');
const COOKIE = 'dreams_presentation';
const valid_body = (body, keys) => body && typeof body === 'object' && !Array.isArray(body) && Object.keys(body).every(key => keys.includes(key));

function sign_payload(key, payload) {
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    return `${body}.${createHmac('sha256', key).update(body).digest('base64url')}`;
}

// Firma y vencimiento se verifican antes de interpretar o devolver el contenido.
function read_payload(key, token, kind, owner) {
    if (typeof token !== 'string' || token.length > 24000) return null;
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const expected = createHmac('sha256', key).update(parts[0]).digest();
    const supplied = Buffer.from(parts[1], 'base64url');
    if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;
    try {
        const value = JSON.parse(Buffer.from(parts[0], 'base64url'));
        return value.version === 2 && value.kind === kind && value.owner === owner && value.expires > Date.now() ? value : null;
    } catch { return null; }
}

function owner_for(request) {
    const cookie = String(request.headers.cookie || '').split(';').find(part => part.trim().startsWith(`${COOKIE}=`));
    const value = cookie?.trim().slice(COOKIE.length + 1);
    return /^[a-f0-9-]{36}$/.test(value || '') ? value : null;
}

async function academic_session(context, request, response) {
    const { database, quote_cart, product_brand_column, production, key } = context;
    if (!valid_body(request.body, ['items', 'intent_id']) || !valid_intent(request.body.intent_id) || !Array.isArray(request.body.items) || request.body.items.some(item => !valid_body(item, ['id', 'quantity']))) return response.status(400).json({ error: 'Datos de presentación inválidos. No envíes campos de tarjeta.' });
    const quote = await quote_cart(database, request.body.items, '', product_brand_column);
    if (quote.error || !quote.items.length || !Number.isFinite(quote.subtotal) || quote.subtotal <= 0 || quote.warnings.length) return response.status(409).json({ error: quote.error || 'La disponibilidad cambió. Volvé al carrito para revisarlo.' });
    const owner = owner_for(request) || randomUUID();
    response.append('Set-Cookie', auth_cookie(COOKIE, owner, 3600, production));
    const payload = {
        version: 2, kind: 'ticket', owner, intent_id: request.body.intent_id.toLowerCase(),
        items: quote.items.map(({ id, quantity, price, brand, name }) => ({ id, quantity, price, brand, name })),
        ...academic_summary(quote.subtotal), expires: Date.now() + 1200000
    };
    response.json({ ticket: sign_payload(key, payload), ...academic_summary(quote.subtotal) });
}

function academic_payment(context, request, response) {
    if (!valid_body(request.body, ['ticket'])) return response.status(400).json({ error: 'Sólo se admite la referencia de presentación.' });
    const ticket = read_payload(context.key, request.body.ticket, 'ticket', owner_for(request));
    if (!ticket) return response.status(400).json({ error: 'La referencia venció o no es válida. Volvé a intentarlo.' });
    // El replay del mismo ticket conserva referencia y resultado sin crear filas.
    const receipt = { ...ticket, kind: 'receipt', status: 'completed', reference: `DREAMS-${ticket.intent_id.replace(/-/g, '').toUpperCase()}` };
    response.json({ receipt: sign_payload(context.key, receipt), status: receipt.status, reference: receipt.reference });
}

function academic_result(context, request, response) {
    if (!valid_body(request.body, ['receipt'])) return response.status(400).json({ error: 'Referencia inválida.' });
    const receipt = read_payload(context.key, request.body.receipt, 'receipt', owner_for(request));
    if (!receipt) return response.status(400).json({ error: 'No se pudo verificar la presentación.' });
    response.json({ status: receipt.status, reference: receipt.reference, ...academic_summary(receipt.subtotal), items: receipt.items, simulated: true });
}

function install_academic_routes(context, app, route) {
    const gate = (request, response, next) => context.ready ? next() : response.status(404).json({ error: 'La presentación no está habilitada.' });
    route('post', '/api/presentation/session', gate, (request, response) => academic_session(context, request, response));
    route('post', '/api/presentation/payment', gate, (request, response) => academic_payment(context, request, response));
    route('post', '/api/presentation/result', gate, (request, response) => academic_result(context, request, response));
}

function presentation_checkout(options) {
    const ready = options.enabled === true && typeof options.signing_key === 'string' && options.signing_key.length >= 32;
    const key = ready ? createHmac('sha256', options.signing_key).update('DREAMS presentation checkout v2').digest() : null;
    const context = { ...options, ready, key };
    return { ready, install: (app, route) => install_academic_routes(context, app, route) };
}
module.exports = { presentation_checkout, academic_summary };
