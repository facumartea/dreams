const { test } = require('node:test');
const assert = require('node:assert/strict');
const model = require('../public/js/admin-product-search');
const images = require('../public/js/admin-image-url');
const { create_app } = require('../server/app');
const { coupon_payload } = require('../server/app');
const { memory_database, product } = require('./helpers/admin-fixture.cjs');
const fs = require('node:fs');
const results = [];
function record(id, objective, expected, action) {
    test(id + ' ' + objective, async () => {
        try { await action(); results.push({ id, objective, environment: 'Node/HTTP local con fixtures, sin Supabase remoto', expected, actual: expected, result: 'PASS' }); }
        catch (error) { results.push({ id, objective, environment: 'Local fixture', expected, actual: error.message, result: 'FAIL' }); throw error; }
    });
}
process.on('exit', () => { if (process.env.DREAMS_MATRIX_OUT) fs.writeFileSync(process.env.DREAMS_MATRIX_OUT, JSON.stringify(results, null, 2)); });
const products = [{ id: 1, name: 'Ámbar Nocturno', brand: 'Dior', stock: 0, family: 'rosa', category: 'nicho' }, { id: 2, name: 'Café Élite', brand: 'LÁNCOME', stock: 2 }, { id: 3, name: 'Otro', stock: 3 }, { id: 4, name: null, brand: null, stock: null }];
const searches = [
 ['parcial nombre','mbar',[1]],['parcial marca','ior',[1]],['mayúsculas nombre','NOCTURNO',[1]],['marca minúsculas','lancome',[2]],['tildes nombre','cafe',[2]],['tildes consulta','ámbar',[1]],['espacios exteriores','  Dior  ',[1]],['vacío','',[1,2,3,4]],['sólo espacios','   ',[1,2,3,4]],['sin resultados','ausente',[]],['marca ausente','Otro',[3]],['campo familia excluido','rosa',[]],['categoría excluida','nicho',[]],['ID excluido','1',[]],['texto hostil literal',"x%,or(id.eq.1)",[]],['Unicode descompuesto','CAFE\u0301',[2]],['substring central','ctur',[1]],['marca con tilde','Lánc',[2]],['nombre null no falla','null',[]],['sin reordenar','o',[1,2,3]]
];
searches.forEach(([label, query, expected], index) => record('B'+String(index+1).padStart(2,'0'),label,JSON.stringify(expected),()=>assert.deepEqual(model.filter_products(products,query).map(p=>p.id),expected)));
record('B21','busca más allá de una primera página','ID99 encontrado',()=>assert.deepEqual(model.filter_products([...Array.from({length:40},(_,i)=>({id:i,name:'Fixture'})),{id:99,name:'Lejano'}],'lejano').map(p=>p.id),[99]));
const stocks = [[0,true,'Sin stock'],[1,true,'Stock bajo'],[2,true,'Stock bajo'],[3,false,'Disponible'],[99,false,'Disponible'],[null,false,'Stock no válido'],[undefined,false,'Stock no válido'],['',false,'Stock no válido'],['2',false,'Stock no válido'],[NaN,false,'Stock no válido'],[Infinity,false,'Stock no válido'],[-1,false,'Stock no válido'],[1.5,false,'Stock no válido'],[{},false,'Stock no válido'],[[],false,'Stock no válido'],[true,false,'Stock no válido'],[false,false,'Stock no válido'],[Number.MAX_SAFE_INTEGER+1,false,'Stock no válido']];
stocks.forEach(([stock, low, label],i)=>record('C'+String(i+1).padStart(2,'0'),'clasificación de stock '+String(stock),String(low)+' / '+label,()=>{assert.equal(model.low_stock(stock),low);assert.equal(model.stock_label(stock),label);}));
record('C19','baja y búsqueda combinadas','sólo2',()=>assert.deepEqual(model.filter_products(products,'elite',true).map(p=>p.id),[2]));
record('C20','baja incluye0/2 y descarta3/null','1,2',()=>assert.deepEqual(model.filter_products(products,'',true).map(p=>p.id),[1,2]));
record('C21','vuelta a listado completo','cuatro filas',()=>assert.equal(model.filter_products(products,'',false).length,4));
const urls = [['HTTPS con extensión','https://images.example.invalid/a.jpg',true],['HTTPS sin extensión','https://images.example.invalid/photo?id=1',true],['ruta local','/assets/dreams-bottle.png',true],['vacío','',false],['espacios','   ',false],['HTTP','http://images.example.invalid/a.jpg',false],['javascript','javascript:alert(1)',false],['data','data:image/png;base64,a',false],['relativa insegura','//images.example.invalid/a.jpg',false],['credenciales','https://user:pass@images.example.invalid/a.jpg',false],['página Google','https://google.com/search?q=perfume',false],['Google imgres','https://google.com/imgres?a=1',false],['barra inversa','https://example.invalid\\a.jpg',false],['control','https://example.invalid/\n.jpg',false],['trim exterior',' https://images.example.invalid/a ',true],['FTP','ftp://example.invalid/a.jpg',false],['query legítima','https://example.invalid/img?w=300&format=webp',true],['hash','https://example.invalid/a#image',true]];
urls.forEach(([label,url,expected],i)=>record('E'+String(i+1).padStart(2,'0'),label,String(expected)+' validación sintáctica',()=>assert.equal(images.supported_image_url(url),expected)));
record('E19','firma Supabase detectada','aviso temporal',()=>assert.equal(images.temporary_image_url('https://example.invalid/storage/v1/object/sign/img?token=fixture'),true));
record('E20','firma AWS detectada','aviso temporal',()=>assert.equal(images.temporary_image_url('https://example.invalid/img?X-Amz-Signature=fixture'),true));
record('E21','firma GCP detectada','aviso temporal',()=>assert.equal(images.temporary_image_url('https://example.invalid/img?X-Goog-Signature=fixture'),true));
record('E22','HTTPS permanente','sin aviso temporal',()=>assert.equal(images.temporary_image_url('https://example.invalid/image'),false));
async function product_request(patch, { role = 'fixture-admin', origin, id = 7, preview = false } = {}) {
    const db = memory_database(), app = create_app({ database: db, create_auth_client: () => db, preview_read_only: preview, disable_request_log: true });
    const server = app.listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening',resolve));
    const base='http://127.0.0.1:'+server.address().port;
    try {
        const response=await fetch(base+'/api/admin/products/'+id,{method:'PUT',headers:{Origin:origin||base,Cookie:'dreams_access_token='+role,'Content-Type':'application/json'},body:JSON.stringify({...product(),...patch})});
        const data=await response.json(); const persisted=await(await fetch(base+'/api/products/7')).json();
        return {status:response.status,data,persisted};
    } finally {await new Promise(resolve=>server.close(resolve));}
}
const edits = [['nombre',{name:'Actualizado'},200],['marca',{brand:'Marca de prueba'},200],['precio cero',{price:0},200],['precio negativo',{price:-1},400],['precio decimal',{price:12.5},200],['stock cero',{stock:0},200],['stock negativo',{stock:-1},400],['stock decimal',{stock:1.5},400],['tamaño cero',{size_ml:0},400],['tamaño válido',{size_ml:100},200],['intensidad cero',{intensity:0},400],['intensidad máxima',{intensity:5},200],['imagen trim',{image_url:' https://example.invalid/image '},200],['imagen HTTP',{image_url:'http://example.invalid/a.jpg'},400],['destacado true',{featured:true},200],['destacado false',{featured:false},200]];
edits.forEach(([label,patch,status],i)=>record('D'+String(i+1).padStart(2,'0'),label,String(status)+' y persistencia sólo si válido',async()=>{const r=await product_request(patch);assert.equal(r.status,status);if(status===200){for(const [key,value]of Object.entries(patch))assert.equal(r.persisted[key],typeof value==='string'?value.trim():value);}else assert.equal(r.persisted.name,product().name);}));
record('D17','customer no modifica','403',async()=>assert.equal((await product_request({},{role:'fixture-customer'})).status,403));
record('D18','anónimo no modifica','403',async()=>assert.equal((await product_request({},{role:''})).status,403));
record('D19','origen ajeno no modifica','403',async()=>assert.equal((await product_request({},{origin:'https://evil.invalid'})).status,403));
record('D20','ID ausente no crea','404',async()=>assert.equal((await product_request({},{id:999})).status,404));
record('D21','preview conserva protección','403',async()=>assert.equal((await product_request({},{preview:true})).status,403));
record('D22','editar precio conserva imagen','imagen idéntica',async()=>assert.equal((await product_request({price:250})).persisted.image_url,product().image_url));
const coupons = [['normal',{code:'DREAMS',discount_percent:10},true],['minúsculas',{code:'dreams',discount_percent:10},true],['trim',{code:' DREAMS ',discount_percent:10},true],['vacío',{code:'',discount_percent:10},false],['corto',{code:'AB',discount_percent:10},false],['largo',{code:'A'.repeat(41),discount_percent:10},false],['caracter ilegal',{code:'A B',discount_percent:10},false],['porcentaje0',{code:'DREAMS',discount_percent:0},false],['porcentaje100',{code:'DREAMS',discount_percent:100},true],['mayor100',{code:'DREAMS',discount_percent:101},false],['negativo',{code:'DREAMS',discount_percent:-1},false],['NaN',{code:'DREAMS',discount_percent:'x'},false],['infinito',{code:'DREAMS',discount_percent:Infinity},false],['decimal',{code:'DREAMS',discount_percent:1.5},true],['activo',{code:'DREAMS',discount_percent:10,active:true},true],['inactivo',{code:'DREAMS',discount_percent:10,active:false},true],['guion',{code:'DREAMS-10',discount_percent:10},true],['underscore',{code:'DREAMS_10',discount_percent:10},true],['número',{code:'DREAMS10',discount_percent:10},true],['borde3',{code:'ABC',discount_percent:10},true]];
coupons.forEach(([label,data,valid],i)=>record('F'+String(i+1).padStart(2,'0'),'cupón '+label,valid?'válido':'inválido',()=>assert.equal(!coupon_payload(data).error,valid)));
record('C25','Admin conserva stock null sin convertirlo en cero','null',async()=>{
 const db=memory_database();db.state.products[0].stock=null;const app=create_app({database:db,create_auth_client:()=>db,disable_request_log:true});const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
 try{const response=await fetch('http://127.0.0.1:'+server.address().port+'/api/admin/products',{headers:{Cookie:'dreams_access_token=fixture-admin'}});assert.equal((await response.json())[0].stock,null);}finally{await new Promise(resolve=>server.close(resolve));}
});
