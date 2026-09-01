const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const public_pages = ['index.html', 'catalogo.html', 'producto.html', 'carrito.html', 'cuenta.html', 'nosotros.html', 'checkout.html', 'checkout-resultado.html'];

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

test('el hero usa una imagen responsive de alta resolución y lettering HTML', () => {
    const html = fs.readFileSync(path.join(root, 'public/index.html'), 'utf8');
    assert.match(html, /dreams-hero-640\.webp 640w/);
    assert.match(html, /dreams-hero-1024\.webp 1024w/);
    assert.match(html, /<img src="\/assets\/dreams-hero-1024\.webp" width="1024" height="1536"/);
    assert.match(html, /class="hero-bottle-mark" aria-hidden="true"/);
});

test('el catálogo presenta una cabecera específica para Perfumes de Mujer', () => {
    const html = fs.readFileSync(path.join(root, 'public/catalogo.html'), 'utf8');
    const script = fs.readFileSync(path.join(root, 'public/js/catalogo.js'), 'utf8');
    const css = fs.readFileSync(path.join(root, 'public/css/style.css'), 'utf8');
    assert.match(html, /id="catalog-title"/);
    assert.match(script, /Perfumes de Mujer/);
    assert.match(script, /classList\.toggle\('is-women', is_women\)/);
    assert.match(script, /classList\.toggle\('women-collection', is_women\)/);
    assert.match(css, /\.catalog-page\.is-women \.page-intro/);
    assert.match(css, /\.women-collection \.site-header/);
});

test('el checkout declara modo demo, estados y diseño responsive', () => {
    const html = fs.readFileSync(path.join(root, 'public/checkout.html'), 'utf8');
    const result = fs.readFileSync(path.join(root, 'public/js/checkout-result.js'), 'utf8');
    const cart = fs.readFileSync(path.join(root, 'public/js/carrito.js'), 'utf8');
    assert.match(html, /MODO DEMO — No se realizarán cobros reales/);
    assert.match(html, /id="demo-card-form"[^>]*hidden/);
    assert.match(html, /DREAMS no envía ni guarda números o códigos de tarjeta/);
    assert.match(html, /id="sandbox-help"[^>]*hidden/);
    for (const state of ['approved', 'rejected', 'pending', 'cancelled', 'error']) assert.match(result, new RegExp(`${state}:`));
    assert.match(cart, /checkout_config\.enabled/);
});

test('motion premium usa JS liviano, fallback y reducción de movimiento', () => {
    const motion = fs.readFileSync(path.join(root, 'public/js/motion.js'), 'utf8');
    const css = fs.readFileSync(path.join(root, 'public/css/style.css'), 'utf8');
    const app = fs.readFileSync(path.join(root, 'public/js/app.js'), 'utf8');
    assert.match(motion, /IntersectionObserver/);
    assert.match(motion, /requestAnimationFrame/);
    assert.match(motion, /setup_scroll_depth/);
    assert.match(motion, /setup_entry_sequence/);
    assert.match(motion, /prefers-reduced-motion: reduce/);
    assert.doesNotMatch(motion, /three|webgl|gsap/i);
    assert.match(css, /--depth-x/);
    assert.match(css, /\.motion-spotlight/);
    assert.match(app, /motion_script\.src = '\/js\/motion\.js'/);
    assert.match(css, /\.motion-ready \.hero-entry/);
    assert.match(css, /\.motion-ready \.motion-heading/);
    for (const token of ['--motion-instant:', '--motion-fast:', '--motion-standard:', '--motion-editorial:', '--ease-out:', '--ease-editorial:']) {
        assert.ok(css.includes(token), `Falta el token de motion ${token}`);
    }
    assert.match(motion, /--hero-light-x/);
    assert.match(css, /\.hero-image::before/);
});

test('el detalle presenta las notas reales como un Scent Trail accesible', () => {
    const product = fs.readFileSync(path.join(root, 'public/js/producto.js'), 'utf8');
    const css = fs.readFileSync(path.join(root, 'public/css/style.css'), 'utf8');
    assert.match(product, /class="scent-trail" aria-labelledby="scent-trail-title"/);
    assert.match(product, /<ol class="notes-grid" aria-label="Etapas olfativas">/);
    assert.match(product, /product\.notes\.salida\.join/);
    assert.match(product, /product\.notes\.corazon\.join/);
    assert.match(product, /product\.notes\.fondo\.join/);
    assert.match(css, /\.scent-trail-header/);
    assert.match(css, /@media\(max-width:720px\).*\.notes-grid\{grid-template-columns:1fr/s);
});

test('registro comunica claramente el modo demo sin confirmación de correo', () => {
    const account = fs.readFileSync(path.join(root, 'public', 'js', 'cuenta.js'), 'utf8');
    const server = fs.readFileSync(path.join(root, 'server', 'server.js'), 'utf8');
    assert.match(account, /Modo demo:/);
    assert.match(account, /no necesitás confirmar el correo/);
    assert.match(server, /DEMO_AUTO_CONFIRM_EMAIL/);
});

test('carrito usa Comprar y checkout integra cupones persistentes en mayúsculas', () => {
    const cart = fs.readFileSync(path.join(root, 'public/js/carrito.js'), 'utf8');
    const html = fs.readFileSync(path.join(root, 'public/checkout.html'), 'utf8');
    const checkout = fs.readFileSync(path.join(root, 'public/js/checkout.js'), 'utf8');
    const admin = fs.readFileSync(path.join(root, 'views/admin.html'), 'utf8');
    assert.match(cart, />Comprar</);
    assert.doesNotMatch(cart, /Continuar al pago de prueba/);
    assert.match(html, /Cupón de descuento/);
    assert.match(checkout, /toUpperCase\(\)/);
    assert.match(checkout, /sessionStorage\.setItem\('dreams_coupon'/);
    assert.match(checkout, /\/api\/coupons\/validate/);
    assert.match(admin, /data-tab="cupones"/);
});
