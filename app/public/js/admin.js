// maneja los formularios del panel; solo muestra exito despues de comprobar el guardado en servidor.
function formatear_precio(value) { return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value); }

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
let uncertain_coupon_create = null;
let admin_reviews = [];
let editing_product_id = '';
let product_save_pending = false;
let uncertain_product_create = null;
let product_disabled_controls = new Map();
let product_image_preview_state = 'empty';
let product_image_preview_url = '';
let product_image_preview_token = 0;
let product_image_preview_timer;
let product_image_load_timer;
const IMAGE_URL_ERROR = 'La URL ingresada no apunta a una imagen válida o el servidor no permite mostrarla. Usá una URL HTTPS directa.';

function mostrar_aviso(message) {
    document.querySelector('.toast')?.remove();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.textContent = message;
    document.body.appendChild(toast);
    window.setTimeout(() => toast.remove(), 3200);
}

async function consultar_api_del_panel(url, options = {}) {
    let response;
    try { response = await fetch(url, options); }
    catch { throw new Error('No pudimos conectar con DREAMS. Revisá tu conexión e intentá nuevamente.'); }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Ocurrió un error.');
    return data;
}

async function ejecutar_con_boton_bloqueado(button, pending_label, action) {
    if (!button || button.disabled) return;
    const label = button.textContent;
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    button.textContent = pending_label;
    try { return await action(); }
    finally {
        button.disabled = button === document.querySelector('#product-form [type="submit"]') ? !es_la_imagen_actual() : false;
        button.removeAttribute('aria-busy');
        button.textContent = label;
    }
}

// consulta la sesion; el servidor sigue siendo quien decide si permite las operaciones.
async function verificar_acceso_al_panel() {
    try {
        const data = await consultar_api_del_panel('/api/auth/me');
        if (!data.user || !data.user.is_admin) { window.location.href = '/cuenta.html?admin=1'; return false; }
        return true;
    } catch (error) { window.location.href = '/cuenta.html?admin=1'; return false; }
}

const admin_modules = [
    ['productos', 'Productos', 'products', 'en catálogo'], ['usuarios', 'Usuarios', 'users', 'cuentas creadas'],
    ['consultas', 'Consultas', 'inquiries', 'por WhatsApp'], ['opiniones', 'Opiniones', 'reviews', 'publicadas'],
    ['pedidos', 'Pedidos', 'orders', 'registrados'], ['baja', 'Disponibilidad baja', 'low_stock', '0, 1 o 2 unidades'], ['cupones', 'Cupones', 'coupons', 'configurados']
];
function crear_tarjeta_de_estadistica(module, stats) {
    const [id, title, key, note] = module, selected = active_admin_module === id;
    return `<button type="button" class="admin-stat${selected ? ' active' : ''}" data-module="${id}" aria-controls="tab-${id === 'baja' ? 'productos' : id}" aria-pressed="${selected}"><span>${title}</span><strong>${escapar_texto_html(stats[key] ?? '—')}</strong><small>${note}</small><span class="admin-card-active"${selected ? '' : ' hidden'}>Módulo abierto</span></button>`;
}
function mostrar_resumen_del_panel(stats) {
    const focused = document.activeElement?.closest('[data-module]')?.dataset.module;
    document.getElementById('admin-stats').innerHTML = admin_modules.map(module => crear_tarjeta_de_estadistica(module, stats)).join('');
    actualizar_conteos_de_productos();
    if (focused) document.querySelector(`[data-module="${focused}"]`)?.focus({ preventScroll: true });
}
async function cargar_resumen_del_panel() {
    const epoch = ++dashboard_request, status = document.getElementById('admin-dashboard-status'), retry = document.getElementById('retry-admin-dashboard');
    try {
        const [stats, coupons] = await Promise.all([consultar_api_del_panel('/api/admin/stats'), consultar_api_del_panel('/api/admin/coupons')]);
        if (epoch !== dashboard_request) return;
        mostrar_resumen_del_panel({ ...stats, coupons: coupons.length }); status.textContent = ''; retry.hidden = true;
    } catch (error) {
        if (epoch !== dashboard_request) return;
        if (!document.querySelector('[data-module]')) mostrar_resumen_del_panel({});
        status.textContent = 'No pudimos actualizar los conteos. Podés reintentarlo; los módulos siguen disponibles.'; retry.hidden = false;
    }
}

