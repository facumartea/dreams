const api = '/api';

function format_price(value) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 0
    }).format(value);
}

function get_cart() {
    try {
        return JSON.parse(localStorage.getItem('dreams_cart')) || [];
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

    if (item.quantity <= 0) {
        remove_from_cart(product_id);
        return;
    }

    save_cart(cart);
}

async function toggle_favorite(product_id, button) {
    try {
        const response = await fetch(`${api}/favorites/${product_id}`, {
            method: 'POST'
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

        button.classList.toggle('active', data.favorite);
        button.textContent = data.favorite ? '♥' : '♡';
        show_toast(data.favorite ? 'Agregado a favoritos.' : 'Eliminado de favoritos.');
    } catch (error) {
        show_toast(error.message);
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
            <a href="/producto.html?id=${product.id}">
                <img src="${product.image_url}" alt="${product.brand} ${product.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1563170351-be82bc888aa4?auto=format&fit=crop&w=900&q=85'">
            </a>
        </div>
        <div class="product-info">
            <div class="brand-name">${product.brand}</div>
            <h3><a href="/producto.html?id=${product.id}">${product.name}</a></h3>
            <div class="product-meta"><span>${product.gender}</span><span>${product.size_ml} ml</span></div>
            <div class="product-price">${format_price(product.price)}</div>
            <div class="product-actions">
                <button class="small-button dark add-cart-button" ${Number(product.stock) === 0 ? 'disabled' : ''}>${Number(product.stock) === 0 ? 'Agotado' : 'Agregar al carrito'}</button>
                <a class="small-button" href="/producto.html?id=${product.id}">Ver perfume</a>
            </div>
        </div>
    `;

    card.querySelector('.favorite-button').addEventListener('click', event => {
        toggle_favorite(product.id, event.currentTarget);
    });

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

    const response = await fetch(`${api}/reviews`);
    const reviews = await response.json();
    container.innerHTML = '';

    reviews.slice(0, 3).forEach(review => {
        const card = document.createElement('article');
        card.className = 'review-card';
        card.innerHTML = `
            <div class="review-stars">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
            <p>“${review.comment}”</p>
            <div class="review-author">${review.user_name}</div>
        `;
        container.appendChild(card);
    });
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
        nav.classList.toggle('open');
    });
}

update_cart_count();
setup_menu();
load_featured_products();
load_reviews();
render_recent_products();
