# Roadmap de producción — DREAMS

Porcentajes al cierre de F0 (2026-08-28). Son estimaciones basadas en evidencia y se actualizan sólo después de validación.

| Fase | Alcance | Peso | Estado |
|---|---|---:|---:|
| F0 | Auditoría total, baseline y documentación | 8% | 100% |
| F1 | Seguridad crítica: XSS, dependencias, headers, abuso | 9% | 60% |
| F2 | Backend/API: validación, errores, health, modularidad mínima | 8% | 50% |
| F3 | Datos/Supabase: seed seguro, migraciones, integridad, índices, RLS | 9% | 45% |
| F4 | Catálogo, detalle, carrito y consultas | 7% | 60% |
| F5 | Favoritos y opiniones | 4% | 50% |
| F6 | Auth, sesiones y usuarios | 8% | 45% |
| F7 | Admin completo y seguro | 7% | 40% |
| F8 | Arquitectura, limpieza y documentación técnica | 5% | 25% |
| F9 | UX funcional y estados | 5% | 40% |
| F10 | Diseño visual y sistema de componentes | 4% | 55% |
| F11 | Responsive verificado | 4% | 45% |
| F12 | Accesibilidad | 5% | 35% |
| F13 | Performance | 4% | 20% |
| F14 | SEO y descubribilidad | 3% | 15% |
| F15 | Testing y CI | 8% | 25% |
| F16 | Producción, deploy y observabilidad | 4% | 30% |
| F17 | QA final de punta a punta | 2% | 0% |

**Progreso general ponderado: 48%.**

## Secuencia y criterios

### F0 — Auditoría total, baseline y documentación

Inventario, arquitectura, datos, seguridad, UX, responsive, accesibilidad, performance, SEO, tests, Git y deploy. Cierre: `AUDIT.md`, `AGENTS.md`, `PLAN.md`, `CURRENT_STATE.md`, `CHANGELOG.md` y verificaciones locales registradas.

### F1 — Seguridad crítica

Eliminar XSS evitando HTML con datos no confiables; retirar/actualizar dependencias vulnerables; activar una CSP compatible; limitar endpoints de escritura; revisar cookies, CSRF/origin y filtrado de errores. Cierre con pruebas de regresión XSS y audit de dependencias verde.

### F2 — Backend y API

Extraer app arrancable para tests, normalizar async errors, validar IDs/tipos/rangos/longitudes/URLs, códigos HTTP y readiness real. Añadir cierre limpio y logs seguros.

### F3 — Datos y Supabase

Separar seed inicial de arranque; nunca sobrescribir catálogo administrado. Crear migraciones versionadas, trigger de perfil si se adopta, `updated_at`, índices justificados y pruebas de integridad/RLS. Verificar advisors cuando exista acceso.

### F4 — Catálogo, detalle, carrito y consultas

Reconciliar precio/stock con servidor, limitar cantidades, generar consulta de carrito útil y consistente, resolver números/config hardcodeados y fallos de red.

### F5 — Favoritos y opiniones

Operación de favorito idempotente/segura ante concurrencia, estado visual correcto, opinión asociada al alcance de negocio decidido y moderación/eliminación si corresponde.

### F6 — Auth, sesiones y usuarios

Definir refresh/revocación, garantizar perfil, recuperación de contraseña/confirmación según negocio, rate limits y pruebas de roles. Requiere decisiones/credenciales Supabase para pruebas remotas.

### F7 — Admin

Reparar edición; completar CRUD y búsqueda/filtros; email/roles según permisos; confirmaciones, archive/delete seguro, loaders, errores y auditoría básica.

### F8 — Arquitectura y limpieza

Separar rutas/servicios/validadores sin sobrearquitectura, eliminar dependencias/código muerto, alinear toda la documentación y reducir duplicación del frontend.

### F9 — UX funcional

Estados loading/empty/error uniformes, feedback accesible, prevención de doble envío, navegación y recuperación ante reload/fallos.

### F10 — Diseño visual

Conservar dirección editorial DREAMS; formalizar tokens, tipografía, grid, spacing y componentes. No rediseñar antes de cerrar funciones críticas.

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

Verificar Railway, variables, Supabase, dominio, logs, readiness/liveness, rollback y smoke post-deploy. No ejecutar acciones remotas destructivas.

### F17 — QA final

Happy path, errores, vacío, inválido, reload, concurrencia, auth/roles, mobile/desktop y producción. Sólo 100% con matriz ejecutada y evidencias.

## Próximo bloque exacto

Continuar F1/F2/F3: (1) endurecer IDs, errores y operaciones concurrentes, (2) corregir ciclo de refresh/revocación y garantía de perfiles, (3) convertir `schema.sql` en migraciones reejecutables y verificables, (4) ampliar integración/API y E2E, y (5) verificar Supabase, Railway y CI reales cuando exista acceso.
