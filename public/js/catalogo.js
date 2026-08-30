let catalog_products = [];

function update_catalog_context(gender) {
    const page = document.querySelector('.catalog-page');
    const eyebrow = document.getElementById('catalog-eyebrow');
    const title = document.getElementById('catalog-title');
    const description = document.getElementById('catalog-description');
    const is_women = gender === 'mujer';

    page.classList.toggle('is-women', is_women);
    eyebrow.textContent = is_women ? 'CURADURÍA FEMENINA · DREAMS' : 'DREAMS COLLECTION';
    title.textContent = is_women ? 'Perfumes de Mujer' : 'Perfumes';
    description.textContent = is_women
        ? 'Una selección floral, luminosa y envolvente, elegida con la misma mirada editorial de DREAMS.'
        : 'Diseñador, algunos nichos seleccionados y una sola idea: encontrar tu firma.';
    document.title = is_women ? 'Perfumes de Mujer | DREAMS' : 'Perfumes | DREAMS';
}

async function load_catalog() {
    const container = document.getElementById('catalog-products');
    container.innerHTML = Array.from({ length: 8 }, () => '<div class="skeleton-card" aria-hidden="true"></div>').join('');
    try {
        await load_brands();
        await apply_catalog_filters();
    } catch (error) {
        document.getElementById('results-count').textContent = '0';
        container.innerHTML = '<div class="empty-state"><h2>No pudimos cargar la colección.</h2><p>Revisá tu conexión e intentá nuevamente.</p><button id="retry-catalog" class="button button-dark" type="button">Reintentar</button></div>';
        document.getElementById('retry-catalog').addEventListener('click', load_catalog);
    }
}

async function load_brands() {
    const response = await fetch('/api/brands');
    const brands = await response.json();
    if (!response.ok || !Array.isArray(brands)) throw new Error('No se pudieron cargar las marcas.');
    const select = document.getElementById('brand-filter');
    brands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        select.appendChild(option);
    });
}

async function apply_catalog_filters() {
    const search = document.getElementById('search').value.trim();
    const brand = document.getElementById('brand-filter').value;
    const gender = document.getElementById('gender-filter').value;
    const category = document.getElementById('category-filter').value;
    const sort = document.getElementById('sort-filter').value;
    const max_price = document.getElementById('max-price').value;

    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (brand) params.set('brand', brand);
    if (gender) params.set('gender', gender);
    if (category) params.set('category', category);
    if (sort) params.set('sort', sort);
    if (max_price) params.set('max_price', max_price);

    const response = await fetch(`/api/products?${params.toString()}`);
    catalog_products = await response.json();
    if (!response.ok || !Array.isArray(catalog_products)) throw new Error('No se pudo cargar el catálogo.');
    render_catalog();
}

function render_catalog() {
    const container = document.getElementById('catalog-products');
    const count = document.getElementById('results-count');
    container.innerHTML = '';
    count.textContent = catalog_products.length;

    if (catalog_products.length === 0) {
        container.innerHTML = '<div class="empty-state"><h2>No encontramos ese perfume.</h2><p>Probá con otra marca, familia o nombre.</p></div>';
        return;
    }

    catalog_products.forEach(product => container.appendChild(create_product_card(product)));
}

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const initial_gender = params.get('gender');
    if (initial_gender) {
        document.getElementById('gender-filter').value = initial_gender;
    }
    update_catalog_context(initial_gender);

    document.getElementById('search').addEventListener('input', debounce(apply_catalog_filters, 300));
    document.getElementById('brand-filter').addEventListener('change', apply_catalog_filters);
    document.getElementById('gender-filter').addEventListener('change', event => {
        update_catalog_context(event.target.value);
        apply_catalog_filters();
    });
    document.getElementById('category-filter').addEventListener('change', apply_catalog_filters);
    document.getElementById('sort-filter').addEventListener('change', apply_catalog_filters);
    document.getElementById('max-price').addEventListener('input', debounce(apply_catalog_filters, 350));
    document.getElementById('reset-filters').addEventListener('click', () => {
        document.getElementById('search').value = '';
        document.getElementById('brand-filter').value = '';
        document.getElementById('gender-filter').value = '';
        document.getElementById('category-filter').value = '';
        document.getElementById('sort-filter').value = 'featured';
        document.getElementById('max-price').value = '';
        update_catalog_context('');
        apply_catalog_filters();
    });

    load_catalog();
});

function debounce(function_to_call, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => function_to_call(...args), delay);
    };
}
