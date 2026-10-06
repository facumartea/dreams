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

### Upload real de preview (2026-10-06 UTC)

OAuth resuelto. Cuenta `9f3d7af60fcb0c2b4fff8570843588f9`, Worker `dreams-perfumes`, SHA `8f9311f50eb5e410f2468f880bd297aa010e334a`, versión `28fccd1e-26de-4e00-ba5c-0c9996442d04`; URL real https://dreams-perfumes.dreams-perfumes.workers.dev. Publicado con `wrangler deploy --env preview --name dreams-perfumes` y vars públicas URL/SUPABASE_URL/orígenes, sin valores secretos. Conservar override para comandos de versiones/secret/tail: la config versionada aún tiene el nombre preview anterior.

**Aplicación funcional pendiente:** remote secrets list devuelve vacío. Agregar SUPABASE_SECRET_KEY como Secret desde Settings → Variables and Secrets del Worker, verificando proyecto Supabase `nwsmbemwtexmrtpkgxrz`. Checkout false/demo, auto-confirm false y schedules vacíos confirmados. Primeros GET raíz/health/products devolvieron 503 del proxy de salida por TLS; no se recibió respuesta del runtime DREAMS ni se validaron flujos. Repetir HTTP/logs/QA tras Secret y propagación TLS. Sin DNS/tráfico/Railway/Supabase/plan comercial modificados. Los textos de falta de OAuth siguientes documentan el bloqueo previo, ahora resuelto.

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

## Continuación de PR34: acceso y comprobación de preview

