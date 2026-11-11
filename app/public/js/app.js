// comparte las funciones de catalogo, carrito y navegacion que usan las pantallas publicas.
const api = '/api';
let public_config_promise;

function cargar_script_de_movimiento() {
    // esperar el html completo evita duplicar el script explicito del footer.
    if (document.querySelector('script[src="/js/motion.js"]')) return;
    const motion_script = document.createElement('script');
    motion_script.src = '/js/motion.js';
    motion_script.defer = true;
    document.head.appendChild(motion_script);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', cargar_script_de_movimiento, { once: true });
else cargar_script_de_movimiento();

function leer_configuracion_publica() {
    if (!public_config_promise) {
        public_config_promise = fetch(`${api}/config`).then(async respuesta => {
            const data = await respuesta.json();
            if (!respuesta.ok) throw new Error('No se pudo cargar la configuración pública.');
            return data;
        }).catch(error => { public_config_promise = undefined; throw error; });
    }
    return public_config_promise;
}

function crear_enlace_de_whatsapp(number, message = '') {
    const value = String(number ?? '').trim();
    if (!/^\d{8,15}$/.test(value)) return null;
    return `https://wa.me/${value}${message ? '?text=' + encodeURIComponent(message) : ''}`;
}
function actualizar_enlaces_de_whatsapp(config) {
    const href = crear_enlace_de_whatsapp(config.whatsapp_number);
    document.querySelectorAll('[data-whatsapp-link]').forEach(link => {
        if (href) { link.href = href; link.removeAttribute('aria-disabled'); }
        else { link.removeAttribute('href'); link.setAttribute('aria-disabled', 'true'); }
        if (href && link.hasAttribute('data-whatsapp-number')) {
            const phone = config.contacts?.phones?.find(value => String(value).replace(/\D/g, '') === config.whatsapp_number);
            link.textContent = `WhatsApp · ${phone || '+' + config.whatsapp_number}`;
        }
    });
}
function actualizar_correos_de_contacto(config) {
        document.querySelectorAll('[data-dreams-contacts]').forEach(container => {
            if (!Array.isArray(config.contacts?.emails)) return;
            container.querySelectorAll('a[href^="mailto:"]').forEach((link, index) => {
                const email = config.contacts.emails[index];
                if (typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { link.textContent = email; link.href = `mailto:${email}`; }
            });
        });
}
function actualizar_telefonos_de_contacto(config) {
        document.querySelectorAll('[data-contact-phones]').forEach(container => {
            if (!Array.isArray(config.contacts?.phones)) return;
            const phones = [...new Set(config.contacts.phones)].filter(value => typeof value === 'string' && /^\+?[\d ()-]+$/.test(value) && /^\d{8,15}$/.test(value.replace(/\D/g, '')));
            if (!phones.length) return;
            const links = phones.map(phone => { const link = document.createElement('a'); link.textContent = phone; link.href = `tel:+${phone.replace(/\D/g, '')}`; return link; });
            container.replaceChildren(...links);
        });
}
async function aplicar_configuracion_publica() {
    try {
        const config = await leer_configuracion_publica();
        actualizar_enlaces_de_whatsapp(config); actualizar_correos_de_contacto(config); actualizar_telefonos_de_contacto(config);
        document.querySelectorAll('[data-contact-email]').forEach(link => {
            link.textContent = config.contact_email; link.href = `mailto:${config.contact_email}`;
        });
    } catch { actualizar_enlaces_de_whatsapp({}); }
}

function formatear_precio(value) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 0
    }).format(value);
}

function validar_producto_del_visitante(item) {
    const id = Number(item?.id), price = Number(item?.price), quantity = Number(item?.quantity), stock = Number(item?.stock);
    if (!Number.isSafeInteger(id) || id <= 0 || !Number.isFinite(price) || price < 0 || !Number.isSafeInteger(quantity) || quantity <= 0) return [];
    return [{ id, name: String(item.name ?? '').slice(0, 160), brand: String(item.brand ?? '').slice(0, 120), price,
        image_url: elegir_url_de_imagen_segura(item.image_url), quantity: Math.min(quantity, 99),
        size_ml: Number.isFinite(Number(item.size_ml)) ? Number(item.size_ml) : null,
        stock: Number.isSafeInteger(stock) && stock >= 0 ? stock : null }];
}
function leer_carrito_del_visitante() {
    try { const stored = JSON.parse(localStorage.getItem('dreams_cart')); return Array.isArray(stored) ? stored.flatMap(validar_producto_del_visitante) : []; }
    catch { return []; }
}

