let catalog_products = [];
let catalog_request_id = 0;

const COLLECTION_VARIANTS = {
    mujer: {
        body_class: 'collection-women',
        page_class: 'is-women',
        eyebrow: 'COLECCIÓN',
        title: 'Fragancias Femeninas',
        description: 'Fragancias luminosas y envolventes, seleccionadas con una mirada cálida y editorial.',
        document_title: 'Fragancias Femeninas | DREAMS'
    },
    hombre: {
        body_class: 'collection-men',
        page_class: 'is-men',
        eyebrow: 'COLECCIÓN · DREAMS 02',
        title: 'Perfumes de Hombre',
        description: 'Una selección sobria y profunda, con carácter, precisión y presencia.',
        document_title: 'Perfumes de Hombre | DREAMS'
    },
    unisex: {
        body_class: 'collection-unisex',
        page_class: 'is-unisex',
        eyebrow: 'COLECCIÓN · DREAMS 03',
        title: 'Perfumes Unisex',
        description: 'Composiciones contemporáneas que priorizan la esencia por encima de las etiquetas.',
        document_title: 'Perfumes Unisex | DREAMS'
    }
};

function update_catalog_context(gender) {
    const page = document.querySelector('.catalog-page');
    const eyebrow = document.getElementById('catalog-eyebrow');
    const title = document.getElementById('catalog-title');
    const description = document.getElementById('catalog-description');
    const variant = COLLECTION_VARIANTS[gender] || null;
    const page_classes = Object.values(COLLECTION_VARIANTS).map(item => item.page_class);
    const body_classes = Object.values(COLLECTION_VARIANTS).map(item => item.body_class);

    page.classList.remove(...page_classes);
    document.body.classList.remove(...body_classes);
    if (variant) {
        page.classList.add(variant.page_class);
        document.body.classList.add('collection-themed', variant.body_class);
    } else {
        document.body.classList.remove('collection-themed');
    }

    eyebrow.textContent = variant?.eyebrow || 'COLECCIÓN DREAMS';
    title.textContent = variant?.title || 'Perfumes';
    description.textContent = variant?.description || 'Diseñador, algunos nichos seleccionados y una sola idea: encontrar tu firma.';
    document.title = variant?.document_title || 'Perfumes | DREAMS';
    const canonical = document.getElementById('canonical-url');
    if (canonical) canonical.href = `${window.location.origin}/catalogo.html${variant ? `?gender=${encodeURIComponent(gender)}` : ''}`;
    const og_title = document.querySelector('meta[property="og:title"]');
    const og_description = document.querySelector('meta[property="og:description"]');
    const og_url = document.querySelector('meta[property="og:url"]');
    if (og_title) og_title.content = document.title;
    if (og_description) og_description.content = description.textContent;
    if (og_url && canonical) og_url.content = canonical.href;
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
    const selected = select.value;
    select.length = 1;
    brands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        select.appendChild(option);
    });
    select.value = selected;
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

    const request_id = ++catalog_request_id;
    try {
        const response = await fetch(`/api/products?${params.toString()}`);
        const data = await response.json();
        if (request_id !== catalog_request_id) return;
        if (!response.ok || !Array.isArray(data)) throw new Error('No se pudo cargar el catálogo.');
        catalog_products = data;
        render_catalog();
    } catch {
        if (request_id !== catalog_request_id) return;
        document.getElementById('results-count').textContent = '0';
        document.getElementById('catalog-products').innerHTML = '<div class="empty-state"><h2>No pudimos cargar la colección.</h2><p>Revisá tu conexión e intentá nuevamente.</p><button id="retry-catalog" class="button button-dark" type="button">Reintentar</button></div>';
        document.getElementById('retry-catalog').addEventListener('click', apply_catalog_filters);
    }
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
