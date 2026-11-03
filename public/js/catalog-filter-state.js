const catalog_filter_defaults = Object.freeze({ search: '', brand: Object.freeze([]), gender: Object.freeze([]), category: '', max_price: '', sort: 'featured' });

// Un valor conserva los enlaces históricos; varias opciones usan una lista JSON en un único parámetro.
function catalog_filter_list(value) {
    if (typeof value === 'string' && value.startsWith('[')) {
        try { value = JSON.parse(value); } catch { return []; }
    }
    const values = Array.isArray(value) ? value : [value];
    return [...new Set(values.filter(item => typeof item === 'string').map(item => item.trim()).filter(item => item && item.length <= 120))].slice(0, 50).sort();
}

function normalize_catalog_filters(value = {}) {
    const price = Number(value.max_price);
    return {
        search: String(value.search || '').trim().slice(0, 80),
        brand: catalog_filter_list(value.brand),
        gender: catalog_filter_list(value.gender).filter(item => ['mujer', 'hombre', 'unisex'].includes(item)),
        category: ['diseñador', 'nicho'].includes(value.category) ? value.category : '',
        max_price: Number.isFinite(price) && price > 0 ? String(price) : '',
        sort: ['featured', 'price_asc', 'price_desc', 'name'].includes(value.sort) ? value.sort : 'featured'
    };
}

function parse_catalog_filters(search) {
    const params = new URLSearchParams(search);
    const state = Object.fromEntries(params);
    for (const key of ['brand', 'gender']) state[key] = params.getAll(key).flatMap(catalog_filter_list);
    return normalize_catalog_filters(state);
}

function catalog_filter_params(value, original = '') {
    const state = normalize_catalog_filters(value);
    const params = new URLSearchParams(original);
    for (const key of Object.keys(catalog_filter_defaults)) {
        params.delete(key);
        const value = state[key];
        if (Array.isArray(value)) { if (value.length) params.set(key, value.length === 1 ? value[0] : JSON.stringify(value)); }
        else if (value !== catalog_filter_defaults[key]) params.set(key, value);
    }
    params.delete('page');
    return params;
}

function catalog_filter_count(value) {
    const state = normalize_catalog_filters(value);
    return Object.keys(catalog_filter_defaults).filter(key => (Array.isArray(state[key]) ? state[key].length > 0 : state[key] !== catalog_filter_defaults[key])).length;
}

const catalog_filter_model = { defaults: catalog_filter_defaults, normalize: normalize_catalog_filters, parse: parse_catalog_filters, params: catalog_filter_params, count: catalog_filter_count, list: catalog_filter_list };
if (typeof module === 'object' && module.exports) module.exports = catalog_filter_model;
else if (typeof window === 'object') window.DreamsCatalogFilters = catalog_filter_model;
