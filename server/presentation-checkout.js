const { createHmac, timingSafeEqual, randomUUID } = require('node:crypto');
const { auth_cookie } = require('./auth-cookies');
const academic_summary = subtotal => ({ subtotal, shipping: 0, shipping_label: 'Envío gratis', total: subtotal });
const valid_intent = value => /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value || '');
const COOKIE = 'dreams_presentation';

// Signed, expiring demonstrations. No order table, stock mutation or payment API.
function presentation_checkout({ enabled, signing_key, quote_cart, database, product_brand_column, production }) {
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
        try { const value = JSON.parse(Buffer.from(parts[0], 'base64url')); return value.version === 2 && value.kind === kind && value.owner === owner && value.expires > Date.now() ? value : null; } catch { return null; }
    }
    const owner_for = request => {
        const cookie = String(request.headers.cookie || '').split(';').find(part => part.trim().startsWith(`${COOKIE}=`));
        const value = cookie?.trim().slice(COOKIE.length + 1);
        return /^[a-f0-9-]{36}$/.test(value || '') ? value : null;
    };
    const valid_body = (body, keys) => body && typeof body === 'object' && !Array.isArray(body) && Object.keys(body).every(key => keys.includes(key));
    function install(app, route) {
        const gate = (request, response, next) => ready ? next() : response.status(404).json({ error: 'La presentación no está habilitada.' });
        route('post', '/api/presentation/session', gate, async (request, response) => {
            if (!valid_body(request.body, ['items', 'intent_id']) || !valid_intent(request.body.intent_id) || !Array.isArray(request.body.items) || request.body.items.some(item => !valid_body(item, ['id', 'quantity']))) return response.status(400).json({ error: 'Datos de presentación inválidos. No envíes campos de tarjeta.' });
            const quote = await quote_cart(database, request.body.items, '', product_brand_column);
            if (quote.error || !quote.items.length || !Number.isFinite(quote.subtotal) || quote.subtotal <= 0 || quote.warnings.length) return response.status(409).json({ error: quote.error || 'La disponibilidad cambió. Volvé al carrito para revisarlo.' });
            const owner = owner_for(request) || randomUUID();
            response.append('Set-Cookie', auth_cookie(COOKIE, owner, 3600, production));
            const payload = { version: 2, kind: 'ticket', owner, intent_id: request.body.intent_id.toLowerCase(), items: quote.items.map(({ id, quantity, price, brand, name }) => ({ id, quantity, price, brand, name })), ...academic_summary(quote.subtotal), expires: Date.now() + 1200000 };
            response.json({ ticket: sign(payload), ...academic_summary(quote.subtotal) });
        });
        route('post', '/api/presentation/payment', gate, async (request, response) => {
            if (!valid_body(request.body, ['ticket'])) return response.status(400).json({ error: 'Sólo se admite la referencia de presentación.' });
            const ticket = read(request.body.ticket, 'ticket', owner_for(request));
            if (!ticket) return response.status(400).json({ error: 'La referencia venció o no es válida. Volvé a intentarlo.' });
            // A replay of the same signed ticket returns the same outcome/reference.
            const receipt = { ...ticket, kind: 'receipt', status: 'completed', reference: `DREAMS-${ticket.intent_id.replace(/-/g, '').toUpperCase()}` };
            response.json({ receipt: sign(receipt), status: receipt.status, reference: receipt.reference });
        });
        route('post', '/api/presentation/result', gate, async (request, response) => {
            if (!valid_body(request.body, ['receipt'])) return response.status(400).json({ error: 'Referencia inválida.' });
            const receipt = read(request.body.receipt, 'receipt', owner_for(request));
            if (!receipt) return response.status(400).json({ error: 'No se pudo verificar la presentación.' });
            response.json({ status: receipt.status, reference: receipt.reference, ...academic_summary(receipt.subtotal), items: receipt.items, simulated: true });
        });
    }
    return { ready, install };
}
module.exports = { presentation_checkout, academic_summary };
