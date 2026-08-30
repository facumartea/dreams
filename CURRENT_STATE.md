# Estado actual — DREAMS

**SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.**

## Identidad

- PROYECTO: DREAMS — tienda catálogo de perfumería con consultas por WhatsApp.
- REPO: `https://github.com/facumartea/drams.git`
- RAMA ACTUAL: `codex/checkout-sandbox-foundation` (checkpoint preparado desde `main` `19a50120d4eddb2b93faa0bb37a7c86ec426d5a9`).
- PRS FUSIONADOS: [#1 — Production audit and critical hardening](https://github.com/facumartea/drams/pull/1), [#2 — Align Railway runtime with Node 24](https://github.com/facumartea/drams/pull/2), [#3 — Refine DREAMS premium visual experience](https://github.com/facumartea/drams/pull/3), [#4 — Harden mutation origins and separate public contact](https://github.com/facumartea/drams/pull/4), [#5 — Add persistent customer review publishing](https://github.com/facumartea/drams/pull/5) y [#6 — Refine women collection and high-resolution hero](https://github.com/facumartea/drams/pull/6).
- HEAD EN `main`: `19a50120d4eddb2b93faa0bb37a7c86ec426d5a9` (merge de PR #6). HEAD funcional de la rama: `5891d24c7693bb127e35e4cb33c565deb59a8021`.
- PR ABIERTO: [#7 — Add safe Mercado Pago Sandbox checkout foundation](https://github.com/facumartea/drams/pull/7), mergeable y con CI verde; no fusionado porque el merge a `main`/producción requiere autorización explícita.
- ÚLTIMO PUSH: rama `codex/checkout-sandbox-foundation`; commit `5891d24c7693bb127e35e4cb33c565deb59a8021` (`Add safe Mercado Pago Sandbox checkout foundation`).
- ÚLTIMO CI VERIFICADO: GitHub Actions CI #22, SUCCESS sobre `5891d24c7693bb127e35e4cb33c565deb59a8021`.
- ÚLTIMO DEPLOY: Railway `d85de2c7-c35e-4089-a4a9-4e7f77880096`, SUCCESS sobre `19a50120d4eddb2b93faa0bb37a7c86ec426d5a9`.
- FASE ACTUAL: F18 — Checkout Sandbox, bloqueado de forma segura hasta migración/credenciales.
- PROGRESO GENERAL: 67% ponderado (66,70% exacto según `PLAN.md`).

## Porcentaje de todas las fases

F0 100% · F1 70% · F2 85% · F3 72% · F4 75% · F5 62% · F6 74% · F7 35% · F8 72% · F9 78% · F10 94% · F11 72% · F12 65% · F13 30% · F14 15% · F15 76% · F16 76% · F17 0% · F18 42%.

## Último trabajo

- Preparado F11 parcial: cabecera femenina clara marfil/rosa viejo, navegación oscura, acentos cálidos en filtros/cards, corrección del `picture` móvil, touch targets de 44 px y ajustes 390/430/1440+.
- El navegador disponible no permite fijar la matriz de seis viewports; no declarar F11 cerrada ni esos tamaños visualmente ejecutados.
- Implementada base desacoplada de Mercado Pago Checkout Pro: Preferences API, idempotencia, retorno, consulta autoritativa, firma Webhook HMAC y estados aprobado/rechazado/pendiente/cancelado/error.
- Añadidas `checkout.html`, `checkout-resultado.html` y UI responsive. El carrito sólo ofrece el enlace si `/api/checkout/config` confirma activación real.
- Feature flag fail-closed: exige token, `APP_BASE_URL` válida y `CHECKOUT_SCHEMA_READY=true`; sin eso conserva WhatsApp y no simula pagos.
- Suite local 39/39, check de 21 archivos y audit de producción sin vulnerabilidades conocidas.
- Supabase CLI volvió a ser bloqueada al descargar; no se creó ni aplicó migración. Railway no tiene variables Mercado Pago. No hubo compra Sandbox real.
- `PLAN.md` suma F18 y corrige pesos históricos de 104% a 100%; progreso recalibrado a 66,70% exacto.
- PR #7 abierto y CI #22 verde. El merge fue bloqueado por requerir autorización explícita; `main` y Railway siguen sin cambios en esta tanda.

- Generado un hero editorial original de 1024×1536 basado en la composición DREAMS existente, sin texto rasterizado ni referencias de marca ajena.
- Integrados `/assets/dreams-hero-640.webp` (18.840 bytes) y `/assets/dreams-hero-1024.webp` (41.844 bytes) mediante `picture/srcset`; el frasco anterior de 185×272 dejó de ampliarse en portada.
- El lettering `DREAMS / EAU DE PARFUM` ahora es HTML/CSS nítido y decorativo, separado de la imagen.
- `catalogo.html?gender=mujer` presenta el título `Perfumes de Mujer`, copy editorial propio y una variante cálida rosa viejo/taupe limitada a esa colección; filtros, API y datos permanecen iguales.
- Agregadas dos regresiones del hero responsive y la cabecera femenina; check verde, audit sin vulnerabilidades y suite 33/33.
- Commit `7a548f653d092f6000daa83c58fdbac06ca83881` publicado; PR #6 pasó CI #20 y se fusionó como `19a50120d4eddb2b93faa0bb37a7c86ec426d5a9`.
- Railway desplegó `d85de2c7-c35e-4089-a4a9-4e7f77880096` con estado SUCCESS.
- Smoke público: hero y assets 200, health/DB ok, consulta de mujer devuelve 11/11 productos correctos. QA visual real en 1363×936 confirmó imagen cargada, lettering visible, título/copy/filtro femenino, 11 cards y ausencia de overflow.
- No se ejecutó todavía la matriz de seis viewports requerida; no declarar F11 cerrada.

- S2 no fue iniciado: la CLI de Supabase no está instalada y su descarga fue rechazada por el entorno. La regla del proyecto impide inventar una migración o aplicar SQL remoto sin CLI; no hubo cambios DB.
- Implementado en homepage un formulario editorial de opiniones generales con puntuación, comentario, labels, estado live y CTA de sesión para visitantes.
- El formulario detecta sesión, bloquea doble envío, publica por `POST /api/reviews`, informa errores y vuelve a leer `GET /api/reviews` después del alta, por lo que lo guardado reaparece al recargar.
- Añadido rate limit exclusivo de 5 publicaciones por hora para opiniones sin limitar sus lecturas.
- El API responde 201 al crear. Agregada integración que publica con sesión y confirma que la opinión persiste en la recarga de la lista.
- Agregada regresión estática del formulario accesible y su recarga posterior.
- Commit `1893e4f1b755ba87253dc1c6ff395f8817060135` publicado; PR #5 validado por CI #18 y fusionado en `main` como `928cc9990f3ceb8dfdcf208e5db0e89191fb6ade`.
- Railway desplegó `b094ed98-46e3-4178-9542-3de9a9320bf3` con estado SUCCESS y el SHA correcto.
- Smoke de producción: homepage, script y CSS nuevos responden 200; formulario presente; `/api/health` 200 con DB ok; `/api/reviews` 200 y array; `/api/auth/me` 200 sin sesión; POST sin autenticar 401 y sin crear datos.

- Creada desde `main` la rama `codex/security-origin-contact` para implementar el primer bloque S1.
- Añadido `mutation_origin_guard`: todas las mutaciones `POST`, `PUT`, `PATCH` y `DELETE` validan `Origin`/`Referer`; también se rechaza `Sec-Fetch-Site: cross-site` sin origen.
- La allowlist usa `APP_ORIGINS` con orígenes HTTP(S) exactos. Sin configuración explícita, tests/desarrollo usan el origen del request; no se aceptan comodines.
- `/api/config` ahora devuelve `contact_email` y nunca `admin_email`.
- `CONTACT_EMAIL` se fijó en `facundo.martearena@dantebariloche.edu.ar`; homepage y catálogo lo muestran como enlace `mailto:`.
- Agregadas tres regresiones de integración: configuración pública sin identificador Admin, rechazo/aceptación de orígenes y comprobación de que una allowlist configurada no confía en un Host dinámico.
- Commit `64ff9c76a79eb568f48e76dae073f2e1eeb7efb0` publicado; PR #4 validado por CI #16 y fusionado en `main` como `203e17b2e535df8df05e799f7b6ba0d91083434e`.
- Railway configurado con `CONTACT_EMAIL` y `APP_ORIGINS` sin tocar otros valores; deployment `5269e263-0f88-4ebc-be3a-0992445c8047` terminó SUCCESS.
- Smoke de producción: `/api/health` 200 con DB ok; `/api/config` 200 sin `admin_email`; login same-origin conserva 400 de validación; Origin externo y `Sec-Fetch-Site: cross-site` devuelven 403; homepage y catálogo contienen el `mailto:` solicitado.

- Revisión profunda de seguridad y nuevo alcance documentados en `SECURITY_REVIEW_2026-08-29.md`, sin cambiar producción, DB ni dominio.
- No se confirmó una vulnerabilidad crítica explotable. Hallazgos prioritarios: provisioning Admin en arranque, falta de MFA/reautenticación Admin, falta de verificación explícita de Origin, grants SQL demasiado amplios, exposición pública de `admin_email`, opiniones sin formulario/moderación y delete permanente de productos.
- Confirmado que opiniones ya tienen persistencia server-side (`GET/POST /api/reviews`) y que el POST anónimo devuelve 401; falta toda la experiencia de publicación y administración.
- Confirmado que `/api/config` expone `admin_email`; debe dividirse en `CONTACT_EMAIL=facundo.martearena@dantebariloche.edu.ar` y un identificador Admin nunca público.
- Inspeccionada la imagen aportada: 684×1020; el asset actual `dreams-bottle.png` mide sólo 185×272 y se amplía, causa directa de la baja calidad. Plan: recreación 2048×3072 y derivados responsivos.
- Definida dirección para `Perfumes de mujer`: misma identidad negra/marfil/champagne, con rosa viejo/taupe cálido limitado a la cabecera editorial.
- Railway confirma dominio único `drams-production.up.railway.app`; la documentación oficial permite renombrarlo. Se planificó transición a `dreams-perfumes.up.railway.app` si está disponible, con actualización previa de Supabase Auth y SEO.
- Railway corrigió el estado histórico: deployment `bbc4aa7f-4d71-40d9-aa21-c6829a473f59` figura `SUCCESS`.

- Prompt maestro de continuidad formalizado como regla permanente en `PROJECT_MASTER_RULES.md` y referenciado desde `AGENTS.md`; incluye recuperación de contexto, progreso verificable, reportes, Git/checkpoints, CI, deploy y veracidad.
- Verificado en GitHub que `public/css/style.css` de `main` y `codex/dreams-premium-visual` comparten el blob `6caf5be3eeb88e95fd59712c04ec7a7d86ae2441` (29.075 bytes) y contienen el sistema visual premium; no fue necesario volver a modificar el CSS.
- Rediseño visual profundo completado sobre la estructura existente: no se cambiaron funcionalidades, rutas, backend, DB ni Supabase.
- CSS consolidado en un único sistema de diseño negro/marfil/champagne, eliminando las capas contradictorias que causaban recortes y jerarquías inconsistentes.
- Refinados homepage, navbar, hero, cards, catálogo, producto, carrito, cuenta/login/registro, Nosotros, opiniones, footer y Admin.
- Añadidos skeletons, estados vacíos/error, header con scroll, menú accesible, foco visible y responsive recompuesto.
- Isotipo entregado por el usuario integrado como favicon y `apple-touch-icon` en todo el sitio.
- Commits visuales `581e66d71028646fdc5b6b7673694ede9df4dd8f` y documental `a2bf701b2bd23ee0e484d4cea55b37d903105c58` publicados; PR #3 fusionado en `main` como `08e15128ca28fe6742536043a7de8b90c2d82ede`.

- Favoritos retirado de la aplicación activa: navegación, tarjetas, detalle, cuenta, Admin, JS y API. URLs históricas redirigen 301 al catálogo.
- `public/favoritos.html` y `public/js/favoritos.js` eliminados. La tabla `favorites` queda vacía, con RLS, sólo para preservar historial/esquema sin una acción destructiva.
- Login/registro reescritos: validación, estados busy, fallos de red, mensajes accesibles, redirección server-side, cierre de sesión y reintento de carga.
- Corregido el bug confirmado por el que un registro `202` recargaba y ocultaba la instrucción de confirmar el correo.
- Auth responde `Cache-Control: no-store`, limpia cookies cuando el refresh falla y repara perfiles faltantes como `customer`.
- Añadido un retry único y acotado sólo para `PGRST303`, error transitorio `JWT issued at future` observado en logs Railway.
- Estética existente refinada sin cambiar identidad: editorial negra/dorada, tipografías Cormorant/Inter unificadas, navegación activa, cards, botones, formularios y cuenta responsive.
- Baseline Supabase aplicada de forma no destructiva y registrada como `20260828191602 production_baseline`.
- Índices de FKs añadidos/verificados; no se alteraron las 31 filas de catálogo.
- `NEXT_CHAT_PROMPT.md` creado con continuidad completa para otro chat/dispositivo.
- PR #1 y PR #2 fusionados. Railway desplegó `87f9e8d2` con Node 24.19.0; deployment final `f89bba83-0b45-4ba1-894c-cd7dab060d39` terminó SUCCESS, healthcheck pasó en el primer intento y el warning de Node 20 desapareció.

## Tests

- `corepack pnpm install --frozen-lockfile`: OK.
- `corepack pnpm run check`: OK, 17 archivos JavaScript.
- `corepack pnpm test`: 33/33 OK.
- Regresiones cubiertas: validación auth, no-cache, alta con confirmación, login/cookies/redirección, retiro de favoritos y retry `PGRST303`.
- CI #16 del PR #4: SUCCESS sobre `64ff9c76a79eb568f48e76dae073f2e1eeb7efb0`.
- CI #18 del PR #5: SUCCESS sobre `1893e4f1b755ba87253dc1c6ff395f8817060135`.
- CI #20 del PR #6: SUCCESS sobre `7a548f653d092f6000daa83c58fdbac06ca83881`.
- CI #22 del PR #7: SUCCESS sobre `5891d24c7693bb127e35e4cb33c565deb59a8021`.
- E2E con usuarios Supabase reales y QA visual de todas las páginas: pendientes; no declararlos ejecutados.

## CI

- Workflow: `.github/workflows/ci.yml` con instalación frozen, audit, check y tests.
- GitHub Actions CI #10: SUCCESS sobre `069b1ab` (PR #1). CI #12: SUCCESS sobre `855357de` (PR #2). Merge final en `main`: `87f9e8d2`.
- GitHub Actions CI #14: SUCCESS sobre PR #3. PR #3 fusionado; `main` quedó en `08e15128ca28fe6742536043a7de8b90c2d82ede`.
- GitHub Actions CI #16: SUCCESS sobre PR #4. CI #18: SUCCESS sobre PR #5; `main` quedó en `928cc9990f3ceb8dfdcf208e5db0e89191fb6ade`.
- GitHub Actions CI #20: SUCCESS sobre PR #6; `main` quedó en `19a50120d4eddb2b93faa0bb37a7c86ec426d5a9`.

## Bugs y pendientes

1. Falta recuperación de contraseña y su configuración de URL/SMTP de producción.
2. Faltan E2E reales de refresh/logout y roles customer/admin.
3. Opiniones generales ya tienen formulario, persistencia y rate limit; faltan edición propia, regla de duplicados y moderación Admin.
4. La implementación actual conserva el modelo general existente. Asociarlas a productos requerirá una decisión y migración posterior.
5. Faltan grants SQL de privilegio mínimo.
7. Delete de producto sigue siendo permanente; definir archive/auditoría antes de cerrar F7.
8. Faltan QA responsive completo, Lighthouse, SEO, accesibilidad automatizada y QA final.
9. Checkout requiere migración `orders` creada mediante Supabase CLI, credenciales oficiales Sandbox, secreto Webhook, configuración Railway y compras de prueba reales antes de activarse.

## Riesgos

- Supabase advierte protección contra contraseñas filtradas desactivada (WARN); requiere revisar disponibilidad/configuración de Auth.
- El provisioning Admin se ejecuta en cada arranque y debe convertirse en comando manual de una sola vez.
- Cookies `SameSite=Lax` y verificación explícita de Origin/Referer protegen mutaciones; falta mantener `APP_ORIGINS` sincronizado durante futuros cambios de dominio.
- Grants amplios quedan contenidos por RLS, pero debilitan defensa en profundidad.
- Advisor informa `inquiries` con RLS sin policy (INFO). Es intencional: la tabla es server-only mediante secret/service key; no abrir acceso público sin caso real.
- Índices nuevos figuran sin uso (INFO) por haberse creado recién y por bajo volumen; no borrarlos sólo para silenciar el advisor.
- Existe código de checkout/pedidos en modo cerrado; no existen todavía tabla remota, credenciales ni pagos verificados. No presentarlo como checkout operativo.

## DB

- Supabase: `dreams-project`, ref `nwsmbemwtexmrtpkgxrz`, estado `ACTIVE_HEALTHY`, Postgres 17.
- Tablas: `profiles` (1), `products` (31), `favorites` (0), `reviews` (0), `inquiries` (0); todas con RLS.
- Migración aplicada: `20260828191602 production_baseline`.
- Triggers de perfil/`updated_at`, políticas e índices versionados. Advisors ejecutados después de aplicar.

## Deploy

- Railway correcto: proyecto `empowering-rebirth` (`f375bb47-59c8-4cc1-b0d1-4d83ecae5780`).
- Entorno: `production` (`39886077-e963-4fec-b3aa-b0e5d38908dd`).
- Servicio: `drams` (`c5780bbd-4030-4319-a714-1bc0f564e353`).
- Dominio: `https://drams-production.up.railway.app`.
- Último deployment confirmado: `d85de2c7-c35e-4089-a4a9-4e7f77880096`, SUCCESS sobre `19a50120d4eddb2b93faa0bb37a7c86ec426d5a9`.
- Variables nuevas verificadas por comportamiento: `CONTACT_EMAIL` y `APP_ORIGINS`.
- El incidente histórico de cola congelada quedó resuelto; los deployments antiguos figuran removidos y no bloquean producción.
- Smoke 2026-08-29 sobre PR #5: `/` 200 con `#review-form`; assets de opiniones 200; `/api/health` 200 con DB ok; `/api/reviews` 200; publicación anónima 401, sin datos falsos.
- Smoke 2026-08-30 sobre PR #6: `/` y catálogo 200; WebP responsive 200; health/DB ok; 11 productos de mujer; QA visual 1363×936 sin overflow.
- Smoke previo de la versión activa: `/` 200, `/api/health` 200 con DB ok, `/api/products` 200, `/cuenta.html` 200, login inválido 400, `/favoritos.html` 301 y `/admin` sin sesión 403.
- Healthcheck esperado: `/api/health` con API y DB `ok`.

## Bloqueos

- No hay bloqueo activo de Railway: el deployment `d85de2c7-c35e-4089-a4a9-4e7f77880096` figura `SUCCESS`.
- Opiniones queda como modelo general por ahora; asociarlas a cada perfume es una decisión funcional futura, no un bloqueo para la versión actual.
- Recuperación de contraseña completa puede requerir decisión/configuración de URL y SMTP.
- Acciones destructivas sobre la tabla histórica `favorites` o datos reales requieren autorización explícita.
- S2 requiere Supabase CLI; el entorno actual bloqueó su descarga. No usar `apply_migration` remoto como atajo.
- F18 requiere la misma CLI y credenciales oficiales de Mercado Pago Sandbox. No activar `CHECKOUT_SCHEMA_READY` antes de verificar la tabla y Webhooks.

## Próxima acción exacta

Publicar el checkpoint seguro, verificar CI/Railway y smoke. Luego, en un entorno con Supabase CLI, crear/aplicar `checkout_orders`, configurar credenciales oficiales Sandbox/Webhook y ejecutar pagos aprobado, rechazado y pendiente; mantener F11 pendiente hasta disponer de viewport configurable.
