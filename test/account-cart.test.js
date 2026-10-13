const test = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { create_account_cart } = require('../public/js/account-cart');
const { create_app } = require('../server/app');
const { valid_operation } = require('../server/account-cart');
const A='11111111-1111-4111-8111-111111111111', B='22222222-2222-4222-8222-222222222222';
const storage=()=>{const data=new Map();return {data,getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};};
function service() {
 const carts=new Map(), seen=new Map();let owner=A, lost=false, calls=0;
 const request=async(path,body)=>{
  if(path==='/api/config')return{account_cart:true};
  if(path==='/api/auth/me')return{user:owner?{id:owner}:null};
  if(!owner)throw Error('401');
  if(!carts.has(owner))carts.set(owner,{items:[],revision:0});
  const cart=carts.get(owner);
  if(body){calls++;if(body.scope!==owner)throw Error('account changed');
   if(!seen.has(owner+body.operation_id)){
    const op=body.operation;
    if(op.type==='clear')cart.items=[];
    else if(op.type==='consume'){if(JSON.stringify(cart.items.map(({id,quantity})=>({id,quantity})))===JSON.stringify(op.items))cart.items=[];}
    else if(op.type==='remove')cart.items=cart.items.filter(i=>i.id!==op.id);
    else for(const e of op.type==='merge'?op.items:[op]){let item=cart.items.find(i=>i.id===e.id);if(!item){item={id:e.id,name:'Fixture',price:100,stock:9,quantity:0};cart.items.push(item);}item.quantity=op.type==='merge'?Math.max(item.quantity,e.quantity):item.quantity+e.delta;cart.items=cart.items.filter(i=>i.quantity>0);}
    cart.revision++;seen.set(owner+body.operation_id,true);
   }
  }
  const data=JSON.parse(JSON.stringify({...cart,user_id:owner,scope:owner}));
  if(body&&lost){lost=false;throw Error('lost response');}return data;
 };
 return{request,carts,setOwner:v=>owner=v,lose:()=>lost=true,calls:()=>calls};
}
function client(s,guest=[],persist=storage()) {let local=guest;const c=create_account_cart({request:s.request,storage:persist,read_guest:()=>local,write_guest:v=>local=v,id:randomUUID});return{c,persist,guest:()=>local};}

test('visitor merge once, fresh device recovery, account isolation and logout remove private browser data',async()=>{
 const s=service();s.carts.set(A,{items:[{id:1,quantity:2,price:100,stock:9,name:'Fixture'}],revision:1});
 const first=client(s,[{id:1,quantity:1},{id:2,quantity:3}]);await first.c.initialize();
 assert.deepEqual(first.c.get().map(i=>[i.id,i.quantity]),[[1,2],[2,3]]);assert.deepEqual(first.guest(),[]);
 await first.c.initialize();assert.equal(first.c.get()[0].quantity,2);
 const second=client(s);await second.c.initialize();assert.deepEqual(second.c.get(),first.c.get());
 const next=first.c.get();next[0].quantity++;first.c.save(next);await first.c.flush();assert.equal(s.carts.get(A).items[0].quantity,3);
 s.setOwner(B);await first.c.initialize();assert.deepEqual(first.c.get(),[]);assert.ok(!JSON.stringify([...first.persist.data]).includes('Fixture'));
 first.c.save([{id:3,quantity:1,price:250,stock:9,name:'B-only'}]);await first.c.flush();assert.equal(s.carts.get(A).items[0].quantity,3);
 first.c.logout();s.setOwner(null);await first.c.initialize();assert.deepEqual(first.c.get(),[]);assert.equal(first.persist.data.size,0);
});

test('lost processed response survives reload with same operation ID; retry never adds twice or stores prices',async()=>{
 const s=service(), first=client(s);await first.c.initialize();s.lose();first.c.save([{id:1,quantity:1,name:'PRIVATE PRODUCT',price:100,stock:9}]);
 await assert.rejects(first.c.flush());assert.equal(s.carts.get(A).items[0].quantity,1);
 const pending=first.persist.getItem('dreams_account_cart_outbox');assert.ok(!pending.includes('PRIVATE PRODUCT'));assert.ok(!pending.includes('price'));
 const reload=client(s,[],first.persist);await reload.c.initialize();assert.equal(reload.c.get()[0].quantity,1);assert.equal(reload.c.pending(),0);
});

test('rapid quantity changes/remove/clear cannot be restored by delayed operation responses',async()=>{
 const s=service();let release;const original=s.request;
 const delayed={...s,request:async(path,body)=>{const data=await original(path,body);if(body&&!release)await new Promise(r=>release=r);return data;}};
 const {c}=client(delayed);await c.initialize();c.save([{id:1,quantity:1,price:100,stock:9}]);
 await new Promise(r=>setImmediate(r));c.save([{id:1,quantity:3,price:100,stock:9}]);c.save([]);assert.deepEqual(c.get(),[]);
 release();await c.flush();assert.deepEqual(c.get(),[]);assert.deepEqual(s.carts.get(A).items,[]);
});

test('old confirmation consumes only identical snapshot, keeping concurrent device changes',async()=>{
 const s=service(),{c}=client(s);await c.initialize();c.save([{id:1,quantity:2,price:100,stock:9}]);await c.flush();
 s.carts.get(A).items[0].quantity=3;c.consume([{id:1,quantity:2}]);await c.flush();assert.equal(c.get()[0].quantity,3);
 c.consume([{id:1,quantity:3}]);await c.flush();assert.deepEqual(c.get(),[]);
});

