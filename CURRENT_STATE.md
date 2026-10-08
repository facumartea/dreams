# Video exclusivo de preview publicado y verificado — 2026-10-08

SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.

Preview: https://academic-review-dreams-perfumes.dreams-perfumes.workers.dev/. Fuente 41907ba1ed43a4ceb0d7f9444d5f9da2038a5167; deployment 70089602-bc64-4a9a-bcb1-e585b9bb4c13. PR40 abierta, rama codex/preview-perfume-video, dependiente de PR39 → PR38 → PR37 → PR34, sin merges. CI fuente SUCCESS 37861535878: check46,120/120 tests, audit limpio y builds Workers/Pages. Checkpoint posterior sólo documental, no altera bundle publicado.

MP4 real del usuario optimizado a 1.778.425bytes/20s/1280×720/H264/faststart/sin audio, posters propios. Textos/CTA conservados; encuadre16:9 completo. Autoplay silenciado, sin loop, pausa/continuación, fin natural/fotograma final, retorno sin nueva descarga y recarga explícita permiten reproducir una vez de nuevo. Reduced-motion y ahorro detectado sin MP4; fallback ante bloqueo/error. Flag PREVIEW_HERO_VIDEO sólo entorno preview; build Pages fija archivos visuales a b049934, sin video.

QA remota Chromium390/1440 COMPLETADA: espera natural de20s, pausa/continuación, último fotograma/retorno/reload; movimiento reducido real y ahorro/autoplay/error inyectados pasaron. Menús/búsqueda vacía/reset/marca,46productos, contactos/acceso visible, carrito agregar/cantidades/persistencia/contador/subtotal/WhatsApp y checkout académico aprobado/vaciado sin escrituras comerciales; ocho rutas Admin anónimas403, sin pageerrors/overflow. Dos intentos iniciales de activación agotaron30s; causa no comprobada. Diagnóstico posterior JS/config200 y ejecución final exitosa, sin corrección adicional. Telemetría últimos15min:0eventos error observados, invocation logs desactivados/cobertura limitada. Evidencia y rollback: docs/preview_hero_video.md; capturas /workspace/dreams-video-evidence y dreams-video-regression-evidence.

Oficial https://dreams-perfumes.pages.dev continúa ESTÁTICA: Pages900a4bd8/c22a5d0, backend40e7b0a3/b049934 y Worker histórico f73d5087 al100% confirmados intactos por API después de publicar video. HTML/CSS/motion oficiales idénticos a b049934; MP4 en oficial404. No deploy Pages/DNS/tráfico oficial ni datos de Supabase modificados; SELECT conserva46productos/0pedidos/rol admin.

Admin usuario confirmado admin@dreamsperfumes.com; contraseña inaccesible: Railway OAuth sólo nombres ADMIN_PASSWORD/ADMIN_EMAIL (valuesRedacted=true), vigencia histórica no comprobada. Sin reset/revocación/email/reactivación. Auth/Admin autenticados, Google y comercio real pendientes; seguridad previa/grantsTRUNCATE sin cambios. Próximo: revisión visual de preview por usuario; consultar privadamente variable histórica o preparar recuperación autorizada y validar acceso legítimo. No incorporar video a oficial sin nueva autorización.

# Oficial estática publicada — 2026-10-08 (America/Buenos_Aires)

SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.

OFICIAL: https://dreams-perfumes.pages.dev/. Pages deployment 900a4bd8-0baa-4c64-926f-12a25836d7c2 SUCCESS; commit del proxy c22a5d0e3efed323088761fadfc5d68cb6df2351, fuente de aplicación/preview pre-video b04993467b820ec3b81af0991fa9cda5ef276dda. CI SUCCESS 37852300142, 113/113 tests, check 43, audit limpio, builds Workers/Pages. Rama codex/promote-academic-static-pages, PR39 dependiente de PR38/37/34, sin merge. Checkpoint documental posterior no altera deployment.

Backend oficial inmutable 40e7b0a3-022f-491b-9d74-f3fc63f9746f, fuente b049934; orígenes Pages explícitos, secret Supabase heredado servidor/firma interna propia por stdin, sin valores publicados. PREVIEW_READ_ONLY=true/CHECKOUT_SCHEMA_READY=false: checkout académico firmado sin orders/stock/pagos comerciales. Pages fija backend por configuración y no por hostname; fallo cerrado y redirects manuales. Conserva autores/contactos/acceso/catálogo/carrito desplegados, portada estática y ningún video.

