let checkout_quote = null;
let applied_coupon = null;
let checkout_config = null;

const DEMO_CARD_SCENARIOS = {
    '4242424242424242': 'approved',
    '4000000000000002': 'rejected',
    '4000000000001000': 'pending',
    '4000000000009995': 'error'
};

function digits(value) { return String(value || '').replace(/\D/g, ''); }

function format_demo_card_number(value) {
    return digits(value).slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

function demo_card_scenario() {
    const number = digits(document.getElementById('demo-card-number').value);
    const holder = String(document.getElementById('demo-card-holder').value || '').trim();
    const expiry = String(document.getElementById('demo-card-expiry').value || '').trim();
    const cvv = digits(document.getElementById('demo-card-cvv').value);
    if (!holder || !/^\d{2}\/\d{2}$/.test(expiry) || cvv.length !== 3 || !DEMO_CARD_SCENARIOS[number]) return null;
    return DEMO_CARD_SCENARIOS[number];
}

function configure_payment_ui(config) {
    const is_demo = config.provider === 'demo';
    document.getElementById('demo-card-form').hidden = !is_demo;
    document.getElementById('payment-title').textContent = is_demo ? 'Tarjeta demo' : 'Mercado Pago';
    document.getElementById('payment-description').textContent = is_demo
        ? 'Usá únicamente los datos ficticios indicados. No ingreses una tarjeta real.'
        : 'Al continuar vas a elegir el medio de pago dentro del checkout protegido de Mercado Pago.';
    document.getElementById('checkout-intro-copy').textContent = is_demo
        ? 'Revisá el pedido y probá el flujo completo sin realizar ningún cobro.'
        : 'Revisá el pedido. El pago se completa en el entorno oficial de Mercado Pago.';
    document.getElementById('sandbox-banner').textContent = is_demo
        ? 'MODO DEMO — No se realizarán cobros reales.'
        : 'MODO SANDBOX — No se realizarán cobros reales.';
    document.getElementById('checkout-submit').textContent = is_demo ? 'Pagar demo' : 'Continuar a Mercado Pago';
}

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
        checkout_config = config;
        const user = await user_response.json();
        const quote = await quote_response.json();
        if (!config_response.ok || !config.enabled) throw new Error('El checkout todavía no está configurado. Podés continuar por WhatsApp.');
        configure_payment_ui(config);
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
        document.getElementById('sandbox-banner').hidden = !['sandbox', 'demo'].includes(config.mode);
        document.getElementById('sandbox-help').hidden = !config.show_test_data;
        button.disabled = false;
        if (quote.warnings.length) status.textContent = quote.warnings.join(' ');
    } catch (error) {
        status.textContent = error.message;
        button.disabled = true;
    }

    button.addEventListener('click', async () => {
        if (!checkout_quote || button.disabled) return;
        const is_demo = checkout_config?.provider === 'demo';
        const scenario = is_demo ? demo_card_scenario() : null;
        if (is_demo && !scenario) {
            status.textContent = 'Completá los datos ficticios y usá uno de los números de prueba.';
            document.getElementById('demo-card-number').focus();
            return;
        }
        button.disabled = true;
        button.textContent = is_demo ? 'Procesando demo…' : 'Creando checkout seguro…';
        status.textContent = '';
        try {
            const response = await fetch('/api/checkout/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: checkout_items_payload(), coupon_code: applied_coupon?.code || '' }) });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'No se pudo iniciar el pago.');
            if (is_demo && data.requires_demo_payment === true) {
                const payment_response = await fetch('/api/checkout/demo-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ order_id: data.order_id, scenario })
                });
                const payment = await payment_response.json();
                if (!payment_response.ok) throw new Error(payment.error || 'No se pudo procesar la demostración.');
                window.location.assign(`/checkout-resultado.html?order_id=${encodeURIComponent(payment.order_id)}`);
                return;
            }
            if (!/^https:\/\//.test(data.checkout_url || '')) throw new Error('No se pudo iniciar el pago.');
            window.location.assign(data.checkout_url);
        } catch (error) {
            status.textContent = error.message;
            button.disabled = false;
            button.textContent = is_demo ? 'Pagar demo' : 'Continuar a Mercado Pago';
        }
    });

    document.querySelectorAll('.copy-test-data').forEach(copy => copy.addEventListener('click', async () => {
        const card_input = document.getElementById('demo-card-number');
        if (checkout_config?.provider === 'demo') {
            card_input.value = format_demo_card_number(copy.dataset.copy);
            document.getElementById('demo-card-expiry').value = '12/30';
            document.getElementById('demo-card-cvv').value = '123';
            document.getElementById('demo-card-preview-number').textContent = card_input.value;
            card_input.dispatchEvent(new Event('input'));
        } else if (navigator.clipboard) await navigator.clipboard.writeText(copy.dataset.copy);
        copy.textContent = checkout_config?.provider === 'demo' ? 'Elegida' : 'Copiado';
        setTimeout(() => { copy.textContent = checkout_config?.provider === 'demo' ? 'Usar' : 'Copiar'; }, 1200);
    }));
    const card_number = document.getElementById('demo-card-number');
    card_number.addEventListener('input', () => {
        card_number.value = format_demo_card_number(card_number.value);
        document.getElementById('demo-card-preview-number').textContent = card_number.value || '•••• •••• •••• ••••';
    });
    const expiry = document.getElementById('demo-card-expiry');
    expiry.addEventListener('input', () => {
        const value = digits(expiry.value).slice(0, 4);
        expiry.value = value.length > 2 ? `${value.slice(0, 2)}/${value.slice(2)}` : value;
    });
    const cvv = document.getElementById('demo-card-cvv');
    cvv.addEventListener('input', () => { cvv.value = digits(cvv.value).slice(0, 3); });
    document.getElementById('demo-card-form').addEventListener('submit', event => {
        event.preventDefault();
        if (!button.disabled) button.click();
    });
    const coupon_input = document.getElementById('coupon-code');
    coupon_input.addEventListener('input', () => { coupon_input.value = coupon_input.value.toUpperCase(); });
    coupon_input.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); apply_coupon(); } });
    document.getElementById('coupon-apply').addEventListener('click', apply_coupon);
    document.getElementById('coupon-remove').addEventListener('click', remove_coupon);
}

document.addEventListener('DOMContentLoaded', setup_checkout);
