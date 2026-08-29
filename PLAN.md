# Roadmap de producción — DREAMS

Porcentajes recalibrados después de la revisión profunda de seguridad y del nuevo alcance solicitado el 2026-08-29. Son estimaciones basadas en evidencia y se actualizan sólo después de validación.

| Fase | Alcance | Peso | Estado |
|---|---|---:|---:|
| F0 | Auditoría total, baseline y documentación | 8% | 100% |
| F1 | Seguridad crítica: XSS, dependencias, headers, CSRF/origin, abuso | 9% | 62% |
| F2 | Backend/API: validación, errores, health, modularidad mínima | 8% | 85% |
| F3 | Datos/Supabase: grants mínimos, provisioning, migraciones, integridad, RLS | 9% | 72% |
| F4 | Catálogo, detalle, carrito y consultas | 7% | 75% |
| F5 | Opiniones persistentes, edición y moderación | 4% | 45% |
| F6 | Auth, sesiones, recuperación y usuarios | 8% | 72% |
| F7 | Admin completo, reversible y auditable | 7% | 35% |
| F8 | Arquitectura, limpieza y documentación técnica | 5% | 72% |
| F9 | UX funcional y estados | 5% | 75% |
| F10 | Diseño visual, colección femenina, imagen y sistema de componentes | 4% | 82% |
| F11 | Responsive verificado | 4% | 65% |
| F12 | Accesibilidad | 5% | 65% |
| F13 | Performance | 4% | 25% |
| F14 | SEO y descubribilidad | 3% | 15% |
| F15 | Testing y CI | 8% | 68% |
| F16 | Producción, dominio, deploy y observabilidad | 4% | 72% |
| F17 | QA final de punta a punta | 2% | 0% |

**Progreso general ponderado: 68%** (68,37% calculado con los pesos de la tabla). La baja de 73% a 68% no representa una regresión: incorpora trabajo nuevo y riesgos que antes no estaban medidos, detallados en `SECURITY_REVIEW_2026-08-29.md`.

## Secuencia y criterios

### F0 — Auditoría total, baseline y documentación

Inventario, arquitectura, datos, seguridad, UX, responsive, accesibilidad, performance, SEO, tests, Git y deploy. Cierre: `AUDIT.md`, `AGENTS.md`, `PLAN.md`, `CURRENT_STATE.md`, `CHANGELOG.md` y verificaciones locales registradas.

### F1 — Seguridad crítica

Eliminar XSS evitando HTML con datos no confiables; retirar/actualizar dependencias vulnerables; mantener CSP; limitar endpoints de escritura; agregar verificación de Origin/CSRF, rate limits faltantes y filtrado de errores. Cierre con regresiones XSS/CSRF, pruebas de abuso y audit verde.

### F2 — Backend y API

Extraer app arrancable para tests, normalizar async errors, validar IDs/tipos/rangos/longitudes/URLs, códigos HTTP y readiness real. Añadir cierre limpio y logs seguros.

### F3 — Datos y Supabase

Separar provisioning Admin y seed inicial del arranque; nunca sobrescribir catálogo administrado. Revocar grants amplios, conceder privilegios mínimos, mantener migraciones versionadas, índices justificados y pruebas reales de integridad/RLS. Verificar advisors después de cada migración.

### F4 — Catálogo, detalle, carrito y consultas

Reconciliar precio/stock con servidor, limitar cantidades, generar consulta de carrito útil y consistente, resolver números/config hardcodeados y fallos de red.

### F5 — Opiniones y retiro controlado de favoritos

Favoritos se retiró por decisión de producto. La tabla vacía permanece protegida hasta una migración destructiva autorizada. La API de opiniones ya persiste datos, pero falta formulario público, relación con producto o regla global, edición, límite específico, moderación Admin y pruebas de persistencia tras reload.

### F6 — Auth, sesiones y usuarios

Completar refresh/revocación, recuperación de contraseña y redirects/SMTP, MFA Admin, reautenticación sensible, rate limits y pruebas E2E de roles. Separar email público de contacto del identificador Admin.

### F7 — Admin

Completar CRUD, búsqueda/filtros y moderación de opiniones; reemplazar delete normal por archive/restore; exigir confirmaciones seguras y registrar auditoría básica de acciones privilegiadas.

### F8 — Arquitectura y limpieza

Separar rutas/servicios/validadores sin sobrearquitectura, eliminar dependencias/código muerto, alinear toda la documentación y reducir duplicación del frontend.

### F9 — UX funcional

Estados loading/empty/error uniformes, feedback accesible, prevención de doble envío, navegación y recuperación ante reload/fallos.

### F10 — Diseño visual

Conservar dirección editorial DREAMS; completar la colección `Perfumes de mujer` con una variante cálida controlada, reemplazar el hero pixelado por un master de alta resolución y unificar el contacto público sin cambiar la identidad global.

### F11 — Responsive

QA real y correcciones en 390x844, 430x932, 768x1024, 1024x768, 1440x900 y 1920x1080; revisar overflow, tablas, sticky, formularios y touch targets.

### F12 — Accesibilidad

Foco visible, teclado, menú accesible, estados ARIA, mensajes live, headings, contraste, labels, alt y `prefers-reduced-motion`. Automatización más QA manual.

### F13 — Performance

Medir Lighthouse/transferencia; optimizar imágenes, dimensiones, lazy loading, fuentes, caching y queries. Registrar antes/después.

### F14 — SEO

Titles/descriptions únicos, canonical, OpenGraph, robots, sitemap, 404 real y structured data apropiado al negocio/dominio.

### F15 — Testing y CI

Node test runner o herramienta justificada; unit, API, DB aislada, regresión, E2E y GitHub Actions con install, audit, lint/check, test y smoke/build.

### F16 — Producción y deploy

Verificar Railway, variables, Supabase, logs, readiness/liveness y rollback. Migrar de forma controlada a `dreams-perfumes.up.railway.app` si está disponible, actualizando auth y SEO antes del corte y ejecutando smoke post-deploy.

### F17 — QA final

Happy path, errores, vacío, inválido, reload, concurrencia, auth/roles, mobile/desktop y producción. Sólo 100% con matriz ejecutada y evidencias.

## Próximo bloque exacto

Ejecutar S0/S1 de `SECURITY_REVIEW_2026-08-29.md`: añadir tests de Origin/CSRF, middleware de origen para mutaciones, separar `CONTACT_EMAIL` de `ADMIN_EMAIL` y retirar el identificador Admin de `/api/config`. Después preparar la migración de grants mínimos sin aplicarla hasta validar tests y rollback.
