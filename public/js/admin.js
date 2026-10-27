function format_price(value) { return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value); }

let admin_products = [];
let applied_product_search = '';
let low_stock_only = false;
let active_admin_module = 'productos';
let admin_module_request = 0;
let product_form_baseline = '';
let dashboard_request = 0;
let admin_products_state = 'loading';
let admin_products_request_id = 0;
let admin_coupons = [];
let admin_reviews = [];
let editing_product_id = '';
let product_save_pending = false;
let product_disabled_controls = new Map();
let product_image_preview_state = 'empty';
let product_image_preview_url = '';
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
    let response;
    try { response = await fetch(url, options); }
    catch { throw new Error('No pudimos conectar con DREAMS. Revisá tu conexión e intentá nuevamente.'); }
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
        button.disabled = button === document.querySelector('#product-form [type="submit"]') ? !is_current_product_image() : false;
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

const admin_modules = [
    ['productos', 'Productos', 'products', 'en catálogo'], ['usuarios', 'Usuarios', 'users', 'cuentas creadas'],
    ['consultas', 'Consultas', 'inquiries', 'por WhatsApp'], ['opiniones', 'Opiniones', 'reviews', 'publicadas'],
    ['pedidos', 'Pedidos', 'orders', 'registrados'], ['baja', 'Disponibilidad baja', 'low_stock', '0, 1 o 2 unidades'], ['cupones', 'Cupones', 'coupons', 'configurados']
];
function stat_card(module, stats) {
    const [id, title, key, note] = module, selected = active_admin_module === id;
    return `<button type="button" class="admin-stat${selected ? ' active' : ''}" data-module="${id}" aria-controls="tab-${id === 'baja' ? 'productos' : id}" aria-pressed="${selected}"><span>${title}</span><strong>${escape_html(stats[key] ?? '—')}</strong><small>${note}</small><span class="admin-card-active"${selected ? '' : ' hidden'}>Módulo abierto</span></button>`;
}
function render_dashboard(stats) {
    const focused = document.activeElement?.closest('[data-module]')?.dataset.module;
    document.getElementById('admin-stats').innerHTML = admin_modules.map(module => stat_card(module, stats)).join('');
    refresh_product_counts();
    if (focused) document.querySelector(`[data-module="${focused}"]`)?.focus({ preventScroll: true });
}
async function load_dashboard() {
    const epoch = ++dashboard_request, status = document.getElementById('admin-dashboard-status'), retry = document.getElementById('retry-admin-dashboard');
    try {
        const [stats, coupons] = await Promise.all([admin_fetch('/api/admin/stats'), admin_fetch('/api/admin/coupons')]);
        if (epoch !== dashboard_request) return;
        render_dashboard({ ...stats, coupons: coupons.length }); status.textContent = ''; retry.hidden = true;
    } catch (error) {
        if (epoch !== dashboard_request) return;
        if (!document.querySelector('[data-module]')) render_dashboard({});
        status.textContent = 'No pudimos actualizar los conteos. Podés reintentarlo; los módulos siguen disponibles.'; retry.hidden = false;
    }
}

function refresh_product_counts() {
    if (admin_products_state !== 'ready') return;
    for (const [module, count] of [['productos', admin_products.length], ['baja', admin_products.filter(product => DreamsAdminProducts.low_stock(product.stock)).length]]) {
        const node = document.querySelector(`[data-module="${module}"] strong`); if (node) node.textContent = count;
    }
}
async function load_admin_products() {
    const request_id = ++admin_products_request_id;
    admin_products_state = 'loading';
    render_admin_products();
    try {
        const products = await admin_fetch('/api/admin/products');
        if (request_id !== admin_products_request_id) return;
        if (!Array.isArray(products)) throw new Error('Listado de productos inválido.');
        admin_products = products;
        admin_products_state = 'ready';
        refresh_product_counts();
    } catch (error) {
        if (request_id !== admin_products_request_id) return;
        admin_products_state = 'error';
    }
    render_admin_products();
}

