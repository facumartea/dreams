const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const { parse } = require('acorn');

function carousel(slide_count = 3) {
    const listeners = new Map();
    const slides = Array.from({ length: slide_count }, (_, i) => ({ hidden: false, querySelector: () => ({ textContent: ['Mujer', 'Hombre', 'Unisex'][i] }) }));
    const control = name => ({ hidden: true, addEventListener: (event, action) => listeners.set(name + ':' + event, action) });
    const nodes = { '.carousel-controls': control('controls'), '.carousel-status': { textContent: '' },
        '[data-carousel-previous]': control('previous'), '[data-carousel-next]': control('next') };
    const root = { querySelectorAll: () => slides, querySelector: key => nodes[key], addEventListener: (event, action) => listeners.set(event, action) };
    const source = readFileSync(require.resolve('../public/js/app.js'), 'utf8');
    const fn = parse(source, { ecmaVersion: 'latest' }).body.find(node => node.id?.name === 'setup_collection_carousel');
    vm.runInNewContext(source.slice(fn.start, fn.end) + '\nsetup_collection_carousel();', { document: { querySelector: () => root } });
    return { listeners, slides, nodes };
}

test('carrusel presenta contenido distinto y envuelve al avanzar y retroceder', () => {
    const h = carousel();
    assert.deepEqual(h.slides.map(s => s.hidden), [false, true, true]);
    h.listeners.get('next:click')();
    assert.match(h.nodes['.carousel-status'].textContent, /2 de 3: Hombre/);
    h.listeners.get('previous:click')();
    h.listeners.get('previous:click')();
    assert.match(h.nodes['.carousel-status'].textContent, /3 de 3: Unisex/);
    assert.equal(h.nodes['.carousel-controls'].hidden, false);
});
test('flechas actúan sólo con foco en controles, sin secuestrar otros campos', () => {
    const h = carousel(); let prevented = 0;
    const event = match => ({ key: 'ArrowRight', target: { matches: () => match }, preventDefault: () => { prevented++; } });
    h.listeners.get('keydown')(event(false));
    assert.match(h.nodes['.carousel-status'].textContent, /1 de 3/);
    h.listeners.get('keydown')(event(true));
    assert.match(h.nodes['.carousel-status'].textContent, /2 de 3/);
    assert.equal(prevented, 1);
});
test('una sola opción conserva el contenido y no activa controles', () => {
    const h = carousel(1);
    assert.equal(h.nodes['.carousel-controls'].hidden, true);
    assert.equal(h.slides[0].hidden, false);
    assert.equal(h.listeners.size, 0);
});
