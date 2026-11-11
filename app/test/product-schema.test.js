// pruebas de product schema: usan datos ficticios para detectar cambios en respuestas, permisos y errores.
const test = require('node:test');
const assert = require('node:assert/strict');
const { brand_column: obtener_columna_de_marca, normalize_product_brand: normalizar_marca_del_perfume, product_write_payload: preparar_datos_para_guardar_perfume, resolve_product_brand_column: detectar_columna_de_marca } = require('../server/product-schema');

test('marca se adapta al contrato brand sin alterar el producto original', () => {
    const row = { id: 1, marca: 'Marca de prueba', name: 'Producto de prueba', price: 123 };
    assert.deepEqual(normalizar_marca_del_perfume(row), { id: 1, brand: row.marca, name: row.name, price: 123 });
    assert.equal(row.marca, 'Marca de prueba');
    assert.deepEqual(preparar_datos_para_guardar_perfume({ brand: 'Marca', stock: 2 }, 'marca'), { marca: 'Marca', stock: 2 });
    assert.deepEqual(preparar_datos_para_guardar_perfume({ brand: 'Marca', stock: 2 }, 'brand'), { brand: 'Marca', stock: 2 });
    assert.throws(() => obtener_columna_de_marca('unexpected'), /inválida/);
});

function schema_base_de_datos(results, calls) {
    return { from(table) {
        assert.equal(table, 'products');
        return { select(column) { calls.push(column); return { async limit(size) {
            assert.equal(size, 1);
            return results[column];
        } }; } };
    } };
}

test('arranque detecta marca y mantiene compatibilidad con brand mediante sólo lecturas', async () => {
    let calls = [];
    assert.equal(await detectar_columna_de_marca(schema_base_de_datos({ marca: { data: [], error: null } }, calls)), 'marca');
    assert.deepEqual(calls, ['marca']);
    calls = [];
    assert.equal(await detectar_columna_de_marca(schema_base_de_datos({
        marca: { error: { code: '42703' } }, brand: { data: [], error: null }
    }, calls)), 'brand');
    assert.deepEqual(calls, ['marca', 'brand']);
});

test('arranque falla ante permisos, conexión o ambas columnas ausentes', async () => {
    const calls = [], error = { code: '42501' };
    await assert.rejects(detectar_columna_de_marca(schema_base_de_datos({ marca: { error } }, calls)), value => value === error);
    assert.deepEqual(calls, ['marca']);
    await assert.rejects(detectar_columna_de_marca(schema_base_de_datos({
        marca: { error: { code: '42703' } }, brand: { error: { code: '42703' } }
    }, [])), /compatible/);
});
