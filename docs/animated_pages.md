# Preview animada en Pages — 2026-10-15

## Aislamiento y fuente

Rama codex/animated-preview-pages desde PR43/4c50b01, runtime animado fuente d938a97c6c0006411f3404d68b5fb297a36e52c1 (PR43 dependiente de PR40/38/37/34). No mezcla PR49/navegación oficial, PR48/Auth ni carrito por cuenta. Sin merges. La oficial permanece en proyecto dreams-perfumes y hero estático.

Cuenta Cloudflare 9f3d7af60fcb0c2b4fff8570843588f9. Antes del cambio sólo existía dreams-perfumes en Pages. Creado proyecto separado dreams-preview, nombre disponible, sin contratar servicios pagos; hostname reservado https://dreams-preview.pages.dev. Direct Upload, production_branch codex/animated-preview-pages; «production» aquí es la etiqueta Pages de la PREVIEW, no la tienda oficial.

Destino técnico: Pages proxy ES module sin assets ni secretos propios -> backend animado inmutable. Build independiente dist/animated-pages. No reutilizar deploy:pages de la oficial. Archivo pages/animated-release.json fija proyecto, fuentes y destinos; no es configuración Auth ni contiene secretos.

## Configuración aplicada

API oficial consultada: PATCH /accounts/{account_id}/workers/workers/{worker_id}/previews/{preview_id}/deployments/latest aplica JSON Merge Patch; lo omitido se hereda. Se añadieron únicamente APP_ORIGINS con ambos orígenes exactos y APP_BASE_URL de Pages. Backend previo 7c3cd341-0ce1-4045-a6ec-9b5d5bdad9c9, nuevo 6e5be7b8-7166-4605-b25a-372fb5ca509a. Código heredado por semántica oficial de PATCH (sin enviar módulos); GET con include=modules verificó módulos idénticos, además de assets y variables ajenas a origen/base iguales, secretos heredados como secret_text (SUPABASE_SECRET_KEY y PRESENTATION_SIGNING_KEY) sin leer valores. Proyecto Supabase nwsmbemwtexmrtpkgxrz comprobado por SUPABASE_URL.

PREVIEW_READ_ONLY=true, proveedor demo y flags académicos conservados. Ningún cambio de Auth, datos, permisos, credenciales o DNS. No hay traslado de secretos a Pages, navegador o repositorio. La URL Worker anterior permanece activa; nueva versión cambia sólo configuración de origen/base y conserva su origen permitido.

Proxy transmite método/cuerpo/Origin/cookies a ese backend fijo, redirect manual, no evita autorización ni protección de escrituras. Conserva streams/ranges/cache/cookies. Sólo redirecciones del backend y alias anterior se reescriben al origen de entrada; destinos externos no se siguen ni alteran. X-Robots-Tag noindex/nofollow/noarchive en toda respuesta, robots.txt Disallow: /.

## Build, publicación y recuperación

Node24/pnpm11.19. `pnpm run build:pages:animated` genera el proxy; `pnpm run deploy:pages:animated` publica exclusivamente dreams-preview si Wrangler tiene sesión. En este entorno Wrangler no tiene sesión y se usa el conector Cloudflare autenticado con Direct Upload multipart (manifest, _worker.js módulo y _routes.json). No generar tokens ni copiar secretos para ese mecanismo.

Deployment Pages 00bbbec5-8211-4ee4-be61-005690e8e05e SUCCESS, commit644afbb9f4e42a2be0f6a604c26e9db5d485e72a. https://dreams-preview.pages.dev/ y https://00bbbec5.dreams-preview.pages.dev/ verificadas por API/HTTP; frontend servido desde d938a97 y configuración backend6e5be7b8. Artefacto2027bytes SHA25695bd26c44c40d95af537f2d8d5ad26d1fce6c9c31cc1faefe0c33e24cfd403a9. CI38766575709 SUCCESS. Checks: 130/130 tests PASS, sintaxis50 archivos, audit producción sin vulnerabilidades conocidas, builds Workers/Pages oficial/Pages animada correctos; helpers nuevos hasta17 líneas. Primera ejecución de suite antes de instalar dependencias falló por módulos ausentes; instalación frozen-lockfile y repetición completas PASS. Referencias oficiales de best practices y tipos5.20261015.1 consultadas. Tests nuevos cubren Origin/cookies/cuerpos/403, noindex/errores, redirects, ranges y backend fijo sin SSRF. Verificar login real requiere credenciales de prueba autorizadas disponibles; no inferirlo de pruebas de cookies con fixtures.

