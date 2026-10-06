# Continuación de preview PR34 — 2026-10-06 (America/Buenos_Aires)

- Revisión de PR34/HEAD fdbca5a y CI del mismo SHA: SUCCESS, run 37530792193; no cambios en código de aplicación.
- Reejecutado build preview dry-run correctamente; auditada separación de credencial servidor y assets públicos.
- Acceso comprobado sin revelar valores: Wrangler no autenticado; entorno sin bindings de credenciales; secretos remotos no consultables.
- Iniciado OAuth por dispositivo con scopes acotados; actualizada guía segura de configuración, credencial Supabase requerida y matriz de validación remota pendiente.
- Advertidos efectos reales de registro/reparación de perfiles y checkout demo; no se ejecutaron mutaciones, correos, pagos, DNS ni deploy.

# Recuperación y migración Cloudflare — 2026-10-06

- Recuperada base PR33, sin mezclar PR32: compatibilidad marca/brand, seed retirado del arranque y dependencias corregidas.
- Aislados login/registro/logout; agregadas regresiones de dos usuarios, refresh y revocación/cookies.
- Health verifica columnas/tablas críticas, incluido checkout configurado, con timeout; sin DDL ni escrituras a Supabase.
- Corregidos historial corrupto/storage bloqueado, filtros fuera de orden/reintentos, errores de pestañas/logout y doble envío de cupones Admin; copy de demo ajustado y timeout MP. Home consulta 8 productos.
- Agregado adaptador Workers + Static Assets, entornos separados, empaquetado Admin privado, headers/no-store y pruebas de runtime con fixtures HTTP aisladas.
- Documentadas variables, limitaciones, publicación de prueba, promoción y rollback. Historia preservada en docs/history.
- Suite final ejecutada: 89/89; check 32 JS/MJS; audit prod limpio; build preview dry-run correcto; 66 navegaciones en seis viewports sin pageerror/overflow. Resultados finales y CI se registran en CURRENT_STATE.
- Commit f0d52d6 publicado y PR34 abierta; CI implementación SUCCESS (run 37530615797).
- No deploy remoto, DNS, merge, cambio de datos ni configuración Supabase/Railway realizados.

# Changelog

### 2026-10-05 — Recuperación del estado real y compatibilidad de esquema

- Contrastado main 4655b0c con Supabase: products tiene marca, no brand, y conserva 46 productos/7 perfiles/1 consulta.
- Adaptado el límite DB para catálogo, filtros, búsqueda, marcas, detalle, carrito y Admin, conservando brand en el contrato HTTP.
- Arranque detecta marca/brand mediante sólo lecturas y falla ante errores reales; ya no ejecuta seed ni provisioning Admin.
- Añadidas regresiones unitarias y HTTP con esquema marca; tests del servidor dejan de importar el bootstrap con credenciales ficticias.
- Conservados frontend, assets y datos. No hubo migraciones ni mutaciones remotas.
- CURRENT_STATE reescrito como checkpoint comprobado y PLAN/AGENTS alineados; historial anterior permanece aquí.
- Detectado dominio Railway documentado caído: APIs devuelven 404 Application not found. Sin acceso Railway, no hubo deploy.
- Instalación local bloqueada por ENOENT de escritura; check de 29 JS y 21/21 unitarios locales PASS.
- CI inicial detectó 7 avisos (1 crítico/6 moderados). Corregidas exclusivamente las versiones del lockfile: proxy-addr 2.0.8, morgan 1.12.1 e ip-address 10.7.1, con integridades verificadas en npm.
- CI 37403358659 SUCCESS sobre a20bfcd: instalación frozen, audit sin vulnerabilidades conocidas, check 29 JS y 81/81 tests PASS. PR #33 abierto, sin merge/deploy.

### 2026-09-08 — Base SEO técnica y 404 real

- Añadidas descripciones, canonical y OpenGraph a las páginas públicas indexables del dominio `dreams-perfumes.up.railway.app`.
- Catálogo y producto actualizan título, descripción, canonical y OpenGraph con la colección o el producto real, sin modificar datos ni interfaz.
- Añadidos `robots.txt` y `sitemap.xml`; cuenta, carrito, checkout, resultados y Admin quedan fuera de indexación.
- Las rutas web inexistentes ahora responden HTTP 404 con una página DREAMS dedicada; ya no devuelven silenciosamente la portada con 200.
- Verificación local: sintaxis de 26 JavaScript, 76/76 tests y audit de producción sin vulnerabilidades conocidas. CI/deploy pendientes.

### 2026-09-08 — QA Admin autenticado y renovación segura del bundle

