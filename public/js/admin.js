function format_price(value) { return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value); }

let admin_products = [];
let admin_coupons = [];

async function admin_fetch(url, options = {}) {
    const response = await fetch(url, options);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Ocurrió un error.');
    return data;
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
        row.querySelector('.delete-button').addEventListener('click', () => delete_product(product.id));
        tbody.appendChild(row);
    });
}

function fill_form(product) {
    document.getElementById('form-label').textContent = `EDITAR PRODUCTO #${product.id}`;
    document.getElementById('product-id').value = product.id;
    for (const key of ['brand','name','gender','category','size_ml','price','stock','intensity','family','top_notes','heart_notes','base_notes','description','image_url']) document.getElementById(key).value = product[key];
    document.getElementById('featured').checked = product.featured;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function get_form_data() {
    const data = {};
    for (const key of ['brand','name','gender','category','size_ml','price','stock','intensity','family','top_notes','heart_notes','base_notes','description','image_url']) data[key] = document.getElementById(key).value;
    data.featured = document.getElementById('featured').checked;
    return data;
}

async function save_product(event) {
    event.preventDefault();
    const id = document.getElementById('product-id').value;
    const url = id ? `/api/admin/products/${id}` : '/api/admin/products';
    const method = id ? 'PUT' : 'POST';
    try {
        await admin_fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(get_form_data()) });
        document.getElementById('admin-message').textContent = id ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.';
        reset_form();
        await Promise.all([load_dashboard(), load_admin_products()]);
    } catch (error) { document.getElementById('admin-message').textContent = error.message; }
}

async function delete_product(id) {
    if (!confirm('¿Seguro que querés eliminar este perfume?')) return;
    try { await admin_fetch(`/api/admin/products/${id}`, { method: 'DELETE' }); show_toast('Producto eliminado.'); await Promise.all([load_dashboard(), load_admin_products()]); } catch (error) { show_toast(error.message); }
}

function reset_form() { document.getElementById('product-form').reset(); document.getElementById('product-id').value = ''; document.getElementById('form-label').textContent = 'NUEVO PRODUCTO'; }

async function load_users() {
    const users = await admin_fetch('/api/admin/users');
    document.getElementById('admin-users').innerHTML = users.map(user => `<tr><td>${escape_html(user.id)}</td><td>${escape_html(user.name)}</td><td>${escape_html(user.email || 'No disponible')}</td><td>${user.is_admin ? 'Administrador' : 'Cliente'}</td><td>${escape_html(new Date(user.created_at).toLocaleDateString('es-AR'))}</td></tr>`).join('');
}

async function load_inquiries() {
    const inquiries = await admin_fetch('/api/admin/inquiries');
    document.getElementById('admin-inquiries').innerHTML = inquiries.map(item => `<tr><td>${escape_html(new Date(item.created_at).toLocaleString('es-AR'))}</td><td>${escape_html(`${item.brand || ''} ${item.name || item.product_name}`.trim())}</td><td>${escape_html(item.user_name || 'Visitante')}</td><td>${escape_html(item.user_email || 'Sin correo')}</td></tr>`).join('');
}

async function load_admin_reviews() {
    const reviews = await admin_fetch('/api/admin/reviews');
    document.getElementById('admin-reviews').innerHTML = reviews.map(review => `<article class="review-card"><div class="review-stars">${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</div><p>“${escape_html(review.comment)}”</p><div class="review-author">${escape_html(review.user_name)}</div></article>`).join('');
}

async function load_admin_coupons() {
    admin_coupons = await admin_fetch('/api/admin/coupons');
    const tbody = document.getElementById('admin-coupons');
    document.getElementById('coupon-total').textContent = `${admin_coupons.length} cupones`;
    tbody.innerHTML = '';
    admin_coupons.forEach(coupon => {
        const row = document.createElement('tr');
        row.innerHTML = `<td><strong>${escape_html(coupon.code)}</strong></td><td>${escape_html(coupon.discount_percent)}%</td><td><span class="status-pill ${coupon.active ? 'is-active' : 'is-inactive'}">${coupon.active ? 'Activo' : 'Inactivo'}</span></td><td>${escape_html(new Date(coupon.updated_at).toLocaleDateString('es-AR'))}</td><td><div class="admin-actions"><button class="small-button coupon-toggle">${coupon.active ? 'Desactivar' : 'Activar'}</button><button class="small-button coupon-edit">Editar</button><button class="small-button coupon-delete">Eliminar</button></div></td>`;
        row.querySelector('.coupon-toggle').addEventListener('click', () => save_coupon_value(coupon, { ...coupon, active: !coupon.active }));
        row.querySelector('.coupon-edit').addEventListener('click', () => fill_coupon_form(coupon));
        row.querySelector('.coupon-delete').addEventListener('click', () => delete_coupon(coupon.id));
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
    const id = document.getElementById('coupon-id').value;
    const data = { code: document.getElementById('admin-coupon-code').value.toUpperCase(), discount_percent: document.getElementById('coupon-percent').value, active: document.getElementById('coupon-active').checked };
    try {
        await admin_fetch(id ? `/api/admin/coupons/${id}` : '/api/admin/coupons', { method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        const message = id ? 'Cupón actualizado.' : 'Cupón creado.';
        reset_coupon_form();
        document.getElementById('coupon-message').textContent = message;
        await load_admin_coupons();
    } catch (error) { document.getElementById('coupon-message').textContent = error.message; }
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
        if (button.dataset.tab === 'usuarios') await load_users();
        if (button.dataset.tab === 'cupones') await load_admin_coupons();
        if (button.dataset.tab === 'consultas') await load_inquiries();
        if (button.dataset.tab === 'opiniones') await load_admin_reviews();
    }));
}

document.addEventListener('DOMContentLoaded', async () => {
    if (!(await verify_admin())) return;
    document.getElementById('product-form').addEventListener('submit', save_product);
    document.getElementById('cancel-edit').addEventListener('click', reset_form);
    document.getElementById('coupon-form').addEventListener('submit', save_coupon);
    document.getElementById('cancel-coupon-edit').addEventListener('click', reset_coupon_form);
    const coupon_code = document.getElementById('admin-coupon-code');
    coupon_code.addEventListener('input', () => { coupon_code.value = coupon_code.value.toUpperCase(); });
    document.getElementById('logout-admin').addEventListener('click', async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/'; });
    setup_tabs();
    try { await Promise.all([load_dashboard(), load_admin_products()]); } catch (error) { show_toast(error.message); }
});
