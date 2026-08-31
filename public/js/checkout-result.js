const RESULT_COPY = {
    approved: ['Pago aprobado', 'Tu pedido quedó registrado correctamente.'],
    rejected: ['Pago rechazado', 'No se realizó ningún cobro. Podés volver a intentarlo.'],
    pending: ['Pago pendiente', 'La operación quedó pendiente dentro de la demostración.'],
    cancelled: ['Pago cancelado', 'La operación fue cancelada y no se completó el pedido.'],
    error: ['No pudimos confirmar el pago', 'El pedido queda registrado para poder revisarlo de forma segura.']
};

function render_payment_result(status, order_id) {
    const result = document.getElementById('payment-result');
    const copy = RESULT_COPY[status] || RESULT_COPY.error;
    result.className = `payment-result status-${status}`;
    result.innerHTML = `<p class="eyebrow">DREAMS · CHECKOUT</p><h1>${escape_html(copy[0])}</h1><p>${escape_html(copy[1])}</p><p class="order-reference">Pedido ${escape_html(order_id)}</p><div class="result-actions"><a class="button button-primary" href="/catalogo.html">Seguir explorando</a><a class="button" href="/cuenta.html">Ir a mi cuenta</a></div>`;
    if (status === 'approved') {
        localStorage.removeItem('dreams_cart');
        update_cart_count();
    }
}

async function load_payment_result() {
    const params = new URLSearchParams(window.location.search);
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
        render_payment_result(data.status, order_id);
    } catch (error) {
        render_payment_result('error', order_id || 'sin referencia');
    }
}

document.addEventListener('DOMContentLoaded', load_payment_result);
