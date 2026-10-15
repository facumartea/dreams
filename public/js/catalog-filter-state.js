const catalog_filter_defaults = Object.freeze({ search: '', brand: '', gender: '', category: '', max_price: '', sort: 'featured' });

function normalize_catalog_filters(value = {}) {
    const price = Number(value.max_price);
    return {
        search: String(value.search || '').trim().slice(0, 80),
        brand: String(value.brand || '').trim().slice(0, 120),
        gender: ['mujer', 'hombre', 'unisex'].includes(value.gender) ? value.gender : '',
        category: ['diseñador', 'nicho'].includes(value.category) ? value.category : '',
        max_price: Number.isFinite(price) && price > 0 ? String(price) : '',
        sort: ['featured', 'price_asc', 'price_desc', 'name'].includes(value.sort) ? value.sort : 'featured'
    };
}

function parse_catalog_filters(search) {
    return normalize_catalog_filters(Object.fromEntries(new URLSearchParams(search)));
}

function catalog_filter_params(value, original = '') {
    const state = normalize_catalog_filters(value);
    const params = new URLSearchParams(original);
    for (const key of Object.keys(catalog_filter_defaults)) {
        params.delete(key);
        if (state[key] !== catalog_filter_defaults[key]) params.set(key, state[key]);
    }
    params.delete('page');
    return params;
}

function catalog_filter_count(value) {
    const state = normalize_catalog_filters(value);
    return Object.keys(catalog_filter_defaults).filter(key => state[key] !== catalog_filter_defaults[key]).length;
}

const catalog_filter_model = { defaults: catalog_filter_defaults, normalize: normalize_catalog_filters, parse: parse_catalog_filters, params: catalog_filter_params, count: catalog_filter_count };
if (typeof module === 'object' && module.exports) module.exports = catalog_filter_model;
else window.DreamsCatalogFilters = catalog_filter_model;
