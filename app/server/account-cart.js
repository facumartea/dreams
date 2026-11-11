// sincroniza el carrito por cuenta y conserva operaciones pendientes para reintentar sin duplicarlas.
// carrito por uuid de sesion: valida operaciones y delega su orden e idempotencia a la rpc.
const { createHmac, timingSafeEqual } = require('node:crypto');
const { normalize_product_brand: normalizar_marca_del_perfume } = require('./product-schema');
const es_identificador_uuid = value => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
const tiene_campos_permitidos = (value, keys) => value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).every(key => keys.includes(key));
const son_productos_validos = items => Array.isArray(items) && items.length <= 30 && new Set(items.map(i => i?.id)).size === items.length && items.every(i => tiene_campos_permitidos(i, ['id', 'quantity']) && Number.isSafeInteger(i.id) && i.id > 0 && Number.isSafeInteger(i.quantity) && i.quantity >= 1 && i.quantity <= 99);
function es_operacion_valida(op) {
    if (!op || typeof op !== 'object') return false;
    if (op.type === 'clear') return tiene_campos_permitidos(op, ['type']);
    if (['merge', 'consume'].includes(op.type)) return tiene_campos_permitidos(op, ['type', 'items']) && son_productos_validos(op.items);
    if (!Number.isSafeInteger(op.id) || op.id <= 0) return false;
    if (op.type === 'remove') return tiene_campos_permitidos(op, ['type', 'id']);
    if (op.type === 'delta') return tiene_campos_permitidos(op, ['type', 'id', 'delta']) && Number.isSafeInteger(op.delta) && op.delta !== 0 && Math.abs(op.delta) <= 99;
    return false;
}
class AccountCartService {
    constructor({ database, enabled, signing_key, product_brand_column }) {
        this.database = database; this.product_brand_column = product_brand_column;
        this.ready = enabled && typeof signing_key === 'string' && signing_key.length >= 32;
        this.signing_key = signing_key;
    }
    // el contexto firmado impide reutilizar una operacion pendiente en otra cuenta.
    // firma el contexto de la cuenta para rechazar operaciones de otro propietario.
    scope_for(id) { return createHmac('sha256', this.signing_key).update(`dreams-cart-v1:${id}`).digest('hex'); }
    // recupera precios y disponibilidad actuales; el json persistido solo contiene ids y cantidades.
    // une ids y cantidades guardados con precios y stock actuales de productos.
    async hydrate(row, user) {
        const stored = Array.isArray(row?.items) ? row.items : [];
        const result = stored.length ? await this.database.from('products').select(`id,${this.product_brand_column},name,price,stock,image_url,size_ml`).in('id', stored.map(i => i.id)) : { data: [] };
        if (result.error) throw result.error;
        const products = new Map(result.data.map(p => [Number(p.id), normalizar_marca_del_perfume(p)]));
        const items = stored.map(i => {
            const p = products.get(i.id);
            return p ? { ...p, id: i.id, quantity: i.quantity, price: Number(p.price), stock: Number(p.stock), unavailable: Number(p.stock) < i.quantity } : { id: i.id, quantity: i.quantity, name: 'Producto no disponible', brand: '', price: 0, stock: 0, image_url: '/assets/dreams-bottle.png', unavailable: true };
        });
        return { user_id: user.id, scope: this.scope_for(user.id), revision: Number(row?.revision || 0), items };
    }
    // lee solamente el carrito del usuario verificado por la sesion.
    async read(solicitud, respuesta) {
        if (!this.ready) return respuesta.status(503).json({ error: 'El guardado del carrito no está disponible.' });
        if (Object.keys(solicitud.query).length) return respuesta.status(400).json({ error: 'Solicitud de carrito inválida.' });
        const result = await this.database.from('account_carts').select('items,revision').eq('user_id', solicitud.user.id).maybeSingle();
        if (result.error) throw result.error;
        respuesta.json(await this.hydrate(result.data, solicitud.user));
    }
    // valida el cambio y su contexto; la rpc guarda el cambio y su identificador en una transaccion.
    async write(solicitud, respuesta) {
        if (!this.ready) return respuesta.status(503).json({ error: 'El guardado del carrito no está disponible.' });
        const body = solicitud.body;
        if (!tiene_campos_permitidos(body, ['operation_id', 'operation', 'scope']) || !es_identificador_uuid(body.operation_id) || !es_operacion_valida(body.operation)) return respuesta.status(400).json({ error: 'Operación de carrito inválida.' });
        const scope = this.scope_for(solicitud.user.id);
        if (typeof body.scope !== 'string' || Buffer.byteLength(body.scope) !== Buffer.byteLength(scope) || !timingSafeEqual(Buffer.from(body.scope), Buffer.from(scope))) return respuesta.status(409).json({ error: 'La cuenta cambió. Volvé a cargar el carrito.' });
        const result = await this.database.rpc('dreams_cart_operation', { p_user_id: solicitud.user.id, p_operation_id: body.operation_id, p_operation: body.operation });
        if (result.error) {
            if (['22023', '23514'].includes(result.error.code)) return respuesta.status(409).json({ error: 'El carrito cambió o alcanzó su límite. Recargalo antes de reintentar.' });
            throw result.error;
        }
        respuesta.json(await this.hydrate(result.data, solicitud.user));
    }
}
function registrar_cuenta_carrito(options) {
    const service = new AccountCartService(options);
    options.route('get', '/api/cart/account', options.login, (solicitud, respuesta) => service.read(solicitud, respuesta));
    options.route('post', '/api/cart/account', options.login, (solicitud, respuesta) => service.write(solicitud, respuesta));
}
module.exports = { install_account_cart: registrar_cuenta_carrito, valid_operation: es_operacion_valida, items_valid: son_productos_validos };
