// Datos de prueba locales: nunca conectan Supabase ni clientes reales.
const product = () => ({ id: 7, brand: 'DREAMS', name: 'Perfume de prueba', gender: 'unisex', category: 'nicho', size_ml: 50, price: 100, stock: 2, intensity: 3, family: 'Familia de prueba', top_notes: 'Prueba', heart_notes: 'Prueba', base_notes: 'Prueba', description: 'Producto de prueba local', image_url: '/assets/dreams-bottle.png', featured: false });
class Query {
    constructor(state, table) { this.state = state; this.table = table; this.filters = []; this.action = 'select'; this.value = null; }
    select(_fields, options = {}) { this.count = options.count === 'exact' && options.head === true; return this; }
    eq(key, value) { this.filters.push(row => String(row[key]) === String(value)); return this; }
    neq(key, value) { this.filters.push(row => String(row[key]) !== String(value)); return this; }
    lte(key, value) { this.filters.push(row => typeof row[key] === 'number' && row[key] <= value); return this; }
    order() { return this; } limit() { return this; }
    insert(value) { this.action = 'insert'; this.value = value; return this; }
    update(value) { this.action = 'update'; this.value = value; return this; }
    delete() { this.action = 'delete'; return this; }
    maybeSingle() { return Promise.resolve(this.execute(true)); }
    single() { return this.maybeSingle(); }
    then(resolve, reject) { return Promise.resolve(this.execute(false)).then(resolve, reject); }
    execute(single) {
        const rows = this.state[this.table] || [], matches = row => this.filters.every(filter => filter(row));
        let found = rows.filter(matches);
        if (this.count) return { data: null, count: found.length, error: null };
        if (this.action === 'insert') { const created = { id: Math.max(0, ...rows.map(row => Number(row.id) || 0)) + 1, ...this.value }; rows.push(created); found = [created]; }
        if (this.action === 'update') found.forEach(row => Object.assign(row, this.value));
        if (this.action === 'delete') this.state[this.table] = rows.filter(row => !matches(row));
        return { data: single ? found[0] || null : found, error: null };
    }
}
function memory_database() {
    const state = { products: [product()], profiles: [{ id: 'fixture-admin', name: 'Admin de prueba', role: 'admin' }, { id: 'fixture-customer', name: 'Cliente de prueba', role: 'customer' }], reviews: [], inquiries: [], orders: [], coupons: [] };
    return { state, from: table => new Query(state, table), auth: {
        getUser: async token => ({ data: { user: token === 'fixture-admin' || token === 'fixture-customer' ? { id: token, email: 'fixture@example.invalid', user_metadata: { role: 'admin' } } : null } }),
        admin: { signOut: async () => ({ error: null }) }
    } };
}
module.exports = { memory_database, product };
