const filter_model = window.DreamsCatalogFilters;
let catalog_products = [], catalog_request_id = 0, brand_request_id = 0;
let applied_filters = { ...filter_model.defaults }, pending_filters = { ...applied_filters };
let catalog_brands = [], filter_scroll = null, brands_loading = true, brands_failed = false;

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

function update_catalog_theme(variant) {
    const page = document.querySelector('.catalog-page');
    const page_classes = Object.values(COLLECTION_VARIANTS).map(item => item.page_class);
    page.classList.remove(...page_classes);
    document.body.classList.remove('collection-themed', ...Object.values(COLLECTION_VARIANTS).map(item => item.body_class));
    if (!variant) return;
    page.classList.add(variant.page_class);
    document.body.classList.add('collection-themed', variant.body_class);
}

function update_catalog_metadata(gender) {
    const canonical = document.getElementById('canonical-url');
    const description = document.getElementById('catalog-description').textContent;
    const filtered = applied_filters.gender.length > 1 || [...new URLSearchParams(window.location.search).keys()].some(key => !['gender', 'utm_source', 'utm_medium', 'utm_campaign'].includes(key));
    const robots = document.querySelector('meta[name="robots"]');
    if (robots) robots.content = window.location.origin !== 'https://dreams-perfumes.pages.dev' ? 'noindex,nofollow' : filtered ? 'noindex,follow' : 'index,follow';
    document.querySelector('meta[name="description"]').content = description;
    if (canonical) canonical.href = `https://dreams-perfumes.pages.dev/catalogo.html${gender ? `?gender=${encodeURIComponent(gender)}` : ''}`;
    for (const [key, value] of Object.entries({ title: document.title, description, url: canonical?.href })) {
        const meta = document.querySelector(`meta[property="og:${key}"]`);
        if (meta && value) meta.content = value;
        const twitter = document.querySelector(`meta[name="twitter:${key}"]`);
        if (twitter && value) twitter.content = value;
    }
}

function update_catalog_context(gender) {
    const variant = COLLECTION_VARIANTS[gender] || null;
    window.DreamsNavigation?.update(variant ? gender : '');
    update_catalog_theme(variant);
    document.getElementById('catalog-eyebrow').textContent = variant?.eyebrow || 'COLECCIÓN DREAMS';
    document.getElementById('catalog-title').textContent = variant?.title || 'Perfumes';
    document.getElementById('catalog-description').textContent = variant?.description || 'Diseñador, algunos nichos seleccionados y una sola idea: encontrar tu firma.';
    document.title = variant?.document_title || 'Perfumes | DREAMS';
    update_catalog_metadata(variant ? gender : '');
}

function update_filter_badge() {
    const count = filter_model.count(applied_filters);
    const badge = document.getElementById('active-filter-count');
    badge.hidden = count === 0;
    badge.textContent = String(count);
    document.getElementById('open-filters').setAttribute('aria-label', count ? `Filtros, ${count} activos` : 'Filtros');
}

function restore_catalog_filters() {
    applied_filters = filter_model.parse(window.location.search);
    update_catalog_context(applied_filters.gender.length === 1 ? applied_filters.gender[0] : '');
    update_filter_badge();
}

async function apply_catalog_filters(sync_url = true) {
    const params = filter_model.params(applied_filters, window.location.search);
    const target = `/catalogo.html${params.size ? '?' + params.toString() : ''}`;
    if (sync_url && window.location.pathname + window.location.search !== target) history.pushState(null, '', target);
    update_catalog_context(applied_filters.gender.length === 1 ? applied_filters.gender[0] : '');
    update_filter_badge();
    await load_catalog();
}

function show_catalog_loading() {
    const container = document.getElementById('catalog-products');
    container.setAttribute('aria-busy', 'true');
    container.innerHTML = Array.from({ length: 8 }, () => '<div class="skeleton-card" aria-hidden="true"></div>').join('');
    document.getElementById('results-count').textContent = '…';
}

async function load_catalog() {
    const request_id = ++catalog_request_id;
    show_catalog_loading();
    try {
        const response = await fetch(`/api/products?${filter_model.params(applied_filters).toString()}`);
        const data = await response.json();
        if (request_id !== catalog_request_id) return;
        if (!response.ok || !Array.isArray(data)) throw new Error('Catálogo no disponible');
        catalog_products = data;
        render_catalog();
    } catch {
        if (request_id === catalog_request_id) catalog_error();
    } finally {
        if (request_id === catalog_request_id) document.getElementById('catalog-products').setAttribute('aria-busy', 'false');
    }
}

