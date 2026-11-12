# Declaracion de uso de IA y bitacora parcial de DREAMS

Esto es un registro de los 21 prompts principales. No pusimos todos porque generalmente dábamos muchas vueltas hasta conseguir algo útil, así que agrupamos los pedidos sobre una misma tarea y mostramos el resultado principal de cada uno. El código completo está en el proyecto.

## Como leer este registro

- **pedido del usuario:** se cita solo el texto que esta disponible. Un extracto parcial no se presenta como el mensaje completo.
- **instrucciones del director:** el usuario confirmo que el chat director amplio los pedidos largos con apartados e indicaciones para WORK. Sus resumenes se identifican como pedidos consolidados, no como mensajes tecnicos escritos integramente por el usuario.
- **resultado de WORK:** se distingue el trabajo tecnico registrado de lo pedido. Los commits y PR acreditan cambios o verificaciones, no la fecha del mensaje, autoria manual ni revision del alumnado.

Los pedidos consolidados resumen las instrucciones del director disponibles y no sustituyen las consultas breves que falten. No se acredita programacion manual, revision del alumnado ni dominio del codigo por conservar estos resultados.

**El registro sigue siendo parcial.** No hay fechas de mensaje acreditadas para esta seleccion: se conserva "fecha por confirmar". La fecha 11/11/2026 que antes se asignaba al pedido 18 procedia de la ejecucion; se conserva como antecedente, pero no se usa para fechar ese mensaje. Las fechas tecnicas de los anexos permanecen con su alcance original. No se distribuyen pedidos entre martes y jueves.

