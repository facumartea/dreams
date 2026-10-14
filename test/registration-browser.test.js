const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../public/js/cuenta.js'), 'utf8');

function browser(fetch) {
    const attrs = {};
    const button = { dataset: {}, textContent: 'Crear cuenta' };
    const form = { elements: [], reportValidity: () => true, getAttribute: key => attrs[key],
        setAttribute: (key, value) => { attrs[key] = value; }, querySelector: () => button };
    const nodes = { 'register-message': {}, 'register-name': { value: 'Prueba' },
        'register-email': { value: 'fixture@example.invalid' }, 'register-password': { value: 'fixture-password' },
        'register-confirm': { value: 'fixture-password', focus() {} } };
    const redirects = [];
    const context = vm.createContext({ fetch, document: { addEventListener() {}, getElementById: id => nodes[id] },
        window: { location: { assign: url => redirects.push(url) } }, escape_html: value => value });
    vm.runInContext(source, context);
    return { form, nodes, redirects, context, event: { preventDefault() {}, currentTarget: form } };
}

const success = () => Promise.resolve({ ok: true, json: async () => ({ authenticated: true }) });

test('registro solo redirige cuando el proveedor devuelve una sesión', async () => {
    const b = browser(success);
    await b.context.register(b.event);
    assert.deepEqual(b.redirects, ['/cuenta.html']);
    assert.match(b.nodes['register-message'].textContent, /Ya ingresaste/);
});

test('sesión ausente se informa como error sin aparentar ingreso', async () => {
    const b = browser(async () => ({ ok: true, json: async () => ({ authenticated: false, message: 'Sin sesión' }) }));
    await b.context.register(b.event);
    assert.deepEqual(b.redirects, []);
    assert.equal(b.nodes['register-message'].className, 'form-message error');
    assert.equal(b.form.getAttribute('aria-busy'), 'false');
});

test('mismatch de contraseñas bloquea la solicitud antes de enviar', async () => {
    let calls = 0;
    const b = browser(() => { calls++; return success(); });
    b.nodes['register-confirm'].value = 'different-fixture';
    await b.context.register(b.event);
    assert.equal(calls, 0);
    assert.match(b.nodes['register-message'].textContent, /no coinciden/);
});

test('doble submit programático no crea una segunda petición pendiente', async () => {
    let resolve, calls = 0;
    const b = browser(() => { calls++; return new Promise(done => { resolve = done; }); });
    const first = b.context.register(b.event);
    await b.context.register(b.event);
    assert.equal(calls, 1);
    resolve(await success());
    await first;
    assert.equal(b.redirects.length, 1);
});

test('fallo de red recupera controles y permite reintento', async () => {
    let calls = 0;
    const b = browser(() => ++calls === 1 ? Promise.reject(new Error('offline')) : success());
    await b.context.register(b.event);
    assert.match(b.nodes['register-message'].textContent, /Revisá tu conexión/);
    assert.equal(b.form.getAttribute('aria-busy'), 'false');
    await b.context.register(b.event);
    assert.equal(calls, 2);
    assert.deepEqual(b.redirects, ['/cuenta.html']);
});

test('registro mantiene campos accesibles sin instrucciones de confirmación', () => {
    const b = browser(success);
    const markup = b.context.legacy_account_markup('');
    assert.doesNotMatch(markup, /Si recibís un correo|Modo de prueba:|confirmar el correo/);
    assert.match(markup, /label for="register-name"/);
    assert.match(markup, /label for="register-confirm"/);
    assert.match(markup, /minlength="8" maxlength="128"/);
});
