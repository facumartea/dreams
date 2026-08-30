# Reglas maestras permanentes — DREAMS

Este documento formaliza el prompt maestro del propietario y se aplica a todas las tareas futuras. No es una instrucción de una sola tanda.

## Método

1. Analizar el sistema y verificar el estado real.
2. Planificar el cambio dentro del roadmap existente.
3. Implementar sin alterar funciones, datos o identidad fuera del alcance.
4. Ejecutar tests relevantes y registrar exactamente qué se verificó.
5. Actualizar documentación, crear un checkpoint Git seguro y comprobar CI/deploy cuando corresponda.

No hacer cambios al azar, reiniciar auditorías cerradas, inventar funcionalidades, simular pagos/órdenes ni asignar porcentajes optimistas. Avanzar automáticamente entre fases y detenerse sólo por decisión de negocio, credenciales externas, gasto, acción destructiva o riesgo real de producción.

## Memoria persistente

La memoria del proyecto es `AGENTS.md`, `CURRENT_STATE.md`, `PLAN.md`, `CHANGELOG.md`, el código y el historial Git. Al comenzar: leer esos cuatro documentos, verificar rama, HEAD, árbol, remoto, CI y deploy, y seguir la próxima acción exacta. Si falta contexto, no improvisar ni volver a empezar.

`CURRENT_STATE.md` debe incluir proyecto, repo, rama, PR, SHA, fase, progreso general, todas las fases, último trabajo/push/deploy/CI, tests, bugs, pendientes, riesgos, DB, deploy, bloqueos y próxima acción exacta, además de `SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.`

## Calidad de producción

- Seguridad: secretos sólo en servidor; revisar auth, cookies, roles, permisos, RLS, XSS, CSRF/origin, inyección, validación server-side, rate limits, IDs y errores.
- Backend: códigos HTTP, payloads, idempotencia, concurrencia, transacciones, source of truth y logs seguros.
- Datos: migraciones versionadas, constraints, FKs, índices, seeds no destructivos e integridad histórica.
- Frontend/Admin: navegación, CRUD, formularios, estados loading/empty/error, fallos de API, confirmaciones y permisos.
- Diseño: conservar la identidad editorial DREAMS; evitar estética SaaS genérica, glassmorphism y recursos visuales ajenos a la marca.
- Motion: sutil, útil y compatible con `prefers-reduced-motion`.
- Responsive: verificar 390x844, 430x932, 768x1024, 1024x768, 1440x900 y 1920x1080, incluyendo overflow, navegación, tablas, imágenes, modales, formularios y touch targets.
- Accesibilidad: teclado, foco, contraste, labels, ARIA, alt, headings, errores y reduced motion.
- Performance/SEO: medir antes y después cuando corresponda; revisar imágenes, fuentes, JS, caching, queries, lazy loading, metadata, canonical, robots, sitemap, OpenGraph y datos estructurados.
- Testing: unit, integración, API, DB, regresión, check/typecheck, build, E2E y browser QA según el riesgo. Nunca borrar o debilitar tests para obtener verde.

## Git, CI y deploy

Usar ramas, commits lógicos, push, CI, PR y merge sin force-push. Un push no equivale a deploy. No subir si fallan tests críticos, hay secretos, cambios ajenos no entendidos o migraciones destructivas sin autorización. Tras un deploy importante, verificar logs, healthcheck y smoke real. Nunca declarar CI, responsive, accesibilidad, deploy o QA como correctos sin evidencia.

## Herramientas coordinadas

- GitHub: código, ramas, commits, PR y CI.
- Figma: diseño previo de pantallas o sistemas complejos y referencia precisa para implementación; no es obligatorio para un ajuste pequeño ya resuelto por los tokens existentes.
- Supabase: Auth, DB, RLS, policies y datos persistentes; sin cambios destructivos ni SQL remoto improvisado.
- Railway: variables, build, health, dominio, logs y deploy; push y deploy se reportan por separado.
- Canva: banners, campañas y assets editoriales, nunca la interfaz completa.
- Notion: documentación ampliada opcional; no sustituye la memoria operativa del repositorio.
- Linear: bugs y unidades reales de trabajo priorizadas; evitar tickets artificiales.

No duplicar toda la información en cada herramienta ni utilizarlas sólo para aparentar actividad. Flujo preferido cuando aplica: tarea → diseño → código/datos → tests → CI → deploy → QA → documentación.

## Progreso y cierre

Los pesos viven en `PLAN.md`. Cada tarea debe recalcular el avance real y reportar el antes, después y diferencia, incluso cuando sea 0%. Una fase sólo llega a 100% con alcance terminado, tests verdes, documentación actualizada, regresiones revisadas y deploy/QA cuando aplique.

El reporte final de cada tarea debe ser conciso y verdadero e incluir: resultado, progreso, fase, todas las fases, implementado, corregido, verificado, pendientes, riesgos, tests, CI, DB, responsive, accesibilidad, performance, diseño, GitHub con `PUSH REALIZADO: SÍ/NO`, deploy con `DEPLOY REALIZADO: SÍ/NO`, estado de `CURRENT_STATE`, bloqueos y próxima acción exacta.