- QA autenticado no destructivo en producción confirmó dashboard, 30 productos y carga del formulario de edición para un ID real sin el antiguo `Producto no encontrado`.
- Detectado un problema de actualización del cliente: el alias versionado `/js/admin-image-preview-v2.js` seguía estable aunque `admin.js` había evolucionado, por lo que navegadores con caché podían ejecutar una versión anterior.
- El Admin pasa a cargar `/js/admin-console-v3.js`, servido desde el mismo `admin.js`; no se duplicó lógica ni se modificaron productos, usuarios, pedidos, cupones u opiniones.
- Añadida regresión que exige el alias nuevo y comprueba que `reset_form` abandone el modo edición, limpie el ID y restaure `NUEVO PRODUCTO`.
- Verificación local: frozen-lockfile PASS, audit sin vulnerabilidades, sintaxis de 26 JavaScript y 74/74 tests PASS.
- Commit funcional `8e5bd7726fb96872e8d8789035626066444b477a`; PR #29 pasó CI #83 y se fusionó como `6bcfa0b82b2c3b04e8b5c10d40ba8ac3c5789559`.
- Railway desplegó exactamente el merge en `22bed787-07e9-43e8-8b03-241513d3c6e1` con estado SUCCESS.
- Smoke autenticado post-deploy: edición de producto #198 carga todos los datos y preview; `Limpiar` restaura `NUEVO PRODUCTO`, vacía el formulario y oculta el preview sin guardar. Todos los módulos Admin existentes cargan; no se mutó ni eliminó información real.

### 2026-09-08 — Refinamiento premium de la colección Mujer

- Cambiado el encabezado de `Perfumes de Mujer` a `Fragancias Femeninas`, conservando el subtítulo editorial existente y el mismo sistema de variantes.
- Reemplazada la base anterior por una paleta más cálida y femenina: crema `#f3ebdd`, negro cálido `#1f1a17`, card `#f8f1e8`, dusty rose `#8c4450`, CTA coral profundo `#a84e5b`, hover borgoña `#8e3f4b` y dorado secundario `#7a5b2c`.
- El CTA `Agregar al carrito` de Mujer mantiene su lógica y recibe contraste AA, hover discreto y foco visible; las cards usan borde rosa/champagne fino y sombra mínima sólo al hover.
- Hombre y Unisex no cambiaron. No se duplicó `ProductCard`, no se modificaron datos, Supabase, carrito, filtros, navegación, Admin ni checkout.
- Contrastes calculados: título 14,56:1, texto secundario 5,52:1, CTA 5,10:1 y hover 6,73:1.
- Verificación local: instalación con lockfile congelado, `check` sobre 26 JavaScript, 74/74 tests PASS y `pnpm audit --prod` sin vulnerabilidades conocidas.
- CI #78 falló exclusivamente por dos avisos moderados nuevos en la dependencia transitiva `qs` 6.15.3. Se elevó únicamente el lockfile a `qs` 6.16.0 y se repitió toda la validación local con resultado PASS.
- Commits `11ef546f7c5cc126bbe065991658813a5f0f1140` y `4a38a17839c9497d214325088eefa7457b22fc2f`; PR #27 validado por CI #79 y fusionado como `16ef40ebcd72f7674d6c64d56b76f3b0b002da9c`.
- Railway deployment `ea1d0e74-2d24-4efe-a04f-bd5372ef126e` terminó SUCCESS sobre el merge exacto.
- Smoke visual 1363×936: `Fragancias Femeninas`, 10 cards, colores desplegados correctos, CTA coral, imágenes sin fallback activo y sin overflow horizontal. La matriz completa de seis viewports sigue pendiente.

### 2026-09-02 — URLs externas de imagen en Admin

- Confirmado sin mutar productos reales que `image_url` sí se persistía; el fallo era de validación/renderizado: se aceptaban páginas de resultados de Google, CSP sólo permitía Unsplash y el error se reemplazaba silenciosamente por el fallback DREAMS.
- El backend conserva rutas locales y URLs HTTPS directas, rechaza páginas `/imgres`/`/search` de Google y devuelve un error claro. No realiza fetch server-side de URLs externas, evitando SSRF.
- Admin incorpora preview real antes de guardar, deshabilita Guardar mientras la imagen no carga y usa `referrerpolicy=no-referrer` para reducir bloqueos de hotlink.
- CSP permite imágenes HTTPS externas; el fallback público continúa protegiendo el layout pero ahora muestra `Imagen no disponible` en vez de ocultar el fallo.
- PR #24 pasó CI #72, fue fusionado como `e94714d2c871a64d3355be624d8ea13572b4e9dc` y Railway desplegó `640a3233-10fb-49ee-8f10-456c0e96530c` con estado SUCCESS.
- El primer smoke de producción validó Unsplash, Wikimedia, URL inválida, página HTML y Google Images sin enviar el formulario. También reveló que un host que bloqueaba hotlinking podía dejar el preview indefinidamente en `Comprobando imagen…`.
- PR #25 añadió un timeout fail-closed de 6 segundos, mantuvo Guardar desactivado ante hosts lentos/bloqueados y versionó el asset Admin para evitar caché. CI #74 pasó y se fusionó como `89d795ce4d9477719e1cda4aac2e6f2221a377d2`.
- Railway desplegó el merge exacto en `3011a2d6-4f75-4a90-bba3-81012d9c1e50` con estado SUCCESS.
- Smoke final de seis casos: Unsplash y Wikimedia directas válidas; texto inválido, HTML, Google `/imgres` y servidor 403/bloqueado rechazados con mensaje claro. No se guardó ni modificó ningún producto real.

### 2026-09-01 — Reparación Admin y variantes premium por categoría