function actualizar_conteos_de_productos() {
    if (admin_products_state !== 'ready') return;
    for (const [module, count] of [['productos', admin_products.length], ['baja', admin_products.filter(product => DreamsAdminProducts.low_stock(product.stock)).length]]) {
        const node = document.querySelector(`[data-module="${module}"] strong`); if (node) node.textContent = count;
    }
}
async function cargar_perfumes_del_panel() {
    const request_id = ++admin_products_request_id;
    admin_products_state = 'loading';
    mostrar_perfumes_del_panel();
    try {
        const products = await consultar_api_del_panel('/api/admin/products');
        if (request_id !== admin_products_request_id) return;
        if (!Array.isArray(products)) throw new Error('Listado de productos inválido.');
        admin_products = products;
        admin_products_state = 'ready';
        actualizar_conteos_de_productos();
    } catch (error) {
        if (request_id !== admin_products_request_id) return;
        admin_products_state = 'error';
    }
    mostrar_perfumes_del_panel();
}

function crear_fila_de_aviso(message) {
    const row = document.createElement('tr'), cell = document.createElement('td');
    cell.colSpan = 7; cell.textContent = message; row.appendChild(cell); return row;
}
function crear_fila_de_perfume_del_panel(product) {
    const row = document.createElement('tr'), stock = DreamsAdminProducts.valid_stock(product.stock) ? product.stock : '—';
    row.innerHTML = `<td>${escapar_texto_html(product.id)}</td><td><strong>${escapar_texto_html(product.name)}</strong><br><small>${escapar_texto_html(product.size_ml)} ml</small></td><td>${escapar_texto_html(product.brand)}</td><td>${escapar_texto_html(product.gender)}</td><td>${escapar_texto_html(stock)} <small>${DreamsAdminProducts.stock_label(product.stock)}</small></td><td>${escapar_texto_html(formatear_precio(product.price))}</td><td><div class="admin-actions"><button class="small-button admin-product-action edit-button">Editar</button><button class="small-button admin-product-action admin-product-action-danger delete-button">Eliminar</button></div></td>`;
    row.querySelector('.edit-button').addEventListener('click', () => completar_formulario_del_perfume(product));
    row.querySelector('.delete-button').addEventListener('click', event => eliminar_perfume(product.id, event.currentTarget));
    return row;
}
function mostrar_perfumes_del_panel() {
    const tbody = document.getElementById('admin-products'), status = document.getElementById('admin-products-status');
    document.getElementById('clear-product-search').disabled = !document.getElementById('admin-product-search').value && !applied_product_search;
    document.getElementById('retry-admin-products').hidden = admin_products_state !== 'error';
    document.getElementById('low-stock-status').hidden = !low_stock_only;
    tbody.setAttribute('aria-busy', String(admin_products_state === 'loading'));
    const products = DreamsAdminProducts.filter_products(admin_products, applied_product_search, low_stock_only);
    const ready = admin_products_state === 'ready';
    document.getElementById('product-total').textContent = ready ? `${products.length} de ${admin_products.length} productos` : '';
    status.textContent = !ready ? admin_products_state === 'loading' ? 'Cargando productos…' : 'No se pudieron cargar los productos. Volvé a intentar.' : products.length ? `${products.length} productos disponibles en el listado.` : 'No se encontraron productos';
    tbody.replaceChildren(...(ready && products.length ? products.map(crear_fila_de_perfume_del_panel) : [crear_fila_de_aviso(status.textContent)]));
}
function buscar_perfumes_del_panel(event) { event?.preventDefault(); applied_product_search = document.getElementById('admin-product-search').value.trim(); mostrar_perfumes_del_panel(); }
function limpiar_busqueda_de_perfumes() { document.getElementById('admin-product-search').value = ''; applied_product_search = ''; mostrar_perfumes_del_panel(); document.getElementById('admin-product-search').focus(); }
function hay_cambios_sin_guardar() { return product_form_baseline && JSON.stringify(leer_formulario_del_perfume()) !== product_form_baseline; }
function puede_reemplazar_el_perfume() { return !hay_cambios_sin_guardar() || confirm('Tenés cambios sin guardar. ¿Querés descartarlos?'); }

function completar_formulario_del_perfume(product) {
    if (product_save_pending) { mostrar_aviso('Esperá a que termine el guardado.'); return; }
    if (!puede_reemplazar_el_perfume()) return;
    uncertain_product_create = null;
    editing_product_id = String(product.id);
    document.getElementById('form-label').textContent = `EDITAR PRODUCTO #${product.id}`;
    document.getElementById('product-id').value = editing_product_id;
    for (const key of ['brand','name','gender','category','size_ml','price','stock','intensity','family','top_notes','heart_notes','base_notes','description','image_url']) document.getElementById(key).value = product[key] ?? '';
    document.getElementById('featured').checked = product.featured;
    product_form_baseline = JSON.stringify(leer_formulario_del_perfume());
    comprobar_vista_previa_de_imagen();
    document.getElementById('product-form').scrollIntoView({ block: 'start', behavior: 'auto' });
    document.getElementById('name').focus({ preventScroll: true });
}

