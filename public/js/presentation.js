// This module is activated only by the server's presentation_demo configuration.
// Card fields remain in DOM memory: request bodies contain only a scenario/ticket.
const PresentationCheckout = (() => {
    const KEY = 'dreams_presentation_checkout';
    const RECEIPT = 'dreams_presentation_receipt';
    const CARDS = { '4242424242424242': 'approved', '4000000000000002': 'rejected', '4000000000001000': 'pending', '4000000000009995': 'error' };
    const snapshot = items => JSON.stringify(items.map(item => [Number(item.id), Number(item.quantity)]).sort((a, b) => a[0] - b[0]));
    async function request(path, body) {
        let response;
        try { response = await fetch(`/api/presentation/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); }
        catch { throw new Error('No pudimos conectar. Reintentá: la referencia se conserva.'); }
        const data = await response.json().catch(() => ({}));
        if (!response.ok) { if (path === 'payment' && response.status === 400) sessionStorage.removeItem(KEY); throw new Error(data.error || 'No pudimos completar la presentación.'); }
        return data;
    }
    function scenario() {
        const value = id => document.getElementById(id).value.trim();
        const number = value('demo-card-number').replace(/\D/g, '');
        const match = value('demo-card-expiry').match(/^(\d{2})\/(\d{2})$/);
        const now = new Date();
        const expiry = match && new Date(2000 + Number(match[2]), Number(match[1]), 1);
        if (!value('demo-card-holder') || !match || +match[1] < 1 || +match[1] > 12 || expiry <= now || !/^\d{3}$/.test(value('demo-card-cvv'))) return null;
        return CARDS[number] || null;
    }
    async function setup(config) {
        const button = document.getElementById('checkout-submit');
        const status = document.getElementById('checkout-status');
        document.getElementById('sandbox-banner').hidden = true;
        document.getElementById('sandbox-help').hidden = false;
        document.getElementById('demo-card-form').hidden = false;
        document.querySelector('.coupon-box').hidden = true;
        document.getElementById('payment-title').textContent = 'Tarjeta de prueba';
        document.getElementById('payment-description').textContent = 'Elegí un número ficticio del panel de prueba.';
        document.getElementById('checkout-intro-copy').textContent = 'Presentación académica · Resumen de productos y pago simulado.';
        document.querySelector('#checkout-total span').textContent = 'Subtotal de productos';
        const shipping = document.createElement('p');
        shipping.className = 'presentation-shipping';
        shipping.textContent = 'Envío a consultar, no incluido. La demostración finaliza sobre los productos; la entrega queda por acordar.';
        document.getElementById('checkout-total').after(shipping);
        button.textContent = 'Continuar';
        try {
            const response = await fetch('/api/cart/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: checkout_items_payload() }) });
            const quote = await response.json();
            if (!response.ok || !quote.items?.length) throw new Error(quote.error || 'No hay productos disponibles.');
            render_checkout(quote.items, quote.subtotal, 0, quote.subtotal);
            save_cart(quote.items);
            button.disabled = false;
            if (quote.warnings?.length) status.textContent = quote.warnings.join(' ');
        } catch (error) { status.textContent = interface_error(error); return; }
        document.querySelectorAll('.copy-test-data').forEach(copy => copy.addEventListener('click', () => {
            document.getElementById('demo-card-number').value = format_demo_card_number(copy.dataset.copy);
            document.getElementById('demo-card-expiry').value = '12/30';
            document.getElementById('demo-card-cvv').value = '123';
            document.getElementById('demo-card-preview-number').textContent = format_demo_card_number(copy.dataset.copy);
        }));
        document.getElementById('demo-card-number').addEventListener('input', event => {
            event.target.value = format_demo_card_number(event.target.value);
            document.getElementById('demo-card-preview-number').textContent = event.target.value || '•••• •••• •••• ••••';
        });
        document.getElementById('demo-card-expiry').addEventListener('input', event => { const digits = event.target.value.replace(/\D/g, '').slice(0, 4); event.target.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits; });
        document.getElementById('demo-card-cvv').addEventListener('input', event => { event.target.value = event.target.value.replace(/\D/g, '').slice(0, 3); });
        document.getElementById('demo-card-form').addEventListener('submit', event => { event.preventDefault(); button.click(); });
        button.addEventListener('click', async () => {
            if (button.disabled) return;
            const selected = scenario();
            if (!selected) { status.textContent = 'Usá una tarjeta ficticia indicada, nombre, vencimiento válido y CVV de tres dígitos.'; return; }
            button.disabled = true; button.setAttribute('aria-busy', 'true'); button.textContent = 'Procesando…'; status.textContent = 'Verificando la referencia…';
            try {
                let saved;
                try { saved = JSON.parse(sessionStorage.getItem(KEY)); } catch { saved = null; }
                const cart = get_cart();
                if (saved && (saved.scenario !== selected || saved.snapshot !== snapshot(cart))) throw new Error('Hay una referencia pendiente. Reintentá con los mismos productos y resultado o volvé al carrito.');
                if (!saved) {
                    const data = await request('session', { items: checkout_items_payload(), scenario: selected, intent_id: crypto.randomUUID() });
                    saved = { ticket: data.ticket, scenario: selected, snapshot: snapshot(cart) };
                    sessionStorage.setItem(KEY, JSON.stringify(saved));
                }
                const payment = await request('payment', { ticket: saved.ticket });
                sessionStorage.setItem(RECEIPT, payment.receipt);
                sessionStorage.removeItem(KEY);
                document.getElementById('demo-card-form').reset();
                window.location.assign('/checkout-resultado.html?presentation=1');
            } catch (error) { status.textContent = interface_error(error); button.disabled = false; button.removeAttribute('aria-busy'); button.textContent = 'Reintentar';
                if (!document.getElementById('presentation-reset')) {
                    const reset = document.createElement('button'); reset.id = 'presentation-reset'; reset.type = 'button'; reset.className = 'text-button'; reset.textContent = 'Comenzar otra prueba';
                    reset.addEventListener('click', () => { sessionStorage.removeItem(KEY); reset.remove(); status.textContent = 'Podés elegir otro resultado.'; });
                    button.after(reset);
                }
            }
        });
    }
    async function result() {
        const container = document.getElementById('payment-result');
        try {
            const data = await request('result', { receipt: sessionStorage.getItem(RECEIPT) });
            const copy = { approved: ['Pago de prueba aprobado', 'La demostración finalizó correctamente.'], rejected: ['Pago de prueba rechazado', 'Podés elegir otra tarjeta de prueba y reintentar.'], pending: ['Pago de prueba pendiente', 'El carrito se conserva. Podés repetir la demostración.'], error: ['No pudimos completar el pago de prueba', 'El carrito se conserva para reintentar.'] }[data.status];
            if (!copy || data.simulated !== true) throw new Error('Resultado inválido.');
            container.className = `payment-result presentation-result status-${data.status}`;
            container.innerHTML = `<p class="eyebrow">DREAMS · PRESENTACIÓN ACADÉMICA</p><h1>${escape_html(copy[0])}</h1><p>${escape_html(copy[1])}</p><div class="order-reference"><span>Referencia de prueba</span><strong>${escape_html(data.reference)}</strong></div><p>Productos: ${escape_html(format_price(data.subtotal))}. Envío a consultar, no incluido.</p><div class="result-actions">${data.status === 'approved' ? '' : '<a class="button button-primary" href="/checkout.html">Reintentar</a>'}<a class="button" href="/catalogo.html">Volver a la colección</a></div>`;
            if (data.status === 'approved' && sessionStorage.getItem('dreams_presentation_completed') !== data.reference) {
                if (snapshot(get_cart()) === snapshot(data.items)) { localStorage.removeItem('dreams_cart'); update_cart_count(); }
                sessionStorage.setItem('dreams_presentation_completed', data.reference);
            }
        } catch (error) { container.textContent = `${interface_error(error)} El carrito se conserva.`; }
    }
    return { setup, result };
})();
