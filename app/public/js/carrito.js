// muestra cantidades y cupones; toma los importes confirmados por servidor antes de comprar.
var cart_account = typeof account_cart === 'undefined' ? null : account_cart;
let cart_request_id = 0;
let academic_cart_summary = null;

function crear_contenido_de_fila_del_carrito(item) {
    return `
            <img src="${escapar_texto_html(elegir_url_de_imagen_segura(item.image_url))}" alt="${escapar_texto_html(`${item.brand} ${item.name}`)}">
            <div><p>${escapar_texto_html(item.brand)}</p>
                <h3>${escapar_texto_html(item.name)}</h3>
                <p>${item.unavailable ? 'No disponible en la cantidad solicitada' : formatear_precio(item.price) + ' cada uno'}</p>
                <div class="quantity-controls">
                    <button data-action="minus" aria-label="Quitar una unidad">−</button>
                    <span>${item.quantity}</span>
                    <button data-action="plus" aria-label="Agregar una unidad">+</button>
                </div><br>
                <button class="remove-button">Eliminar</button>
            </div><strong>${formatear_precio(item.price * item.quantity)}</strong>
        `;

 }
function crear_fila_del_carrito(item) {
        const row = document.createElement('article');
        row.className = 'cart-row';
        row.innerHTML = crear_contenido_de_fila_del_carrito(item);
        preparar_imagen_alternativa(row.querySelector('img'));
        row.querySelector('[data-action="minus"]').addEventListener('click', () => actualizar_carrito(item.id, -1));
        row.querySelector('[data-action="plus"]').addEventListener('click', () => actualizar_carrito(item.id, 1));
        row.querySelector('.remove-button').addEventListener('click', async () => {
            await quitar_perfume_del_carrito(item.id);
            mostrar_aviso('Producto eliminado del carrito.');
            cargar_carrito();
        });
    return row;
}
function crear_acciones_del_carrito(whatsapp_url, checkout_enabled, state) {
    const consultation = /^https:\/\/wa\.me\/\d{8,15}\?text=/.test(whatsapp_url || '')
        ? `<a class="text-button cart-whatsapp-link" href="${escapar_texto_html(whatsapp_url)}" target="_blank" rel="noreferrer">Consultar por WhatsApp</a>`
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
function crear_resumen_del_carrito(total, academic, state, consultation, checkout) {
    return `
        <p class="eyebrow">RESUMEN</p>
        <div class="summary-line"><span>Productos</span><strong>${formatear_precio(academic?.subtotal ?? total)}</strong></div>
        ${academic?.discount ? `<div class="summary-line"><span>Descuento</span><strong>−${formatear_precio(academic.discount)}</strong></div>` : ''}
        ${academic ? `<div class="summary-line"><span>${escapar_texto_html(academic.shipping_label)}</span><span>${formatear_precio(academic.shipping)}</span></div>` : state === 'ready' ? '<div class="summary-line"><span>Envío</span><span>A consultar</span></div><p class="cart-payment-note">Envío no incluido. Su costo se confirma antes del pago.</p>' : ''}
        <div class="summary-line summary-total"><span>${academic ? 'Total' : 'Subtotal'}</span><strong>${formatear_precio(academic?.total ?? total)}</strong></div>
        ${crear_formulario_del_cupon(state)}
        ${checkout}
        ${consultation}
        ${state === 'error' ? '<button id="retry-cart" class="text-button" type="button">Reintentar</button>' : ''}
        <button id="clear-cart" class="remove-button">Vaciar carrito</button>
    `;

 }
function crear_aviso_de_carrito_vacio(state) {
    if (state === 'error') return '<div class="empty-state" role="status"><h2>No pudimos recuperar tu carrito.</h2><p>Tu selección no se eliminó. Volvé a intentar.</p><button id="retry-cart" type="button" class="button">Reintentar</button></div>';
    if (state === 'loading' && cart_account && !cart_account.initialized) return '<div class="empty-state" role="status"><p>Recuperando tu carrito…</p></div>';
    return '<div class="empty-state"><h2>Tu carrito está vacío.</h2><p>Todavía no encontraste el perfume de tus sueños.</p><a class="button button-dark" href="/catalogo.html">Explorar perfumes</a></div>';
}
function mostrar_carrito(cart = leer_carrito(), whatsapp_url = null, checkout_enabled = false, state = 'loading', academic = academic_cart_summary) {
    const container = document.getElementById('cart-items'), summary = document.getElementById('cart-summary');
    if (!cart.length) {
        container.innerHTML = crear_aviso_de_carrito_vacio(state);
        summary.innerHTML = ''; document.getElementById('retry-cart')?.addEventListener('click', cargar_carrito); return;
    }
    container.replaceChildren(...cart.map(crear_fila_del_carrito));
    const { consultation, checkout } = crear_acciones_del_carrito(whatsapp_url, checkout_enabled, state);
    summary.innerHTML = crear_resumen_del_carrito(cart.reduce((sum, item) => sum + item.price * item.quantity, 0), academic, state, consultation, checkout);
    document.getElementById('clear-cart').addEventListener('click', async () => {
        try { await cart_account?.ready(); vaciar_carrito(); actualizar_contador_del_carrito(); cargar_carrito(); }
        catch { mostrar_aviso('No se pudo sincronizar el carrito. Reintentá.'); }
    });
    document.getElementById('retry-cart')?.addEventListener('click', cargar_carrito);
    conectar_formulario_del_cupon();
}

async function actualizar_carrito(product_id, change) {
    await cambiar_cantidad_del_perfume(product_id, change);
    cargar_carrito();
}

async function consultar_importes_del_carrito(cart) {
    return await Promise.all([fetch('/api/cart/quote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ coupon_code: leer_codigo_del_cupon(), items: cart.map(item => ({ id: item.id, quantity: item.quantity })) })
        }), fetch('/api/checkout/config').then(async result => {
            if (!result.ok) return false;
            const checkout_config = await result.json();
            return checkout_config.enabled === true;
        }).catch(() => false)]);
 }
