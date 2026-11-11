// pruebas de texto y urls seguras: usan datos ficticios para detectar cambios en respuestas, permisos y errores.
const test = require('node:test');
const assert = require('node:assert/strict');
const { escapar_texto_html, elegir_url_de_imagen_segura, fallback_image } = require('../public/js/safe');

test('escape_html neutraliza markup y atributos ejecutables', () => {
    const payload = `<img src=x onerror="alert('xss')">&`;
    assert.equal(escapar_texto_html(payload), '&lt;img src=x onerror=&quot;alert(&#39;xss&#39;)&quot;&gt;&amp;');
    assert.doesNotMatch(escapar_texto_html(payload), /<img/i);
});

test('safe_image_url sólo admite rutas locales y HTTPS', () => {
    assert.equal(elegir_url_de_imagen_segura('/assets/example.png'), '/assets/example.png');
    assert.equal(elegir_url_de_imagen_segura('javascript:alert(1)'), fallback_image);
    assert.equal(elegir_url_de_imagen_segura('http://example.com/image.png'), fallback_image);
    assert.equal(elegir_url_de_imagen_segura('//evil.example/image.png'), fallback_image);
    assert.equal(elegir_url_de_imagen_segura('https://example.com/image.png'), 'https://example.com/image.png');
});


test('native validation copy stays Spanish regardless of browser language', () => {
    const { explicar_error_de_validacion } = require('../public/js/safe');
    assert.equal(explicar_error_de_validacion({ type: 'email', validity: { typeMismatch: true } }), 'Ingresá un correo electrónico válido.');
    assert.equal(explicar_error_de_validacion({ validity: { valueMissing: true } }), 'Completá este campo.');
    assert.equal(explicar_error_de_validacion({ min: '1', validity: { rangeUnderflow: true } }), 'Ingresá un valor mayor o igual a 1.');
    assert.equal(explicar_error_de_validacion({ validity: {} }), '');
});

test('browser network and JSON errors do not leak English implementation messages into the UI', () => {
    const { explicar_error_de_conexion } = require('../public/js/safe');
    for (const error of [new TypeError('Failed to fetch'), new SyntaxError('Unexpected token')]) assert.match(explicar_error_de_conexion(error), /Revisá tu conexión/);
    assert.equal(explicar_error_de_conexion(new Error('Correo o contraseña incorrectos.')), 'Correo o contraseña incorrectos.');
});
