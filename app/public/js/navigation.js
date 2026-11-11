'use strict';
{
    const root = typeof window === 'object' ? window : globalThis;
    const genders = new Set(['mujer', 'hombre', 'unisex']);
    function requested_gender(url) {
        const values = url.searchParams.getAll('gender').flatMap(value => {
            try { const parsed = value.startsWith('[') ? JSON.parse(value) : [value]; return Array.isArray(parsed) ? parsed : []; }
            catch { return []; }
        });
        const selected = [...new Set(values.filter(value => genders.has(value)))];
        return selected.length === 1 ? selected[0] : '';
    }
    function selection(address, selected_gender) {
        const url = new URL(address, 'https://dreams.example');
        const path = url.pathname;
        if (path === '/' || path === '/index.html') return 'inicio';
        if (path === '/nosotros.html') return 'nosotros';
        if (path !== '/catalogo.html') return null;
        const gender = selected_gender === undefined ? requested_gender(url) : selected_gender;
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
}
