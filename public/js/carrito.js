function render_cart() {
    const cart = get_cart();
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
                    <button data-action="minus">−</button>
                    <span>${item.quantity}</span>
                    <button data-action="plus">+</button>
                </div>
                <br>
                <button class="remove-button">Eliminar</button>
            </div>
            <strong>${format_price(subtotal)}</strong>
        `;

        attach_image_fallback(row.querySelector('img'));

        row.querySelector('[data-action="minus"]').addEventListener('click', () => {
            change_quantity(item.id, -1);
            render_cart();
        });

        row.querySelector('[data-action="plus"]').addEventListener('click', () => {
            change_quantity(item.id, 1);
            render_cart();
        });

        row.querySelector('.remove-button').addEventListener('click', () => {
            remove_from_cart(item.id);
            show_toast('Producto eliminado del carrito.');
            render_cart();
        });

        container.appendChild(row);
    });

    summary.innerHTML = `
        <p class="eyebrow">RESUMEN</p>
        <div class="summary-line"><span>Productos</span><strong>${format_price(total)}</strong></div>
        <div class="summary-line"><span>Envío</span><span>A consultar</span></div>
        <div class="summary-line summary-total"><span>Total</span><strong>${format_price(total)}</strong></div>
        <a class="button button-dark" href="https://wa.me/542944502390?text=${encodeURIComponent('Hola DREAMS, quiero consultar por los productos de mi carrito.')}" target="_blank" rel="noreferrer">Consultar carrito por WhatsApp</a>
        <button id="clear-cart" class="remove-button">Vaciar carrito</button>
    `;

    document.getElementById('clear-cart').addEventListener('click', () => {
        localStorage.removeItem('dreams_cart');
        update_cart_count();
        render_cart();
    });
}

document.addEventListener('DOMContentLoaded', render_cart);
