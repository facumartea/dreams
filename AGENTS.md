# Guía de trabajo — DREAMS

## Objetivo

DREAMS es una tienda catálogo de perfumería con consultas por WhatsApp. Tratar este repositorio como software de producción: no inventar funciones, resultados de QA, estados de deploy ni porcentajes.

## Arquitectura actual

- `public/`: frontend multipágina en HTML, CSS y JavaScript sin framework.
- `views/admin.html`: panel Admin servido sólo después del middleware de autorización.
- `server/app.js`: factory Express 5, API REST y cookies de sesión; permite pruebas con dependencias inyectadas.
- `server/server.js`: bootstrap, cliente Supabase privilegiado, seed y escucha HTTP.
- `server/seed.js`: catálogo inicial y alta opcional del administrador.
- `supabase/schema.sql`: esquema PostgreSQL, constraints, índices y RLS.
- `railway.toml`: despliegue Railway.
- `docs/`: documentación histórica; puede estar desactualizada y no prevalece sobre el código.

El navegador sólo habla con `/api`. `SUPABASE_SECRET_KEY` es exclusivamente del servidor. No incorporar el SDK privilegiado ni secretos en `public/`.

## Reglas obligatorias

1. Al iniciar cualquier sesión o recuperar contexto, leer completos y en este orden: `AGENTS.md`, `CURRENT_STATE.md`, `PLAN.md` y `CHANGELOG.md`; consultar `AUDIT.md` cuando el alcance requiera hallazgos de auditoría.
2. Analizar antes de cambiar. Corregir primero seguridad, integridad de datos y funciones rotas; diseño visual después.
3. No editar `main` directamente, no hacer force-push y no borrar trabajo ajeno.
4. No cambiar el esquema remoto sin una migración versionada, revisión de RLS y verificación posterior.
5. No ejecutar seeds que reescriban precio, stock o contenido administrado en cada arranque.
6. No renderizar datos de API, base, usuario o `localStorage` mediante HTML sin escape/sanitización.
7. No borrar tests para obtener verde. Toda regresión corregida necesita una prueba cuando sea razonable.
8. No afirmar que CI, deploy, responsive, accesibilidad o QA están verificados si no se ejecutaron.
9. Actualizar `CURRENT_STATE.md` y `CHANGELOG.md` en cada tanda significativa.
10. Aplicar permanentemente `PROJECT_MASTER_RULES.md`; estas reglas no son una tarea de una sola vez.

## Fuente de verdad y recuperación

- El estado real del repositorio y `CURRENT_STATE.md` prevalecen sobre el historial del chat.
- Nunca reiniciar la auditoría ni improvisar cuando falte contexto: recuperar rama, HEAD, cambios, fase, tests, CI, deploy, riesgos y próxima acción desde `CURRENT_STATE.md`, y contrastarlos con Git/GitHub.
- Mantener siempre la frase `SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.` dentro de `CURRENT_STATE.md`.
- `PLAN.md` define fases, pesos y progreso; sólo actualizarlo ante avance verificado, cambios de alcance, riesgos o dependencias.
- `CHANGELOG.md` registra únicamente trabajo realizado. `AGENTS.md` cambia sólo cuando aparece una regla duradera.

## Flujo Git y checkpoints

- Antes de cambios importantes verificar repositorio, rama, HEAD, remoto, árbol de trabajo y commits recientes.
- Flujo preferido: rama → commit lógico → push → CI → PR → revisión → `main`. Nunca force-push ni reescribir `main`.
- El usuario autoriza checkpoints seguros en GitHub. Si pide explícitamente subir, ejecutar tests razonables, commit, push y verificar el SHA remoto; detenerse sólo ante tests críticos fallando, secretos, cambios ajenos, migraciones destructivas o riesgo real.
- No confundir push con deploy. Informar ambos por separado y ejecutar smoke test después de deploys relevantes.

## Reporte obligatorio

Después de cada tarea informar, con datos comprobados: resultado, progreso general anterior/actual/variación, fase actual, todas las fases, implementado, bugs, pendientes, tests realmente ejecutados, CI, DB, responsive, accesibilidad, performance, diseño, GitHub, deploy, `CURRENT_STATE`, bloqueos y próxima acción exacta. Indicar siempre `PUSH REALIZADO: SÍ/NO` y `DEPLOY REALIZADO: SÍ/NO`. Si algo no aplica o no fue verificado, decirlo explícitamente.

No aumentar porcentajes por tiempo transcurrido. Avance significa trabajo implementado, probado, documentado y validado. Distinguir siempre entre implementado, probado localmente, verificado en CI y verificado en producción.

## Convenciones

- JavaScript CommonJS en servidor; JavaScript clásico en navegador.
- Endpoints bajo `/api`; respuestas de error con `{ "error": "..." }`.
- Validar en servidor tipos, rangos, IDs y longitudes. La validación HTML es sólo UX.
- Usar códigos HTTP semánticos y no filtrar mensajes internos de Supabase al cliente.
- Cookies de autenticación: `HttpOnly`, `Secure` en producción y una estrategia explícita de expiración/refresh.
- Mantener RLS habilitado en toda tabla expuesta de `public`, aunque el servidor use una clave privilegiada.
- En datos históricos, preferir desactivar/archivar sobre borrar cuando corresponda.

## Entorno y comandos

Requisitos: Node.js 24.x y Corepack. El gestor fijado es `pnpm@11.19.0`.

```text
corepack pnpm install --frozen-lockfile
corepack pnpm start
corepack pnpm audit --prod
corepack pnpm run check
corepack pnpm test
```

`pnpm run check` valida la sintaxis de servidor, frontend, scripts y tests. `pnpm test` usa el test runner nativo de Node. La cobertura debe ampliarse en F15; no confundir la suite inicial con cobertura completa.

Variables obligatorias: `SUPABASE_URL`, `SUPABASE_SECRET_KEY`. Variables operativas: `NODE_ENV`, `PORT`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`, `CONTACT_EMAIL`, `WHATSAPP_NUMBER`, `APP_ORIGINS`. `CONTACT_EMAIL` puede exponerse en la UI; `ADMIN_EMAIL` no. `APP_ORIGINS` contiene los orígenes HTTPS exactos separados por coma y debe actualizarse antes de una migración de dominio. Nunca versionar `.env` real.

## Tests y cierre de fase

Una fase sólo llega a 100% con alcance implementado, pruebas verdes, documentación actualizada y sin bugs conocidos en ese alcance. Para deploy/QA también se necesita smoke test real.

Mínimos futuros: integración de API con Supabase aislado, pruebas de autorización, regresión XSS, E2E de catálogo/cuenta/Admin y QA visual en los seis viewports definidos en `PLAN.md`.

## Deploy

Railway ejecuta `node server/server.js`. El healthcheck debe comprobar dependencias críticas; no aceptar un `200` si Supabase está inaccesible. Verificar variables, logs, dominio y smoke test después de cada despliegue importante. Nunca usar credenciales de producción en tests locales.

Todas las mutaciones HTTP pasan por la verificación de origen. No retirar `mutation_origin_guard`, no aceptar comodines en `APP_ORIGINS` y añadir el dominio nuevo antes de promover un cambio de URL.

## Continuidad

SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.

La fuente de verdad para el siguiente agente/chat/PC es `CURRENT_STATE.md`; confirmar el estado real con Git antes de actuar.
