let checkout_quote = null;
let applied_coupon = null;

function checkout_items_payload() {
    return get_cart().map(item => ({ id: item.id, quantity: item.quantity }));
}

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

function coupon_code() { return String(document.getElementById('coupon-code').value || '').trim().toUpperCase(); }

async function apply_coupon() {
    const input = document.getElementById('coupon-code');
    const button = document.getElementById('coupon-apply');
    const status = document.getElementById('coupon-status');
    const code = coupon_code();
    input.value = code;
    if (!code) { status.textContent = 'Ingresá un código.'; return; }
    button.disabled = true;
    button.textContent = 'Aplicando…';
    status.textContent = 'Verificando cupón…';
    try {
        const response = await fetch('/api/coupons/validate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, items: checkout_items_payload() }) });
        const data = await response.json();
        if (!response.ok || !data.coupon) throw new Error('Cupón inválido.');
        applied_coupon = data.coupon;
        sessionStorage.setItem('dreams_coupon', data.coupon.code);
        checkout_quote = { ...checkout_quote, ...data };
        render_checkout(checkout_quote.items, data.subtotal, data.discount, data.total);
        status.textContent = `${data.coupon.code} aplicado: ${data.coupon.discount_percent}% de descuento.`;
        status.classList.add('is-valid');
        document.getElementById('coupon-remove').hidden = false;
    } catch (error) {
        applied_coupon = null;
        sessionStorage.removeItem('dreams_coupon');
        status.classList.remove('is-valid');
        status.textContent = 'Cupón inválido.';
        document.getElementById('coupon-remove').hidden = true;
        if (checkout_quote) render_checkout(checkout_quote.items, checkout_quote.subtotal, 0, checkout_quote.subtotal);
    } finally {
        button.disabled = false;
        button.textContent = 'Aplicar';
    }
}

function remove_coupon() {
    applied_coupon = null;
    sessionStorage.removeItem('dreams_coupon');
    document.getElementById('coupon-code').value = '';
    document.getElementById('coupon-status').textContent = 'Cupón quitado.';
    document.getElementById('coupon-status').classList.remove('is-valid');
    document.getElementById('coupon-remove').hidden = true;
    if (checkout_quote) {
        checkout_quote = { ...checkout_quote, discount: 0, total: checkout_quote.subtotal, coupon: null };
        render_checkout(checkout_quote.items, checkout_quote.subtotal, 0, checkout_quote.subtotal);
    }
}

async function setup_checkout() {
    const button = document.getElementById('checkout-submit');
    const status = document.getElementById('checkout-status');
    try {
        const [config_response, user_response, quote_response] = await Promise.all([
            fetch('/api/checkout/config'),
            fetch('/api/auth/me'),
            fetch('/api/cart/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: checkout_items_payload(), coupon_code: sessionStorage.getItem('dreams_coupon') || '' }) })
        ]);
        const config = await config_response.json();
        const user = await user_response.json();
        const quote = await quote_response.json();
        if (!config_response.ok || !config.enabled) throw new Error('El checkout Sandbox todavía no está configurado. Podés continuar por WhatsApp.');
        if (!user_response.ok || !user.user) {
            status.innerHTML = 'Para pagar necesitás <a href="/cuenta.html">iniciar sesión o crear una cuenta</a>.';
            return;
        }
        if (!quote_response.ok || !quote.items?.length) throw new Error(quote.error || 'El carrito no tiene productos disponibles.');
        checkout_quote = quote;
        save_cart(quote.items);
        applied_coupon = quote.coupon || null;
        render_checkout(quote.items, quote.subtotal, quote.discount, quote.total);
        if (applied_coupon) {
            document.getElementById('coupon-code').value = applied_coupon.code;
            document.getElementById('coupon-status').textContent = `${applied_coupon.code} aplicado: ${applied_coupon.discount_percent}% de descuento.`;
            document.getElementById('coupon-status').classList.add('is-valid');
            document.getElementById('coupon-remove').hidden = false;
        } else if (quote.coupon_error) sessionStorage.removeItem('dreams_coupon');
        document.getElementById('sandbox-banner').hidden = config.mode !== 'sandbox';
        document.getElementById('sandbox-help').hidden = !config.show_test_data;
        button.disabled = false;
        if (quote.warnings.length) status.textContent = quote.warnings.join(' ');
    } catch (error) {
        status.textContent = error.message;
        button.disabled = true;
    }

    button.addEventListener('click', async () => {
        if (!checkout_quote || button.disabled) return;
        button.disabled = true;
        button.textContent = 'Creando checkout seguro…';
        status.textContent = '';
        try {
            const response = await fetch('/api/checkout/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: checkout_items_payload(), coupon_code: applied_coupon?.code || '' }) });
            const data = await response.json();
            if (!response.ok || !/^https:\/\//.test(data.checkout_url || '')) throw new Error(data.error || 'No se pudo iniciar el pago.');
            window.location.assign(data.checkout_url);
        } catch (error) {
            status.textContent = error.message;
            button.disabled = false;
            button.textContent = 'Continuar a Mercado Pago';
        }
    });

    document.querySelectorAll('.copy-test-data').forEach(copy => copy.addEventListener('click', async () => {
        await navigator.clipboard.writeText(copy.dataset.copy);
        copy.textContent = 'Copiado';
        setTimeout(() => { copy.textContent = 'Copiar'; }, 1200);
    }));
    const coupon_input = document.getElementById('coupon-code');
    coupon_input.addEventListener('input', () => { coupon_input.value = coupon_input.value.toUpperCase(); });
    coupon_input.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); apply_coupon(); } });
    document.getElementById('coupon-apply').addEventListener('click', apply_coupon);
    document.getElementById('coupon-remove').addEventListener('click', remove_coupon);
}

document.addEventListener('DOMContentLoaded', setup_checkout);
