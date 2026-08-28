function render_cart(cart = get_cart(), whatsapp_url = null) {
    const container = document.getElementById('cart-items');
    const summary = document.getElementById('cart-summary');

    if (cart.length === 0) {
        container.innerHTML = '<div class="empty-state"><h2>Tu carrito está vacío.</h2><p>Todavía no encontraste el perfume de tus sueños.</p><a class="button button-dark" href="/catalogo.html">Explorar perfumes</a></div>';
        summary.innerHTML = '';
        return;
    }

    container.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        const row = document.createElement('article');
        row.className = 'cart-row';
        row.innerHTML = `
            <img src="${escape_html(safe_image_url(item.image_url))}" alt="${escape_html(`${item.brand} ${item.name}`)}">
            <div>
                <p>${escape_html(item.brand)}</p>
                <h3>${escape_html(item.name)}</h3>
                <p>${format_price(item.price)} cada uno</p>
                <div class="quantity-controls">
                    <button data-action="minus" aria-label="Quitar una unidad">−</button>
                    <span>${item.quantity}</span>
                    <button data-action="plus" aria-label="Agregar una unidad">+</button>
                </div>
                <br>
                <button class="remove-button">Eliminar</button>
            </div>
            <strong>${format_price(subtotal)}</strong>
        `;

        attach_image_fallback(row.querySelector('img'));
        row.querySelector('[data-action="minus"]').addEventListener('click', () => update_cart(item.id, -1));
        row.querySelector('[data-action="plus"]').addEventListener('click', () => update_cart(item.id, 1));
        row.querySelector('.remove-button').addEventListener('click', () => {
            remove_from_cart(item.id);
            show_toast('Producto eliminado del carrito.');
            load_cart();
        });
        container.appendChild(row);
    });

    const consultation = whatsapp_url
        ? `<a class="button button-dark" href="${escape_html(whatsapp_url)}" target="_blank" rel="noreferrer">Consultar carrito por WhatsApp</a>`
        : '<button class="button button-dark" disabled>Verificando precio y stock…</button>';
    summary.innerHTML = `
        <p class="eyebrow">RESUMEN</p>
        <div class="summary-line"><span>Productos</span><strong>${format_price(total)}</strong></div>
        <div class="summary-line"><span>Envío</span><span>A consultar</span></div>
        <div class="summary-line summary-total"><span>Total</span><strong>${format_price(total)}</strong></div>
        ${consultation}
        <button id="clear-cart" class="remove-button">Vaciar carrito</button>
    `;

    document.getElementById('clear-cart').addEventListener('click', () => {
        localStorage.removeItem('dreams_cart');
        update_cart_count();
        render_cart();
    });
}

function update_cart(product_id, change) {
    change_quantity(product_id, change);
    load_cart();
}

async function load_cart() {
    const cart = get_cart();
    render_cart(cart);
    if (!cart.length) return;

    try {
        const response = await fetch('/api/cart/quote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: cart.map(item => ({ id: item.id, quantity: item.quantity })) })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'No se pudo verificar el carrito.');
        save_cart(data.items);
        render_cart(data.items, data.whatsapp_url);
        if (data.warnings.length) show_toast(data.warnings.join(' '));
    } catch (error) {
        show_toast(`${error.message} La consulta queda deshabilitada hasta reintentar.`);
    }
}

document.addEventListener('DOMContentLoaded', load_cart);