- Diagnosticado con evidencia de Railway que `PUT`/`DELETE /api/admin/products/:id` recibían IDs válidos pero devolvían un falso 404; los productos seguían existiendo en Supabase.
- Las mutaciones de productos y opiniones ahora usan el JWT del administrador y políticas RLS verificadas, sin exponer `service_role`, sin desactivar RLS y sin ampliar tablas server-only.
- Aplicada la migración `admin_authenticated_policies`: helper seguro por `auth.uid()`/rol y policies Admin para productos, opiniones, perfiles, consultas, pedidos y cupones. Pedidos/cupones conservan sus grants server-only.
- Editar distingue ID inexistente de una denegación/configuración de permisos; Eliminar verifica existencia, exige confirmación, bloquea doble click y actualiza la UI sin reload.
- Formulario de producto admite rutas locales o HTTPS, conserva validaciones server-side de stock/precio/intensidad y mantiene hard delete por compatibilidad; archive/restore sigue pendiente.
- Agregada gestión Admin persistente de opiniones: búsqueda, edición de rating/texto y eliminación confirmada. Ocultar/moderar no se simula porque el schema actual no tiene estado de visibilidad.
- Agregada vista Admin de pedidos existentes, estrictamente de solo lectura y basada en datos reales.
- Hombre, Mujer y Unisex continúan usando un único `ProductCard` y tokens compartidos: Hombre usa card `#f4f1e9` y título 600; Mujer base crema `#e8ddcf` y champagne `#a8874e`; Unisex piedra/carbón `#24221f` + `#d8d0c4`.
- Verificación local: check de 26 JavaScript y 69/69 tests PASS, incluidos CRUD de productos, 404 real, rechazo de usuario normal, persistencia de opiniones, RLS y variantes visuales.
- Commits `1a0a1c8eb126b913776220d7650af6f7dfd34eee` y `030172930baea7540681b3ebf8604ce39c79d6ed`; PR #19 validado por CI #50 y fusionado como `edba64d8d4641c91e68e7b0d94165adc040e4482`.
- Railway deployment `fd40779b-1ad1-402d-9c60-9aba64a886f3` terminó SUCCESS sobre el merge exacto.
- Smoke público: health/API/DB 200, catálogos Hombre/Mujer/Unisex 200 y acceso anónimo a Admin correctamente rechazado con 403. No se realizaron mutaciones sobre datos reales.

Todos los cambios relevantes de DREAMS se registran aquí. El proyecto aún no usa releases semánticos.

## Unreleased

### 2026-09-01 — Colecciones editoriales y confirmación robusta del checkout demo

- Unificada la lógica visual de Mujer, Hombre y Unisex mediante una sola configuración y tokens compartidos; cada colección conserva una dirección propia sin duplicar páginas, componentes ni datos.
- Mujer usa crema/marfil y rosa viejo controlado, Hombre carbón cálido y champagne sobrio, y Unisex grafito/taupe editorial; títulos y cards siguen usando el mismo catálogo real.
- El checkout demo guarda el ID del pedido antes de procesarlo y reanuda ese mismo pedido tras errores de red o interrupciones, evitando altas duplicadas.
- La confirmación aprobada muestra un check sobrio, el mensaje `Pago realizado con éxito` y un número de compra determinístico basado en el pedido persistido; sólo entonces limpia carrito y cupón.
- Aumentada discretamente la rotulación HTML/CSS `DREAMS / EAU DE PARFUM` del frasco del hero, sin cambiar composición ni asset.
- Añadidas regresiones de arquitectura de colecciones, orden interrumpida/idempotente, número de compra y rotulación. Verificación local: check 25 archivos, 63/63 tests y audit de producción verde.
- Commit `771aae40f2ac049eec7085c6eb0e792837697bb6`; PR #18 validado por CI #48 y fusionado como `f79080cc78c5fd3487bff73a0d237063749054e9`.
- Railway deployment `d091a7ac-1208-40a9-a224-24a83bfb8f5a` terminó SUCCESS sobre el merge exacto.
- Smoke público 1363×936: home, checkout y las tres colecciones sin overflow ni errores de aplicación; 11 productos de Mujer, 18 de Hombre y 2 Unisex. No se declara compra autenticada ni matriz completa de seis viewports.

### 2026-09-01 — Limpieza del home y corrección de altura del hero

- Retirado por pedido de producto el bloque claro de diseñador/nicho con perfume rosa; el home continúa directamente desde Más buscados hacia Sobre DREAMS.
- Corregida la causa del espacio negro bajo el contenido principal: en desktop, el hero ahora ocupa exactamente el viewport disponible y la imagen deja de imponer su proporción vertical a toda la fila.
- La declaración editorial posterior al hero permanece visible de forma inmediata en vez de ocultar todo el contenedor hasta que IntersectionObserver lo active.
- Eliminados estilos y listeners exclusivos del bloque retirado; no se agregaron dependencias ni contenido de relleno.
- Agregada regresión específica. Verificación local: sintaxis de 25 JavaScript, 60/60 tests y audit sin vulnerabilidades conocidas.
- Commit `a2cd43e9cf46aa8fc2f10da5e343647b093f4622`; PR #16 pasó CI #44 y fue fusionado como `a42849163837b4389efef42dc15273cf93ab474e`.
- Railway deployment `8282f8d9-c4bf-4d64-8ab4-304fde1b77e1` terminó SUCCESS.
- Smoke 1363×936 confirmó hero ajustado exactamente al viewport útil, columnas alineadas, texto editorial visible, sección retirada y cero overflow horizontal. La matriz de seis viewports no se declara ejecutada porque el navegador actual no permite redimensionar.