function catalog_error() {
    document.getElementById('results-count').textContent = '0';
    document.getElementById('catalog-products').innerHTML = '<div class="empty-state" role="alert"><h2>No pudimos cargar la colección.</h2><p>Revisá tu conexión e intentá nuevamente.</p><button id="retry-catalog" class="button button-dark" type="button">Reintentar</button></div>';
    document.getElementById('retry-catalog').addEventListener('click', load_catalog);
}

function render_catalog() {
    const container = document.getElementById('catalog-products');
    container.innerHTML = '';
    document.getElementById('results-count').textContent = catalog_products.length;
    if (!catalog_products.length) {
        container.innerHTML = '<div class="empty-state"><h2>No encontramos ese perfume.</h2><p>Probá con otra marca, familia o nombre.</p></div>';
        return;
    }
    catalog_products.forEach(product => container.appendChild(create_product_card(product)));
}

function read_pending_filters() {
    const form = document.getElementById('catalog-filter-form');
    const data = new FormData(form);
    const state = Object.fromEntries(data);
    for (const key of ['brand', 'gender']) state[key] = data.getAll(key);
    return filter_model.normalize(state);
}

function write_pending_filters(value) {
    pending_filters = { ...value };
    const form = document.getElementById('catalog-filter-form');
    for (const [key, input] of Object.entries({ search: 'search', max_price: 'max-price' })) document.getElementById(input).value = value[key];
    for (const key of ['brand', 'gender', 'category', 'sort']) {
        form.querySelectorAll(`input[name="${key}"]`).forEach(input => { input.checked = Array.isArray(value[key]) ? (input.value ? value[key].includes(input.value) : !value[key].length) : input.value === value[key]; });
    }
    document.getElementById('brand-search').value = '';
    search_brand_choices();
}

function lock_filter_scroll() {
    const style = document.body.style;
    filter_scroll = { y: window.scrollY, position: style.position, top: style.top, width: style.width, overflow: style.overflow };
    Object.assign(style, { position: 'fixed', top: `-${filter_scroll.y}px`, width: '100%', overflow: 'hidden' });
}

function restore_filter_scroll() {
    if (!filter_scroll) return;
    const { y, ...style } = filter_scroll;
    Object.assign(document.body.style, style);
    const behavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, y);
    document.documentElement.style.scrollBehavior = behavior;
    filter_scroll = null;
}

function size_filter_viewport() {
    const viewport = window.visualViewport;
    const available = viewport?.height || window.innerHeight;
    const mobile = window.matchMedia('(max-width:640px)').matches;
    const height = Math.max(0, mobile ? available - 16 : Math.min(available * .9, 900));
    const style = document.getElementById('catalog-filters').style;
    style.setProperty('--filter-height', `${height}px`);
    style.setProperty('--filter-top', `${(viewport?.offsetTop || 0) + Math.max(8, (available - height) / 2)}px`);
}

function setup_filter_viewport() {
    window.visualViewport?.addEventListener('resize', size_filter_viewport);
    window.visualViewport?.addEventListener('scroll', size_filter_viewport);
    window.addEventListener('resize', size_filter_viewport);
}

function open_catalog_filters() {
    const dialog = document.getElementById('catalog-filters');
    if (dialog.open) return;
    render_brand_choices(applied_filters.brand);
    write_pending_filters(applied_filters);
    size_filter_viewport();
    lock_filter_scroll();
    dialog.showModal();
    document.getElementById('search').focus({ preventScroll: true });
}

function close_catalog_filters() {
    restore_filter_scroll();
    document.getElementById('catalog-filters').close();
}

function filter_dialog_closed() {
    if (document.getElementById('catalog-filters').open) return;
    pending_filters = { ...applied_filters };
    restore_filter_scroll();
    document.getElementById('open-filters').focus({ preventScroll: true });
}

function contain_filter_focus(event) {
    // Escape debe cerrar incluso si el buscador nativo intentaría limpiar su texto.
    if (event.key === 'Escape') {
        event.preventDefault();
        close_catalog_filters();
        return;
    }
    if (event.key !== 'Tab') return;
    const controls = [...event.currentTarget.querySelectorAll('button, input')].filter(input => !input.disabled && input.getClientRects().length);
    const first = controls[0], last = controls.at(-1);
    const boundary = event.shiftKey ? first : last;
    if (document.activeElement !== boundary) return;
    event.preventDefault();
    (event.shiftKey ? last : first).focus();
}

