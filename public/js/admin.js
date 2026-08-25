function format_price(value) { return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value); }

let admin_products = [];

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

function stat_card(title, value, note) { return `<article class="admin-stat"><span>${title}</span><strong>${value}</strong><small>${note}</small></article>`; }

async function load_dashboard() {
    const stats = await admin_fetch('/api/admin/stats');
    document.getElementById('admin-stats').innerHTML = [
        stat_card('Productos', stats.products, 'en catálogo'),
        stat_card('Usuarios', stats.users, 'cuentas creadas'),
        stat_card('Favoritos', stats.favorites, 'guardados'),
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
        row.innerHTML = `<td>${product.id}</td><td><strong>${product.name}</strong><br><small>${product.size_ml} ml</small></td><td>${product.brand}</td><td>${product.gender}</td><td>${product.stock}</td><td>${format_price(product.price)}</td><td><div class="admin-actions"><button class="small-button edit-button">Editar</button><button class="small-button delete-button">Eliminar</button></div></td>`;
        row.querySelector('.edit-button').addEventListener('click', () => fill_form(product));
        row.querySelector('.delete-button').addEventListener('click', () => delete_product(product.id));
        tbody.appendChild(row);
    });
}

function fill_form(product) {
    document.getElementById('form-label').textContent = `EDITAR PRODUCTO #${product.id}`;
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
    document.getElementById('admin-users').innerHTML = users.map(user => `<tr><td>${user.id}</td><td>${user.name}</td><td>${user.email}</td><td>${user.is_admin ? 'Administrador' : 'Cliente'}</td><td>${new Date(user.created_at).toLocaleDateString('es-AR')}</td></tr>`).join('');
}

async function load_inquiries() {
    const inquiries = await admin_fetch('/api/admin/inquiries');
    document.getElementById('admin-inquiries').innerHTML = inquiries.map(item => `<tr><td>${new Date(item.created_at).toLocaleString('es-AR')}</td><td>${item.brand || ''} ${item.name || item.product_name}</td><td>${item.user_name || 'Visitante'}</td><td>${item.user_email || 'Sin correo'}</td></tr>`).join('');
}

async function load_admin_reviews() {
    const reviews = await admin_fetch('/api/admin/reviews');
    document.getElementById('admin-reviews').innerHTML = reviews.map(review => `<article class="review-card"><div class="review-stars">${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</div><p>“${review.comment}”</p><div class="review-author">${review.user_name}</div></article>`).join('');
}

function setup_tabs() {
    document.querySelectorAll('.admin-tab').forEach(button => button.addEventListener('click', async () => {
        document.querySelectorAll('.admin-tab').forEach(item => item.classList.remove('active'));
        document.querySelectorAll('.admin-tab-content').forEach(item => item.classList.remove('active'));
        button.classList.add('active');
        document.getElementById(`tab-${button.dataset.tab}`).classList.add('active');
        if (button.dataset.tab === 'usuarios') await load_users();
        if (button.dataset.tab === 'consultas') await load_inquiries();
        if (button.dataset.tab === 'opiniones') await load_admin_reviews();
    }));
}

document.addEventListener('DOMContentLoaded', async () => {
    if (!(await verify_admin())) return;
    document.getElementById('product-form').addEventListener('submit', save_product);
    document.getElementById('cancel-edit').addEventListener('click', reset_form);
    document.getElementById('logout-admin').addEventListener('click', async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/'; });
    setup_tabs();
    try { await Promise.all([load_dashboard(), load_admin_products()]); } catch (error) { show_toast(error.message); }
});