### 2026-09-01 — Dirección de arte: motion foundation y Scent Trail

- Auditadas portada, catálogo, producto y flujos globales en ART_DIRECTION_AUDIT_2026-09-01.md; se preserva el sistema visual existente y se descartan WebGL/Three.js, 360° y transiciones que retrasen la compra por falta de un caso o assets adecuados.
- Centralizados tokens de duración y easing sin instalar dependencias ni crear un segundo motor de animación.
- El hero incorpora una iluminación champagne tenue que comparte el requestAnimationFrame del pointer depth existente; touch y prefers-reduced-motion la simplifican o eliminan.
- Las notas reales del producto ahora forman un DREAMS Scent Trail semántico: salida, corazón y fondo en timeline horizontal/vertical, con contenido siempre accesible.
- Verificación local: 25 archivos JavaScript, 59/59 tests y audit de producción sin vulnerabilidades conocidas.
- Impacto medido: CSS 9.882 bytes gzip y motion 1.881 bytes gzip; aproximadamente +538 bytes gzip combinados frente al checkpoint anterior, sin nuevas dependencias ni listeners de scroll.
- Commit funcional `d3d12eec5da7d3649bc81f4189b1d94946235200`; PR #14 validado por CI #39/#40 y fusionado como `fe67828d775f485d58fbd2e6eba5d6e8f96106d5`.
- Railway deployment `a661581e-e804-4390-9355-0ec7d8673e50` terminó SUCCESS sobre el merge exacto.
- Smoke público confirmó motion y hero nuevos, imagen cargada, Scent Trail real en producto #31 y ausencia de overflow en portada/detalle. El endpoint JSON de health quedó bloqueado por el navegador y no se declara comprobado directamente.

### 2026-09-01 — Auth demo inmediato, motion cinematográfico y hardening adversarial

- Añadido `DEMO_AUTO_CONFIRM_EMAIL`: el registro demo crea una cuenta confirmada server-side, fuerza rol `customer`, inicia sesión y elimina el paso de correo; el flujo tradicional queda disponible al desactivar la variable.
- La cuenta explica que el modo demo se activa al instante y el login deja de revelar específicamente `email_not_confirmed`.
- Inspeccionada visualmente la referencia Xerjoff/Lamborghini en desktop: hero fijado, producto con desplazamiento diferencial, escala de título, imágenes contrapuestas y ritmo de scroll.
- Extendida la implementación existente, sin librerías nuevas: entrada escalonada, parallax por scroll con un único RAF, reveal por bloque, desplazamiento/escala editorial y fallbacks touch/reduced-motion.
- Impacto bruto medido: +5.306 bytes entre JS y CSS; gzip actual aproximado 1.811 bytes para motion y 9.414 bytes para CSS.
- Auditoría adversarial autorizada documentada en `SECURITY_ADVERSARIAL_2026-09-01.md`: 0 críticos, 0 altos, 2 medios, 1 bajo y 2 informativos.
- Corregidas enumeración parcial por email no confirmado, mutaciones autenticadas sin origen explícito y carrera al resolver dos veces un pedido demo.
- Supabase `ACTIVE_HEALTHY`; RLS habilitado en todas las tablas. Advisors conservan el WARN de protección de contraseñas filtradas y tres INFO server-only intencionales.
- Verificación local: 25 archivos JavaScript, 58/58 tests y audit de producción sin vulnerabilidades conocidas.

### 2026-08-31 — Checkout demo, motion premium y auditoría de expansión

- Añadido proveedor interno `demo` desacoplado de Mercado Pago con estados aprobado, rechazado, pendiente y error; no realiza cobros ni requiere secretos.
- El formulario usa únicamente datos ficticios, valida la tarjeta en el navegador y envía al servidor sólo el pedido y escenario; PAN, vencimiento y CVV no se transmiten ni persisten.
- Añadido endpoint autenticado para procesar un pedido demo una sola vez y persistir el resultado en `orders`.
- Aplicada en Supabase la migración `enable_demo_checkout_provider`, que amplía el constraint de proveedor sin eliminar Mercado Pago; RLS y grants server-only fueron verificados.
- Incorporados reveals, profundidad leve en hero, spotlight editorial, botones magnéticos mínimos, hover de cards y feedback del carrito mediante CSS/JS liviano, sin dependencias nuevas y con fallbacks touch/reduced-motion.
- Sanitizado `.env.example`: se retiraron valores reales y quedaron únicamente placeholders. La rotación de cualquier credencial que haya estado en historial sigue siendo obligatoria.
- Auditadas las diez expansiones premium en `PREMIUM_EXPANSION_AUDIT.md`; hero/cards se reutilizan, quiz/configurador compartirán motor, y no se implementará 360° real sin assets adecuados.
- Revisado `public-apis/public-apis`; no se integró una API sin un caso real de logística, moneda o validación.
- Verificación local: sintaxis de 25 archivos, 53/53 tests y audit de producción sin vulnerabilidades conocidas.
- Commit funcional `efc2c4eca3f07862b7302f892f5e3c751613c74e` y corrección CI `0dede4bcae63924fca031526041ac3d5a8f9bff9`; PR #10 pasó CI #30 y se fusionó como `773fd8fa6269ceb02b4655c6f7956b19790991b6`.
- Railway configuró `CHECKOUT_PROVIDER=demo` y desplegó `bfabd1dc-fdd6-4b75-a781-f1a496535df2` con estado SUCCESS.
- Smoke público confirmó checkout demo, aviso sin cobros, tarjeta ficticia, cupón y acceso obligatorio; no se enviaron datos de pago ni se creó un pedido falso.

