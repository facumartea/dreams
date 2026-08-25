let catalog_products = [];

async function load_catalog() {
    await load_brands();
    await apply_catalog_filters();
}

async function load_brands() {
    const response = await fetch('/api/brands');
    const brands = await response.json();
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

    document.getElementById('search').addEventListener('input', debounce(apply_catalog_filters, 300));
    document.getElementById('brand-filter').addEventListener('change', apply_catalog_filters);
    document.getElementById('gender-filter').addEventListener('change', apply_catalog_filters);
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
