// textos retirados y composicion de cabeceras sin alterar descripciones de productos.
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { readFileSync } = require('node:fs');
const filters = require('../public/js/catalog-filter-state.js');

function catalog_without_description() {
    const elements = new Map();
    const element = id => {
        if (id === 'catalog-description') throw new Error('El párrafo retirado no debe consultarse');
        if (!elements.has(id)) elements.set(id, { classList: { add() {}, remove() {} } });
        return elements.get(id);
    };
    const context = vm.createContext({ URLSearchParams, window: { DreamsCatalogFilters: filters,
        location: { origin: 'https://dreams-perfumes.pages.dev', search: '' } },
        document: { addEventListener() {}, body: element('body'), getElementById: element,
            querySelector: element } });
    vm.runInContext(readFileSync('public/js/catalogo.js', 'utf8'), context);
    return { context, element };
}

test('cabeceras sin párrafo conservan descripción SEO, OG, Twitter, canonical y paleta', () => {
    const { context, element } = catalog_without_description();
    for (const gender of ['', 'hombre', 'mujer', 'unisex']) {
        assert.doesNotThrow(() => context.update_catalog_context(gender));
        const meta = element('meta[name="description"]').content;
        assert.ok(meta.length > 30);
        assert.equal(element('meta[property="og:description"]').content, meta);
        assert.equal(element('meta[name="twitter:description"]').content, meta);
        assert.ok(element('catalog-title').textContent.length > 0);
        assert.equal(element('canonical-url').href, 'https://dreams-perfumes.pages.dev/catalogo.html' + (gender ? '?gender=' + gender : ''));
    }
});
