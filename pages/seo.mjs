import filter_model from '../public/js/catalog-filter-state.js';
// SEO público de Pages: sólo lecturas acotadas al backend inmutable aprobado.
export const SITE_ORIGIN = 'https://dreams-perfumes.pages.dev';
const social_image = `${SITE_ORIGIN}/assets/dreams-social.png`;
const public_pages = new Set(['/', '/index.html', '/catalogo.html', '/nosotros.html', '/producto.html']);
const page_copy = {
    '/': ['DREAMS | Los perfumes de tus sueños', 'Descubrí perfumes de diseñador y nicho en DREAMS. Explorá marcas y fragancias de mujer, hombre y unisex.'],
    '/catalogo.html': ['Perfumes de mujer, hombre y unisex | DREAMS', 'Explorá el catálogo de DREAMS. Buscá perfumes por nombre, marca o familia y filtrá por género, tipo y precio.'],
    '/nosotros.html': ['Nosotros y contacto | DREAMS', 'Conocé la propuesta de DREAMS, una perfumería multimarca digital. Encontrá nuestros teléfonos y correos de contacto.'],
    '/producto.html': ['Perfume | DREAMS', 'Conocé esta fragancia del catálogo de DREAMS.'],
    '/carrito.html': ['Tu carrito | DREAMS', 'Revisá los perfumes y las cantidades de tu carrito.'],
    '/cuenta.html': ['Ingresar o crear una cuenta | DREAMS', 'Ingresá a tu cuenta de DREAMS o completá el formulario de registro.'],
    '/checkout.html': ['Finalizar compra | DREAMS', 'Revisá los productos y completá los datos de tu compra.'],
    '/checkout-resultado.html': ['Confirmación del pedido | DREAMS', 'Consultá la confirmación y el resumen de tu operación.'],
    '/404.html': ['Página no encontrada | DREAMS', 'Esta página no existe. Volvé al catálogo de perfumes de DREAMS.']
};
const collection_names = { mujer: 'mujer', hombre: 'hombre', unisex: 'unisex' };

export function html_escape(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

export function page_metadata(pathname) {
    const route = pathname === '/index.html' ? '/' : pathname;
    const [title, description] = page_copy[route] || page_copy['/404.html'];
    return { title, description, url: route === '/404.html' ? null : SITE_ORIGIN + route, image: social_image, image_alt: 'DREAMS · Los perfumes de tus sueños',
        robots: public_pages.has(pathname) && pathname !== '/producto.html' ? 'index,follow' : 'noindex,follow', type: 'website' };
}

export function metadata_html(meta) {
    const fields = { title: meta.title, description: meta.description, type: meta.type, url: meta.url, image: meta.image,
        'image:alt': meta.image_alt, site_name: 'DREAMS', locale: 'es_AR' };
    const og = Object.entries(fields).filter(([, value]) => value).map(([key, value]) => `<meta id="og-${key.replace(':', '-')}" property="og:${key}" content="${html_escape(value)}">`).join('\n    ');
    const twitter = { card: 'summary_large_image', title: meta.title, description: meta.description, image: meta.image, 'image:alt': meta.image_alt };
    return `<title>${html_escape(meta.title)}</title>\n    <meta name="description" content="${html_escape(meta.description)}">\n    <meta name="robots" content="${meta.robots}">\n    ${meta.url ? `<link id="canonical-url" rel="canonical" href="${html_escape(meta.url)}">` : ''}\n    ${og}\n    ` +
        Object.entries(twitter).map(([key, value]) => `<meta name="twitter:${key}" content="${html_escape(value)}">`).join('\n    ');
}

export function replace_metadata(body, meta) {
    return body.replace(/<title>[\s\S]*?<\/title>\s*/gi, '')
        .replace(/<meta\b[^>]*(?:name="(?:description|robots|twitter:[^"]+)"|property="og:[^"]+")[^>]*>\s*/gi, '')
        .replace(/<link\b[^>]*rel="canonical"[^>]*>\s*/gi, '').replace('</head>', `    ${metadata_html(meta)}\n</head>`);
}

