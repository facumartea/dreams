let checkout_quote = null;

function checkout_items_payload() {
    return get_cart().map(item => ({ id: item.id, quantity: item.quantity }));
}

function render_checkout(items, total) {
    const container = document.getElementById('checkout-items');
    container.innerHTML = '';
    items.forEach(item => {
        const row = document.createElement('article');
        row.className = 'checkout-item';
        row.innerHTML = `<img src="${escape_html(safe_image_url(item.image_url))}" alt=""><div><span>${escape_html(item.brand)}</span><h3>${escape_html(item.name)}</h3><p>${item.quantity} × ${format_price(item.price)}</p></div><strong>${format_price(item.price * item.quantity)}</strong>`;
        attach_image_fallback(row.querySelector('img'));
        container.appendChild(row);
    });
    document.querySelector('#checkout-total strong').textContent = format_price(total);
}

async function setup_checkout() {
    const button = document.getElementById('checkout-submit');
    const status = document.getElementById('checkout-status');
    try {
        const [config_response, user_response, quote_response] = await Promise.all([
            fetch('/api/checkout/config'),
            fetch('/api/auth/me'),
            fetch('/api/cart/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: checkout_items_payload() }) })
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
        render_checkout(quote.items, quote.total);
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
            const response = await fetch('/api/checkout/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: checkout_items_payload() }) });
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
}

document.addEventListener('DOMContentLoaded', setup_checkout);