// usa la cuenta activa si esta lista; el visitante usa su carrito local.
function leer_carrito() { return account_cart ? account_cart.get() : leer_carrito_del_visitante(); }
function guardar_carrito(cart, options = {}) {
    if (account_cart) account_cart.save(cart, options);
    else localStorage.setItem('dreams_cart', JSON.stringify(cart));
    actualizar_contador_del_carrito();
}
function vaciar_carrito() { guardar_carrito([]); }
var account_cart = window.crear_carrito_de_la_cuenta?.({
    request: async (path, body) => {
        const response = await fetch(path, body ? { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) } : {});
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'No se pudo guardar el carrito.');
        return data;
    },
    storage: sessionStorage,
    read_guest: leer_carrito_del_visitante,
    write_guest: cart => { if(cart.length) localStorage.setItem('dreams_cart', JSON.stringify(cart)); else localStorage.removeItem('dreams_cart'); },
    emit: message => { actualizar_contador_del_carrito(); window.dispatchEvent(new Event('dreams:cart')); if(message) mostrar_aviso(message); }
});
account_cart?.initialize().catch(()=>mostrar_aviso('No se pudo recuperar el carrito. Volvé a intentar.'));
window.addEventListener('online', ()=>account_cart?.ready().catch(()=>{}));
window.addEventListener('focus', ()=>account_cart?.initialize().catch(()=>{}));
window.addEventListener('pageshow', event=>{if(event.persisted)account_cart?.initialize().catch(()=>{});});
window.addEventListener('storage', event=>{if(event.key==='dreams_account_changed'){account_cart?.logout();account_cart?.initialize().catch(()=>{});}});

function actualizar_contador_del_carrito() {
    const count_element = document.getElementById('cart-count');
    if (!count_element) {
        return;
    }
    const cart = leer_carrito();
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    count_element.textContent = total;
}

function animar_acceso_al_carrito() {
    const link = document.querySelector('.cart-link');
    if (!link) return;
    link.classList.remove('is-updated'); void link.offsetWidth; link.classList.add('is-updated');
    setTimeout(() => link.classList.remove('is-updated'), 560);
}
// espera la sincronizacion antes de sumar; si falla, conserva el carrito sin mezclar cuentas.
async function agregar_perfume_al_carrito(product) {
    try { await account_cart?.ready(); } catch { mostrar_aviso('No se pudo sincronizar el carrito. Reintentá.'); return; }
    if (Number(product.stock) === 0) { mostrar_aviso('Este perfume está agotado.'); return; }
    const cart = leer_carrito(), existing = cart.find(item => item.id === product.id);
    if (existing) {
        if (Number.isSafeInteger(existing.stock) && existing.quantity >= existing.stock) { mostrar_aviso('No hay más unidades disponibles.'); return; }
        existing.quantity += 1;
    } else cart.push({ id: product.id, name: product.name, brand: product.brand, price: product.price, image_url: product.image_url, quantity: 1, size_ml: product.size_ml, stock: product.stock });
    guardar_carrito(cart); animar_acceso_al_carrito(); mostrar_aviso(`${product.name} fue agregado al carrito.`);
}

async function quitar_perfume_del_carrito(product_id) {
    try { await account_cart?.ready(); } catch { mostrar_aviso('No se pudo sincronizar el carrito. Reintentá.'); return; }
    const cart = leer_carrito().filter(item => item.id !== product_id);
    guardar_carrito(cart);
}

async function cambiar_cantidad_del_perfume(product_id, change) {
    try { await account_cart?.ready(); } catch { mostrar_aviso('No se pudo sincronizar el carrito. Reintentá.'); return; }
    const cart = leer_carrito(), item = cart.find(product => product.id === product_id);
    if (!item) return;
    item.quantity += change;
    if (Number.isSafeInteger(item.stock) && item.quantity > item.stock) { item.quantity = item.stock; mostrar_aviso('Alcanzaste el stock disponible.'); }
    if (item.quantity <= 0) { await quitar_perfume_del_carrito(product_id); return; }
    guardar_carrito(cart);
}

function mostrar_aviso(message) {
    const old_toast = document.querySelector('.toast');
    if (old_toast) {
        old_toast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 2800);
}