test('stale response after account switch never paints previous owner or writes their outbox into another account',async()=>{
 const s=service();let release;const original=s.request;
 const delayed={...s,request:async(path,body)=>{const data=await original(path,body);if(body)await new Promise(r=>release=r);return data;}};
 const {c,persist}=client(delayed);await c.initialize();c.save([{id:1,quantity:1,price:100,stock:9}]);await new Promise(r=>setImmediate(r));
 s.setOwner(B);await c.initialize();release();await new Promise(r=>setImmediate(r));assert.deepEqual(c.get(),[]);assert.ok(!persist.getItem('dreams_account_cart_outbox'));assert.equal(s.carts.get(B).items.length,0);
});

test('reconciliation refreshes prices without dropping unavailable entries or persisting a quote as a mutation',async()=>{
 const s=service(),{c}=client(s);s.carts.set(A,{items:[{id:1,quantity:2,price:100,stock:9},{id:2,quantity:1,price:0,stock:0,unavailable:true}],revision:1});await c.initialize();
 c.save([{id:1,quantity:1,price:150,stock:9}],{reconcile:true});assert.equal(c.get()[0].price,150);assert.equal(c.get()[0].quantity,2);assert.equal(c.get()[1].unavailable,true);assert.equal(s.calls(),0);
});

function db(){const rows=new Map(),calls=[];return {rows,calls,auth:{getUser:async token=>({data:{user:[A,B].includes(token)?{id:token,email:'fixture@example.invalid'}:null}})},from(table){let user;const q={select(){return q},eq(k,v){user=v;return q},in(){return q},maybeSingle(){return q},then(resolve){return Promise.resolve({data:table==='profiles'?{name:'Fixture',role:'customer'}:table==='products'?[{id:1,name:'Current product',brand:'Fixture',price:123,stock:3}]:rows.get(user)||null}).then(resolve)}};return q;},rpc:async(name,args)=>{calls.push(args);rows.set(args.p_user_id,{items:[{id:1,quantity:1}],revision:1});return{data:rows.get(args.p_user_id)}}};}
test('HTTP uses verified UUID, rejects IDs/scopes for other owners, requires origin and returns fresh server prices',async()=>{
 const database=db(),app=create_app({database,account_cart_enabled:true,presentation_signing_key:'x'.repeat(64),preview_read_only:true,disable_request_log:true});const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const base='http://127.0.0.1:'+server.address().port;
 try{
 const get=async(user,path='/api/cart/account')=>fetch(base+path,{headers:{Cookie:'dreams_access_token='+user}});
 assert.equal((await get('invalid')).status,401);assert.equal((await get(A,'/api/cart/account?user_id='+B)).status,400);
 assert.equal((await (await fetch(base+'/api/config')).json()).account_cart,true);
 const account=await(await get(A)).json();
 const body={operation_id:randomUUID(),operation:{type:'delta',id:1,delta:1},scope:account.scope};
 const post=(user,value=body,origin=base)=>fetch(base+'/api/cart/account',{method:'POST',headers:{Cookie:'dreams_access_token='+user,Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(value)});
 assert.equal((await post(B)).status,409);assert.equal(database.calls.length,0);assert.equal((await post(A,{...body,user_id:B})).status,400);
 assert.equal((await post(A,body,'https://evil.invalid')).status,403);
 const success=await(await post(A)).json();assert.equal(database.calls[0].p_user_id,A);assert.equal(success.items[0].price,123);assert.equal(success.user_id,A);
 }finally{await new Promise(r=>server.close(r));}
});
test('operations reject unknown user/price payload fields, invalid IDs, duplicate products and invalid quantities',()=>{
 for(const op of [{type:'delta',id:1,delta:0},{type:'delta',id:1,delta:1,user_id:B},{type:'merge',items:[{id:1,quantity:1,price:1}]},{type:'merge',items:[{id:1,quantity:1},{id:1,quantity:2}]},{type:'remove',id:-1},{type:'clear',items:[]}])assert.equal(valid_operation(op),false);
});
test('session reads used by cart synchronization do not exhaust the mutation login limit',async()=>{
 const app=create_app({database:db(),disable_request_log:true});const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 try {for(let n=0;n<25;n++)assert.equal((await fetch('http://127.0.0.1:'+server.address().port+'/api/auth/me')).status,200);}finally{await new Promise(r=>server.close(r));}
});
test('guest academic confirmation and pending intent survive synchronization initialization without an owner outbox',async()=>{
 const s=service();s.setOwner(null);const persisted=storage();persisted.setItem('dreams_presentation_receipt','fixture-signed-receipt');persisted.setItem('dreams_presentation_checkout','fixture-pending-intent');const {c}=client(s,[],persisted);await c.initialize();assert.equal(persisted.getItem('dreams_presentation_receipt'),'fixture-signed-receipt');assert.equal(persisted.getItem('dreams_presentation_checkout'),'fixture-pending-intent');
 persisted.setItem('dreams_account_cart_outbox',JSON.stringify({user_id:A,queue:[]}));await c.initialize();assert.equal(persisted.getItem('dreams_presentation_receipt'),null);assert.equal(persisted.getItem('dreams_account_cart_outbox'),null);
});
