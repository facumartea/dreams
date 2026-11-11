// agrega metadatos a paginas publicas con lecturas limitadas; no consulta datos privados.
import filter_model from '../public/js/catalog-filter-state.js';
// seo publico de pages: solo lecturas acotadas al backend inmutable aprobado.
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

function escapar_texto_html(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}
export { escapar_texto_html as html_escape };

function obtener_metadatos_de_pagina(pathname) {
    const route = pathname === '/index.html' ? '/' : pathname;
    const [title, description] = page_copy[route] || page_copy['/404.html'];
    return { title, description, url: route === '/404.html' ? null : SITE_ORIGIN + route, image: social_image, image_alt: 'DREAMS · Los perfumes de tus sueños',
        robots: public_pages.has(pathname) && pathname !== '/producto.html' ? 'index,follow' : 'noindex,follow', type: 'website' };
}
export { obtener_metadatos_de_pagina as page_metadata };

function crear_etiquetas_de_metadatos(meta) {
    const fields = { title: meta.title, description: meta.description, type: meta.type, url: meta.url, image: meta.image,
        'image:alt': meta.image_alt, site_name: 'DREAMS', locale: 'es_AR' };
    const og = Object.entries(fields).filter(([, value]) => value).map(([key, value]) => `<meta id="og-${key.replace(':', '-')}" property="og:${key}" content="${escapar_texto_html(value)}">`).join('\n    ');
    const twitter = { card: 'summary_large_image', title: meta.title, description: meta.description, image: meta.image, 'image:alt': meta.image_alt };
    return `<title>${escapar_texto_html(meta.title)}</title>\n    <meta name="description" content="${escapar_texto_html(meta.description)}">\n    <meta name="robots" content="${meta.robots}">\n    ${meta.url ? `<link id="canonical-url" rel="canonical" href="${escapar_texto_html(meta.url)}">` : ''}\n    ${og}\n    ` +
        Object.entries(twitter).map(([key, value]) => `<meta name="twitter:${key}" content="${escapar_texto_html(value)}">`).join('\n    ');
}
export { crear_etiquetas_de_metadatos as metadata_html };

function reemplazar_metadatos(body, meta) {
    return body.replace(/<title>[\s\S]*?<\/title>\s*/gi, '')
        .replace(/<meta\b[^>]*(?:name="(?:description|robots|twitter:[^"]+)"|property="og:[^"]+")[^>]*>\s*/gi, '')
        .replace(/<link\b[^>]*rel="canonical"[^>]*>\s*/gi, '').replace('</head>', `    ${crear_etiquetas_de_metadatos(meta)}\n</head>`);
}
export { reemplazar_metadatos as replace_metadata };

function crear_metadatos_del_perfume(product) {
    const name = String(product.name).trim(), brand = typeof product.brand === 'string' ? product.brand.trim() : '';
    const identity = brand && !name.toLocaleLowerCase('es').includes(brand.toLocaleLowerCase('es')) ? `${name} de ${brand}` : name;
    const description = typeof product.description === 'string' ? product.description.trim().replace(/\s+/g, ' ') : '';
    return { ...obtener_metadatos_de_pagina('/producto.html'), title: `${identity} | DREAMS`, robots: 'index,follow',
        description: description.length > 10 ? description.slice(0, 200) : `${identity}. Conocé esta fragancia del catálogo de DREAMS.`,
        url: `${SITE_ORIGIN}/producto.html?id=${product.id}`, image: imagen_url(product.image_url), image_alt: [brand, name].filter(Boolean).join(' ') };
}
export { crear_metadatos_del_perfume as product_metadata };

function imagen_url(value) {
    if (typeof value !== 'string' || !value.trim()) return social_image;
    try {
        const url = new URL(value.trim(), SITE_ORIGIN);
        return url.protocol === 'https:' && !url.username && !url.password ? url.href : social_image;
    } catch { return social_image; }
}

