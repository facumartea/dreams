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
    const title = `${product.name} | DREAMS`;
    const description = `${product.brand} ${product.name}, ${product.size_ml} ml. ${product.family}. Consultá precio, notas e intensidad en DREAMS.`;
    const canonical_url = `${window.location.origin}/producto.html?id=${encodeURIComponent(product.id)}`;
    document.title = title;
    document.querySelector('meta[name="description"]').content = description;
    document.getElementById('canonical-url').href = canonical_url;
    document.getElementById('og-title').content = title;
    document.getElementById('og-description').content = description;
    document.getElementById('og-url').content = canonical_url;
    document.getElementById('og-image').content = safe_image_url(product.image_url);
}

async function render_product_detail(product) {
    const container = document.getElementById('product-detail');
    const config = await get_public_config();
    const whatsapp_text = encodeURIComponent(`Hola DREAMS, quiero consultar por ${product.brand} ${product.name} de ${product.size_ml} ml.`);
    const whatsapp_url = `https://wa.me/${encodeURIComponent(config.whatsapp_number)}?text=${whatsapp_text}`;

    container.innerHTML = `
        <section class="detail-layout">
            <div class="detail-image">
                <img src="${escape_html(safe_image_url(product.image_url))}" alt="${escape_html(`${product.brand} ${product.name}`)}">
            </div>
            <div class="detail-info">
                <p class="eyebrow">${escape_html(product.category)} · ${escape_html(product.gender)} · ${escape_html(product.size_ml)} ml</p>
                <h1>${escape_html(product.name)}</h1>
                <p class="product-meta">${escape_html(product.brand)} · ${escape_html(product.family)}</p>
                <div class="detail-price">${format_price(product.price)}</div>
                <p class="detail-description">${escape_html(product.description)}</p>
                <div class="intensity" title="Intensidad ${product.intensity} de 5">
                    ${[1, 2, 3, 4, 5].map(number => `<span class="${number <= product.intensity ? 'active' : ''}"></span>`).join('')}
                </div>
                <p class="product-meta">Intensidad: ${product.intensity}/5 · Stock: ${product.stock > 0 ? product.stock + " unidades" : "Agotado"}</p>
                <div class="detail-actions">
                    <button id="detail-add" class="button button-dark" ${Number(product.stock) === 0 ? 'disabled' : ''}>${Number(product.stock) === 0 ? 'Agotado' : 'Agregar al carrito'}</button>
                    <a class="button" href="${whatsapp_url}" target="_blank" rel="noreferrer" data-whatsapp-inquiry>Consultar por WhatsApp</a>
                </div>
                <section class="scent-trail" aria-labelledby="scent-trail-title">
                    <div class="scent-trail-header">
                        <div>
                            <p class="eyebrow">DREAMS Scent Trail</p>
                            <h2 id="scent-trail-title">La evolución de la fragancia</h2>
                        </div>
                        <p>De la primera impresión a la estela final, descubrí cómo se despliegan sus notas.</p>
                    </div>
                    <ol class="notes-grid" aria-label="Etapas olfativas">
                        <li class="note-block scent-step"><span class="scent-step-index" aria-hidden="true">01</span><h3>Salida</h3><p>${escape_html(product.notes.salida.join(' · '))}</p></li>
                        <li class="note-block scent-step"><span class="scent-step-index" aria-hidden="true">02</span><h3>Corazón</h3><p>${escape_html(product.notes.corazon.join(' · '))}</p></li>
                        <li class="note-block scent-step"><span class="scent-step-index" aria-hidden="true">03</span><h3>Fondo</h3><p>${escape_html(product.notes.fondo.join(' · '))}</p></li>
                    </ol>
                </section>
            </div>
        </section>
    `;

    attach_image_fallback(container.querySelector('.detail-image img'));

    document.getElementById('detail-add').addEventListener('click', () => add_to_cart(product));
    document.querySelector('[data-whatsapp-inquiry]').addEventListener('click', async event => {
        event.preventDefault();
        try {
            const response = await fetch('/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_id: product.id }) });
            const data = await response.json();
            window.open(data.whatsapp_url || whatsapp_url, '_blank');
        } catch (error) {
            window.open(whatsapp_url, '_blank');
        }
    });
}

document.addEventListener('DOMContentLoaded', load_product_detail);