QA remota oficial Chromium 390/1440: hero cargado/estático tras espera/hover/scroll, menú móvil/Escape y desktop visible, búsqueda vacía/reset y marca Byredo/reset, 46 productos, dos contactos/autores, login legacy visible sin avisos técnicos, ocho rutas Admin anónimas 403. Carrito agregar/+/-/persistencia/contador/subtotal/WhatsApp con envío excluido; checkout académico aprobado y vaciado comprobados, sin errores de página/overflow en los tamaños probados. 14 hashes de archivos remotos iguales a fuente. No sesión remota legítima: Admin autorizado/Login/Logout autenticados pendientes, fixtures locales sí probados. Otros resultados académicos cubiertos localmente/pruebas remotas previas; no reiterados en esta promoción. Logs post-publicación: cero eventos error observados, invocation logs desactivados/cobertura limitada. Capturas en /workspace/dreams-official-evidence; evidencia detallada docs/official_academic_release.md.

PREVIEW: https://academic-review-dreams-perfumes.dreams-perfumes.workers.dev/, fuente b049934, deployment 4ad20144-f896-4ba9-9735-f43c9ffd1603; intacta/health200/hero estático. Video gemini_generated_video_1e78e674.mp4 NO ADJUNTO: etapa de video bloqueada, no usar sustituto; esperar archivo y crear branch separada exclusivamente preview. Pages Direct Upload no tiene auto-deploy Git.

Admin confirmado: admin@dreamsperfumes.com, UUID a88d8d4e-ada3-4bfa-a6f5-db39d2dc9c19, perfil admin y correo confirmado; admindreams@gmail.com no existe. Acceso /cuenta.html → /admin con rol servidor. Sin contraseña legítima ni gestor/sesión accesible; hash no recuperable. Flujo de restablecimiento preparado como runbook, pendiente control del correo/SMTP/callback UI y autorización específica antes de cambiar cuenta compartida. No emails/cambios password/revocación.

Rollback: Pages previo 444489eb-dcfe-4650-b005-acc3469ab02e SUCCESS y endpoint POST rollback oficial disponibles; health/catalogo previos 200. Un request previo falló 503 por Supabase401 registrado en Worker f73d5087; causa no resuelta, posteriores exitosos: limitación real del respaldo anterior. No rollback ejecutado porque nueva versión pasó QA. Worker original f73d5087 al 100%, deployment anterior y binding conservados. Supabase sólo SELECT: 46 productos/0orders/rol admin; RLS activa, grants TRUNCATE históricos pendientes. Sin DNS, seeds/migraciones, pagos, datos ni merges modificados. Publicación oficial sí autorizada y realizada.

Próxima acción: solicitar adjunto MP4 para inspección/optimización y cambio exclusivo preview. Auditar acceso Admin real/recovery separado sin inventar credenciales. No repetir publicación oficial para integrar video.

# Promoción estática autorizada en preparación — 2026-10-08

SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.

Pedido vigente: publicar en OFICIAL https://dreams-perfumes.pages.dev el estado exacto pre-video de PREVIEW b049934, luego video sólo preview. Rama codex/promote-academic-static-pages dependiente de PR38, sin merges. Preview academic-review fijada por API en deployment 4ad20144-f896-4ba9-9735-f43c9ffd1603/tag b049934.

Backend estático independiente creado desde b049934, deployment inmutable 40e7b0a3-022f-491b-9d74-f3fc63f9746f. Misma app/DB, orígenes Pages explícitos, secreto Supabase heredado servidor y firma aislada por stdin. PREVIEW_READ_ONLY=true, CHECKOUT_SCHEMA_READY=false, presentación académica activa: no orders/stock/pagos reales. Worker original y preview academic-review intactos. Pages aún no promovido en este checkpoint; configuración fija en pages/official-release.json impide que futuros cambios/video de preview lleguen a oficial.