B01, sobre arquitectura y seguridad, queda fuera de la seleccion porque no se encontro su mensaje original. El registro anterior citaba [f3533d7](https://github.com/facumartea/dreams/commit/f3533d7) como antecedente tecnico, sin acreditar que la funcion de ejemplo existiera alli; esa referencia no se transforma en un prompt original. Se conservan sus antecedentes tecnicos al final, sin reconstruir una cita. El pedido literal de migracion aportado ahora lo reemplaza. Railway aparece en esos antecedentes como hosting anterior, pero falta su pedido original: no se inventa una entrada. Tampoco se encontro una consulta inicial para aprender Node; las consultas de estudio disponibles se mantienen en su etapa posterior y las preguntas de aprendizaje van en el Word personal.

El orden conserva la secuencia relativa documentada: migracion, reparaciones funcionales, diseño, estudio y simplificacion. No fija la fecha exacta de iteraciones sin metadatos. Los resumenes no convierten ordenes de implementar, corregir o publicar en preguntas de aprendizaje.

Los ejemplos actuales se copian exactamente del codigo en main `3e7d2eff30dffe57ad039d22e3bc88f4d2a2bbf3`. **No son salidas literales de las conversaciones antiguas.** Si un archivo fue retirado, se enlaza su version historica y se aclara. Los materiales personales de estudio se entregan fuera del repositorio; docs/ conserva solo el indice y los dos PDF de diseño.


## PROMPT 1 · migrar a cloudflare y mantener supabase

Fecha: fecha por confirmar

### Pedido del usuario

texto original aportado por el usuario en esta revision:

> quiero migrarlo a cloudeflare pero mantener supabase

### Instrucciones del director

No se conserva aqui el texto original de la ampliacion. Los criterios posteriores de despliegue y seguridad no se atribuyen como palabras literales del usuario.

### Resultado registrado para WORK

El proyecto conserva Supabase y utiliza entradas de Cloudflare. El commit f0d52d6 acredita la adaptacion tecnica; no fecha el pedido. Se muestra la implementacion actual, no la salida original.

Archivo: [app/worker/index.mjs](app/worker/index.mjs) · ejemplo actual en 3e7d2ef, desde linea 12.

```javascript
function databaseFactory(env) {
    return (accessToken, authOptions = {}) => createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
        auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false, ...authOptions },
        global: {
            fetch: async (...args) => {
                const response = await fetch(...args);
                if (!response.ok) console.error('DREAMS Supabase HTTP failed', { status: response.status });
                return response;
            },
            ...(accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {})
        }
    });
}
```

Evidencia tecnica: [f0d52d6](https://github.com/facumartea/dreams/commit/f0d52d6). Original aportado por el usuario en esta revision; fecha no acreditada.

## PROMPT 2 · conexion del backend

Fecha: fecha por confirmar

### Pedido del usuario

No se dispone de la consulta breve original por separado. No se reconstruye como cita.

### Instrucciones del director

Pedido consolidado, no literal: revisa por que no conecta el backend y conserva la pagina hasta que funcione.

### Resultado registrado para WORK

cliente servidor actual; el diagnostico y su cierre historico se distinguen en los antecedentes.

Archivo: [app/worker/official-client.mjs](app/worker/official-client.mjs) · ejemplo actual en 3e7d2ef, desde linea 5.

```javascript
function create_official_database(env, access, fetcher) {
    return createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
        global: {
            ...(fetcher ? { fetch: fetcher } : {}),
            ...(access ? { headers: { Authorization: `Bearer ${access}` } } : {})
        }
    });
}
```

Fuente disponible y evidencia tecnica: mensajes disponibles de continuidad y diagnostico de PR56. Evidencia de cambios: [5236ef6](https://github.com/facumartea/dreams/commit/5236ef6).

## PROMPT 3 · registro y sesion

Fecha: fecha por confirmar

### Pedido del usuario

No se dispone de la consulta breve original por separado. No se reconstruye como cita.

### Instrucciones del director

Pedido consolidado, no literal: arregla el registro y el login sin cambiar al administrador.

### Resultado registrado para WORK

registro normal y perfil customer, sujeto a la respuesta real del proveedor.

Archivo: [app/server/customer-registration.js](app/server/customer-registration.js) · ejemplo actual en 3e7d2ef, desde linea 37.

```javascript
async function normal_registration(context, values, response) {
    // el registro normal devuelve sesion cuando el proveedor no exige confirmar el correo.
    const result = await context.create_auth_client().auth.signUp({
        email: values.email, password: values.password, options: { data: { name: values.name } }
    });
    if (result.error || !result.data?.user) return registration_failure(response, result.error);
    await save_customer(context.database, result.data.user, values);
    const confirmation_required = result.data.session ? false : await registration_confirmation(context);
    return registered_response(response, result.data, values, context.production, false, confirmation_required);
}
```

Fuente disponible y evidencia tecnica: pedido disponible de cierre funcional de PR56. Evidencia de cambios: [5236ef6](https://github.com/facumartea/dreams/commit/5236ef6).

## PROMPT 4 · guardado del admin

Fecha: fecha por confirmar

### Pedido del usuario

extracto del adjunto parcial A01; no prueba su fecha:

> necesito revisar y corregir toda la pagina https://dreams-perfumes.pages.dev/admin revisarla muchas veces absolutamente todas las funciones y botones que se pueda hacer toda

### Instrucciones del director

Pedido consolidado, no literal: revisa guardar productos e imagenes en el admin.

### Resultado registrado para WORK

guardado con lectura posterior y recuperacion de errores.

Archivo: [app/public/js/admin.js](app/public/js/admin.js) · ejemplo actual en 3e7d2ef, desde linea 287.

```javascript
async function commit_product(id, data) {
    set_product_save_pending(true);
    try {
        const resolved = id || await prepare_product_creation(data);
        const saved = await write_product_record(resolved, data);
        await confirm_product_persistence(saved, data);
        uncertain_product_create = null;
        reset_form(true);
        document.getElementById('admin-message').textContent = id ? 'Producto actualizado correctamente.' : resolved ? 'Alta anterior recuperada y cambios confirmados.' : 'Producto creado correctamente.';
        await Promise.all([load_dashboard(), load_admin_products()]);
    } catch (error) { document.getElementById('admin-message').textContent = `${error.message} Revisá el listado antes de repetir un alta si no pudimos confirmar el guardado.`; }
    finally { set_product_save_pending(false); }
}
```

Fuente disponible y evidencia tecnica: pedido disponible de panel Admin y extracto A01. Evidencia de cambios: [5236ef6](https://github.com/facumartea/dreams/commit/5236ef6).

## PROMPT 5 · carrito por cuenta

Fecha: fecha por confirmar

### Pedido del usuario

No se dispone de la consulta breve original por separado. No se reconstruye como cita.

### Instrucciones del director

Pedido consolidado, no literal: que cada cuenta conserve su carrito y no se mezcle con el de otra.

### Resultado registrado para WORK

operaciones ligadas a la cuenta verificada; precios recuperados en servidor.

Archivo: [app/server/account-cart.js](app/server/account-cart.js) · ejemplo actual en 3e7d2ef, desde linea 46.

```javascript
async write(req, res) {
        if (!this.ready) return res.status(503).json({ error: 'El guardado del carrito no está disponible.' });
        const body = req.body;
        if (!exact(body, ['operation_id', 'operation', 'scope']) || !uuid(body.operation_id) || !valid_operation(body.operation)) return res.status(400).json({ error: 'Operación de carrito inválida.' });
        const scope = this.scope_for(req.user.id);
        if (typeof body.scope !== 'string' || Buffer.byteLength(body.scope) !== Buffer.byteLength(scope) || !timingSafeEqual(Buffer.from(body.scope), Buffer.from(scope))) return res.status(409).json({ error: 'La cuenta cambió. Volvé a cargar el carrito.' });
        const result = await this.database.rpc('dreams_cart_operation', { p_user_id: req.user.id, p_operation_id: body.operation_id, p_operation: body.operation });
        if (result.error) {
            if (['22023', '23514'].includes(result.error.code)) return res.status(409).json({ error: 'El carrito cambió o alcanzó su límite. Recargalo antes de reintentar.' });
            throw result.error;
        }
        res.json(await this.hydrate(result.data, req.user));
    }
```

Fuente disponible y evidencia tecnica: pedido disponible de carrito por UUID en PR56. Evidencia de cambios: [5236ef6](https://github.com/facumartea/dreams/commit/5236ef6).

## PROMPT 6 · opiniones propias

Fecha: fecha por confirmar

### Pedido del usuario

No se dispone de la consulta breve original por separado. No se reconstruye como cita.

### Instrucciones del director

Pedido consolidado, no literal: que cada usuario pueda borrar su opinion, pero no la de otro.

### Resultado registrado para WORK

borrado propio comprobado tambien en la api.

Archivo: [app/server/reviews.js](app/server/reviews.js) · ejemplo actual en 3e7d2ef, desde linea 36.

```javascript
async function delete_own_review(request, response, create_auth_client) {
    const id = Number(request.params.id);
    if (!Number.isSafeInteger(id) || id <= 0 || Object.keys(request.body || {}).length) return response.status(400).json({ error: 'Solicitud de eliminación inválida.' });
    // jwt limitado mas predicado de dueno: la clave de servicio nunca elimina aqui.
    const result = await create_auth_client(request.access_token).from('reviews').delete().eq('id', id).eq('user_id', request.user.id).select('id').maybeSingle();
    if (result.error) throw result.error;
    if (!result.data) return response.status(404).json({ error: 'No encontramos una opinión propia para eliminar.' });
    response.json({ message: 'Tu opinión fue eliminada.' });
}
```

Fuente disponible y evidencia tecnica: pedido disponible de opiniones y eliminacion propia. Evidencia de cambios: [5236ef6](https://github.com/facumartea/dreams/commit/5236ef6).

## PROMPT 7 · checkout academico

Fecha: fecha por confirmar

### Pedido del usuario

No se dispone de la consulta breve original por separado. No se reconstruye como cita.

### Instrucciones del director

Pedido consolidado, no literal: completa el checkout de la escuela sin cobrar ni guardar datos de tarjeta.

### Resultado registrado para WORK

referencias firmadas, con propietario y vencimiento; no crea pedidos comerciales.

Archivo: [app/server/presentation-checkout.js](app/server/presentation-checkout.js) · ejemplo actual en 3e7d2ef, desde linea 19.

```javascript
function presentation_checkout({ enabled, signing_key, quote_cart, database, product_brand_column, production, issuer }) {
    const ready = enabled === true && typeof signing_key === 'string' && signing_key.length >= 32;
    const key = ready ? createHmac('sha256', signing_key).update('DREAMS presentation checkout v2').digest() : null;
    const sign = payload => { const body = Buffer.from(JSON.stringify(payload)).toString('base64url'); return `${body}.${createHmac('sha256', key).update(body).digest('base64url')}`; };
    function read(token, kind, owner) {
        if (typeof token !== 'string' || token.length > 24000) return null;
        const parts = token.split('.');
        if (parts.length !== 2) return null;
        const expected = createHmac('sha256', key).update(parts[0]).digest();
        const supplied = Buffer.from(parts[1], 'base64url');
        if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;
        try { const value = JSON.parse(Buffer.from(parts[0], 'base64url')); return value.version === 2 && value.issuer === issuer && value.kind === kind && value.owner === owner && value.expires > Date.now() ? value : null; } catch { return null; }
    }
    const install = (app, route) => install_presentation({ ready, quote_cart, database, product_brand_column, production, issuer, sign, read }, app, route);
    return { ready, install };
}
```

Fuente disponible y evidencia tecnica: pedido disponible de checkout academico. Evidencia de cambios: [5236ef6](https://github.com/facumartea/dreams/commit/5236ef6).

## PROMPT 8 · cupon en carrito

Fecha: fecha por confirmar

### Pedido del usuario

extracto del adjunto parcial A02; no prueba su fecha:

> quiero que aca aparezca para poner el cupon de descuento

### Instrucciones del director

Pedido consolidado, no literal: pone un lugar para ingresar el cupon antes de comprar.

### Resultado registrado para WORK

validacion servidor del cupon y de sus condiciones.

Archivo: [app/server/app.js](app/server/app.js) · ejemplo actual en 3e7d2ef, desde linea 147.

```javascript
async function resolve_coupon(database, code, subtotal, user_id = null) {
    const normalized = normalize_coupon_code(code);
    if (!normalized) return { ...discounted_totals(subtotal), coupon: null, coupon_error: null };
    if (!/^[A-Z0-9_-]{3,40}$/.test(normalized)) return { ...discounted_totals(subtotal), coupon: null, coupon_error: 'Cupón inválido.' };
    const result = await database.from('coupons').select('id,code,discount_percent,active,expires_at,minimum_purchase,max_uses,per_user_limit,conditions').eq('code', normalized).eq('active', true).maybeSingle();
    if (result.error) throw result.error;
    const coupon = result.data;
    const expired = coupon?.expires_at && new Date(coupon.expires_at).getTime() <= Date.now();
    const below_minimum = coupon?.minimum_purchase !== null && Number(subtotal) < Number(coupon?.minimum_purchase);
    if (!coupon || coupon.active !== true || expired || below_minimum) return { ...discounted_totals(subtotal), coupon: null, coupon_error: expired ? 'El cupón está vencido.' : below_minimum ? 'No alcanzaste la compra mínima del cupón.' : 'Cupón inválido o inactivo.' };
    const restricted = await coupon_restriction(database, coupon, user_id);
    if (restricted) return { ...discounted_totals(subtotal), coupon: null, coupon_error: restricted };
    const totals = discounted_totals(subtotal, coupon.discount_percent);
    return {
        ...totals,
        coupon: { id: coupon.id, code: coupon.code, discount_percent: Number(coupon.discount_percent) },
        coupon_error: null
    };
}
```

Fuente disponible y evidencia tecnica: pedido disponible de ajustes del carrito y extracto A02. Evidencia de cambios: [6865365](https://github.com/facumartea/dreams/commit/6865365).

## PROMPT 9 · campos de tarjeta y envio

Fecha: fecha por confirmar

### Pedido del usuario

extractos del adjunto parcial A03 y A04; agrupados por tema:

> en la parte del vencimiento que sean cuatro numeros y que se ponga la barra en el medio
>
> que no dia envio gratis sacale solo la palabra "gratis" que aparezca envio $0

### Instrucciones del director

Pedido consolidado, no literal: deja el nombre vacio, acepta numeros en tarjeta y cvv, agrega la barra al vencimiento y muestra envio $0.

### Resultado registrado para WORK

mascaras locales; no se transmiten ni guardan los campos financieros.

Archivo: [app/public/js/academic-inputs.js](app/public/js/academic-inputs.js) · ejemplo actual en 3e7d2ef, desde linea 9.

```javascript
function academic_mask(input, kind) {
    input.addEventListener('paste', event => {
        const pasted = event.clipboardData?.getData('text');
        if (typeof pasted !== 'string') return;
        event.preventDefault();
        input.setRangeText(pasted, input.selectionStart, input.selectionEnd, 'end');
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    input.addEventListener('beforeinput', event => {
        // borrar junto al separador tambien elimina un digito, sin atrapar el cursor.
        const at = input.selectionStart;
        if (event.inputType !== 'deleteContentBackward' || at !== input.selectionEnd || !at || !/[ /]/.test(input.value[at - 1])) return;
        event.preventDefault(); input.setRangeText('', Math.max(0, at - 2), at, 'end');
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    input.addEventListener('input', () => {
        const before = academic_digits(input.value.slice(0, input.selectionStart), 99).length;
        input.value = academic_format(input.value, kind);
        let at = 0, seen = 0;
        while (at < input.value.length && seen < before) if (/[0-9]/.test(input.value[at++])) seen++;
        input.setSelectionRange(at, at);
        input.setCustomValidity('');
    });
}
```

Fuente disponible y evidencia tecnica: pedido disponible de formulario y extractos A03/A04. Evidencia de cambios: [6865365](https://github.com/facumartea/dreams/commit/6865365).

## PROMPT 10 · retirar bloque de colecciones

Fecha: fecha por confirmar

### Pedido del usuario

No se dispone de la consulta breve original por separado. No se reconstruye como cita.

### Instrucciones del director

Pedido consolidado, no literal: saca el bloque tres formas de empezar y deja las colecciones en el menu.

### Resultado registrado para WORK

La retirada del bloque se verifico entonces con un test. Ese test ya no pertenece al runtime ni a la version actual: se conserva aqui solo como evidencia historica.

Archivo: [app/test/home-collections-removal.test.js](https://github.com/facumartea/dreams/blob/40b3d68854ec6b444fa807582b5c56b636d76e03/app/test/home-collections-removal.test.js#L6) · historico en 40b3d68; archivo eliminado en PR74, desde linea 6.

```javascript
test('Inicio retira el bloque completo y mantiene contiguos productos y presentación', () => {
    const html = read('public/index.html');
    assert.doesNotMatch(html, /collection-carousel|carousel-slide|carousel-status|Tres formas de empezar|EXPLORÁ LA SELECCIÓN/);
    assert.match(html, /id="featured-products"[\s\S]*?<\/section>\s*<section class="section about-preview"/);
});
```

Fuente disponible y evidencia tecnica: pedido disponible posterior a los ajustes de carrito. Evidencia de cambios: [b60e33d](https://github.com/facumartea/dreams/commit/b60e33d).

## PROMPT 11 · auditoria 2025 y limite de funciones

Fecha: fecha por confirmar

### Pedido del usuario

No se dispone de la consulta breve original por separado. No se reconstruye como cita.

### Instrucciones del director

Pedido consolidado, no literal: revisa la rubrica 2025 y el limite de 40 lineas sin mezclarla con la otra.

### Resultado registrado para WORK

inventario reproducible con parser; no demuestra asistencia ni entregas academicas.

Archivo: [app/scripts/function-inventory.mjs](app/scripts/function-inventory.mjs) · ejemplo actual en 3e7d2ef, desde linea 60.

```javascript
async function inventory(root) {
    const records = [];
    const files = await source_files(root);
    for (const path of files) {
        const file = relative(root, path).replaceAll('\\', '/');
        for (const block of script_blocks(await readFile(path, 'utf8'), file)) {
            const tree = parse(block.source, { ecmaVersion: 'latest', sourceType: 'module', locations: true, allowHashBang: true });
            walk(tree, null, records, file, block.offset);
            main_blocks(tree, file, records, block.offset);
        }
    }
    return { limit: 40, files: files.length, records, violations: records.filter(row => row.lines > 40) };
}
```

Fuente disponible y evidencia tecnica: pedido disponible de auditoria y limpieza 2025. Evidencia de cambios: [3e12bc6](https://github.com/facumartea/dreams/commit/3e12bc6).

## PROMPT 12 · scripts, carrusel y sql

Fecha: fecha por confirmar

### Pedido del usuario

No se dispone de la consulta breve original por separado. No se reconstruye como cita.

### Instrucciones del director

Pedido consolidado, no literal: revisa el checkout que sirve la oficial y agrega el carrusel en destacados.

### Resultado registrado para WORK

carrusel manual actual; el cierre tecnico y la distincion SQL estan acreditados por su evidencia historica.

Archivo: [app/public/js/featured-carousel.js](app/public/js/featured-carousel.js) · ejemplo actual en 3e7d2ef, desde linea 4.

```javascript
function setup_featured_carousel(track) {
    const region = document.getElementById('featured-carousel');
    if (!region || track.children.length < 2) return;
    const previous = region.querySelector('[data-carousel-previous]');
    const next = region.querySelector('[data-carousel-next]');
    const status = region.querySelector('[data-featured-position]');
    region.querySelector('.featured-products-controls').hidden = false;
    track.classList.add('featured-carousel-track');
    track.tabIndex = 0;
    track.setAttribute('aria-label', 'Productos destacados; usá las flechas para recorrerlos');
    const update = () => {
        const width = track.firstElementChild.getBoundingClientRect().width;
        const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
        const index = Math.max(0, Math.round(track.scrollLeft / (width + gap)));
        previous.disabled = track.scrollLeft <= 2;
        next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
        status.textContent = `Desde el producto ${index + 1} de ${track.children.length}`;
    };
    const move = direction => {
        const amount = track.firstElementChild.getBoundingClientRect().width + (parseFloat(getComputedStyle(track).columnGap) || 0);
        track.scrollBy({ left: direction * amount, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    };
    previous.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    track.addEventListener('keydown', event => {
        // no intercepta edicion ni acciones dentro de las tarjetas.
        if (event.target !== track || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        if (event.key === 'Home' || event.key === 'End') track.scrollTo({ left: event.key === 'Home' ? 0 : track.scrollWidth, behavior: 'instant' });
        else move(event.key === 'ArrowLeft' ? -1 : 1);
    });
    track.addEventListener('scroll', update, { passive: true });
    new ResizeObserver(update).observe(track);
    update();
}
```

Fuente disponible y evidencia tecnica: pedido disponible de cierre tecnico desde PR60. Evidencia de cambios: [e6d60bf](https://github.com/facumartea/dreams/commit/e6d60bf).

## PROMPT 13 · inicio y cabeceras mas simples

Fecha: fecha por confirmar

### Pedido del usuario

No se dispone de la consulta breve original por separado. No se reconstruye como cita.

### Instrucciones del director

Pedido consolidado, no literal: saca los vistos recientemente y los parrafos de las cabeceras, pero conserva el carrusel.

### Resultado registrado para WORK

cabeceras actuales sin parrafo visible; las descripciones siguen en los metadatos.

Archivo: [app/public/js/catalogo.js](app/public/js/catalogo.js) · ejemplo actual en 3e7d2ef, desde linea 62.

```javascript
function update_catalog_context(gender) {
    const variant = COLLECTION_VARIANTS[gender] || null;
    window.DreamsNavigation?.update(variant ? gender : '');
    update_catalog_theme(variant);
    document.getElementById('catalog-eyebrow').textContent = variant?.eyebrow || 'COLECCIÓN DREAMS';
    document.getElementById('catalog-title').textContent = variant?.title || 'Perfumes';
    document.title = variant?.document_title || 'Perfumes | DREAMS';
    update_catalog_metadata(variant ? gender : '');
}
```

Fuente disponible y evidencia tecnica: pedido disponible de Inicio y colecciones. Evidencia de cambios: [60451ca](https://github.com/facumartea/dreams/commit/60451ca).

## PROMPT 14 · material para estudiar

Fecha: fecha por confirmar

### Pedido del usuario

mensaje de estudio disponible en la conversacion; no es una consulta inicial para aprender node:

> hacemelo todo en un word y con palabras simples de entender en un lenguaje coloquial pero siempre siguiendo las normas del colegio

### Instrucciones del director

Pedido consolidado, no literal: hace un word sencillo para estudiar los archivos, node, express, los metodos y la base de datos.

### Resultado registrado para WORK

Se preparo material de estudio en distintas etapas. Las guias retiradas no se recrean en docs/; el Word nuevo se entrega fuera del repositorio y describe la version final.

Archivo: [app/server/server.js](app/server/server.js) · ejemplo actual en 3e7d2ef, desde linea 37.

```javascript
async function start() {
    const needed = ['SUPABASE_URL', 'SUPABASE_SECRET_KEY'].filter(key => !process.env[key]);
    if (needed.length) throw new Error(`Faltan variables obligatorias: ${needed.join(', ')}`);

    const client_options = { auth: { autoRefreshToken: false, persistSession: false } };
    const create_database = (access_token, auth_options = {}) => createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
        ...client_options, auth: { ...client_options.auth, ...auth_options },
        ...(access_token ? { global: { headers: { Authorization: `Bearer ${access_token}` } } } : {})
    });
    const database = create_database();
    const port = Number(process.env.PORT || 8080);
    const product_brand_column = await resolve_product_brand_column(database);
    const app = app_module.create_app(application_options(create_database, database, product_brand_column));

    return app.listen(port, '0.0.0.0', () => {
        console.log(`DREAMS funcionando en el puerto ${port} con Supabase.`);
    });
}
```

Fuente disponible y evidencia tecnica: mensajes disponibles de estudio C01-C04 y solicitud de guia. Evidencia de cambios: [8ad5401](https://github.com/facumartea/dreams/commit/8ad5401).

## PROMPT 15 · ordenar el repositorio y conservar manual y api

Fecha: fecha por confirmar

### Pedido del usuario

mensaje disponible con capturas; la imagen original forma parte de su contexto:

> saca este (capturas) y de las otras fotos retirar todos los archivos posibles

### Instrucciones del director

Pedido consolidado, no literal: saca archivos que sobran y deja el manual y la explicacion de la api en el readme.

### Resultado registrado para WORK

recorrido de archivos sin depender de git; manual y API permanecen en README.

Archivo: [app/scripts/function-inventory.mjs](app/scripts/function-inventory.mjs) · ejemplo actual en 3e7d2ef, desde linea 10.

```javascript
async function source_files(root) {
    const entries = await readdir(root, { withFileTypes: true });
    const groups = await Promise.all(entries.filter(e => !excluded.has(e.name)).map(async entry => {
        const file = resolve(root, entry.name);
        if (entry.isSymbolicLink()) return [];
        if (entry.isDirectory()) return source_files(file);
        return /\.(?:js|mjs|cjs|html)$/.test(entry.name) ? [file] : [];
    }));
    return groups.flat().sort();
}
```

Fuente disponible y evidencia tecnica: pedidos disponibles de simplificacion y decisiones de docs, PR64-PR68. Evidencia de cambios: [42792c9](https://github.com/facumartea/dreams/commit/42792c9).

## PROMPT 16 · icono del iphone

Fecha: fecha por confirmar

### Pedido del usuario

mensaje disponible con captura de iphone:

> mira el icono de deams es el de iphone de crhrome y se ve asi de mal descentrado y com la palabra logotipo arriba ayudame a cambiarlo

### Instrucciones del director

Pedido consolidado, no literal: ayudame a corregir el icono del iphone que se ve descentrado.

### Resultado registrado para WORK

icono dedicado incluido en el build; no se cambia la marca dentro del sitio.

Archivo: [app/scripts/build-pages.mjs](app/scripts/build-pages.mjs) · ejemplo actual en 3e7d2ef, desde linea 34.

```javascript
// incluir el icono local evita depender de que exista en el backend anterior.
for (const name of ['dreams-social.png', 'dreams-iphone-icon-v1.png']) {
    const image = await readFile(new URL(`../public/assets/${name}`, import.meta.url));
    assets[`/assets/${name}`] = { body: image.toString('base64'), encoding: 'base64', content_type: 'image/png', etag: `"${createHash('sha256').update(image).digest('hex')}"` };
}
```

Fuente disponible y evidencia tecnica: mensaje disponible con captura del icono de iPhone. Evidencia de cambios: [6e4647c](https://github.com/facumartea/dreams/commit/6e4647c).

## PROMPT 17 · dos pdf y limpieza comprobada

Fecha: fecha por confirmar

### Pedido del usuario

No se dispone de la consulta breve original por separado. No se reconstruye como cita.

### Instrucciones del director

Pedido consolidado, no literal: deja un pdf para el wireframe y uno para el diseño de la base de datos.

### Resultado registrado para WORK

docs/ conserva un indice y dos PDF: wireframe de 19 paginas y D.E.R. de una lamina. El codigo siguiente es un fragmento documental actual, no una salida historica de programacion.

Archivo: [docs/README.md](docs/README.md) · documentacion actual en 3e7d2ef, desde linea 21.

```markdown
## Manual, API y declaración

- [Instalación y ejecución local](../README.md#instalación-y-ejecución).
- [Manual de uso](../README.md#manual-de-uso).
- [API externa y recorrido](../README.md#api-externa-y-recorrido).
- [Declaración y bitácora parcial de prompts](../DECLARACION_PROMPTS.md).
```

Fuente disponible y evidencia tecnica: pedido disponible de consolidacion e integracion de PR70. Evidencia de cambios: [3305d56](https://github.com/facumartea/dreams/commit/3305d56).

## PROMPT 18 · ultima revision de entrega

Fecha: fecha por confirmar

### Pedido del usuario

No se dispone de la consulta breve original por separado. No se reconstruye como cita.

### Instrucciones del director

Pedido consolidado, no literal: ordena los pedidos reales, deja los dos pdf y aclara los comentarios.

### Resultado registrado para WORK

validacion y comentarios actuales; no se cambia el registro ni los permisos.

Archivo: [app/server/customer-registration.js](app/server/customer-registration.js) · ejemplo actual en 3e7d2ef, desde linea 5.

```javascript
function registration_values(body = {}) {
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const forbidden = ['role', 'is_admin', 'app_metadata', 'user_metadata'];
    if (forbidden.some(key => Object.hasOwn(body, key))) return null;
    if (!name || name.length > 80 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return null;
    return password.length >= 8 && password.length <= 128 ? { name, email, password } : null;
}
```

Fuente disponible y evidencia tecnica: instrucciones de revision conservadas; la fecha de ejecucion anterior no acredita la del mensaje. Evidencia de cambios: [checkpoint 4a217d4](https://github.com/facumartea/dreams/commit/4a217d4f573b4a1ec9f6e1a71ca1aeb48c0155fc) y [PR71](https://github.com/facumartea/dreams/pull/71).

## PROMPT 19 · prueba local con supabase y docker

Fecha: fecha por confirmar

### Pedido del usuario

No se dispone de la consulta breve original por separado. No se reconstruye como cita.

### Instrucciones del director

Pedido consolidado, no literal: proba la aplicacion con supabase local y docker sin tocar produccion.

### Resultado registrado para WORK

La prueba local real se registro en PR72: 46 comprobaciones y estructura sintetica aislada. El ejemplo actual muestra como se comprueba el esquema; esa prueba no creo esta funcion ni cambio produccion.

Archivo: [app/server/app.js](app/server/app.js) · ejemplo actual en 3e7d2ef, desde linea 242.

```javascript
async function database_health(database, product_brand_column = 'brand') {
    const schemas = {
        products: `id,${brand_column(product_brand_column)},name,price,stock,image_url,gender,category,featured,family,size_ml,top_notes,heart_notes,base_notes`,
        profiles: 'id,name,role', reviews: 'id,user_id,user_name,rating,comment,created_at',
        inquiries: 'id,product_id,product_name'
    };
    await Promise.all(Object.entries(schemas).map(async ([table, columns]) => {
        const result = await execute_database_query(() => {
            const query = database.from(table).select(columns, { head: true });
            return typeof query.abortSignal === 'function' ? query.abortSignal(AbortSignal.timeout(5000)) : query;
        });
        if (result.error) throw result.error;
    }));
    return true;
}
```

Fuente: instrucciones de continuacion disponibles en esta conversacion. Resultado: [PR72](https://github.com/facumartea/dreams/pull/72).

## PROMPT 20 · simplificacion y readme breve

Fecha: fecha por confirmar

### Pedido del usuario

No se dispone de la consulta breve original por separado. No se reconstruye como cita.

### Instrucciones del director

Pedido consolidado, no literal: saca los tests y los pagos que no usamos, conserva lo necesario y deja un readme corto.

### Resultado registrado para WORK

PR74 retiro 62 archivos, proveedores y rutas comerciales preparadas. Conservo el checkout academico, Admin, cuentas, carrito y cupones. El README quedo breve y se explico la perdida de cobertura automatizada al retirar la suite.

Archivo: [app/public/js/checkout.js](app/public/js/checkout.js) · ejemplo actual en 3e7d2ef, desde linea 26.

```javascript
async function setup_checkout() {
    const button = document.getElementById('checkout-submit');
    const status = document.getElementById('checkout-status');
    try {
        const response = await fetch('/api/checkout/config');
        const config = await response.json();
        if (!response.ok || !config.enabled || config.provider !== 'presentation_demo') throw new Error('El checkout académico no está disponible temporalmente.');
        await PresentationCheckout.setup(config);
    } catch (error) {
        status.textContent = interface_error(error);
        button.disabled = true;
    }
}
```

Fuente: instrucciones de continuacion disponibles en esta conversacion. Resultado: [PR74](https://github.com/facumartea/dreams/pull/74).

## PROMPT 21 · carpetas y archivos de configuracion

Fecha: fecha por confirmar

### Pedido del usuario

mensaje disponible en esta conversacion:

> porque no eliminas todas las carpetas menos la de public, la de server y supabase?
>
> que son los archivos .mjs, y los .yaml?  son eliminables? y los de la imagen?

### Instrucciones del director

No se identifico una ampliacion del director para esta consulta. La explicacion fue una respuesta del chat, no una orden de borrar archivos.

### Resultado registrado para WORK

Se explico que .mjs sigue siendo JavaScript y que YAML guarda configuracion. La consulta no produjo otra limpieza: los archivos necesarios se conservaron. El ejemplo actual muestra los comandos que dependen de esas piezas.

Archivo: [app/package.json](app/package.json) · ejemplo actual, no cambio producido por esta consulta, desde linea 7.

```json
  "scripts": {
    "start": "node server/server.js",
    "dev": "nodemon server/server.js",
    "check": "node scripts/check.js",
    "ci": "pnpm run check && pnpm run check:functions && pnpm run build:cloudflare && pnpm run build:pages && pnpm run build:official",
    "build:cloudflare": "wrangler deploy --dry-run --env preview --outdir dist/worker",
    "build:pages": "node scripts/build-pages.mjs",
    "deploy:pages": "node scripts/deploy-pages.mjs",
```

Fuente: instrucciones de continuacion disponibles en esta conversacion. Resultado: respuesta explicativa disponible en la conversacion; sin cambio de aplicacion.

## Evidencia que falta

Para fechar los 21 pedidos faltan encabezados o metadatos de los mensajes; no se sustituyen por fechas de commits. Sin consulta breve separada: pedidos 2, 3, 5-7, 10-13 y 17-20. En 4, 8 y 9 hay extractos parciales, no mensajes completos. B01 y el pedido de Railway quedan fuera de la seleccion. El pedido de migracion ya tiene original aportado, pero no fecha. Las preguntas para aprender Node se incluyen en estudio, no como un primer pedido inventado.

<details>
<summary>fuentes y resultados historicos conservados</summary>

Contexto aportado en la version anterior: clases martes y jueves de 11:20 a 13:15, con comedor de 12:15 a 12:45, y comienzo aproximado en agosto/septiembre. No acredita fechas de mensajes, asistencia ni participacion. La entrega indicada para el 12/11/2026 no se presenta como realizada. La aceptacion de Supabase y los apellidos Martearena y Ruas fueron informados por el usuario, no son evidencia de defensa individual.

Los textos siguientes se conservan como antecedentes de versiones anteriores. Sus numeros de pedido y referencias a archivos corresponden a aquellas versiones. B01 no integra la seleccion actual. Los mensajes largos con apartados son instrucciones ampliadas por el director segun la aclaracion del usuario; los informes tecnicos son resultados registrados para WORK, no palabras del usuario. Los extractos A01-A08 y los mensajes de estudio mantienen la identificacion de sus fuentes parciales. No son fallos o instrucciones vigentes por aparecer aqui.

## Limites y fuentes conservadas

Los 18 pedidos no completan toda la historia. No hacen falta mas conversaciones para esos pedidos, pero faltan los mensajes iniciales completos, marcas de fecha de las etapas anteriores y evidencia de preentregas. No se rellenan con fechas de commits ni dias de clase. Si los integrantes conservan esas exportaciones, podran completar las fechas sin cambiar la historia.

La declaracion anterior se consolida aqui. Sus textos originales largos, fuentes y resultados siguen consultables en la [version previa exacta](https://github.com/facumartea/dreams/blob/3305d56dcf307ee69436d9393adef1b0bd6382b6/DECLARACION_PROMPTS.md); no se guarda otra copia o archivo de bitacora. Los extractos originales, resultados historicos y antecedentes de seguridad unicos se conservan debajo. Son antecedentes, no instrucciones para volver a desplegar, habilitar accesos ni recrear documentos retirados. Las fechas de esas notas acreditan lo que cada fuente dice; no corrigen las fechas pendientes de los prompts.

<details>
<summary>extractos originales aportados y limites de su identificacion</summary>

## A. Extractos del adjunto parcial

### A01. Auditoría del Admin

- Fecha del prompt: **sin fecha confirmada**. El archivo parcial está fechado 10/11/2026; no se transfiere esa fecha al mensaje original.
- Tipo: **extracto textual**, completo sólo respecto del fragmento aportado; puede faltar el resto del mensaje y sus capturas.

> necesito revisar y corregir toda la pagina https://dreams-perfumes.pages.dev/admin revisarla muchas veces absolutamente todas las funciones y botones que se pueda hacer toda

- Objetivo: Auditar y corregir controles Admin.
- Resultado/evidencia: Coincidencia temática con PR56, merge 5236ef6 del 03/11/2026; no demuestra fecha ni relación causal exacta de este extracto. [Fuente](#f-bitácora-histórica-consolidada).
- Pruebas del agente: Bitácora y evidencia Admin acreditan pruebas del agente en fases locales/remotas; no se repiten ahora.
- Revisión humana: no acreditada en el adjunto.

### A02. Checkout y cupón

- Fecha del prompt: **sin fecha confirmada**. El archivo parcial está fechado 10/11/2026; no se transfiere esa fecha al mensaje original.
- Tipo: **extracto textual**, completo sólo respecto del fragmento aportado; puede faltar el resto del mensaje y sus capturas.

> quiero que aca aparezca para poner el cupon de descuento

- Objetivo: Aplicar cupón desde el carrito.
- Resultado/evidencia: Coincidencia temática con PR57, merge 6865365 del 03/11/2026. [Fuente](https://github.com/facumartea/dreams/blob/305c5fd6ca0f5a72792c4f5e64fa60ac13a70828/docs/evidence/coupon-academic-20261103/README.md).
- Pruebas del agente: Suite, pruebas locales y Chromium oficial según el informe, diferenciados.
- Revisión humana: no acreditada en el adjunto.

### A03. Formato de vencimiento

- Fecha del prompt: **sin fecha confirmada**. El archivo parcial está fechado 10/11/2026; no se transfiere esa fecha al mensaje original.
- Tipo: **extracto textual**, completo sólo respecto del fragmento aportado; puede faltar el resto del mensaje y sus capturas.

> en la parte del vencimiento que sean cuatro numeros y que se ponga la barra en el medio

- Objetivo: Formatear vencimiento con cuatro dígitos y barra.
- Resultado/evidencia: Coincidencia temática con PR57; formato local y pruebas de pegado/edición acreditadas. [Fuente](https://github.com/facumartea/dreams/blob/305c5fd6ca0f5a72792c4f5e64fa60ac13a70828/docs/evidence/coupon-academic-20261103/README.md).
- Pruebas del agente: Casos de entrada remotos y regresiones de máscaras del agente, según informe.
- Revisión humana: no acreditada en el adjunto.

### A04. Presentación del envío

- Fecha del prompt: **sin fecha confirmada**. El archivo parcial está fechado 10/11/2026; no se transfiere esa fecha al mensaje original.
- Tipo: **extracto textual**, completo sólo respecto del fragmento aportado; puede faltar el resto del mensaje y sus capturas.

> que no dia envio gratis sacale solo la palabra "gratis" que aparezca envio $0

- Objetivo: Cambiar presentación de envío a Envío $0.
- Resultado/evidencia: Coincidencia temática con PR57; no se cambió el costo cero. [Fuente](https://github.com/facumartea/dreams/blob/305c5fd6ca0f5a72792c4f5e64fa60ac13a70828/docs/evidence/coupon-academic-20261103/README.md).
- Pruebas del agente: Totales y resumen hasta confirmación acreditados por el agente.
- Revisión humana: no acreditada en el adjunto.

### A05. Quitar una sección

- Fecha del prompt: **sin fecha confirmada**. El archivo parcial está fechado 10/11/2026; no se transfiere esa fecha al mensaje original.
- Tipo: **extracto textual**, completo sólo respecto del fragmento aportado; puede faltar el resto del mensaje y sus capturas.

> quiero sacar toda esta seccion del inicio

- Objetivo: Retirar una sección de Inicio.
- Resultado/evidencia: No se identifica cuál sin la captura original. PR58/b60e33d retiró colecciones; PR62/60451ca retiró recientes. No se adjudica el extracto a ninguna por suposición. [Fuente](https://github.com/facumartea/dreams/blob/305c5fd6ca0f5a72792c4f5e64fa60ac13a70828/docs/evidence/home-removal-20261103/README.md).
- Pruebas del agente: Existen verificaciones por cada fase; no prueban a qué sección se refería esta cita.
- Revisión humana: no acreditada en el adjunto.

### A06. Cabeceras de colecciones

- Fecha del prompt: **sin fecha confirmada**. El archivo parcial está fechado 10/11/2026; no se transfiere esa fecha al mensaje original.
- Tipo: **extracto textual**, completo sólo respecto del fragmento aportado; puede faltar el resto del mensaje y sus capturas.

> que las tres letras de las 3 secciones sean las mismas y que el ancho de la caja del titulo de cada seccion sea mas "largo" de largo como estaba antes

- Objetivo: Uniformar letras y ancho de cajas de colecciones.
- Resultado/evidencia: Sin correspondencia de implementación exacta acreditada. PR62 quitó párrafos y ajustó composición; eso no prueba que aplicara este pedido tipográfico. [Fuente](https://github.com/facumartea/dreams/blob/305c5fd6ca0f5a72792c4f5e64fa60ac13a70828/docs/evidence/inicio-cabeceras-20261105/README.md).
- Pruebas del agente: No se asignan pruebas del agente a un pedido ambiguo sin su contexto.
- Revisión humana: no acreditada en el adjunto.

### A07. Registro de IA

- Fecha del prompt: **sin fecha confirmada**. El archivo parcial está fechado 10/11/2026; no se transfiere esa fecha al mensaje original.
- Tipo: **extracto textual**, completo sólo respecto del fragmento aportado; puede faltar el resto del mensaje y sus capturas.

> si tambien necesito hacer una declaracion de prompts o similar ayudame a cranear eso

- Objetivo: Preparar declaración/registro de prompts.
- Resultado/evidencia: Bitácora existente y consolidación actual; no hay un resultado histórico exacto vinculado al mensaje. [Fuente](#f-bitácora-histórica-consolidada).
- Pruebas del agente: En esta tanda se comprueban fuentes, sanitización y enlaces; no se acreditan revisiones humanas por esto.
- Revisión humana: no acreditada en el adjunto.

### A08. Material de defensa · extracto del pedido del usuario

- Fecha del prompt: **sin fecha confirmada**. El archivo parcial está fechado 10/11/2026; no se transfiere esa fecha al mensaje original.
- Tipo: **extracto textual**, completo sólo respecto del fragmento aportado; puede faltar el resto del mensaje y sus capturas.

> traducilos estos son auidos de un amigo que hizo la defensa oral y le tomo eso necesito tambien subir un archivo .md con todos los prompts que hice para la pagina hace uno para work y que me ayude a estudiar haciendome un word con las respuesta de todo absolutamente me dijo mi ammigo pero ocn mi pagina y hay que sacar muchisimos archivos del github

- Objetivo: Preparar estudio con temas de audios, registro de prompts y revisión de archivos.
- Resultado/evidencia: Guía adjunta preparada según su texto el 10/11/2026 sobre 60451ca. Esta tarea la contrasta y amplía; no hubo commit previo de ese Word en main. Fuente: guía de estudio aportada; retirada en esta limpieza por indicación del usuario..
- Pruebas del agente: Lectura estática, cotejo de endpoints y revisión de Word/PDF en esta tanda; no nueva QA funcional.
- Revisión humana: no acreditada en el adjunto.


### Mensajes de estudio disponibles

> cuales son todoa los endpoints de nuestro codigo que es un decorador y donde se encuentra y los metodos

> necesito que me hagas un mini resumen de dónde están los Points, cuáles son todos los endpoints que hay en nuestro código cómo modificar la base de datos cómo está conectada a la datos como está conectada subscript todas las preguntas que nos podría ser hacer imagínátetelas y pensarlas, el profe los templates qué es un decorador para qué sirve donde se encuentra cómo se encuentra y todo lo de los métodos qué hay en cada carpeta cómo hacer para crear un usuario borrarlo, autenticarlo

> hacemelo todo en un word y con palabras simples de entender en un lenguaje coloquial pero siempre siguiendo las normas del colegio

> inclui posibles preguntas de node tambien no me escribas las preguntas solo las respuestas como un mini resumen dentro de todo que incluya todo como conectar la base de datos, etc

La guia y sus PDF/Word se retiraron por autorizacion posterior. Estos mensajes conservan la evidencia de que se pidio material de estudio, sin afirmar que el alumnado lo reviso o domina.

</details>

<details>
<summary>resultados y aclaraciones historicas conservadas</summary>

## F. Bitácora histórica consolidada

Procedencia: `docs/entrega-2026/bitacora-ia.md`, [base 8ad5401](https://github.com/facumartea/dreams/blob/8ad5401fe0f2d0c3e501ab203f6ab37b27ff7db1/docs/entrega-2026/bitacora-ia.md). SHA-256 original: `5820af024fb83a510c6c97103951c507840b271a1a18cfa2020e7ade5f362db5`. Se integra su cuerpo, sin el título/banner de reenvío. Los encabezados se subordinan para mantener un único índice. No se transforman resúmenes en prompts literales.

**Lectura histórica:** las referencias a la rúbrica 2026, preentregas, fallos y mecanismos temporales describen esa etapa, no requisitos vigentes de 2025 ni instrucciones para repetirla. Las rutas de archivo que aparecen como texto pertenecen a su carpeta original. La discrepancia de fecha de 29ee9ea se explica en B02; no se corrige silenciosamente el antecedente. No hay revisión humana acreditada por añadir este registro.

Este registro identifica trabajo asistido por IA; no atribuye a los alumnos programación, revisión manual o dominio del código sin evidencia. Las fechas son las documentadas en commits y continuidad, no una reconstrucción de entregas de clase.

| Fecha del registro tecnico, no del prompt | Resumen historico | Resultado y evidencia | Revisión / cambios humanos acreditados |
|---|---|---|---|
| 2026-08-28 | Auditoría de arquitectura, seguridad y preparación de deploy | Entradas de `CHANGELOG.md`, separación de app y validaciones | No hay evidencia adjunta que permita atribuir cada cambio a un integrante. |
| 2026-10-27 | Continuar PR56, recuperar backend funcional y conservar oficial | Reconstrucción, pruebas locales/CI; deploy falló 401, rollback documentado | Usuario informó ajustes de Auth y carga de Secret. Resultado del Secret luego rechazado en uso; no equivale a una reparación exitosa. |
| 2026-10-28 | Diagnosticar bad_length sin exponer claves ni volver a configurar Auth | Sonda privada: espacios internos; HEAD directo/SDK401. `29ee9ea`, evidencia de credencial | Usuario autorizó reparación. No se acreditó reemplazo posterior. |
| 2026-10-28 | Continuar CI y minimizar intervención | `6f54b08` corrige qs; `2b8dcc1` prepara reparador y extracción de registro; CI209/360 PASS | No atribuir esos cambios de código a los alumnos. |
| 2026-10-29 | Priorizar conexiones existentes y una sola carga directa de Secret | `be57610`: continuidad; no dos tokens, no nueva publicación | Usuario pidió menor intervención. Carga directa todavía pendiente al inicio de esta tanda. |
| 2026-10-29 | Cerrar funcionamiento y preparar entrega según PDF2026, máximo40 líneas, wireframe, manual, BD, ZIP | Lectura del PDF original; inventario AST completo, refactorización, carrusel manual, confirmación de persistencia Admin y documentación de entrega | Trabajo de IA sujeto a pruebas; ver commit y resultados finales en `pruebas.md`. Integrantes deben revisar, corregir y defenderlo. |

### Historial que falta

La rúbrica pide bitácora **en cada preentrega** (previa el 2 de octubre). No se dispone de los prompts originales completos ni de una entrega fechada de esa preentrega. `CHANGELOG.md` y Git sirven como evidencia técnica parcial, no prueban asistencia, entrega en Classroom, participación ni revisión individual. Quedan pendientes los registros propios que posean los integrantes y la validación docente.

Para cada revisión futura registrar fecha, prompt fiel, salida aprovechada/descartada, defecto encontrado, prueba y cambio realizado, con autoría acreditada. No completar retrospectivamente como si hubiera ocurrido en clase.

### Aclaraciones recibidas el29/10/2026

El usuario respondió que el profesor aceptó Supabase, confirmó los apellidos **Martearena y Ruas** y pidió continuar las correcciones y subirlas a GitHub sin generar otro ZIP final. La IA actualiza documentación, matriz y footer con esa información. Se conserva la evidencia de extracción anterior y no se atribuye a los integrantes programación o revisión manual no acreditada.

### Reemplazo de clave informado y verificado ·29/10/2026

El usuario informó haber cambiado la clave servidor. La IA verificó la versión actualizada y ejecutó sonda privada acotada heredando ese Secret, sin leerlo: el nuevo valor todavía incluye espacios internos/controlASCII y no permite obtener respuesta HTTP válida; se retiró el Cron y se conservó la oficial restaurada. Se prepararon QA interna opt-in y guardas para no iniciar altas antes de lectura200. No se atribuye este código al alumnado ni se declara reparación o QA remota completada.

### Nueva copia válida y QA real · 29/10/2026

El usuario volvió a copiar la Secret key con el botón Copy y desplegó el Worker. La IA verificó el origen exacto de los bindings heredados y acreditó lectura directa/SDK200 sin transformar el valor ni mostrarlo. Una petición sintética del harness falló por faltar Content-Length; se reprodujo en workerd con fixture, se corrigió sólo el transporte y se aprobaron 398 tests/CI216. Registro, sesiones y parte del carrito pasaron realmente contra Supabase; la invocación larga alcanzó el límite Free de 50 subrequests. La IA dividió la QA en fases cortas con marcadores exclusivos de cuentas QA, sin cambiar el plan, Auth ni la cuenta Admin. Fuente `f2efb1d`, CI217/400 tests. La publicación y las fases restantes todavía no se acreditan en esta entrada. No hay revisión manual de alumnos acreditada para estos cambios.

### Auditoría real del Admin y regresión — 02/11 local, 03/11/2026 UTC

Solicitud: auditar y reparar todos los controles del Admin, conservar la oficial y no repetir pruebas acreditadas. La IA reprodujo el403 de guardado del backend legado y verificó ausencia de alta; corrigió el enrutamiento específico, readback y recuperación sin duplicados. Publicó únicamente la oficial. Detectó con un producto exclusivo QA la coerción stock:null→0 y la corrigió validando tipos antes de convertir;30 regresiones de tipos y476 tests totales pasaron. Prueba remota posterior400 conserva stockQA3. Registro y sesión web, renovación, errores recuperables, carrito, WhatsApp sin envío y checkout académico real pasan en Chromium oficial.

La contraseña Admin aportada como Secret se usa sólo dentro del Worker para login normal; sesión cifrada por KV privado y descifrada sóloRAM. Los incidentes del arnés se identifican como tales, no como defectos de Auth. La retirada del mecanismo/Secret y el resultado del resto de casos se documentan al cierre; no se anticipan aquí. No hay revisión manual ni programación de los alumnos acreditada para estas correcciones.

Cierre acreditado:89casos remotos distintos PASS, nueve fases privadas PASS/281assertions y476tests. Retirados SecretAdmin/Cron/KV/mecanismo; logout real y guardado/imágenes comprobados sobre backend final limpio. Documentación final/manualPDF actualizados por IA. Usuario pidió continuar hasta terminar sin repetir procesos; no se ejecutó de nuevo la QA ya aprobada ni se generó ZIP final.


### Estudios y limpieza posteriores

- PR63: cotejo documental de 46 metodos/rutas y guia; CI252 con 493 tests aprobados, 4 SQL omitidos; no fue nueva QA remota. La fecha 10/11/2026 del registro anterior identifica su preparacion; no se transfiere a todos los pedidos de estudio.
- PR60: auditoria de la rubrica 2025 recibida, 489 tests y comprobacion sin .git; el primer informe provisional previo no se convierte retrospectivamente en lectura de un PDF que aun faltaba.
- PR61: 494 tests, 4 PostgreSQL aparte y 22 checks oficiales de checkout/carrusel, segun su evidencia. El usuario acepta excluir migraciones historicas y rollback del limite de 40; el SQL activo se modularizo con una migracion nueva.
- PR62: 493 tests y 52 checks locales/oficiales, fuente publicada 85147d8. Se retiraron recientes y parrafos visibles sin quitar SEO ni carrusel. Fechas UTC/locales distintas no prueban otra etapa.
- PR64-PR68: traslado de aplicacion a app/, retirada autorizada de capturas, guias de defensa y consignas, manual/API integrados en README y declaracion en raiz. Los archivos necesarios de CI/configuracion permanecen; PR67 sigue pendiente y no se incorpora en esta tarea. grant-google-admin.js y social-card.html se retiraron con evidencia de ausencia de consumidores; no se vuelve a ejecutar esa limpieza.
- PR69: icono iPhone cuadrado y centrado, 497 tests y 4 SQL omitidos, deployment oficial cb0d0913-fd07-4ee2-a7e8-5751889888bb, backend ef043065 sin redesplegar. Verificacion fisica en iPhone no acreditada.
- PR70: 198 a 157 archivos, 41 auxiliares retirados y dos PDF consolidados; 497 tests, 4 omitidos y cuatro builds secos. Main 3305d56 integrado con CI aprobado; sin deployment. CI, dos logos antiguos y providers de payments conservados por decision del usuario.
- Cronologia documentada con discrepancia: 29ee9ea es del 27/10 en Git y una nota anterior lo ubico el 28/10. No se cambia la fecha del prompt por esa diferencia. No se acreditan asistencia, Classroom, programacion o revision humana individual con estas cifras.

</details>

<details>
<summary>antecedentes de seguridad unicos; informes historicos, no fallos vigentes acreditados</summary>

## Antecedentes de seguridad conservados

Los tres textos siguientes son resultados técnicos históricos que acompañan el registro de IA, **no prompts originales ni instrucciones vigentes**. Se conservan para no descartar hallazgos únicos al retirar las carpetas de históricos. No prueban vulnerabilidades vigentes ni que el alumnado haya programado o revisado esas correcciones. Sus fechas y límites son los originales. El resto del historial permanece accesible por los commits citados en este registro. Sólo se normalizan espacios finales para el formato Markdown.

### AUDIT.md · fuente histórica

Fuente: [archivo consolidado anterior](https://github.com/facumartea/dreams/blob/305c5fd6ca0f5a72792c4f5e64fa60ac13a70828/docs/history/auditorias.html). Cuerpo de informe, no cita de un prompt; datos personales, si existían, se omiten.

````text
> Actualización verificada 2026-10-06: estado vigente en CURRENT_STATE.md; evidencias y límites nuevos en [docs/cloudflare_validation.md](https://github.com/facumartea/dreams/blob/6167f35c69ef83b680b8188349a51bd95af3e05a/docs/cloudflare_validation.md), arquitectura/publicación/rollback en [docs/cloudflare_migration.md](https://github.com/facumartea/dreams/blob/6167f35c69ef83b680b8188349a51bd95af3e05a/docs/cloudflare_migration.md). Destino actualizado a Cloudflare por instrucción del usuario; no deploy remoto ni cambio DNS. El contenido siguiente conserva historia y no reemplaza las verificaciones nuevas.

## Revalidación de continuidad — 2026-10-05

Esta sección prevalece sobre las instantáneas históricas que siguen. Repositorio facumartea/dreams, main base 4655b0c; PR #33 sin fusionar. Código y documentación recuperados del SHA base por GitHub; estructura completa inventariada, ramas y commits recientes contrastados. No se inició una aplicación nueva.

| Área | Estado comprobado / límite |
|---|---|
| Frontend | HTML/CSS/JS multipágina, assets de marca y paletas existentes; sin cambios visuales |
| Backend/API | Express 5; factory inyectable; catálogo, marcas, cotización, auth, reviews, consultas, checkout y Admin |
| Auth | Supabase Auth, cookies HttpOnly y refresh, roles en profiles; falta QA real/recuperación/MFA |
| DB | Supabase ACTIVE_HEALTHY, 7 tablas con RLS; 46 productos, 7 perfiles, 1 consulta; otras tablas vacías |
| Esquema | products.marca real frente a brand del código anterior; corregido en límite DB, sin DDL |
| Productos/imágenes | image_url presente en los 46 productos; carga de cada imagen no verificada |
| Carrito | cotización server-side de precio/stock; regresión marca y suite HTTP verdes en CI |
| Checkout/pedidos | demo y Mercado Pago existentes; orders vacía, no se generó compra falsa; cobros Sandbox/E2E pendientes |
| Reviews | modelo general, tabla vacía; cobertura aislada existente; no inventar opiniones |
| Favoritos | retirado previamente, redirecciones conservadas, tabla vacía intacta |
| Cupones | CRUD/cálculo/snapshots existentes y cobertura aislada; tabla vacía, límites/concurrencia pendientes |
| Admin | JWT y RLS existentes; create/update marca probado en DB aislada; sin mutaciones reales |
| Dependencias | CI inicial: 7 avisos, 1 crítico; lock de proxy-addr/morgan/ip-address actualizado; audit final limpio |
| Scripts/build | start/dev/check/test/ci, sin script build; check 29 JS verde |
| Git | rama codex/restore-schema-continuity, PR #33; main intacta, sin force-push |
| CI | run 37403358659 SUCCESS en a20bfcd; frozen install/audit/check y 81/81 tests, cero omitidos |
| Deployment | railway.toml existente; dominio documentado devuelve 404 Railway Application not found; sin acceso conectado |
| Responsive/QA | seis viewports, consola, accesibilidad, performance y QA autenticado real pendientes |

Arranque anterior ejecutaba seed/provisioning automático. Se retiró esa llamada: los reinicios ya no insertan catálogo histórico ni promueven perfiles Admin. seed.js permanece como referencia histórica, fuera del arranque.

No se modificaron productos, precios, imágenes, usuarios, pedidos, cupones, opiniones, políticas o schema remotos. Lecturas SQL verificaron el esquema y que las proyecciones con marca leen 46 filas. Las tablas orders/coupons tienen grants authenticated limitados, protegidos por policies Admin; anon no tiene grants en esas dos tablas.

Advisors: [contraseñas filtradas desactivadas](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) y [helper SECURITY DEFINER callable](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable). El helper verifica auth.uid()/rol y usa search_path vacío; revocar su permiso sin pruebas rompería policies.

Avisos corregidos: [proxy-addr](https://github.com/advisories/GHSA-jqcg-44mw-7w3h), [morgan](https://github.com/advisories/GHSA-9f6g-j8ch-79g4), [ip-address](https://github.com/advisories/GHSA-h3mg-xc3c-68pw), más los otros cuatro avisos reportados por audit de CI en estos mismos paquetes.

Bloqueo concreto de cierre: conectar Railway o identificar dominio activo, recuperar deployment existente sin cambiar proveedor, desplegar código validado y ejecutar smoke/E2E. No declarar el e-commerce listo para ventas reales mientras pagos, inventario/concurrencia y QA integral no se verifiquen.

---

# Auditoría F0 — DREAMS

Fecha de corte: 2026-08-28. Base auditada: `f3533d7fd0efc653eb39a1cfc8b0f39656068254` (`main`).

## Resumen ejecutivo

DREAMS es un proyecto académico migrado parcialmente de SQLite a Supabase. Tiene una tienda catálogo visualmente coherente, filtros, detalle, carrito local, cuenta, favoritos, opiniones, consultas por WhatsApp y un panel Admin. La arquitectura es pequeña y recuperable, pero no está lista para producción.

Los principales bloqueos son XSS almacenado/DOM por renderizado inseguro, un seed que puede sobrescribir datos administrados en cada arranque, un healthcheck que informa éxito sin base de datos, edición Admin rota, dependencia vulnerable sin uso, ausencia total de tests/CI y documentación contradictoria.

## Estado real por área

### Funciona con evidencia local

- Instalación reproducible con `pnpm install --frozen-lockfile`.
- Sintaxis válida en todos los archivos JavaScript.
- Arranque HTTP con variables de entorno sintácticamente válidas.
- Archivos estáticos, `/api/health`, `/api/auth/me`, fallback frontend y 404 API respondieron localmente.
- Catálogo, filtros, detalle, carrito local, cuenta, favoritos, opiniones, consultas y Admin tienen implementación real en código.
- Supabase usa RLS en todas las tablas declaradas y constraints básicos de FK/rangos.
- Cookies son `HttpOnly`, `SameSite=Lax` y `Secure` en producción; Helmet y rate limit de Auth están presentes.
- Railway y lockfile están versionados.

### Funciona a medias

- Healthcheck: responde `200 {status:"ok"}` aunque Supabase no resuelva.
- Auth: guarda access y refresh token, pero nunca usa el refresh; la sesión cae al vencer el access token.
- Registro: crea el perfil desde el servidor, pero ignora el error del `upsert`; puede dejar una cuenta sin perfil.
- Admin: listar, crear y borrar existen; editar está roto porque el formulario no recibe `product-id`.
- Usuarios Admin: el endpoint devuelve siempre `email:null`, por lo que la tabla muestra `null`.
- Carrito: es una selección local para consulta, no un checkout. Precio, stock y datos pueden quedar obsoletos o manipularse en `localStorage`.
- Responsive: hay breakpoints y tablas desplazables, pero no existe evidencia de QA en los viewports requeridos.
- SEO: sólo la portada tiene description; faltan canonical, OpenGraph, sitemap, robots y datos estructurados.

### Roto o riesgoso

- El seed hace `upsert` destructivo de las 31 filas en cada arranque y restaura productos borrados.
- Datos de productos, reseñas, perfiles, consultas y carrito se interpolan en `innerHTML` sin escape.
- El frontend deshabilita el outline de campos sin proveer un foco visible equivalente.
- La carga de reseñas y varios fetch no validan `response.ok` ni tienen estado de error consistente.
- La cantidad del carrito puede superar el stock; no se reconcilia contra servidor.
- El menú móvil no expone `aria-expanded`, no cierra con Escape y no conserva un estado accesible.
- Las políticas SQL no son reejecutables: `create policy` falla si ya existe. No hay migraciones versionadas.

### Simulado, obsoleto o no demostrado

- README y documentación todavía afirman SQLite, bcrypt, express-session, `SESSION_SECRET`, volumen Railway y una API de cotización inexistente.
- No hay pagos, órdenes, checkout transaccional, uploads ni storage; no deben presentarse como terminados.
- No hay pruebas, lint, typecheck, build, CI, PR ni QA documentado.
- El estado del proyecto Supabase, Railway, dominio y logs no pudo verificarse sin acceso a esos servicios.
- La API de GitHub no fue accesible sin autenticación; el remoto Git sí pudo clonarse. Estado de PR/deploy remoto: no verificado.

## Hallazgos por severidad

### Críticos

1. **XSS almacenado/DOM:** datos controlables desde reseñas, perfil y Admin se insertan con `innerHTML`. Un comentario como markup ejecutable puede afectar visitantes y el panel Admin. Evidencia: `public/js/app.js`, `producto.js`, `cuenta.js`, `admin.js`, `carrito.js`.
2. **Integridad de catálogo:** `seed_database` sobrescribe los productos por `(brand,name)` en cada arranque y resucita eliminados. Cambios de precio, stock, imagen y descripción hechos por Admin no son persistentes como fuente de verdad.

### Altos

1. **Healthcheck falso positivo:** `/api/health` y el healthcheck Railway en `/` no comprueban Supabase.
2. **Edición Admin rota:** `fill_form` no asigna `product-id`; guardar intenta un POST y choca con el unique `(brand,name)`.
3. **Dependencia vulnerable:** `nodemailer` 7.0.13, además sin uso, produce 1 vulnerabilidad alta, 4 moderadas y 1 baja en `pnpm audit --prod`.
4. **Sin testing ni CI:** no existe una barrera automática contra regresiones de seguridad, auth, datos o Admin.
5. **Sesión incompleta:** el refresh token queda en cookie pero no se utiliza ni revoca en Supabase al hacer logout.
6. **Spam/abuso:** `/api/inquiries` es público y no tiene rate limit específico; permite escrituras ilimitadas con una clave privilegiada del servidor.
7. **Autorización dependiente de perfil:** fallar silenciosamente al crear `profiles` deja estados inconsistentes; no hay trigger DB que garantice el perfil.

### Medios

- Validación de producto acepta `NaN`, infinitos, decimales en stock/tamaño/intensidad y URLs no HTTP(S); longitudes no se limitan.
- IDs inválidos llegan como `NaN` a Supabase en varios endpoints.
- Toggle de favoritos es read-then-write, no atómico ante concurrencia.
- Errores de Supabase se devuelven textualmente en altas/ediciones Admin.
- Carrito no limita cantidad a stock ni refresca precio/stock desde la API.
- Consulta de carrito no incluye su contenido y usa WhatsApp hardcodeado, ignorando `/api/config`.
- CSP está desactivada; faltan política de orígenes para imágenes/fuentes y controles adicionales.
- El borrado de producto es permanente para relaciones de favoritos; falta estrategia de archivo/auditoría.
- Falta índice para orden de reseñas y una estrategia de búsqueda escalable; no existe trigger de `updated_at`.
- No hay migraciones/seeds separados por entorno ni prueba de RLS contra roles reales.
- Estados loading/error/empty son inconsistentes; varias promesas no capturan errores.
- El CSS elimina foco visible en inputs/selects/textarea; botones y tabs necesitan semántica/estado accesible.
- No hay `prefers-reduced-motion`.
- Imágenes externas dependen de Unsplash y no tienen dimensiones declaradas, `srcset` ni política de licencia resuelta para producción.

### Bajos

- Código servidor concentrado y minificado en un solo archivo dificulta pruebas y mantenimiento.
- Cabecera y footer están duplicados en todas las páginas.
- Fuentes declaradas y fuentes realmente cargadas no coinciden (`Playfair Display`/`Montserrat` no se solicitan).
- Fallback SPA devuelve portada con 200 para rutas frontend inexistentes (soft 404).
- Descripciones meta ausentes fuera de portada; falta favicon/manifest.
- Documentación y comandos (`npm run seed`) no coinciden con `package.json`.

## Datos y Supabase

- Tablas: `profiles`, `products`, `favorites`, `reviews`, `inquiries`.
- FKs y checks básicos: presentes.
- RLS: habilitado en las cinco tablas. Lectura pública sólo para productos/reseñas; perfil/favoritos por propietario. Las escrituras normales pasan por servidor con clave secreta.
- Riesgo principal: al usar `SUPABASE_SECRET_KEY`, todos los permisos dependen del servidor; cualquier endpoint débil omite RLS como defensa efectiva.
- No se detectó secreto real versionado.
- No se pudo ejecutar advisor, consultar esquema remoto ni verificar políticas efectivas por falta de conexión/credenciales Supabase.

## Testing y verificaciones F0

- `pnpm install --frozen-lockfile`: OK.
- Política de supply chain del lockfile: OK.
- `node --check` en servidor y frontend: OK.
- Smoke local sin DB real: 200 en `/`, `/api/health`, `/api/auth/me`; 404 correcto en API inexistente.
- `pnpm audit --prod`: FALLA, 6 vulnerabilidades vía `nodemailer`.
- Unit/integration/E2E: no existen.
- Browser QA, responsive, accesibilidad automatizada, CI y producción: no ejecutados.

## Riesgos de deploy

- Railway puede considerar sana una instancia con Supabase caído.
- Seed destructivo en cada reinicio/deploy.
- No hay pin explícito de versión Node más allá de `>=20`.
- No hay CI previo al deploy ni migraciones automatizadas/registradas.
- Dominio, variables, logs y persistencia remotos no verificados.

## Conclusión

La base es rescatable y el alcance comercial actual es una tienda catálogo con consultas, no un e-commerce transaccional. La prioridad correcta es contener XSS y pérdida de datos, reparar Admin/health/auth y construir pruebas/CI antes de cambios visuales.
````

### SECURITY_ADVERSARIAL_2026-09-01.md · fuente histórica

Fuente: [archivo consolidado anterior](https://github.com/facumartea/dreams/blob/305c5fd6ca0f5a72792c4f5e64fa60ac13a70828/docs/history/auditorias.html). Cuerpo de informe, no cita de un prompt; datos personales, si existían, se omiten.

````text
# Auditoría adversarial autorizada — DREAMS

Alcance: revisión no destructiva de Auth, autorización, sesiones, Supabase/RLS, API, checkout demo, cupones, pedidos, inputs, headers, secretos y rate limits. No se realizó DoS, acceso a cuentas ajenas, borrado de datos, persistencia maliciosa ni obtención de credenciales.

## Resumen

- Críticos: 0
- Altos: 0
- Medios: 2
- Bajos: 1
- Informativos: 2
- Corregidos en esta tanda: 3

## Hallazgos

### MEDIO — Enumeración parcial mediante confirmación pendiente

- VULNERABILIDAD: el login diferenciaba `email_not_confirmed` de credenciales incorrectas.
- COMPONENTE: `POST /api/auth/login`.
- IMPACTO: permitía inferir que un correo estaba registrado y pendiente de confirmar.
- CONDICIONES: proveedor devolviendo ese código y confirmación habilitada.
- PRUEBA SEGURA REALIZADA: prueba de integración con respuesta simulada del proveedor.
- CORRECCIÓN: en modo demo el mensaje es siempre `Correo o contraseña incorrectos.`.
- REGRESSION TEST: `modo demo no enumera usuarios mediante errores de confirmación`.
- ESTADO: CORREGIDO.

### MEDIO — Carrera al resolver dos veces un pedido demo

- VULNERABILIDAD: dos solicitudes simultáneas podían leer `created` antes de que una actualizara el pedido.
- COMPONENTE: `POST /api/checkout/demo-payment`.
- IMPACTO: estado demo no determinístico y segundo procesamiento innecesario.
- CONDICIONES: mismo usuario, mismo pedido y solicitudes concurrentes.
- PRUEBA SEGURA REALIZADA: revisión de la secuencia read-then-update; no se generó carga concurrente en producción.
- CORRECCIÓN: actualización compare-and-set con `id` y `status = created`; una segunda resolución devuelve 409.
- REGRESSION TEST: invariantes de estado cubiertas por suite de checkout y revisión de consulta condicionada.
- ESTADO: CORREGIDO.

### BAJO — Mutación autenticada sin origen explícito

- VULNERABILIDAD: una mutación con cookie podía continuar si faltaban `Origin`, `Referer` y `Sec-Fetch-Site`.
- COMPONENTE: guard global de mutaciones.
- IMPACTO: defensa CSRF menos estricta en clientes que omiten metadata.
- CONDICIONES: solicitud con cookie de DREAMS y sin headers de origen.
- PRUEBA SEGURA REALIZADA: integración local con cookie ficticia.
- CORRECCIÓN: las mutaciones con cookies DREAMS ahora exigen origen/referer válido.
- REGRESSION TEST: `una mutación autenticada sin Origin ni Referer se rechaza`.
- ESTADO: CORREGIDO.

### INFORMATIVO — Confirmación de correo desactivada para demo

- COMPONENTE: registro.
- IMPACTO: cuentas de prueba se activan sin demostrar control del buzón.
- CONDICIONES: `DEMO_AUTO_CONFIRM_EMAIL=true`.
- CONTROL: alta server-side, rol forzado a `customer`, passwords, rate limit, cookies, autorización y RLS permanecen activos.
- ESTADO: ACEPTADO SÓLO PARA DEMO. Antes de venta real: variable en `false` y `Confirm email` habilitado en Supabase Auth.

### INFORMATIVO — Advisor de Supabase

- RLS está activo en todas las tablas públicas.
- `orders`, `coupons` e `inquiries` no tienen policies públicas porque son server-only y se revocaron privilegios de `anon`/`authenticated`.
- Protección de contraseñas filtradas continúa desactivada; requiere habilitación desde Auth cuando el plan del proyecto la permita.
- Remediación oficial: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

## Controles verificados

- Precios, stock, cantidades, descuento y total se recalculan en servidor.
- Porcentaje del cupón no proviene del cliente.
- Pedidos se consultan por `id` + `user_id`.
- Admin depende del rol almacenado en `profiles`, no de `user_metadata`.
- Tablas de pedidos/cupones mantienen RLS y grants server-only.
- Payload de tarjeta demo es rechazado por el servidor.
- CSP no permite `unsafe-inline`; framing, MIME sniffing y downgrade HTTPS tienen cabeceras defensivas.
- Rate limits separados para Auth, checkout, cupones, carrito, consultas, opiniones y webhook.
- Audit de dependencias de producción: cero vulnerabilidades conocidas.
````

### SECURITY_REVIEW_2026-08-29.md · fuente histórica

Fuente: [archivo consolidado anterior](https://github.com/facumartea/dreams/blob/305c5fd6ca0f5a72792c4f5e64fa60ac13a70828/docs/history/auditorias.html). Cuerpo de informe, no cita de un prompt; datos personales, si existían, se omiten.

````text
# Revisión de seguridad y plan de mejora — DREAMS

Fecha de corte: 2026-08-29
Alcance: repositorio, API Express, Supabase/Postgres, autenticación, Admin, frontend público, Railway y requerimientos visuales nuevos.
Entorno revisado: producción en `https://drams-production.up.railway.app` y código del commit `08e15128ca28fe6742536043a7de8b90c2d82ede`.

## Límites de esta revisión

- Se inspeccionó código, configuración, esquema, políticas RLS, advisors, dependencias, respuestas HTTP y estado del deploy.
- No se ejecutaron ataques destructivos, carga intensiva, modificación de datos reales ni pruebas con una cuenta Admin real.
- No se leyeron ni copiaron valores secretos. La revisión sólo confirmó nombres, alcance y uso de variables.
- Esta tanda documenta y prioriza. No cambia todavía datos, dominio, variables ni producción.

## Arquitectura real

- Frontend multipágina en HTML, CSS y JavaScript sin framework.
- Backend Node.js 24 con Express 5.
- Supabase Auth y Postgres como fuente de verdad.
- El navegador usa cookies `HttpOnly`; la clave privilegiada de Supabase queda en el servidor.
- Railway construye y despliega `main`; `/api/health` comprueba API y base de datos.

## Controles que ya están bien implementados

- `helmet` con CSP restrictiva, HSTS, `nosniff`, bloqueo de framing y política de referrer.
- Cookies `HttpOnly`, `Secure` en producción y `SameSite=Lax`; respuestas de auth con `no-store`.
- Validación server-side de credenciales, IDs, cantidades, precios, stock, longitudes y URLs.
- Salida dinámica escapada y URLs de imagen limitadas a HTTPS o assets locales.
- Roles obtenidos desde `profiles`, no desde metadatos editables del usuario.
- Endpoints Admin protegidos por sesión y rol.
- Rate limits específicos para auth, consultas y carrito.
- RLS activo en todas las tablas públicas.
- Dependencias de producción sin vulnerabilidades conocidas en `pnpm audit` al momento de la revisión.
- Errores públicos genéricos y logs reducidos que no copian respuestas internas del proveedor.

## Hallazgos priorizados

No se confirmó una vulnerabilidad crítica explotable durante esta revisión. Eso no significa riesgo cero: faltan pruebas autenticadas y de abuso controlado.

### Altos

1. **Ciclo de vida del usuario Admin ligado al arranque.** `seed.js` busca/crea el Admin desde variables de Railway cada vez que inicia el servidor. No resetea una contraseña existente, pero mezcla una tarea privilegiada de una sola vez con el arranque normal. Debe separarse en un comando manual y auditable.
2. **Falta una segunda barrera para operaciones Admin.** No hay MFA, reautenticación reciente ni auditoría de cambios. El impacto de una sesión Admin robada sería alto, especialmente porque el borrado de productos es permanente.

### Medios

1. **No hay verificación explícita de `Origin`/`Referer` en mutaciones con cookie.** `SameSite=Lax` reduce gran parte del CSRF, pero no sustituye una política explícita y testeada; también queda el caso de login CSRF.
2. **Permisos SQL demasiado amplios para `anon` y `authenticated`.** Las tablas públicas tienen grants generales y RLS evita hoy el acceso indebido. Conviene revocar por defecto y conceder sólo los `SELECT` realmente públicos, como segunda barrera.
3. **El email de acceso Admin se expone públicamente.** `/api/config` devuelve `admin_email`. El contacto público y el identificador de administración deben ser variables distintas.
4. **Opiniones sin flujo completo de publicación y moderación.** La API ya persiste opiniones autenticadas y la tabla existe, pero falta el formulario público, política de duplicados/edición, rate limit específico, moderación Admin y pruebas de persistencia después de recargar.
5. **Borrado permanente de productos.** Puede romper referencias históricas y no deja auditoría. Debe reemplazarse por archivado, salvo borrado excepcional y confirmado.
6. **Seguridad de cuenta incompleta.** Falta recuperación de contraseña, configuración de redirects/SMTP, pruebas E2E de refresh/logout y protección reforzada del Admin.
7. **Protección contra contraseñas filtradas desactivada.** El advisor de Supabase lo marca como advertencia. Debe habilitarse si el plan contratado lo permite; si no, documentar la limitación y compensar con MFA Admin y política de contraseñas.

### Bajos

1. La tabla histórica `favorites` permanece vacía y protegida aunque la función fue retirada. No es una exposición activa, pero agrega superficie innecesaria.
2. Rutas públicas inexistentes pueden terminar en el fallback de `index.html` con 200 en vez de 404, perjudicando observabilidad y SEO.
3. Falta una política documentada de rotación de secretos, respuesta a incidentes y revisión periódica de logs/advisors.
4. No existen tests de integración contra Supabase usando roles `anon`, `authenticated` y servidor privilegiado.

## Estado de las opiniones

La persistencia base **ya existe**:

- `GET /api/reviews` lee `public.reviews`.
- `POST /api/reviews` exige sesión, valida una puntuación de 1 a 5 y un comentario de hasta 1000 caracteres, y guarda usuario, nombre, puntuación y comentario.
- Una publicación anónima fue rechazada correctamente con HTTP 401.
- En producción hay 0 opiniones actualmente.

Lo que falta es la experiencia pública para escribirlas y administrarlas. La implementación recomendada es:

1. mostrar el formulario sólo con sesión iniciada y un CTA de login para visitantes;
2. enviar por la API del servidor, nunca insertar directamente desde el navegador;
3. bloquear doble envío y mostrar estados accesibles de carga, éxito y error;
4. volver a pedir `GET /api/reviews` después del alta para confirmar lo persistido;
5. agregar un límite por usuario e IP;
6. permitir editar la opinión propia;
7. agregar estado `pending`, `published` o `rejected` y moderación Admin;
8. definir si cada opinión es general o pertenece a un producto. La recomendación para ecommerce es una opinión por usuario y producto, editable.

No se debe habilitar una policy pública amplia de `INSERT`: las escrituras deben continuar pasando por el servidor.

## Plan de trabajo por fases

### S0 — Baseline y pruebas de seguridad

- Congelar evidencia actual, añadir matriz de amenazas y casos de abuso.
- Crear tests de `Origin`, CSRF, sesión, roles, errores y límites.
- Añadir integración controlada de RLS con las tres clases de cliente.

**Cierre:** baseline reproducible, tests verdes y ninguna modificación remota.

### S1 — Frontera HTTP y autenticación

- Middleware central para validar `Origin` en todas las mutaciones.
- Mantener cookies seguras y probar renovación, revocación y expiración.
- Separar `CONTACT_EMAIL` de `ADMIN_EMAIL`; retirar `admin_email` de `/api/config`.
- Implementar recuperación de contraseña con redirects permitidos y mensajes no enumerables.
- Preparar MFA obligatorio para Admin y reautenticación para acciones sensibles.

**Cierre:** pruebas de auth/CSRF verdes, cuenta recuperable y ningún dato Admin expuesto públicamente.

### S2 — Supabase y privilegios mínimos

- Migración no destructiva para revocar grants generales.
- Conceder sólo `SELECT` necesario a `products`, opiniones publicadas y perfil propio.
- Mantener `inquiries` y todas las escrituras bajo servidor privilegiado.
- Separar el provisioning Admin del arranque y documentar rotación/revocación.
- Revisar advisors después de la migración.

**Cierre:** migración versionada, prueba de rollback, RLS/grants verificados y advisors revisados.

### S3 — Opiniones persistentes y moderadas

- Definir relación opinión-producto y regla de duplicados.
- Añadir schema de estado/moderación e índices necesarios.
- Crear formulario editorial coherente, edición propia y recarga desde DB.
- Añadir rate limit y panel Admin para aprobar/rechazar/ocultar.
- Probar alta, reload, edición, duplicado, sesión expirada, abuso y XSS.

**Cierre:** opinión persiste tras recargar, sólo aparece según la regla de moderación y Admin puede gestionarla sin borrar historial.

### S4 — Admin y protección de datos

- Reemplazar delete normal por archive/restore.
- Requerir confirmación fuerte y sesión reciente para operaciones destructivas.
- Crear audit log mínimo para productos, roles y opiniones.
- Completar búsqueda, filtros, loaders y errores sin filtrar datos sensibles.

**Cierre:** CRUD seguro, reversible y auditado con E2E de customer/Admin.

### D1 — Contacto, colección femenina e imagen principal

- Cambiar contacto a `[DATO PERSONAL OMITIDO]` mediante `CONTACT_EMAIL` y enlaces `mailto:` en todas las páginas.
- Para `catalogo.html?gender=mujer`, usar título **Perfumes de mujer**, eyebrow **Colección femenina** y metadata específica.
- Mantener negro, marfil y champagne; sumar sólo en esa cabecera un matiz rosa viejo/taupe cálido muy controlado, luz más suave y composición editorial. No cambiar cards, filtros ni identidad global.
- Recrear el frasco DREAMS desde cero en alta resolución. La referencia actual es 684×1020 y el asset usado por la web es apenas 185×272, por eso se pixela al ampliarlo.
- Crear un master vertical de al menos 2048×3072 y derivados AVIF/WebP de 640, 960 y 1440 px, con `srcset`, dimensiones declaradas y fallback.
- Para evitar texto deformado por generación, producir el frasco/escena sin lettering crítico y superponer la marca DREAMS con SVG/HTML nítido.

**Cierre:** contacto consistente, colección femenina reconocible sin salir de DREAMS, imagen nítida en móvil/desktop y sin regresión de performance.

### D2 — Dominio y SEO técnico

- Comprobar disponibilidad de `dreams-perfumes.up.railway.app` y renombrar el dominio Railway con su operación oficial.
- Antes del cambio, actualizar URL base, canonical, OpenGraph, sitemap, robots y redirects permitidos de Supabase Auth.
- Ejecutar smoke completo en el nuevo dominio y verificar certificado.
- Mantener transición o redirección 301 desde el dominio anterior cuando Railway lo permita; no eliminar el dominio viejo antes de verificar enlaces y auth.
- Si el subdominio gratuito no está disponible, usar una variante corta y coherente o un dominio propio.

**Cierre:** HTTPS válido, auth funcional, canonical único, smoke verde y enlaces anteriores tratados.

### S5 — QA, observabilidad y cierre

- E2E de auth, opiniones, catálogo, carrito, Admin y recuperación.
- QA responsive en 390×844, 430×932, 768×1024, 1024×768, 1440×900 y 1920×1080.
- Accesibilidad automatizada y manual, Lighthouse y presupuesto de imágenes.
- Logs/alertas de 5xx y rate limits, backup/restore documentado y checklist de rollback.

**Cierre:** CI verde, deploy SUCCESS, smoke real, QA documentado y sin bugs conocidos dentro del alcance.

## Orden recomendado de ejecución

1. S0 y S1: cerrar frontera HTTP y exposición del email Admin.
2. S2: privilegios mínimos y provisioning.
3. S3: opiniones completas sobre una base segura.
4. S4: Admin reversible y auditable.
5. D1: contacto, colección femenina e imagen de alta resolución.
6. D2: dominio sólo después de auth/SEO configurados.
7. S5: QA final y cierre.

## Estado de implementación

- 2026-08-29: S1 iniciado. Implementada verificación de `Origin`/`Referer` y `Sec-Fetch-Site` para todas las mutaciones, con allowlist exacta mediante `APP_ORIGINS`.
- 2026-08-29: separado `CONTACT_EMAIL` de `ADMIN_EMAIL`; `/api/config` dejó de exponer el identificador Admin y los footers usan el contacto solicitado.
- 2026-08-29: añadidas regresiones de origen, allowlist y configuración pública; suite local 29/29 verde.
- Pendiente dentro de S1: recuperación de contraseña, redirects de Auth y MFA/reautenticación Admin.
- 2026-08-29: añadido formulario de opiniones generales, persistencia confirmada por integración y límite de 5 altas por hora. Edición, duplicados y moderación siguen pendientes.
- S2 bloqueado temporalmente: Supabase CLI no está disponible y el entorno rechazó su descarga. No se creó una migración manual ni se aplicó SQL remoto.

## Decisión funcional pendiente

Antes de implementar S3 sólo hace falta confirmar una decisión de producto: si las opiniones serán generales sobre DREAMS o asociadas a cada perfume. La recomendación técnica y de UX es asociarlas a cada perfume, con una opinión editable por usuario y producto.

## Fuentes técnicas

- Supabase: Product Security, Row Level Security, Sessions, Password Security, Rate Limits, Security Testing y Production Checklist.
- Railway: `railway domain update old-name.up.railway.app --domain new-name` para renombrar un dominio proporcionado por Railway.
````


> Procedencia de la entrada siguiente: PR #67, commit `2ade1033d89110d220e65f564d5eb5de3aa3360c`, todavía sin integrar. Se conserva como antecedente de trabajo y pruebas de esa branch; no describe cambios funcionales incorporados por esta limpieza documental.


</details>

## Revision de esta entrega

- El wireframe conserva 19 paginas, sin la portada; der.pdf conserva solo la lamina original del diagrama. No hay nueva consulta remota ni cambios de esquema.
- Comentarios propios revisados en minusculas y sin acentos. Las instrucciones JavaScript se comparan con parser; los textos HTML/CSS se comparan sin comentarios. No se cambian identificadores ni contratos para dar apariencia humana al codigo.
- No se ejecutan seeds, resets, migraciones, reparaciones de secretos ni altas comerciales. Instalacion y pruebas usan una copia limpia sin .git ni secretos. Arranque conectado bloqueado por falta de un proyecto de desarrollo acreditado; no se usa la clave de produccion.
- Tests, CI, SQL, configuraciones y providers conservados. La oficial permanece intacta; cambiar comentarios altera bytes del build, pero no se publica por rutina. Los resultados finales y el inventario por carpeta se entregan en la PR de esta tarea.
- Revision humana del codigo por integrantes: no acreditada.

- Resultado comprobado de esta revision: 18 fragmentos de 5 a 40 lineas coinciden exactamente con sus archivos; 108 archivos JavaScript con el mismo arbol de instrucciones, 123 comentarios revisados. Instalacion, sintaxis, inventario y cuatro builds aprobados; 497 tests aprobados, 4 SQL omitidos, 0 fallos. Doce checks de navegador con fixtures locales en movil/escritorio; no QA remota. El arranque sin variables obligatorias termina con salida 1; conexion de desarrollo BLOQUEADA.
- Primer ensayo: retirar un bloque CSS comentado y comentar por fuera de la plantilla del pie rompio tres comprobaciones de fuente. Se restauraron esos contenidos y la suite volvio a aprobar, sin cambiar sus aserciones ni habilitar estilos que estaban comentados.


## Actualizacion tecnica local · 12/11/2026

Esta nota es evidencia de ejecucion, no un prompt nuevo ni una fecha atribuida a los 17 pedidos pendientes. El usuario autorizo una instancia temporal local aislada; no aporto aun las capturas historicas. La bitacora permanece parcial y el pedido 1 sigue respaldado solo por un resumen.

Se verifico el codigo de da5df12 desde copia limpia con Supabase local real: PostgreSQL 17.11, GoTrue 2.197.0, PostgREST 16.5 y CLI 3.1.0. Las ocho migraciones aplicaron sobre una base inicialmente sin usuarios ni productos. Solo se crearon cuentas y productos sinteticos; las claves locales y contrasenas de prueba se manejaron en memoria. No se copiaron datos, usuarios o secretos de produccion.

Resultado: 46 comprobaciones PASS de arranque, catalogo, registro normal, perfil customer, login, sesion/refresh/logout, permisos Admin, lecturas de modulos, busqueda/stock bajo, alta, imagenes y persistencia. Se conserva el FAIL del arnes que esperaba Cuenta en el logout Admin: el codigo navega a Inicio. Se completo el cierre con la expectativa correcta, sin cambiar la aplicacion. La preparacion tuvo fallos de espacio en vfs y de proxy del healthcheck; se resolvieron en las imagenes temporales, sin omitir el control de salud ni alterar el binario Auth.

Los cuatro tests SQL ya aprobados en PostgreSQL aislado se conservan como ejecucion separada; no se repitieron ni se presentan como parte de otra suite nueva. Tampoco se repitieron limpieza, comentarios o builds acreditados. Se preparo una correccion documental del README; no se detecto un fallo de codigo que exigiera cambio funcional en estos recorridos.

Cierre: tres cuentas y nueve productos sinteticos, cero sesiones activas; instancia temporal retirada con sus volumenes y red. Oficial sin deployment ni cambios de configuracion. La evidencia no acredita programacion manual, revision del alumnado, fechas de mensajes o una entrega academica realizada.


## Ampliacion de comentarios y material personal de estudio · 12/11/2026

Continuacion de la entrega: se reutilizan los 46 checks locales reales y los cuatro SQL ya acreditados. La PR72 documental se integra antes de ampliar comentarios. La solicitud actual pide explicar responsabilidades, reglas y errores en comentarios simples, revisar descartables de app/ y preparar una guia personal fuera del repositorio. Esta nota no convierte las 17 fechas pendientes en fechas confirmadas ni sustituye el original ausente del pedido1.

Se mantienen intactos identificadores, contratos, textos visibles, migraciones aplicadas y configuracion de produccion. Las explicaciones de SQL activo se agregan en README en vez de editar migraciones. El Word y el PDF se entregan como archivos personales; no se recrean guias de defensa en docs/. No se atribuyen redaccion o programacion manual ni dominio del contenido a los integrantes. Los resultados y el inventario final se registran en la PR correspondiente.


## Simplificacion autorizada de herramientas y pagos preparados

El pedido actual autoriza retirar la suite y sus fixtures tras conservar la verificacion previa, advirtiendo la perdida de cobertura automatizada futura. Tambien pide retirar los proveedores comerciales no usados y conservar el checkout academico, cupones y consulta de pedidos existentes del Admin. La ampliacion posterior solicita un README breve, con instalacion, uso, API, disenos e integrantes, sin trasladar el texto retirado a nuevos informes.

Esta es una consolidacion identificada de las instrucciones disponibles, no una cita literal ni una fecha asignada a pedidos historicos. Las referencias anteriores a tests, QA y proveedores describen versiones recuperables en Git y pueden apuntar a archivos retirados de la version actual. Se conserva su evidencia unica; no se afirma que una suite eliminada siga aprobando. Resultados y rutas exactas se registran en la PR, sin crear otro informe en el repositorio.


</details>
