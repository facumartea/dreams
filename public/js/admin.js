function format_price(value) { return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value); }

let admin_products = [];
let admin_coupons = [];
let admin_reviews = [];
let editing_product_id = '';
let product_image_preview_state = 'empty';
let product_image_preview_token = 0;
let product_image_preview_timer;
let product_image_load_timer;
const IMAGE_URL_ERROR = 'La URL ingresada no apunta a una imagen válida o el servidor no permite mostrarla. Usá una URL HTTPS directa.';

function show_toast(message) {
    document.querySelector('.toast')?.remove();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.textContent = message;
    document.body.appendChild(toast);
    window.setTimeout(() => toast.remove(), 3200);
}

async function admin_fetch(url, options = {}) {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Ocurrió un error.');
    return data;
}

async function with_pending(button, pending_label, action) {
    if (!button || button.disabled) return;
    const label = button.textContent;
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    button.textContent = pending_label;
    try { return await action(); }
    finally {
        button.disabled = false;
        button.removeAttribute('aria-busy');
        button.textContent = label;
    }
}

async function verify_admin() {
    try {
        const data = await admin_fetch('/api/auth/me');
        if (!data.user || !data.user.is_admin) { window.location.href = '/cuenta.html?admin=1'; return false; }
        return true;
    } catch (error) { window.location.href = '/cuenta.html?admin=1'; return false; }
}

function stat_card(title, value, note) { return `<article class="admin-stat"><span>${escape_html(title)}</span><strong>${escape_html(value)}</strong><small>${escape_html(note)}</small></article>`; }

async function load_dashboard() {
    const stats = await admin_fetch('/api/admin/stats');
    document.getElementById('admin-stats').innerHTML = [
        stat_card('Productos', stats.products, 'en catálogo'),
        stat_card('Usuarios', stats.users, 'cuentas creadas'),
        stat_card('Consultas', stats.inquiries, 'por WhatsApp'),
        stat_card('Opiniones', stats.reviews, 'publicadas'),
        stat_card('Pedidos', stats.orders, 'registrados'),
        stat_card('Stock bajo', stats.low_stock, '2 unidades o menos')
    ].join('');
}

async function load_admin_products() {
    admin_products = await admin_fetch('/api/admin/products');
    render_admin_products();
}

