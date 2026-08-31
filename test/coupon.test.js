const test = require('node:test');
const assert = require('node:assert/strict');
const { coupon_payload, normalize_coupon_code, discounted_totals, resolve_coupon } = require('../server/app');

function coupon_database(row) {
    return {
        from(table) {
            assert.equal(table, 'coupons');
            const builder = { select() { return builder; }, eq() { return builder; }, async maybeSingle() { return { data: row, error: null }; } };
            return builder;
        }
    };
}

test('normaliza códigos de cupón siempre en mayúsculas', () => {
    assert.equal(normalize_coupon_code(' verano25 '), 'VERANO25');
    assert.deepEqual(coupon_payload({ code: 'dreams10', discount_percent: 10, active: true }), {
        data: { code: 'DREAMS10', discount_percent: 10, active: true }
    });
});

test('rechaza porcentajes negativos, cero y mayores a 100', () => {
    for (const discount_percent of [-1, 0, 100.01, 101]) {
        assert.match(coupon_payload({ code: 'VALIDO', discount_percent }).error, /porcentaje/i);
    }
});

test('calcula subtotal, ahorro y total sin confiar en el cliente', () => {
    assert.deepEqual(discounted_totals(610000, 25), { subtotal: 610000, discount: 152500, total: 457500 });
});

test('aplica cupón activo y rechaza inexistente o inactivo', async () => {
    const active = await resolve_coupon(coupon_database({ id: 1, code: 'DREAMS10', discount_percent: 10, active: true, expires_at: null, minimum_purchase: null }), 'dreams10', 100000);
    assert.equal(active.coupon.code, 'DREAMS10');
    assert.equal(active.discount, 10000);
    assert.equal(active.total, 90000);

    for (const row of [null, { id: 2, code: 'OFF', discount_percent: 10, active: false, expires_at: null, minimum_purchase: null }]) {
        const invalid = await resolve_coupon(coupon_database(row), 'off', 100000);
        assert.equal(invalid.coupon, null);
        assert.equal(invalid.total, 100000);
        assert.equal(invalid.coupon_error, 'Cupón inválido.');
    }
});
