const api = '/api';
let public_config_promise;

function get_public_config() {
    if (!public_config_promise) {
        public_config_promise = fetch(`${api}/config`).then(async response => {
            const data = await response.json();
            if (!response.ok) throw new Error('No se pudo cargar la configuración pública.');
            return data;
        });
    }
    return public_config_promise;
}

async function apply_public_config() {
    try {
        const config = await get_public_config();
        document.querySelectorAll('[data-whatsapp-link]').forEach(link => {
            link.href = `https://wa.me/${encodeURIComponent(config.whatsapp_number)}`;
        });
    } catch (error) {
        document.querySelectorAll('[data-whatsapp-link]').forEach(link => link.removeAttribute('href'));
    }
}

function format_price(value) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 0
    }).format(value);
}

function get_cart() {
    try {
        const stored = JSON.parse(localStorage.getItem('dreams_cart'));
        if (!Array.isArray(stored)) return [];
        return stored.flatMap(item => {
            const id = Number(item?.id);
            const price = Number(item?.price);
            const quantity = Number(item?.quantity);
            const stock = Number(item?.stock);
            if (!Number.isSafeInteger(id) || id <= 0 || !Number.isFinite(price) || price < 0 || !Number.isSafeInteger(quantity) || quantity <= 0) return [];
            return [{
                id,
                name: String(item.name ?? '').slice(0, 160),
                brand: String(item.brand ?? '').slice(0, 120),
                price,
                image_url: safe_image_url(item.image_url),
                quantity: Math.min(quantity, 99),
                size_ml: Number.isFinite(Number(item.size_ml)) ? Number(item.size_ml) : null,
                stock: Number.isSafeInteger(stock) && stock >= 0 ? stock : null
            }];
        });
    } catch (error) {
        return [];
    }
}

function save_cart(cart) {
    localStorage.setItem('dreams_cart', JSON.stringify(cart));
    update_cart_count();
}

function update_cart_count() {
    const count_element = document.getElementById('cart-count');
    if (!count_element) {
        return;
    }
    const cart = get_cart();
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    count_element.textContent = total;
}

function add_to_cart(product) {
    if (Number(product.stock) === 0) {
        show_toast('Este perfume está agotado.');
        return;
    }
    const cart = get_cart();
    const existing = cart.find(item => item.id === product.id);

    if (existing) {
        if (Number.isSafeInteger(existing.stock) && existing.quantity >= existing.stock) {
            show_toast('No hay más unidades disponibles.');
            return;
        }
        existing.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            brand: product.brand,
            price: product.price,
            image_url: product.image_url,
            quantity: 1,
            size_ml: product.size_ml,
            stock: product.stock
        });
    }

    save_cart(cart);
    show_toast(`${product.name} fue agregado al carrito.`);
}

function remove_from_cart(product_id) {
    const cart = get_cart().filter(item => item.id !== product_id);
    save_cart(cart);
}

function change_quantity(product_id, change) {
    const cart = get_cart();
    const item = cart.find(product => product.id === product_id);

    if (!item) {
        return;
    }

    item.quantity += change;

    if (Number.isSafeInteger(item.stock) && item.quantity > item.stock) {
        item.quantity = item.stock;
        show_toast('Alcanzaste el stock disponible.');
    }

    if (item.quantity <= 0) {
        remove_from_cart(product_id);
        return;
    }

    save_cart(cart);
}

let favorite_ids_promise;

function set_favorite_button(button, favorite) {
    button.classList.toggle('active', favorite);
    button.setAttribute('aria-label', favorite ? 'Quitar de favoritos' : 'Agregar a favoritos');
    button.setAttribute('aria-pressed', String(favorite));
    button.textContent = button.dataset.favoriteLabel === 'full' ? `${favorite ? '♥' : '♡'} Favorito` : favorite ? '♥' : '♡';
}

async function get_favorite_ids() {
    if (!favorite_ids_promise) {
        favorite_ids_promise = fetch(`${api}/favorites/ids`).then(async response => {
            if (response.status === 401) return new Set();
            const data = await response.json();
            if (!response.ok || !Array.isArray(data)) throw new Error(data.error || 'No se pudieron cargar favoritos.');
            return new Set(data.map(Number));
        }).catch(() => new Set());
    }
    return favorite_ids_promise;
}

async function sync_favorite_button(product_id, button) {
    const favorite_ids = await get_favorite_ids();
    set_favorite_button(button, favorite_ids.has(Number(product_id)));
}

async function toggle_favorite(product_id, button) {
    const desired_state = !button.classList.contains('active');
    button.disabled = true;
    try {
        const response = await fetch(`${api}/favorites/${product_id}`, {
            method: desired_state ? 'PUT' : 'DELETE'
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                show_toast('Iniciá sesión para guardar favoritos.');
                setTimeout(() => window.location.href = '/cuenta.html', 600);
                return;
            }
            throw new Error(data.error || 'No se pudo actualizar favoritos.');
        }

        set_favorite_button(button, data.favorite);
        const favorite_ids = await get_favorite_ids();
        if (data.favorite) favorite_ids.add(Number(product_id));
        else favorite_ids.delete(Number(product_id));
        show_toast(data.favorite ? 'Agregado a favoritos.' : 'Eliminado de favoritos.');
    } catch (error) {
        show_toast(error.message);
    } finally {
        button.disabled = false;
    }
}

