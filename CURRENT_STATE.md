# Estado actual — DREAMS

**SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.**

## Identidad

- PROYECTO: DREAMS — tienda catálogo de perfumería con consultas por WhatsApp.
- REPO: `https://github.com/facumartea/drams.git`
- RAMA: `codex/production-hardening` (local, creada desde `main`).
- PR: [#1 — Production audit and critical hardening](https://github.com/facumartea/drams/pull/1), abierto contra `main`.
- HEAD/SHA BASE DE ESTA TANDA: `7e4cbefef364b0e9e3ff4be8d614a3b396f9d23a` (confirmar el HEAD funcional nuevo y CI después del push).
- FASE ACTUAL: F2 — Backend/API, con seguridad y datos críticos todavía en seguimiento.
- PROGRESO GENERAL: 60% ponderado.

## Porcentaje de fases

F0 100% · F1 70% · F2 80% · F3 55% · F4 75% · F5 70% · F6 60% · F7 40% · F8 65% · F9 45% · F10 55% · F11 45% · F12 35% · F13 20% · F14 15% · F15 55% · F16 30% · F17 0%.

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
- Favoritos convertidos a `PUT`/`DELETE` idempotentes, sin lectura previa, con estado visual sincronizado por página.
- Documentación operativa alineada con Node/Express/Supabase y Railway sin Volume.
- Carrito reconciliado contra precio/stock del servidor antes de consultar; el mensaje de WhatsApp incluye el contenido y total actuales.
- Número de WhatsApp retirado de la lógica y enlaces activos del frontend; ahora proviene de configuración server-side.
- Overflow de portada corregido y verificado en los seis viewports; foco visible, reduced motion y menú accesible añadidos en portada.
- API separada en `server/app.js` con factory `create_app`; `server/server.js` quedó limitado al bootstrap real, Supabase y seed.
- Dependencias de DB y cliente de refresh son inyectables para pruebas aisladas sin tocar Supabase remoto.
- Rutas async normalizadas y middleware central de errores agregado; respuestas y logs ya no filtran mensajes internos del proveedor.
- Integración HTTP con DB falsa añadida para catálogo, errores explícitos, rechazos inesperados, readiness y CSP.
- No se modificó la base remota ni se desplegó.

## Tests

- Instalación frozen: OK.
- Verificación supply-chain del lockfile: OK.
- Sintaxis JavaScript: OK.
- Smoke HTTP local sin DB real: OK para servidor/estáticos; demostró healthcheck falso positivo.
- Audit producción: OK, sin vulnerabilidades conocidas.
- Suite Node: 20/20 OK (incluye factory de app, DB inyectable y manejo central de errores además de la cobertura previa).
- E2E completo e integración con Supabase real: pendientes.

## CI

Workflow `.github/workflows/ci.yml` creado con install frozen, audit, check y tests. GitHub Actions run #7: SUCCESS sobre `7e4cbef`; el CI de esta tanda queda pendiente hasta el push.

## Bugs confirmados prioritarios

1. Ciclo de refresh/revocación y trigger de perfiles requieren integración contra Supabase real.
2. Baseline SQL necesita ejecución local/remota controlada, advisors y verificación RLS.
3. El carrito ya reconcilia datos; falta decidir/persistir un modelo real de consulta/orden si el negocio lo requiere.
4. Cobertura API/E2E/DB aún insuficiente; ya hay integración HTTP con DB falsa, pero no integración Supabase real.

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

Definir el alcance real de consultas/opiniones y ampliar pruebas de autorización/sesiones sobre la app inyectable. Luego hacer QA de páginas internas; aplicar/verificar la baseline en un Supabase controlado cuando exista acceso y validar advisors, RLS, Railway y producción sin compartir secretos.