export function product_metadata(product) {
    const name = String(product.name).trim(), brand = typeof product.brand === 'string' ? product.brand.trim() : '';
    const identity = brand && !name.toLocaleLowerCase('es').includes(brand.toLocaleLowerCase('es')) ? `${name} de ${brand}` : name;
    const description = typeof product.description === 'string' ? product.description.trim().replace(/\s+/g, ' ') : '';
    return { ...page_metadata('/producto.html'), title: `${identity} | DREAMS`, robots: 'index,follow',
        description: description.length > 10 ? description.slice(0, 200) : `${identity}. Conocé esta fragancia del catálogo de DREAMS.`,
        url: `${SITE_ORIGIN}/producto.html?id=${product.id}`, image: image_url(product.image_url), image_alt: [brand, name].filter(Boolean).join(' ') };
}

function image_url(value) {
    if (typeof value !== 'string' || !value.trim()) return social_image;
    try {
        const url = new URL(value.trim(), SITE_ORIGIN);
        return url.protocol === 'https:' && !url.username && !url.password ? url.href : social_image;
    } catch { return social_image; }
}

export function product_content(product) {
    const meta = product_metadata(product);
    return `<noscript><section class="detail-layout"><div class="detail-image"><img width="640" height="640" src="${html_escape(meta.image)}" alt="${html_escape(meta.image_alt)}"></div><div class="detail-info">${product.brand ? `<p class="eyebrow">${html_escape(product.brand)}</p>` : ''}<h1>${html_escape(product.name)}</h1><p class="detail-description">${html_escape(meta.description)}</p><a class="button" href="/catalogo.html">Ver perfumes</a></div></section></noscript>`;
}

export async function limited_json(response, maximum = 1048576) {
    if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw new Error('public data unavailable');
    const reader = response.body.getReader(), chunks = []; let size = 0;
    try {
        for (;;) {
            const { done, value } = await reader.read(); if (done) break;
            size += value.byteLength; if (size > maximum) throw new Error('public data too large'); chunks.push(value);
        }
    } finally { await reader.cancel(); reader.releaseLock(); }
    const bytes = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    return JSON.parse(new TextDecoder().decode(bytes));
}

async function public_data(path, env, options) {
    const target = new Request(new URL(path, options.backend_url || SITE_ORIGIN), { redirect: 'manual', signal: AbortSignal.timeout(5000), headers: { Accept: 'application/json' } });
    return options.backend_url ? (options.fetch_backend || fetch)(target) : env.DREAMS.fetch(target);
}

function valid_product(value) {
    return value && (value.brand == null || typeof value.brand === 'string') && Number.isSafeInteger(value.id) && value.id > 0 && typeof value.name === 'string' && value.name.trim();
}

async function catalog_data(env, options) {
    const data = await limited_json(await public_data('/api/products', env, options));
    if (!Array.isArray(data) || data.length > 1000 || !data.every(valid_product)) throw new Error('invalid catalog');
    return data;
}

async function content_asset(asset, body, status = 200) {
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body));
    const tag = Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('');
    return { ...asset, body, status, etag: `"${tag}"` };
}

function error_asset(asset, status) {
    const meta = { ...page_metadata('/producto.html'), title: status === 404 ? 'Perfume no encontrado | DREAMS' : 'Catálogo no disponible | DREAMS', url: null, robots: 'noindex,follow' };
    const body = replace_metadata(asset.body, meta).replace(/<main\b[^>]*>[\s\S]*?<\/main>/, `<main class="section"><section class="empty-state"><h1>${status === 404 ? 'Perfume no encontrado.' : 'No pudimos cargar el catálogo.'}</h1><p>Volvé al catálogo o intentá nuevamente.</p><a class="button" href="/catalogo.html">Ver perfumes</a></section></main>`);
    return content_asset(asset, body, status);
}

async function product_asset(url, asset, env, options) {
    const raw = url.searchParams.get('id') || '';
    if (!/^[1-9]\d{0,9}$/.test(raw) || !Number.isSafeInteger(Number(raw))) return error_asset(asset, 404);
    const response = await public_data(`/api/products/${Number(raw)}`, env, options);
    if (response.status === 404) return error_asset(asset, 404);
    const product = await limited_json(response, 65536);
    if (!valid_product(product) || product.id !== Number(raw)) throw new Error('invalid product');
    const body = replace_metadata(asset.body, product_metadata(product)).replace(/(<main id="product-detail"[^>]*>)/, `$1${product_content(product)}`);
    return content_asset(asset, body);
}

