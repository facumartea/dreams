(function (root) {
    function normalize_search(value) {
        return String(value ?? '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();
    }
    function filter_products(products, query) {
        const text = normalize_search(query);
        if (!text) return products;
        return products.filter(product => [product?.name, product?.brand].some(value => normalize_search(value).includes(text)));
    }
    const helpers = { normalize_search, filter_products };
    if (typeof module !== 'undefined' && module.exports) module.exports = helpers;
    else root.DreamsAdminProducts = helpers;
})(typeof window !== 'undefined' ? window : globalThis);