### 2026-08-31 — Pedidos persistentes, botón Comprar y cupones

- Aplicada en Supabase la migración `20260831024826 checkout_orders_and_coupons`: tablas `orders` y `coupons`, RLS, grants exclusivos de servidor, constraints, triggers e índices; ambas quedaron vacías después de una prueba transaccional con rollback.
- El carrito reemplaza el CTA principal de WhatsApp por `Comprar`; WhatsApp queda como alternativa secundaria y el botón sólo se habilita con checkout realmente configurado.
- Checkout incorpora cupón en mayúsculas, aplicar/quitar, estados accesibles, persistencia en `sessionStorage` y desglose Subtotal/Descuento/Total.
- El servidor valida existencia/estado, recalcula el descuento y vuelve a verificarlo al crear el pedido; el cliente nunca envía porcentajes confiables.
- Los pedidos guardan snapshot del cupón y Mercado Pago recibe exactamente el total final descontado.
- Admin incorpora sección Cupones con crear, editar, activar/desactivar, eliminar y listado completo.
- Railway recibió `APP_BASE_URL`, modo Sandbox, schema ready y datos de prueba con redeploy diferido. Siguen ausentes el access token y secreto Webhook, por lo que el checkout permanece cerrado de forma segura.
- Check de 22 archivos, 48 pruebas y audit de producción verdes antes de publicar.
- Commit funcional `292fc13e33855f8387c90ffb4bf32f7e9d1a53d0`; PR #8 validado por CI #25 y fusionado como `ac66917edae49b1e272d51e07b09fe55fe075c32`.
- Railway desplegó `31c062ae-ea05-4cdb-a53b-06f28b543e38` con estado SUCCESS; healthcheck, carrito, assets y checkout respondieron correctamente.
- El checkout continúa cerrado de forma segura hasta configurar el access token y secreto Webhook oficiales Sandbox; no se afirmó ninguna compra real.

### 2026-08-30 — F11 parcial y base segura de Checkout Sandbox

- La colección femenina ahora aplica una cabecera marfil/rosa viejo más clara, navegación oscura y acentos cálidos en filtros/cards sin salir de la identidad DREAMS.
- Ajustados hero `picture`, touch targets de 44 px, carrito, filtros, footer y espaciado para 390/430 y grillas amplias; la matriz visual real de seis viewports no pudo completarse porque el navegador disponible no expone cambio de viewport.
- Agregadas pantallas premium de checkout y resultado, visibles sólo con feature flag seguro.
- Creada una capa Mercado Pago desacoplada con Preferences API, idempotencia, URLs de retorno, consulta server-side del pago y Webhook HMAC.
- Estados implementados: aprobado, rechazado, pendiente, cancelado y error; el carrito sólo se vacía tras confirmación aprobada.
- La cotización se recalcula en servidor y se valida importe, moneda, referencia y `live_mode` antes de actualizar un pedido.
- Preparado modelo persistente `orders`, pero no se creó/aplicó la migración: el entorno volvió a bloquear la descarga de Supabase CLI. `CHECKOUT_SCHEMA_READY` mantiene el flujo cerrado.
- Railway no contiene variables Mercado Pago; sin credenciales Sandbox no se afirmó ni simuló una compra real.
- Suite ampliada a 39 pruebas: estados, firma, preferencia sin secreto en payload, error HTTP/red, feature flag y regresión UI; check y audit verdes.
- Roadmap extendido con F18 y pesos corregidos a un total real de 100%; progreso recalibrado de 71% informado históricamente a 67% (66,70% exacto) por alcance nuevo y corrección aritmética.
- Commit `5891d24c7693bb127e35e4cb33c565deb59a8021` publicado en `codex/checkout-sandbox-foundation`; PR #7 validado por CI #23 y fusionado con autorización como `5f63bcd4ad3597f1b0f4ef30c73b85ba2ec88929`.
- Railway deployment `f2ae64db-aef1-431b-8e2c-e820a8da2408` terminó SUCCESS sobre el merge exacto.
- Smoke posterior: health/API/DB 200, configuración checkout 200 con cierre seguro `enabled:false` y pantalla `/checkout.html` 200. No se activó ni simuló Mercado Pago sin schema y credenciales oficiales Sandbox.

### 2026-08-30 — Colección femenina y hero de alta resolución

- Reemplazado en portada el asset de 185×272 ampliado por un producto editorial original de 1024×1536, conservando frasco negro, metal champagne, piedra y fondo oscuro.
- Generados derivados WebP responsive de 640 px (18.840 bytes) y 1024 px (41.844 bytes) con `picture/srcset` y dimensiones explícitas.
- Separado el lettering DREAMS de la imagen: ahora es HTML/CSS nítido y no se degrada al escalar.
- `?gender=mujer` activa `Perfumes de Mujer`, copy editorial y una variante rosa viejo/taupe sobria limitada al catálogo femenino.
- Figma no fue necesario porque la composición y los tokens ya estaban definidos; Canva, Notion, Linear y Supabase no se modificaron.
- Añadidas dos pruebas de regresión; check PASS, audit sin vulnerabilidades y 33/33 tests PASS.
- PR #6 fusionado en `main` como `19a50120d4eddb2b93faa0bb37a7c86ec426d5a9` después de CI #20 verde.
- Railway deployment `d85de2c7-c35e-4089-a4a9-4e7f77880096` terminó SUCCESS sobre el merge exacto.
- Smoke y QA visual público verificaron health/DB, assets, 11 productos de mujer, filtros, imagen y ausencia de overflow en 1363×936; los seis breakpoints obligatorios siguen pendientes.
- Progreso ponderado actualizado de 70% (70,44% exacto) a 71% (71,16% exacto).