function collection_metadata(url) {
    const genders = filter_model.parse(url.search).gender;
    const requested = genders.length === 1 ? genders[0] : '';
    const gender = Object.hasOwn(collection_names, requested) ? requested : '';
    const meta = page_metadata('/catalogo.html');
    if (gender) Object.assign(meta, { title: `Perfumes ${gender === 'unisex' ? 'unisex' : 'de ' + gender} | DREAMS`, description: `Explorá perfumes ${gender === 'unisex' ? 'unisex' : 'de ' + gender} en DREAMS. Buscá por nombre o marca y descubrí las fragancias del catálogo.`, url: `${meta.url}?gender=${gender}` });
    if (genders.length > 1 || [...url.searchParams.keys()].some(key => !['gender', 'utm_source', 'utm_medium', 'utm_campaign'].includes(key))) meta.robots = 'noindex,follow';
    return { meta, gender };
}

async function catalog_asset(url, asset, env, options) {
    const { meta, gender } = collection_metadata(url);
    const products = (await catalog_data(env, options)).filter(product => !gender || product.gender === gender);
    const links = products.map(product => `<li><a href="/producto.html?id=${product.id}">${html_escape([product.brand, product.name].filter(Boolean).join(' · '))}</a></li>`).join('');
    const fallback = `<noscript><section class="section"><h2>Perfumes del catálogo</h2><ul>${links}</ul></section></noscript>`;
    const body = replace_metadata(asset.body, meta).replace('<section id="catalog-products"', `${fallback}<section id="catalog-products"`);
    return content_asset(asset, body);
}

async function sitemap_asset(asset, env, options) {
    const products = await catalog_data(env, options);
    const paths = ['/', '/catalogo.html', '/nosotros.html', ...Object.keys(collection_names).map(gender => `/catalogo.html?gender=${gender}`),
        ...new Set(products.map(product => `/producto.html?id=${product.id}`))];
    const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(path => `<url><loc>${html_escape(SITE_ORIGIN + path)}</loc></url>`).join('')}</urlset>`;
    return content_asset(asset, body);
}

export async function enrich_asset(request, asset, env, options) {
    const url = new URL(request.url);
    try {
        let result = asset;
        if (url.pathname === '/producto.html') result = await product_asset(url, asset, env, options);
        else if (url.pathname === '/catalogo.html') result = await catalog_asset(url, asset, env, options);
        else if (url.pathname === '/sitemap.xml') result = await sitemap_asset(asset, env, options);
        else if (url.pathname === '/404.html') result = { ...asset, status: 404 };
        else if (url.pathname === '/robots.txt' && url.origin !== SITE_ORIGIN) result = await content_asset(asset, 'User-agent: *\nDisallow: /\n');
        if (url.origin !== SITE_ORIGIN && result.content_type.startsWith('text/html')) {
            return content_asset(result, result.body.replace(/(<meta name="robots" content=")[^"]+/, '$1noindex,nofollow'), result.status);
        }
        return result;
    } catch { return url.pathname === '/sitemap.xml' ? { ...asset, status: 503, body: 'Sitemap no disponible.', etag: '"unavailable"' } : error_asset(asset, 503); }
}

export function preserved_headers(response) {
    const headers = new Headers(response.headers), cookies = response.headers.getSetCookie?.();
    if (cookies?.length) { headers.delete('Set-Cookie'); for (const cookie of cookies) headers.append('Set-Cookie', cookie); }
    return headers;
}

export function index_response(request, response) {
    const url = new URL(request.url), headers = preserved_headers(response);
    const public_response = url.origin === SITE_ORIGIN && (response.status === 200 || response.status === 304) && ['GET', 'HEAD'].includes(request.method) && (public_pages.has(url.pathname) || url.pathname === '/assets/dreams-social.png');
    const filtered = url.pathname === '/catalogo.html' && (filter_model.parse(url.search).gender.length > 1 || [...url.searchParams.keys()].some(key => !['gender', 'utm_source', 'utm_medium', 'utm_campaign'].includes(key)));
    headers.set('X-Robots-Tag', public_response && !filtered ? 'index, follow' : 'noindex, follow');
    if (url.origin !== SITE_ORIGIN) headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
