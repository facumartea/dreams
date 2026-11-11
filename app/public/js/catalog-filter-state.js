// convierte los filtros entre formulario, url y parametros de consulta sin perder selecciones.
const catalog_filter_defaults = Object.freeze({ search: '', brand: Object.freeze([]), gender: Object.freeze([]), category: '', max_price: '', sort: 'featured' });

// un valor conserva los enlaces historicos; varias opciones usan una lista json en un unico parametro.
function listar_valores_del_filtro(value) {
    if (typeof value === 'string' && value.startsWith('[')) {
        try { value = JSON.parse(value); } catch { return []; }
    }
    const values = Array.isArray(value) ? value : [value];
    return [...new Set(values.filter(item => typeof item === 'string').map(item => item.trim()).filter(item => item && item.length <= 120))].slice(0, 50).sort();
}

function normalizar_filtros_del_catalogo(value = {}) {
    const price = Number(value.max_price);
    return {
        search: String(value.search || '').trim().slice(0, 80),
        brand: listar_valores_del_filtro(value.brand),
        gender: listar_valores_del_filtro(value.gender).filter(item => ['mujer', 'hombre', 'unisex'].includes(item)),
        category: ['diseñador', 'nicho'].includes(value.category) ? value.category : '',
        max_price: Number.isFinite(price) && price > 0 ? String(price) : '',
        sort: ['featured', 'price_asc', 'price_desc', 'name'].includes(value.sort) ? value.sort : 'featured'
    };
}

function interpretar_filtros_del_catalogo(search) {
    const params = new URLSearchParams(search);
    const state = Object.fromEntries(params);
    for (const key of ['brand', 'gender']) state[key] = params.getAll(key).flatMap(listar_valores_del_filtro);
    return normalizar_filtros_del_catalogo(state);
}

function crear_parametros_de_filtros(value, original = '') {
    const state = normalizar_filtros_del_catalogo(value);
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

function contar_filtros_del_catalogo(value) {
    const state = normalizar_filtros_del_catalogo(value);
    return Object.keys(catalog_filter_defaults).filter(key => (Array.isArray(state[key]) ? state[key].length > 0 : state[key] !== catalog_filter_defaults[key])).length;
}

const catalog_filter_model = { defaults: catalog_filter_defaults, normalize: normalizar_filtros_del_catalogo, parse: interpretar_filtros_del_catalogo, params: crear_parametros_de_filtros, count: contar_filtros_del_catalogo, list: listar_valores_del_filtro };
if (typeof module === 'object' && module.exports) module.exports = catalog_filter_model;
else if (typeof window === 'object') window.DreamsCatalogFilters = catalog_filter_model;
