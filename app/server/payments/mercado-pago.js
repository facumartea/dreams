const crypto = require('node:crypto');

const PAYMENT_API = 'https://api.mercadopago.com';
const PAYMENT_STATES = new Set(['approved', 'rejected', 'pending', 'cancelled', 'error']);

function normalize_payment_status(status) {
    const value = String(status || '').toLowerCase();
    if (value === 'approved') return 'approved';
    if (value === 'rejected') return 'rejected';
    if (['cancelled', 'refunded', 'charged_back'].includes(value)) return 'cancelled';
    if (['pending', 'in_process', 'authorized'].includes(value)) return 'pending';
    return 'error';
}

function parse_signature(value) {
    return Object.fromEntries(String(value || '').split(',').map(part => part.trim().split('=')).filter(parts => parts.length === 2));
}

function secure_equal(left, right) {
    const a = Buffer.from(String(left || ''), 'utf8');
    const b = Buffer.from(String(right || ''), 'utf8');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function verify_webhook_signature({ signature, request_id, data_id, secret }) {
    if (!signature || !request_id || !data_id || !secret) return false;
    const values = parse_signature(signature);
    if (!values.ts || !values.v1) return false;
    const manifest = `id:${String(data_id).toLowerCase()};request-id:${request_id};ts:${values.ts};`;
    const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
    return secure_equal(expected, values.v1);
}

class MercadoPagoProvider {
    constructor({ access_token, webhook_secret, mode = 'sandbox', fetch_impl = fetch, api_url = PAYMENT_API }) {
        this.access_token = String(access_token || '');
        this.webhook_secret = String(webhook_secret || '');
        this.mode = mode === 'production' ? 'production' : 'sandbox';
        this.fetch = fetch_impl;
        this.api_url = api_url;
        this.name = 'mercado_pago';
    }

    get configured() {
        return Boolean(this.access_token && this.webhook_secret);
    }

    async request(path, options = {}) {
        const response = await this.fetch(`${this.api_url}${path}`, {
            ...options,
            signal: options.signal || AbortSignal.timeout(15000),
            headers: {
                Authorization: `Bearer ${this.access_token}`,
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            const error = new Error('Mercado Pago no pudo procesar la solicitud.');
            error.code = `MP_${response.status}`;
            throw error;
        }
        return data;
    }

    async create_checkout({ order_id, items, total, discount = 0, payer_email, app_base_url }) {
        const result_path = `${app_base_url}/checkout-resultado.html`;
        const checkout_items = discount > 0
            ? [{ id: order_id, title: 'Pedido DREAMS con descuento', description: `${items.length} producto(s)`, category_id: 'beauty', currency_id: 'ARS', quantity: 1, unit_price: total }]
            : items.map(item => ({
                id: String(item.id),
                title: `${item.brand} ${item.name}`.slice(0, 256),
                description: `${item.size_ml || ''} ml`.trim(),
                category_id: 'beauty',
                currency_id: 'ARS',
                quantity: item.quantity,
                unit_price: item.price
            }));
        const body = {
            items: checkout_items,
            external_reference: order_id,
            metadata: { order_id },
            payer: payer_email ? { email: payer_email } : undefined,
            back_urls: {
                success: `${result_path}?result=success&order_id=${encodeURIComponent(order_id)}`,
                failure: `${result_path}?result=failure&order_id=${encodeURIComponent(order_id)}`,
                pending: `${result_path}?result=pending&order_id=${encodeURIComponent(order_id)}`
            },
            auto_return: 'approved',
            notification_url: `${app_base_url}/api/payments/webhook`
        };
        const preference = await this.request('/checkout/preferences', {
            method: 'POST',
            headers: { 'X-Idempotency-Key': order_id },
            body: JSON.stringify(body)
        });
        const checkout_url = this.mode === 'sandbox' ? preference.sandbox_init_point : preference.init_point;
        if (!preference.id || !checkout_url) throw new Error('Mercado Pago devolvió una preferencia incompleta.');
        return { preference_id: preference.id, checkout_url };
    }

    async get_payment(payment_id) {
        const payment = await this.request(`/v1/payments/${encodeURIComponent(payment_id)}`);
        return {
            id: String(payment.id),
            order_id: String(payment.external_reference || payment.metadata?.order_id || ''),
            status: normalize_payment_status(payment.status),
            status_detail: String(payment.status_detail || '').slice(0, 160),
            amount: Number(payment.transaction_amount),
            currency: String(payment.currency_id || ''),
            paid_at: payment.date_approved || null,
            live_mode: Boolean(payment.live_mode)
        };
    }

    verify_webhook(headers, data_id) {
        return verify_webhook_signature({
            signature: headers['x-signature'],
            request_id: headers['x-request-id'],
            data_id,
            secret: this.webhook_secret
        });
    }
}

module.exports = { MercadoPagoProvider, normalize_payment_status, verify_webhook_signature, PAYMENT_STATES };
