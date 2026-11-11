// obtiene datos publicos del catalogo para generar las paginas y sus metadatos.
import filter_model from '../public/js/catalog-filter-state.js';
import { limited_json, preserved_headers } from './seo.mjs';

function leer_filtros_multiples(url) {
    return ['brand', 'gender'].some(key => url.searchParams.getAll(key).length > 1 || url.searchParams.get(key)?.startsWith('['));
}

function validar_listas_de_filtros(url) {
    for (const key of ['brand', 'gender']) {
        const values = url.searchParams.getAll(key);
        if (values.length > 50) throw new Error('invalid filters');
        for (const raw of values) {
            const list = raw.startsWith('[') ? JSON.parse(raw) : [raw];
            if (!Array.isArray(list) || list.length > 50 || list.some(value => typeof value !== 'string' || value.length > 120)) throw new Error('invalid filters');
            if (key === 'gender' && list.some(value => value && !['mujer', 'hombre', 'unisex'].includes(value.trim()))) throw new Error('invalid filters');
        }
    }
}

function obtener_perfume_elegido(product, state) {
    return (!state.brand.length || state.brand.includes(product.brand)) && (!state.gender.length || state.gender.includes(product.gender));
}
export { obtener_perfume_elegido as selected_product };

function consultar_catalogo(solicitud, options) {
    const url = new URL('/api/products', options.backend_url);
    const state = filter_model.parse(new URL(solicitud.url).search);
    url.search = filter_model.params({ ...state, brand: [], gender: [] }).toString();
    // la api actual devuelve el catalogo completo, sin paginacion. nunca enviar limit antes de filtrar.
    return new Request(url, { redirect: 'manual', signal: AbortSignal.timeout(8000), headers: { Accept: 'application/json' } });
}

async function obtener_catalogo_filtrado(solicitud, options) {
    const url = new URL(solicitud.url);
    if (url.pathname !== '/api/products' || !['GET', 'HEAD'].includes(solicitud.method) || !leer_filtros_multiples(url)) return null;
    try { validar_listas_de_filtros(url); } catch { return Response.json({ error: 'Revisá las marcas y los géneros seleccionados.' }, { status: 400 }); }
    const state = filter_model.parse(url.search);
    const upstream = await (options.fetch_backend || fetch)(consultar_catalogo(solicitud, options));
    if (upstream.status !== 200) return upstream;
    const products = await limited_json(upstream);
    if (!Array.isArray(products) || products.length >= 1000 || products.some(item => !item || !Number.isSafeInteger(item.id))) throw new Error('incomplete catalog');
    const matches = products.filter(product => obtener_perfume_elegido(product, state));
    const limit = Number(url.searchParams.get('limit'));
    const result = Number.isSafeInteger(limit) && limit > 0 ? matches.slice(0, Math.min(limit, 100)) : matches;
    const headers = preserved_headers(upstream);
    for (const key of ['Content-Length', 'Content-Encoding', 'ETag', 'Last-Modified']) headers.delete(key);
    headers.set('Cache-Control', 'no-store');
    return new Response(solicitud.method === 'HEAD' ? null : JSON.stringify(result), { headers });
}
export { obtener_catalogo_filtrado as filtered_catalog };
