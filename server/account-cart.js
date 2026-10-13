const { createHmac, timingSafeEqual } = require('node:crypto');
const { normalize_product_brand } = require('./product-schema');
const uuid = value => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
const exact = (value, keys) => value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).every(key => keys.includes(key));
const items_valid = items => Array.isArray(items) && items.length <= 30 && new Set(items.map(i => i?.id)).size === items.length && items.every(i => exact(i, ['id', 'quantity']) && Number.isSafeInteger(i.id) && i.id > 0 && Number.isSafeInteger(i.quantity) && i.quantity >= 1 && i.quantity <= 99);
function valid_operation(op) {
    if (!op || typeof op !== 'object') return false;
    if (op.type === 'clear') return exact(op, ['type']);
    if (['merge', 'consume'].includes(op.type)) return exact(op, ['type', 'items']) && items_valid(op.items);
    if (!Number.isSafeInteger(op.id) || op.id <= 0) return false;
    if (op.type === 'remove') return exact(op, ['type', 'id']);
    if (op.type === 'delta') return exact(op, ['type', 'id', 'delta']) && Number.isSafeInteger(op.delta) && op.delta !== 0 && Math.abs(op.delta) <= 99;
    return false;
}
function install_account_cart({ route, login, database, enabled, signing_key, product_brand_column }) {
    const ready = enabled && typeof signing_key === 'string' && signing_key.length >= 32;
    const scope_for = id => createHmac('sha256', signing_key).update(`dreams-cart-v1:${id}`).digest('hex');
    async function hydrate(row, user) {
        const stored = Array.isArray(row?.items) ? row.items : [];
        const result = stored.length ? await database.from('products').select(`id,${product_brand_column},name,price,stock,image_url,size_ml`).in('id', stored.map(i => i.id)) : { data: [] };
        if (result.error) throw result.error;
        const products = new Map(result.data.map(p => [Number(p.id), normalize_product_brand(p)]));
        const items = stored.map(i => {
            const p = products.get(i.id);
            return p ? { ...p, id: i.id, quantity: i.quantity, price: Number(p.price), stock: Number(p.stock), unavailable: Number(p.stock) < i.quantity } : { id: i.id, quantity: i.quantity, name: 'Producto no disponible', brand: '', price: 0, stock: 0, image_url: '/assets/dreams-bottle.png', unavailable: true };
        });
        return { user_id: user.id, scope: scope_for(user.id), revision: Number(row?.revision || 0), items };
    }
    route('get', '/api/cart/account', login, async (req, res) => {
        if (!ready) return res.status(503).json({ error: 'El guardado del carrito no está disponible.' });
        if (Object.keys(req.query).length) return res.status(400).json({ error: 'Solicitud de carrito inválida.' });
        const result = await database.from('account_carts').select('items,revision').eq('user_id', req.user.id).maybeSingle();
        if (result.error) throw result.error;
        res.json(await hydrate(result.data, req.user));
    });
    route('post', '/api/cart/account', login, async (req, res) => {
        if (!ready) return res.status(503).json({ error: 'El guardado del carrito no está disponible.' });
        const b = req.body;
        if (!exact(b, ['operation_id', 'operation', 'scope']) || !uuid(b.operation_id) || !valid_operation(b.operation)) return res.status(400).json({ error: 'Operación de carrito inválida.' });
        const scope = scope_for(req.user.id);
        if (typeof b.scope !== 'string' || b.scope.length !== scope.length || !timingSafeEqual(Buffer.from(b.scope), Buffer.from(scope))) return res.status(409).json({ error: 'La cuenta cambió. Volvé a cargar el carrito.' });
        const result = await database.rpc('dreams_cart_operation', { p_user_id: req.user.id, p_operation_id: b.operation_id, p_operation: b.operation });
        if (result.error) {
            if (['22023', '23514'].includes(result.error.code)) return res.status(409).json({ error: 'El carrito cambió o alcanzó su límite. Recargalo antes de reintentar.' });
            throw result.error;
        }
        res.json(await hydrate(result.data, req.user));
    });
}
module.exports = { install_account_cart, valid_operation, items_valid };
