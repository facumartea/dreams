# Estado actual — DREAMS

**SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.**

## Identidad

- PROYECTO: DREAMS — tienda catálogo de perfumería con consultas por WhatsApp.
- REPO: `https://github.com/facumartea/drams.git`
- RAMA ACTUAL: `codex/security-origin-contact`.
- PRS FUSIONADOS: [#1 — Production audit and critical hardening](https://github.com/facumartea/drams/pull/1), [#2 — Align Railway runtime with Node 24](https://github.com/facumartea/drams/pull/2), [#3 — Refine DREAMS premium visual experience](https://github.com/facumartea/drams/pull/3) y [#4 — Harden mutation origins and separate public contact](https://github.com/facumartea/drams/pull/4).
- HEAD EN `main`: `203e17b2e535df8df05e799f7b6ba0d91083434e` (merge de PR #4). Rama de continuidad: `codex/security-origin-contact`.
- FASE ACTUAL: F1 — hardening HTTP y exposición mínima de configuración pública.
- PROGRESO GENERAL: 69% ponderado (69,41% exacto según `PLAN.md`).

## Porcentaje de todas las fases

F0 100% · F1 70% · F2 85% · F3 72% · F4 75% · F5 45% · F6 74% · F7 35% · F8 72% · F9 75% · F10 84% · F11 65% · F12 65% · F13 25% · F14 15% · F15 68% · F16 74% · F17 0%.

## Último trabajo

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
- `corepack pnpm test`: 29/29 OK.
- Regresiones cubiertas: validación auth, no-cache, alta con confirmación, login/cookies/redirección, retiro de favoritos y retry `PGRST303`.
- CI #16 del PR #4: SUCCESS sobre `64ff9c76a79eb568f48e76dae073f2e1eeb7efb0`.
- E2E con usuarios Supabase reales y QA visual de todas las páginas: pendientes; no declararlos ejecutados.

## CI

- Workflow: `.github/workflows/ci.yml` con instalación frozen, audit, check y tests.
- GitHub Actions CI #10: SUCCESS sobre `069b1ab` (PR #1). CI #12: SUCCESS sobre `855357de` (PR #2). Merge final en `main`: `87f9e8d2`.
- GitHub Actions CI #14: SUCCESS sobre PR #3. PR #3 fusionado; `main` quedó en `08e15128ca28fe6742536043a7de8b90c2d82ede`.

## Bugs y pendientes

1. Falta recuperación de contraseña y su configuración de URL/SMTP de producción.
2. Faltan E2E reales de refresh/logout y roles customer/admin.
3. Opiniones no tienen formulario público, edición, rate limit dedicado ni moderación Admin.
4. Falta decidir si las opiniones serán generales o una por usuario y producto; se recomienda la segunda opción.
5. Faltan grants SQL de privilegio mínimo.
7. Delete de producto sigue siendo permanente; definir archive/auditoría antes de cerrar F7.
8. Faltan QA responsive completo, Lighthouse, SEO, accesibilidad automatizada y QA final.

## Riesgos

- Supabase advierte protección contra contraseñas filtradas desactivada (WARN); requiere revisar disponibilidad/configuración de Auth.
- El provisioning Admin se ejecuta en cada arranque y debe convertirse en comando manual de una sola vez.
- Cookies `SameSite=Lax` y verificación explícita de Origin/Referer protegen mutaciones; falta mantener `APP_ORIGINS` sincronizado durante futuros cambios de dominio.
- Grants amplios quedan contenidos por RLS, pero debilitan defensa en profundidad.
- Advisor informa `inquiries` con RLS sin policy (INFO). Es intencional: la tabla es server-only mediante secret/service key; no abrir acceso público sin caso real.
- Índices nuevos figuran sin uso (INFO) por haberse creado recién y por bajo volumen; no borrarlos sólo para silenciar el advisor.
- No existen pagos, órdenes ni uploads. No presentarlos como funcionalidad.

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
- Último deployment confirmado: `5269e263-0f88-4ebc-be3a-0992445c8047`, SUCCESS sobre `203e17b2e535df8df05e799f7b6ba0d91083434e`.
- Variables nuevas verificadas por comportamiento: `CONTACT_EMAIL` y `APP_ORIGINS`.
- Deployment correcto del rediseño: `21225f51-7484-4bfd-903d-dbb35d294539`, commit exacto `08e15128ca28fe6742536043a7de8b90c2d82ede`, snapshot `f44a20bc-cb2f-4f5d-aa21-75b2f9d267dc`. El build terminó y publicó la imagen, pero Railway mantiene el estado `BUILDING` sin cambio desde `2026-08-29T01:21:46Z`.
- Redeploy anterior accidental del commit viejo: `65722afb-b9ba-4a4c-bf26-78e2e6a37197`, atascado en `DEPLOYING` desde `2026-08-29T01:13:31Z`. No volver a ejecutar `redeploy`; hay que cancelar/remover sólo este deployment viejo o esperar a que Railway libere la cola.
- El deployment viejo `65722...` finalmente llegó a SUCCESS a las `2026-08-29T02:01:11Z` y quedó sirviendo producción.
- El deployment visual `21225...` arrancó correctamente el contenedor del SHA `08e15128...`, pero permanece congelado en `DEPLOYING` y bloquea la cola.
- Redeploy limpio solicitado explícitamente para recuperar producción: `bbc4aa7f-4d71-40d9-aa21-c6829a473f59`, snapshot `010d8c14-189d-4ddd-9578-b0a5901055ba`, commit verificado `08e15128ca28fe6742536043a7de8b90c2d82ede`; permanece `INITIALIZING` detrás de `21225...`.
- Verificación sin caché: el dominio todavía entrega HTML sin `dreams-isotype` y CSS viejo de 33.953 bytes sin `--accent:#c5a46a`; no declarar el diseño publicado.
- Verificación final 2026-08-29: el dominio ya entrega HTML con `dreams-isotype` y CSS con `--accent:#c5a46a`; `/api/health` responde `{\"status\":\"ok\",\"api\":true,\"database\":\"ok\"}`. El dashboard aún muestra `bbc4...` como `DEPLOYING` por retraso de estado, pero el tráfico público ya está en la versión visual nueva.
- La URL pública sigue operativa y respondió `/` 200 el 2026-08-29 01:27 UTC, pero aún sirve la versión `87f9e8d2`; no declarar el rediseño desplegado hasta ver `21225...` en SUCCESS y comprobar el favicon/CSS nuevos.
- Smoke previo de la versión activa: `/` 200, `/api/health` 200 con DB ok, `/api/products` 200, `/cuenta.html` 200, login inválido 400, `/favoritos.html` 301 y `/admin` sin sesión 403.
- Healthcheck esperado: `/api/health` con API y DB `ok`.

## Bloqueos

- No hay bloqueo activo de Railway: el deployment `5269e263-0f88-4ebc-be3a-0992445c8047` figura `SUCCESS`.
- Para cerrar opiniones se necesita una decisión funcional: opinión general o asociada a cada perfume.
- Recuperación de contraseña completa puede requerir decisión/configuración de URL y SMTP.
- Acciones destructivas sobre la tabla histórica `favorites` o datos reales requieren autorización explícita.

## Próxima acción exacta

Crear una rama S2 desde `main` y generar con Supabase CLI una migración no destructiva de privilegios mínimos. Validar que `anon`/`authenticated` conserven sólo lecturas necesarias y que toda escritura continúe pasando por el servidor, sin aplicar aún la migración remota.
