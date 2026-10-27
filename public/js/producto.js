async function load_product_detail() {
    const params = new URLSearchParams(window.location.search);
    const product_id = Number(params.get('id'));
    const container = document.getElementById('product-detail');

    container.innerHTML = '<div class="detail-loading" aria-label="Cargando perfume"><div class="skeleton-card" aria-hidden="true"></div><div class="detail-loading-copy" aria-hidden="true"></div></div>';

    if (!product_id) {
        container.innerHTML = '<div class="empty-state"><h2>Perfume no encontrado.</h2></div>';
        return;
    }

    try {
        const response = await fetch(`/api/products/${product_id}`);
        const product = await response.json();

        if (!response.ok) {
            throw new Error(product.error);
        }

        update_product_metadata(product);
        save_recent_product(product);
        render_recent_products();
        await render_product_detail(product);
    } catch (error) {
        container.innerHTML = `<div class="empty-state"><h2>${escape_html(error.message)}</h2><a class="button button-dark" href="/catalogo.html">Volver al catálogo</a></div>`;
    }
}

function update_product_metadata(product) {
    const name = String(product.name).trim(), brand = typeof product.brand === 'string' ? product.brand.trim() : '';
    const identity = brand && !name.toLocaleLowerCase('es').includes(brand.toLocaleLowerCase('es')) ? `${name} de ${brand}` : name;
    const title = `${identity} | DREAMS`;
    const detail = typeof product.description === 'string' ? product.description.trim().replace(/\s+/g, ' ') : '';
    const description = detail.length > 10 ? detail.slice(0, 200) : `${identity}. Conocé esta fragancia del catálogo de DREAMS.`;
    const canonical_url = `https://dreams-perfumes.pages.dev/producto.html?id=${encodeURIComponent(product.id)}`;
    document.title = title;
    document.querySelector('meta[name="description"]').content = description;
    document.getElementById('canonical-url').href = canonical_url;
    for (const [key, value] of Object.entries({ title, description, url: canonical_url, image: new URL(safe_image_url(product.image_url), window.location.origin).href })) {
        const og = document.querySelector(`meta[property="og:${key}"]`), twitter = document.querySelector(`meta[name="twitter:${key}"]`);
        if (og) og.content = value;
        if (twitter) twitter.content = value;
    }
}

function product_whatsapp_url(product, number) {
    const identity = [product.brand, product.name].filter(Boolean).join(' ');
    const size = product.size_ml ? ` de ${product.size_ml} ml` : '';
    return whatsapp_link(number, `Hola DREAMS, quiero consultar por 1 × ${identity}${size}.\nPrecio: ${format_price(product.price)}.`);
}
function product_detail_image(product) {
    return `<div class="detail-image"><img src="${escape_html(safe_image_url(product.image_url))}" alt="${escape_html([product.brand, product.name].filter(Boolean).join(' '))}"></div>`;
}
function product_detail_intro(product) {
    return `<p class="eyebrow">${escape_html(product.category)} · ${escape_html(product.gender)} · ${escape_html(product.size_ml)} ml</p>
        <h1>${escape_html(product.name)}</h1><p class="product-meta">${escape_html(product.brand)} · ${escape_html(product.family)}</p>
        <div class="detail-price">${format_price(product.price)}</div><p class="detail-description">${escape_html(product.description)}</p>
        <div class="intensity" title="Intensidad ${escape_html(product.intensity)} de 5">${[1,2,3,4,5].map(number => `<span class="${number <= product.intensity ? 'active' : ''}"></span>`).join('')}</div>
        <p class="product-meta">Intensidad: ${escape_html(product.intensity)}/5 · Disponibilidad: ${product.stock > 0 ? escape_html(product.stock) + ' unidades' : 'Agotado'}</p>`;
}
function product_detail_actions(product, href) {
    return `<div class="detail-actions"><button id="detail-add" class="button button-dark" ${Number(product.stock) === 0 ? 'disabled' : ''}>${Number(product.stock) === 0 ? 'Agotado' : 'Agregar al carrito'}</button>
        ${href ? `<a class="button" href="${escape_html(href)}" target="_blank" rel="noopener noreferrer" data-whatsapp-inquiry>Consultar por WhatsApp</a>` : '<p class="muted" role="status">WhatsApp no está disponible en este momento.</p>'}</div>`;
}
function product_scent_trail(product) {
    const steps = [['Salida','salida'],['Corazón','corazon'],['Fondo','fondo']];
    const notes = steps.map(([title,key], index) => `<li class="note-block scent-step"><span class="scent-step-index" aria-hidden="true">0${index + 1}</span><h3>${title}</h3><p>${escape_html(product.notes[key].join(' · '))}</p></li>`).join('');
    return `<section class="scent-trail" aria-labelledby="scent-trail-title"><div class="scent-trail-header"><div><p class="eyebrow">DREAMS Scent Trail</p><h2 id="scent-trail-title">La evolución de la fragancia</h2></div><p>De la primera impresión a la estela final, descubrí cómo se despliegan sus notas.</p></div><ol class="notes-grid" aria-label="Etapas olfativas">${notes}</ol></section>`;
}
function setup_product_actions(product) {
    document.getElementById('detail-add').addEventListener('click', () => add_to_cart(product));
    document.querySelector('[data-whatsapp-inquiry]')?.addEventListener('click', () => {
        // El enlace nativo abre durante el gesto; la consulta registrada no debe bloquearlo.
        fetch('/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_id: product.id }), keepalive: true }).catch(() => {});
    });
}
async function render_product_detail(product) {
    const container = document.getElementById('product-detail');
    const config = await get_public_config().catch(() => ({}));
    const href = product_whatsapp_url(product, config.whatsapp_number);
    container.innerHTML = `<section class="detail-layout">${product_detail_image(product)}<div class="detail-info">${product_detail_intro(product)}${product_detail_actions(product, href)}${product_scent_trail(product)}</div></section>`;
    attach_image_fallback(container.querySelector('.detail-image img')); setup_product_actions(product);
}

document.addEventListener('DOMContentLoaded', load_product_detail);
