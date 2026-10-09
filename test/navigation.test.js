const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const navigation = require('../public/js/navigation.js');

test('la ruta y el género seleccionan un único destino exacto', () => {
    for (const [route, expected] of [
        ['/', 'inicio'], ['/index.html', 'inicio'], ['/catalogo.html', 'perfumes'],
        ['/catalogo.html?gender=mujer&search=rose', 'mujer'],
        ['/catalogo.html?gender=hombre', 'hombre'], ['/catalogo.html?gender=unisex', 'unisex'],
        ['/nosotros.html', 'nosotros'], ['/producto.html?id=199', null],
        ['/carrito.html', null], ['/cuenta.html', null], ['/checkout.html', null],
        ['/catalogo.html?gender=mujeres', 'perfumes'], ['/catalogo.html.extra', null]
    ]) assert.equal(navigation.selection(route), expected, route);
});

test('cambiar género y limpiarlo reemplaza la selección sin heredar la URL anterior', () => {
    assert.equal(navigation.selection('/catalogo.html?gender=mujer', 'hombre'), 'hombre');
    assert.equal(navigation.selection('/catalogo.html?gender=mujer', ''), 'perfumes');
});

test('una navegación limpia marcas antiguas de todos los enlaces y categorías usan aria-current', () => {
    const routes = ['/', '/catalogo.html', '/catalogo.html?gender=mujer', '/catalogo.html?gender=hombre', '/catalogo.html?gender=unisex', '/nosotros.html'];
    const links = routes.map(route => ({
        href: 'https://dreams.example' + route, dataset: {}, attributes: { 'aria-current': 'page' },
        removeAttribute(key) { delete this.attributes[key]; },
        setAttribute(key, value) { this.attributes[key] = value; }
    }));
    globalThis.document = { querySelectorAll: () => links };
    globalThis.location = { href: 'https://dreams.example/catalogo.html?gender=mujer', origin: 'https://dreams.example' };
    try {
        for (const [gender, index] of [[undefined, 2], ['hombre', 3], ['', 1]]) {
            navigation.update(gender);
            assert.deepEqual(links.map((link, i) => link.attributes['aria-current'] ? i : null).filter(i => i !== null), [index]);
        }
        globalThis.location.href = 'https://dreams.example/carrito.html';
        navigation.update();
        assert.equal(links.filter(link => link.attributes['aria-current']).length, 0);
    } finally { delete globalThis.document; delete globalThis.location; }
});

test('las páginas públicas pre-renderizan una única plantilla de footer y datos aprobados', () => {
    const template = readFileSync('templates/public-footer.html', 'utf8').trim();
    for (const page of ['index', 'catalogo', 'producto', 'nosotros', 'carrito', 'cuenta', 'checkout', 'checkout-resultado']) {
        const html = readFileSync(`public/${page}.html`, 'utf8');
        assert.equal(html.match(/<footer class="site-footer">[\s\S]*?<\/footer>/)[0], template, page);
        assert.equal((html.match(/class="site-footer"/g) || []).length, 1);
    }
    const contacts = require('../server/contacts.js');
    for (const email of contacts.emails) assert.ok(template.includes(`href="mailto:${email}"`));
    for (const phone of contacts.phones) assert.ok(template.includes(`href="tel:+${phone.replace(/\D/g, '')}"`));
    assert.ok(template.includes(`https://wa.me/${contacts.whatsapp_number}`));
});

test('la marca filtrada en la URL se restaura después de cargar las opciones asíncronas', async () => {
    const vm = require('node:vm');
    const options = [{ value: '' }];
    let selected = '';
    const select = {
        get value() { return selected; },
        set value(value) { selected = options.some(option => option.value === value) ? value : ''; },
        set length(value) { options.length = value; },
        appendChild(option) { options.push(option); }
    };
    const sandbox = {
        URLSearchParams,
        window: { location: { search: '?gender=mujer&brand=Byredo' } },
        document: { addEventListener() {}, getElementById: () => select, createElement: () => ({}) },
        fetch: async () => ({ ok: true, json: async () => ['Byredo', 'Dior'] })
    };
    vm.createContext(sandbox);
    vm.runInContext(readFileSync('public/js/catalogo.js', 'utf8'), sandbox);
    await vm.runInContext('load_brands()', sandbox);
    assert.equal(select.value, 'Byredo');
    select.value = 'Dior';
    await vm.runInContext('load_brands()', sandbox);
    assert.equal(select.value, 'Dior');
});