Recuperación: mantener Worker anterior y deployment7c3cd341. Si falla Pages, usar temporalmente https://academic-review-dreams-perfumes.dreams-perfumes.workers.dev/ (sin cambio DNS); conserva el backend nuevo compatible con ambos orígenes. Para recuperar sólo el proxy después de cambios futuros, reconstruir este commit644afbb y desplegar de nuevo en dreams-preview (mismo artefacto y backend6e5be7b8), después comprobar canonical_deployment/health/catálogo/video/quote. Para volver exclusivamente al Worker anterior, PATCH latest sólo env.APP_ORIGINS y APP_BASE_URL al origen anterior, heredando módulos/assets/secrets. El deployment7c3cd341 NO admite Origin de Pages: no fijar Pages a ese backend ni anunciar recuperación de Pages sin antes crear una versión que conserve el origen nuevo. El destino de recuperación inmediato comprobado es el alias Worker anterior, que sigue200/con video. No borrar proyectos/deployments ni restaurar Railway. Procedimiento no ejecutado.

## Evidencia remota y límites

Chromium móvil390x844 y escritorio1440x900: video silenciado/playsinline/sin loop/controles del reproductor ocultos, reproducción20s hasta ended y fotograma final estable; fallback estático con movimiento reducido. Capturas inicio/final en docs/evidence/animated-pages. Se conserva el control discreto accesible del video existente y el mismo diseño; no se rediseñó esta preview.

Catálogo46 productos, búsqueda parcialSauvage/marcaChanel/restauración, menú móvil, carrito visitante persistente y contador PASS. Checkout académico completado en ambos tamaños sin tarjeta ni pedido comercial: referencias de prueba DREAMS-63854CAF84194B36B790B9328AF3E53F y DREAMS-884916AF9969491794E62073DA86C7C0, estables al recargar; envío gratis. Sólo rutas presentation en POST de finalización; nombre/campos de tarjeta ausentes en payload. Cookie dreams_presentation host dreams-preview.pages.dev, Secure/HttpOnly/SameSite=Lax comprobada remotamente.

Health200/databaseOK, noindex/robots, Admin anónimo403, Origin ajeno rechazado403, escrituras de productos/pedidos/registro bloqueadas403, sesión anónima y validación de login400/logout200 PASS. Redirect favoritos301 permanece en Pages. Google continúa disabled; no se cambia su configuración ni Auth/PR48. Password login usa servidor/cookies host-only y no requiere URL Supabase de callback; no se agregaron URLs Auth innecesarias.

Login real/refresh/roles autenticados NO VERIFICADOS: no hay credenciales autorizadas de prueba disponibles en este proceso (se comprobó sólo presencia de variables, no valores). No se inventaron identidades ni se crearon cuentas. No se afirma validación autenticada a partir de cookies académicas o fixtures. Safari/iPhone físico no probado; Chromium emula viewport/touch.

La primera espera de video20s resultó insuficiente para video20s con carga; ampliada45s, reproducción completa PASS sin editar material. El harness final esperaba hero_video=false en oficial, pero ese backend omite la propiedad; aserción corregida a no true y comprobación adicional de ausencia de video PASS. Cero errores JS en los recorridos móvil/escritorio capturados; no se afirma una auditoría exhaustiva de logs históricos.

Video recibido en nuevo y anterior origen y archivo versionado: SHA256ffab2ba7c3482a1ca0ce8fde75bfff54642fd605a64759d4a0f23e45aff679b8 (3950130bytes,1280x720,H264,20s), sin recompresión. Petición Range recibe200/archivo completo tanto en nuevo como anterior: limitación heredada del adaptador estático Worker, no defecto nuevo del proxy; el test unitario preserva206 si upstream lo entrega. Mejora de ranges/bandwidth pendiente fuera de alcance.

URL anterior https://academic-review-dreams-perfumes.dreams-perfumes.workers.dev/ sigue200/con video; no eliminada. Oficial comprobada sin video. Sin DNS, pagos, datos comerciales ni credenciales modificados. Próxima acción: revisión del usuario en ambas URLs; completar QA autenticada cuando exista acceso seguro, manteniendo PR48/Auth pendiente separado.