function show_toast(message) {
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

function create_product_card(product) {
    const card = document.createElement('article');
    card.className = 'product-card';
    const stock_label = Number(product.stock) === 0 ? '<span class="stock-badge out">Agotado</span>' : Number(product.stock) <= 2 ? '<span class="stock-badge low">Últimas unidades</span>' : '<span class="stock-badge">Disponible</span>';
    card.innerHTML = `
        <div class="product-image-wrap">
            <button class="favorite-button" aria-label="Agregar a favoritos">♡</button>
            <a href="/producto.html?id=${encodeURIComponent(Number(product.id))}">
                <img src="${escape_html(safe_image_url(product.image_url))}" alt="${escape_html(`${product.brand} ${product.name}`)}" loading="lazy">
            </a>
        </div>
        <div class="product-info">
            <div class="brand-name">${escape_html(product.brand)}</div>
            <h3><a href="/producto.html?id=${encodeURIComponent(Number(product.id))}">${escape_html(product.name)}</a></h3>
            <div class="product-meta"><span>${escape_html(product.gender)}</span><span>${escape_html(product.size_ml)} ml</span></div>
            <div class="product-price">${format_price(product.price)}</div>
            <div class="product-actions">
                <button class="small-button dark add-cart-button" ${Number(product.stock) === 0 ? 'disabled' : ''}>${Number(product.stock) === 0 ? 'Agotado' : 'Agregar al carrito'}</button>
                <a class="small-button" href="/producto.html?id=${encodeURIComponent(Number(product.id))}">Ver perfume</a>
            </div>
        </div>
    `;

    attach_image_fallback(card.querySelector('img'));

    const favorite_button = card.querySelector('.favorite-button');
    favorite_button.addEventListener('click', event => {
        toggle_favorite(product.id, event.currentTarget);
    });
    sync_favorite_button(product.id, favorite_button);

    card.querySelector('.add-cart-button').addEventListener('click', () => {
        add_to_cart(product);
    });

    return card;
}

async function load_featured_products() {
    const container = document.getElementById('featured-products');
    if (!container) {
        return;
    }

    try {
        const response = await fetch(`${api}/products`);
        const products = await response.json();
        container.innerHTML = '';
        products.slice(0, 8).forEach(product => container.appendChild(create_product_card(product)));
    } catch (error) {
        container.innerHTML = '<p>No se pudieron cargar los perfumes.</p>';
    }
}

async function load_reviews() {
    const container = document.getElementById('reviews');
    if (!container) {
        return;
    }

    try {
        const response = await fetch(`${api}/reviews`);
        const reviews = await response.json();
        if (!response.ok || !Array.isArray(reviews)) throw new Error('No se pudieron cargar las opiniones.');
        container.innerHTML = '';

        reviews.slice(0, 3).forEach(review => {
            const card = document.createElement('article');
            card.className = 'review-card';
            card.innerHTML = `
                <div class="review-stars">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
                <p>“${escape_html(review.comment)}”</p>
                <div class="review-author">${escape_html(review.user_name)}</div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        container.innerHTML = '<p>No se pudieron cargar las opiniones.</p>';
    }
}

function get_recent_products() {
    try { return JSON.parse(localStorage.getItem('dreams_recent')) || []; } catch (error) { return []; }
}

function save_recent_product(product) {
    const recent = get_recent_products().filter(item => item.id !== product.id);
    recent.unshift({ id: product.id, name: product.name, brand: product.brand, price: product.price, image_url: product.image_url, stock: product.stock, size_ml: product.size_ml, gender: product.gender });
    localStorage.setItem('dreams_recent', JSON.stringify(recent.slice(0, 6)));
}

function render_recent_products() {
    const container = document.getElementById('recent-products');
    if (!container) return;
    const recent = get_recent_products();
    container.innerHTML = '';
    if (!recent.length) { container.innerHTML = '<p class="muted">Todavía no viste perfumes. Explorá el catálogo y acá van a aparecer.</p>'; return; }
    recent.forEach(product => container.appendChild(create_product_card(product)));
}

function setup_menu() {
    const toggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.main-nav');

    if (!toggle || !nav) {
        return;
    }

    toggle.addEventListener('click', () => {
        const open = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    });

    document.addEventListener('keydown', event => {
        if (event.key !== 'Escape' || !nav.classList.contains('open')) return;
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Abrir menú');
        toggle.focus();
    });
}

update_cart_count();
setup_menu();
apply_public_config();
load_featured_products();
load_reviews();
render_recent_products();
