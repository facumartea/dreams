const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { MercadoPagoProvider, normalize_payment_status, verify_webhook_signature } = require('../server/payments/mercado-pago');

test('normaliza todos los estados relevantes de Mercado Pago', () => {
    assert.equal(normalize_payment_status('approved'), 'approved');
    assert.equal(normalize_payment_status('rejected'), 'rejected');
    assert.equal(normalize_payment_status('pending'), 'pending');
    assert.equal(normalize_payment_status('in_process'), 'pending');
    assert.equal(normalize_payment_status('cancelled'), 'cancelled');
    assert.equal(normalize_payment_status('unknown'), 'error');
});

test('no activa checkout si falta token o secreto de Webhook', () => {
    assert.equal(new MercadoPagoProvider({ access_token: 'TEST-token', webhook_secret: '', mode: 'sandbox' }).configured, false);
    assert.equal(new MercadoPagoProvider({ access_token: '', webhook_secret: 'secret', mode: 'sandbox' }).configured, false);
    assert.equal(new MercadoPagoProvider({ access_token: 'TEST-token', webhook_secret: 'secret', mode: 'sandbox' }).configured, true);
});

test('valida firmas webhook con HMAC y rechaza alteraciones', () => {
    const data_id = '123456';
    const request_id = 'request-1';
    const ts = '1700000000';
    const secret = 'webhook-test-secret';
    const manifest = `id:${data_id};request-id:${request_id};ts:${ts};`;
    const v1 = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
    assert.equal(verify_webhook_signature({ signature: `ts=${ts},v1=${v1}`, request_id, data_id, secret }), true);
    assert.equal(verify_webhook_signature({ signature: `ts=${ts},v1=${v1}`, request_id, data_id: '999', secret }), false);
});

test('crea una preferencia Sandbox sin exponer el token en el payload', async () => {
    let received;
    const provider = new MercadoPagoProvider({
        access_token: 'TEST-token',
        webhook_secret: 'secret',
        mode: 'sandbox',
        fetch_impl: async (url, options) => {
            received = { url, options, body: JSON.parse(options.body) };
            return { ok: true, json: async () => ({ id: 'pref-1', sandbox_init_point: 'https://sandbox.mercadopago.test/checkout' }) };
        }
    });
    const result = await provider.create_checkout({
        order_id: '11111111-1111-4111-8111-111111111111',
        items: [{ id: 1, brand: 'DREAMS', name: 'Noche', size_ml: 100, price: 25000, quantity: 1 }],
        payer_email: 'cliente@example.com',
        app_base_url: 'https://dreams.example'
    });
    assert.equal(result.checkout_url, 'https://sandbox.mercadopago.test/checkout');
    assert.equal(received.options.headers.Authorization, 'Bearer TEST-token');
    assert.equal(received.body.external_reference, '11111111-1111-4111-8111-111111111111');
    assert.doesNotMatch(JSON.stringify(received.body), /TEST-token/);
});

test('diferencia error HTTP del proveedor y error de red', async () => {
    const server_error = new MercadoPagoProvider({
        access_token: 'TEST-token', mode: 'sandbox',
        fetch_impl: async () => ({ ok: false, status: 500, json: async () => ({ message: 'interno' }) })
    });
    await assert.rejects(() => server_error.get_payment('1'), error => error.code === 'MP_500' && !/interno/.test(error.message));

    const network_error = new MercadoPagoProvider({
        access_token: 'TEST-token', mode: 'sandbox',
        fetch_impl: async () => { throw new TypeError('network down'); }
    });
    await assert.rejects(() => network_error.get_payment('1'), /network down/);
});

test('una preferencia con cupón cobra exactamente el total recalculado', async () => {
    let body;
    const provider = new MercadoPagoProvider({
        access_token: 'TEST-token', mode: 'sandbox',
        fetch_impl: async (url, options) => { body = JSON.parse(options.body); return { ok: true, json: async () => ({ id: 'pref-discount', sandbox_init_point: 'https://sandbox.mercadopago.test/discount' }) }; }
    });
    await provider.create_checkout({
        order_id: '22222222-2222-4222-8222-222222222222',
        items: [{ id: 1, brand: 'DREAMS', name: 'Noche', size_ml: 100, price: 100000, quantity: 1 }],
        total: 90000,
        discount: 10000,
        app_base_url: 'https://dreams.example'
    });
    assert.equal(body.items.length, 1);
    assert.equal(body.items[0].unit_price, 90000);
    assert.equal(body.items[0].quantity, 1);
});
