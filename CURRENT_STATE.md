# Estado actual — DREAMS

**SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.**

## Identidad

- PROYECTO: DREAMS — tienda catálogo de perfumería con consultas por WhatsApp.
- REPO: `https://github.com/facumartea/drams.git`
- RAMA: `codex/production-hardening` (local, creada desde `main`).
- PR: [#1 — Production audit and critical hardening](https://github.com/facumartea/drams/pull/1), abierto contra `main`.
- HEAD/SHA FUNCIONAL VERIFICADO: `6b5969470180d96612573ac23867605ae833ac3a` (el commit exclusivo de actualización de estado puede ser posterior; confirmar `git rev-parse HEAD`).
- FASE ACTUAL: F1 — Seguridad crítica, con críticos de datos de F3 adelantados por riesgo.
- PROGRESO GENERAL: 52% ponderado.

## Porcentaje de fases

F0 100% · F1 70% · F2 55% · F3 55% · F4 60% · F5 50% · F6 60% · F7 40% · F8 30% · F9 40% · F10 55% · F11 45% · F12 35% · F13 20% · F14 15% · F15 30% · F16 30% · F17 0%.

## Último trabajo

- Repositorio clonado y rama segura creada.
- Auditoría integral local persistida en `AUDIT.md`.
- Arquitectura, reglas y roadmap persistidos.
- Node 24 LTS, Git y pnpm 11.19.0 disponibles en esta máquina.
- Neutralizado XSS en datos de API/DB/localStorage, CSP estricta activada y handlers inline eliminados.
- `nodemailer` retirado; audit de producción verde.
- Seed de catálogo convertido a carga sólo si la tabla está vacía.
- Readiness comprueba Supabase y Railway apunta a `/api/health`.
- Edición Admin conserva el ID; validación de productos endurecida; consultas limitadas.
- Suite inicial y workflow CI creados.
- Sesiones con refresh server-side, expiraciones separadas y revocación local en Supabase; perfiles faltantes se reparan como `customer` sin confiar roles a metadata.
- IDs de producto inválidos se rechazan uniformemente con 400.
- Baseline Supabase versionada creada con trigger de perfil, `updated_at`, RLS idempotente e índices; todavía no aplicada.
- Overflow de portada corregido y verificado en los seis viewports; foco visible, reduced motion y menú accesible añadidos en portada.
- No se modificó la base remota ni se desplegó.

## Tests

- Instalación frozen: OK.
- Verificación supply-chain del lockfile: OK.
- Sintaxis JavaScript: OK.
- Smoke HTTP local sin DB real: OK para servidor/estáticos; demostró healthcheck falso positivo.
- Audit producción: OK, sin vulnerabilidades conocidas.
- Suite Node: 11/11 OK (baseline SQL, escape XSS/URL, seed, validación/IDs, cookies, readiness y CSP).
- E2E completo e integración con Supabase real: pendientes.

## CI

Workflow `.github/workflows/ci.yml` creado con install frozen, audit, check y tests. GitHub Actions run #1: SUCCESS sobre `6b596947`.

## Bugs confirmados prioritarios

1. Ciclo de refresh/revocación y trigger de perfiles requieren integración contra Supabase real.
2. Favoritos aún usa toggle read-then-write y requiere resolución atómica/idempotente.
3. Baseline SQL necesita ejecución local/remota controlada, advisors y verificación RLS.
4. Carrito/consultas deben reconciliar datos con servidor y eliminar configuración hardcodeada.
5. Cobertura API/E2E/DB aún insuficiente.

## Pendientes y riesgos

- Ver lista completa y severidades en `AUDIT.md`.
- No conectar ni cambiar Supabase remoto sin acceso y migración revisada.
- No desplegar hasta corregir seed, XSS, health y tener CI mínimo.
- Carrito no es checkout; pagos/órdenes/uploads/storage no existen.
- Responsive de portada quedó sin overflow en seis viewports; faltan todas las páginas y datos reales. Accesibilidad, performance y QA final siguen parciales.

## DB

Supabase/Postgres con baseline `supabase/migrations/20260828144944_production_baseline.sql`; `schema.sql` quedó marcado como snapshot legacy. Cinco tablas con RLS, triggers de perfil/updated_at e índices declarados. La migración no se aplicó: Docker/Postgres local no está disponible y el remoto no está conectado. Advisors, datos y políticas efectivas: no verificados.

## Deploy

Railway configurado con Railpack y `node server/server.js`; healthcheck actualizado a `/api/health` con 503 si DB falla. Dominio, variables, logs, servicio y smoke real: no verificados.

## Bloqueos

- Para validar Supabase/RLS/DB y deploy reales harán falta acceso/conexión del usuario o Docker local, sin exponer secretos en chat.
- GitHub, push y PR funcionan mediante la conexión configurada. No hay bloqueo Git actual.
- No hay bloqueo para continuar con correcciones locales críticas y tests.

## Próxima acción exacta

Convertir favoritos en operación atómica/idempotente; ampliar pruebas de rutas API con DB aislada; alinear README/docs con Supabase y aplicar/verificar la baseline en un entorno controlado. Luego validar advisors, RLS, Railway y producción sin compartir secretos.
