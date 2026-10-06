# DREAMS en pages.dev

El usuario solicita `dreams-perfumes.pages.dev`. Se creó el proyecto Pages **dreams-perfumes** en la cuenta existente `9f3d7af60fcb0c2b4fff8570843588f9`; la API confirmó ese subdominio exacto. La publicación/QA deben confirmarse en el checkpoint final, no se infieren de crear el proyecto.

## Arquitectura

Pages sirve todas las rutas mediante el módulo advanced-mode `pages/proxy.mjs`, conectado por Service binding **DREAMS** al Worker **dreams-perfumes**. El Worker existente conserva frontend, assets, API, autorización, cookies y cliente Supabase. No duplicar aplicación ni copiar SUPABASE_SECRET_KEY a Pages. Proxy preserva URL, método, Origin, cuerpo, cookies, status, CSP/no-store y Set-Cookie; no redirige al navegador hacia workers.dev. Sin binding o si falla transporte, responde 503/no-store.

El proyecto usa Direct Upload sin auto-deploy Git. Su production_branch es `codex/cloudflare-hosting-migration` para publicar el alias raíz pages.dev desde la PR existente. El término production de Pages identifica el alias raíz del **nuevo proyecto aislado**; no implica main/merge, DNS o tráfico del hosting existente. Ambos orígenes Workers/Pages deben permanecer en APP_ORIGINS del backend. No usar comodines ni sustituir la URL Supabase. APP_BASE_URL del Worker se conserva durante preview; checkout sigue deshabilitado y sus retornos requieren revisión antes de habilitarlo.

## Construcción y despliegue

`pnpm run build:pages` genera `dist/pages/_worker.js` y `_routes.json` (todas las rutas). `pages/wrangler.jsonc` documenta nombre, compatibilidad y Service binding; `pnpm run deploy:pages` publica con Wrangler cuando la sesión tenga Pages edit. La sesión OAuth original de Wrangler sólo tiene permisos Worker: para esta tarea se usa la conexión Cloudflare autorizada para Pages y la API oficial de Direct Upload, con multipart _worker.js/_routes.json, manifest vacío (assets servidos por backend), branch y SHA concretos. No incluir credenciales en payload de código ni variables públicas.

Referencias consultadas: [Service bindings Pages](https://developers.cloudflare.com/pages/functions/bindings/), [advanced mode](https://developers.cloudflare.com/pages/functions/advanced-mode/), [crear deployment Pages](https://developers.cloudflare.com/api/resources/pages/subresources/projects/subresources/deployments/methods/create/). Schema vigente recuperado con Cloudflare search antes de crear proyecto/desplegar.

Checks ejecutados: syntax 35, **92/92** tests (proxy conserva mutaciones/cookies/caché, errores de autorización y falla cerrado); build Pages y build Workers correctos. CI agrega el build Pages sin deployment. Pruebas usan fixtures, no clientes/pagos reales.

## Validación y recuperación

Tras SUCCESS, comprobar URL exacta, health/catalogo/detalle/assets, quote sin pedido, carrito local, Admin anónimo y headers; browser móvil/desktop. Auth/Admin autenticados requieren testers existentes; checkout/webhooks siguen pendientes sin modos seguros. Conservar issues de imágenes/overflow/WhatsApp y clave expuesta documentados, no declarar resueltos por el nuevo dominio.

El Worker y su URL workers.dev permanecen disponibles. Si falla Pages, usar el enlace Workers validado, sin cambiar DNS del dominio existente. Una restauración interna Pages debe seleccionar deployment conocido y comprobar backend/secret/orígenes; Pages depende del mismo Worker y no es un respaldo independiente de Supabase o del runtime backend. No reactivar Railway ni comprar dominios/planes.
