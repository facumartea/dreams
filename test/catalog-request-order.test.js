const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { readFileSync } = require('node:fs');
const model = require('../public/js/catalog-filter-state');

function pending_response() {
    let resolve;
    const promise = new Promise(done => { resolve = done; });
    return { promise, resolve };
}

function catalog_context(responses) {
    const rendered = [], busy = [];
    const context = vm.createContext({
        window: { DreamsCatalogFilters: model }, URLSearchParams,
        document: { addEventListener() {}, getElementById: () => ({ setAttribute: (_, value) => busy.push(value) }) },
        fetch: () => responses.shift().promise, rendered
    });
    vm.runInContext(readFileSync('public/js/catalogo.js', 'utf8'), context);
    vm.runInContext('show_catalog_loading = () => {}; render_catalog = () => rendered.push(catalog_products[0].id); catalog_error = () => rendered.push("error")', context);
    return { context, rendered, busy };
}

const response = id => ({ ok: true, json: async () => [{ id }] });

test('una respuesta atrasada no reemplaza el catálogo de la consulta vigente', async () => {
    const old = pending_response(), current = pending_response();
    const { context, rendered } = catalog_context([old, current]);
    const first = context.load_catalog();
    const second = context.load_catalog();
    current.resolve(response(2)); await second;
    old.resolve(response(1)); await first;
    assert.deepEqual(rendered, [2]);
});

test('un fallo atrasado tampoco borra resultados recientes ni su estado ocupado', async () => {
    const old = pending_response(), current = pending_response();
    const { context, rendered, busy } = catalog_context([old, current]);
    const first = context.load_catalog();
    const second = context.load_catalog();
    current.resolve(response(2)); await second;
    old.resolve({ ok: false, json: async () => ({ error: 'fixture' }) }); await first;
    assert.deepEqual(rendered, [2]);
    assert.deepEqual(busy, ['false']);
});

test('Escape cierra filtros incluso desde un buscador con texto, sin consumir sólo la limpieza nativa', () => {
    const { context } = catalog_context([]);
    let closed = 0, prevented = 0;
    context.close_catalog_filters = () => { closed++; };
    context.contain_filter_focus({ key: 'Escape', target: { type: 'search', value: 'Sauvage' }, preventDefault: () => { prevented++; } });
    assert.equal(closed, 1);
    assert.equal(prevented, 1);
});

test('el panel cabe en el viewport visible cuando se reduce el espacio del teclado', () => {
    const { context } = catalog_context([]);
    const styles = {};
    context.window.visualViewport = { height: 400, offsetTop: 100 };
    context.window.matchMedia = () => ({ matches: true });
    context.document.getElementById = () => ({ style: { setProperty: (key, value) => { styles[key] = parseFloat(value); } } });
    context.size_filter_viewport();
    assert.ok(styles['--filter-top'] >= 100);
    assert.ok(styles['--filter-top'] + styles['--filter-height'] <= 500);
});
