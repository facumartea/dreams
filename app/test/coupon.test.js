// pruebas de cupones: usan datos ficticios para detectar cambios en respuestas, permisos y errores.
const test = require('node:test');
const assert = require('node:assert/strict');
const { coupon_payload: preparar_datos_del_cupon, normalize_coupon_code: normalizar_codigo_del_cupon, discounted_totals: calcular_totales_con_descuento, resolve_coupon: resolver_cupon } = require('../server/app');

function cupon_base_de_datos(row) {
    return {
        from(table) {
            assert.equal(table, 'coupons');
            const builder = { select() { return builder; }, eq() { return builder; }, async maybeSingle() { return { data: row, error: null }; } };
            return builder;
        }
    };
}

test('normaliza códigos de cupón siempre en mayúsculas', () => {
    assert.equal(normalizar_codigo_del_cupon(' verano25 '), 'VERANO25');
    assert.deepEqual(preparar_datos_del_cupon({ code: 'dreams10', discount_percent: 10, active: true }), {
        data: { code: 'DREAMS10', discount_percent: 10, active: true }
    });
});

test('rechaza porcentajes negativos, cero y mayores a 100', () => {
    for (const discount_percent of [-1, 0, 100.01, 101]) {
        assert.match(preparar_datos_del_cupon({ code: 'VALIDO', discount_percent }).error, /porcentaje/i);
    }
});

test('calcula subtotal, ahorro y total sin confiar en el cliente', () => {
    assert.deepEqual(calcular_totales_con_descuento(610000, 25), { subtotal: 610000, discount: 152500, total: 457500 });
});

test('aplica cupón activo y rechaza inexistente o inactivo', async () => {
    const active = await resolver_cupon(cupon_base_de_datos({ id: 1, code: 'DREAMS10', discount_percent: 10, active: true, expires_at: null, minimum_purchase: null }), 'dreams10', 100000);
    assert.equal(active.coupon.code, 'DREAMS10');
    assert.equal(active.discount, 10000);
    assert.equal(active.total, 90000);

    for (const row of [null, { id: 2, code: 'OFF', discount_percent: 10, active: false, expires_at: null, minimum_purchase: null }]) {
        const invalid = await resolver_cupon(cupon_base_de_datos(row), 'off', 100000);
        assert.equal(invalid.coupon, null);
        assert.equal(invalid.total, 100000);
        assert.equal(invalid.coupon_error, 'Cupón inválido o inactivo.');
    }
});