Admin comprobado por SELECT: admin@dreamsperfumes.com, UUID a88d8d4e-ada3-4bfa-a6f5-db39d2dc9c19, perfil admin y Auth confirmado. admindreams@gmail.com inexistente. Sin contraseña/sesión legítima ni gestor de contraseñas disponible; QA autorizado remoto pendiente, recuperación preparada pero no enviada/cambiada. RLS activa; grants TRUNCATE históricos siguen pendientes, sin DDL.

Check 43 JS, 113/113 tests, builds Pages/Workers y audit producción correctos. Rollback Pages 444489eb confirmado SUCCESS, raíz y health accesibles; endpoint de rollback oficial identificado. Video solicitado no adjunto: no inventar ruta ni sustituir material. Próximo paso: CI/PR, publicación Pages autorizada, QA remota y checkpoint de evidencia.

# Segundo teléfono confirmado — 2026-10-08

SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.

Agregado +54 294 4502390 como segundo teléfono de Contacto en Inicio/Nosotros y configuración pública, con tel:+542944502390. Por pedido “solo eso”, WhatsApp conserva +54 294 4160065 y el resumen del carrito. Misma rama/PR38, publicación sólo en preview academic-review; producción intacta. El checkpoint siguiente registra la versión anterior a este dato adicional.

# Limpieza de acceso e idioma publicada — 2026-10-08 (America/Buenos_Aires)

SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.

Continuación PR38 en la misma rama `codex/academic-access-checkout`, preservando base PR37/PR34, sin merge. Acceso sin rótulo ACCOUNT ni aviso técnico Google; login existente conservado. Isologo original recortado con fondo transparente, ampliación moderada y textos de interfaz en español. Contactos preservados y WhatsApp con número visible; segundo teléfono confirmado en el checkpoint superior; WhatsApp vigente conservado.

**Preview: https://academic-review-dreams-perfumes.dreams-perfumes.workers.dev/**. Fuente publicada `7eae7a79421cba653cc543d69ff87d81fae159a4`; deployment `a6070de5-c8b6-47e0-b563-2cc5da4a2f27`. [CI fuente SUCCESS](https://github.com/facumartea/dreams/actions/runs/37725729903): 111/111 tests, sintaxis 43, audit limpio y builds Workers/Pages. El checkpoint documental posterior no altera el bundle publicado.

QA local login/reintento/logout con fixtures 320/390/1440 y Admin 390/1440 sin overflow. Remoto 390/1440: acceso limpio, contactos, menús, búsqueda/filtros/reinicio, cantidades/persistencia/subtotal/WhatsApp y cuatro resultados académicos sin regresiones ni errores de página. Nueve páginas/404 revisadas, validación española incluso con navegador inglés y hashes CSS/PNG/cuenta.js iguales a fuente. Auth/Admin autenticados remotos siguen pendientes por falta de cuenta legítima. Capturas/evidencia/procedencia del asset en docs/access_language_refinement.md.

Producción Pages 444489eb/5e3835e y Worker f73d5087 al 100% confirmados intactos por API; Supabase, DNS, tráfico y permisos sin cambios. PR38 actualizada, sin merge. Próxima acción: revisar ambos enlaces de teléfono en la preview; WhatsApp conserva el destino vigente.

# Checkpoint anterior: preview académica publicada y verificada — 2026-10-08 UTC

SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.

**Preview: https://academic-review-dreams-perfumes.dreams-perfumes.workers.dev/**. Fuente publicada `87d64d4b1c3a7a0754c247c48a768a198971d045`; deployment `253981ae-1be2-4b14-ad5c-508ea03fb3cf`. Rama `codex/academic-access-checkout`, [PR38](https://github.com/facumartea/dreams/pull/38) abierta sobre PR37/ac7e088 (dependencia PR34). Selección del controlador y cuatro regresiones de carrito PR35/a5158b0, sin merges. El checkpoint documental posterior no altera el código publicado.

Autores/contactos, acceso centrado con PKCE preparado, protección de escrituras y checkout académico firmado implementados. Google está deshabilitado y la cuenta admin solicitada no existe: se conserva login por contraseña hasta configurar y verificar Google. No promoción ni configuración Auth remota realizada.