### 2026-08-29 — Opiniones generales persistentes

- Añadido formulario de opinión en homepage con puntuación, comentario, sesión requerida, labels y estado live.
- La publicación usa la API server-side existente, bloquea doble envío y recarga la lista desde Supabase después del alta para confirmar persistencia.
- Visitantes reciben un acceso claro a login/registro; usuarios autenticados ven el nombre con el que publican.
- Añadido rate limit de 5 publicaciones por hora exclusivamente sobre `POST /api/reviews`.
- Alta de opinión devuelve HTTP 201; integración confirma que una opinión autenticada reaparece al volver a consultar la lista.
- Añadida regresión del formulario accesible; check verde y 31/31 tests verdes.
- S2 de grants mínimos no fue iniciado porque el entorno bloqueó la descarga de Supabase CLI; no se inventó una migración ni se cambió la DB remota.
- Progreso ponderado actualizado de 69% a 70%.
- PR #5 fusionado en `main` como `928cc9990f3ceb8dfdcf208e5db0e89191fb6ade` después de CI #18 verde.
- Railway deployment `b094ed98-46e3-4178-9542-3de9a9320bf3` terminó SUCCESS sobre el merge exacto.
- Smoke público verificó formulario y assets nuevos, health/DB, lectura de opiniones y rechazo 401 sin sesión; no se creó ninguna opinión falsa.
- Validación de producción elevó el progreso exacto de 70,32% a 70,44%; el porcentaje general redondeado permanece en 70%.

### 2026-08-29 — Protección de origen y separación del contacto público

- Añadida verificación central de `Origin`/`Referer` para mutaciones y rechazo de metadata `cross-site` cuando no hay origen.
- Incorporada allowlist exacta mediante `APP_ORIGINS`, preparada para la futura transición de dominio sin comodines.
- `/api/config` dejó de devolver `admin_email` y ahora expone únicamente `contact_email` como dato público.
- Contacto de homepage y catálogo cambiado a `facundo.martearena@dantebariloche.edu.ar` con enlace `mailto:` y configuración dinámica segura.
- Actualizados `.env.example`, README, AGENTS y guía Railway para separar `CONTACT_EMAIL` de `ADMIN_EMAIL`.
- Añadidas 3 pruebas de integración; check verde, 29/29 tests verdes y sin cambios de DB.
- Progreso ponderado actualizado de 68% a 69% por trabajo implementado y verificado.
- PR #4 fusionado en `main` como `203e17b2e535df8df05e799f7b6ba0d91083434e` después de CI #16 verde.
- Railway recibió `CONTACT_EMAIL` y `APP_ORIGINS`; deployment `5269e263-0f88-4ebc-be3a-0992445c8047` terminó SUCCESS.
- Smoke de producción confirmó health/DB, configuración pública sin email Admin, contacto visible, same-origin operativo y bloqueo cross-site.

### 2026-08-29 — Revisión profunda de seguridad y roadmap ampliado

- Auditados frontend, Express, sesiones, Admin, Supabase/RLS/grants, dependencias, cabeceras HTTP, endpoints públicos y estado Railway sin modificar datos reales.
- No se confirmó una vulnerabilidad crítica explotable; se priorizaron provisioning Admin en arranque, MFA/reautenticación, Origin/CSRF, grants mínimos, separación de email público/Admin, opiniones moderadas y archive de productos.
- Confirmado que la API de opiniones ya persiste datos autenticados, pero falta formulario, edición, rate limit dedicado, moderación y pruebas de reload.
- Documentado el plan para cambiar el contacto a `facundo.martearena@dantebariloche.edu.ar` mediante `CONTACT_EMAIL` sin exponer `ADMIN_EMAIL`.
- Definida la evolución visual de `Perfumes de mujer` sin romper la identidad DREAMS.
- Diagnosticada la baja calidad del frasco: asset actual 185×272 ampliado. Planificada recreación 2048×3072 con AVIF/WebP responsivos y lettering nítido separado.
- Confirmado que Railway permite renombrar un dominio proporcionado; planificada transición segura a `dreams-perfumes.up.railway.app` si está disponible.
- Recalibrado el progreso ponderado de 73% a 68% por alcance nuevo y deuda descubierta; no es una regresión de código.
- Añadido `SECURITY_REVIEW_2026-08-29.md` como evidencia y plan operativo.
- Railway confirmó el deployment visual `bbc4aa7f-4d71-40d9-aa21-c6829a473f59` en estado SUCCESS.

### 2026-08-29 — Reglas maestras de continuidad

