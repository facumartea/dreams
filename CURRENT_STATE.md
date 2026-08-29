# Estado actual — DREAMS

**SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.**

## Identidad

- PROYECTO: DREAMS — tienda catálogo de perfumería con consultas por WhatsApp.
- REPO: `https://github.com/facumartea/drams.git`
- RAMA ACTUAL: `codex/dreams-premium-visual`.
- PRS FUSIONADOS: [#1 — Production audit and critical hardening](https://github.com/facumartea/drams/pull/1) y [#2 — Align Railway runtime with Node 24](https://github.com/facumartea/drams/pull/2). PR visual: crear después del commit documental.
- HEAD DE CAMBIOS VISUALES PUBLICADO: `581e66d71028646fdc5b6b7673694ede9df4dd8f`; producción todavía permanece en `87f9e8d2ad6492796f0c98512376d018e8012f3c` hasta CI/merge.
- FASE ACTUAL: F10/F11/F12 — cierre visual, responsive y accesibilidad; luego F16 deploy.
- PROGRESO GENERAL: 73% ponderado (72,6% exacto según `PLAN.md`).

## Porcentaje de todas las fases

F0 100% · F1 70% · F2 85% · F3 80% · F4 75% · F5 75% · F6 80% · F7 40% · F8 72% · F9 75% · F10 90% · F11 65% · F12 65% · F13 25% · F14 15% · F15 68% · F16 80% · F17 0%.

## Último trabajo

- Rediseño visual profundo completado sobre la estructura existente: no se cambiaron funcionalidades, rutas, backend, DB ni Supabase.
- CSS consolidado en un único sistema de diseño negro/marfil/champagne, eliminando las capas contradictorias que causaban recortes y jerarquías inconsistentes.
- Refinados homepage, navbar, hero, cards, catálogo, producto, carrito, cuenta/login/registro, Nosotros, opiniones, footer y Admin.
- Añadidos skeletons, estados vacíos/error, header con scroll, menú accesible, foco visible y responsive recompuesto.
- Isotipo entregado por el usuario integrado como favicon y `apple-touch-icon` en todo el sitio.
- Commit de código visual `581e66d71028646fdc5b6b7673694ede9df4dd8f` publicado en `codex/dreams-premium-visual`.

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
- `corepack pnpm test`: 26/26 OK.
- Regresiones cubiertas: validación auth, no-cache, alta con confirmación, login/cookies/redirección, retiro de favoritos y retry `PGRST303`.
- CI remoto del PR visual: pendiente de crear/confirmar.
- E2E con usuarios Supabase reales y QA visual de todas las páginas: pendientes; no declararlos ejecutados.

## CI

- Workflow: `.github/workflows/ci.yml` con instalación frozen, audit, check y tests.
- Último run remoto confirmado antes de esta tanda: GitHub Actions CI #9, verde.
- GitHub Actions CI #10: SUCCESS sobre `069b1ab` (PR #1). CI #12: SUCCESS sobre `855357de` (PR #2). Merge final en `main`: `87f9e8d2`.
- Rama visual publicada en `581e66d7`; falta commit documental, PR y run de CI correspondiente.

## Bugs y pendientes

1. Falta recuperación de contraseña y su configuración de URL/SMTP de producción.
2. Faltan E2E reales de refresh/logout y roles customer/admin.
3. Opiniones no tienen moderación/eliminación Admin.
4. Delete de producto sigue siendo permanente; definir archive/auditoría antes de cerrar F7.
5. Faltan QA responsive completo, Lighthouse, SEO, accesibilidad automatizada y QA final.

## Riesgos

- Supabase advierte protección contra contraseñas filtradas desactivada (WARN); requiere revisar disponibilidad/configuración de Auth.
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
- Deployment final: `f89bba83-0b45-4ba1-894c-cd7dab060d39`, SUCCESS sobre `87f9e8d2`, Node 24.19.0.
- El rediseño todavía no está en Railway: se desplegará automáticamente únicamente después de CI verde y merge del PR visual.
- Smoke real: `/` 200, `/api/health` 200 con DB ok, `/api/products` 200, `/cuenta.html` 200, login inválido 400, `/favoritos.html` 301 y `/admin` sin sesión 403.
- Healthcheck esperado: `/api/health` con API y DB `ok`.

## Bloqueos

- No hay bloqueo para GitHub/Railway/Supabase mediante las conexiones actuales.
- Recuperación de contraseña completa puede requerir decisión/configuración de URL y SMTP.
- Acciones destructivas sobre la tabla histórica `favorites` o datos reales requieren autorización explícita.

## Próxima acción exacta

Publicar este checkpoint documental en `codex/dreams-premium-visual`, abrir el PR visual contra `main`, esperar CI verde, fusionar sin force-push, esperar Railway SUCCESS y ejecutar smoke/QA visual real en producción. Después registrar PR, SHA de merge, CI, deployment, páginas verificadas y próxima acción exacta.