CI de la fuente SUCCESS [37723212856](https://github.com/facumartea/dreams/actions/runs/37723212856): 108/108 tests, sintaxis de 43 archivos, audit producción limpio y builds Workers/Pages. QA remota completa en 390/1440 sobre 3cf7cc8; último commit sólo corrige CSS Admin y documentación. Smoke final 87d64d4: CSS remoto idéntico a fuente, hero estático, autores, acceso centrado, checkout aprobado y carrito vaciado, sin errores de página en ambos tamaños. Menús/filtros, persistencia/cantidades, cuatro resultados, reintento y respuestas atrasadas verificados; tarjeta no transmitida. Admin autenticado probado únicamente con fixtures locales; rutas anónimas remotas 403. Logs muestreados: una cancelación OAuth esperada, cero eventos de nivel error; cobertura limitada.

Supabase sólo lecturas: 46 productos, cero pedidos y cuenta admin inexistente. Pendientes: Google Cloud/proveedor/callbacks, acceso Admin real, grants TRUNCATE históricos y comercio real. No cambios de datos, roles, policies, migraciones ni seeds. Producción intacta: Pages `444489eb` fuente `5e3835e`, Worker `f73d5087`; DNS y tráfico sin modificar. Sin merge. Evidencia, configuración, rollback de preview y reproducción: `docs/academic_preview.md`.

Próxima acción: revisar esta preview desde celular; completar cliente OAuth en paneles seguros y validar Google antes de activar GOOGLE_ACCESS_READY y promover la identidad verificada por UUID. El checkout mostrado es una simulación aislada, no Mercado Pago ni pedido comercial.

# DREAMS — estado actual verificado

SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.

Actualizado: 2026-10-07 (America/Buenos_Aires). Repositorio: facumartea/dreams.

## Portada estática publicada en Pages — 2026-10-07

**URL: https://dreams-perfumes.pages.dev/**. Fuente 5e3835eafc1fdf4c4f77f232cd65acda5c1f0060, deployment production 444489eb-dcfe-4650-b005-acc3469ab02e SUCCESS; preview 9ad4fa43 SUCCESS del mismo bundle. Rama `codex/static-home-pages`, PR37 base PR34/8d80fdd, sin merge ni integración de PR35/a04e732 o PR36/6c68ff7. Se reutiliza sólo diseño/asset de PR36. Checkpoint documental posterior no cambia el bundle publicado.

Imagen, textos, tipografía, fondo/iluminación fija y composición 2:3 conservados; entrada/hover/parallax/zoom/flotación/brillo automático/control de pausa retirados. Pages empaqueta exclusivamente inicio/CSS/motion; API, demás HTML/JS y secretos permanecen en Worker f73d5087 al 100%. Sin catálogo/carrito/checkout/Auth/DB/DNS modificados.

CI fuente SUCCESS [37652905399](https://github.com/facumartea/dreams/actions/runs/37652905399): 95/95 (92 base + 3 proxy), check 35, audit y builds Pages/Workers. QA remota real alias raíz: seis tamaños con foto/espera/hover/scroll/reduced estáticos; texto sin recorte en tamaños cortos, CTA catálogo, menús/filtros completos 390/1440, carrito secuencial/contador/persistencia/total; sin pageerror. Doce archivos coinciden con fuente y funcionales con sitio previo; CSP/ETag/304/HEAD correctos. Health 200. Capturas en /workspace/dreams-static-evidence.

**Pendiente previo confirmado:** vaciar antes de finalizar una cotización puede restaurar productos; caso falló y se reprodujo con quote real demorada. Código del carrito idéntico al anterior; corrección pendiente PR35, intencionalmente no incluida. No se presenta esta carrera como resuelta. Auth/Admin autenticados, pagos, dispositivo físico/Safari y logs de runtime no verificados.

Rollback original: Pages ae2f7932 SUCCESS, URL inmutable HTTP 200 y endpoint oficial documentado, sin borrado ni cambios Worker; no ejecutado porque no hay regresión nueva que requiera revertir el hero. Evidencia: docs/static_home_pages.md. Próxima acción: revisar apariencia en celular del usuario y abordar por separado la integración segura de PR35 si se autoriza; PR34/35/36/37 siguen abiertas.

## Checkpoint previo: URL dreams-perfumes.pages.dev

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
