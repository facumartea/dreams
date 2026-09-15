const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const experience_directory = path.join(root, 'public', 'experiencia');

test('la experiencia motion vive en una ruta aislada y no entra en la navegación actual', () => {
    const page = fs.readFileSync(path.join(experience_directory, 'index.html'), 'utf8');
    const home = fs.readFileSync(path.join(root, 'public', 'index.html'), 'utf8');
    const catalog = fs.readFileSync(path.join(root, 'public', 'catalogo.html'), 'utf8');
    assert.match(page, /<body class="motion-lab">/);
    assert.match(page, /href="\/experiencia\/experiencia\.css"/);
    assert.match(page, /src="\/experiencia\/experiencia\.js"/);
    assert.match(page, /<meta name="robots" content="noindex,nofollow">/);
    assert.doesNotMatch(home, /\/experiencia/);
    assert.doesNotMatch(catalog, /\/experiencia/);
});

test('la demo incluye storytelling, profundidad y datos olfativos reales', () => {
    const page = fs.readFileSync(path.join(experience_directory, 'index.html'), 'utf8');
    for (const feature of ['data-parallax', 'data-tilt', 'data-magnetic', 'data-studio-light', 'data-cursor-zone', 'data-scent-step']) {
        assert.match(page, new RegExp(feature));
    }
    assert.match(page, /Naranja · Bergamota/);
    assert.match(page, /Rosa · Jazmín/);
    assert.match(page, /Pachulí · Vetiver · Vainilla/);
});

test('motion experimental respeta reduced motion y evita dependencias externas', () => {
    const css = fs.readFileSync(path.join(experience_directory, 'experiencia.css'), 'utf8');
    const script = fs.readFileSync(path.join(experience_directory, 'experiencia.js'), 'utf8');
    const page = fs.readFileSync(path.join(experience_directory, 'index.html'), 'utf8');
    assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
    assert.match(css, /@media\(hover:none\),\(pointer:coarse\)/);
    assert.match(script, /requestAnimationFrame/);
    assert.match(script, /IntersectionObserver/);
    assert.match(script, /prefers-reduced-motion: reduce/);
    assert.doesNotMatch(page, /gsap|framer|three\.js/i);
});
