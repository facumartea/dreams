// pruebas de panel recovery: usan datos ficticios para detectar cambios en respuestas, permisos y errores.
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { readFileSync } = require('node:fs');
const product = { brand: 'DREAMS QA', name: 'QA recovery', price: 100, stock: 2, image_url: '/assets/dreams-bottle.png', featured: false };
const coupon = { code: 'QA_RECOVERY', discount_percent: 5, active: false };
const review = { rating: 4, comment: 'QA recovery' };
function harness(fetcher) {
    const h = vm.createContext({ document: { addEventListener() {} }, Intl });
    vm.runInContext(readFileSync(require.resolve('../public/js/admin.js'), 'utf8'), h);
    h.consultar_api_del_panel = fetcher;
    return h;
}
function uncertain(h, kind, value) { vm.runInContext(`uncertain_${kind}_create = ${JSON.stringify(value)}`, h); }

test('DR01 alta consulta primero existencia y no escribe si ya hay misma marca/nombre', async () => {
    const h = harness(async (_path, options) => { assert.equal(options, undefined); return [{ id: 1, ...product }]; });
    await assert.rejects(h.preparar_alta_del_perfume(product), /Ya existe/);
});
test('DR02 alta no escribe si falla la lectura previa', async () => {
    const h = harness(async () => { throw Error('red'); });
    await assert.rejects(h.preparar_alta_del_perfume(product), /red/);
});
test('DR03 alta rechaza respuesta de listado no canónica', async () => {
    await assert.rejects(harness(async () => ({})).preparar_alta_del_perfume(product), /listado/);
});
test('DR04 respuesta perdida recupera la fila y no realiza un segundo POST ni PUT', async () => {
    let writes = 0, exists = false;
    const h = harness(async (_path, options) => { if (!options) return exists ? [{ id: 3, ...product }] : []; writes++; exists = true; throw Error('respuesta perdida'); });
    const id = await h.preparar_alta_del_perfume(product);
    await assert.rejects(h.enviar_guardado_del_perfume(id, product));
    const recovered = await h.preparar_alta_del_perfume(product);
    assert.equal(recovered, 3);
    assert.equal((await h.enviar_guardado_del_perfume(recovered, product)).id, 3);
    assert.equal(writes, 1);
});
test('DR05 si no se llegó a insertar, el reintento permite exactamente un alta', async () => {
    let writes = 0;
    const h = harness(async (_path, options) => { if (!options) return []; writes++; return { id: 8 }; });
    uncertain(h, 'product', product);
    await h.enviar_guardado_del_perfume(await h.preparar_alta_del_perfume(product), product);
    assert.equal(writes, 1);
});
test('DR06 alta incierta con datos distintos en servidor no sobrescribe la fila', async () => {
    const h = harness(async () => [{ id: 4, ...product, price: 900 }]); uncertain(h, 'product', product);
    await assert.rejects(h.preparar_alta_del_perfume(product), /Ya existe/);
});
test('DR07 coincidencia ambigua no se adopta como alta recuperada', async () => {
    const h = harness(async () => [{ id: 4, ...product }, { id: 5, ...product }]); uncertain(h, 'product', product);
    await assert.rejects(h.preparar_alta_del_perfume(product), /Ya existe/);
});
test('DR08 campos corregidos tras pérdida de respuesta actualizan el ID recuperado', async () => {
    let method, path;
    const h = harness(async (url, options) => { if (!options) return [{ id: 4, ...product }]; method = options.method; path = url; return { id: 4 }; }); uncertain(h, 'product', product);
    const changed = { ...product, price: 120 };
    await h.enviar_guardado_del_perfume(await h.preparar_alta_del_perfume(changed), changed);
    assert.equal(method, 'PUT'); assert.equal(path, '/api/admin/products/4');
});