function crear_contenido_del_perfume(product) {
    const meta = crear_metadatos_del_perfume(product);
    return `<noscript><section class="detail-layout"><div class="detail-image"><img width="640" height="640" src="${escapar_texto_html(meta.image)}" alt="${escapar_texto_html(meta.image_alt)}"></div><div class="detail-info">${product.brand ? `<p class="eyebrow">${escapar_texto_html(product.brand)}</p>` : ''}<h1>${escapar_texto_html(product.name)}</h1><p class="detail-description">${escapar_texto_html(meta.description)}</p><a class="button" href="/catalogo.html">Ver perfumes</a></div></section></noscript>`;
}
export { crear_contenido_del_perfume as product_content };

async function leer_json_con_limite(respuesta, maximum = 1048576) {
    if (!respuesta.ok || !respuesta.headers.get('content-type')?.includes('application/json')) throw new Error('public data unavailable');
    const reader = respuesta.body.getReader(), chunks = []; let size = 0;
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
export { leer_json_con_limite as limited_json };

async function seleccionar_datos_publicos(path, env, options) {
    const target = new Request(new URL(path, options.backend_url || SITE_ORIGIN), { redirect: 'manual', signal: AbortSignal.timeout(5000), headers: { Accept: 'application/json' } });
    return options.backend_url ? (options.fetch_backend || fetch)(target) : env.DREAMS.fetch(target);
}

function es_perfume_valido(value) {
    return value && (value.brand == null || typeof value.brand === 'string') && Number.isSafeInteger(value.id) && value.id > 0 && typeof value.name === 'string' && value.name.trim();
}

async function obtener_datos_del_catalogo(env, options) {
    const data = await leer_json_con_limite(await seleccionar_datos_publicos('/api/products', env, options));
    if (!Array.isArray(data) || data.length > 1000 || !data.every(es_perfume_valido)) throw new Error('invalid catalog');
    return data;
}

async function preparar_recurso_con_contenido(asset, body, status = 200) {
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body));
    const tag = Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('');
    return { ...asset, body, status, etag: `"${tag}"` };
}

function preparar_recurso_de_error(asset, status) {
    const meta = { ...obtener_metadatos_de_pagina('/producto.html'), title: status === 404 ? 'Perfume no encontrado | DREAMS' : 'Catálogo no disponible | DREAMS', url: null, robots: 'noindex,follow' };
    const body = reemplazar_metadatos(asset.body, meta).replace(/<main\b[^>]*>[\s\S]*?<\/main>/, `<main class="section"><section class="empty-state"><h1>${status === 404 ? 'Perfume no encontrado.' : 'No pudimos cargar el catálogo.'}</h1><p>Volvé al catálogo o intentá nuevamente.</p><a class="button" href="/catalogo.html">Ver perfumes</a></section></main>`);
    return preparar_recurso_con_contenido(asset, body, status);
}

async function preparar_recurso_del_perfume(url, asset, env, options) {
    const raw = url.searchParams.get('id') || '';
    if (!/^[1-9]\d{0,9}$/.test(raw) || !Number.isSafeInteger(Number(raw))) return preparar_recurso_de_error(asset, 404);
    const response = await seleccionar_datos_publicos(`/api/products/${Number(raw)}`, env, options);
    if (response.status === 404) return preparar_recurso_de_error(asset, 404);
    const product = await leer_json_con_limite(response, 65536);
    if (!es_perfume_valido(product) || product.id !== Number(raw)) throw new Error('invalid product');
    const body = reemplazar_metadatos(asset.body, crear_metadatos_del_perfume(product)).replace(/(<main id="product-detail"[^>]*>)/, `$1${crear_contenido_del_perfume(product)}`);
    return preparar_recurso_con_contenido(asset, body);
}

function crear_metadatos_de_coleccion(url) {
    const genders = filter_model.parse(url.search).gender;
    const requested = genders.length === 1 ? genders[0] : '';
    const gender = Object.hasOwn(collection_names, requested) ? requested : '';
    const meta = obtener_metadatos_de_pagina('/catalogo.html');
    if (gender) Object.assign(meta, { title: `Perfumes ${gender === 'unisex' ? 'unisex' : 'de ' + gender} | DREAMS`, description: `Explorá perfumes ${gender === 'unisex' ? 'unisex' : 'de ' + gender} en DREAMS. Buscá por nombre o marca y descubrí las fragancias del catálogo.`, url: `${meta.url}?gender=${gender}` });
    if (genders.length > 1 || [...url.searchParams.keys()].some(key => !['gender', 'utm_source', 'utm_medium', 'utm_campaign'].includes(key))) meta.robots = 'noindex,follow';
    return { meta, gender };
}

