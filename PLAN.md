# Roadmap de producción — DREAMS

Porcentajes recalibrados el 2026-08-31 al sumar cupones y mantener los pesos en exactamente 100%. Son estimaciones basadas en evidencia y se actualizan sólo después de validación.

| Fase | Alcance | Peso | Estado |
|---|---|---:|---:|
| F0 | Auditoría total, baseline y documentación | 6% | 100% |
| F1 | Seguridad crítica: XSS, dependencias, headers, CSRF/origin, abuso | 7% | 80% |
| F2 | Backend/API: validación, errores, health, modularidad mínima | 6% | 87% |
| F3 | Datos/Supabase: grants mínimos, provisioning, migraciones, integridad, RLS | 8% | 88% |
| F4 | Catálogo, detalle, carrito y consultas | 6% | 78% |
| F5 | Opiniones persistentes, edición y moderación | 4% | 78% |
| F6 | Auth, sesiones, recuperación y usuarios | 7% | 82% |
| F7 | Admin completo, reversible y auditable | 6% | 72% |
| F8 | Arquitectura, limpieza y documentación técnica | 4% | 75% |
| F9 | UX funcional y estados | 5% | 90% |
| F10 | Diseño visual, colección femenina, imagen y sistema de componentes | 4% | 99% |
| F11 | Responsive verificado | 4% | 75% |
| F12 | Accesibilidad | 4% | 78% |
| F13 | Performance | 4% | 47% |
| F14 | SEO y descubribilidad | 3% | 15% |
| F15 | Testing y CI | 7% | 92% |
| F16 | Producción, dominio, deploy y observabilidad | 4% | 79% |
| F17 | QA final de punta a punta | 3% | 0% |
| F18 | Checkout Sandbox, pedidos y pagos | 4% | 82% |
| F19 | Cupones: datos, API, Admin, checkout y seguridad | 4% | 70% |

**Progreso general ponderado: 77%** (77,31% exacto). El avance suma reparación probada del CRUD Admin de productos, gestión persistente de opiniones, pedidos de solo lectura, RLS Admin autenticado, variantes editoriales compartidas para Mujer/Hombre/Unisex y 69 pruebas; no incluye QA Admin autenticado sobre producción, archive/restore, auditoría de acciones ni QA responsive completo en los seis tamaños obligatorios.

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

Favoritos se retiró por decisión de producto. La tabla vacía permanece protegida hasta una migración destructiva autorizada. Opiniones generales ya tiene formulario autenticado, rate limit específico, persistencia tras reload y cobertura API/UI; faltan edición propia, regla de duplicados y moderación Admin. Asociarlas a productos queda fuera del modelo general actual hasta una decisión funcional.

### F6 — Auth, sesiones y usuarios

Completar refresh/revocación, recuperación de contraseña y redirects/SMTP, MFA Admin, reautenticación sensible, rate limits y pruebas E2E de roles. Separar email público de contacto del identificador Admin.

### F7 — Admin

CRUD de productos y cupones, pedidos de solo lectura y edición/eliminación de opiniones están implementados con autorización server-side, JWT Admin y RLS. Faltan archive/restore en lugar de hard delete, búsqueda/filtros amplios, historial de cambios y QA autenticado en producción.

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

### F18 — Checkout Sandbox, pedidos y pagos

Capa de proveedor desacoplada, Checkout Pro oficial, recálculo server-side, pedidos persistentes, verificación HMAC, confirmación autoritativa, estados completos, UI/UX responsive y pruebas. El proveedor demo permite probar el recorrido y persistir pedidos sin cobros ni secretos. Para cerrar F18 todavía faltan credenciales oficiales, Webhook, compras Sandbox reales y QA en producción; el modo demo no sustituye esa validación.

### F19 — Cupones

Cupones persistentes server-only, código mayúsculo, constraints, CRUD Admin, activar/desactivar/eliminar, validación pública mediada por API, cálculo autoritativo en servidor, snapshot en pedido, UI premium y persistencia durante checkout. Para cerrar faltan CI/deploy, smoke autenticado en producción y prueba con un cupón real creado por Admin.

## Próximo bloque exacto

Publicar el checkpoint Admin/categorías, esperar CI y Railway, y ejecutar QA autenticado no destructivo sobre listado, edición controlada con rollback, pedidos, cupones y opiniones. Después completar la matriz visual de Hombre/Mujer/Unisex en los seis viewports obligatorios.

## Expansión premium mapeada al roadmap

Las diez funcionalidades nuevas no crean fases paralelas: hero/cards/tema/360 pertenecen a F10-F13; quiz/configurador/recomendaciones a F4/F9/F15; dashboard/fidelidad/timeline a F3/F7/F18. `PREMIUM_EXPANSION_AUDIT.md` registra estado, reutilización, faltantes, riesgos y orden. Fidelidad no avanza hasta definir beneficios reales; el 360° real no avanza sin assets adecuados y autorizados.
