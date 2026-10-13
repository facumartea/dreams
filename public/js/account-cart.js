/* Authenticated carts stay in memory. Only owner-bound idempotent pending
   quantities survive reload in this tab; no product snapshots in localStorage. */
(function(root) {
    function create_account_cart({ request, storage, read_guest, write_guest, emit = () => {}, id = () => crypto.randomUUID() }) {
        const KEY = 'dreams_account_cart_outbox';
        let user = null, scope = '', revision = -1, items = [], queue = [], generation = 0, enabled = false, initialized = false, flight, initialization;
        const copy = value => JSON.parse(JSON.stringify(value));
        const pairs = list => list.map(i => ({ id: Number(i.id), quantity: Number(i.quantity) })).sort((a,b)=>a.id-b.id);
        function cleanup() {
            storage.removeItem(KEY);
            for (const key of ['dreams_presentation_checkout','dreams_presentation_receipt','dreams_presentation_completed','dreams_checkout_intent','dreams_checkout_order','dreams_coupon','dreams_demo_order_id']) storage.removeItem(key);
        }
        function persist() { storage.setItem(KEY, JSON.stringify({ user_id: user, queue })); }
        function apply(list, op, hints = []) {
            const result = copy(list);
            if (op.type === 'clear') return [];
            if (op.type === 'consume') return JSON.stringify(pairs(result)) === JSON.stringify(pairs(op.items)) ? [] : result;
            if (op.type === 'remove') return result.filter(i => i.id !== op.id);
            for (const entry of op.type === 'merge' ? op.items : [op]) {
                let item = result.find(i => i.id === entry.id);
                if (!item) { item = { ...(hints.find(i => i.id === entry.id) || {id:entry.id,name:'Verificando producto',brand:'',price:0,stock:null}), quantity:0 }; result.push(item); }
                item.quantity = op.type === 'merge' ? Math.max(item.quantity,entry.quantity) : item.quantity+entry.delta;
                item.quantity = Math.min(99,item.quantity);
                if (Number.isSafeInteger(item.stock) && item.stock > 0) item.quantity = Math.min(item.quantity,item.stock);
            }
            return result.filter(i => i.quantity > 0);
        }
        function visible() { return queue.reduce((list,e)=>apply(list,e.operation,e.hints),copy(items)); }
        function accept(data, epoch) {
            if (epoch !== generation || data.user_id !== user || data.revision < revision) return false;
            items = data.items; scope = data.scope; revision = data.revision;
            return true;
        }
        async function flush() {
            if (!user || !queue.length) return;
            if (flight) return flight;
            const epoch = generation;
            const job = (async()=>{
                while (queue.length && epoch === generation) {
                    const entry = queue[0];
                    const data = await request('/api/cart/account', { operation_id:entry.operation_id, operation:entry.operation, scope });
                    if (epoch !== generation) return;
                    if (data.user_id !== user) throw new Error('La cuenta cambió. Recargá el carrito.');
                    accept(data,epoch);
                    queue.shift(); persist(); emit();
                }
            })();
            flight = job;
            try { await job; } finally { if (flight === job) flight = null; }
        }
        function enqueue(operation, hints = []) {
            queue.push({operation_id:id(),operation,hints:[]});
            try { persist(); } catch(error) { queue.pop(); throw error; }
            // Product display metadata is memory-only, never part of the outbox.
            for (const hint of hints) if (!items.some(i=>i.id===hint.id)) items.push({...hint,quantity:0});
            emit(); flush().catch(()=>emit('No se pudo guardar el carrito. Reintentá antes de continuar.'));
        }
        async function initialize() {
            if (initialization) return initialization;
            const job = (async()=>{
                enabled = (await request('/api/config')).account_cart === true;
                if (!enabled) { initialized = true; return; }
                const me = await request('/api/auth/me');
                const next = me.user?.id || null;
                if (next !== user) {
                    generation++; flight = null; items=[]; queue=[]; scope=''; revision=-1;
                    if (user) cleanup();
                    user=next;
                }
                if (!user) { if(storage.getItem(KEY)) cleanup(); initialized=true; emit(); return; }
                const epoch=generation;
                const data=await request('/api/cart/account');
                if (!accept(data,epoch)) return;
                if (!queue.length) {
                    let saved; try { saved=JSON.parse(storage.getItem(KEY)); } catch { saved=null; }
                    if (saved?.user_id===user && Array.isArray(saved.queue)) queue=saved.queue;
                    else if(saved) cleanup();
                }
                const guest=read_guest();
                if (guest.length) {
                    // Durable ID first. Retried merges use max, never repeated addition.
                    queue.push({operation_id:id(),operation:{type:'merge',items:pairs(guest)},hints:[]});
                    persist(); write_guest([]);
                }
                initialized=true; emit(); await flush();
            })();
            initialization=job;
            try { await job; } finally { if(initialization===job) initialization=null; }
        }
        function logout() { generation++; user=null; items=[]; queue=[]; flight=null; scope=''; revision=-1; cleanup(); write_guest([]); emit(); }
        return {
            initialize, logout, flush, get:()=>enabled ? (user ? visible() : initialized ? read_guest() : []) : read_guest(),
            active:()=>enabled && Boolean(user),
            ready:async()=>{if (!initialized || initialization) await (initialization || initialize()); await flush();},
            save(cart,{reconcile=false}={}) {
                if (!enabled || !user) {write_guest(cart); return;}
                if (reconcile) { items=items.map(i=>{const fresh=cart.find(p=>p.id===i.id);return fresh?{...fresh,quantity:i.quantity}:i;});return; }
                const old=visible();
                if (!cart.length) { enqueue({type:'clear'});return; }
                for (const prior of old) if(!cart.some(i=>i.id===prior.id)) enqueue({type:'remove',id:prior.id});
                for (const item of cart) {const delta=item.quantity-(old.find(i=>i.id===item.id)?.quantity||0);if(delta)enqueue({type:'delta',id:item.id,delta},cart);}
            },
            consume(list) { if (enabled && user) enqueue({type:'consume',items:pairs(list)});else write_guest([]); },
            pending:()=>queue.length
        };
    }
    if (typeof module !== 'undefined') module.exports = { create_account_cart };
    else root.create_account_cart=create_account_cart;
})(typeof window !== 'undefined' ? window : globalThis);