function product_message_row(message) {
    const row = document.createElement('tr'), cell = document.createElement('td');
    cell.colSpan = 7; cell.textContent = message; row.appendChild(cell); return row;
}
function admin_product_row(product) {
    const row = document.createElement('tr'), stock = DreamsAdminProducts.valid_stock(product.stock) ? product.stock : '—';
    row.innerHTML = `<td>${escape_html(product.id)}</td><td><strong>${escape_html(product.name)}</strong><br><small>${escape_html(product.size_ml)} ml</small></td><td>${escape_html(product.brand)}</td><td>${escape_html(product.gender)}</td><td>${escape_html(stock)} <small>${DreamsAdminProducts.stock_label(product.stock)}</small></td><td>${escape_html(format_price(product.price))}</td><td><div class="admin-actions"><button class="small-button admin-product-action edit-button">Editar</button><button class="small-button admin-product-action admin-product-action-danger delete-button">Eliminar</button></div></td>`;
    row.querySelector('.edit-button').addEventListener('click', () => fill_form(product));
    row.querySelector('.delete-button').addEventListener('click', event => delete_product(product.id, event.currentTarget));
    return row;
}
function render_admin_products() {
    const tbody = document.getElementById('admin-products'), status = document.getElementById('admin-products-status');
    document.getElementById('clear-product-search').disabled = !document.getElementById('admin-product-search').value && !applied_product_search;
    document.getElementById('retry-admin-products').hidden = admin_products_state !== 'error';
    document.getElementById('low-stock-status').hidden = !low_stock_only;
    tbody.setAttribute('aria-busy', String(admin_products_state === 'loading'));
    const products = DreamsAdminProducts.filter_products(admin_products, applied_product_search, low_stock_only);
    const ready = admin_products_state === 'ready';
    document.getElementById('product-total').textContent = ready ? `${products.length} de ${admin_products.length} productos` : '';
    status.textContent = !ready ? admin_products_state === 'loading' ? 'Cargando productos…' : 'No se pudieron cargar los productos. Volvé a intentar.' : products.length ? `${products.length} productos disponibles en el listado.` : 'No se encontraron productos';
    tbody.replaceChildren(...(ready && products.length ? products.map(admin_product_row) : [product_message_row(status.textContent)]));
}
function apply_product_search(event) { event?.preventDefault(); applied_product_search = document.getElementById('admin-product-search').value.trim(); render_admin_products(); }
function clear_product_search() { document.getElementById('admin-product-search').value = ''; applied_product_search = ''; render_admin_products(); document.getElementById('admin-product-search').focus(); }
function product_form_dirty() { return product_form_baseline && JSON.stringify(get_form_data()) !== product_form_baseline; }
function may_replace_product() { return !product_form_dirty() || confirm('Tenés cambios sin guardar. ¿Querés descartarlos?'); }

function fill_form(product) {
    if (product_save_pending) { show_toast('Esperá a que termine el guardado.'); return; }
    if (!may_replace_product()) return;
    editing_product_id = String(product.id);
    document.getElementById('form-label').textContent = `EDITAR PRODUCTO #${product.id}`;
    document.getElementById('product-id').value = editing_product_id;
    for (const key of ['brand','name','gender','category','size_ml','price','stock','intensity','family','top_notes','heart_notes','base_notes','description','image_url']) document.getElementById(key).value = product[key] ?? '';
    document.getElementById('featured').checked = product.featured;
    product_form_baseline = JSON.stringify(get_form_data());
    preview_product_image();
    document.getElementById('product-form').scrollIntoView({ block: 'start', behavior: 'auto' });
    document.getElementById('name').focus({ preventScroll: true });
}

function is_supported_image_url(value) { return DreamsAdminImages.supported_image_url(value); }

function is_current_product_image() {
    return product_image_preview_state === 'valid' && product_image_preview_url === document.getElementById('image_url').value.trim();
}