Revisión del 2026-10-06 (America/Buenos_Aires): HEAD `fdbca5a74992deadc1816430cfa05320827555f9`, CI SUCCESS [run 37530792193](https://github.com/facumartea/dreams/actions/runs/37530792193), 89/89 tests, check 32 y build. Wrangler no autenticado; gestor del entorno sin credenciales. Esto **no prueba que los secretos remotos estén ausentes**: sus nombres/bindings no pueden consultarse hasta autenticar la cuenta. No hay URL de preview obtenida.

Intento OAuth de esta continuación: expiró tras cinco minutos sin autenticación. El código ya no es válido; iniciar uno nuevo sólo cuando el usuario pueda completar el navegador, o configurar token/cuenta en el gestor seguro. CI del checkpoint documental c271061: SUCCESS (run 37531858549). Sin URL ni versión remota obtenidas.

### Acceso seguro desde este entorno remoto

- Preferir token restringido a la cuenta destino, cargado mediante el gestor seguro del entorno como `CLOUDFLARE_API_TOKEN`; seleccionar la cuenta real con `CLOUDFLARE_ACCOUNT_ID`. Permiso de edición de scripts Workers y lectura de logs para esta tarea; no solicitar permisos DNS, routes de zonas, Pages, D1, KV o R2 sin necesidad. No usar una Global API Key.
- Alternativa OAuth para contenedor/SSH sin callback localhost: comando verificado en Wrangler 4.147.0:

```sh
umask 077
pnpm exec wrangler login --device --scopes account:read user:read workers_scripts:write workers_tail:read
pnpm exec wrangler whoami
```

El navegador sólo recibe un código de autorización temporal, no el token. No guardar el código/URL de autorización en Git. Wrangler añade offline_access internamente; no pasarlo como scope CLI. No usar la modalidad temporary como sustitución de una cuenta autenticada. Las credenciales OAuth quedan gestionadas por Wrangler fuera del repo; usar permisos restrictivos/keychain disponible, no copiar su archivo a Git ni mostrarlo.

### Credencial Supabase identificada por código

`worker/index.mjs` consume **`env.SUPABASE_SECRET_KEY`** como segundo argumento de `createClient(env.SUPABASE_URL, ...)`, junto a clientes auth aislados y un cliente servidor. `server/app.js` usa ese cliente para perfiles y escrituras controladas por API; las llamadas Auth Admin también requieren privilegios elevados. No es una contraseña PostgreSQL, un JWT de usuario ni un Supabase Management Access Token.

La clave debe ser una API key backend del proyecto existente: secret key moderna (`sb_secret_...`) o una `service_role` legacy ya vigente y verificada. El nombre del binding no determina cuál está configurada: el tipo **real** sigue sin verificar porque no hay valor disponible ni acceso al Worker. No rotar ni crear credenciales para superar este bloqueo. Referencia oficial: [API keys Supabase](https://supabase.com/docs/guides/api/api-keys).

El SDK está en el bundle **servidor Worker**; eso es distinto del bundle del navegador. `public/` no importa createClient ni contiene referencias a SUPABASE_SECRET_KEY o valores sb_secret. `/api/config` sólo retorna campos públicos explícitos; no devuelve env. Secret values se inyectan en runtime, no con --var ni sustitución durante build.

### Verificar y configurar sólo el servicio preview

```sh
pnpm exec wrangler deployments list --env preview
pnpm exec wrangler secret list --env preview
```

Estos comandos consultan versiones y **nombres** de secretos, sin valores. Si existe `dreams-migration-preview`, revisar cuenta, bindings, URL de Supabase y versión antes de sobrescribirlo; no asumir que es un servicio descartable. Si el secreto ya existe, conservarlo y verificar acceso con health; no recrearlo a ciegas.

Cuando haga falta cargarlo, el usuario debe abrir el servicio `dreams-migration-preview` en Cloudflare → Settings → Variables and Secrets → añadir **Secret** `SUPABASE_SECRET_KEY`, o usar `pnpm exec wrangler secret put SUPABASE_SECRET_KEY --env preview` con entrada interactiva oculta. Obtener la clave desde el dashboard Supabase del proyecto existente. No pegarla en el chat, argumentos, PR o logs. Si el Worker todavía no existe, preparar secretos/vars en el flujo de creación de la preview y verificar que no publique una versión funcional sin límites de acceso.

Configurar las variables servidor `SUPABASE_URL` (mismo proyecto real), APP_BASE_URL y APP_ORIGINS con la **URL HTTPS asignada realmente** por Cloudflare; no inventar el subdominio. `keep_vars` conserva vars adicionales del dashboard; revisar settings remotos antes y después de desplegar. El comando concreto es `pnpm run deploy:cloudflare:preview` (`wrangler deploy --env preview`). No tiene routes DNS/custom-domain ni bindings de colas/cron/DB nueva; verificar triggers remotos si el servicio ya existe.

El preview usa demo con CHECKOUT_SCHEMA_READY=false, DEMO_AUTO_CONFIRM_EMAIL=false y CHECKOUT_SHOW_TEST_DATA=false. No necesita credenciales Mercado Pago para lecturas. Demo **no equivale a no escribir datos**: habilitar checkout crearía orders en Supabase. Registro convencional puede enviar correo, y login de un usuario sin perfil puede crear uno. Restringir acceso a la preview a los testers antes de usar una clave privilegiada contra la DB real; no registrar usuarios, publicar opiniones, consultas, editar Admin ni habilitar compras sobre datos comerciales durante QA.

### Matriz de validación remota pendiente

| Flujo | Comprobación segura tras deploy | Estado en esta continuación |
|---|---|---|
| Catálogo/detalle/marcas/búsqueda/imágenes/assets | Lecturas HTTP y navegador; registrar imágenes fallidas sin sustituirlas | BLOQUEADO sin preview |
| Carrito/persistencia/quote | localStorage y quote sin cupón/pedido nuevo | BLOQUEADO sin preview |
| API/health/errors/redirects/private cache | GET/HEAD, 404, Admin anónimo 403, no-store y CSP | BLOQUEADO sin preview |
| Auth/refresh/logout | Sólo cuentas de prueba existentes con perfil; comprobar cookies Secure/HttpOnly/SameSite | PENDIENTE cuenta de prueba y preview |
| Recuperación de contraseña | No hay flujo implementado; no enviar recovery a clientes | NO EXISTE actualmente |
| Checkout/webhooks | Comprobar disabled; escenarios de pago sólo en entorno de pruebas aislado y disponible | PENDIENTE, sin pedidos/cobros reales |
| Admin | Anónimo rechazado; lectura autorizada con tester Admin; no CRUD real | PENDIENTE credenciales de prueba |
| Responsive/identidad | Repetir seis viewports sobre URL real; no extrapolar QA local | BLOQUEADO sin preview |
| Logs/versión/bindings | Inspeccionar versión desplegada, categorías de error y configuración sin valores secretos | BLOQUEADO sin acceso |

No modificar Site URL o redirect allowlist de Supabase sólo por desplegar: login/refresh actuales son cookies del backend, sin OAuth/recovery callback implementado. Si un flujo real necesita una URL adicional, añadir sólo la preview conservando las existentes y verificarla; no retirar orígenes actuales.

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

Estado y procedimiento detallados: [recovery_runbook.md](recovery_runbook.md). Reconsulta del 2026-10-06: Railway offline, deployments recientes REMOVED con canRollback=false; HTTP raíz/health/products 404. Hay opción de reconstrucción con costo, pero main histórico ejecuta seed y no es el artefacto seguro de recuperación. Sin versión Workers publicada y comprobada, **no existe hoy rollback operativo**. Restauración requiere autorización, configuración verificada, nuevo SUCCESS y smoke remoto.

- Antes del cambio guardar export DNS, TTL, versión Worker anterior (si existe), backend anterior y variables/orígenes necesarios; confirmar que el destino anterior responde.
- Si falla el nuevo tráfico: desasociar la route/custom domain añadida y restaurar exactamente los registros web previos aprobados, sin alterar MX/TXT; esperar TTL y repetir smoke. Conservar ambos hosting durante la observación.
- Si ya había una versión Workers verificada: `pnpm exec wrangler rollback <VERSION_ID_VERIFICADO> --env production`; no inventar IDs. Verificar runtime y dominio después.
- Supabase no se revierte ni restaura para este rollback: no se hicieron migraciones ni escrituras por hosting. Los pedidos/usuarios reales no deben perderse.
