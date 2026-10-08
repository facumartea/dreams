const test = require('node:test');
const assert = require('node:assert/strict');
const { escape_html, safe_image_url, fallback_image } = require('../public/js/safe');

test('escape_html neutraliza markup y atributos ejecutables', () => {
    const payload = `<img src=x onerror="alert('xss')">&`;
    assert.equal(escape_html(payload), '&lt;img src=x onerror=&quot;alert(&#39;xss&#39;)&quot;&gt;&amp;');
    assert.doesNotMatch(escape_html(payload), /<img/i);
});

test('safe_image_url sólo admite rutas locales y HTTPS', () => {
    assert.equal(safe_image_url('/assets/example.png'), '/assets/example.png');
    assert.equal(safe_image_url('javascript:alert(1)'), fallback_image);
    assert.equal(safe_image_url('http://example.com/image.png'), fallback_image);
    assert.equal(safe_image_url('//evil.example/image.png'), fallback_image);
    assert.equal(safe_image_url('https://example.com/image.png'), 'https://example.com/image.png');
});


test('native validation copy stays Spanish regardless of browser language', () => {
    const { validation_message } = require('../public/js/safe');
    assert.equal(validation_message({ type: 'email', validity: { typeMismatch: true } }), 'Ingresá un correo electrónico válido.');
    assert.equal(validation_message({ validity: { valueMissing: true } }), 'Completá este campo.');
    assert.equal(validation_message({ min: '1', validity: { rangeUnderflow: true } }), 'Ingresá un valor mayor o igual a 1.');
    assert.equal(validation_message({ validity: {} }), '');
});

test('browser network and JSON errors do not leak English implementation messages into the UI', () => {
    const { interface_error } = require('../public/js/safe');
    for (const error of [new TypeError('Failed to fetch'), new SyntaxError('Unexpected token')]) assert.match(interface_error(error), /Revisá tu conexión/);
    assert.equal(interface_error(new Error('Correo o contraseña incorrectos.')), 'Correo o contraseña incorrectos.');
});
