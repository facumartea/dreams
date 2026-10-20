import filter_model from '../public/js/catalog-filter-state.js';
import { limited_json, preserved_headers } from './seo.mjs';

function multiple_filters(url) {
    return ['brand', 'gender'].some(key => url.searchParams.getAll(key).length > 1 || url.searchParams.get(key)?.startsWith('['));
}

function validate_filter_lists(url) {
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

export function selected_product(product, state) {
    return (!state.brand.length || state.brand.includes(product.brand)) && (!state.gender.length || state.gender.includes(product.gender));
}

function catalog_request(request, options) {
    const url = new URL('/api/products', options.backend_url);
    const state = filter_model.parse(new URL(request.url).search);
    url.search = filter_model.params({ ...state, brand: [], gender: [] }).toString();
    // La API actual devuelve el catálogo completo, sin paginación. Nunca enviar limit antes de filtrar.
    return new Request(url, { redirect: 'manual', signal: AbortSignal.timeout(8000), headers: { Accept: 'application/json' } });
}

export async function filtered_catalog(request, options) {
    const url = new URL(request.url);
    if (url.pathname !== '/api/products' || !['GET', 'HEAD'].includes(request.method) || !multiple_filters(url)) return null;
    try { validate_filter_lists(url); } catch { return Response.json({ error: 'Revisá las marcas y los géneros seleccionados.' }, { status: 400 }); }
    const state = filter_model.parse(url.search);
    const upstream = await (options.fetch_backend || fetch)(catalog_request(request, options));
    if (upstream.status !== 200) return upstream;
    const products = await limited_json(upstream);
    if (!Array.isArray(products) || products.length >= 1000 || products.some(item => !item || !Number.isSafeInteger(item.id))) throw new Error('incomplete catalog');
    const matches = products.filter(product => selected_product(product, state));
    const limit = Number(url.searchParams.get('limit'));
    const result = Number.isSafeInteger(limit) && limit > 0 ? matches.slice(0, Math.min(limit, 100)) : matches;
    const headers = preserved_headers(upstream);
    for (const key of ['Content-Length', 'Content-Encoding', 'ETag', 'Last-Modified']) headers.delete(key);
    headers.set('Cache-Control', 'no-store');
    return new Response(request.method === 'HEAD' ? null : JSON.stringify(result), { headers });
}
