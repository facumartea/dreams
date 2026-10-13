// Comprueba resultados observables de: academic client never reads financial fields and retries a lost response with the same crypto intent.
async function verificar_academic_client_never_reads_financial_fields_and_ret_1(context) {
    let attempt = 0;
    let release;
    const wait = new Promise(resolve => { release = resolve; });
    const h = harness(async () => {
        if (++attempt === 1) throw new Error('lost response');
        await wait; return { ticket: 'signed-ticket' };
    });
    await h.sandbox.controller.setup();
    const click = h.node('checkout-submit').listeners.click;
    await click();
    assert.equal(h.node('checkout-submit').disabled, false);
    const before = JSON.parse(h.stored.get('dreams_presentation_checkout'));
    Object.assign(context, { attempt, release, wait, h, click, before });
}

// Comprueba resultados observables de: academic client never reads financial fields and retries a lost response with the same crypto intent.
async function verificar_academic_client_never_reads_financial_fields_and_ret_2(context) {
    const { release, h, click, before } = context;
    assert.match(before.intent_id, /^[a-f0-9-]{36}$/);
    const retry = click(); const double = click(); release();
    await Promise.all([retry, double]);
    const sessions = h.calls.filter(call => call.url.endsWith('/session'));
    assert.equal(sessions.length, 2); assert.equal(sessions[0].body.intent_id, sessions[1].body.intent_id);
    for (const session of sessions) assert.deepEqual(Object.keys(session.body).sort(), ['intent_id', 'items']);
    assert.equal(h.calls.filter(call => call.url.endsWith('/payment')).length, 1);
    assert.equal(h.sandbox.redirect, '/checkout-resultado.html?presentation=1');
    assert.equal(h.node('payment-title').textContent, 'Tarjeta');
    Object.assign(context, { retry, double, sessions });
}

// Comprueba resultados observables de: academic client never reads financial fields and retries a lost response with the same crypto intent.
async function verificar_academic_client_never_reads_financial_fields_and_ret_3(context) {
    const { h } = context;
    assert.equal(h.stored.get('dreams_presentation_receipt'), 'signed-fixture');
    assert.doesNotMatch(JSON.stringify([...h.stored]), /Cliente de prueba|card|cvv|expiry/);
}

// Responsabilidad academic fixture sandbox; preserva la secuencia original.
function academic_fixture_sandbox(node, stored, calls, fetch_session) {
    const items = [{ id: 7, quantity: 2, price: 120, brand: 'Fixture', name: 'Test product' }];
    const sandbox = {
        document: { getElementById: node, querySelector: node, createElement: node },
        sessionStorage: { getItem: k => stored.get(k) || null, setItem: (k, v) => stored.set(k, v), removeItem: k => stored.delete(k) },
        get_cart: () => sandbox.cart,
        checkout_items_payload: () => sandbox.cart.map(({ id, quantity }) => ({ id, quantity })),
        cart: items, save_cart() {}, render_checkout() {}, format_price: String, interface_error: e => e.message,
        crypto: { randomUUID }, window: { location: { assign: route => { sandbox.redirect = route; } } },
        fetch: async (url, options) => {
            const body = JSON.parse(options.body); calls.push({ url, body });
            let data;
            if (url === '/api/cart/quote') data = { items, subtotal: 240, total: 240, shipping: 0, shipping_label: 'Envío gratis' };
            else if (url.endsWith('/session')) data = await fetch_session(body);
            else data = { receipt: 'signed-fixture' };
            return { ok: true, json: async () => data };
        }
    };
    return sandbox;
}

// Nodos aislados de prueba: no hay credenciales ni DOM de clientes reales.
function academic_fixture_nodes() {
    const nodes = new Map();
    const node = key => {
        if (!nodes.has(key)) nodes.set(key, {
            value: key === 'demo-card-holder' ? 'Cliente de prueba' : '', disabled: true, listeners: {},
            addEventListener(type, fn) { this.listeners[type] = fn; },
            setAttribute() {}, removeAttribute() {}, before() {}, after() {}, append() {}, reset() {}, remove() {}
        });
        return nodes.get(key);
    };
    return { nodes, node };
}

const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { readFileSync } = require('node:fs');
const { randomUUID } = require('node:crypto');

function harness(fetch_session) {
    const { nodes, node } = academic_fixture_nodes();
    // Any read of a financial value fails this behavioral test.
    for (const id of ['demo-card-number', 'demo-card-expiry', 'demo-card-cvv']) Object.defineProperty(node(id), 'value', { get() { throw new Error('Financial field must not be read'); } });
    const stored = new Map();
    const calls = [];
    const sandbox = academic_fixture_sandbox(node, stored, calls, fetch_session);
    vm.createContext(sandbox);
    vm.runInContext(readFileSync(require.resolve('../public/js/presentation.js'), 'utf8') + '\nglobalThis.controller = PresentationCheckout;', sandbox);
    return { sandbox, nodes, node, stored, calls };
}

test('academic client never reads financial fields and retries a lost response with the same crypto intent; double clicks cannot duplicate submission', async () => {
    const context = {  };
    await verificar_academic_client_never_reads_financial_fields_and_ret_1(context);
    await verificar_academic_client_never_reads_financial_fields_and_ret_2(context);
    await verificar_academic_client_never_reads_financial_fields_and_ret_3(context);
});

test('academic completion keeps buyer-name and current-cart validation before any submission', async () => {
    const h = harness(async () => { throw new Error('Submission must not start'); });
    await h.sandbox.controller.setup();
    const click = h.node('checkout-submit').listeners.click;
    h.node('demo-card-holder').value = ' '; await click();
    assert.match(h.node('checkout-status').textContent, /nombre/);
    h.node('demo-card-holder').value = 'Cliente de prueba'; h.sandbox.cart = []; await click();
    assert.match(h.node('checkout-status').textContent, /carrito/);
    assert.equal(h.calls.filter(call => call.url.includes('/presentation/')).length, 0);
});
