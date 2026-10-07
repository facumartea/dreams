# DREAMS — estado actual verificado

SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.

Actualizado: 2026-10-07 (America/Buenos_Aires). Repositorio: facumartea/dreams.

## Preview PR35 publicada y verificada — 2026-10-07

**URL: https://cart-checkout-review-dreams-perfumes.dreams-perfumes.workers.dev/**. Preview aislada `cart-checkout-review` del Worker dreams-perfumes, id `da9e5bd9435f47b1a82da81d137d548c`. Deployment `1537279f-9851-4532-b72a-4d60f7132524`, fuente `b75ce0dfcd11b6f4425a3b8193c9d85ad669b34d`, CI SUCCESS [37565195401](https://github.com/facumartea/dreams/actions/runs/37565195401). Se añadió sólo `env.preview.previews={}`, requerido por Wrangler 4.147.0; build correcto y dos tests de runtime Workers pasaron. La suite de carrito 98/98 estaba acreditada y CI volvió a validar el commit; no se repitió localmente toda la suite.

El usuario configuró SUPABASE_SECRET_KEY en Previews Base, verificado como secret_text sin leer/mostrar su valor. Preview apunta a Supabase `nwsmbemwtexmrtpkgxrz`; origen HTTPS propio exacto configurado en APP_BASE_URL/APP_ORIGINS. Contacto email vigente conservado; WhatsApp continúa sin número. Checkout sigue false/demo y auto-confirm false. Sin seeds, DDL, cuentas, pedidos, cobros ni correos de QA.

QA **remota sin sustituir assets locales**, 390/1440: menús, búsqueda real/vacía, marca/género/categoría/precio/orden/reset, productos/carrito/+−/eliminar/vaciar/persistencia/contador/subtotal y envío. Respuestas de cotización atrasadas no pisan cantidades ni restauran vaciado; error y reintento pasaron con 503 inyectado en navegador sobre código publicado. Sin pageerror/respuestas API fallidas en recorrido normal ni overflow del carrito. Cuatro assets modificados coinciden byte por byte con la fuente y sin patrones Secret/SDK Supabase. Admin anónimo 403; sesión null. Primera health dio 503; cuatro consultas posteriores 200, causa no confirmada. Tail filtrado de esta preview capturó cero eventos: **logs específicos no verificados**, no confundir con los cinco del deployment anterior.

Worker vigente conserva `f73d5087-ac19-4168-890b-6da3abb6b635` al 100%, Pages ae2f7932 intacto; sin DNS/tráfico ni merge. PR35 sigue dependiente de PR34. Pendientes: WhatsApp real, pagos sandbox y Auth/Admin con cuentas seguras, banner distinto (ideal 1024×1536), observabilidad/readiness transitorio. Evidencia completa: docs/cart_checkout_validation.md. Próxima acción: probar esta URL desde celular del usuario; no activar compras ni promover a producción.

## Checkpoint anterior: carrito local y preview bloqueada



2026-10-06 (America/Buenos_Aires). Rama `codex/cart-checkout-ux`, basada en PR34/8d80fdd, PR apilada con base `codex/cloudflare-hosting-migration`. PR34 sigue abierta; main y deployment vigentes sin modificar. Fuente Pages b3cd5f6/ae2f7932, backend f73d5087 confirmados nuevamente; el checkpoint de abajo es histórico.

Bloqueo COMPRAR comprobado: CHECKOUT_SCHEMA_READY=false, proveedor demo y sin secretos Mercado Pago. Orders/coupons sí existen por lectura de information_schema; no se activó checkout ni modificó Supabase. WHATSAPP_NUMBER vacío. Correcciones: carreras de cotización/vaciado, fallos de configuración independientes de cotización, reintento, contacto WhatsApp válido y subtotal sin envío desconocido; ver docs/cart_checkout_validation.md.

Checks locales: 36 JS, 98/98, audit prod limpio, builds Workers/Pages correctos. QA 390/1440: menú, búsqueda/marca/género/categoría/precio/orden/reset, carrito/cantidades/eliminar/vaciar/contador/persistencia/subtotal; archivos frontend locales interceptados sobre APIs remotas de lectura, **no deployment nuevo**. Doble clic/error de proveedor probado con respuestas exclusivamente sintéticas; cero pedidos reales. Auth/Admin autenticados y pago remoto siguen pendientes.