function render_admin_products() {
    const tbody = document.getElementById('admin-products');
    document.getElementById('product-total').textContent = `${admin_products.length} productos`;
    tbody.innerHTML = '';
    admin_products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${escape_html(product.id)}</td><td><strong>${escape_html(product.name)}</strong><br><small>${escape_html(product.size_ml)} ml</small></td><td>${escape_html(product.brand)}</td><td>${escape_html(product.gender)}</td><td>${escape_html(product.stock)}</td><td>${escape_html(format_price(product.price))}</td><td><div class="admin-actions"><button class="small-button edit-button">Editar</button><button class="small-button delete-button">Eliminar</button></div></td>`;
        row.querySelector('.edit-button').addEventListener('click', () => fill_form(product));
        row.querySelector('.delete-button').addEventListener('click', event => delete_product(product.id, event.currentTarget));
        tbody.appendChild(row);
    });
}

function fill_form(product) {
    editing_product_id = String(product.id);
    document.getElementById('form-label').textContent = `EDITAR PRODUCTO #${product.id}`;
    document.getElementById('product-id').value = editing_product_id;
    for (const key of ['brand','name','gender','category','size_ml','price','stock','intensity','family','top_notes','heart_notes','base_notes','description','image_url']) document.getElementById(key).value = product[key];
    document.getElementById('featured').checked = product.featured;
    preview_product_image();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function is_supported_image_url(value) {
    const candidate = String(value || '').trim();
    if (/^\/(?!\/)/.test(candidate)) return true;
    try {
        const parsed = new URL(candidate);
        const hostname = parsed.hostname.toLowerCase();
        const google_page = /(^|\.)google\.[a-z.]+$/.test(hostname) && ['/imgres', '/search'].includes(parsed.pathname);
        return parsed.protocol === 'https:' && !parsed.username && !parsed.password && !google_page;
    } catch (error) {
        return false;
    }
}

function set_product_image_preview(state, message = '') {
    product_image_preview_state = state;
    if (state !== 'pending') window.clearTimeout(product_image_load_timer);
    const panel = document.getElementById('image-preview');
    const image = document.getElementById('image-preview-image');
    const status = document.getElementById('image-preview-message');
    const submit = document.querySelector('#product-form [type="submit"]');
    panel.hidden = state === 'empty';
    panel.dataset.state = state;
    status.textContent = message;
    if (state === 'empty' || state === 'invalid') image.removeAttribute('src');
    if (submit) submit.disabled = state !== 'valid';
}

function preview_product_image() {
    window.clearTimeout(product_image_preview_timer);
    window.clearTimeout(product_image_load_timer);
    const candidate = document.getElementById('image_url').value.trim();
    const image = document.getElementById('image-preview-image');
    const token = ++product_image_preview_token;
    if (!candidate) {
        set_product_image_preview('empty');
        return;
    }
    if (!is_supported_image_url(candidate)) {
        set_product_image_preview('invalid', IMAGE_URL_ERROR);
        return;
    }
    set_product_image_preview('pending', 'Comprobando imagen…');
    image.onload = () => {
        window.clearTimeout(product_image_load_timer);
        if (token === product_image_preview_token) set_product_image_preview('valid', 'Vista previa lista.');
    };
    image.onerror = () => {
        window.clearTimeout(product_image_load_timer);
        if (token === product_image_preview_token) set_product_image_preview('invalid', IMAGE_URL_ERROR);
    };
    image.src = candidate;
    product_image_load_timer = window.setTimeout(() => {
        if (token === product_image_preview_token) set_product_image_preview('invalid', IMAGE_URL_ERROR);
    }, 6000);
}

function schedule_product_image_preview() {
    window.clearTimeout(product_image_preview_timer);
    product_image_preview_timer = window.setTimeout(preview_product_image, 250);
}

function get_form_data() {
    const data = {};
    for (const key of ['brand','name','gender','category','size_ml','price','stock','intensity','family','top_notes','heart_notes','base_notes','description','image_url']) data[key] = document.getElementById(key).value;
    data.featured = document.getElementById('featured').checked;
    return data;
}

async function save_product(event) {
    event.preventDefault();
    const submit = event.submitter || event.currentTarget.querySelector('[type="submit"]');
    if (product_image_preview_state !== 'valid') {
        document.getElementById('admin-message').textContent = IMAGE_URL_ERROR;
        preview_product_image();
        return;
    }
    const id = editing_product_id || document.getElementById('product-id').value;
    const url = id ? `/api/admin/products/${id}` : '/api/admin/products';
    const method = id ? 'PUT' : 'POST';
    await with_pending(submit, 'Guardando…', async () => {
        try {
            await admin_fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(get_form_data()) });
            const success_message = id ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.';
            reset_form();
            document.getElementById('admin-message').textContent = success_message;
            await Promise.all([load_dashboard(), load_admin_products()]);
        } catch (error) { document.getElementById('admin-message').textContent = error.message; }
    });
}

async function delete_product(id, button) {
    if (!confirm('¿Seguro que querés eliminar este perfume? Esta acción es permanente.')) return;
    await with_pending(button, 'Eliminando…', async () => {
        try { await admin_fetch(`/api/admin/products/${id}`, { method: 'DELETE' }); show_toast('Producto eliminado.'); await Promise.all([load_dashboard(), load_admin_products()]); } catch (error) { show_toast(error.message); }
    });
}

function reset_form() {
    editing_product_id = '';
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
    document.getElementById('form-label').textContent = 'NUEVO PRODUCTO';
    document.getElementById('admin-message').textContent = '';
    product_image_preview_token += 1;
    window.clearTimeout(product_image_preview_timer);
    window.clearTimeout(product_image_load_timer);
    set_product_image_preview('empty');
}

async function load_users() {
    const users = await admin_fetch('/api/admin/users');
    document.getElementById('admin-users').innerHTML = users.map(user => `<tr><td>${escape_html(user.id)}</td><td>${escape_html(user.name)}</td><td>${escape_html(user.email || 'No disponible')}</td><td>${user.is_admin ? 'Administrador' : 'Cliente'}</td><td>${escape_html(new Date(user.created_at).toLocaleDateString('es-AR'))}</td></tr>`).join('');
}

async function load_inquiries() {
    const inquiries = await admin_fetch('/api/admin/inquiries');
    document.getElementById('admin-inquiries').innerHTML = inquiries.map(item => `<tr><td>${escape_html(new Date(item.created_at).toLocaleString('es-AR'))}</td><td>${escape_html(`${item.brand || ''} ${item.name || item.product_name}`.trim())}</td><td>${escape_html(item.user_name || 'Visitante')}</td><td>${escape_html(item.user_email || 'Sin correo')}</td></tr>`).join('');
}

async function load_admin_reviews() {
    admin_reviews = await admin_fetch('/api/admin/reviews');
    render_admin_reviews();
}