function set_product_image_preview(state, message = '') {
    product_image_preview_state = state;
    if (state !== 'valid') product_image_preview_url = '';
    if (state !== 'pending') window.clearTimeout(product_image_load_timer);
    const panel = document.getElementById('image-preview');
    const image = document.getElementById('image-preview-image');
    const status = document.getElementById('image-preview-message');
    const submit = document.querySelector('#product-form [type="submit"]');
    panel.hidden = state === 'empty';
    panel.dataset.state = state;
    status.textContent = message;
    if (state === 'empty' || state === 'invalid') image.removeAttribute('src');
    if (submit) submit.disabled = product_save_pending || !is_current_product_image();
    document.getElementById('retry-image-preview').hidden = state !== 'invalid' || !is_supported_image_url(document.getElementById('image_url').value);
}

function complete_product_image(candidate, token) {
    if (token !== product_image_preview_token || candidate !== document.getElementById('image_url').value.trim()) return;
    window.clearTimeout(product_image_load_timer); product_image_preview_url = candidate;
    document.getElementById('image-preview-image').src = candidate;
    const warning = DreamsAdminImages.temporary_image_url(candidate) ? ' Este enlace es temporal o firmado y puede vencer. Preferí un enlace permanente.' : '';
    set_product_image_preview('valid', 'Vista previa lista.' + warning);
}
function fail_product_image(token, message) {
    if (token !== product_image_preview_token) return;
    window.clearTimeout(product_image_load_timer); product_image_preview_token += 1;
    set_product_image_preview('invalid', message);
}
function preview_product_image() {
    window.clearTimeout(product_image_preview_timer); window.clearTimeout(product_image_load_timer);
    const candidate = document.getElementById('image_url').value.trim(), token = ++product_image_preview_token;
    if (!candidate) { set_product_image_preview('invalid', 'Ingresá un enlace HTTPS directo a una imagen.'); return; }
    if (!is_supported_image_url(candidate)) { set_product_image_preview('invalid', /^http:/i.test(candidate) ? 'Usá HTTPS: los enlaces HTTP se bloquean en esta página.' : IMAGE_URL_ERROR); return; }
    set_product_image_preview('pending', 'Comprobando imagen…');
    // Cada intento usa su propia imagen: un evento de una URL vieja no valida la nueva.
    const probe = new Image(); probe.referrerPolicy = 'no-referrer';
    probe.onload = () => complete_product_image(candidate, token);
    probe.onerror = () => fail_product_image(token, 'El enlace no cargó una imagen. Puede apuntar a una página, haber vencido o bloquear el acceso. Usá un enlace directo y permanente.');
    probe.src = candidate;
    product_image_load_timer = window.setTimeout(() => fail_product_image(token, 'La imagen tardó demasiado en cargar. Revisá tu conexión o reintentá.'), 6000);
}

function schedule_product_image_preview() {
    product_image_preview_token += 1;
    window.clearTimeout(product_image_load_timer);
    set_product_image_preview('pending', 'Comprobando imagen…');
    window.clearTimeout(product_image_preview_timer);
    product_image_preview_timer = window.setTimeout(preview_product_image, 250);
}

function get_form_data() {
    const data = {};
    for (const key of ['brand','name','gender','category','size_ml','price','stock','intensity','family','top_notes','heart_notes','base_notes','description','image_url']) data[key] = document.getElementById(key).value;
    data.featured = document.getElementById('featured').checked;
    return data;
}

function set_product_save_pending(busy) {
    product_save_pending = busy;
    const form = document.getElementById('product-form');
    if (busy) {
        form.setAttribute('aria-busy', 'true');
        product_disabled_controls = new Map([...form.elements].map(element => [element, element.disabled]));
        for (const element of form.elements) element.disabled = true;
    } else {
        for (const [element, disabled] of product_disabled_controls) element.disabled = disabled;
        product_disabled_controls.clear();
        form.removeAttribute('aria-busy');
    }
}