Carrusel pendiente de otra imagen distinta y pertinente: sólo existe el hero fijo y variantes del mismo frasco/logos. No se duplicó contenido. Preview aislada sin publicar: autenticación disponible, pero base de previews sin SUPABASE_SECRET_KEY. Paso seguro exacto documentado, nunca recuperar/exportar el Secret activo. Producción/DNS/tráfico y servicios vigentes sin modificar. Próxima acción: configurar Secret de preview de forma segura, publicar origen aislado y validar; pago sandbox requiere datos de QA, credenciales y revisión de envío.

## Solicitud vigente: URL dreams-perfumes.pages.dev

**Enlace principal: https://dreams-perfumes.pages.dev**. Proyecto dreams-perfumes publicado mediante conexión Cloudflare con permisos Pages. Deployment `ae2f7932-aefe-48b2-a9e9-8c3597b607f9` SUCCESS, fuente `b3cd5f62523d15603078798baa9f31b633692d3f`, alias raíz confirmado por HTTP. Proxy advanced-mode con Service binding DREAMS al Worker existente, sin duplicar backend/secret ni modificar Supabase. Backend actualizado a versión `f73d5087-ac19-4168-890b-6da3abb6b635` para añadir Pages a APP_ORIGINS conservando el origen Worker y demás variables/Secret. Ambos enlaces funcionan.

QA Pages: health 200, catálogo 46, detalle 199, CSS/HTML 200; quote de producto real (lectura, sin pedido) 200 desde Origin Pages; Admin anónimo 403, API 404, CSP/no-store correctos. Navegador: 8 navegaciones, 390/1440, todas 200, home 8 y catálogo 46, carrito conserva fila al recargar, sin pageerror/overflow en esos dos tamaños. No extrapolar a 360/1024 ni Auth/Admin autenticados/pagos.

