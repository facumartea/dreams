const { createHmac, timingSafeEqual, randomUUID } = require('node:crypto');
const { auth_cookie } = require('./auth-cookies');
const academic_summary = (subtotal, quote = {}) => ({ subtotal, discount: quote.discount || 0, coupon: quote.coupon || null, shipping: 0, shipping_label: 'Envío', total: quote.total ?? subtotal });
const valid_intent = value => /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value || '');
const signing_reference = ticket => createHmac('sha256', ticket.intent_id).update(JSON.stringify([ticket.items, ticket.subtotal, ticket.discount, ticket.total, ticket.coupon])).digest('hex').slice(0, 8).toUpperCase();
const COOKIE = 'dreams_presentation';

const owner_for = request => {
    const cookie = String(request.headers.cookie || '').split(';').find(part => part.trim().startsWith(`${COOKIE}=`));
    const value = cookie?.trim().slice(COOKIE.length + 1);
    return /^[a-f0-9-]{36}$/.test(value || '') ? value : null;
};
const valid_body = (body, keys) => body && typeof body === 'object' && !Array.isArray(body) && Object.keys(body).every(key => keys.includes(key));

// Simulación firmada y con vencimiento: no escribe pedidos ni stock ni llama a pagos.
function presentation_checkout({ enabled, signing_key, quote_cart, database, product_brand_column, production, issuer }) {
    const ready = enabled === true && typeof signing_key === 'string' && signing_key.length >= 32;
    const key = ready ? createHmac('sha256', signing_key).update('DREAMS presentation checkout v2').digest() : null;
    const sign = payload => { const body = Buffer.from(JSON.stringify(payload)).toString('base64url'); return `${body}.${createHmac('sha256', key).update(body).digest('base64url')}`; };
    function read(token, kind, owner) {
        if (typeof token !== 'string' || token.length > 24000) return null;
        const parts = token.split('.');
        if (parts.length !== 2) return null;
        const expected = createHmac('sha256', key).update(parts[0]).digest();
        const supplied = Buffer.from(parts[1], 'base64url');
        if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;
        try { const value = JSON.parse(Buffer.from(parts[0], 'base64url')); return value.version === 2 && value.issuer === issuer && value.kind === kind && value.owner === owner && value.expires > Date.now() ? value : null; } catch { return null; }
    }
    const install = (app, route) => install_presentation({ ready, quote_cart, database, product_brand_column, production, issuer, sign, read }, app, route);
    return { ready, install };
}
function install_presentation({ ready, quote_cart, database, product_brand_column, production, issuer, sign, read }, app, route) {
    const gate = (request, response, next) => ready ? next() : response.status(404).json({ error: 'La presentación no está habilitada.' });
    route('post', '/api/presentation/session', gate, async (request, response) => {
        if (!valid_body(request.body, ['items', 'intent_id', 'coupon_code']) || !valid_intent(request.body.intent_id) || !Array.isArray(request.body.items) || request.body.items.some(item => !valid_body(item, ['id', 'quantity']))) return response.status(400).json({ error: 'Datos de presentación inválidos. No envíes campos de tarjeta.' });
        const quote = await quote_cart(database, request.body.items, request.body.coupon_code, product_brand_column, request.user?.id);
        if (quote.coupon_error) return response.status(409).json({ error: quote.coupon_error });
        if (quote.error || !quote.items.length || !Number.isFinite(quote.subtotal) || quote.subtotal <= 0 || quote.warnings.length) return response.status(409).json({ error: quote.error || 'La disponibilidad cambió. Volvé al carrito para revisarlo.' });
        const owner = owner_for(request) || randomUUID();
        response.append('Set-Cookie', auth_cookie(COOKIE, owner, 3600, production));
        const payload = { ...(issuer ? { issuer } : {}), version: 2, kind: 'ticket', owner, intent_id: request.body.intent_id.toLowerCase(), items: quote.items.map(({ id, quantity, price, brand, name }) => ({ id, quantity, price, brand, name })), ...academic_summary(quote.subtotal, quote), expires: Date.now() + 1200000 };
        response.json({ ticket: sign(payload), ...academic_summary(quote.subtotal, quote) });
    });
    route('post', '/api/presentation/payment', gate, async (request, response) => {
        if (!valid_body(request.body, ['ticket'])) return response.status(400).json({ error: 'Sólo se admite la referencia de presentación.' });
        const ticket = read(request.body.ticket, 'ticket', owner_for(request));
        if (!ticket) return response.status(400).json({ error: 'La referencia venció o no es válida. Volvé a intentarlo.' });
        // Revalidar sin consumir usos: ninguna operación de pago ni pedido comercial.
        const current = await quote_cart(database, ticket.items.map(({id, quantity}) => ({id, quantity})), ticket.coupon?.code || '', product_brand_column, request.user?.id);
        if (current.error || current.coupon_error || current.warnings.length || current.subtotal !== ticket.subtotal || current.total !== ticket.total || (current.discount || 0) !== (ticket.discount || 0)) return response.status(409).json({ error: 'Los importes o el cupón cambiaron. Volvé al carrito.' });
        // La referencia identifica también los importes y el cupón, conservando reintentos.
        const receipt = { ...ticket, kind: 'receipt', status: 'completed', reference: `DREAMS-${ticket.intent_id.replace(/-/g, '').toUpperCase() + (ticket.coupon ? '-' + signing_reference(ticket) : '')}` };
        response.json({ receipt: sign(receipt), status: receipt.status, reference: receipt.reference });
    });
    route('post', '/api/presentation/result', gate, async (request, response) => {
        if (!valid_body(request.body, ['receipt'])) return response.status(400).json({ error: 'Referencia inválida.' });
        const receipt = read(request.body.receipt, 'receipt', owner_for(request));
        if (!receipt) return response.status(400).json({ error: 'No se pudo verificar la presentación.' });
        response.json({ status: receipt.status, reference: receipt.reference, ...academic_summary(receipt.subtotal, receipt), items: receipt.items, simulated: true });
    });
}
module.exports = { presentation_checkout, academic_summary };
