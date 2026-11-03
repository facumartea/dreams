var cart_account = typeof account_cart === 'undefined' ? null : account_cart;
let cart_request_id = 0;
let academic_cart_summary = null;

function cart_row_markup(item) {
    return `
            <img src="${escape_html(safe_image_url(item.image_url))}" alt="${escape_html(`${item.brand} ${item.name}`)}">
            <div><p>${escape_html(item.brand)}</p>
                <h3>${escape_html(item.name)}</h3>
                <p>${item.unavailable ? 'No disponible en la cantidad solicitada' : format_price(item.price) + ' cada uno'}</p>
                <div class="quantity-controls">
                    <button data-action="minus" aria-label="Quitar una unidad">−</button>
                    <span>${item.quantity}</span>
                    <button data-action="plus" aria-label="Agregar una unidad">+</button>
                </div><br>
                <button class="remove-button">Eliminar</button>
            </div><strong>${format_price(item.price * item.quantity)}</strong>
        `;

 }
function cart_row(item) {
        const row = document.createElement('article');
        row.className = 'cart-row';
        row.innerHTML = cart_row_markup(item);
        attach_image_fallback(row.querySelector('img'));
        row.querySelector('[data-action="minus"]').addEventListener('click', () => update_cart(item.id, -1));
        row.querySelector('[data-action="plus"]').addEventListener('click', () => update_cart(item.id, 1));
        row.querySelector('.remove-button').addEventListener('click', async () => {
            await remove_from_cart(item.id);
            show_toast('Producto eliminado del carrito.');
            load_cart();
        });
    return row;
}
function cart_actions(whatsapp_url, checkout_enabled, state) {
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
    return { consultation, checkout };
}
function cart_summary(total, academic, state, consultation, checkout) {
    return `
        <p class="eyebrow">RESUMEN</p>
        <div class="summary-line"><span>Productos</span><strong>${format_price(total)}</strong></div>
        ${academic ? `<div class="summary-line"><span>${escape_html(academic.shipping_label)}</span><span>${format_price(academic.shipping)}</span></div>` : state === 'ready' ? '<div class="summary-line"><span>Envío</span><span>A consultar</span></div><p class="cart-payment-note">Envío no incluido. Su costo se confirma antes del pago.</p>' : ''}
        <div class="summary-line summary-total"><span>${academic ? 'Total' : 'Subtotal'}</span><strong>${format_price(total)}</strong></div>
        ${checkout}
        ${consultation}
        ${state === 'error' ? '<button id="retry-cart" class="text-button" type="button">Reintentar</button>' : ''}
        <button id="clear-cart" class="remove-button">Vaciar carrito</button>
    `;

 }
function empty_cart_markup(state) {
    if (state === 'error') return '<div class="empty-state" role="status"><h2>No pudimos recuperar tu carrito.</h2><p>Tu selección no se eliminó. Volvé a intentar.</p><button id="retry-cart" type="button" class="button">Reintentar</button></div>';
    if (state === 'loading' && cart_account && !cart_account.initialized) return '<div class="empty-state" role="status"><p>Recuperando tu carrito…</p></div>';
    return '<div class="empty-state"><h2>Tu carrito está vacío.</h2><p>Todavía no encontraste el perfume de tus sueños.</p><a class="button button-dark" href="/catalogo.html">Explorar perfumes</a></div>';
}
function render_cart(cart = get_cart(), whatsapp_url = null, checkout_enabled = false, state = 'loading', academic = academic_cart_summary) {
    const container = document.getElementById('cart-items'), summary = document.getElementById('cart-summary');
    if (!cart.length) {
        container.innerHTML = empty_cart_markup(state);
        summary.innerHTML = ''; document.getElementById('retry-cart')?.addEventListener('click', load_cart); return;
    }
    container.replaceChildren(...cart.map(cart_row));
    const { consultation, checkout } = cart_actions(whatsapp_url, checkout_enabled, state);
    summary.innerHTML = cart_summary(cart.reduce((sum, item) => sum + item.price * item.quantity, 0), academic, state, consultation, checkout);
    document.getElementById('clear-cart').addEventListener('click', async () => {
        try { await cart_account?.ready(); clear_cart(); update_cart_count(); load_cart(); }
        catch { show_toast('No se pudo sincronizar el carrito. Reintentá.'); }
    });
    document.getElementById('retry-cart')?.addEventListener('click', load_cart);
}

async function update_cart(product_id, change) {
    await change_quantity(product_id, change);
    load_cart();
}

async function cart_quote_responses(cart) {
    return await Promise.all([fetch('/api/cart/quote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: cart.map(item => ({ id: item.id, quantity: item.quantity })) })
        }), fetch('/api/checkout/config').then(async result => {
            if (!result.ok) return false;
            const checkout_config = await result.json();
            return checkout_config.enabled === true;
        }).catch(() => false)]);
 }
async function accept_cart_quote(request_id, response, checkout_response) {
        const data = await response.json();
        if (request_id !== cart_request_id) return;
        if (!response.ok) throw new Error(data.error || 'No se pudo verificar el carrito.');
        academic_cart_summary = data.shipping === 0 && typeof data.shipping_label === 'string' ? { shipping: data.shipping, shipping_label: data.shipping_label } : null;
        save_cart(data.items, {reconcile:true});
        render_cart(cart_account?.active() ? get_cart() : data.items, get_cart().some(i=>i.unavailable) ? null : data.whatsapp_url, checkout_response && !get_cart().some(i=>i.unavailable), 'ready');
        if (data.warnings?.length) show_toast(data.warnings.join(' '));
 }
async function load_cart() {
    const request_id = ++cart_request_id;
    render_cart(get_cart());
    try { if(cart_account) await cart_account.ready(); } catch { render_cart(get_cart(),null,false,'error'); return; }
    if (request_id !== cart_request_id) return;
    const cart = get_cart();
    render_cart(cart);
    if (!cart.length) return;

    try {
        const [response, checkout_response] = await cart_quote_responses(cart);
        await accept_cart_quote(request_id, response, checkout_response);
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

window.addEventListener('dreams:cart', load_cart);