function render_admin_reviews() {
    const search = document.getElementById('review-search').value.trim().toLowerCase();
    const reviews = admin_reviews.filter(review => `${review.user_name} ${review.comment}`.toLowerCase().includes(search));
    const container = document.getElementById('admin-reviews');
    if (!reviews.length) {
        container.innerHTML = '<div class="empty-state"><h3>No hay opiniones para mostrar.</h3></div>';
        return;
    }
    container.innerHTML = reviews.map(review => `<article class="review-card admin-review-card" data-review-id="${escape_html(review.id)}"><div class="review-author">${escape_html(review.user_name)}</div><small>${escape_html(new Date(review.created_at).toLocaleString('es-AR'))}</small><label>Puntuación<select class="review-rating" aria-label="Puntuación de ${escape_html(review.user_name)}">${[1,2,3,4,5].map(value => `<option value="${value}" ${value === Number(review.rating) ? 'selected' : ''}>${value} / 5</option>`).join('')}</select></label><label>Comentario<textarea class="review-comment" maxlength="1000">${escape_html(review.comment)}</textarea></label><div class="admin-actions"><button class="small-button review-save" type="button">Guardar</button><button class="small-button review-delete" type="button">Eliminar</button></div><p class="form-message review-message" role="status" aria-live="polite"></p></article>`).join('');
    container.querySelectorAll('.admin-review-card').forEach(card => {
        const id = card.dataset.reviewId;
        card.querySelector('.review-save').addEventListener('click', event => save_review(id, card, event.currentTarget));
        card.querySelector('.review-delete').addEventListener('click', event => delete_review(id, event.currentTarget));
    });
}

async function save_review(id, card, button) {
    await with_pending(button, 'Guardando…', async () => {
        const message = card.querySelector('.review-message');
        try {
            const updated = await admin_fetch(`/api/admin/reviews/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rating: card.querySelector('.review-rating').value, comment: card.querySelector('.review-comment').value }) });
            admin_reviews = admin_reviews.map(review => String(review.id) === String(id) ? updated : review);
            message.textContent = 'Opinión actualizada.';
        } catch (error) { message.textContent = error.message; }
    });
}

async function delete_review(id, button) {
    if (!confirm('¿Seguro que querés eliminar esta opinión? Esta acción es permanente.')) return;
    await with_pending(button, 'Eliminando…', async () => {
        try {
            await admin_fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
            admin_reviews = admin_reviews.filter(review => String(review.id) !== String(id));
            render_admin_reviews();
            show_toast('Opinión eliminada.');
            await load_dashboard();
        } catch (error) { show_toast(error.message); }
    });
}

async function load_orders() {
    const orders = await admin_fetch('/api/admin/orders');
    document.getElementById('order-total').textContent = `${orders.length} pedidos`;
    document.getElementById('admin-orders').innerHTML = orders.map(order => `<tr><td><strong>${escape_html(order.order_number)}</strong></td><td>${escape_html(new Date(order.created_at).toLocaleString('es-AR'))}</td><td><span class="status-pill">${escape_html(order.status)}</span></td><td>${escape_html(order.provider)}</td><td>${escape_html(order.coupon_code || '—')}</td><td>${escape_html(format_price(order.total))}</td><td>${escape_html(Array.isArray(order.items) ? order.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0) : 0)}</td></tr>`).join('');
}

async function load_admin_coupons() {
    admin_coupons = await admin_fetch('/api/admin/coupons');
    const tbody = document.getElementById('admin-coupons');
    document.getElementById('coupon-total').textContent = `${admin_coupons.length} cupones`;
    tbody.innerHTML = '';
    admin_coupons.forEach(coupon => {
        const row = document.createElement('tr');
        row.innerHTML = `<td><strong>${escape_html(coupon.code)}</strong></td><td>${escape_html(coupon.discount_percent)}%</td><td><span class="status-pill ${coupon.active ? 'is-active' : 'is-inactive'}">${coupon.active ? 'Activo' : 'Inactivo'}</span></td><td>${escape_html(new Date(coupon.updated_at).toLocaleDateString('es-AR'))}</td><td><div class="admin-actions"><button class="small-button coupon-toggle">${coupon.active ? 'Desactivar' : 'Activar'}</button><button class="small-button coupon-edit">Editar</button><button class="small-button coupon-delete">Eliminar</button></div></td>`;
        row.querySelector('.coupon-toggle').addEventListener('click', event => with_pending(event.currentTarget, 'Guardando…', () => save_coupon_value(coupon, { ...coupon, active: !coupon.active })));
        row.querySelector('.coupon-edit').addEventListener('click', () => fill_coupon_form(coupon));
        row.querySelector('.coupon-delete').addEventListener('click', event => with_pending(event.currentTarget, 'Eliminando…', () => delete_coupon(coupon.id)));
        tbody.appendChild(row);
    });
}

function fill_coupon_form(coupon) {
    document.getElementById('coupon-form-label').textContent = `EDITAR CUPÓN ${coupon.code}`;
    document.getElementById('coupon-id').value = coupon.id;
    document.getElementById('admin-coupon-code').value = coupon.code;
    document.getElementById('coupon-percent').value = coupon.discount_percent;
    document.getElementById('coupon-active').checked = coupon.active;
    document.getElementById('admin-coupon-code').focus();
}

function reset_coupon_form() {
    document.getElementById('coupon-form').reset();
    document.getElementById('coupon-id').value = '';
    document.getElementById('coupon-active').checked = true;
    document.getElementById('coupon-form-label').textContent = 'NUEVO CUPÓN';
    document.getElementById('coupon-message').textContent = '';
}

async function save_coupon_value(current, value) {
    try {
        await admin_fetch(`/api/admin/coupons/${current.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: value.code, discount_percent: value.discount_percent, active: value.active }) });
        show_toast(value.active ? 'Cupón activado.' : 'Cupón desactivado.');
        await load_admin_coupons();
    } catch (error) { show_toast(error.message); }
}

