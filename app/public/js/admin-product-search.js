const DreamsAdminProducts = {
    normalize_search(value) { return String(value ?? '').normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim(); },
    filter_products(products, query, low_only = false) {
        const text = DreamsAdminProducts.normalize_search(query);
        if (!text && !low_only) return products;
        return products.filter(product => (!low_only || DreamsAdminProducts.low_stock(product?.stock)) && (!text || [product?.name, product?.brand].some(value => DreamsAdminProducts.normalize_search(value).includes(text))));
    },
    valid_stock(value) { return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0; },
    low_stock(value) { return DreamsAdminProducts.valid_stock(value) && value <= 2; },
    stock_label(value) { return !DreamsAdminProducts.valid_stock(value) ? 'Stock no válido' : value === 0 ? 'Sin stock' : value <= 2 ? 'Stock bajo' : 'Disponible'; }
};
if (typeof module !== 'undefined' && module.exports) module.exports = DreamsAdminProducts;
else window.DreamsAdminProducts = DreamsAdminProducts;
