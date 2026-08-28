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
