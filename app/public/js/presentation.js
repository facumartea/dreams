// completa la compra academica con tickets firmados; los datos de tarjeta no salen del formulario.
// simulacion con tickets firmados; nunca se leen, envian ni guardan los datos de tarjeta.
const PRESENTATION_KEY = 'dreams_presentation_checkout';
let presentation_expected_totals = null;
const resumir_importes_para_comparar = value => JSON.stringify([value.subtotal, value.discount || 0, value.total, value.coupon?.code || '']);
const PRESENTATION_RECEIPT = 'dreams_presentation_receipt';
const crear_copia_de_la_compra = items => JSON.stringify([sessionStorage.getItem('dreams_coupon') || '', items.map(item => [Number(item.id), Number(item.quantity)]).sort((a, b) => a[0] - b[0])]);
async function enviar_solicitud_academica(path, body) {
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
function crear_formulario_academico(form) {
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
function preparar_textos_de_compra_academica(button) {
        document.querySelector('.demo-card-preview small').textContent = 'TARJETA';
        document.querySelector('label[for="demo-card-holder"]').textContent = 'Nombre';
        document.querySelector('label[for="demo-card-number"]').textContent = 'Número';
        document.querySelector('label[for="demo-card-cvv"]').textContent = 'CVV';
        document.getElementById('demo-card-number').placeholder = '•••• •••• •••• ••••';
        document.getElementById('demo-card-number').removeAttribute('aria-describedby');
        document.getElementById('checkout-intro-copy').textContent = 'Revisá tus productos para continuar.';
        button.textContent = 'Continuar';
}
async function cotizar_compra_academica(button, status, initial_snapshot) {
        try {
            const response = await fetch('/api/cart/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: preparar_productos_para_la_compra(), coupon_code: sessionStorage.getItem('dreams_coupon') || '' }) });
            const quote = await response.json();
            if (!response.ok || !quote.items?.length || quote.warnings?.length || quote.shipping !== 0 || quote.coupon_error || quote.total !== Math.round((quote.subtotal - (quote.discount || 0)) * 100) / 100 || !Number.isFinite(quote.subtotal) || quote.subtotal <= 0 || crear_copia_de_la_compra(leer_carrito()) !== initial_snapshot) throw new Error(quote.error || 'Revisá los productos del carrito antes de continuar.');
            presentation_expected_totals = resumir_importes_para_comparar(quote);
            mostrar_compra(quote.items, quote.subtotal, quote.discount || 0, quote.total);
            const shipping = document.createElement('div');
            shipping.id = 'checkout-shipping'; shipping.className = 'summary-line';
            const label = document.createElement('span'); label.textContent = quote.shipping_label;
            const amount = document.createElement('strong'); amount.textContent = formatear_precio(quote.shipping);
            shipping.append(label, amount); document.getElementById('checkout-total').before(shipping);
            guardar_carrito(quote.items, {reconcile:true});
            button.disabled = false; return true;
        } catch (error) { status.textContent = explicar_error_de_conexion(error); return false; }
}
function obtener_intento_de_compra(cart) {
                let saved;
                try { saved = JSON.parse(sessionStorage.getItem(PRESENTATION_KEY)); } catch { saved = null; }
                // guarda el identificador del intento antes de llamar a la red para reintentar el mismo.
                if (saved && saved.version !== 2) { sessionStorage.removeItem(PRESENTATION_KEY); saved = null; }
                if (saved && saved.snapshot !== crear_copia_de_la_compra(cart)) { sessionStorage.removeItem(PRESENTATION_KEY); saved = null; }
                if (!saved) {
                    saved = { version: 2, intent_id: crypto.randomUUID(), snapshot: crear_copia_de_la_compra(cart), ticket: null };
                    sessionStorage.setItem(PRESENTATION_KEY, JSON.stringify(saved));
                }
    return saved;
}
async function completar_compra_academica(saved) {
                if (!saved.ticket) {
                    const data = await enviar_solicitud_academica('session', { items: preparar_productos_para_la_compra(), intent_id: saved.intent_id, coupon_code: sessionStorage.getItem('dreams_coupon') || '' });
                    if (resumir_importes_para_comparar(data) !== presentation_expected_totals) throw new Error('Los importes cambiaron. Volvé al carrito para revisarlos.');
                    saved.ticket = data.ticket;
                    sessionStorage.setItem(PRESENTATION_KEY, JSON.stringify(saved));
                }
                if (crear_copia_de_la_compra(leer_carrito()) !== saved.snapshot) throw new Error('El carrito cambió. Volvé a revisarlo antes de continuar.');
                const operation = await enviar_solicitud_academica('payment', { ticket: saved.ticket });
                sessionStorage.setItem(PRESENTATION_RECEIPT, operation.receipt);
                sessionStorage.removeItem(PRESENTATION_KEY);
}
// usa el mismo identificador al reintentar; los campos de tarjeta no forman parte de la peticion.
async function enviar_compra_academica(button, status, form, initial_snapshot) {
            if (button.disabled) return;
            // formato local unicamente; no se incorporan campos financieros a la peticion.
            if (!document.getElementById('demo-card-holder').value.trim()) { status.textContent = 'Completá tu nombre para continuar.'; return; }
            if (!son_validos_los_campos_academicos()) { status.textContent = 'Usá 16 dígitos de prueba, vencimiento MM/AA con mes01–12 y CVV de3 dígitos.'; return; }
            button.disabled = true; button.setAttribute('aria-busy', 'true'); button.textContent = 'Procesando…'; status.textContent = '';
            try {
                const cart = leer_carrito();
                if (!cart.length || crear_copia_de_la_compra(cart) !== initial_snapshot) throw new Error('El carrito cambió. Volvé a revisarlo antes de continuar.');
                const saved = obtener_intento_de_compra(cart);
                await completar_compra_academica(saved);
                form.reset();
                window.location.assign('/checkout-resultado.html?presentation=1');
            } catch (error) {
                status.textContent = explicar_error_de_conexion(error); button.disabled = false; button.removeAttribute('aria-busy'); button.textContent = 'Reintentar';
            }
}
const PresentationCheckout = {
    async setup() {
        const button = document.getElementById('checkout-submit'), status = document.getElementById('checkout-status'), form = document.getElementById('demo-card-form');
        crear_formulario_academico(form); preparar_textos_de_compra_academica(button);
        try { if (typeof account_cart !== 'undefined') await account_cart?.ready(); } catch (error) { status.textContent = explicar_error_de_conexion(error); return; }
        const initial_snapshot = crear_copia_de_la_compra(leer_carrito());
        if (!await cotizar_compra_academica(button, status, initial_snapshot)) return;
        form.addEventListener('submit', event => { event.preventDefault(); button.click(); });
        button.addEventListener('click', () => enviar_compra_academica(button, status, form, initial_snapshot));
    },
    async result() {
        const container = document.getElementById('payment-result');
        try {
            if(typeof account_cart !== 'undefined') await account_cart?.ready();
            const data = await enviar_solicitud_academica('result', { receipt: sessionStorage.getItem(PRESENTATION_RECEIPT) });
            if (data.status !== 'completed' || data.simulated !== true || data.shipping !== 0 || data.total !== Math.round((data.subtotal - (data.discount || 0)) * 100) / 100 || !Number.isFinite(data.subtotal) || data.subtotal <= 0 || !Array.isArray(data.items) || !data.items.length) throw new Error('No pudimos verificar la confirmación.');
            container.className = 'payment-result presentation-result status-completed';
            const products = data.items.map(item => `<li>${escapar_texto_html(item.quantity)} × ${escapar_texto_html(item.brand)} ${escapar_texto_html(item.name)}<strong>${escapar_texto_html(formatear_precio(item.price * item.quantity))}</strong></li>`).join('');
            container.innerHTML = `<span class="payment-result-icon" aria-hidden="true"><svg viewBox="0 0 48 48"><path d="m13 25 7 7 15-17"/></svg></span><p class="eyebrow">DREAMS</p><h1>Pedido confirmado</h1><div class="order-reference"><span>Pedido</span><strong>${escapar_texto_html(data.reference)}</strong></div><ul class="presentation-products">${products}</ul><div class="summary-line"><span>Descuento</span><strong>−${escapar_texto_html(formatear_precio(data.discount || 0))}</strong></div><div class="summary-line"><span>${escapar_texto_html(data.shipping_label)}</span><strong>${escapar_texto_html(formatear_precio(data.shipping))}</strong></div><div class="summary-line summary-total"><span>Total</span><strong>${escapar_texto_html(formatear_precio(data.total))}</strong></div><div class="result-actions"><a class="button" href="/catalogo.html">Volver a la colección</a></div>`;
            if (sessionStorage.getItem('dreams_presentation_completed') !== data.reference) {
                if (crear_copia_de_la_compra(leer_carrito()) === crear_copia_de_la_compra(data.items)) { if (typeof account_cart !== 'undefined' && account_cart?.active()) { account_cart.consume(data.items); await account_cart.flush(); } else { localStorage.removeItem('dreams_cart'); actualizar_contador_del_carrito(); } }
                sessionStorage.setItem('dreams_presentation_completed', data.reference);
            }
        } catch (error) { container.textContent = `${explicar_error_de_conexion(error)} El carrito se conserva.`; }
    }
};