// escapa los textos del catalogo antes de insertarlos en html.
function crear_tarjeta_del_perfume(product) {
    const card = document.createElement('article');
    card.className = 'product-card';
    const stock_label = Number(product.stock) === 0 ? '<span class="stock-badge out">Agotado</span>' : Number(product.stock) <= 2 ? '<span class="stock-badge low">Últimas unidades</span>' : '<span class="stock-badge">Disponible</span>';
    card.innerHTML = `
        <div class="product-image-wrap">
            ${stock_label}
            <a href="/producto.html?id=${encodeURIComponent(Number(product.id))}">
                <img src="${escapar_texto_html(elegir_url_de_imagen_segura(product.image_url))}" alt="${escapar_texto_html(`${product.brand} ${product.name}`)}" loading="lazy">
            </a>
        </div>
        <div class="product-info">
            <div class="brand-name">${escapar_texto_html(product.brand)}</div>
            <h3><a href="/producto.html?id=${encodeURIComponent(Number(product.id))}">${escapar_texto_html(product.name)}</a></h3>
            <div class="product-meta"><span>${escapar_texto_html(product.gender)}</span><span>${escapar_texto_html(product.size_ml)} ml</span></div>
            <div class="product-price">${formatear_precio(product.price)}</div>
            <div class="product-actions">
                <button class="small-button dark add-cart-button" ${Number(product.stock) === 0 ? 'disabled' : ''}>${Number(product.stock) === 0 ? 'Agotado' : 'Agregar al carrito'}</button>
                <a class="small-button" href="/producto.html?id=${encodeURIComponent(Number(product.id))}">Ver perfume</a>
            </div>
        </div>
    `;

    preparar_imagen_alternativa(card.querySelector('img'));

    card.querySelector('.add-cart-button').addEventListener('click', () => {
        agregar_perfume_al_carrito(product);
    });

    return card;
}

// usa productos del catalogo y prepara el carrusel solo si existe su contenedor.
async function cargar_perfumes_destacados() {
    const container = document.getElementById('featured-products');
    if (!container) {
        return;
    }

    container.innerHTML = Array.from({ length: 4 }, () => '<div class="skeleton-card" aria-hidden="true"></div>').join('');

    try {
        const response = await fetch(`${api}/products?limit=8`);
        const products = await response.json();
        if (!response.ok || !Array.isArray(products)) throw new Error('No se pudieron cargar los perfumes.');
        container.innerHTML = '';
        const distinct = products.filter((product, index, all) => all.findIndex(item => item.id === product.id) === index);
        distinct.slice(0, 8).forEach(product => container.appendChild(crear_tarjeta_del_perfume(product)));
        if (typeof preparar_carrusel_de_perfumes === 'function') preparar_carrusel_de_perfumes(container);
    } catch (error) {
        container.innerHTML = '<p>No se pudieron cargar los perfumes.</p>';
    }
}

function preparar_menu() {
    const toggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.main-nav');

    if (!toggle || !nav) {
        return;
    }

    if (!nav.id) nav.id = 'main-navigation';
    toggle.setAttribute('aria-controls', nav.id);
    toggle.setAttribute('aria-expanded', 'false');

    toggle.addEventListener('click', () => {
        const open = nav.classList.toggle('open');
        document.body.classList.toggle('menu-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    });

    document.addEventListener('keydown', event => {
        if (event.key !== 'Escape' || !nav.classList.contains('open')) return;
        nav.classList.remove('open');
        document.body.classList.remove('menu-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Abrir menú');
        toggle.focus();
    });

    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
        nav.classList.remove('open');
        document.body.classList.remove('menu-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Abrir menú');
    }));
}

function preparar_cabecera_al_desplazarse() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    const actualizar_vista = () => {
        // el scroll fijo del dialogo no debe cambiar la altura del menu de fondo.
        if (document.querySelector('.filter-dialog[open]')) return;
        header.classList.toggle('is-scrolled', window.scrollY > 18);
    };
    actualizar_vista();
    window.addEventListener('scroll', actualizar_vista, { passive: true });
}


actualizar_contador_del_carrito();
preparar_menu();
preparar_cabecera_al_desplazarse();
window.DreamsNavigation?.update();
aplicar_configuracion_publica();
cargar_perfumes_destacados();
if (typeof dreams_reviews !== 'undefined') dreams_reviews.start();
