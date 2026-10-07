## Actualización 2026-10-07: portada estática aislada

El build ahora empaqueta sólo inicio/CSS/motion para publicar el diseño estático solicitado sin incluir PR35/36. El proxy conserva respuestas y permisos del backend y reemplaza únicamente esos GET/HEAD exitosos; resto de HTML/JS/API/assets y SUPABASE_SECRET_KEY siguen en el Worker sin modificación. ETag/HEAD/304 y cabeceras protegidas probados. Ver [static_home_pages.md](static_home_pages.md) para evidencia, destino exacto y reversión. El checkpoint de deployment de abajo es histórico hasta cerrar esta publicación.

# DREAMS en pages.dev

El usuario solicita `dreams-perfumes.pages.dev`. Proyecto Pages **dreams-perfumes** en cuenta `9f3d7af60fcb0c2b4fff8570843588f9`; API y HTTP confirman **https://dreams-perfumes.pages.dev**. Deployment `ae2f7932-aefe-48b2-a9e9-8c3597b607f9` SUCCESS, commit `b3cd5f62523d15603078798baa9f31b633692d3f`; URL inmutable https://ae2f7932.dreams-perfumes.pages.dev (mutaciones habilitadas sólo en alias raíz aprobado). CI exacto SUCCESS 37541429804. Backend versión `f73d5087-ac19-4168-890b-6da3abb6b635`, con Pages añadido a APP_ORIGINS y demás configuración/Secret preservados.

QA final ejecutado: raíz/health/catalogo/detalle/CSS 200, 46 productos, quote sin pedido desde Origin Pages 200, Admin HTML/API anónimo 403, ruta API 404 y CSP/no-store privados. Ocho navegaciones 390/1440 todas 200, home 8/catalogo 46, carrito persistente al recargar, sin pageerror/overflow en esos dos tamaños. El primer harness HTTP tuvo un error de indentación local y se corrigió antes de ejecutarlo; no fue fallo de aplicación. Auth/Admin autenticados, pagos/webhooks y matriz completa siguen pendientes. Worker URL original también health 200; no comprado dominio/plan ni modificado DNS/tráfico existente/Supabase/Railway.

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
