# Preview animada en Pages — 2026-10-15

## Aislamiento y fuente

Rama codex/animated-preview-pages desde PR43/4c50b01, runtime animado fuente d938a97c6c0006411f3404d68b5fb297a36e52c1 (PR43 dependiente de PR40/38/37/34). No mezcla PR49/navegación oficial, PR48/Auth ni carrito por cuenta. Sin merges. La oficial permanece en proyecto dreams-perfumes y hero estático.

Cuenta Cloudflare 9f3d7af60fcb0c2b4fff8570843588f9. Antes del cambio sólo existía dreams-perfumes en Pages. Creado proyecto separado dreams-preview, nombre disponible, sin contratar servicios pagos; hostname reservado https://dreams-preview.pages.dev. Direct Upload, production_branch codex/animated-preview-pages; «production» aquí es la etiqueta Pages de la PREVIEW, no la tienda oficial.

Destino técnico: Pages proxy ES module sin assets ni secretos propios -> backend animado inmutable. Build independiente dist/animated-pages. No reutilizar deploy:pages de la oficial. Archivo pages/animated-release.json fija proyecto, fuentes y destinos; no es configuración Auth ni contiene secretos.

## Configuración aplicada

API oficial consultada: PATCH /accounts/{account_id}/workers/workers/{worker_id}/previews/{preview_id}/deployments/latest aplica JSON Merge Patch; lo omitido se hereda. Se añadieron únicamente APP_ORIGINS con ambos orígenes exactos y APP_BASE_URL de Pages. Backend previo 7c3cd341-0ce1-4045-a6ec-9b5d5bdad9c9, nuevo 6e5be7b8-7166-4605-b25a-372fb5ca509a. Código heredado por semántica oficial de PATCH (sin enviar módulos); assets y variables ajenas a origen/base comparados iguales en respuesta API, secretos heredados como secret_text (SUPABASE_SECRET_KEY y PRESENTATION_SIGNING_KEY) sin leer valores. Proyecto Supabase nwsmbemwtexmrtpkgxrz comprobado por SUPABASE_URL.

PREVIEW_READ_ONLY=true, proveedor demo y flags académicos conservados. Ningún cambio de Auth, datos, permisos, credenciales o DNS. No hay traslado de secretos a Pages, navegador o repositorio. La URL Worker anterior permanece activa; nueva versión cambia sólo configuración de origen/base y conserva su origen permitido.

Proxy transmite método/cuerpo/Origin/cookies a ese backend fijo, redirect manual, no evita autorización ni protección de escrituras. Conserva streams/ranges/cache/cookies. Sólo redirecciones del backend y alias anterior se reescriben al origen de entrada; destinos externos no se siguen ni alteran. X-Robots-Tag noindex/nofollow/noarchive en toda respuesta, robots.txt Disallow: /.

## Build, publicación y recuperación

Node24/pnpm11.19. `pnpm run build:pages:animated` genera el proxy; `pnpm run deploy:pages:animated` publica exclusivamente dreams-preview si Wrangler tiene sesión. En este entorno Wrangler no tiene sesión y se usa el conector Cloudflare autenticado con Direct Upload multipart (manifest, _worker.js módulo y _routes.json). No generar tokens ni copiar secretos para ese mecanismo.

Deployment Pages y QA remota: PENDIENTES en este checkpoint; no declarar URL verificada hasta smoke test. Checks: 130/130 tests PASS, sintaxis50 archivos, audit producción sin vulnerabilidades conocidas, builds Workers/Pages oficial/Pages animada correctos; helpers nuevos hasta17 líneas. Primera ejecución de suite antes de instalar dependencias falló por módulos ausentes; instalación frozen-lockfile y repetición completas PASS. Referencias oficiales de best practices y tipos5.20261015.1 consultadas. Tests nuevos cubren Origin/cookies/cuerpos/403, noindex/errores, redirects, ranges y backend fijo sin SSRF. Verificar login real requiere credenciales de prueba autorizadas disponibles; no inferirlo de pruebas de cookies con fixtures.

Recuperación: mantener Worker anterior y deployment7c3cd341. Si falla Pages, usar temporalmente https://academic-review-dreams-perfumes.dreams-perfumes.workers.dev/ (sin cambio DNS); conserva el backend nuevo compatible con ambos orígenes. Para recuperar configuración anterior, PATCH latest sólo env.APP_ORIGINS y APP_BASE_URL al origen anterior, heredando módulos/assets/secrets; publicar proxy fijado a7c3cd341 si se necesita recuperar Pages. Después comprobar health/catálogo/video/quote y canonical_deployment. No borrar proyectos/deployments ni restaurar Railway. Procedimiento no ejecutado.
