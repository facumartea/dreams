# Changelog

Todos los cambios relevantes de DREAMS se registran aquí. El proyecto aún no usa releases semánticos.

## Unreleased

### 2026-08-28 — Auditoría F0

- Documentada la arquitectura real Node/Express/Supabase y la migración incompleta desde SQLite.
- Creado roadmap ponderado con progreso general inicial de 33%.
- Registrados hallazgos de seguridad, datos, backend, frontend, Admin, UX, accesibilidad, responsive, performance, SEO, CI y deploy.
- Verificada instalación frozen, sintaxis y smoke HTTP local.
- Detectadas 6 vulnerabilidades de producción en `nodemailer`, dependencia sin uso.
- Confirmados XSS por renderizado inseguro, seed destructivo, healthcheck falso positivo y edición Admin rota.
- Sin cambios funcionales, migraciones ni deploys en esta tanda de auditoría.

### 2026-08-28 — Hardening crítico F1/F3

- Neutralizado renderizado XSS de productos, opiniones, usuarios, consultas, errores y carrito; URLs de imagen restringidas a rutas locales/HTTPS.
- Añadida CSP sin `unsafe-inline` y retirados handlers inline.
- Eliminada dependencia `nodemailer` sin uso; audit de producción pasó de 6 vulnerabilidades a cero conocidas.
- Seed del catálogo cambiado para insertar sólo cuando la tabla está vacía, sin sobrescribir cambios Admin ni restaurar borrados.
- Reparada edición Admin al conservar `product-id`.
- Endurecida validación server-side de números, enteros, longitudes y URL de imagen.
- Añadido rate limit específico para consultas públicas.
- Readiness ahora consulta Supabase, devuelve 503 si falla y Railway usa `/api/health`.
- Añadidos 7 tests con Node y verificación de sintaxis reproducible.
- Creado workflow CI con instalación frozen, audit, check y tests.
- Corregido overflow de portada en 390, 430, 768, 1024, 1440 y 1920 px.
- Añadidos foco visible, `prefers-reduced-motion` y estado/escape de menú móvil en portada.
- Corregido el estado de error de opiniones cuando la API no está disponible.
- Rama `codex/production-hardening` publicada; PR #1 abierto contra `main`.
- GitHub Actions CI run #1 completó correctamente sobre `6b596947`.
- Sin migraciones remotas ni deploy en esta tanda.

### 2026-08-28 — Sesiones, IDs y baseline Supabase

- Añadida renovación server-side mediante refresh token y cookies con expiraciones separadas.
- Logout revoca la sesión actual en Supabase cuando hay un access token válido.
- Perfiles faltantes se crean/reparan siempre con rol `customer`; los errores de perfil ya no se ignoran.
- Mensajes de registro dejaron de filtrar errores internos del proveedor.
- IDs inválidos de productos, favoritos, consultas y Admin ahora devuelven 400.
- Creada con Supabase CLI 2.116.0 la migración `20260828144944_production_baseline.sql`.
- La baseline agrega RLS idempotente, trigger seguro de perfil, trigger `updated_at` e índices de catálogo/orden.
- `supabase/schema.sql` marcado como snapshot legacy y `supabase/.temp` ignorado.
- Suite ampliada a 11 pruebas, incluidas invariantes de seguridad/no destrucción de la baseline; audit continúa sin vulnerabilidades conocidas.
- Migración no aplicada ni declarada verificada: falta Postgres/Docker local o conexión controlada al remoto.
- GitHub Actions CI run #3 completó correctamente sobre `3a36ba27`.
