// prepara el resumen y el formulario; mantiene separadas la simulacion y las rutas comerciales.
let checkout_quote = null;
let applied_coupon = null;
let checkout_config = null;
const DEMO_ORDER_STORAGE_KEY = 'dreams_demo_order_id';

const DEMO_CARD_SCENARIOS = {
    '4242424242424242': 'approved',
    '4000000000000002': 'rejected',
    '4000000000001000': 'pending',
    '4000000000009995': 'error'
};

function extraer_digitos(value) { return String(value || '').replace(/\D/g, ''); }

function formatear_numero_de_tarjeta_ficticia(value) {
    return extraer_digitos(value).slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

function obtener_escenario_de_tarjeta_ficticia() {
    const number = extraer_digitos(document.getElementById('demo-card-number').value);
    const holder = String(document.getElementById('demo-card-holder').value || '').trim();
    const expiry = String(document.getElementById('demo-card-expiry').value || '').trim();
    const cvv = extraer_digitos(document.getElementById('demo-card-cvv').value);
    if (!holder || !/^\d{2}\/\d{2}$/.test(expiry) || cvv.length !== 3 || !DEMO_CARD_SCENARIOS[number]) return null;
    return DEMO_CARD_SCENARIOS[number];
}

function preparar_formulario_de_compra(config) {
    const is_demo = config.provider === 'demo';
    document.getElementById('demo-card-form').hidden = !is_demo;
    document.getElementById('payment-title').textContent = is_demo ? 'Tarjeta de prueba' : 'Mercado Pago';
    document.getElementById('payment-description').textContent = is_demo
        ? 'Usá únicamente los datos ficticios indicados. No ingreses una tarjeta real.'
        : 'Al continuar vas a elegir el medio de pago dentro del pago protegido de Mercado Pago.';
    document.getElementById('checkout-intro-copy').textContent = is_demo
        ? 'Revisá el pedido y probá el flujo completo sin realizar ningún cobro.'
        : 'Revisá el pedido. El pago se completa en el entorno oficial de Mercado Pago.';
    document.getElementById('sandbox-banner').textContent = is_demo
        ? 'MODO DE PRUEBA — No se realizarán cobros reales.'
        : 'ENTORNO DE PRUEBA — No se realizarán cobros reales.';
    document.getElementById('checkout-submit').textContent = is_demo ? 'Pagar de prueba' : 'Continuar a Mercado Pago';
}

function preparar_productos_para_la_compra() {
    return leer_carrito().map(item => ({ id: item.id, quantity: item.quantity }));
}

async function procesar_pedido_ficticio(order_id, scenario) {
    const payment_response = await fetch('/api/checkout/demo-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id, scenario })
    });
    const payment = await payment_response.json();
    if (payment_response.status === 409) {
        window.location.assign(`/checkout-resultado.html?order_id=${encodeURIComponent(order_id)}`);
        return true;
    }
    if (!payment_response.ok) {
        if ([400, 404].includes(payment_response.status)) sessionStorage.removeItem(DEMO_ORDER_STORAGE_KEY);
        throw new Error(payment.error || 'No se pudo procesar la demostración.');
    }
    sessionStorage.removeItem(DEMO_ORDER_STORAGE_KEY);
    window.location.assign(`/checkout-resultado.html?order_id=${encodeURIComponent(payment.order_id)}`);
    return true;
}

function mostrar_compra(items, subtotal, discount, total) {
    const container = document.getElementById('checkout-items');
    container.innerHTML = '';
    items.forEach(item => {
        const row = document.createElement('article');
        row.className = 'checkout-item';
        row.innerHTML = `<img src="${escapar_texto_html(elegir_url_de_imagen_segura(item.image_url))}" alt=""><div><span>${escapar_texto_html(item.brand)}</span><h3>${escapar_texto_html(item.name)}</h3><p>${item.quantity} × ${formatear_precio(item.price)}</p></div><strong>${formatear_precio(item.price * item.quantity)}</strong>`;
        preparar_imagen_alternativa(row.querySelector('img'));
        container.appendChild(row);
    });
    document.querySelector('#checkout-subtotal strong').textContent = formatear_precio(subtotal);
    const discount_row = document.getElementById('checkout-discount');
    discount_row.hidden = !(discount > 0);
    discount_row.querySelector('strong').textContent = `−${formatear_precio(discount)}`;
    document.querySelector('#checkout-total strong').textContent = formatear_precio(total);
}

