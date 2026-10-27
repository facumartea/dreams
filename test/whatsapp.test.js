const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const app = fs.readFileSync(require.resolve('../public/js/app.js'), 'utf8');
const detail = fs.readFileSync(require.resolve('../public/js/producto.js'), 'utf8');
function context(extra = {}) {
    const ctx = vm.createContext({ encodeURIComponent, URL, Intl, document: { addEventListener() {} }, ...extra });
    vm.runInContext(app.slice(app.indexOf('function whatsapp_link('), app.indexOf('function update_contact_emails(')), ctx);
    vm.runInContext(app.slice(app.indexOf('function format_price('), app.indexOf('function get_cart(')), ctx);
    vm.runInContext(detail, ctx); return ctx;
}
const product = { id: 1, brand: 'Marca Áurea', name: 'Café & Élite', size_ml: 100, price: 125000 };
test('WhatsApp conserva destinatario, cantidad, tamaño, nombre y precio sin romper Unicode', () => {
    const ctx = context({ product });
    const url = new URL(vm.runInContext("product_whatsapp_url(product, '542944160065')", ctx));
    assert.equal(url.origin, 'https://wa.me'); assert.equal(url.pathname, '/542944160065');
    const message = url.searchParams.get('text');
    assert.match(message, /1 × Marca Áurea Café & Élite de 100 ml/);
    assert.match(message, /\nPrecio: .*125[.]000/); assert.equal(url.searchParams.size, 1);
});
test('teléfono vacío, con letras, query, protocolo o longitud inválida no produce enlace', () => {
    const ctx = context();
    for (const value of [null, undefined, '', '1234567', '1234567890123456', '54abc4160065', 'javascript:alert(1)', '542944160065?text=otro', '54/2944160065']) {
        ctx.number = value; assert.equal(vm.runInContext('whatsapp_link(number)', ctx), null);
    }
    assert.equal(vm.runInContext("whatsapp_link(' 542944160065 ')", ctx), 'https://wa.me/542944160065');
});
test('marcas o tamaños ausentes no aparecen como undefined/null en el resumen', () => {
    const ctx = context({ product: { ...product, brand: null, size_ml: null } });
    const text = new URL(vm.runInContext("product_whatsapp_url(product,'542944160065')", ctx)).searchParams.get('text');
    assert.doesNotMatch(text, /undefined|null/); assert.match(text, /1 × Café & Élite/);
});
test('clic no se cancela ni espera la respuesta de consultas para abrir el enlace nativo', () => {
    let onClick, submitted, added = 0;
    const document = { addEventListener() {}, getElementById: () => ({ addEventListener(_name, action) { added++; } }), querySelector: () => ({ addEventListener(_name, action) { onClick = action; } }) };
    const ctx = context({ document, product, fetch: (url, options) => { submitted = { url, options }; return new Promise(() => {}); } });
    vm.runInContext('setup_product_actions(product)', ctx);
    assert.equal(onClick({ preventDefault() { assert.fail('no bloquear el enlace'); } }), undefined);
    assert.equal(added, 1); assert.equal(submitted.url, '/api/inquiries');
    assert.deepEqual(JSON.parse(submitted.options.body), { product_id: 1 }); assert.equal(submitted.options.keepalive, true);
});
test('sin teléfono el detalle sigue permitiendo agregar al carrito y no registra consultas', () => {
    const ctx = context({ document: { addEventListener() {}, getElementById: () => ({ addEventListener() {} }), querySelector: () => null }, product });
    assert.doesNotThrow(() => vm.runInContext('setup_product_actions(product)', ctx));
    ctx.escape_html = String;
    const markup = vm.runInContext('product_detail_actions(product,null)', ctx);
    assert.match(markup, /detail-add/); assert.match(markup, /WhatsApp no está disponible/); assert.doesNotMatch(markup, /href=/);
});
test('error de red al registrar consulta no altera el enlace ni genera un rechazo sin capturar', async () => {
    let onClick;
    const ctx = context({ document: { addEventListener() {}, getElementById: () => ({ addEventListener() {} }), querySelector: () => ({ addEventListener(_name, action) { onClick = action; } }) }, product, fetch: async () => { throw new Error('red'); } });
    vm.runInContext('setup_product_actions(product)', ctx); assert.equal(onClick({}), undefined);
    await new Promise(resolve => setImmediate(resolve));
});
test('contacto quita destinos inválidos y restaura sólo el configurado', () => {
    const attrs = new Map([['href','https://wa.me/numero-viejo']]);
    const link = { removeAttribute: name => attrs.delete(name), setAttribute: (name,value) => attrs.set(name,value), hasAttribute: () => false, set href(value) { attrs.set('href',value); } };
    const ctx = context({ document: { addEventListener() {}, querySelectorAll: () => [link] } });
    vm.runInContext('update_whatsapp_links({})', ctx); assert.equal(attrs.has('href'), false); assert.equal(attrs.get('aria-disabled'), 'true');
    vm.runInContext("update_whatsapp_links({whatsapp_number:'542944160065'})", ctx);
    assert.equal(attrs.get('href'), 'https://wa.me/542944160065'); assert.equal(attrs.has('aria-disabled'), false);
});
