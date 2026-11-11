// recalcula y firma la compra academica; no crea pedidos comerciales ni cambia stock.
// checkout academico: firma snapshots y revalida importes sin crear pedidos ni cobrar.
const { createHmac, timingSafeEqual, randomUUID } = require('node:crypto');
const { auth_cookie: crear_cookie_de_autenticacion } = require('./auth-cookies');
const resumir_compra_academica = (subtotal, quote = {}) => ({ subtotal, discount: quote.discount || 0, coupon: quote.coupon || null, shipping: 0, shipping_label: 'Envío', total: quote.total ?? subtotal });
const es_intento_valido = value => /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value || '');
const crear_referencia_firmada = ticket => createHmac('sha256', ticket.intent_id).update(JSON.stringify([ticket.items, ticket.subtotal, ticket.discount, ticket.total, ticket.coupon])).digest('hex').slice(0, 8).toUpperCase();
const calcular_importes_del_producto = items => JSON.stringify(items.map(({id, quantity, price}) => [id, quantity, price]));
const COOKIE = 'dreams_presentation';

const obtener_dueno_del_recurso = solicitud => {
    const cookie = String(solicitud.headers.cookie || '').split(';').find(part => part.trim().startsWith(`${COOKIE}=`));
    const value = cookie?.trim().slice(COOKIE.length + 1);
    return /^[a-f0-9-]{36}$/.test(value || '') ? value : null;
};
const es_cuerpo_valido = (body, keys) => body && typeof body === 'object' && !Array.isArray(body) && Object.keys(body).every(key => keys.includes(key));

// simulacion firmada y con vencimiento: no escribe pedidos ni stock ni llama a pagos.
function preparar_compra_academica({ enabled, signing_key, quote_cart, database, product_brand_column, production, issuer }) {
    const ready = enabled === true && typeof signing_key === 'string' && signing_key.length >= 32;
    const key = ready ? createHmac('sha256', signing_key).update('DREAMS presentation checkout v2').digest() : null;
    const firmar_datos = payload => { const body = Buffer.from(JSON.stringify(payload)).toString('base64url'); return `${body}.${createHmac('sha256', key).update(body).digest('base64url')}`; };
    function leer_datos(token, kind, owner) {
        if (typeof token !== 'string' || token.length > 24000) return null;
        const parts = token.split('.');
        if (parts.length !== 2) return null;
        const expected = createHmac('sha256', key).update(parts[0]).digest();
        const supplied = Buffer.from(parts[1], 'base64url');
        if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;
        try { const value = JSON.parse(Buffer.from(parts[0], 'base64url')); return value.version === 2 && value.issuer === issuer && value.kind === kind && value.owner === owner && value.expires > Date.now() ? value : null; } catch { return null; }
    }
    const registrar_funciones = (app, route) => registrar_simulacion({ ready, quote_cart, database, product_brand_column, production, issuer, sign: firmar_datos, read: leer_datos }, app, route);
    return { ready, install: registrar_funciones };
}
function registrar_simulacion({ ready, quote_cart, database, product_brand_column, production, issuer, sign, read }, app, route) {
    const verificar_condiciones = (solicitud, respuesta, siguiente) => ready ? siguiente() : respuesta.status(404).json({ error: 'La presentación no está habilitada.' });
    route('post', '/api/presentation/session', verificar_condiciones, async (solicitud, respuesta) => {
        if (!es_cuerpo_valido(solicitud.body, ['items', 'intent_id', 'coupon_code']) || !es_intento_valido(solicitud.body.intent_id) || !Array.isArray(solicitud.body.items) || solicitud.body.items.some(item => !es_cuerpo_valido(item, ['id', 'quantity']))) return respuesta.status(400).json({ error: 'Datos de presentación inválidos. No envíes campos de tarjeta.' });
        const quote = await quote_cart(database, solicitud.body.items, solicitud.body.coupon_code, product_brand_column, solicitud.user?.id);
        if (quote.coupon_error) return respuesta.status(409).json({ error: quote.coupon_error });
        if (quote.error || !quote.items.length || !Number.isFinite(quote.subtotal) || quote.subtotal <= 0 || quote.warnings.length) return respuesta.status(409).json({ error: quote.error || 'La disponibilidad cambió. Volvé al carrito para revisarlo.' });
        const owner = obtener_dueno_del_recurso(solicitud) || randomUUID();
        respuesta.append('Set-Cookie', crear_cookie_de_autenticacion(COOKIE, owner, 3600, production));
        const payload = { ...(issuer ? { issuer } : {}), version: 2, kind: 'ticket', owner, intent_id: solicitud.body.intent_id.toLowerCase(), items: quote.items.map(({ id, quantity, price, brand, name }) => ({ id, quantity, price, brand, name })), ...resumir_compra_academica(quote.subtotal, quote), expires: Date.now() + 1200000 };
        respuesta.json({ ticket: sign(payload), ...resumir_compra_academica(quote.subtotal, quote) });
    });
    route('post', '/api/presentation/payment', verificar_condiciones, async (solicitud, respuesta) => {
        if (!es_cuerpo_valido(solicitud.body, ['ticket'])) return respuesta.status(400).json({ error: 'Sólo se admite la referencia de presentación.' });
        const ticket = read(solicitud.body.ticket, 'ticket', obtener_dueno_del_recurso(solicitud));
        if (!ticket) return respuesta.status(400).json({ error: 'La referencia venció o no es válida. Volvé a intentarlo.' });
        // revalidar sin consumir usos: ninguna operacion de pago ni pedido comercial.
        const current = await quote_cart(database, ticket.items.map(({id, quantity}) => ({id, quantity})), ticket.coupon?.code || '', product_brand_column, solicitud.user?.id);
        if (current.error || current.coupon_error || current.warnings.length || current.subtotal !== ticket.subtotal || current.total !== ticket.total || (current.discount || 0) !== (ticket.discount || 0) || calcular_importes_del_producto(current.items) !== calcular_importes_del_producto(ticket.items) || (current.coupon?.id || null) !== (ticket.coupon?.id || null)) return respuesta.status(409).json({ error: 'Los importes o el cupón cambiaron. Volvé al carrito.' });
        // la referencia identifica tambien los importes y el cupon, conservando reintentos.
        const receipt = { ...ticket, kind: 'receipt', status: 'completed', reference: `DREAMS-${ticket.intent_id.replace(/-/g, '').toUpperCase() + (ticket.coupon ? '-' + crear_referencia_firmada(ticket) : '')}` };
        respuesta.json({ receipt: sign(receipt), status: receipt.status, reference: receipt.reference });
    });
    route('post', '/api/presentation/result', verificar_condiciones, async (solicitud, respuesta) => {
        if (!es_cuerpo_valido(solicitud.body, ['receipt'])) return respuesta.status(400).json({ error: 'Referencia inválida.' });
        const receipt = read(solicitud.body.receipt, 'receipt', obtener_dueno_del_recurso(solicitud));
        if (!receipt) return respuesta.status(400).json({ error: 'No se pudo verificar la presentación.' });
        respuesta.json({ status: receipt.status, reference: receipt.reference, ...resumir_compra_academica(receipt.subtotal, receipt), items: receipt.items, simulated: true });
    });
}
module.exports = { presentation_checkout: preparar_compra_academica, academic_summary: resumir_compra_academica };