async function preparar_recurso_del_catalogo(url, asset, env, options) {
    const { meta, gender } = crear_metadatos_de_coleccion(url);
    const products = (await obtener_datos_del_catalogo(env, options)).filter(product => !gender || product.gender === gender);
    const links = products.map(product => `<li><a href="/producto.html?id=${product.id}">${escapar_texto_html([product.brand, product.name].filter(Boolean).join(' · '))}</a></li>`).join('');
    const fallback = `<noscript><section class="section"><h2>Perfumes del catálogo</h2><ul>${links}</ul></section></noscript>`;
    const body = reemplazar_metadatos(asset.body, meta).replace('<section id="catalog-products"', `${fallback}<section id="catalog-products"`);
    return preparar_recurso_con_contenido(asset, body);
}

async function preparar_mapa_del_sitio(asset, env, options) {
    const products = await obtener_datos_del_catalogo(env, options);
    const paths = ['/', '/catalogo.html', '/nosotros.html', ...Object.keys(collection_names).map(gender => `/catalogo.html?gender=${gender}`),
        ...new Set(products.map(product => `/producto.html?id=${product.id}`))];
    const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(path => `<url><loc>${escapar_texto_html(SITE_ORIGIN + path)}</loc></url>`).join('')}</urlset>`;
    return preparar_recurso_con_contenido(asset, body);
}

async function completar_recurso(solicitud, asset, env, options) {
    const url = new URL(solicitud.url);
    try {
        let result = asset;
        if (url.pathname === '/producto.html') result = await preparar_recurso_del_perfume(url, asset, env, options);
        else if (url.pathname === '/catalogo.html') result = await preparar_recurso_del_catalogo(url, asset, env, options);
        else if (url.pathname === '/sitemap.xml') result = await preparar_mapa_del_sitio(asset, env, options);
        else if (url.pathname === '/404.html') result = { ...asset, status: 404 };
        else if (url.pathname === '/robots.txt' && url.origin !== SITE_ORIGIN) result = await preparar_recurso_con_contenido(asset, 'User-agent: *\nDisallow: /\n');
        if (url.origin !== SITE_ORIGIN && result.content_type.startsWith('text/html')) {
            return preparar_recurso_con_contenido(result, result.body.replace(/(<meta name="robots" content=")[^"]+/, '$1noindex,nofollow'), result.status);
        }
        return result;
    } catch { return url.pathname === '/sitemap.xml' ? { ...asset, status: 503, body: 'Sitemap no disponible.', etag: '"unavailable"' } : preparar_recurso_de_error(asset, 503); }
}
export { completar_recurso as enrich_asset };

function conservar_cabeceras_permitidas(respuesta) {
    const headers = new Headers(respuesta.headers), cookies = respuesta.headers.getSetCookie?.();
    if (cookies?.length) { headers.delete('Set-Cookie'); for (const cookie of cookies) headers.append('Set-Cookie', cookie); }
    return headers;
}
export { conservar_cabeceras_permitidas as preserved_headers };

function preparar_respuesta_de_inicio(solicitud, respuesta) {
    const url = new URL(solicitud.url), headers = conservar_cabeceras_permitidas(respuesta);
    const public_response = url.origin === SITE_ORIGIN && (respuesta.status === 200 || respuesta.status === 304) && ['GET', 'HEAD'].includes(solicitud.method) && (public_pages.has(url.pathname) || url.pathname === '/assets/dreams-social.png');
    const filtered = url.pathname === '/catalogo.html' && (filter_model.parse(url.search).gender.length > 1 || [...url.searchParams.keys()].some(key => !['gender', 'utm_source', 'utm_medium', 'utm_campaign'].includes(key)));
    headers.set('X-Robots-Tag', public_response && !filtered ? 'index, follow' : 'noindex, follow');
    if (url.origin !== SITE_ORIGIN) headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    return new Response(respuesta.body, { status: respuesta.status, statusText: respuesta.statusText, headers });
}
export { preparar_respuesta_de_inicio as index_response };
