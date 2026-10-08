let cart_request_id = 0;

function render_cart(cart = get_cart(), whatsapp_url = null, checkout_enabled = false, state = 'loading') {
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

    const consultation = /^https:\/\/wa\.me\/\d{8,15}\?text=/.test(whatsapp_url || '')
        ? `<a class="text-button cart-whatsapp-link" href="${escape_html(whatsapp_url)}" target="_blank" rel="noreferrer">Consultar por WhatsApp</a>`
        : (state === 'ready' ? '<p class="cart-payment-note">La consulta por WhatsApp no está disponible.</p>' : '');
    const payment_note = state === 'loading'
        ? 'Verificando disponibilidad de pago…'
        : state === 'error'
            ? 'No pudimos verificar el carrito. Reintentá antes de continuar.'
            : 'Pago online no disponible. No se realizó ningún pedido ni cobro.';
    const checkout = checkout_enabled
        ? '<a class="button button-primary checkout-link" href="/checkout.html">Comprar</a>'
        : `<button class="button button-primary" type="button" disabled>Comprar</button><p class="cart-payment-note" role="status">${payment_note}</p>`;
    summary.innerHTML = `
        <p class="eyebrow">RESUMEN</p>
        <div class="summary-line"><span>Productos</span><strong>${format_price(total)}</strong></div>
        <div class="summary-line"><span>Envío</span><span>A consultar</span></div>
        <div class="summary-line summary-total"><span>Subtotal</span><strong>${format_price(total)}</strong></div>
        <p class="cart-payment-note">Envío no incluido. Su costo se confirma antes del pago.</p>
        ${checkout}
        ${consultation}
        ${state === 'error' ? '<button id="retry-cart" class="text-button" type="button">Reintentar</button>' : ''}
        <button id="clear-cart" class="remove-button">Vaciar carrito</button>
    `;

    document.getElementById('clear-cart').addEventListener('click', () => {
        localStorage.removeItem('dreams_cart');
        update_cart_count();
        load_cart();
    });
    document.getElementById('retry-cart')?.addEventListener('click', load_cart);
}

function update_cart(product_id, change) {
    change_quantity(product_id, change);
    load_cart();
}

async function load_cart() {
    const request_id = ++cart_request_id;
    const cart = get_cart();
    render_cart(cart);
    if (!cart.length) return;

    try {
        const [response, checkout_response] = await Promise.all([fetch('/api/cart/quote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: cart.map(item => ({ id: item.id, quantity: item.quantity })) })
        }), fetch('/api/checkout/config').then(async result => {
            if (!result.ok) return false;
            const checkout_config = await result.json();
            return checkout_config.enabled === true;
        }).catch(() => false)]);
        const data = await response.json();
        if (request_id !== cart_request_id) return;
        if (!response.ok) throw new Error(data.error || 'No se pudo verificar el carrito.');
        save_cart(data.items);
        render_cart(data.items, data.whatsapp_url, checkout_response, 'ready');
        if (data.warnings?.length) show_toast(data.warnings.join(' '));
    } catch (error) {
        if (request_id !== cart_request_id) return;
        render_cart(get_cart(), null, false, 'error');
        show_toast(`${error.message} La consulta queda deshabilitada hasta reintentar.`);
    }
}

document.addEventListener('DOMContentLoaded', load_cart);
window.addEventListener('storage', event => {
    if (event.key === 'dreams_cart' || event.key === null) load_cart();
});
