# Estado actual — DREAMS

**SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.**

## Identidad

- PROYECTO: DREAMS — tienda catálogo de perfumería con consultas por WhatsApp.
- REPO: `https://github.com/facumartea/drams.git`
- RAMA DE TRABAJO: `codex/production-hardening`.
- PR: [#1 — Production audit and critical hardening](https://github.com/facumartea/drams/pull/1), contra `main`.
- HEAD/SHA: confirmar el SHA remoto posterior a esta tanda; el último remoto anterior fue `d0bd120f5fa83a067c99e864d0e17505a6597014`.
- FASE ACTUAL: F16 — deploy/observabilidad, continuando en paralelo F6/F9/F10/F15.
- PROGRESO GENERAL: 69% ponderado (68,7% exacto según `PLAN.md`).

## Porcentaje de todas las fases

F0 100% · F1 70% · F2 85% · F3 80% · F4 75% · F5 75% · F6 80% · F7 40% · F8 70% · F9 65% · F10 70% · F11 50% · F12 55% · F13 20% · F14 15% · F15 65% · F16 55% · F17 0%.

## Último trabajo

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

## Tests

- `corepack pnpm install --frozen-lockfile`: OK.
- `corepack pnpm run check`: OK, 16 archivos JavaScript.
- `corepack pnpm test`: 24/24 OK.
- Regresiones cubiertas: validación auth, no-cache, alta con confirmación, login/cookies/redirección, retiro de favoritos y retry `PGRST303`.
- Audit de producción y CI remoto: ejecutar/confirmar después del push final.
- E2E con usuarios Supabase reales y QA visual de todas las páginas: pendientes; no declararlos ejecutados.

## CI

- Workflow: `.github/workflows/ci.yml` con instalación frozen, audit, check y tests.
- Último run remoto confirmado antes de esta tanda: GitHub Actions CI #9, verde.
- El run del nuevo commit debe confirmarse antes del merge/deploy.

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
- El deployment anterior corre un commit viejo de `main`; publicar sólo después de CI verde y merge del PR.
- Healthcheck esperado: `/api/health` con API y DB `ok`.

## Bloqueos

- No hay bloqueo para GitHub/Railway/Supabase mediante las conexiones actuales.
- Recuperación de contraseña completa puede requerir decisión/configuración de URL y SMTP.
- Acciones destructivas sobre la tabla histórica `favorites` o datos reales requieren autorización explícita.

## Próxima acción exacta

Publicar esta tanda en `codex/production-hardening`, esperar CI verde, actualizar y fusionar PR #1 a `main`, esperar el auto-deploy del servicio Railway correcto y ejecutar smoke de `/`, `/api/health`, `/api/products`, `/cuenta.html`, auth inválida, `/favoritos.html` y protección de `/admin`. Después actualizar este archivo con SHA, CI y deployment exactos.