function es_url_de_imagen_valida_para_el_panel(value) { return DreamsAdminImages.es_url_de_imagen_admitida(value); }

function es_la_imagen_actual() {
    return product_image_preview_state === 'valid' && product_image_preview_url === document.getElementById('image_url').value.trim();
}

function mostrar_estado_de_la_imagen(state, message = '') {
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
    if (submit) submit.disabled = product_save_pending || !es_la_imagen_actual();
    document.getElementById('retry-image-preview').hidden = state !== 'invalid' || !es_url_de_imagen_valida_para_el_panel(document.getElementById('image_url').value);
}

function confirmar_imagen_cargada(candidate, token) {
    if (token !== product_image_preview_token || candidate !== document.getElementById('image_url').value.trim()) return;
    window.clearTimeout(product_image_load_timer); product_image_preview_url = candidate;
    document.getElementById('image-preview-image').src = candidate;
    const warning = DreamsAdminImages.es_url_de_imagen_temporal(candidate) ? ' Este enlace es temporal o firmado y puede vencer. Preferí un enlace permanente.' : '';
    mostrar_estado_de_la_imagen('valid', 'Vista previa lista.' + warning);
}
function mostrar_error_de_imagen(token, message) {
    if (token !== product_image_preview_token) return;
    window.clearTimeout(product_image_load_timer); product_image_preview_token += 1;
    mostrar_estado_de_la_imagen('invalid', message);
}
// cada intento tiene un identificador para descartar respuestas de urls anteriores.
function comprobar_vista_previa_de_imagen() {
    window.clearTimeout(product_image_preview_timer); window.clearTimeout(product_image_load_timer);
    const candidate = document.getElementById('image_url').value.trim(), token = ++product_image_preview_token;
    if (!candidate) { mostrar_estado_de_la_imagen('invalid', 'Ingresá un enlace HTTPS directo a una imagen.'); return; }
    if (!es_url_de_imagen_valida_para_el_panel(candidate)) { mostrar_estado_de_la_imagen('invalid', /^http:/i.test(candidate) ? 'Usá HTTPS: los enlaces HTTP se bloquean en esta página.' : IMAGE_URL_ERROR); return; }
    mostrar_estado_de_la_imagen('pending', 'Comprobando imagen…');
    // cada intento usa su propia imagen: un evento de una url vieja no valida la nueva.
    const probe = new Image(); probe.referrerPolicy = 'no-referrer';
    probe.onload = () => confirmar_imagen_cargada(candidate, token);
    probe.onerror = () => mostrar_error_de_imagen(token, 'El enlace no cargó una imagen. Puede apuntar a una página, haber vencido o bloquear el acceso. Usá un enlace directo y permanente.');
    probe.src = candidate;
    product_image_load_timer = window.setTimeout(() => mostrar_error_de_imagen(token, 'La imagen tardó demasiado en cargar. Revisá tu conexión o reintentá.'), 6000);
}

function programar_revision_de_imagen() {
    product_image_preview_token += 1;
    window.clearTimeout(product_image_load_timer);
    mostrar_estado_de_la_imagen('pending', 'Comprobando imagen…');
    window.clearTimeout(product_image_preview_timer);
    product_image_preview_timer = window.setTimeout(comprobar_vista_previa_de_imagen, 250);
}

function leer_formulario_del_perfume() {
    const data = {};
    for (const key of ['brand','name','gender','category','size_ml','price','stock','intensity','family','top_notes','heart_notes','base_notes','description','image_url']) data[key] = document.getElementById(key).value;
    data.featured = document.getElementById('featured').checked;
    return data;
}

