# Estado actual — DREAMS

**SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.**

## Identidad

- PROYECTO: DREAMS — tienda catálogo de perfumería con consultas por WhatsApp.
- REPO: `https://github.com/facumartea/drams.git`
- RAMA: `codex/production-hardening` (local, creada desde `main`).
- PR: [#1 — Production audit and critical hardening](https://github.com/facumartea/drams/pull/1), abierto contra `main`.
- HEAD/SHA FUNCIONAL VERIFICADO: `6b5969470180d96612573ac23867605ae833ac3a` (el commit exclusivo de actualización de estado puede ser posterior; confirmar `git rev-parse HEAD`).
- FASE ACTUAL: F1 — Seguridad crítica, con críticos de datos de F3 adelantados por riesgo.
- PROGRESO GENERAL: 48% ponderado.

## Porcentaje de fases

F0 100% · F1 60% · F2 50% · F3 45% · F4 60% · F5 50% · F6 45% · F7 40% · F8 25% · F9 40% · F10 55% · F11 45% · F12 35% · F13 20% · F14 15% · F15 25% · F16 30% · F17 0%.

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
- Overflow de portada corregido y verificado en los seis viewports; foco visible, reduced motion y menú accesible añadidos en portada.
- No se modificó la base remota ni se desplegó.

## Tests

- Instalación frozen: OK.
- Verificación supply-chain del lockfile: OK.
- Sintaxis JavaScript: OK.
- Smoke HTTP local sin DB real: OK para servidor/estáticos; demostró healthcheck falso positivo.
- Audit producción: OK, sin vulnerabilidades conocidas.
- Suite Node: 7/7 OK (escape XSS/URL, seed, validación, readiness y CSP).
- E2E completo e integración con Supabase real: pendientes.

## CI

Workflow `.github/workflows/ci.yml` creado con install frozen, audit, check y tests. GitHub Actions run #1: SUCCESS sobre `6b596947`.

## Bugs confirmados prioritarios

1. Refresh token sin uso/revocación; perfil de registro puede fallar silenciosamente.
2. IDs inválidos y algunos errores/operaciones concurrentes aún requieren hardening.
3. Falta migración versionada y verificación RLS/advisors contra Supabase real.
4. Carrito/consultas deben reconciliar datos con servidor y eliminar configuración hardcodeada.
5. Cobertura API/E2E/DB aún insuficiente.

## Pendientes y riesgos

- Ver lista completa y severidades en `AUDIT.md`.
- No conectar ni cambiar Supabase remoto sin acceso y migración revisada.
- No desplegar hasta corregir seed, XSS, health y tener CI mínimo.
- Carrito no es checkout; pagos/órdenes/uploads/storage no existen.
- Responsive de portada quedó sin overflow en seis viewports; faltan todas las páginas y datos reales. Accesibilidad, performance y QA final siguen parciales.

## DB

Supabase/Postgres declarativo en `supabase/schema.sql`; cinco tablas con RLS. Estado remoto, advisors, datos y políticas efectivas: no verificados. No hay migraciones versionadas. El servidor usa clave secreta y bypass de RLS.

## Deploy

Railway configurado con Railpack y `node server/server.js`; healthcheck actualizado a `/api/health` con 503 si DB falla. Dominio, variables, logs, servicio y smoke real: no verificados.

## Bloqueos

- Para validar Supabase/RLS/DB y deploy reales harán falta acceso/credenciales o conexión del usuario, sin exponer secretos en chat.
- GitHub, push y PR funcionan mediante la conexión configurada. No hay bloqueo Git actual.
- No hay bloqueo para continuar con correcciones locales críticas y tests.

## Próxima acción exacta

Endurecer IDs/errores y favoritos concurrentes; implementar ciclo correcto de sesión/refresh/revocación y garantía transaccional del perfil; preparar migraciones Supabase versionadas y ampliar pruebas API. Luego conectar Supabase/Railway/GitHub para validar CI y producción sin compartir secretos.
