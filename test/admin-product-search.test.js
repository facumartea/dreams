const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { readFileSync } = require('node:fs');
const { filter_products, normalize_search } = require('../public/js/admin-product-search');
const products = [
    { id: 9, name: 'Éclat de Nuit', brand: 'MÁRCA Áurea', category: 'nicho', stock: 6, price: 123456, description: 'Bosque' },
    { id: 8, name: 'Otra fragancia', brand: 'Compañía' },
    { id: 7, name: 'Perfume sin marca', brand: null },
    { id: 6, name: 'Flor' }
];
test('partial product names/brands ignore casing, accents, combining marks and exterior spaces', () => {
    for (const query of ['  ECLAT  ', 'e\u0301cla', ' áUREA ']) assert.deepEqual(filter_products(products, query).map(p=>p.id), [9]);
    assert.deepEqual(filter_products(products, 'marca').map(p=>p.id), [9,7]);
    assert.deepEqual(filter_products(products, 'COMPANIA').map(p=>p.id), [8]);
    assert.equal(normalize_search(' ÉCLAT '), 'eclat');
});
test('only name or brand match; no cross-field, category, price, stock or description matches', () => {
    for (const query of ['nicho', '123456', 'bosque', 'nuit marca', '<script>', '.*']) assert.deepEqual(filter_products(products, query), []);
});
test('empty query restores original order without changing products, and missing brands are safe', () => {
    const original = JSON.stringify(products);
    assert.equal(filter_products(products, '  \t\n'), products);
    assert.deepEqual(filter_products(products, 'SIN MARCA').map(p=>p.id), [7]);
    assert.deepEqual(filter_products(products, 'flor').map(p=>p.id), [6]);
    assert.deepEqual(filter_products([...products, {id:5,name:null}], 'unknown'), []);
    assert.equal(JSON.stringify(products), original);
});

function controller() {
    class Node {
        constructor() { this.children=[]; this.value=''; this.textContent=''; this.attributes={}; this.events={}; this.buttons={}; }
        set innerHTML(value) { this.html=value; this.children=[]; }
        get innerHTML() { return this.html; }
        setAttribute(k,v) { this.attributes[k]=v; }
        appendChild(n) { this.children.push(n); }
        replaceChildren(...nodes) { this.children=nodes; }
        querySelector(selector) { return this.buttons[selector] ||= new Node(); }
        addEventListener(event,fn) { this.events[event]=fn; }
    }
    const nodes=new Map(), requests=[];
    const node=id=>{if(!nodes.has(id))nodes.set(id,new Node());return nodes.get(id);};
    const context=vm.createContext({ document:{getElementById:node,querySelector:()=>null,createElement:()=>new Node(),addEventListener(){}},window:{},fetch:url=>new Promise(resolve=>requests.push({url,resolve})),DreamsAdminProducts:require('../public/js/admin-product-search'),escape_html:v=>String(v??''),Intl,Error });
    vm.runInContext(readFileSync(require.resolve('../public/js/admin.js'),'utf8'),context);
    return {context,node,requests,ids:()=>node('admin-products').children.map(row=>row.html?.match(/^<td>(\d+)/)?.[1]||null)};
}
const reply = data => ({ok:true,json:async()=>data});
test('query entered during load filters complete returned catalog, retaining order and edit targets',async()=>{
    const h=controller();const pending=h.context.load_admin_products();
    assert.match(h.node('admin-products-status').textContent,/Cargando/);assert.equal(h.node('admin-products').attributes['aria-busy'],'true');
    h.node('admin-product-search').value='sin marca';h.context.apply_product_search();
    h.requests[0].resolve(reply(products));await pending;
    assert.deepEqual(h.ids(),['7']);assert.equal(h.node('product-total').textContent,'1 de 4 productos');
    let selected;h.context.fill_form=p=>selected=p;h.node('admin-products').children[0].buttons['.edit-button'].events.click();assert.equal(selected.id,7);
    assert.deepEqual(h.requests.map(r=>r.url),['/api/admin/products']);
    h.node('admin-product-search').value='';h.context.apply_product_search();assert.deepEqual(h.ids(),['9','8','7','6']);
});
test('no results is explicit and query is never inserted into HTML',async()=>{
    const h=controller();const pending=h.context.load_admin_products();h.requests[0].resolve(reply(products));await pending;
    h.node('admin-product-search').value='<img onerror=alert(1)>';h.context.apply_product_search();
    assert.equal(h.node('admin-products-status').textContent,'No se encontraron productos');assert.equal(h.node('admin-products').children[0].children[0].textContent,'No se encontraron productos');assert.equal(h.node('product-total').textContent,'0 de 4 productos');
});
test('out-of-order reloads cannot replace newer products or reapply an obsolete query',async()=>{
    const h=controller();const older=h.context.load_admin_products();const latest=h.context.load_admin_products();
    h.node('admin-product-search').value='flor';h.context.apply_product_search();h.requests[1].resolve(reply(products));await latest;
    assert.deepEqual(h.ids(),['6']);h.requests[0].resolve(reply([{id:1,name:'Older',brand:'Flor'}]));await older;assert.deepEqual(h.ids(),['6']);
});
test('load error stays visible while searching; retry uses latest query and rejects invalid payloads',async()=>{
    const h=controller();const bad=h.context.load_admin_products();h.requests[0].resolve({ok:false,json:async()=>({error:'fixture unavailable'})});await bad;
    assert.equal(h.node('retry-admin-products').hidden,false);h.node('admin-product-search').value='áurea';h.context.apply_product_search();assert.match(h.node('admin-products-status').textContent,/No se pudieron cargar/);
    const retry=h.context.load_admin_products();h.requests[1].resolve(reply(products));await retry;assert.deepEqual(h.ids(),['9']);assert.equal(h.node('retry-admin-products').hidden,true);
    const invalid=h.context.load_admin_products();h.requests[2].resolve(reply({products}));await invalid;assert.equal(h.node('retry-admin-products').hidden,false);
});
