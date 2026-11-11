// pruebas de catalogo request order: usan datos ficticios para detectar cambios en respuestas, permisos y errores.
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { readFileSync } = require('node:fs');
const model = require('../public/js/catalog-filter-state');

function pendiente_respuesta() {
    let resolve;
    const promise = new Promise(done => { resolve = done; });
    return { promise, resolve };
}

function catalogo_contexto(responses) {
    const rendered = [], busy = [];
    const context = vm.createContext({
        window: { DreamsCatalogFilters: model }, URLSearchParams,
        document: { addEventListener() {}, getElementById: () => ({ setAttribute: (_, value) => busy.push(value) }) },
        fetch: () => responses.shift().promise, rendered
    });
    vm.runInContext(readFileSync('public/js/catalogo.js', 'utf8'), context);
    vm.runInContext("mostrar_carga_del_catalogo = () => {}; mostrar_catalogo = () => rendered.push(catalog_products[0].id); mostrar_error_del_catalogo = () => rendered.push(\"error\")", context);
    return { context, rendered, busy };
}

const respuesta = id => ({ ok: true, json: async () => [{ id }] });

test('una respuesta atrasada no reemplaza el catálogo de la consulta vigente', async () => {
    const old = pendiente_respuesta(), current = pendiente_respuesta();
    const { context, rendered } = catalogo_contexto([old, current]);
    const first = context.cargar_catalogo();
    const second = context.cargar_catalogo();
    current.resolve(respuesta(2)); await second;
    old.resolve(respuesta(1)); await first;
    assert.deepEqual(rendered, [2]);
});

test('un fallo atrasado tampoco borra resultados recientes ni su estado ocupado', async () => {
    const old = pendiente_respuesta(), current = pendiente_respuesta();
    const { context, rendered, busy } = catalogo_contexto([old, current]);
    const first = context.cargar_catalogo();
    const second = context.cargar_catalogo();
    current.resolve(respuesta(2)); await second;
    old.resolve({ ok: false, json: async () => ({ error: 'fixture' }) }); await first;
    assert.deepEqual(rendered, [2]);
    assert.deepEqual(busy, ['false']);
});

test('Escape cierra filtros incluso desde un buscador con texto, sin consumir sólo la limpieza nativa', () => {
    const { context } = catalogo_contexto([]);
    let closed = 0, prevented = 0;
    context.cerrar_filtros_del_catalogo = () => { closed++; };
    context.mantener_foco_en_los_filtros({ key: 'Escape', target: { type: 'search', value: 'Sauvage' }, preventDefault: () => { prevented++; } });
    assert.equal(closed, 1);
    assert.equal(prevented, 1);
});

test('el panel cabe en el viewport visible cuando se reduce el espacio del teclado', () => {
    const { context } = catalogo_contexto([]);
    const styles = {};
    context.window.visualViewport = { height: 400, offsetTop: 100 };
    context.window.matchMedia = () => ({ matches: true });
    context.document.getElementById = () => ({ style: { setProperty: (key, value) => { styles[key] = parseFloat(value); } } });
    context.ajustar_espacio_de_filtros();
    assert.ok(styles['--filter-top'] >= 100);
    assert.ok(styles['--filter-top'] + styles['--filter-height'] <= 500);
});

test('cerrar restaura el scroll sin esperar el evento nativo; un close antiguo no altera un panel reabierto', () => {
    const { context } = catalogo_contexto([]);
    const calls = [];
    context.recuperar_desplazamiento_del_fondo = () => calls.push('restore');
    context.document.getElementById = () => ({ open: true, close: () => calls.push('close') });
    context.cerrar_filtros_del_catalogo();
    assert.deepEqual(calls, ['restore', 'close']);
    context.comprobar_cierre_de_filtros();
    assert.deepEqual(calls, ['restore', 'close']);
});