function commit_catalog_filters(event) {
    event.preventDefault();
    if (!document.getElementById('catalog-filter-form').reportValidity()) return;
    applied_filters = read_pending_filters();
    close_catalog_filters();
    apply_catalog_filters();
}

function create_brand_choice(brand, selected) {
    const label = document.createElement('label');
    label.className = 'filter-choice';
    const input = document.createElement('input');
    input.type = 'checkbox'; input.name = 'brand'; input.value = brand; input.checked = brand ? selected.includes(brand) : !selected.length;
    const span = document.createElement('span');
    span.textContent = brand || 'Todas';
    label.append(input, span);
    return label;
}

function render_brand_choices(selected = []) {
    const container = document.getElementById('brand-options');
    const brands = [...new Set(['', ...catalog_brands, ...selected])];
    container.replaceChildren(...brands.map(brand => create_brand_choice(brand, selected)));
    container.setAttribute('aria-busy', String(brands_loading));
    show_brand_status(container);
    search_brand_choices();
}

function show_brand_status(container) {
    if (!brands_loading && !brands_failed) return;
    const message = document.createElement('p');
    message.setAttribute('role', brands_failed ? 'alert' : 'status');
    message.textContent = brands_failed ? 'No pudimos cargar las marcas.' : 'Cargando marcas…';
    container.appendChild(message);
    if (!brands_failed) return;
    const retry = document.createElement('button');
    retry.type = 'button'; retry.className = 'small-button'; retry.textContent = 'Reintentar marcas';
    retry.addEventListener('click', load_brands);
    container.appendChild(retry);
}

const fold_brand_name = value => value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('es').trim();

function search_brand_choices() {
    const search = fold_brand_name(document.getElementById('brand-search').value);
    let matches = 0;
    document.querySelectorAll('#brand-options .filter-choice').forEach(label => {
        const value = label.querySelector('input').value;
        label.hidden = Boolean(value) && !fold_brand_name(value).includes(search);
        if (value && !label.hidden) matches++;
    });
    document.getElementById('brand-search-status').textContent = search && !matches && !brands_loading && !brands_failed ? 'No se encontraron marcas.' : '';
}

function begin_brand_load() {
    const selected = document.getElementById('catalog-filters').open ? read_pending_filters().brand : applied_filters.brand;
    brands_loading = true; brands_failed = false;
    render_brand_choices(selected);
}

async function load_brands() {
    const request_id = ++brand_request_id;
    begin_brand_load();
    try {
        const response = await fetch('/api/brands');
        const data = await response.json();
        if (request_id !== brand_request_id) return;
        if (!response.ok || !Array.isArray(data)) throw new Error('Marcas no disponibles');
        brands_loading = false;
        catalog_brands = data.filter(value => typeof value === 'string' && value.trim());
        const selected = document.getElementById('catalog-filters').open ? read_pending_filters().brand : applied_filters.brand;
        render_brand_choices(selected);
    } catch {
        if (request_id !== brand_request_id) return;
        brands_loading = false; brands_failed = true;
        render_brand_choices(pending_filters.brand);
    }
}

function toggle_filter_group(event) {
    const input = event.target;
    if (!['brand', 'gender'].includes(input.name) || input.type !== 'checkbox') return;
    const group = [...event.currentTarget.querySelectorAll(`input[name="${input.name}"]`)];
    if (!input.value && input.checked) group.forEach(item => { if (item.value) item.checked = false; });
    const unrestricted = group.find(item => !item.value);
    unrestricted.checked = !group.some(item => item.value && item.checked);
}

function init_catalog_filters() {
    restore_catalog_filters();
    setup_filter_viewport();
    document.getElementById('open-filters').addEventListener('click', open_catalog_filters);
    document.getElementById('close-filters').addEventListener('click', close_catalog_filters);
    document.getElementById('catalog-filters').addEventListener('close', filter_dialog_closed);
    document.getElementById('catalog-filters').addEventListener('keydown', contain_filter_focus);
    document.getElementById('catalog-filter-form').addEventListener('submit', commit_catalog_filters);
    document.getElementById('catalog-filter-form').addEventListener('change', toggle_filter_group);
    document.getElementById('brand-search').addEventListener('input', search_brand_choices);
    document.getElementById('reset-filters').addEventListener('click', () => write_pending_filters(filter_model.defaults));
    window.addEventListener('popstate', () => {
        if (document.getElementById('catalog-filters').open) close_catalog_filters();
        restore_catalog_filters();
        load_catalog();
    });
    load_brands();
    load_catalog();
}

document.addEventListener('DOMContentLoaded', init_catalog_filters);
