# Estado actual — DREAMS

**SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.**

## Identidad

- PROYECTO: DREAMS — ecommerce de perfumería con checkout preparado y consulta secundaria por WhatsApp.
- REPO: `https://github.com/facumartea/drams.git`
- RAMA DE TRABAJO: `codex/demo-checkout-premium-motion`, fusionada en `main` como `773fd8fa6269ceb02b4655c6f7956b19790991b6`.
- PRS FUSIONADOS: [#1](https://github.com/facumartea/drams/pull/1), [#2](https://github.com/facumartea/drams/pull/2), [#3](https://github.com/facumartea/drams/pull/3), [#4](https://github.com/facumartea/drams/pull/4), [#5](https://github.com/facumartea/drams/pull/5), [#6](https://github.com/facumartea/drams/pull/6), [#7](https://github.com/facumartea/drams/pull/7) y [#8 — Add persistent checkout coupons and Comprar flow](https://github.com/facumartea/drams/pull/8).
- HEAD EN `main`: `773fd8fa6269ceb02b4655c6f7956b19790991b6` (`Merge secure demo checkout and premium motion`).
- PR: [#10 — Add secure demo checkout and premium motion](https://github.com/facumartea/drams/pull/10), fusionado.
- ÚLTIMO PUSH FUNCIONAL: `0dede4bcae63924fca031526041ac3d5a8f9bff9` en `codex/demo-checkout-premium-motion`.
- ÚLTIMO CI VERIFICADO: GitHub Actions CI #30, SUCCESS sobre `0dede4bcae63924fca031526041ac3d5a8f9bff9`.
- ÚLTIMO DEPLOY VERIFICADO: Railway `bfabd1dc-fdd6-4b75-a781-f1a496535df2`, SUCCESS sobre `773fd8fa6269ceb02b4655c6f7956b19790991b6`.
- FASE ACTUAL: F18/F10/F13 — Checkout demo y motion premium; expansión específica auditada.
- PROGRESO GENERAL: 72% ponderado (71,55% exacto según `PLAN.md`).

## Porcentaje de todas las fases

F0 100% · F1 70% · F2 85% · F3 84% · F4 78% · F5 62% · F6 74% · F7 50% · F8 75% · F9 84% · F10 95% · F11 72% · F12 72% · F13 38% · F14 15% · F15 84% · F16 76% · F17 0% · F18 76% · F19 70%.

## Último trabajo

- Implementado proveedor `demo` sin cobros ni credenciales, con estados aprobado/rechazado/pendiente/error y persistencia en `orders`.
- Los campos ficticios de tarjeta se validan sólo en navegador; el servidor rechaza payloads con PAN/CVV/vencimiento y recibe únicamente `order_id` + escenario.
- Aplicada y verificada en Supabase la migración `enable_demo_checkout_provider`; conserva Mercado Pago y habilita `demo`, con RLS y grants server-only.
- Incorporado motion liviano: hero con profundidad sutil, reveals, spotlight, botones magnéticos mínimos, hover de cards y feedback del carrito; touch y `prefers-reduced-motion` desactivan lo no esencial.
- Auditadas hero, cards, quiz, recomendaciones, Dashboard, fidelidad, timeline, 360°, configurador y temas en `PREMIUM_EXPANSION_AUDIT.md`. No se duplicaron componentes ni tablas.
- `.env.example` contenía valores no ficticios y fue sanitizado antes de cualquier publicación. No se expusieron en esta tanda; cualquier credencial que haya quedado en historial debe rotarse.
- Check 25 archivos, tests 53/53 y audit sin vulnerabilidades conocidas. PR #10 pasó CI #30, fue fusionado y Railway desplegó el merge exacto.
- Smoke visual público confirmó checkout demo, aviso sin cobros, formulario ficticio, cupón y bloqueo correcto para visitantes. El navegador bloqueó la navegación directa a JSON; no se afirma ese segundo smoke.

- Corregido el bloqueo real de checkout: la migración anterior nunca había sido versionada ni aplicada. Supabase registra ahora `20260831024826 checkout_orders_and_coupons`.
- Creadas `orders` y `coupons`, ambas server-only, con RLS, privilegios mínimos y cero filas reales; la prueba de insert se revirtió en transacción.
- Implementado CTA `Comprar`, cupón persistente en mayúsculas, desglose Subtotal/Descuento/Total y envío del total final a Mercado Pago.
- Implementado CRUD Admin de cupones, activar/desactivar y validaciones de código/porcentaje tanto en API como DB.
- Railway tiene `APP_BASE_URL`, `MERCADO_PAGO_MODE=sandbox`, `CHECKOUT_SCHEMA_READY=true` y `CHECKOUT_SHOW_TEST_DATA=true`, configurados sin redeploy. Faltan `MERCADO_PAGO_ACCESS_TOKEN` y `MERCADO_PAGO_WEBHOOK_SECRET`.
- Check 22 archivos, tests 48/48 y audit sin vulnerabilidades; PR #8, CI #25, merge, deploy y smoke público completados.

- Preparado F11 parcial: cabecera femenina clara marfil/rosa viejo, navegación oscura, acentos cálidos en filtros/cards, corrección del `picture` móvil, touch targets de 44 px y ajustes 390/430/1440+.
- El navegador disponible no permite fijar la matriz de seis viewports; no declarar F11 cerrada ni esos tamaños visualmente ejecutados.
- Implementada base desacoplada de Mercado Pago Checkout Pro: Preferences API, idempotencia, retorno, consulta autoritativa, firma Webhook HMAC y estados aprobado/rechazado/pendiente/cancelado/error.
- Añadidas `checkout.html`, `checkout-resultado.html` y UI responsive. El carrito sólo ofrece el enlace si `/api/checkout/config` confirma activación real.
- Feature flag fail-closed: exige token, `APP_BASE_URL` válida y `CHECKOUT_SCHEMA_READY=true`; sin eso conserva WhatsApp y no simula pagos.
- Suite local 39/39, check de 21 archivos y audit de producción sin vulnerabilidades conocidas.
- Supabase CLI volvió a ser bloqueada al descargar; no se creó ni aplicó migración. Railway no tiene variables Mercado Pago. No hubo compra Sandbox real.
- `PLAN.md` suma F18 y corrige pesos históricos de 104% a 100%; progreso recalibrado a 66,70% exacto.
- PR #7 fusionado con autorización explícita como `5f63bcd4ad3597f1b0f4ef30c73b85ba2ec88929`; Railway desplegó exactamente ese merge y terminó SUCCESS.
- Smoke público posterior: `/api/health` 200 con API/DB `ok`, `/api/checkout/config` 200 con checkout cerrado (`enabled:false`) y `/checkout.html` 200. La segunda comprobación de assets/catálogo fue bloqueada por el entorno de red; no declararla ejecutada.

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
- `corepack pnpm run check`: OK, 25 archivos JavaScript.
- `corepack pnpm test`: 53/53 OK.
- `corepack pnpm audit --prod`: OK, sin vulnerabilidades conocidas.
- Regresiones cubiertas: validación auth, no-cache, alta con confirmación, login/cookies/redirección, retiro de favoritos y retry `PGRST303`.
- CI #16 del PR #4: SUCCESS sobre `64ff9c76a79eb568f48e76dae073f2e1eeb7efb0`.
- CI #18 del PR #5: SUCCESS sobre `1893e4f1b755ba87253dc1c6ff395f8817060135`.
- CI #20 del PR #6: SUCCESS sobre `7a548f653d092f6000daa83c58fdbac06ca83881`.
- CI #22 del PR #7: SUCCESS sobre `5891d24c7693bb127e35e4cb33c565deb59a8021`.
- CI #23 del PR #7: SUCCESS sobre el HEAD documental `6851e038c297a5acfe8a392193fd2e806d308ce5`.
- CI #25 del PR #8: SUCCESS sobre `292fc13e33855f8387c90ffb4bf32f7e9d1a53d0`.
- E2E con usuarios Supabase reales y QA visual de todas las páginas: pendientes; no declararlos ejecutados.

## CI

- Workflow: `.github/workflows/ci.yml` con instalación frozen, audit, check y tests.
- GitHub Actions CI #10: SUCCESS sobre `069b1ab` (PR #1). CI #12: SUCCESS sobre `855357de` (PR #2). Merge final en `main`: `87f9e8d2`.
- GitHub Actions CI #14: SUCCESS sobre PR #3. PR #3 fusionado; `main` quedó en `08e15128ca28fe6742536043a7de8b90c2d82ede`.
- GitHub Actions CI #16: SUCCESS sobre PR #4. CI #18: SUCCESS sobre PR #5; `main` quedó en `928cc9990f3ceb8dfdcf208e5db0e89191fb6ade`.
- GitHub Actions CI #20: SUCCESS sobre PR #6; `main` quedó en `19a50120d4eddb2b93faa0bb37a7c86ec426d5a9`.
- GitHub Actions CI #23: SUCCESS sobre PR #7; `main` quedó en `5f63bcd4ad3597f1b0f4ef30c73b85ba2ec88929`.
- GitHub Actions CI #25: SUCCESS sobre PR #8; `main` quedó en `ac66917edae49b1e272d51e07b09fe55fe075c32`.

## Bugs y pendientes

1. Falta recuperación de contraseña y su configuración de URL/SMTP de producción.
2. Faltan E2E reales de refresh/logout y roles customer/admin.
3. Opiniones generales ya tienen formulario, persistencia y rate limit; faltan edición propia, regla de duplicados y moderación Admin.
4. La implementación actual conserva el modelo general existente. Asociarlas a productos requerirá una decisión y migración posterior.
5. Faltan grants SQL de privilegio mínimo.
7. Delete de producto sigue siendo permanente; definir archive/auditoría antes de cerrar F7.
8. Faltan QA responsive completo, Lighthouse, SEO, accesibilidad automatizada y QA final.
9. Checkout ya tiene schema remoto y configuración no secreta. Requiere access token y secreto Webhook oficiales Sandbox, más compras de prueba reales antes de considerarse verificado.
10. Cupones están implementados, migrados, validados por CI y desplegados; falta smoke autenticado de CRUD Admin y compra Sandbox real.

## Riesgos

- Supabase advierte protección contra contraseñas filtradas desactivada (WARN); requiere revisar disponibilidad/configuración de Auth.
- El provisioning Admin se ejecuta en cada arranque y debe convertirse en comando manual de una sola vez.
- Cookies `SameSite=Lax` y verificación explícita de Origin/Referer protegen mutaciones; falta mantener `APP_ORIGINS` sincronizado durante futuros cambios de dominio.
- Grants amplios quedan contenidos por RLS, pero debilitan defensa en profundidad.
- Advisor informa `inquiries` con RLS sin policy (INFO). Es intencional: la tabla es server-only mediante secret/service key; no abrir acceso público sin caso real.
- Índices nuevos figuran sin uso (INFO) por haberse creado recién y por bajo volumen; no borrarlos sólo para silenciar el advisor.
- Checkout/pedidos y tablas remotas existen, pero faltan credenciales oficiales Sandbox y pagos reales verificados. No presentarlo como checkout de pago operativo todavía.
- Una clave Supabase y contraseña Admin aparecían como valores no ficticios en `.env.example`; el archivo local ya está sanitizado. Deben rotarse si alguna vez fueron válidos o quedaron en historial.
- El proveedor demo es una simulación interna explícita: no valida tarjetas reales, no cobra y no sustituye Mercado Pago Sandbox.

## DB

- Supabase: `dreams-project`, ref `nwsmbemwtexmrtpkgxrz`, estado `ACTIVE_HEALTHY`, Postgres 17.
- Tablas: `profiles` (1), `products` (31), `favorites` (0), `reviews` (0), `inquiries` (0), `orders` (0), `coupons` (0); todas con RLS.
- Migraciones aplicadas: `20260828191602 production_baseline`, `20260831024826 checkout_orders_and_coupons` y `enable_demo_checkout_provider`.
- Triggers de perfil/`updated_at`, políticas e índices versionados. Advisors ejecutados después de aplicar.

## Deploy

- Railway correcto: proyecto `empowering-rebirth` (`f375bb47-59c8-4cc1-b0d1-4d83ecae5780`).
- Entorno: `production` (`39886077-e963-4fec-b3aa-b0e5d38908dd`).
- Servicio: `drams` (`c5780bbd-4030-4319-a714-1bc0f564e353`).
- Dominio: `https://drams-production.up.railway.app`.
- Último deployment confirmado: `bfabd1dc-fdd6-4b75-a781-f1a496535df2`, SUCCESS sobre `773fd8fa6269ceb02b4655c6f7956b19790991b6`.
- Variables nuevas verificadas por comportamiento: `CONTACT_EMAIL` y `APP_ORIGINS`.
- El incidente histórico de cola congelada quedó resuelto; los deployments antiguos figuran removidos y no bloquean producción.
- Smoke 2026-08-29 sobre PR #5: `/` 200 con `#review-form`; assets de opiniones 200; `/api/health` 200 con DB ok; `/api/reviews` 200; publicación anónima 401, sin datos falsos.
- Smoke 2026-08-30 sobre PR #6: `/` y catálogo 200; WebP responsive 200; health/DB ok; 11 productos de mujer; QA visual 1363×936 sin overflow.
- Smoke 2026-08-30 sobre PR #7: `/api/health` 200 con DB ok; `/api/checkout/config` 200 y `enabled:false`; `/checkout.html` 200. El cierre fail-closed es el comportamiento correcto sin schema ni credenciales Sandbox.
- Smoke 2026-08-31 sobre PR #8: healthcheck Railway 200; carrito, CSS, JS y checkout 200; checkout muestra cupón y modo Sandbox; `/api/checkout/config` 200 y el CTA permanece desactivado correctamente sin credenciales.
- Smoke previo de la versión activa: `/` 200, `/api/health` 200 con DB ok, `/api/products` 200, `/cuenta.html` 200, login inválido 400, `/favoritos.html` 301 y `/admin` sin sesión 403.
- Healthcheck esperado: `/api/health` con API y DB `ok`.

## Bloqueos

- No hay bloqueo activo de Railway: el deployment `bfabd1dc-fdd6-4b75-a781-f1a496535df2` figura `SUCCESS`.
- Opiniones queda como modelo general por ahora; asociarlas a cada perfume es una decisión funcional futura, no un bloqueo para la versión actual.
- Recuperación de contraseña completa puede requerir decisión/configuración de URL y SMTP.
- Acciones destructivas sobre la tabla histórica `favorites` o datos reales requieren autorización explícita.
- La migración F18/F19 ya no está bloqueada y fue verificada mediante la integración oficial de Supabase.
- F18 requiere credenciales oficiales de Mercado Pago Sandbox. El checkout exige token y secreto Webhook simultáneamente, por lo que permanece cerrado si falta cualquiera.

## Próxima acción exacta

Publicar de forma segura `codex/demo-checkout-premium-motion`, verificar CI y activar `CHECKOUT_PROVIDER=demo` en Railway. Ejecutar smoke del flujo demo sin usar datos reales. Después crear el motor determinístico compartido para recomendaciones, quiz y configurador. Rotar la clave Supabase y contraseña Admin potencialmente expuestas antes de considerarlas seguras.