function indicar_guardado_en_curso(busy) {
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

function leer_campo_del_perfume(key, value) {
    if (['price', 'stock', 'size_ml', 'intensity'].includes(key)) return Number(value);
    if (key === 'featured') return value === true;
    return String(value ?? '').trim();
}

// compara todos los campos leidos, incluida la imagen, antes de anunciar exito.
async function comprobar_perfume_guardado(saved, expected) {
    if (!Number.isSafeInteger(Number(saved?.id)) || Number(saved.id) < 1) throw new Error('El servidor no confirmó el identificador del producto.');
    const products = await consultar_api_del_panel('/api/admin/products');
    const stored = Array.isArray(products) && products.find(product => Number(product.id) === Number(saved.id));
    const keys = Object.keys(expected);
    if (!stored || !keys.every(key => leer_campo_del_perfume(key, stored[key]) === leer_campo_del_perfume(key, expected[key]))) {
        throw new Error('No pudimos confirmar todos los cambios guardados. El formulario conserva tus datos.');
    }
}

function coincide_el_perfume_guardado(stored, expected) {
    return Object.keys(expected).every(key => leer_campo_del_perfume(key, stored[key]) === leer_campo_del_perfume(key, expected[key]));
}
async function preparar_alta_del_perfume(data) {
    const rows = await consultar_api_del_panel('/api/admin/products');
    if (!Array.isArray(rows)) throw new Error('No pudimos revisar el listado antes del alta. Reintentá la consulta.');
    const previous = uncertain_product_create;
    const identity = previous || data;
    const matches = rows.filter(row => String(row.brand).trim() === identity.brand.trim() && String(row.name).trim() === identity.name.trim());
    if (matches.length && (!previous || matches.length !== 1 || !coincide_el_perfume_guardado(matches[0], previous))) {
        throw new Error('Ya existe un producto con esa marca y nombre. Revisá el listado y editalo desde allí.');
    }
    if (matches.length === 1) return matches[0].id;
    uncertain_product_create = { ...data };
    return '';
}
async function enviar_guardado_del_perfume(id, data) {
    if (id && uncertain_product_create && coincide_el_perfume_guardado(data, uncertain_product_create)) return { id };
    return consultar_api_del_panel(id ? `/api/admin/products/${id}` : '/api/admin/products', { method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
}
// confirma la escritura con otra lectura; una respuesta perdida no debe duplicar un alta.
async function confirmar_guardado_del_perfume(id, data) {
    indicar_guardado_en_curso(true);
    try {
        const resolved = id || await preparar_alta_del_perfume(data);
        const saved = await enviar_guardado_del_perfume(resolved, data);
        await comprobar_perfume_guardado(saved, data);
        uncertain_product_create = null;
        limpiar_formulario_del_perfume(true);
        document.getElementById('admin-message').textContent = id ? 'Producto actualizado correctamente.' : resolved ? 'Alta anterior recuperada y cambios confirmados.' : 'Producto creado correctamente.';
        await Promise.all([cargar_resumen_del_panel(), cargar_perfumes_del_panel()]);
    } catch (error) { document.getElementById('admin-message').textContent = `${error.message} Revisá el listado antes de repetir un alta si no pudimos confirmar el guardado.`; }
    finally { indicar_guardado_en_curso(false); }
}
// valida formulario e imagen antes de enviar; evita dos guardados simultaneos.
async function guardar_perfume(event) {
    event.preventDefault();
    if (product_save_pending || !event.currentTarget.reportValidity()) return;
    if (!es_la_imagen_actual()) { document.getElementById('admin-message').textContent = IMAGE_URL_ERROR; comprobar_vista_previa_de_imagen(); return; }
    const id = editing_product_id || document.getElementById('product-id').value, data = leer_formulario_del_perfume(); data.image_url = data.image_url.trim();
    await ejecutar_con_boton_bloqueado(event.submitter || event.currentTarget.querySelector('[type="submit"]'), 'Guardando…', () => confirmar_guardado_del_perfume(id, data));
}

async function eliminar_perfume(id, button) {
    if (product_save_pending) { mostrar_aviso('Esperá a que termine la operación del producto.'); return; }
    if (!confirm('¿Seguro que querés eliminar este perfume? Esta acción es permanente.')) return;
    await ejecutar_con_boton_bloqueado(button, 'Eliminando…', async () => {
        indicar_guardado_en_curso(true);
        try {
            await eliminar_registro_del_panel('products', id);
            if (String(editing_product_id) === String(id)) limpiar_formulario_del_perfume(true);
            await Promise.all([cargar_resumen_del_panel(), cargar_perfumes_del_panel()]);
            mostrar_aviso('Producto eliminado.');
        } catch (error) { mostrar_aviso(error.message); }
        finally { indicar_guardado_en_curso(false); }
    });
}

function limpiar_formulario_del_perfume(force = false) {
    if (product_save_pending && force !== true) return;
    if (force !== true && !puede_reemplazar_el_perfume()) return;
    editing_product_id = '';
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
    uncertain_product_create = null;
    document.getElementById('form-label').textContent = 'NUEVO PRODUCTO';
    document.getElementById('admin-message').textContent = '';
    product_image_preview_token += 1;
    window.clearTimeout(product_image_preview_timer);
    window.clearTimeout(product_image_load_timer);
    mostrar_estado_de_la_imagen('empty');
    product_form_baseline = JSON.stringify(leer_formulario_del_perfume());
}

async function cargar_usuarios() {
    const users = await consultar_api_del_panel('/api/admin/users');
    document.getElementById('admin-users').innerHTML = users.map(user => `<tr><td>${escapar_texto_html(user.id)}</td><td>${escapar_texto_html(user.name)}</td><td>${escapar_texto_html(user.email || 'No disponible')}</td><td>${user.is_admin ? 'Administrador' : 'Cliente'}</td><td>${escapar_texto_html(new Date(user.created_at).toLocaleDateString('es-AR'))}</td></tr>`).join('');
}

async function cargar_consultas() {
    const inquiries = await consultar_api_del_panel('/api/admin/inquiries');
    document.getElementById('admin-inquiries').innerHTML = inquiries.map(item => `<tr><td>${escapar_texto_html(new Date(item.created_at).toLocaleString('es-AR'))}</td><td>${escapar_texto_html(`${item.brand || ''} ${item.name || item.product_name}`.trim())}</td><td>${escapar_texto_html(item.user_name || 'Visitante')}</td><td>${escapar_texto_html(item.user_email || 'Sin correo')}</td></tr>`).join('');
}

async function cargar_opiniones_del_panel() {
    admin_reviews = await consultar_api_del_panel('/api/admin/reviews');
    mostrar_opiniones_del_panel();
}

function mostrar_opiniones_del_panel() {
    const search = document.getElementById('review-search').value.trim().toLowerCase();
    const reviews = admin_reviews.filter(review => `${review.user_name} ${review.comment}`.toLowerCase().includes(search));
    const container = document.getElementById('admin-reviews');
    if (!reviews.length) {
        container.innerHTML = '<div class="empty-state"><h3>No hay opiniones para mostrar.</h3></div>';
        return;
    }
    container.innerHTML = reviews.map(review => `<article class="review-card admin-review-card" data-review-id="${escapar_texto_html(review.id)}"><div class="review-author">${escapar_texto_html(review.user_name)}</div><small>${escapar_texto_html(new Date(review.created_at).toLocaleString('es-AR'))}</small><label>Puntuación<select class="review-rating" aria-label="Puntuación de ${escapar_texto_html(review.user_name)}">${[1,2,3,4,5].map(value => `<option value="${value}" ${value === Number(review.rating) ? 'selected' : ''}>${value} / 5</option>`).join('')}</select></label><label>Comentario<textarea class="review-comment" maxlength="1000">${escapar_texto_html(review.comment)}</textarea></label><div class="admin-actions"><button class="small-button review-save" type="button">Guardar</button><button class="small-button review-delete" type="button">Eliminar</button></div><p class="form-message review-message" role="status" aria-live="polite"></p></article>`).join('');
    container.querySelectorAll('.admin-review-card').forEach(card => {
        const id = card.dataset.reviewId;
        card.querySelector('.review-save').addEventListener('click', event => guardar_opinion(id, card, event.currentTarget));
        card.querySelector('.review-delete').addEventListener('click', event => eliminar_opinion(id, event.currentTarget));
    });
}

function leer_valor_del_registro(key, value) {
    if (['rating', 'discount_percent'].includes(key)) return Number(value);
    if (key === 'active') return value === true;
    return String(value ?? '').trim();
}
async function comprobar_registro_guardado(kind, saved, expected) {
    const id = Number(saved?.id);
    if (!['coupons', 'reviews'].includes(kind) || !Number.isSafeInteger(id) || id < 1) throw new Error('No se confirmó el identificador guardado.');
    const rows = await consultar_api_del_panel(`/api/admin/${kind}`);
    const matches = Array.isArray(rows) ? rows.filter(row => Number(row.id) === id) : [];
    if (matches.length !== 1 || !Object.keys(expected).every(key => leer_valor_del_registro(key, matches[0][key]) === leer_valor_del_registro(key, expected[key]))) {
        throw new Error('No pudimos confirmar los cambios guardados. Los datos del formulario se conservan.');
    }
    return matches[0];
}
async function comprobar_eliminacion_del_registro(kind, id) {
    const rows = await consultar_api_del_panel(`/api/admin/${kind}`);
    if (!Array.isArray(rows) || rows.some(row => String(row.id) === String(id))) throw new Error('No pudimos confirmar la eliminación. Revisá el listado antes de reintentar.');
}
async function eliminar_registro_del_panel(kind, id) {
    try { await consultar_api_del_panel(`/api/admin/${kind}/${id}`, { method: 'DELETE' }); }
    catch { await comprobar_eliminacion_del_registro(kind, id); return; }
    await comprobar_eliminacion_del_registro(kind, id);
}


async function guardar_opinion(id, card, button) {
    await ejecutar_con_boton_bloqueado(button, 'Guardando…', async () => {
        const message = card.querySelector('.review-message');
        try {
            const data = { rating: card.querySelector('.review-rating').value, comment: card.querySelector('.review-comment').value };
            const saved = await consultar_api_del_panel(`/api/admin/reviews/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
            const updated = await comprobar_registro_guardado('reviews', saved, data);
            admin_reviews = admin_reviews.map(review => String(review.id) === String(id) ? updated : review);
            message.textContent = 'Opinión actualizada.';
        } catch (error) { message.textContent = error.message; }
    });
}

async function eliminar_opinion(id, button) {
    if (!confirm('¿Seguro que querés eliminar esta opinión? Esta acción es permanente.')) return;
    await ejecutar_con_boton_bloqueado(button, 'Eliminando…', async () => {
        try {
            await eliminar_registro_del_panel('reviews', id);
            admin_reviews = admin_reviews.filter(review => String(review.id) !== String(id));
            mostrar_opiniones_del_panel();
            mostrar_aviso('Opinión eliminada.');
            await cargar_resumen_del_panel();
        } catch (error) { mostrar_aviso(error.message); }
    });
}

function mostrar_estado_del_pedido(value) {
    return ({ created: 'Creado', approved: 'Aprobado', rejected: 'Rechazado', pending: 'Pendiente', cancelled: 'Cancelado', error: 'Error' })[value] || 'Estado no reconocido';
}

function mostrar_nombre_del_proveedor(value) {
    return ({ mercado_pago: 'Mercado Pago', demo: 'Simulación de prueba', presentation_demo: 'Presentación académica' })[value] || 'Proveedor no reconocido';
}

async function cargar_pedidos() {
    const orders = await consultar_api_del_panel('/api/admin/orders');
    document.getElementById('order-total').textContent = `${orders.length} pedidos`;
    document.getElementById('admin-orders').innerHTML = orders.map(order => `<tr><td><strong>${escapar_texto_html(order.order_number)}</strong></td><td>${escapar_texto_html(new Date(order.created_at).toLocaleString('es-AR'))}</td><td><span class="status-pill">${escapar_texto_html(mostrar_estado_del_pedido(order.status))}</span></td><td>${escapar_texto_html(mostrar_nombre_del_proveedor(order.provider))}</td><td>${escapar_texto_html(order.coupon_code || '—')}</td><td>${escapar_texto_html(formatear_precio(order.total))}</td><td>${escapar_texto_html(Array.isArray(order.items) ? order.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0) : 0)}</td></tr>`).join('');
}

async function cargar_cupones_del_panel() {
    admin_coupons = await consultar_api_del_panel('/api/admin/coupons');
    const count = document.querySelector('[data-module="cupones"] strong'); if (count) count.textContent = admin_coupons.length;
    const tbody = document.getElementById('admin-coupons');
    document.getElementById('coupon-total').textContent = `${admin_coupons.length} cupones`;
    tbody.innerHTML = '';
    admin_coupons.forEach(coupon => {
        const row = document.createElement('tr');
        row.innerHTML = `<td><strong>${escapar_texto_html(coupon.code)}</strong></td><td>${escapar_texto_html(coupon.discount_percent)}%</td><td><span class="status-pill ${coupon.active ? 'is-active' : 'is-inactive'}">${coupon.active ? 'Activo' : 'Inactivo'}</span></td><td>${escapar_texto_html(new Date(coupon.updated_at).toLocaleDateString('es-AR'))}</td><td><div class="admin-actions"><button class="small-button coupon-toggle">${coupon.active ? 'Desactivar' : 'Activar'}</button><button class="small-button coupon-edit">Editar</button><button class="small-button coupon-delete">Eliminar</button></div></td>`;
        row.querySelector('.coupon-toggle').addEventListener('click', event => ejecutar_con_boton_bloqueado(event.currentTarget, 'Guardando…', () => guardar_valor_del_cupon(coupon, { ...coupon, active: !coupon.active })));
        row.querySelector('.coupon-edit').addEventListener('click', () => completar_formulario_del_cupon(coupon));
        row.querySelector('.coupon-delete').addEventListener('click', event => ejecutar_con_boton_bloqueado(event.currentTarget, 'Eliminando…', () => eliminar_cupon(coupon.id)));
        tbody.appendChild(row);
    });
}

function completar_formulario_del_cupon(coupon) {
    uncertain_coupon_create = null;
    document.getElementById('coupon-form-label').textContent = `EDITAR CUPÓN ${coupon.code}`;
    document.getElementById('coupon-id').value = coupon.id;
    document.getElementById('admin-coupon-code').value = coupon.code;
    document.getElementById('coupon-percent').value = coupon.discount_percent;
    document.getElementById('coupon-active').checked = coupon.active;
    document.getElementById('admin-coupon-code').focus();
}

function limpiar_formulario_del_cupon() {
    uncertain_coupon_create = null;
    document.getElementById('coupon-form').reset();
    document.getElementById('coupon-id').value = '';
    document.getElementById('coupon-active').checked = true;
    document.getElementById('coupon-form-label').textContent = 'NUEVO CUPÓN';
    document.getElementById('coupon-message').textContent = '';
}

async function guardar_valor_del_cupon(current, value) {
    try {
        const data = { code: value.code, discount_percent: value.discount_percent, active: value.active };
        const saved = await consultar_api_del_panel(`/api/admin/coupons/${current.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        await comprobar_registro_guardado('coupons', saved, data);
        await cargar_cupones_del_panel();
        mostrar_aviso(value.active ? 'Cupón activado.' : 'Cupón desactivado.');
    } catch (error) { mostrar_aviso(error.message); }
}

async function preparar_alta_del_cupon(data) {
    const rows = await consultar_api_del_panel('/api/admin/coupons');
    if (!Array.isArray(rows)) throw new Error('No pudimos revisar los cupones antes del alta.');
    const previous = uncertain_coupon_create, identity = previous || data;
    const matches = rows.filter(row => row.code === identity.code.trim());
    if (matches.length && (!previous || matches.length !== 1 || !Object.keys(previous).every(key => leer_valor_del_registro(key, matches[0][key]) === leer_valor_del_registro(key, previous[key])))) {
        throw new Error('Ya existe un cupón con ese código. Revisá el listado antes de repetir el alta.');
    }
    if (matches.length === 1) return matches[0].id;
    uncertain_coupon_create = { ...data };
    return '';
}
async function enviar_guardado_del_cupon(id, data) {
    const resolved = id || await preparar_alta_del_cupon(data);
    if (resolved && uncertain_coupon_create && Object.keys(data).every(key => leer_valor_del_registro(key, data[key]) === leer_valor_del_registro(key, uncertain_coupon_create[key]))) return { id: resolved };
    return consultar_api_del_panel(resolved ? `/api/admin/coupons/${resolved}` : '/api/admin/coupons', { method: resolved ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
}

async function guardar_cupon(event) {
    event.preventDefault();
    return ejecutar_con_boton_bloqueado(event.currentTarget.querySelector('[type="submit"]'), 'Guardando…', async () => {
        const id = document.getElementById('coupon-id').value;
        const data = { code: document.getElementById('admin-coupon-code').value.toUpperCase(), discount_percent: document.getElementById('coupon-percent').value, active: document.getElementById('coupon-active').checked };
        try {
            const saved = await enviar_guardado_del_cupon(id, data);
            await comprobar_registro_guardado('coupons', saved, data);
            await cargar_cupones_del_panel();
            const message = id ? 'Cupón actualizado.' : 'Cupón creado.';
            limpiar_formulario_del_cupon();
            document.getElementById('coupon-message').textContent = message;
        } catch (error) { document.getElementById('coupon-message').textContent = error.message; }
    });
}

async function eliminar_cupon(id) {
    if (!confirm('¿Seguro que querés eliminar este cupón? Los pedidos anteriores conservarán el código y descuento aplicado.')) return;
    try { await eliminar_registro_del_panel('coupons', id); mostrar_aviso('Cupón eliminado.'); limpiar_formulario_del_cupon(); await cargar_cupones_del_panel(); } catch (error) { mostrar_aviso(error.message); }
}

function modulo_elegido(id) {
    active_admin_module = id; low_stock_only = id === 'baja';
    document.querySelectorAll('[data-module]').forEach(button => {
        const active = button.dataset.module === id; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); button.querySelector('.admin-card-active').hidden = !active;
    });
    document.querySelectorAll('.admin-tab-content').forEach(section => section.classList.toggle('active', section.id === `tab-${id === 'baja' ? 'productos' : id}`));
}
async function abrir_modulo_del_panel(id, focus = true) {
    if (!admin_modules.some(module => module[0] === id)) return;
    const epoch = ++admin_module_request; modulo_elegido(id);
    const status = document.getElementById('admin-module-status'), retry = document.getElementById('retry-admin-module');
    status.textContent = 'Cargando módulo…'; retry.hidden = true;
    try {
        const loaders = { productos: cargar_perfumes_del_panel, baja: cargar_perfumes_del_panel, usuarios: cargar_usuarios, pedidos: cargar_pedidos, cupones: cargar_cupones_del_panel, consultas: cargar_consultas, opiniones: cargar_opiniones_del_panel };
        await loaders[id](); if (epoch !== admin_module_request) return;
        status.textContent = '';
        const section = document.getElementById(`tab-${id === 'baja' ? 'productos' : id}`); section.tabIndex = -1;
        if (focus) { section.focus({ preventScroll: true }); section.scrollIntoView({ block: 'start', behavior: 'auto' }); }
    } catch (error) { if (epoch === admin_module_request) { status.textContent = error.message; retry.hidden = false; } }
}
function preparar_pestanas() {
    document.getElementById('retry-admin-dashboard').addEventListener('click', cargar_resumen_del_panel);
    document.getElementById('admin-stats').addEventListener('click', event => { const button = event.target.closest('[data-module]'); if (button) abrir_modulo_del_panel(button.dataset.module); });
    document.getElementById('retry-admin-module').addEventListener('click', () => abrir_modulo_del_panel(active_admin_module));
    document.getElementById('show-all-products').addEventListener('click', () => abrir_modulo_del_panel('productos'));
}
function preparar_controles_de_productos() {
    document.getElementById('admin-search-form').addEventListener('submit', buscar_perfumes_del_panel);
    document.getElementById('admin-product-search').addEventListener('input', () => { document.getElementById('clear-product-search').disabled = !document.getElementById('admin-product-search').value && !applied_product_search; });
    document.getElementById('clear-product-search').addEventListener('click', limpiar_busqueda_de_perfumes);
    document.getElementById('retry-admin-products').addEventListener('click', cargar_perfumes_del_panel);
    document.getElementById('product-form').addEventListener('submit', guardar_perfume);
    document.getElementById('image_url').addEventListener('input', programar_revision_de_imagen);
    document.getElementById('retry-image-preview').addEventListener('click', comprobar_vista_previa_de_imagen);
    document.getElementById('cancel-edit').addEventListener('click', () => limpiar_formulario_del_perfume());
    product_form_baseline = JSON.stringify(leer_formulario_del_perfume()); mostrar_estado_de_la_imagen('empty');
    window.addEventListener('beforeunload', event => { if (hay_cambios_sin_guardar() && !product_save_pending) { event.preventDefault(); event.returnValue = ''; } });
}

async function iniciar_panel() {
    if (!(await verificar_acceso_al_panel())) return;
    const config = await consultar_api_del_panel('/api/config').catch(() => ({}));
    if (config.preview_read_only && !config.admin_writes_enabled) {
        const notice = document.createElement('p'); notice.className = 'form-message'; notice.setAttribute('role', 'status');
        notice.textContent = 'Vista de revisión: las escrituras están protegidas. Los datos se consultan sin modificarlos.';
        document.querySelector('main')?.prepend(notice);
    }
    preparar_controles_de_productos();
    preparar_controles_del_panel();
    preparar_pestanas();
    try { await Promise.all([cargar_resumen_del_panel(), cargar_perfumes_del_panel()]); } catch (error) { mostrar_aviso(error.message); }
}
function preparar_controles_del_panel() {
    document.getElementById('coupon-form').addEventListener('submit', guardar_cupon);
    document.getElementById('cancel-coupon-edit').addEventListener('click', limpiar_formulario_del_cupon);
    const coupon_code = document.getElementById('admin-coupon-code');
    coupon_code.addEventListener('input', () => { coupon_code.value = coupon_code.value.toUpperCase(); });
    document.getElementById('review-search').addEventListener('input', mostrar_opiniones_del_panel);
    document.getElementById('logout-admin').addEventListener('click', event => ejecutar_con_boton_bloqueado(event.currentTarget, 'Cerrando…', async () => {
        try { await consultar_api_del_panel('/api/auth/logout', { method: 'POST' }); window.location.href = '/'; }
        catch (error) { mostrar_aviso(error.message); }
    }));
}
document.addEventListener('DOMContentLoaded', iniciar_panel);
