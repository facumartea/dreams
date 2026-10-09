(function (root) {
    'use strict';
    const genders = new Set(['mujer', 'hombre', 'unisex']);
    function selection(address, selected_gender) {
        const url = new URL(address, 'https://dreams.example');
        const path = url.pathname;
        if (path === '/' || path === '/index.html') return 'inicio';
        if (path === '/nosotros.html') return 'nosotros';
        if (path !== '/catalogo.html') return null;
        const gender = selected_gender === undefined ? url.searchParams.get('gender') : selected_gender;
        return genders.has(gender) ? gender : 'perfumes';
    }
    function update(selected_gender) {
        const current = selection(root.location.href, selected_gender);
        root.document.querySelectorAll('.main-nav a').forEach(link => {
            const target = new URL(link.href, root.location.origin);
            const key = selection(target.href);
            link.removeAttribute('aria-current');
            if (key) link.dataset.navTone = key;
            if (target.origin === root.location.origin && key === current && current !== null) {
                link.setAttribute('aria-current', genders.has(current) ? 'true' : 'page');
            }
        });
    }
    const navigation = { selection, update };
    if (typeof module === 'object' && module.exports) module.exports = navigation;
    else root.DreamsNavigation = navigation;
})(typeof window === 'object' ? window : globalThis);
