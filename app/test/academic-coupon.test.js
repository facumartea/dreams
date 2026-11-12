// cupon, totales firmados, limites y formato local del formulario.
const test = require('node:test');
const assert = require('node:assert/strict');
const { create_app, resolve_coupon } = require('../server/app');
const vm = require('node:vm');
const { readFileSync } = require('node:fs');
function fixture(override = {}, used = []) {
    const coupon = { id: 1, code: 'QA_ONLY', active: true, discount_percent: 12.5, ...override };
    return { coupon, from(table) {
        const q = { select() { return q; }, eq() { return q; }, in() { return q; }, maybeSingle() { return q; },
            then(ok, bad) { return Promise.resolve({ data: table === 'coupons' ? coupon : table === 'orders' ? used : [{ id: 7, price: 10.01, stock: 10, brand: 'QA', name: 'Fixture' }], error: null }).then(ok, bad); } };
        for (const method of ['insert', 'update', 'delete', 'upsert']) q[method] = () => assert.fail('La simulación no escribe');
        return q;
    } };
}
for (const [label, override] of [['inactivo', { active: false }], ['vencido', { expires_at: '2000-01-01' }], ['mínimo', { minimum_purchase: 100 }], ['por cuenta sin sesión', { per_user_limit: 1 }], ['condición no implementada', { conditions: { unknown: true } }]]) {
    test('cupón rechaza ' + label + ' sin descuento residual', async () => {
        const q = await resolve_coupon(fixture(override), 'QA_ONLY', 20.02);
        assert.equal(q.discount, 0); assert.equal(q.total, 20.02); assert.ok(q.coupon_error);
    });
}
test('ticket y recibo conservan descuento servidor y revalidan cupón antes de completar', async () => {
    const database = fixture(); const app = create_app({ database, presentation_checkout: true, presentation_signing_key: 'fixture-only-'.repeat(8), disable_request_log: true });
    const server = app.listen(0, '127.0.0.1'); await new Promise(r => server.once('listening', r));
    const base = 'http://127.0.0.1:' + server.address().port;
    const post = (path, data, cookie = '') => fetch(base + '/api/presentation/' + path, { method: 'POST', headers: { Origin: base, Cookie: cookie, 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    try {
        const body = { items: [{ id: 7, quantity: 2 }], intent_id: require('node:crypto').randomUUID(), coupon_code: 'QA_ONLY' };
        assert.equal((await post('session', { ...body, discount: 999 })).status, 400);
        const r = await post('session', body), cookie = r.headers.getSetCookie()[0].split(';')[0], quote = await r.json();
        assert.equal(quote.discount, 2.5); assert.equal(quote.total, 17.52); assert.equal(quote.shipping, 0);
        const paid = await (await post('payment', { ticket: quote.ticket }, cookie)).json();
        const result = await (await post('result', { receipt: paid.receipt }, cookie)).json();
        assert.equal(result.total, 17.52); assert.equal(result.discount, 2.5); assert.equal(result.simulated, true);
        const retry = await (await post('session', body, cookie)).json();
        assert.equal((await (await post('payment', { ticket: retry.ticket }, cookie)).json()).reference, paid.reference);
        database.coupon.active = false;
        assert.equal((await post('payment', { ticket: quote.ticket }, cookie)).status, 409);
    } finally { await new Promise(r => server.close(r)); }
});
test('máscaras normalizan pegado, signos, ceros y longitud sin storage ni red', () => {
    const c = vm.createContext({ document: { addEventListener() {} } });
    vm.runInContext(readFileSync(require.resolve('../public/js/academic-inputs.js'), 'utf8'), c);
    for (const [input, kind, expected] of [['00e1-2+3', 'cvv', '001'], ['1230', 'expiry', '12/30'], ['a00x12', 'expiry', '00/12'], ['0000123412341234999', 'number', '0000 1234 1234 1234']]) assert.equal(c.academic_format(input, kind), expected);
});

for (const [label, settings, used, user] of [
    ['global agotado', {max_uses: 1}, [{user_id:'A'}], null],
    ['por cuenta agotado', {per_user_limit: 1}, [{user_id:'A'}], 'A']
]) test('límite ' + label + ' no consume ni concede descuento', async () => {
    const q = await resolve_coupon(fixture(settings, used), 'QA_ONLY', 20.02, user);
    assert.ok(q.coupon_error); assert.equal(q.discount, 0);
});
test('límite por cuenta permite otra cuenta con usos disponibles sin consumirlos', async () => {
    const q = await resolve_coupon(fixture({per_user_limit: 1}, [{user_id:'A'}]), 'QA_ONLY', 20.02, 'B');
    assert.equal(q.discount, 2.5); assert.equal(q.coupon_error, null);
});

test('validación local distingue mes, longitud y ceros sin verificación bancaria', () => {
    const nodes = Object.fromEntries(['number','expiry','cvv'].map(id => ['demo-card-'+id, {value:''}]));
    const c = vm.createContext({document:{addEventListener(){},getElementById:id=>nodes[id]}});
    vm.runInContext(readFileSync(require.resolve('../public/js/academic-inputs.js'),'utf8'),c);
    for (const [number, expiry, cvv, expected] of [['0000 0000 0000 0000','12/30','001',true],['0000 0000 0000 0000','00/30','001',false],['0000 0000 0000 0000','13/30','001',false],['123','12/30','001',false],['0000 0000 0000 0000','1/30','001',false],['0000 0000 0000 0000','01/30','01',false]]) {
        nodes['demo-card-number'].value=number;nodes['demo-card-expiry'].value=expiry;nodes['demo-card-cvv'].value=cvv;
        assert.equal(c.academic_input_valid(),expected);
    }
});

test('pegado se normaliza antes del maxlength nativo y conserva ceros', () => {
    const listeners = {};
    const input = {value:'',selectionStart:0,selectionEnd:0,addEventListener:(k,fn)=>listeners[k]=fn,
        setRangeText(value){this.value=value;this.selectionStart=value.length;},
        dispatchEvent(){listeners.input();},setSelectionRange(){},setCustomValidity(){}};
    const c=vm.createContext({document:{addEventListener(){}},Event:class {}});
    vm.runInContext(readFileSync(require.resolve('../public/js/academic-inputs.js'),'utf8'),c);
    c.academic_mask(input,'cvv');
    listeners.paste({clipboardData:{getData:()=> '00e1+-999'},preventDefault(){}});
    assert.equal(input.value,'001');
});
