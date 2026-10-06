# DREAMS — migración a Cloudflare Workers

Estado: implementación local, sin cambio de tráfico. Actualizado 2026-10-06. Fuente de código: `facumartea/dreams`; DB/Auth siguen en Supabase `nwsmbemwtexmrtpkgxrz`. Railway se conserva, actualmente offline.

## Decisión y compatibilidad

Frontend multipágina HTML/CSS/JS, backend Express 5 CommonJS, Supabase JS, cookies HTTP-only y proveedores demo/Mercado Pago. Node 24, pnpm 11.19.0. No SSR ni bundler frontend; no uploads locales, cron, cola, procesos de negocio persistentes ni filesystem de datos. `server/seed.js` es histórico y no arranca. No se observó uso de Storage, Realtime o Edge Functions; no hay buckets reales. Favoritos fue retirado anteriormente: conserva tabla y redirect, no se reimplementa.

Workers con Static Assets permite conservar Express mediante `node:http` y `handleAsNodeRequest`; Pages estático no ejecuta el backend actual. `nodejs_compat` y fecha 2026-10-06 habilitan HTTP servidor. El puerto 8080 del adaptador es una clave de routing interna, no un listener TCP público.

El Worker no importa el bootstrap Node ni lee `.env`. Sus clientes usan bindings `env`, sin persistencia ni auto-refresh. Cada login/registro/logout/refresh tiene cliente aislado; Admin utiliza JWT del usuario y conserva RLS. El cliente privilegiado nunca hace login. `PRODUCT_BRAND_COLUMN=marca` corresponde a la base verificada; el contrato API sigue siendo `brand`. El bootstrap Node mantiene detección automática para Railway/local.

Static Assets sólo contiene `public/`. Admin HTML se empaqueta como texto desde `views/` y se entrega después del middleware de autorización; no está en assets. 404 y alias JS existentes se conservan. Todos los requests pasan primero por Express: headers Helmet/CSP, guard de origen, rate limits y autorización. `/api`, Admin y cualquier respuesta con cookies DREAMS llevan `Cache-Control: no-store`. Assets públicos conservan revalidación, sin crear caché compartida de sesiones, carrito, pedidos o panel.

Workers no tiene disco persistente. No se añadió D1/KV/R2 ni migró Supabase. Los rate limits Express son por isolate, no globales: configurar controles Cloudflare de abuso antes de producción; no afirmar equivalencia con un límite centralizado. No hay aplicación de reglas WAF verificada en esta cuenta.

Referencias oficiales consultadas (documentación de Cloudflare; el acceso web HTML/Markdown dio 403 en este entorno, contenido verificado desde su repositorio oficial):