- Formalizado el prompt maestro permanente en `PROJECT_MASTER_RULES.md` y ampliado `AGENTS.md` con recuperación de contexto, fuentes de verdad, progreso verificable, formato de reporte, checkpoints Git, CI y deploy.
- Confirmado que el CSS premium completo ya está publicado en `main` y coincide exactamente con la rama de continuidad; no se realizaron cambios visuales adicionales ni se tocó Supabase.
- El progreso general permanece en 73% porque esta tanda documenta el proceso y no cierra alcance funcional nuevo.
- Confirmado que producción sigue sirviendo el CSS anterior: no es caché del cliente. Railway dejó `21225...` congelado en `DEPLOYING`; se creó un único redeploy limpio `bbc4...` del SHA visual correcto, que queda en cola hasta cancelar manualmente el deployment bloqueado.
- Smoke final: producción ya entrega el HTML/CSS premium del commit `08e15128...` y `/api/health` responde con API y base de datos OK. Railway aún refleja `bbc4...` como `DEPLOYING` por retraso de dashboard, pero el tráfico público fue actualizado.

### 2026-08-29 — Refinamiento visual premium DREAMS

- Consolidado el CSS acumulado en un sistema visual único con tokens de color, tipografía, spacing, bordes, transiciones y contenedores.
- Conservada la identidad negra, marfil y champagne de DREAMS, reduciendo el uso decorativo del dorado y mejorando jerarquía editorial.
- Refinados header con estado de scroll, hero sin recortes, grillas, cards, catálogo, detalle, carrito, cuenta, Nosotros, opiniones, footer y panel Admin.
- Añadidos estados de carga tipo skeleton, estados vacíos editoriales y recuperación visible ante fallos del catálogo.
- Mejorados foco visible, menú móvil, bloqueo de scroll, cierre con Escape, tamaños táctiles y `prefers-reduced-motion`.
- Integrado el isotipo suministrado como favicon y `apple-touch-icon` en todas las páginas públicas y Admin.
- Añadidas 2 pruebas de regresión del sistema visual y del favicon; suite local ampliada de 24 a 26 pruebas verdes.
- No se modificaron APIs, autenticación, lógica de carrito, esquema, datos ni configuración Supabase.
- PR #3 fusionado con GitHub Actions CI #14 verde; `main` quedó en `08e15128ca28fe6742536043a7de8b90c2d82ede`.
- Railway construyó la imagen del commit correcto en el deployment `21225f51-7484-4bfd-903d-dbb35d294539`, pero su promoción quedó bloqueada detrás del redeploy viejo `65722afb-b9ba-4a4c-bf26-78e2e6a37197`; producción continúa disponible con la versión anterior y el smoke del nuevo frontend queda pendiente hasta SUCCESS real.

### 2026-08-28 — Cuenta estable, retiro de favoritos y deploy preparado

- Retirada la función de favoritos de navegación, tarjetas, detalle, cuenta, Admin y API; `/favoritos` y `/favoritos.html` redirigen permanentemente al catálogo.
- Eliminados `public/favoritos.html` y `public/js/favoritos.js`; la tabla histórica vacía permanece protegida por RLS para evitar un borrado destructivo no autorizado.
- Registro y login validan correo/contraseña, diferencian confirmación pendiente de sesión activa y devuelven una redirección explícita.
- Corregida la pérdida del mensaje de confirmación: un alta `202` ya no recarga la página.
- La cuenta maneja errores de red, reintento, doble envío, estado ocupado, mensajes live y cierre de sesión fallido.
- Cookies de auth pasan por respuestas `Cache-Control: no-store`; refresh inválido elimina cookies caducadas.
- Añadido un único reintento acotado para consultas afectadas por el error transitorio Supabase `PGRST303` (`JWT issued at future`) observado en Railway.
- Pulida la estética editorial negra/dorada existente: tipografías unificadas, navegación activa, tarjetas, botones, formularios, cuenta, focus y responsive.
- Baseline `production_baseline` aplicada al Supabase `dreams-project`; triggers, RLS e índices de claves foráneas verificados sin cambiar datos del catálogo.
- Advisors posteriores: sin claves foráneas sin índice; quedan protección de contraseñas filtradas desactivada (WARN), tabla `inquiries` sin policy pública (INFO, intencional por uso server-only) e índices nuevos aún sin uso (INFO esperable).
- Suite ampliada de 20 a 24 pruebas con regresiones de auth, confirmación, cookies, retiro de favoritos y retry transitorio.
- `check` y 24/24 tests locales verdes antes de publicación.
- Runtime de producción fijado a Node 24 para eliminar la advertencia de deprecación de Node 20 emitida por `@supabase/supabase-js` en Railway y alinear deploy con CI.
- PR #1 y PR #2 fusionados con CI #10/#12 verdes. Railway desplegó `87f9e8d2` en `f89bba83-0b45-4ba1-894c-cd7dab060d39` usando Node 24.19.0; healthcheck y smoke de producción pasaron.

### 2026-08-28 — Auditoría F0

- Documentada la arquitectura real Node/Express/Supabase y la migración incompleta desde SQLite.
- Creado roadmap ponderado con progreso general inicial de 33%.
- Registrados hallazgos de seguridad, datos, backend, frontend, Admin, UX, accesibilidad, responsive, performance, SEO, CI y deploy.
- Verificada instalación frozen, sintaxis y smoke HTTP local.
- Detectadas 6 vulnerabilidades de producción en `nodemailer`, dependencia sin uso.
- Confirmados XSS por renderizado inseguro, seed destructivo, healthcheck falso positivo y edición Admin rota.
- Sin cambios funcionales, migraciones ni deploys en esta tanda de auditoría.

