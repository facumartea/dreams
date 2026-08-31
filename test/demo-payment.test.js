const test = require('node:test');
const assert = require('node:assert/strict');
const { DemoPaymentProvider, normalize_demo_scenario } = require('../server/payments/demo');

test('checkout demo está configurado sin secretos y no genera una URL externa', async () => {
    const provider = new DemoPaymentProvider();
    assert.equal(provider.configured, true);
    assert.equal(provider.name, 'demo');
    assert.equal(provider.mode, 'demo');
    const checkout = await provider.create_checkout({ order_id: '11111111-1111-4111-8111-111111111111' });
    assert.equal(checkout.checkout_url, null);
    assert.equal(checkout.requires_demo_payment, true);
    assert.match(checkout.preference_id, /^demo_order_/);
});

test('checkout demo contempla aprobado, rechazado, pendiente y error', async () => {
    const provider = new DemoPaymentProvider();
    for (const status of ['approved', 'rejected', 'pending', 'error']) {
        assert.equal(normalize_demo_scenario(status.toUpperCase()), status);
        const payment = await provider.process_payment({ order_id: '22222222-2222-4222-8222-222222222222', scenario: status });
        assert.equal(payment.status, status);
        assert.equal(payment.order_id, '22222222-2222-4222-8222-222222222222');
        assert.equal(payment.paid_at === null, status !== 'approved');
        assert.match(payment.id, /^demo_[0-9a-f-]{36}$/);
    }
});

test('checkout demo rechaza escenarios fuera de la lista permitida', async () => {
    const provider = new DemoPaymentProvider();
    assert.equal(normalize_demo_scenario('inventado'), null);
    await assert.rejects(
        () => provider.process_payment({ order_id: '33333333-3333-4333-8333-333333333333', scenario: 'inventado' }),
        error => error.code === 'DEMO_SCENARIO_INVALID'
    );
});
