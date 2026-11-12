// inicia solo la simulacion academica; no crea pedidos comerciales ni recibe un proveedor de pagos.
// los datos de tarjeta quedan en el formulario y no se incluyen en estas peticiones.
function checkout_items_payload() {
    return get_cart().map(item => ({ id: item.id, quantity: item.quantity }));
}

// dibuja importes ya cotizados por el servidor; esta funcion no decide el descuento.
function render_checkout(items, subtotal, discount, total) {
    const container = document.getElementById('checkout-items');
    container.innerHTML = '';
    items.forEach(item => {
        const row = document.createElement('article');
        row.className = 'checkout-item';
        row.innerHTML = `<img src="${escape_html(safe_image_url(item.image_url))}" alt=""><div><span>${escape_html(item.brand)}</span><h3>${escape_html(item.name)}</h3><p>${item.quantity} × ${format_price(item.price)}</p></div><strong>${format_price(item.price * item.quantity)}</strong>`;
        attach_image_fallback(row.querySelector('img'));
        container.appendChild(row);
    });
    document.querySelector('#checkout-subtotal strong').textContent = format_price(subtotal);
    const discount_row = document.getElementById('checkout-discount');
    discount_row.hidden = !(discount > 0);
    discount_row.querySelector('strong').textContent = `−${format_price(discount)}`;
    document.querySelector('#checkout-total strong').textContent = format_price(total);
}

// espera la configuracion real; si no esta disponible conserva carrito y muestra el error.
async function setup_checkout() {
    const button = document.getElementById('checkout-submit');
    const status = document.getElementById('checkout-status');
    try {
        const response = await fetch('/api/checkout/config');
        const config = await response.json();
        if (!response.ok || !config.enabled || config.provider !== 'presentation_demo') throw new Error('El checkout académico no está disponible temporalmente.');
        await PresentationCheckout.setup(config);
    } catch (error) {
        status.textContent = interface_error(error);
        button.disabled = true;
    }
}
document.addEventListener('DOMContentLoaded', setup_checkout);