- [Node HTTP y adaptador](https://developers.cloudflare.com/workers/runtime-apis/nodejs/http/), [fuente oficial](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/workers/runtime-apis/nodejs/http.mdx).
- [Filesystem virtual](https://developers.cloudflare.com/workers/runtime-apis/nodejs/fs/).
- [Static Assets](https://developers.cloudflare.com/workers/static-assets/).
- [Secrets](https://developers.cloudflare.com/workers/configuration/secrets/).

## Comandos

```sh
corepack pnpm install --frozen-lockfile
pnpm run check
pnpm test
pnpm audit --prod
pnpm run build:cloudflare
pnpm run preview:cloudflare
```

Build: bundle Wrangler dry-run del entorno preview; no publica. Preview local: `http://127.0.0.1:8787`. `pnpm-workspace.yaml` permite exclusivamente postinstall de esbuild/workerd para sus binarios; no aprobar automáticamente todos los paquetes. Wrangler es dependencia de desarrollo, no de arranque Node. `.wrangler`, `dist` y `.dev.vars*` están ignorados.

Para Node existente: `pnpm start`, puerto por defecto 8080; requiere `SUPABASE_URL` y clave servidor. No hay script `build` de Node porque el frontend es estático. Railway mantiene `railway.toml`.

## Variables y secretos

No copiar valores reales en este documento ni en Wrangler vars. Usar `.dev.vars` ignorado para desarrollo y el gestor Secrets de Cloudflare por entorno.

| Nombre | Tratamiento / uso |
|---|---|
| SUPABASE_SECRET_KEY | Secreto servidor obligatorio; jamás publicarlo ni incluirlo en assets |
| SUPABASE_URL | URL de proyecto; binding servidor, misma DB existente |
| APP_BASE_URL | URL HTTPS exacta del Worker preview o dominio aprobado |
| APP_ORIGINS | Orígenes exactos separados por coma; obligatorio en Worker remoto |
| PRODUCT_BRAND_COLUMN | `marca` para el proyecto real; `brand` sólo para otro esquema verificado |
| CONTACT_EMAIL / WHATSAPP_NUMBER | Datos comerciales reales; config pública, falta verificar valores actuales |
| NODE_ENV | `production` remoto; `development` local |
| DEMO_AUTO_CONFIRM_EMAIL | `false` por defecto; no crear/promover usuarios de producción en pruebas |
| CHECKOUT_PROVIDER | preview `demo`, production `mercado_pago`; no habilita checkout por sí solo |
| CHECKOUT_SCHEMA_READY | `false` hasta verificar entorno y estrategia de pruebas; nunca aplicar DDL por hosting |
| CHECKOUT_SHOW_TEST_DATA | `false` por defecto |
| MERCADO_PAGO_MODE | `sandbox` en pruebas; `production` sólo tras validación y autorización correspondiente |
| MERCADO_PAGO_ACCESS_TOKEN / MERCADO_PAGO_WEBHOOK_SECRET | Secrets servidor; ausencia mantiene MP deshabilitado |
| ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME | Históricos de seed, no necesarios ni usados al arrancar; no transferir innecesariamente |

No poner secretos en argumentos shell, archivos versionados o PR. Cargar mediante dashboard Secrets o `pnpm exec wrangler secret put SUPABASE_SECRET_KEY --env preview` (entrada interactiva segura). URL y orígenes se cargan como variables por entorno antes de usarlo. `keep_vars=true` preserva variables adicionales cargadas en el dashboard (incluidos orígenes y datos comerciales) al desplegar; los valores explícitos de Wrangler sí se aplican. Variables por entorno no se heredan automáticamente; revisar binding ASSETS y vars en dry-run de cada entorno.

La prueba local de solo lectura utilizó una clave pública en el binding que normalmente contiene el secreto. Esto NO valida privilegios ni Auth remoto y NO es una configuración válida para desplegar la aplicación completa.

## Publicación de prueba — bloqueos exactos

Faltan acceso Cloudflare (Wrangler `whoami`: no autenticado) y clave Supabase servidor por canal seguro. No hay credenciales configuradas ni integración Cloudflare encontrada; el directorio de plugins puede tener otras opciones. No pedirlas como texto del chat.

1. Proveer token Cloudflare limitado a la cuenta y Workers requeridos, o ejecutar login seguro; fijar cuenta real. No registrar cuentas temporales ni servicios con datos reales como atajo.
2. Cargar secret Supabase en preview y variables reales anteriores. Obtener la URL workers.dev asignada; cargar APP_BASE_URL y APP_ORIGINS con esa URL HTTPS exacta. Worker remoto falla cerrado si faltan origen/URL HTTPS.
3. `pnpm run deploy:cloudflare:preview`. Registrar versión, URL y logs; no hay routes ni custom domains en esta configuración.
4. Smoke de lectura: inicio, 8 destacados, 46 catálogo, marcas, búsqueda, filtros, detalle, imágenes, carrito local/quote, APIs/404/redirect/Admin anónimo/headers. Nunca habilitar cobros reales.
5. Auth/Admin/checkout: usar usuarios existentes exclusivamente de prueba y proveedor sandbox. Si esto puede crear perfiles, pedidos o correos sobre datos comerciales, usar entorno Supabase de pruebas aislado que ya exista y documentar que no valida la DB productiva. No crear ni migrar una DB por este cambio; no generar compras reales para conseguir QA verde.
6. Revisar logs sin tokens/cookies/payloads. El Worker registra categoría de error; no registra URL completa de auth/pago ni cuerpos. No conectar analytics con captura de datos sensibles.

Auth existente es password login/registro + cookies/refresh. No hay flujo de recuperación de contraseña, callback de recovery ni MFA UI; se documenta como pendiente preexistente. No afirmar que fue migrado/probado. Verificar Auth Site URL y allowlist de redirects de Supabase, añadiendo preview sólo si un flujo existente lo requiere, conservando todos los orígenes vigentes. No cambiar Confirm email o RLS por hosting.

## Cambio de producción — requiere aprobación previa

1. Preview funcional verificada, checks verdes del commit exacto, logs revisados y riesgos de negocio resueltos. Presentar al usuario el resultado, registros DNS propuestos y rollback. No cambiar tráfico automáticamente.
2. Inspeccionar/exportar DNS actual, nameservers, TTL, MX/TXT/SPF/DKIM/DMARC y verificaciones. Todavía no inspeccionados: no existe dominio Cloudflare confirmado. No asumir que hacen falta nameservers nuevos.
3. Asegurar que el hosting anterior está saludable o disponer de una versión Workers conocida y probada. **Railway hoy está offline: volver a su 404 no es un rollback válido.** Restauración de Railway debe validarse aparte, conservando proyecto/variables/volumen.
4. Tras aprobación, cargar env production/secret y origins del dominio, validar MP credentials/webhook HTTPS y Supabase redirects sin borrar URLs necesarias. Configurar abuso/WAF y validar cookies Secure, CSP y private no-store.
5. Publicar versión sin route de producción, registrar su ID; asociar únicamente hostname/route aprobados. Cambiar sólo registros web acordados, preservando correo/verificaciones. Nunca Cache Everything sobre API/Admin/cookies.
6. Smoke posterior sobre dominio real: Auth/cookies/orígenes/webhooks pueden fallar aunque workers.dev funcione. Monitorizar errores y catálogo/checkout antes de declarar migración terminada.

## Rollback

- Antes del cambio guardar export DNS, TTL, versión Worker anterior (si existe), backend anterior y variables/orígenes necesarios; confirmar que el destino anterior responde.
- Si falla el nuevo tráfico: desasociar la route/custom domain añadida y restaurar exactamente los registros web previos aprobados, sin alterar MX/TXT; esperar TTL y repetir smoke. Conservar ambos hosting durante la observación.
- Si ya había una versión Workers verificada: `pnpm exec wrangler rollback <VERSION_ID_VERIFICADO> --env production`; no inventar IDs. Verificar runtime y dominio después.
- Supabase no se revierte ni restaura para este rollback: no se hicieron migraciones ni escrituras por hosting. Los pedidos/usuarios reales no deben perderse.