### 2026-08-28 — Hardening crítico F1/F3

- Neutralizado renderizado XSS de productos, opiniones, usuarios, consultas, errores y carrito; URLs de imagen restringidas a rutas locales/HTTPS.
- Añadida CSP sin `unsafe-inline` y retirados handlers inline.
- Eliminada dependencia `nodemailer` sin uso; audit de producción pasó de 6 vulnerabilidades a cero conocidas.
- Seed del catálogo cambiado para insertar sólo cuando la tabla está vacía, sin sobrescribir cambios Admin ni restaurar borrados.
- Reparada edición Admin al conservar `product-id`.
- Endurecida validación server-side de números, enteros, longitudes y URL de imagen.
- Añadido rate limit específico para consultas públicas.
- Readiness ahora consulta Supabase, devuelve 503 si falla y Railway usa `/api/health`.
- Añadidos 7 tests con Node y verificación de sintaxis reproducible.
- Creado workflow CI con instalación frozen, audit, check y tests.
- Corregido overflow de portada en 390, 430, 768, 1024, 1440 y 1920 px.
- Añadidos foco visible, `prefers-reduced-motion` y estado/escape de menú móvil en portada.
- Corregido el estado de error de opiniones cuando la API no está disponible.
- Rama `codex/production-hardening` publicada; PR #1 abierto contra `main`.
- GitHub Actions CI run #1 completó correctamente sobre `6b596947`.
- Sin migraciones remotas ni deploy en esta tanda.

### 2026-08-28 — Sesiones, IDs y baseline Supabase

- Añadida renovación server-side mediante refresh token y cookies con expiraciones separadas.
- Logout revoca la sesión actual en Supabase cuando hay un access token válido.
- Perfiles faltantes se crean/reparan siempre con rol `customer`; los errores de perfil ya no se ignoran.
- Mensajes de registro dejaron de filtrar errores internos del proveedor.
- IDs inválidos de productos, favoritos, consultas y Admin ahora devuelven 400.
- Creada con Supabase CLI 2.116.0 la migración `20260828144944_production_baseline.sql`.
- La baseline agrega RLS idempotente, trigger seguro de perfil, trigger `updated_at` e índices de catálogo/orden.
- `supabase/schema.sql` marcado como snapshot legacy y `supabase/.temp` ignorado.
- Suite ampliada a 11 pruebas, incluidas invariantes de seguridad/no destrucción de la baseline; audit continúa sin vulnerabilidades conocidas.
- Migración no aplicada ni declarada verificada: falta Postgres/Docker local o conexión controlada al remoto.
- GitHub Actions CI run #3 completó correctamente sobre `3a36ba27`.

### 2026-08-28 — Favoritos idempotentes y documentación operativa

- Reemplazado el toggle read-then-write por `PUT`/`DELETE` idempotentes; el alta usa `upsert` sobre la unicidad usuario/producto.
- Añadido `GET /api/favorites/ids` para sincronizar el estado visual con una sola consulta por página.
- Botones de favoritos ahora exponen `aria-pressed`, etiqueta contextual y bloqueo durante la escritura.
- Añadidas pruebas aisladas de la escritura de favoritos y smoke de rutas API para IDs, autenticación y 404.
- Suite ampliada a 13 pruebas; sintaxis y audit de producción continúan verdes.
- README, documentación técnica, guías Railway/Supabase y scripts de instalación alineados con el stack real; retiradas instrucciones activas de SQLite, Volume, bcrypt y `express-session`.
- El carrito se reconcilia mediante `POST /api/cart/quote`: precio, stock, productos agotados y faltantes se resuelven con datos del servidor antes de habilitar WhatsApp.
- La consulta de carrito incluye cantidades, productos y total autoritativo; el frontend deja de confiar en precio/stock de `localStorage` para esa salida.
- Enlaces y detalle dejaron de fijar el número de WhatsApp en JavaScript/HTML y consumen `/api/config` o la URL emitida por el servidor.
- Baseline Supabase y deploy remoto siguen sin aplicarse: requieren un entorno controlado y credenciales fuera del chat.

### 2026-08-28 — API inyectable y errores uniformes

- Separada la construcción de Express en `server/app.js`; `server/server.js` conserva únicamente configuración real, Supabase, escucha y seed.
- Añadida `create_app` con inyección explícita de base de datos, factory de cliente auth, configuración y logger para pruebas aisladas.
- Todas las rutas async pasan por un adaptador común que deriva rechazos al middleware central de errores.
- Errores inesperados devuelven `{ "error": "No se pudo completar la operación." }` sin filtrar mensajes internos de Supabase.
- Logs de error conservan método, ruta y clase/código limitado, sin copiar el mensaje interno del proveedor.
- Eliminada la filtración del mensaje de Supabase que permanecía en el alta Admin de productos.
- Añadidas 6 pruebas de integración HTTP con DB falsa: factory obligatoria, catálogo, error explícito, rechazo de promesa, readiness y CSP.
- Suite completa ampliada a 20 pruebas; check de sintaxis y audit de producción continúan verdes.
- Sin cambios en Supabase remoto ni deploy.
