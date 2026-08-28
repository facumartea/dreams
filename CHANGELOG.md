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
- Sin migraciones remotas, push, PR ni deploy en esta tanda hasta el checkpoint Git.
