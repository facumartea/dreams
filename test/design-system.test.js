const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const public_pages = ['index.html', 'catalogo.html', 'producto.html', 'carrito.html', 'cuenta.html', 'nosotros.html', 'checkout.html', 'checkout-resultado.html', '404.html'];

test('todas las páginas públicas usan el isotipo como favicon', () => {
    for (const page of public_pages) {
        const html = fs.readFileSync(path.join(root, 'public', page), 'utf8');
        assert.match(html, /<link rel="icon" type="image\/png" href="\/assets\/dreams-isotype\.png">/);
    }

    const asset = fs.readFileSync(path.join(root, 'public/assets/dreams-isotype.png'));
    assert.equal(asset.subarray(1, 4).toString(), 'PNG');
});

test('SEO técnico publica canonical, metadatos, sitemap, robots y 404 real', () => {
    const home = fs.readFileSync(path.join(root, 'public/index.html'), 'utf8');
    const catalog = fs.readFileSync(path.join(root, 'public/catalogo.html'), 'utf8');
    const product_page = fs.readFileSync(path.join(root, 'public/producto.html'), 'utf8');
    const product_script = fs.readFileSync(path.join(root, 'public/js/producto.js'), 'utf8');
    const catalog_script = fs.readFileSync(path.join(root, 'public/js/catalogo.js'), 'utf8');
    const robots = fs.readFileSync(path.join(root, 'public/robots.txt'), 'utf8');
    const sitemap = fs.readFileSync(path.join(root, 'public/sitemap.xml'), 'utf8');
    const not_found = fs.readFileSync(path.join(root, 'public/404.html'), 'utf8');

    assert.match(home, /rel="canonical" href="https:\/\/dreams-perfumes\.up\.railway\.app\/"/);
    assert.match(home, /property="og:title"/);
    assert.match(catalog, /id="canonical-url" rel="canonical"/);
    assert.match(product_page, /property="og:type" content="product"/);
    assert.match(catalog_script, /canonical\.href/);
    assert.match(product_script, /function update_product_metadata/);
    assert.match(robots, /Sitemap: https:\/\/dreams-perfumes\.up\.railway\.app\/sitemap\.xml/);
    assert.match(sitemap, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
    assert.match(not_found, /<meta name="robots" content="noindex,follow">/);
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

test('el catálogo comparte una arquitectura de variantes para Mujer, Hombre y Unisex', () => {
    const html = fs.readFileSync(path.join(root, 'public/catalogo.html'), 'utf8');
    const script = fs.readFileSync(path.join(root, 'public/js/catalogo.js'), 'utf8');
    const css = fs.readFileSync(path.join(root, 'public/css/style.css'), 'utf8');
    assert.match(html, /id="catalog-title"/);
    assert.match(script, /Fragancias Femeninas/);
    assert.match(script, /const COLLECTION_VARIANTS/);
    for (const variant of ['mujer', 'hombre', 'unisex']) assert.match(script, new RegExp(`${variant}: \\{`));
    assert.match(script, /Perfumes de Hombre/);
    assert.match(script, /Perfumes Unisex/);
    assert.match(script, /page\.classList\.remove\(\.\.\.page_classes\)/);
    assert.match(css, /\.catalog-page:is\(\.is-women,\.is-men,\.is-unisex\) \.page-intro/);
    for (const class_name of ['collection-women', 'collection-men', 'collection-unisex']) assert.match(css, new RegExp(`\\.${class_name}\\{`));
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
    assert.match(result, /Pago realizado con éxito/);
    assert.match(result, /data\.order_number/);
    assert.match(result, /N° de compra/);
    assert.match(result, /payment-result-icon/);
    assert.match(cart, /checkout_config\.enabled/);
});

test('checkout demo retoma un pedido interrumpido sin crear otro', () => {
    const checkout = fs.readFileSync(path.join(root, 'public/js/checkout.js'), 'utf8');
    assert.match(checkout, /DEMO_ORDER_STORAGE_KEY/);
    assert.match(checkout, /Retomando el pedido sin duplicarlo/);
    assert.match(checkout, /payment_response\.status === 409/);
    assert.match(checkout, /sessionStorage\.setItem\(DEMO_ORDER_STORAGE_KEY, data\.order_id\)/);
});

test('el lettering del frasco mantiene jerarquía responsive', () => {
    const css = fs.readFileSync(path.join(root, 'public/css/style.css'), 'utf8');
    assert.match(css, /\.hero-bottle-mark strong\{font:500 clamp\(1\.14rem,1\.9vw,1\.88rem\)/);
    assert.match(css, /\.hero-bottle-mark small\{margin-top:\.46rem;font-size:clamp\(\.32rem,\.49vw,\.47rem\)/);
});

test('motion premium usa JS liviano, fallback y reducción de movimiento', () => {
    const motion = fs.readFileSync(path.join(root, 'public/js/motion.js'), 'utf8');
    const css = fs.readFileSync(path.join(root, 'public/css/style.css'), 'utf8');
    const app = fs.readFileSync(path.join(root, 'public/js/app.js'), 'utf8');
    assert.match(motion, /IntersectionObserver/);
    assert.match(motion, /requestAnimationFrame/);
    assert.match(motion, /setup_scroll_depth/);
    assert.doesNotMatch(motion, /setup_entry_sequence|setup_hero_depth|setup_magnetic_buttons/);
    assert.match(motion, /prefers-reduced-motion: reduce/);
    assert.doesNotMatch(motion, /three|webgl|gsap/i);
    assert.doesNotMatch(css, /--depth-x/);
    assert.match(app, /motion_script\.src = '\/js\/motion\.js'/);
    assert.doesNotMatch(css, /\.hero-entry/);
    assert.match(css, /\.motion-ready \.motion-heading/);
    for (const token of ['--motion-instant:', '--motion-fast:', '--motion-standard:', '--motion-editorial:', '--ease-out:', '--ease-editorial:']) {
        assert.ok(css.includes(token), `Falta el token de motion ${token}`);
    }
    assert.doesNotMatch(motion, /--hero-light-x/);
    assert.match(css, /\.hero-image::before/);
});

test('la portada no conserva el banner claro y evita el espacio vacío bajo el hero', () => {
    const html = fs.readFileSync(path.join(root, 'public/index.html'), 'utf8');
    const css = fs.readFileSync(path.join(root, 'public/css/style.css'), 'utf8');
    const motion = fs.readFileSync(path.join(root, 'public/js/motion.js'), 'utf8');
    assert.doesNotMatch(html, /class="split-banner"/);
    assert.doesNotMatch(html, /images\.unsplash\.com\/photo-1541643600914-78b084683601/);
    assert.match(css, /@media\(min-width:921px\)\{\.hero-static\{height:calc\(100svh - 78px\);min-height:660px\}/);
    assert.doesNotMatch(motion, /querySelectorAll\([^)]*brand-statement/);
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

test('Admin expone pedidos y gestión persistente de opiniones', () => {
    const admin = fs.readFileSync(path.join(root, 'views/admin.html'), 'utf8');
    const script = fs.readFileSync(path.join(root, 'public/js/admin.js'), 'utf8');
    assert.match(admin, /data-tab="pedidos"/);
    assert.match(admin, /id="review-search"/);
    assert.match(script, /\/api\/admin\/reviews\/\$\{id\}/);
    assert.match(script, /with_pending/);
    assert.match(script, /let editing_product_id = ''/);
    assert.match(script, /function show_toast\(message\)/);
});

test('Hombre, Mujer y Unisex reutilizan tokens de card con paletas propias', () => {
    const css = fs.readFileSync(path.join(root, 'public/css/style.css'), 'utf8');
    assert.match(css, /\.collection-themed \.product-card\{border:1px solid/);
    assert.match(css, /\.collection-men\{[^}]*--collection-card:#f4f1e9/);
    assert.match(css, /\.collection-women\{[^}]*--collection-page:#f3ebdd[^}]*--collection-heading:#1f1a17[^}]*--collection-accent:#8c4450/);
    assert.match(css, /\.collection-women\{[^}]*--collection-card:#f8f1e8[^}]*--collection-cta:#a84e5b[^}]*--collection-cta-hover:#8e3f4b/);
    assert.match(css, /\.collection-women \.product-card \.small-button\.dark\{border-color:var\(--collection-cta\);background:var\(--collection-cta\)/);
    assert.match(css, /\.collection-unisex\{[^}]*--collection-page:#24221f[^}]*--collection-card:#d8d0c4/);
    assert.match(css, /\.collection-men \.page-intro h1\{font-weight:600/);
});


test('Admin valida y previsualiza la URL directa antes de guardar', () => {
    const admin = fs.readFileSync(path.join(root, 'views/admin.html'), 'utf8');
    const script = fs.readFileSync(path.join(root, 'public/js/admin.js'), 'utf8');
    const server = fs.readFileSync(path.join(root, 'server/app.js'), 'utf8');
    assert.match(admin, /id="image-preview"/);
    assert.match(admin, /id="image-preview-image"/);
    assert.match(admin, /referrerpolicy="no-referrer"/);
    assert.match(admin, /\/js\/admin-console-v3\.js/);
    assert.match(script, /function reset_form\(\)[\s\S]*editing_product_id = ''[\s\S]*product-form'\)\.reset\(\)[\s\S]*product-id'\)\.value = ''[\s\S]*form-label'\)\.textContent = 'NUEVO PRODUCTO'/);
    assert.match(script, /preview_product_image/);
    assert.match(script, /image\.onload/);
    assert.match(script, /image\.onerror/);
    assert.match(script, /product_image_preview_state !== 'valid'/);
    assert.match(script, /product_image_load_timer/);
    assert.match(script, /}, 6000\);/);
    assert.match(script, /La URL ingresada no apunta a una imagen válida/);
    assert.match(server, /validate_product_image_url/);
    assert.match(server, /imgSrc: \["'self'", 'data:', 'https:'\]/);
    assert.doesNotMatch(server, /imgSrc:[^\n]*images\.unsplash\.com/);
    assert.doesNotMatch(script, /images\.unsplash\.com/);
});
