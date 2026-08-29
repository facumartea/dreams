const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const public_pages = ['index.html', 'catalogo.html', 'producto.html', 'carrito.html', 'cuenta.html', 'nosotros.html'];

test('todas las páginas públicas usan el isotipo como favicon', () => {
    for (const page of public_pages) {
        const html = fs.readFileSync(path.join(root, 'public', page), 'utf8');
        assert.match(html, /<link rel="icon" type="image\/png" href="\/assets\/dreams-isotype\.png">/);
    }

    const asset = fs.readFileSync(path.join(root, 'public/assets/dreams-isotype.png'));
    assert.equal(asset.subarray(1, 4).toString(), 'PNG');
});

test('el sistema visual conserva los tokens y la reducción de movimiento', () => {
    const css = fs.readFileSync(path.join(root, 'public/css/style.css'), 'utf8');
    for (const token of ['--ink:', '--ivory:', '--accent:', '--display:', '--ui:']) {
        assert.ok(css.includes(token), `Falta el token visual ${token}`);
    }
    assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
    assert.match(css, /:focus-visible/);
});

test('la portada incluye un formulario accesible de opiniones persistentes', () => {
    const html = fs.readFileSync(path.join(root, 'public/index.html'), 'utf8');
    const script = fs.readFileSync(path.join(root, 'public/js/app.js'), 'utf8');
    assert.match(html, /<form id="review-form"[^>]*hidden>/);
    assert.match(html, /<label for="review-rating">/);
    assert.match(html, /<label for="review-comment">/);
    assert.match(html, /id="review-status" role="status" aria-live="polite"/);
    assert.match(script, /method: 'POST'/);
    assert.match(script, /await load_reviews\(\)/);
});