function leer_codigo_de_cupon() { return String(document.getElementById('coupon-code').value || '').trim().toUpperCase(); }

async function aplicar_cupon() {
    const input = document.getElementById('coupon-code');
    const button = document.getElementById('coupon-apply');
    const status = document.getElementById('coupon-status');
    const code = leer_codigo_de_cupon();
    input.value = code;
    if (!code) { status.textContent = 'Ingresá un código.'; return; }
    button.disabled = true;
    button.textContent = 'Aplicando…';
    status.textContent = 'Verificando cupón…';
    try {
        const response = await fetch('/api/coupons/validate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, items: preparar_productos_para_la_compra() }) });
        const data = await response.json();
        if (!response.ok || !data.coupon) throw new Error('Cupón inválido.');
        applied_coupon = data.coupon;
        sessionStorage.setItem('dreams_coupon', data.coupon.code);
        checkout_quote = { ...checkout_quote, ...data };
        mostrar_compra(checkout_quote.items, data.subtotal, data.discount, data.total);
        status.textContent = `${data.coupon.code} aplicado: ${data.coupon.discount_percent}% de descuento.`;
        status.classList.add('is-valid');
        document.getElementById('coupon-remove').hidden = false;
    } catch (error) {
        applied_coupon = null;
        sessionStorage.removeItem('dreams_coupon');
        status.classList.remove('is-valid');
        status.textContent = 'Cupón inválido.';
        document.getElementById('coupon-remove').hidden = true;
        if (checkout_quote) mostrar_compra(checkout_quote.items, checkout_quote.subtotal, 0, checkout_quote.subtotal);
    } finally {
        button.disabled = false;
        button.textContent = 'Aplicar';
    }
}

function quitar_cupon() {
    applied_coupon = null;
    sessionStorage.removeItem('dreams_coupon');
    document.getElementById('coupon-code').value = '';
    document.getElementById('coupon-status').textContent = 'Cupón quitado.';
    document.getElementById('coupon-status').classList.remove('is-valid');
    document.getElementById('coupon-remove').hidden = true;
    if (checkout_quote) {
        checkout_quote = { ...checkout_quote, discount: 0, total: checkout_quote.subtotal, coupon: null };
        mostrar_compra(checkout_quote.items, checkout_quote.subtotal, 0, checkout_quote.subtotal);
    }
}

function mostrar_cupon_guardado(quote) {
    if (applied_coupon) {
        document.getElementById('coupon-code').value = applied_coupon.code;
        document.getElementById('coupon-status').textContent = `${applied_coupon.code} aplicado: ${applied_coupon.discount_percent}% de descuento.`;
        document.getElementById('coupon-status').classList.add('is-valid');
        document.getElementById('coupon-remove').hidden = false;
    } else if (quote.coupon_error) sessionStorage.removeItem('dreams_coupon');
}

async function cargar_compra(button, status) {
    try {
        const [config_response, user_response, quote_response] = await Promise.all([
            fetch('/api/checkout/config'),
            fetch('/api/auth/me'),
            fetch('/api/cart/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: preparar_productos_para_la_compra(), coupon_code: sessionStorage.getItem('dreams_coupon') || '' }) })
        ]);
        const config = await config_response.json();
        checkout_config = config;
        const user = await user_response.json();
        const quote = await quote_response.json();
        if (!config_response.ok || !config.enabled) throw new Error('El pago online todavía no está disponible. Podés continuar por WhatsApp.');
        preparar_formulario_de_compra(config);
        if (!user_response.ok || !user.user) {
            status.innerHTML = 'Para pagar necesitás <a href="/cuenta.html">iniciar sesión o crear una cuenta</a>.';
            return;
        }
        if (!quote_response.ok || !quote.items?.length) throw new Error(quote.error || 'El carrito no tiene productos disponibles.');
        checkout_quote = quote;
        guardar_carrito(quote.items);
        applied_coupon = quote.coupon || null;
        mostrar_compra(quote.items, quote.subtotal, quote.discount, quote.total);
        mostrar_cupon_guardado(quote);
        document.getElementById('sandbox-banner').hidden = !['sandbox', 'demo'].includes(config.mode);
        document.getElementById('sandbox-help').hidden = !config.show_test_data;
        button.disabled = false;
        if (quote.warnings.length) status.textContent = quote.warnings.join(' ');
    } catch (error) {
        status.textContent = explicar_error_de_conexion(error);
        button.disabled = true;
    }
}

function preparar_respuesta_del_pago(button, status) {
    return async () => {
        if (!checkout_quote || button.disabled) return;
        const is_demo = checkout_config?.provider === 'demo';
        const scenario = is_demo ? obtener_escenario_de_tarjeta_ficticia() : null;
        if (is_demo && !scenario) {
            status.textContent = 'Completá los datos ficticios y usá uno de los números de prueba.';
            document.getElementById('demo-card-number').focus();
            return;
        }
        button.disabled = true;
        button.textContent = is_demo ? 'Procesando prueba…' : 'Preparando pago seguro…';
        status.textContent = is_demo ? 'Registrando tu pedido de demostración…' : '';
        try {
            const pending_demo_order = is_demo ? sessionStorage.getItem(DEMO_ORDER_STORAGE_KEY) : null;
            if (pending_demo_order) {
                status.textContent = 'Retomando el pedido sin duplicarlo…';
                await procesar_pedido_ficticio(pending_demo_order, scenario);
                return;
            }
            const response = await fetch('/api/checkout/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: preparar_productos_para_la_compra(), coupon_code: applied_coupon?.code || '' }) });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'No se pudo iniciar el pago.');
            if (is_demo && data.requires_demo_payment === true) {
                sessionStorage.setItem(DEMO_ORDER_STORAGE_KEY, data.order_id);
                status.textContent = 'Procesando el resultado de prueba…';
                await procesar_pedido_ficticio(data.order_id, scenario);
                return;
            }
            if (!/^https:\/\//.test(data.checkout_url || '')) throw new Error('No se pudo iniciar el pago.');
            window.location.assign(data.checkout_url);
        } catch (error) {
            status.textContent = explicar_error_de_conexion(error);
            button.disabled = false;
            button.textContent = is_demo ? 'Pagar de prueba' : 'Continuar a Mercado Pago';
        }
    };
}

function preparar_campos_de_compra(button) {
    document.querySelectorAll('.copy-test-data').forEach(copy => copy.addEventListener('click', async () => {
        const card_input = document.getElementById('demo-card-number');
        if (checkout_config?.provider === 'demo') {
            card_input.value = formatear_numero_de_tarjeta_ficticia(copy.dataset.copy);
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
        card_number.value = formatear_numero_de_tarjeta_ficticia(card_number.value);
        document.getElementById('demo-card-preview-number').textContent = card_number.value || '•••• •••• •••• ••••';
    });
    const expiry = document.getElementById('demo-card-expiry');
    expiry.addEventListener('input', () => {
        const value = extraer_digitos(expiry.value).slice(0, 4);
        expiry.value = value.length > 2 ? `${value.slice(0, 2)}/${value.slice(2)}` : value;
    });
    const cvv = document.getElementById('demo-card-cvv');
    cvv.addEventListener('input', () => { cvv.value = extraer_digitos(cvv.value).slice(0, 3); });
    document.getElementById('demo-card-form').addEventListener('submit', event => {
        event.preventDefault();
        if (!button.disabled) button.click();
    });
    const coupon_input = document.getElementById('coupon-code');
    coupon_input.addEventListener('input', () => { coupon_input.value = coupon_input.value.toUpperCase(); });
    coupon_input.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); aplicar_cupon(); } });
    document.getElementById('coupon-apply').addEventListener('click', aplicar_cupon);
    document.getElementById('coupon-remove').addEventListener('click', quitar_cupon);
}

async function preparar_compra() {
    const button = document.getElementById('checkout-submit');
    const status = document.getElementById('checkout-status');
    try {
        const config_response = await fetch('/api/checkout/config');
        if (config_response?.ok) {
            const config = await config_response.json();
            if (config.enabled && config.provider === 'presentation_demo') return PresentationCheckout.setup(config);
        }
    } catch (error) {
        status.textContent = explicar_error_de_conexion(error);
        button.disabled = true;
        return;
    }
    await cargar_compra(button, status);
    button.addEventListener('click', preparar_respuesta_del_pago(button, status));
    preparar_campos_de_compra(button);
}

document.addEventListener('DOMContentLoaded', preparar_compra);
