// pruebas de home collections removal: usan datos ficticios para detectar cambios en respuestas, permisos y errores.
const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const leer_datos = file => readFileSync(require.resolve('../' + file), 'utf8');
test('Inicio retira el bloque completo y mantiene contiguos productos y presentación', () => {
    const html = leer_datos('public/index.html');
    assert.doesNotMatch(html, /collection-carousel|carousel-slide|carousel-status|Tres formas de empezar|EXPLORÁ LA SELECCIÓN/);
    assert.match(html, /id="featured-products"[\s\S]*?<\/section>\s*<section class="section about-preview"/);
});
test('no quedan controladores ni estilos exclusivos del carrusel eliminado', () => {
    assert.doesNotMatch(leer_datos('public/js/app.js'), /setup_collection_carousel|data-carousel|carousel-status/);
    assert.doesNotMatch(leer_datos('public/css/style.css'), /collection-carousel|carousel-controls|data-carousel-slide|carousel-status/);
    assert.match(leer_datos('public/css/style.css'), /collection-women/);
});
test('menú conserva acceso a las tres colecciones y su controlador compartido', () => {
    const html = leer_datos('public/index.html');
    for (const gender of ['mujer', 'hombre', 'unisex']) assert.ok(html.includes('/catalogo.html?gender=' + gender));
    assert.match(leer_datos('public/js/catalogo.js'), /collection-women/);
});
