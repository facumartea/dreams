// mantiene accesible el menu y permite cerrarlo sin perder el foco del teclado.
'use strict';
{
    const root = typeof window === 'object' ? window : globalThis;
    const genders = new Set(['mujer', 'hombre', 'unisex']);
    function leer_genero_solicitado(url) {
        const values = url.searchParams.getAll('gender').flatMap(value => {
            try { const parsed = value.startsWith('[') ? JSON.parse(value) : [value]; return Array.isArray(parsed) ? parsed : []; }
            catch { return []; }
        });
        const selected = [...new Set(values.filter(value => genders.has(value)))];
        return selected.length === 1 ? selected[0] : '';
    }
    function preparar_seleccion(address, selected_gender) {
        const url = new URL(address, 'https://dreams.example');
        const path = url.pathname;
        if (path === '/' || path === '/index.html') return 'inicio';
        if (path === '/nosotros.html') return 'nosotros';
        if (path !== '/catalogo.html') return null;
        const gender = selected_gender === undefined ? leer_genero_solicitado(url) : selected_gender;
        return genders.has(gender) ? gender : 'perfumes';
    }
    function actualizar_vista(selected_gender) {
        const current = preparar_seleccion(root.location.href, selected_gender);
        root.document.querySelectorAll('.main-nav a').forEach(link => {
            const target = new URL(link.href, root.location.origin);
            const key = preparar_seleccion(target.href);
            link.removeAttribute('aria-current');
            if (key) link.dataset.navTone = key;
            if (target.origin === root.location.origin && key === current && current !== null) {
                link.setAttribute('aria-current', genders.has(current) ? 'true' : 'page');
            }
        });
    }
    const navigation = { selection: preparar_seleccion, update: actualizar_vista };
    if (typeof module === 'object' && module.exports) module.exports = navigation;
    else root.DreamsNavigation = navigation;
}
