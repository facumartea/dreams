async function load_product_detail() {
    const params = new URLSearchParams(window.location.search);
    const product_id = Number(params.get('id'));
    const container = document.getElementById('product-detail');

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

        document.title = `${product.name} | DREAMS`;
        save_recent_product(product);
        render_recent_products();
        render_product_detail(product);
    } catch (error) {
        container.innerHTML = `<div class="empty-state"><h2>${error.message}</h2><a class="button button-dark" href="/catalogo.html">Volver al catálogo</a></div>`;
    }
}

function render_product_detail(product) {
    const container = document.getElementById('product-detail');
    const whatsapp_text = encodeURIComponent(`Hola DREAMS, quiero consultar por ${product.brand} ${product.name} de ${product.size_ml} ml.`);
    const whatsapp_url = `https://wa.me/542944502390?text=${whatsapp_text}`;

    container.innerHTML = `
        <section class="detail-layout">
            <div class="detail-image">
                <img src="${product.image_url}" alt="${product.brand} ${product.name}" onerror="this.src='https://images.unsplash.com/photo-1563170351-be82bc888aa4?auto=format&fit=crop&w=1000&q=85'">
            </div>
            <div class="detail-info">
                <p class="eyebrow">${product.category} · ${product.gender} · ${product.size_ml} ml</p>
                <h1>${product.name}</h1>
                <p class="product-meta">${product.brand} · ${product.family}</p>
                <div class="detail-price">${format_price(product.price)}</div>
                <p class="detail-description">${product.description}</p>
                <div class="intensity" title="Intensidad ${product.intensity} de 5">
                    ${[1, 2, 3, 4, 5].map(number => `<span class="${number <= product.intensity ? 'active' : ''}"></span>`).join('')}
                </div>
                <p class="product-meta">Intensidad: ${product.intensity}/5 · Stock: ${product.stock > 0 ? product.stock + " unidades" : "Agotado"}</p>
                <div class="detail-actions">
                    <button id="detail-add" class="button button-dark" ${Number(product.stock) === 0 ? 'disabled' : ''}>${Number(product.stock) === 0 ? 'Agotado' : 'Agregar al carrito'}</button>
                    <a class="button" href="${whatsapp_url}" target="_blank" rel="noreferrer" data-whatsapp-inquiry>Consultar por WhatsApp</a>
                    <button id="detail-favorite" class="button">♡ Favorito</button>
                </div>
                <div class="notes-grid">
                    <article class="note-block"><h3>Salida</h3><p>${product.notes.salida.join(' · ')}</p></article>
                    <article class="note-block"><h3>Corazón</h3><p>${product.notes.corazon.join(' · ')}</p></article>
                    <article class="note-block"><h3>Fondo</h3><p>${product.notes.fondo.join(' · ')}</p></article>
                </div>
            </div>
        </section>
    `;

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
    document.getElementById('detail-favorite').addEventListener('click', event => toggle_favorite(product.id, event.currentTarget));
}

document.addEventListener('DOMContentLoaded', load_product_detail);
