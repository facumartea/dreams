const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function presentation(initial_reduced = false) {
    const events = {};
    const classes = new Set();
    const attributes = {};
    const preference = { matches: initial_reduced, addEventListener: (_, fn) => { events.preference = fn; } };
    const toggle = {
        hidden: true,
        setAttribute: (key, value) => { attributes[key] = value; },
        addEventListener: (_, fn) => { events.click = fn; }
    };
    const hero = {
        querySelector: () => toggle,
        querySelectorAll: () => [],
        classList: {
            add: key => classes.add(key),
            contains: key => key === 'hero-cinema' || classes.has(key),
            toggle: (key, enabled) => enabled ? classes.add(key) : classes.delete(key)
        }
    };
    const document = {
        readyState: 'complete', hidden: false,
        documentElement: { classList: { add() {} } },
        querySelector: selector => ['.hero', '.hero-cinema'].includes(selector) ? hero : null,
        querySelectorAll: () => [],
        addEventListener: (_, fn) => { events.visibility = fn; }
    };
    const window = { matchMedia: query => query.includes('reduced-motion') ? preference : { matches: false } };
    class IntersectionObserver {
        constructor(callback) { this.callback = callback; }
        observe(target) { if (target === hero) events.intersection = this.callback; }
    }
    window.IntersectionObserver = IntersectionObserver;
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../public/js/motion.js'), 'utf8'), {
        window, document, IntersectionObserver, requestAnimationFrame: fn => fn()
    });
    return { events, classes, attributes, preference, toggle, document };
}

test('la pausa elegida se conserva al volver de movimiento reducido o fuera de pantalla', () => {
    const p = presentation();
    assert.equal(p.toggle.hidden, false);
    p.events.click();
    assert.equal(p.attributes['aria-pressed'], 'true');
    assert.equal(p.toggle.textContent, 'Reanudar animación');
    p.preference.matches = true;
    p.events.preference();
    assert.equal(p.toggle.hidden, true);
    p.preference.matches = false;
    p.events.preference();
    p.events.intersection([{ isIntersecting: false }]);
    p.events.intersection([{ isIntersecting: true }]);
    assert.equal(p.classes.has('is-motion-paused'), true);
    p.events.click();
    assert.equal(p.classes.has('is-motion-paused'), false);
    assert.equal(p.attributes['aria-pressed'], 'false');
    p.document.hidden = true;
    p.events.visibility();
    assert.equal(p.classes.has('is-motion-paused'), true);
    p.document.hidden = false;
    p.events.visibility();
    assert.equal(p.classes.has('is-motion-paused'), false);
});

test('una preferencia inicial de movimiento reducido nunca inicia la presentación animada', () => {
    const p = presentation(true);
    assert.equal(p.classes.has('is-motion-paused'), true);
    assert.equal(p.toggle.hidden, true);
    assert.equal(p.attributes['aria-pressed'], 'false');
});