async function commit_product(id, data) {
    set_product_save_pending(true);
    try {
        await admin_fetch(id ? `/api/admin/products/${id}` : '/api/admin/products', { method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        reset_form(true);
        document.getElementById('admin-message').textContent = id ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.';
        await Promise.all([load_dashboard(), load_admin_products()]);
    } catch (error) { document.getElementById('admin-message').textContent = `${error.message} Revisá el listado antes de repetir un alta si no pudimos confirmar el guardado.`; }
    finally { set_product_save_pending(false); }
}
async function save_product(event) {
    event.preventDefault();
    if (product_save_pending || !event.currentTarget.reportValidity()) return;
    if (!is_current_product_image()) { document.getElementById('admin-message').textContent = IMAGE_URL_ERROR; preview_product_image(); return; }
    const id = editing_product_id || document.getElementById('product-id').value, data = get_form_data(); data.image_url = data.image_url.trim();
    await with_pending(event.submitter || event.currentTarget.querySelector('[type="submit"]'), 'Guardando…', () => commit_product(id, data));
}

async function delete_product(id, button) {
    if (!confirm('¿Seguro que querés eliminar este perfume? Esta acción es permanente.')) return;
    await with_pending(button, 'Eliminando…', async () => {
        try { await admin_fetch(`/api/admin/products/${id}`, { method: 'DELETE' }); show_toast('Producto eliminado.'); await Promise.all([load_dashboard(), load_admin_products()]); } catch (error) { show_toast(error.message); }
    });
}

function reset_form(force = false) {
    if (product_save_pending && force !== true) return;
    if (force !== true && !may_replace_product()) return;
    editing_product_id = '';
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
    document.getElementById('form-label').textContent = 'NUEVO PRODUCTO';
    document.getElementById('admin-message').textContent = '';
    product_image_preview_token += 1;
    window.clearTimeout(product_image_preview_timer);
    window.clearTimeout(product_image_load_timer);
    set_product_image_preview('empty');
    product_form_baseline = JSON.stringify(get_form_data());
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

function order_status_label(value) {
    return ({ created: 'Creado', approved: 'Aprobado', rejected: 'Rechazado', pending: 'Pendiente', cancelled: 'Cancelado', error: 'Error' })[value] || 'Estado no reconocido';
}

function order_provider_label(value) {
    return ({ mercado_pago: 'Mercado Pago', demo: 'Simulación de prueba', presentation_demo: 'Presentación académica' })[value] || 'Proveedor no reconocido';
}

async function load_orders() {
    const orders = await admin_fetch('/api/admin/orders');
    document.getElementById('order-total').textContent = `${orders.length} pedidos`;
    document.getElementById('admin-orders').innerHTML = orders.map(order => `<tr><td><strong>${escape_html(order.order_number)}</strong></td><td>${escape_html(new Date(order.created_at).toLocaleString('es-AR'))}</td><td><span class="status-pill">${escape_html(order_status_label(order.status))}</span></td><td>${escape_html(order_provider_label(order.provider))}</td><td>${escape_html(order.coupon_code || '—')}</td><td>${escape_html(format_price(order.total))}</td><td>${escape_html(Array.isArray(order.items) ? order.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0) : 0)}</td></tr>`).join('');
}

async function load_admin_coupons() {
    admin_coupons = await admin_fetch('/api/admin/coupons');
    const count = document.querySelector('[data-module="cupones"] strong'); if (count) count.textContent = admin_coupons.length;
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

function module_selected(id) {
    active_admin_module = id; low_stock_only = id === 'baja';
    document.querySelectorAll('[data-module]').forEach(button => {
        const active = button.dataset.module === id; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); button.querySelector('.admin-card-active').hidden = !active;
    });
    document.querySelectorAll('.admin-tab-content').forEach(section => section.classList.toggle('active', section.id === `tab-${id === 'baja' ? 'productos' : id}`));
}
async function open_admin_module(id, focus = true) {
    if (!admin_modules.some(module => module[0] === id)) return;
    const epoch = ++admin_module_request; module_selected(id);
    const status = document.getElementById('admin-module-status'), retry = document.getElementById('retry-admin-module');
    status.textContent = 'Cargando módulo…'; retry.hidden = true;
    try {
        const loaders = { productos: load_admin_products, baja: load_admin_products, usuarios: load_users, pedidos: load_orders, cupones: load_admin_coupons, consultas: load_inquiries, opiniones: load_admin_reviews };
        await loaders[id](); if (epoch !== admin_module_request) return;
        status.textContent = '';
        const section = document.getElementById(`tab-${id === 'baja' ? 'productos' : id}`); section.tabIndex = -1;
        if (focus) { section.focus({ preventScroll: true }); section.scrollIntoView({ block: 'start', behavior: 'auto' }); }
    } catch (error) { if (epoch === admin_module_request) { status.textContent = error.message; retry.hidden = false; } }
}
function setup_tabs() {
    document.getElementById('retry-admin-dashboard').addEventListener('click', load_dashboard);
    document.getElementById('admin-stats').addEventListener('click', event => { const button = event.target.closest('[data-module]'); if (button) open_admin_module(button.dataset.module); });
    document.getElementById('retry-admin-module').addEventListener('click', () => open_admin_module(active_admin_module));
    document.getElementById('show-all-products').addEventListener('click', () => open_admin_module('productos'));
}
function setup_product_controls() {
    document.getElementById('admin-search-form').addEventListener('submit', apply_product_search);
    document.getElementById('admin-product-search').addEventListener('input', () => { document.getElementById('clear-product-search').disabled = !document.getElementById('admin-product-search').value && !applied_product_search; });
    document.getElementById('clear-product-search').addEventListener('click', clear_product_search);
    document.getElementById('retry-admin-products').addEventListener('click', load_admin_products);
    document.getElementById('product-form').addEventListener('submit', save_product);
    document.getElementById('image_url').addEventListener('input', schedule_product_image_preview);
    document.getElementById('retry-image-preview').addEventListener('click', preview_product_image);
    document.getElementById('cancel-edit').addEventListener('click', () => reset_form());
    product_form_baseline = JSON.stringify(get_form_data()); set_product_image_preview('empty');
    window.addEventListener('beforeunload', event => { if (product_form_dirty() && !product_save_pending) { event.preventDefault(); event.returnValue = ''; } });
}

async function init_admin() {
    if (!(await verify_admin())) return;
    const config = await admin_fetch('/api/config').catch(() => ({}));
    if (config.preview_read_only && !config.admin_writes_enabled) {
        const notice = document.createElement('p'); notice.className = 'form-message'; notice.setAttribute('role', 'status');
        notice.textContent = 'Vista de revisión: las escrituras están protegidas. Los datos se consultan sin modificarlos.';
        document.querySelector('main')?.prepend(notice);
    }
    setup_product_controls();
    setup_other_admin_controls();
    setup_tabs();
    try { await Promise.all([load_dashboard(), load_admin_products()]); } catch (error) { show_toast(error.message); }
}
function setup_other_admin_controls() {
    document.getElementById('coupon-form').addEventListener('submit', save_coupon);
    document.getElementById('cancel-coupon-edit').addEventListener('click', reset_coupon_form);
    const coupon_code = document.getElementById('admin-coupon-code');
    coupon_code.addEventListener('input', () => { coupon_code.value = coupon_code.value.toUpperCase(); });
    document.getElementById('review-search').addEventListener('input', render_admin_reviews);
    document.getElementById('logout-admin').addEventListener('click', event => with_pending(event.currentTarget, 'Cerrando…', async () => {
        try { await admin_fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/'; }
        catch (error) { show_toast(error.message); }
    }));
}
document.addEventListener('DOMContentLoaded', init_admin);
