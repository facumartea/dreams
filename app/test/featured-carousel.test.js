// controles y navegacion real del carrusel sin autoplay.
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { readFileSync } = require('node:fs');

function carousel({ count = 8, reduced = false, region_present = true } = {}) {
    const previous = { addEventListener(type, callback) { this.click = callback; } };
    const next = { addEventListener(type, callback) { this.click = callback; } };
    const status = {}, controls = { hidden: true }, handlers = {}, moves = [];
    const track = { children: Array(count).fill({}), firstElementChild: { getBoundingClientRect: () => ({ width: 200 }) },
        clientWidth: 660, scrollWidth: count * 224 - 24, scrollLeft: 0,
        classList: { add() {} }, setAttribute() {}, addEventListener: (name, fn) => { handlers[name] = fn; },
        scrollBy: value => moves.push(value), scrollTo: value => moves.push(value) };
    const nodes = { '[data-carousel-previous]': previous, '[data-carousel-next]': next,
        '[data-featured-position]': status, '.featured-products-controls': controls };
    const sandbox = { document: { getElementById: () => region_present ? { querySelector: selector => nodes[selector] } : null },
        getComputedStyle: () => ({ columnGap: '24px' }), matchMedia: () => ({ matches: reduced }),
        ResizeObserver: class { observe() {} } };
    vm.createContext(sandbox);
    vm.runInContext(readFileSync(require.resolve('../public/js/featured-carousel.js'), 'utf8'), sandbox);
    sandbox.setup_featured_carousel(track);
    return { track, previous, next, status, controls, handlers, moves };
}

test('destacados: controles visibles, límites y contador del contenido real', () => {
    const c = carousel();
    assert.equal(c.controls.hidden, false);
    assert.equal(c.previous.disabled, true);
    assert.equal(c.next.disabled, false);
    assert.match(c.status.textContent, /1 de 8/);
    c.track.scrollLeft = c.track.scrollWidth - c.track.clientWidth;
    c.handlers.scroll();
    assert.equal(c.next.disabled, true);
    assert.equal(c.previous.disabled, false);
});

test('destacados: botones y teclado manual, sin interceptar tarjetas', () => {
    const c = carousel();
    c.next.click(); c.previous.click();
    assert.equal(c.moves[0].left, 224); assert.equal(c.moves[1].left, -224);
    let prevented = 0;
    c.handlers.keydown({ target: c.track, key: 'ArrowRight', preventDefault() { prevented++; } });
    c.handlers.keydown({ target: {}, key: 'ArrowRight', preventDefault() { prevented++; } });
    assert.equal(prevented, 1); assert.equal(c.moves.length, 3);
    c.handlers.keydown({ target: c.track, key: 'End', preventDefault() {} });
    assert.equal(c.moves.at(-1).left, c.track.scrollWidth);
});

test('destacados: movimiento reducido y degradación sin múltiples productos', () => {
    const c = carousel({ reduced: true }); c.next.click();
    assert.equal(c.moves[0].behavior, 'instant');
    assert.equal(carousel({ count: 1 }).controls.hidden, true);
    assert.doesNotThrow(() => carousel({ region_present: false }));
});
