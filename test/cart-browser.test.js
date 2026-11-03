const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { readFileSync } = require('node:fs');

// Execute the browser controller with deferred HTTP responses; no real API or storage.
function controller() {
    let cart = [{ id: 1, quantity: 1, price: 100 }];
    const requests = [], renders = [], saved = [], notices = [];
    const context = vm.createContext({
        document: { addEventListener() {} }, window: { addEventListener() {} },
        get_cart: () => cart, save_cart: value => { cart = value; saved.push(value); },
        show_toast: value => notices.push(value),
        fetch: path => path === '/api/checkout/config'
            ? Promise.resolve({ ok: true, json: async () => ({ enabled: true }) })
            : new Promise(resolve => requests.push(resolve))
    });
    vm.runInContext(readFileSync(require.resolve('../public/js/carrito.js'), 'utf8'), context);
    context.render_cart = (...args) => renders.push(args);
    return { context, requests, renders, saved, notices, setCart: value => { cart = value; } };
}
const reply = items => ({ ok: true, json: async () => ({ items, warnings: [], whatsapp_url: null }) });

test('una cotización tardía no restaura un carrito vaciado', async () => {
    const c = controller();
    const pending = c.context.load_cart();
    c.setCart([]);
    await c.context.load_cart();
    c.requests[0](reply([{ id: 1, quantity: 1 }]));
    await pending;
    assert.equal(c.saved.length, 0);
    assert.deepEqual(c.renders.at(-1)[0], []);
});

test('cambios rápidos de cantidad conservan la cotización más reciente', async () => {
    const c = controller();
    const first = c.context.load_cart();
    c.setCart([{ id: 1, quantity: 2 }]);
    const second = c.context.load_cart();
    c.requests[1](reply([{ id: 1, quantity: 2 }]));
    await second;
    c.requests[0](reply([{ id: 1, quantity: 1 }]));
    await first;
    assert.equal(c.saved.length, 1);
    assert.equal(c.saved[0][0].quantity, 2);
    assert.equal(c.renders.at(-1)[2], true);
});

test('fallo de configuración de pago conserva cotización y consulta válidas sin habilitar compra', async () => {
    for (const broken of [
        () => Promise.reject(new Error('offline')),
        () => Promise.resolve({ ok: true, json: async () => { throw new SyntaxError('not JSON'); } }),
        () => Promise.resolve({ ok: false })
    ]) {
        const c = controller();
        const fetchQuote = c.context.fetch;
        c.context.fetch = path => path === '/api/checkout/config' ? broken() : fetchQuote(path);
        const pending = c.context.load_cart();
        c.requests[0](reply([{ id: 1, quantity: 1, price: 150 }]));
        await pending;
        assert.equal(c.saved[0][0].price, 150);
        assert.equal(c.renders.at(-1)[2], false);
        assert.equal(c.renders.at(-1)[3], 'ready');
    }
});

test('cotización rechazada permite reintentar y nunca habilita comprar ni consultar', async () => {
    const c = controller();
    const failed = c.context.load_cart();
    c.requests[0]({ ok: false, json: async () => ({ error: 'No disponible' }) });
    await failed;
    assert.equal(c.saved.length, 0);
    assert.deepEqual(c.renders.at(-1).slice(1), [null, false, 'error']);
    const retry = c.context.load_cart();
    c.requests[1](reply([{ id: 1, quantity: 1 }]));
    await retry;
    assert.equal(c.renders.at(-1)[3], 'ready');
});