async function aceptar_cotizacion_del_carrito(request_id, respuesta, checkout_response) {
        const data = await respuesta.json();
        if (request_id !== cart_request_id) return;
        if (!respuesta.ok) throw new Error(data.error || 'No se pudo verificar el carrito.');
        academic_cart_summary = data.shipping === 0 && typeof data.shipping_label === 'string' ? data : null;
        cart_coupon_message = data.coupon_error || (data.coupon ? 'Cupón aplicado.' : cart_coupon_message);
        if (data.coupon_error) sessionStorage.removeItem('dreams_coupon');
        guardar_carrito(data.items, {reconcile:true});
        mostrar_carrito(cart_account?.active() ? leer_carrito() : data.items, leer_carrito().some(i=>i.unavailable) ? null : data.whatsapp_url, checkout_response && !leer_carrito().some(i=>i.unavailable), 'ready');
        if (data.warnings?.length) mostrar_aviso(data.warnings.join(' '));
 }
async function cargar_carrito() {
    const request_id = ++cart_request_id;
    academic_cart_summary = null;
    mostrar_carrito(leer_carrito());
    try { if(cart_account) await cart_account.ready(); } catch { mostrar_carrito(leer_carrito(),null,false,'error'); return; }
    if (request_id !== cart_request_id) return;
    const cart = leer_carrito();
    mostrar_carrito(cart);
    if (!cart.length) return;

    try {
        const [response, checkout_response] = await consultar_importes_del_carrito(cart);
        await aceptar_cotizacion_del_carrito(request_id, response, checkout_response);
    } catch (error) {
        if (request_id !== cart_request_id) return;
        mostrar_carrito(leer_carrito(), null, false, 'error');
        mostrar_aviso(`${error.message} La consulta queda deshabilitada hasta reintentar.`);
    }
}

document.addEventListener('DOMContentLoaded', cargar_carrito);
window.addEventListener('storage', event => {
    if (event.key === 'dreams_cart' || event.key === null) cargar_carrito();
});

window.addEventListener('dreams:cart', cargar_carrito);

let cart_coupon_message = '';
function crear_formulario_del_cupon(state) {
    return `<form id="cart-coupon-form" class="coupon-box"><label for="cart-coupon">Cupón de descuento</label><div class="coupon-control"><input id="cart-coupon" ${state === 'loading' ? 'disabled' : ''} maxlength="40" placeholder="Ingresá tu cupón" value="${escapar_texto_html(leer_codigo_del_cupon())}"><button type="submit" ${state === 'loading' ? 'disabled aria-busy="true"' : ''}>${state === 'loading' ? 'Verificando…' : 'Aplicar'}</button></div><p role="status" aria-live="polite">${escapar_texto_html(cart_coupon_message)}</p>${sessionStorage.getItem('dreams_coupon') ? '<button id="cart-coupon-remove" type="button" class="text-button">Quitar cupón</button>' : ''}</form>`;
}
function conectar_formulario_del_cupon() {
    document.getElementById('cart-coupon-form')?.addEventListener('submit', event => {
        event.preventDefault();
        const code = document.getElementById('cart-coupon').value.trim().toUpperCase();
        if (!code) { cart_coupon_message = 'Ingresá un cupón.'; cargar_carrito(); return; }
        sessionStorage.setItem('dreams_coupon', code); cart_coupon_message = ''; cargar_carrito();
    });
    document.getElementById('cart-coupon-remove')?.addEventListener('click', () => {
        sessionStorage.removeItem('dreams_coupon'); cart_coupon_message = 'Cupón quitado.'; cargar_carrito();
    });
}

function leer_codigo_del_cupon() { return typeof sessionStorage === 'undefined' ? '' : sessionStorage.getItem('dreams_coupon') || ''; }
