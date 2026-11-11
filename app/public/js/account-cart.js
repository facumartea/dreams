// sincroniza el carrito por cuenta y conserva operaciones pendientes para reintentar sin duplicarlas.
/* el servidor conserva el carrito. la pestana solo guarda operaciones pendientes
   por uuid: nunca precios ni datos del catalogo de una cuenta en localstorage. */
const preparar_cantidades_del_carrito = list => list.map(i => ({ id: Number(i.id), quantity: Number(i.quantity) })).sort((a, b) => a.id - b.id);
const copiar_carrito = value => JSON.parse(JSON.stringify(value));
class AccountCart {
    constructor(options) {
        Object.assign(this, options);
        this.id ||= () => crypto.randomUUID(); this.emit ||= () => {};
        this.key = 'dreams_account_cart_outbox'; this.user = null; this.scope = '';
        this.revision = -1; this.items = []; this.queue = []; this.generation = 0;
        this.enabled = false; this.initialized = false; this.flight = null; this.initialization = null;
    }
    // borra los rastros privados de la cuenta anterior en esta pestana.
    cleanup() {
        this.storage.removeItem(this.key);
        for (const key of ['dreams_presentation_checkout', 'dreams_presentation_receipt', 'dreams_presentation_completed', 'dreams_checkout_intent', 'dreams_checkout_order', 'dreams_coupon', 'dreams_demo_order_id']) this.storage.removeItem(key);
    }
    // guarda solo operaciones pendientes de esa cuenta, no precios confiados.
    persist() { this.storage.setItem(this.key, JSON.stringify({ user_id: this.user, queue: this.queue })); }
    // aplica una operacion a la copia local para mostrar el cambio mientras llega el servidor.
    apply(list, op, hints = []) {
        const result = copiar_carrito(list);
        if (op.type === 'clear') return [];
        if (op.type === 'consume') return JSON.stringify(preparar_cantidades_del_carrito(result)) === JSON.stringify(preparar_cantidades_del_carrito(op.items)) ? [] : result;
        if (op.type === 'remove') return result.filter(i => i.id !== op.id);
        for (const entry of op.type === 'merge' ? op.items : [op]) {
            let item = result.find(i => i.id === entry.id);
            if (!item) { item = { ...(hints.find(i => i.id === entry.id) || { id: entry.id, name: 'Verificando producto', brand: '', price: 0, stock: null }), quantity: 0 }; result.push(item); }
            item.quantity = Math.min(99, op.type === 'merge' ? Math.max(item.quantity, entry.quantity) : item.quantity + entry.delta);
            if (Number.isSafeInteger(item.stock) && item.stock > 0) item.quantity = Math.min(item.quantity, item.stock);
        }
        return result.filter(i => i.quantity > 0);
    }
    // elige los productos que se pueden mostrar para el propietario activo.
    visible() { return this.queue.reduce((list, e) => this.apply(list, e.operation, e.hints), copiar_carrito(this.items)); }
    // incorpora la revision del servidor solo si todavia corresponde a la misma cuenta.
    accept(data, epoch) {
        if (epoch !== this.generation || data.user_id !== this.user || data.revision < this.revision) return false;
        this.items = data.items; this.scope = data.scope; this.revision = data.revision; return true;
    }
    // envia la cola en orden; si se corta la red, conserva lo pendiente para reintentar.
    async drain(epoch) {
        while (this.queue.length && epoch === this.generation) {
            const entry = this.queue[0];
            const data = await this.request('/api/cart/account', { operation_id: entry.operation_id, operation: entry.operation, scope: this.scope });
            if (epoch !== this.generation) return;
            if (data.user_id !== this.user) throw new Error('La cuenta cambió. Recargá el carrito.');
            this.accept(data, epoch); this.queue.shift(); this.persist(); this.emit();
        }
    }
    // espera que termine la sincronizacion antes de continuar con otra accion.
    async flush() {
        if (!this.user || !this.queue.length) return;
        if (this.flight) return this.flight;
        const job = this.drain(this.generation); this.flight = job;
        try { await job; } finally { if (this.flight === job) this.flight = null; }
    }
    // asigna un identificador a cada cambio para que un reintento no lo repita.
    enqueue(operation, hints = []) {
        this.queue.push({ operation_id: this.id(), operation, hints: [] });
        try { this.persist(); } catch (error) { this.queue.pop(); throw error; }
        for (const hint of hints) if (!this.items.some(i => i.id === hint.id)) this.items.push({ ...hint, quantity: 0 });
        this.emit(); this.flush().catch(() => this.emit('No se pudo guardar el carrito. Reintentá antes de continuar.'));
    }
    // cambia el propietario activo y descarta respuestas de la cuenta anterior.
    set_owner(siguiente) {
        if (siguiente === this.user) return;
        this.generation++; this.flight = null; this.items = []; this.queue = []; this.scope = ''; this.revision = -1;
        if (this.user) this.cleanup();
        this.user = siguiente; this.emit();
    }
    // recupera cambios pendientes que pertenecen a esta cuenta y valida su formato.
    restore_queue() {
        if (this.queue.length) return;
        let saved; try { saved = JSON.parse(this.storage.getItem(this.key)); } catch { saved = null; }
        if (saved?.user_id === this.user && Array.isArray(saved.queue)) this.queue = saved.queue;
        else if (saved) this.cleanup();
    }
    // combina el carrito visitante una sola vez por operacion.
    merge_guest() {
        const guest = this.read_guest();
        if (!guest.length) return;
        // registrar el identificador antes de consumir el carrito visitante.
        this.queue.push({ operation_id: this.id(), operation: { type: 'merge', items: preparar_cantidades_del_carrito(guest) }, hints: [] });
        this.persist(); this.write_guest([]);
    }
    async load(epoch) {
        const enabled = (await this.request('/api/cart/config')).account_cart === true;
        if (epoch !== this.generation) return;
        this.enabled = enabled;
        if (!enabled) { this.initialized = true; return; }
        const me = await this.request('/api/auth/me');
        if (epoch !== this.generation) return;
        this.set_owner(me.user?.id || null);
        if (!this.user) { if (this.storage.getItem(this.key)) this.cleanup(); this.initialized = true; this.emit(); return; }
        const owner_epoch = this.generation;
        const data = await this.request('/api/cart/account');
        if (!this.accept(data, owner_epoch)) return;
        this.restore_queue(); this.merge_guest(); this.initialized = true; this.emit(); await this.flush();
    }
    // consulta la sesion y decide si usar carrito visitante o recuperar el de la cuenta.
    async initialize() {
        if (this.initialization) return this.initialization;
        this.initialized = false;
        const job = this.load(this.generation); this.initialization = job; this.emit();
        try { await job; } finally { if (this.initialization === job) this.initialization = null; }
    }
    // invalida las tareas pendientes de la cuenta y limpia su vista privada.
    logout() {
        this.generation++; this.user = null; this.items = []; this.queue = []; this.flight = null;
        this.scope = ''; this.revision = -1; this.initialized = false; this.initialization = null;
        this.cleanup(); this.write_guest([]); this.emit();
    }
    // devuelve una copia del carrito visible; el que lo recibe no modifica el original.
    get() { return !this.initialized ? [] : this.enabled && this.user ? this.visible() : this.read_guest(); }
    active() { return this.enabled && Boolean(this.user); }
    async ready() { if (!this.initialized || this.initialization) await (this.initialization || this.initialize()); await this.flush(); }
    // actualiza precios y disponibilidad sin guardar esa consulta como una compra.
    reconcile(cart) {
        this.items = this.items.map(i => {
            const fresh = cart.find(p => p.id === i.id);
            return fresh ? { ...fresh, quantity: i.quantity, unavailable: Number(fresh.stock) < i.quantity } : i;
        });
    }
    // convierte el cambio visible en operaciones de sincronizacion por cuenta.
    save(cart, { reconcile = false } = {}) {
        if (!this.initialized) throw new Error('Esperá a que se compruebe la cuenta antes de modificar el carrito.');
        if (!this.enabled || !this.user) { this.write_guest(cart); return; }
        if (reconcile) { this.reconcile(cart); return; }
        const old = this.visible();
        if (!cart.length) { this.enqueue({ type: 'clear' }); return; }
        for (const prior of old) if (!cart.some(i => i.id === prior.id)) this.enqueue({ type: 'remove', id: prior.id });
        for (const item of cart) {
            const delta = item.quantity - (old.find(i => i.id === item.id)?.quantity || 0);
            if (delta) this.enqueue({ type: 'delta', id: item.id, delta }, cart);
        }
    }
    // vaca el carrito solo si coincide con la compra confirmada, sin perder cambios nuevos.
    consume(list) { if (this.enabled && this.user) this.enqueue({ type: 'consume', items: preparar_cantidades_del_carrito(list) }); else this.write_guest([]); }
    pending() { return this.queue.length; }
}
function crear_carrito_de_la_cuenta(options) { return new AccountCart(options); }
if (typeof module !== 'undefined') module.exports = { crear_carrito_de_la_cuenta };
else window.crear_carrito_de_la_cuenta = crear_carrito_de_la_cuenta;
