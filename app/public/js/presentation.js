// referencias firmadas para la simulacion: no lee, envia ni guarda campos de tarjeta.
const PRESENTATION_KEY = 'dreams_presentation_checkout';
let presentation_expected_totals = null;
const presentation_totals = value => JSON.stringify([value.subtotal, value.discount || 0, value.total, value.coupon?.code || '']);
const PRESENTATION_RECEIPT = 'dreams_presentation_receipt';
const presentation_snapshot = items => JSON.stringify([sessionStorage.getItem('dreams_coupon') || '', items.map(item => [Number(item.id), Number(item.quantity)]).sort((a, b) => a[0] - b[0])]);
async function presentation_request(path, body) {
        let response;
        try { response = await fetch(`/api/presentation/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); }
        catch { throw new Error('No pudimos conectar. Reintentá: la referencia se conserva.'); }
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            if (path === 'payment' && response.status === 400) sessionStorage.removeItem(PRESENTATION_KEY);
            throw new Error(data.error || 'No pudimos completar la operación.');
        }
        return data;
    }
function presentation_layout(form) {
        document.getElementById('sandbox-banner').hidden = true;
        document.getElementById('sandbox-help').remove();
        form.hidden = false;
        form.noValidate = true;
        document.querySelector('.coupon-box').hidden = true; // el cupon se administra en el carrito.
        document.getElementById('payment-title').textContent = 'Tarjeta';
        document.getElementById('payment-description').textContent = 'Simulación académica: usá datos ficticios. No se cobra dinero.';
        document.getElementById('payment-description').hidden = false;
        document.getElementById('demo-card-privacy').textContent = 'Formato local: número de16 dígitos, MM/AA (mes01–12) y CVV de3 dígitos. No se envían ni guardan.';
        document.getElementById('demo-card-privacy').hidden = false;
}
function presentation_labels(button) {
        document.querySelector('.demo-card-preview small').textContent = 'TARJETA';
        document.querySelector('label[for="demo-card-holder"]').textContent = 'Nombre';
        document.querySelector('label[for="demo-card-number"]').textContent = 'Número';
        document.querySelector('label[for="demo-card-cvv"]').textContent = 'CVV';
        document.getElementById('demo-card-number').placeholder = '•••• •••• •••• ••••';
        document.getElementById('demo-card-number').removeAttribute('aria-describedby');
        document.getElementById('checkout-intro-copy').textContent = 'Revisá tus productos para continuar.';
        button.textContent = 'Continuar';
}
async function presentation_quote(button, status, initial_snapshot) {
        try {
            const response = await fetch('/api/cart/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: checkout_items_payload(), coupon_code: sessionStorage.getItem('dreams_coupon') || '' }) });
            const quote = await response.json();
            if (!response.ok || !quote.items?.length || quote.warnings?.length || quote.shipping !== 0 || quote.coupon_error || quote.total !== Math.round((quote.subtotal - (quote.discount || 0)) * 100) / 100 || !Number.isFinite(quote.subtotal) || quote.subtotal <= 0 || presentation_snapshot(get_cart()) !== initial_snapshot) throw new Error(quote.error || 'Revisá los productos del carrito antes de continuar.');
            presentation_expected_totals = presentation_totals(quote);
            render_checkout(quote.items, quote.subtotal, quote.discount || 0, quote.total);
            const shipping = document.createElement('div');
            shipping.id = 'checkout-shipping'; shipping.className = 'summary-line';
            const label = document.createElement('span'); label.textContent = quote.shipping_label;
            const amount = document.createElement('strong'); amount.textContent = format_price(quote.shipping);
            shipping.append(label, amount); document.getElementById('checkout-total').before(shipping);
            save_cart(quote.items, {reconcile:true});
            button.disabled = false; return true;
        } catch (error) { status.textContent = interface_error(error); return false; }
}
function presentation_intent(cart) {
                let saved;
                try { saved = JSON.parse(sessionStorage.getItem(PRESENTATION_KEY)); } catch { saved = null; }
                // guarda el intento antes de llamar a la red para conservar la referencia al reintentar.
                if (saved && saved.version !== 2) { sessionStorage.removeItem(PRESENTATION_KEY); saved = null; }
                if (saved && saved.snapshot !== presentation_snapshot(cart)) { sessionStorage.removeItem(PRESENTATION_KEY); saved = null; }
                if (!saved) {
                    saved = { version: 2, intent_id: crypto.randomUUID(), snapshot: presentation_snapshot(cart), ticket: null };
                    sessionStorage.setItem(PRESENTATION_KEY, JSON.stringify(saved));
                }
    return saved;
}
async function presentation_complete(saved) {
                if (!saved.ticket) {
                    const data = await presentation_request('session', { items: checkout_items_payload(), intent_id: saved.intent_id, coupon_code: sessionStorage.getItem('dreams_coupon') || '' });
                    if (presentation_totals(data) !== presentation_expected_totals) throw new Error('Los importes cambiaron. Volvé al carrito para revisarlos.');
                    saved.ticket = data.ticket;
                    sessionStorage.setItem(PRESENTATION_KEY, JSON.stringify(saved));
                }
                if (presentation_snapshot(get_cart()) !== saved.snapshot) throw new Error('El carrito cambió. Volvé a revisarlo antes de continuar.');
                const operation = await presentation_request('payment', { ticket: saved.ticket });
                sessionStorage.setItem(PRESENTATION_RECEIPT, operation.receipt);
                sessionStorage.removeItem(PRESENTATION_KEY);
}
async function presentation_submit(button, status, form, initial_snapshot) {
            if (button.disabled) return;
            // formato local unicamente; no se incorporan campos financieros a la peticion.
            if (!document.getElementById('demo-card-holder').value.trim()) { status.textContent = 'Completá tu nombre para continuar.'; return; }
            if (!academic_input_valid()) { status.textContent = 'Usá 16 dígitos de prueba, vencimiento MM/AA con mes01–12 y CVV de3 dígitos.'; return; }
            button.disabled = true; button.setAttribute('aria-busy', 'true'); button.textContent = 'Procesando…'; status.textContent = '';
            try {
                const cart = get_cart();
                if (!cart.length || presentation_snapshot(cart) !== initial_snapshot) throw new Error('El carrito cambió. Volvé a revisarlo antes de continuar.');
                const saved = presentation_intent(cart);
                await presentation_complete(saved);
                form.reset();
                window.location.assign('/checkout-resultado.html?presentation=1');
            } catch (error) {
                status.textContent = interface_error(error); button.disabled = false; button.removeAttribute('aria-busy'); button.textContent = 'Reintentar';
            }
}
const PresentationCheckout = {
    async setup() {
        const button = document.getElementById('checkout-submit'), status = document.getElementById('checkout-status'), form = document.getElementById('demo-card-form');
        presentation_layout(form); presentation_labels(button);
        try { if (typeof account_cart !== 'undefined') await account_cart?.ready(); } catch (error) { status.textContent = interface_error(error); return; }
        const initial_snapshot = presentation_snapshot(get_cart());
        if (!await presentation_quote(button, status, initial_snapshot)) return;
        form.addEventListener('submit', event => { event.preventDefault(); button.click(); });
        button.addEventListener('click', () => presentation_submit(button, status, form, initial_snapshot));
    },
    async result() {
        const container = document.getElementById('payment-result');
        try {
            if(typeof account_cart !== 'undefined') await account_cart?.ready();
            const data = await presentation_request('result', { receipt: sessionStorage.getItem(PRESENTATION_RECEIPT) });
            if (data.status !== 'completed' || data.simulated !== true || data.shipping !== 0 || data.total !== Math.round((data.subtotal - (data.discount || 0)) * 100) / 100 || !Number.isFinite(data.subtotal) || data.subtotal <= 0 || !Array.isArray(data.items) || !data.items.length) throw new Error('No pudimos verificar la confirmación.');
            container.className = 'payment-result presentation-result status-completed';
            const products = data.items.map(item => `<li>${escape_html(item.quantity)} × ${escape_html(item.brand)} ${escape_html(item.name)}<strong>${escape_html(format_price(item.price * item.quantity))}</strong></li>`).join('');
            container.innerHTML = `<span class="payment-result-icon" aria-hidden="true"><svg viewBox="0 0 48 48"><path d="m13 25 7 7 15-17"/></svg></span><p class="eyebrow">DREAMS</p><h1>Pedido confirmado</h1><div class="order-reference"><span>Pedido</span><strong>${escape_html(data.reference)}</strong></div><ul class="presentation-products">${products}</ul><div class="summary-line"><span>Descuento</span><strong>−${escape_html(format_price(data.discount || 0))}</strong></div><div class="summary-line"><span>${escape_html(data.shipping_label)}</span><strong>${escape_html(format_price(data.shipping))}</strong></div><div class="summary-line summary-total"><span>Total</span><strong>${escape_html(format_price(data.total))}</strong></div><div class="result-actions"><a class="button" href="/catalogo.html">Volver a la colección</a></div>`;
            if (sessionStorage.getItem('dreams_presentation_completed') !== data.reference) {
                if (presentation_snapshot(get_cart()) === presentation_snapshot(data.items)) { if (typeof account_cart !== 'undefined' && account_cart?.active()) { account_cart.consume(data.items); await account_cart.flush(); } else { localStorage.removeItem('dreams_cart'); update_cart_count(); } }
                sessionStorage.setItem('dreams_presentation_completed', data.reference);
            }
        } catch (error) { container.textContent = `${interface_error(error)} El carrito se conserva.`; }
    }
};
