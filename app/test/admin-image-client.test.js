// pruebas de panel image client: usan datos ficticios para detectar cambios en respuestas, permisos y errores.
const test=require('node:test');const assert=require('node:assert/strict');const vm=require('node:vm');const {readFileSync}=require('node:fs');
const images=require('../public/js/admin-image-url');
test('image URLs accept extensionless HTTPS/local assets and reject malformed, credentials, HTTP and ambiguous paths',()=>{
 for(const url of [' https://cdn.example.invalid/image?id=7 ','/assets/dreams-bottle.png','https://cdn.example.invalid/a%20b?width=500'])assert.equal(images.es_url_de_imagen_admitida(url),true);
 for(const url of ['', 'garbage','http://cdn.example.invalid/image','//evil.invalid/image','/\\evil.invalid/image','https://user:pass@host.invalid/image','https://exa\nmple.invalid/image','javascript:alert(1)','https://google.com/imgres?imgurl=x'])assert.equal(images.es_url_de_imagen_admitida(url),false);
});
test('known expiring links are warnings, not extension-based rejections',()=>{
 for(const url of ['https://project.supabase.co/storage/v1/object/sign/pics/x?token=fixture','https://cdn.example.invalid/image?X-Amz-Signature=fixture','https://cdn.example.invalid/image?signature=fixture&expires=100','https://cdn.example.invalid/image?sig=fixture&se=100']){assert.equal(images.es_url_de_imagen_admitida(url),true);assert.equal(images.es_url_de_imagen_temporal(url),true);}
 assert.equal(images.es_url_de_imagen_temporal('https://cdn.example.invalid/image?width=800&format=webp'),false);
});
function harness(){const nodes=new Map(),timers=new Map(),probes=[];let n=0;const node=id=>{if(!nodes.has(id))nodes.set(id,{value:'',textContent:'',dataset:{},disabled:false,hidden:false,removeAttribute(){},setAttribute(){},reset(){},reportValidity(){return true;}});return nodes.get(id)};
 const submit=node('submit');node('product-form').elements=[submit,node('image_url'),node('name')];const context=vm.createContext({document:{getElementById:node,querySelector:()=>submit,addEventListener(){}},window:{setTimeout(fn,ms){timers.set(++n,{fn,ms});return n},clearTimeout(id){timers.delete(id)}},DreamsAdminImages:images,Image:class{constructor(){probes.push(this);}},URL,Intl});vm.runInContext(readFileSync(require.resolve('../public/js/admin.js'),'utf8'),context);
 return{context,node,submit,timers,probe:()=>probes.at(-1)};}
test('editing a valid URL invalidates saving immediately, even before debounce or a stale load callback',async()=>{
 const h=harness();h.node('image_url').value='https://cdn.example.invalid/original';h.context.comprobar_vista_previa_de_imagen();const oldLoad=h.probe().onload;oldLoad();assert.equal(h.submit.disabled,false);
 h.node('image_url').value='https://cdn.example.invalid/shared-page';h.context.programar_revision_de_imagen();assert.equal(h.submit.disabled,true);oldLoad();assert.equal(h.submit.disabled,true);
 let writes=0;h.context.consultar_api_del_panel=async()=>{writes++;};await h.context.guardar_perfume({preventDefault(){},currentTarget:h.node('product-form'),submitter:h.submit});assert.equal(writes,0);
});
test('timeout rejects late success and retry can validate the same URL without clearing form fields',()=>{
 const h=harness();h.node('name').value='Keep name';h.node('image_url').value='https://cdn.example.invalid/image';h.context.comprobar_vista_previa_de_imagen();const oldLoad=h.probe().onload;[...h.timers.values()].find(t=>t.ms===6000).fn();assert.equal(h.submit.disabled,true);oldLoad();assert.equal(h.submit.disabled,true);assert.match(h.node('image-preview-message').textContent,/tardó/);
 h.context.comprobar_vista_previa_de_imagen();h.probe().onload();assert.equal(h.submit.disabled,false);assert.equal(h.node('name').value,'Keep name');
});
test('pending completion never enables product saving after the form was reset to empty',async()=>{
 const h=harness();h.node('image_url').value='https://cdn.example.invalid/image';h.context.comprobar_vista_previa_de_imagen();h.probe().onload();
 await h.context.ejecutar_con_boton_bloqueado(h.submit,'Saving',async()=>h.context.mostrar_estado_de_la_imagen('empty'));assert.equal(h.submit.disabled,true);
});
test('loaded signed image explains expiration without modifying the URL',()=>{
 const h=harness();const url='https://cdn.example.invalid/image?X-Amz-Signature=fixture';h.node('image_url').value=url;h.context.comprobar_vista_previa_de_imagen();h.probe().onload();assert.match(h.node('image-preview-message').textContent,/puede vencer/);assert.equal(h.node('image_url').value,url);assert.equal(h.submit.disabled,false);
});

test('in-flight product save keeps inputs and submit locked even if image load completes, and duplicate submit is ignored',async()=>{
 const h=harness();h.node('image_url').value='https://cdn.example.invalid/image';h.context.comprobar_vista_previa_de_imagen();h.context.indicar_guardado_en_curso(true);h.probe().onload();assert.equal(h.submit.disabled,true);assert.equal(h.node('image_url').disabled,true);assert.equal(h.node('name').disabled,true);
 let writes=0;h.context.consultar_api_del_panel=async()=>{writes++;};await h.context.guardar_perfume({preventDefault(){},currentTarget:h.node('product-form'),submitter:h.submit});assert.equal(writes,0);h.context.indicar_guardado_en_curso(false);assert.equal(h.node('image_url').disabled,false);
});
