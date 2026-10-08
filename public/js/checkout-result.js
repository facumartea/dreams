const RESULT_COPY = {
    approved: ['Pago realizado con éxito', 'Tu compra fue registrada correctamente.'],
    rejected: ['Pago rechazado', 'No se realizó ningún cobro. Podés volver a intentarlo.'],
    pending: ['Pago pendiente', 'Estamos esperando la confirmación del pago.'],
    cancelled: ['Pago cancelado', 'La operación fue cancelada y no se completó el pedido.'],
    error: ['No pudimos confirmar el pago', 'El pedido queda registrado para poder revisarlo de forma segura.']
};

function render_payment_result(status, order_number) {
    const result = document.getElementById('payment-result');
    const copy = RESULT_COPY[status] || RESULT_COPY.error;
    const icon = status === 'approved'
        ? '<span class="payment-result-icon" aria-hidden="true"><svg viewBox="0 0 48 48"><path d="m13 25 7 7 15-17"/></svg></span>'
        : '';
    result.className = `payment-result status-${status}`;
    result.innerHTML = `${icon}<p class="eyebrow">DREAMS · PAGO</p><h1>${escape_html(copy[0])}</h1><p>${escape_html(copy[1])}</p><div class="order-reference"><span>N° de compra</span><strong>${escape_html(order_number)}</strong></div><div class="result-actions"><a class="button button-primary" href="/catalogo.html">Seguir comprando</a><a class="button" href="/cuenta.html">Ir a mi cuenta</a></div>`;
    if (status === 'approved') {
        localStorage.removeItem('dreams_cart');
        sessionStorage.removeItem('dreams_coupon');
        sessionStorage.removeItem('dreams_demo_order_id');
        update_cart_count();
    }
}

async function load_payment_result() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('presentation') === '1') return PresentationCheckout.result();
    const order_id = params.get('order_id') || '';
    const payment_id = params.get('payment_id') || params.get('collection_id') || '';
    try {
        let response;
        if (payment_id) {
            response = await fetch('/api/checkout/confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order_id, payment_id }) });
        } else {
            response = await fetch(`/api/orders/${encodeURIComponent(order_id)}`);
        }
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'No se pudo verificar el pago.');
        render_payment_result(data.status, data.order_number || `DRM-${order_id.replace(/-/g, '').slice(0, 12).toUpperCase()}`);
    } catch (error) {
        render_payment_result('error', order_id || 'sin referencia');
    }
}

document.addEventListener('DOMContentLoaded', load_payment_result);