Checks: 35 JS, **92/92**, builds Pages y Workers correctos; CI exacto b3cd5f6 SUCCESS [37541429804](https://github.com/facumartea/dreams/actions/runs/37541429804). Guía: docs/pages_frontdoor.md. Los datos de Worker abajo conservan evidencia anterior; Pages es ahora el hostname solicitado. Sin DNS/tráfico del dominio existente, main/merge, Railway, compra de plan, pagos, correos o datos reales modificados. Supabase permanece; clave sólo servidor. Pendientes de seguridad, Auth, pagos, imágenes, WhatsApp y overflow anteriores conservados.

## Estado remoto vigente: preview funcional en lecturas y carrito

URL **https://dreams-perfumes.dreams-perfumes.workers.dev**, Worker **dreams-perfumes**, cuenta `9f3d7af60fcb0c2b4fff8570843588f9`. Fuente desplegada `e80d90ab3d392d6c677cf2b6198f893a4c96d106`; versión activa tras actualización segura del Secret por el usuario **4631190f-0a33-4768-8e27-f601cf8393f6**, deployment `8d176af0-d488-4b78-af21-c05af5e289d1` al 100%. API Cloudflare confirma script etag idéntico a versión 99247be3 del código e80d90a: el cambio dashboard fue el Secret, no el código.

OAuth válido; SUPABASE_SECRET_KEY es secret_text y SUPABASE_URL corresponde a proyecto `nwsmbemwtexmrtpkgxrz`. Health **200 api/database ok**; catálogo **200, 46 productos reales**; detalle 199 **200**, home 8. Clave no obtenida/impresa/versionada. Tipo concreto y privilegios Auth Admin no probados. Secret sólo runtime servidor; los bloqueos 401/Secret ausente/OAuth anteriores quedaron superados.

QA remoto ejecutado: **24 navegaciones en 6 viewports** (360/390/768/1024/1440/1920), todas 200, sin pageerror ni marcas vacías. Home 8/catalogo 46 en todos. Agregar producto real a carrito: una fila persistida en localStorage y tras recarga. Admin HTML/API anónimo 403, API inexistente 404, CSP/no-store correctos. Tail: **149 invocaciones observadas, cero error logs/excepciones/outcomes no OK**. Prueba de imágenes: 46 elementos, 12 cargados al momento de medir por lazy loading, dos con fallback; no afirmar que se probaron todas las imágenes externas.

Pendientes reales: overflow catálogo a 360 y portada a 1024, imágenes externas/fallback, WhatsApp real no configurado, Auth/sesión/Admin autenticados sin cuentas de prueba, checkout/webhooks sin entorno seguro, recovery/MFA UI inexistentes. Checkout disabled/demo, auto-confirm false, schedules vacíos; no pedidos, pagos, correos, registro ni escrituras DB de QA. No se rediseñó ni sustituyeron imágenes. Clave mostrada por el usuario en captura: reemplazo seguro pendiente tras identificar consumidores, sin revocación ciega.

Código e80d90a tiene CI SUCCESS 37535210179 y local check 32/tests 89/89/build; checkpoint documental 2f9610b tiene CI SUCCESS 37535392489. No repetir tests/build por esta actualización exclusivamente documental; nuevo SHA/CI se verifica en GitHub. Sin cambios DNS/tráfico existente, Supabase/config/esquema, Railway, plan pago o merge.

Próxima acción: revisar preview con usuario y preparar pruebas Auth/Admin seguras, dato WhatsApp real y pendientes visuales. Antes de producción, resolver credencial expuesta, validación comercial y recuperación operativa. Railway offline no bloquea esta preview aislada y no fue restaurado.

## Alcance y recuperación

El pedido inicial de auditoría fue reemplazado por autorización de recuperación funcional y luego por migración a **Cloudflare**. Render ya no es el destino. No hacer merge, cambios DNS ni cambio de tráfico sin presentar validación y rollback para aprobación. No borrar/desactivar Railway ni modificar datos/esquema/RLS de Supabase.

- Base main: `4655b0cbdcec8ad2aade4cdde03ef60b22652bf1`.
- PR33 recuperada hasta `bfbcf9d4945872d3d2ddfd8be52885120e356c21`; adapta `marca`, retira seed del arranque y corrige dependencias.
- Rama de continuación: `codex/cloudflare-hosting-migration`.
- PR32 de motion excluida. No rediseño.
- Implementación publicada: `f0d52d620497882b68b2c50e244db6f84a7ef2b8` (29 archivos de esta tanda). Push remoto verificado por SHA.
- PR nueva de migración: https://github.com/facumartea/dreams/pull/34, abierta, base main, sin merge. Incluye la base de PR33 sin cerrar/alterar esa PR; PR32 excluida.
- CI del commit de implementación: SUCCESS, https://github.com/facumartea/dreams/actions/runs/37530615797 (verify 27 s). Check Supabase Preview SKIPPED: no se creó un proyecto Supabase nuevo.
- HEAD revisado de PR34: `fdbca5a74992deadc1816430cfa05320827555f9`; CI SUCCESS confirmado para ese SHA exacto (run 37530792193, 89/89, check 32, build). Toda actualización documental posterior debe contrastarse con git log/checks de PR34.
- Historia anterior preservada en `docs/history/CURRENT_STATE_PR33.md` y `docs/history/PLAN_PR33.md`; sus cifras/hosting NO son estado vigente.

## Continuación de preview (2026-10-06, America/Buenos_Aires)

PR34 abierta, rama existente preservada y sin cambios de implementación. Revisión de bindings: assets públicos; sin cron/colas nuevas; checkout deshabilitado y MP no activo en preview. El registro y reparación de perfiles sí pueden escribir, así que no usarlos sobre datos comerciales en QA.

Acceso rechecado: Wrangler no autenticado, sin tokens Cloudflare ni secreto Supabase en proceso/gestor; no archivos locales de bindings. No se pudo consultar secretos/bindings remotos; NO afirmar que están ausentes. Se inició OAuth por dispositivo con scopes account/user read, workers_scripts write y workers_tail read; código temporal no persistido. Resultado: OAuth por dispositivo expiró después de cinco minutos sin autenticación; no hay sesión Cloudflare válida. Se necesita configurar CLOUDFLARE_API_TOKEN/CLOUDFLARE_ACCOUNT_ID mediante el gestor seguro del entorno o completar un nuevo login por dispositivo. No se intentó publicar sin acceso. CI del checkpoint c271061 SUCCESS (run 37531858549).

Build preview dry-run reejecutado en el SHA fdbca5a: correcto, 2156,08 KiB / gzip 499,93 KiB; no deploy. Auditoría estática de public: sin createClient, SUPABASE_SECRET_KEY ni valores sb_secret. Tipo real de la clave sigue sin comprobar; el binding requiere API key backend privilegiada (secret moderna o service_role vigente), no contraseña DB ni token Management.

Guía precisa de acceso seguro, nombres de secretos, matriz remota y efectos comerciales: docs/cloudflare_migration.md, sección Continuación de PR34. Mantener código y PR existentes; no iniciar otra implementación.

## Hechos comprobados

### Nueva comprobación de acceso y recuperación (2026-10-06 UTC)

- HEAD revisado `ae7ae380dea17b55506d5c6559aae96d1c3e2a90`, PR34 abierta, CI exacto SUCCESS [37532206512](https://github.com/facumartea/dreams/actions/runs/37532206512). Sin cambios de implementación ni repetición de tests/build acreditados.
- Wrangler sigue no autenticado; gestor sin credenciales, token/cuenta Cloudflare y secreto servidor no disponibles en proceso. No se reinició login. Bindings/secretos/versiones remotos no inspeccionables; no hay preview ni commit desplegado.
- Railway reconsultado: offline, sin deployments activos; últimos cinco REMOVED, canRollback=false y canRedeploy=true. Dominio raíz/health/products devuelve 404 Application not found. Patch de agosto pendiente conservado.
- [docs/recovery_runbook.md](docs/recovery_runbook.md) registra IDs, evidencia HTTP/API, destino/configuración y procedimiento. No redeployar main histórico: conserva seed en el arranque. Restaurar con bootstrap PR34 exige nuevo deployment con costo, revisión segura de variables y aprobación previa.
- Rollback operativo **NO disponible**: sin Railway saludable ni versión Workers verificada. No reactivación, costos nuevos, Supabase, DNS, tráfico o producción modificados. Faltan presupuesto/autorización de restauración y evidencia SUCCESS + smoke del destino. Esta tanda es documental; el SHA final se comprueba con Git/CI, sin atribuirle un deploy.

- Supabase `nwsmbemwtexmrtpkgxrz`: activo; 46 productos, 7 perfiles, 8 usuarios Auth, 1 consulta; 0 pedidos/cupones/reviews. RLS activa en las siete tablas públicas. Conteos verificados por SELECT el 2026-10-06.
- `products.marca` es la columna real; HTTP conserva `brand`. No se renombró ninguna columna.
- Railway sin deployment activo, dominio histórico responde 404. No se modificó Railway.
- No existen credenciales Cloudflare en este entorno; búsqueda de integración no devolvió una disponible. Deployment remoto bloqueado hasta disponer de acceso.
- No hay clave Supabase privilegiada local. Las verificaciones contra datos reales usan exclusivamente clave pública y lecturas.
- Suite final: **89/89**, cero fallos/omitidos; check **32 JS/MJS**; audit producción sin vulnerabilidades. Incluye dos pruebas de runtime Workers con fixtures HTTP aisladas, cliente Supabase SDK real, cookies Secure y guard remoto cerrado sin origen.
- Node 24 / pnpm 11.19.0. Aplicación Node no requiere compilación; Workers sí requiere bundle Wrangler.

## Implementación y verificación local

Adaptador Workers `worker/index.mjs` sobre Express con `nodejs_compat`, assets binding, Admin HTML privado empaquetado fuera de public, sesiones aisladas, sin caché compartida privada, entornos preview/production separados. No ejecuta seed ni DDL. Build preview dry-run correcto (31 assets, bundle 2156,08 KiB / gzip 499,93 KiB). No es deploy. Avisos esperados de variables HTTPS remotas aún sin configurar.

Correcciones conservadas de la recuperación autorizada: clientes login/registro/logout por operación, refresh probado, health de columnas/tablas críticas, historial corrupto, reintentos/filtros fuera de orden y manejo de errores Admin, límite home a 8 productos, copy sin promesas demo incorrectas, timeout Mercado Pago.

## Pendientes y límites

Auth remoto/Admin/checkout requieren entorno aislado y credenciales de prueba; no se crearon usuarios ni pedidos reales. Recuperación de contraseña y MFA no tienen flujo UI existente; no inventar su implementación. Mercado Pago carece de tokens verificados. Stock no se reserva/descuenta; idempotencia de creación y límites de uso de cupones siguen pendientes. Imágenes externas problemáticas siguen registradas, sin sustituciones inventadas.

Smoke local ejecutado en workerd mediante harness oficial y salida Node/proxy: 66 navegaciones, 6 viewports, todas 200, sin overflow/pageerror; home 8 y catálogo 46 con marcas. Filtro Byredo, búsqueda Sauvage, reintento tras fallo y quote de carrito pasaron. JSON home 5611 bytes vs catálogo 33566. El wrangler dev directo no conectó Supabase por el proxy local; no confundirlo con un fallo de producción verificado. Evidencia y límites: docs/cloudflare_validation.md.

Procedimiento de preview/promoción/rollback: docs/cloudflare_migration.md. Sin DNS, merge, tráfico nuevo, deploy remoto ni escrituras reales. Railway offline no es rollback operativo hasta restauración verificada.

Próxima acción: habilitar acceso Cloudflare y secreto Supabase por gestor seguro, publicar preview, validar Auth/Admin/pagos con entorno y cuentas de prueba. Presentar resultado y rollback antes de pedir aprobación para cambiar tráfico.