for (const [kind, value] of [['coupons', coupon], ['reviews', review]]) {
    for (const key of Object.keys(value)) {
        test(`FR-${kind}-${key} no anuncia guardado si lectura posterior discrepa`, async () => {
            const bad = typeof value[key] === 'number' ? 99 : typeof value[key] === 'boolean' ? true : 'diferente';
            await assert.rejects(harness(async () => [{ id: 2, ...value, [key]: bad }]).comprobar_registro_guardado(kind, { id: 2 }, value), /confirmar/);
        });
    }
    for (const [label, rows] of [['ausente', []], ['no-array', {}], ['otro-id', [{ id: 9, ...value }]], ['duplicado', [{ id: 2, ...value }, { id: 2, ...value }]]]) {
        test(`FR-${kind}-${label} rechaza lectura sin una única fila del ID correcto`, async () => {
            await assert.rejects(harness(async () => rows).comprobar_registro_guardado(kind, { id: 2 }, value));
        });
    }
    test(`FR-${kind}-red conserva error si falla lectura posterior`, async () => {
        await assert.rejects(harness(async () => { throw Error('red'); }).comprobar_registro_guardado(kind, { id: 2 }, value), /red/);
    });
    test(`FR-${kind}-valido confirma contenido completo, no sólo HTTP200`, async () => {
        const h = harness(async () => [{ id: 2, ...value }]);
        assert.equal((await h.comprobar_registro_guardado(kind, { id: 2 }, value)).id, 2);
    });
}
test('FR-normaliza números del formulario y texto con espacios', async () => {
    const stored = { id: 2, ...coupon };
    await harness(async () => [stored]).comprobar_registro_guardado('coupons', { id: '2' }, { ...coupon, code: ' QA_RECOVERY ', discount_percent: '5' });
});
test('FR-id inválido se rechaza antes de la lectura', async () => {
    await assert.rejects(harness(async () => assert.fail()).comprobar_registro_guardado('reviews', { id: -1 }, review));
});
test('FR-delete pérdida de respuesta se reconcilia con ausencia persistida', async () => {
    const h = harness(async (_path, options) => { if (options) throw Error('respuesta perdida'); return []; });
    await h.eliminar_registro_del_panel('coupons', 8);
});
test('FR-delete HTTP200 con fila existente no anuncia eliminación', async () => {
    await assert.rejects(harness(async (_path, options) => options ? {} : [{ id: 8 }]).eliminar_registro_del_panel('reviews', 8), /eliminación/);
});
test('FR-delete lectura no disponible mantiene error y evita éxito falso', async () => {
    await assert.rejects(harness(async (_path, options) => { if (options) return {}; throw Error('red'); }).eliminar_registro_del_panel('products', 8), /red/);
});
test('FR-cupón alta con código existente no emite POST', async () => {
    await assert.rejects(harness(async (_path, options) => { assert.equal(options, undefined); return [{ id: 3, ...coupon }]; }).preparar_alta_del_cupon(coupon), /Ya existe/);
});
test('FR-cupón reintento recupera respuesta perdida sin duplicar escritura', async () => {
    let writes = 0, exists = false;
    const h = harness(async (_path, options) => { if (!options) return exists ? [{ id: 3, ...coupon }] : []; writes++; exists = true; throw Error('perdida'); });
    await assert.rejects(h.enviar_guardado_del_cupon('', coupon));
    assert.equal((await h.enviar_guardado_del_cupon('', coupon)).id, 3); assert.equal(writes, 1);
});
test('FR-cupón intento incierto que difiere del servidor no sobrescribe', async () => {
    const h = harness(async () => [{ id: 3, ...coupon, active: true }]); uncertain(h, 'coupon', coupon);
    await assert.rejects(h.preparar_alta_del_cupon(coupon), /Ya existe/);
});

test('DR09 no elimina ni pide confirmación mientras hay guardado pendiente', async () => {
    const h = harness(async () => assert.fail()); h.mostrar_aviso = () => {}; h.confirm = () => assert.fail();
    vm.runInContext("product_save_pending = true", h);
    await h.eliminar_perfume(4, {});
});
function deletion_harness(editing, absent = true) {
    const h = harness(async (_path, options) => options ? {} : absent ? [] : [{ id: 4 }]);
    h.confirm = () => true; h.ejecutar_con_boton_bloqueado = async (_button, _label, action) => action();
    h.reset_count = 0; h.limpiar_formulario_del_perfume = () => { h.reset_count++; };
    h.busy = []; h.indicar_guardado_en_curso = value => h.busy.push(value);
    h.mostrar_aviso = () => {}; h.cargar_resumen_del_panel = h.cargar_perfumes_del_panel = async () => {};
    vm.runInContext(`editing_product_id = '${editing}'`, h);
    return h;
}
test('DR10 eliminar el producto editado limpia su ID y libera bloqueo al confirmar ausencia', async () => {
    const h = deletion_harness('4'); await h.eliminar_perfume(4, {});
    assert.equal(h.reset_count, 1); assert.deepEqual(h.busy, [true, false]);
});
test('DR11 eliminar otro producto conserva el borrador actual', async () => {
    const h = deletion_harness('9'); await h.eliminar_perfume(4, {});
    assert.equal(h.reset_count, 0);
});
test('DR12 borrado no persistido conserva borrador y libera controles para recuperación', async () => {
    const h = deletion_harness('4', false); await h.eliminar_perfume(4, {});
    assert.equal(h.reset_count, 0); assert.deepEqual(h.busy, [true, false]);
});