async function save_coupon(event) {
    event.preventDefault();
    return with_pending(event.currentTarget.querySelector('[type="submit"]'), 'Guardando…', async () => {
        const id = document.getElementById('coupon-id').value;
        const data = { code: document.getElementById('admin-coupon-code').value.toUpperCase(), discount_percent: document.getElementById('coupon-percent').value, active: document.getElementById('coupon-active').checked };
        try {
            await admin_fetch(id ? `/api/admin/coupons/${id}` : '/api/admin/coupons', { method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            const message = id ? 'Cupón actualizado.' : 'Cupón creado.';
            reset_coupon_form();
            document.getElementById('coupon-message').textContent = message;
            await load_admin_coupons();
        } catch (error) { document.getElementById('coupon-message').textContent = error.message; }
    });
}

async function delete_coupon(id) {
    if (!confirm('¿Seguro que querés eliminar este cupón? Los pedidos anteriores conservarán el código y descuento aplicado.')) return;
    try { await admin_fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' }); show_toast('Cupón eliminado.'); reset_coupon_form(); await load_admin_coupons(); } catch (error) { show_toast(error.message); }
}

function setup_tabs() {
    document.querySelectorAll('.admin-tab').forEach(button => button.addEventListener('click', async () => {
        document.querySelectorAll('.admin-tab').forEach(item => item.classList.remove('active'));
        document.querySelectorAll('.admin-tab-content').forEach(item => item.classList.remove('active'));
        button.classList.add('active');
        document.getElementById(`tab-${button.dataset.tab}`).classList.add('active');
        try {
            if (button.dataset.tab === 'usuarios') await load_users();
            if (button.dataset.tab === 'pedidos') await load_orders();
            if (button.dataset.tab === 'cupones') await load_admin_coupons();
            if (button.dataset.tab === 'consultas') await load_inquiries();
            if (button.dataset.tab === 'opiniones') await load_admin_reviews();
        } catch (error) { show_toast(error.message); }
    }));
}

document.addEventListener('DOMContentLoaded', async () => {
    if (!(await verify_admin())) return;
    const config = await admin_fetch('/api/config').catch(() => ({}));
    if (config.preview_read_only) {
        const notice = document.createElement('p'); notice.className = 'form-message'; notice.setAttribute('role', 'status');
        notice.textContent = 'Preview de revisión: las escrituras están protegidas. Los datos se consultan sin modificarlos.';
        document.querySelector('main')?.prepend(notice);
    }
    document.getElementById('product-form').addEventListener('submit', save_product);
    document.getElementById('image_url').addEventListener('input', schedule_product_image_preview);
    set_product_image_preview('empty');
    document.getElementById('cancel-edit').addEventListener('click', reset_form);
    document.getElementById('coupon-form').addEventListener('submit', save_coupon);
    document.getElementById('cancel-coupon-edit').addEventListener('click', reset_coupon_form);
    const coupon_code = document.getElementById('admin-coupon-code');
    coupon_code.addEventListener('input', () => { coupon_code.value = coupon_code.value.toUpperCase(); });
    document.getElementById('review-search').addEventListener('input', render_admin_reviews);
    document.getElementById('logout-admin').addEventListener('click', event => with_pending(event.currentTarget, 'Cerrando…', async () => {
        try { await admin_fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/'; }
        catch (error) { show_toast(error.message); }
    }));
    setup_tabs();
    try { await Promise.all([load_dashboard(), load_admin_products()]); } catch (error) { show_toast(error.message); }
});
