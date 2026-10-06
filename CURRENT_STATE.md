# DREAMS — estado actual verificado

SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.

Actualizado: 2026-10-06 UTC. Repositorio: facumartea/dreams.

## Alcance y recuperación

El pedido inicial de auditoría fue reemplazado por autorización de recuperación funcional y luego por migración a **Cloudflare**. Render ya no es el destino. No hacer merge, cambios DNS ni cambio de tráfico sin presentar validación y rollback para aprobación. No borrar/desactivar Railway ni modificar datos/esquema/RLS de Supabase.

- Base main: `4655b0cbdcec8ad2aade4cdde03ef60b22652bf1`.
- PR33 recuperada hasta `bfbcf9d4945872d3d2ddfd8be52885120e356c21`; adapta `marca`, retira seed del arranque y corrige dependencias.
- Rama de continuación: `codex/cloudflare-hosting-migration`.
- PR32 de motion excluida. No rediseño.
- Implementación publicada: `f0d52d620497882b68b2c50e244db6f84a7ef2b8` (29 archivos de esta tanda). Push remoto verificado por SHA.
- PR nueva de migración: https://github.com/facumartea/dreams/pull/34, abierta, base main, sin merge. Incluye la base de PR33 sin cerrar/alterar esa PR; PR32 excluida.
- CI del commit de implementación: SUCCESS, https://github.com/facumartea/dreams/actions/runs/37530615797 (verify 27 s). Check Supabase Preview SKIPPED: no se creó un proyecto Supabase nuevo.
- HEAD revisado de PR34: `fdbca5a74992deadc1816430cfa05320827555f9`; CI SUCCESS confirmado para ese SHA exacto (run 37530792193, 89/89, check 32, build). Toda actualización documental posterior debe contrastarse con git log/checks de PR34.
- Historia anterior preservada en `docs/history/CURRENT_STATE_PR33.md` y `docs/history/PLAN_PR33.md`; sus cifras/hosting NO son estado vigente.

## Continuación de preview (2026-10-06, America/Buenos_Aires)

PR34 abierta, rama existente preservada y sin cambios de implementación. Revisión de bindings: assets públicos; sin cron/colas nuevas; checkout deshabilitado y MP no activo en preview. El registro y reparación de perfiles sí pueden escribir, así que no usarlos sobre datos comerciales en QA.

Acceso rechecado: Wrangler no autenticado, sin tokens Cloudflare ni secreto Supabase en proceso/gestor; no archivos locales de bindings. No se pudo consultar secretos/bindings remotos; NO afirmar que están ausentes. Se inició OAuth por dispositivo con scopes account/user read, workers_scripts write y workers_tail read; código temporal no persistido. Resultado: OAuth por dispositivo expiró después de cinco minutos sin autenticación; no hay sesión Cloudflare válida. Se necesita configurar CLOUDFLARE_API_TOKEN/CLOUDFLARE_ACCOUNT_ID mediante el gestor seguro del entorno o completar un nuevo login por dispositivo. No se intentó publicar sin acceso. CI del checkpoint c271061 SUCCESS (run 37531858549).

Build preview dry-run reejecutado en el SHA fdbca5a: correcto, 2156,08 KiB / gzip 499,93 KiB; no deploy. Auditoría estática de public: sin createClient, SUPABASE_SECRET_KEY ni valores sb_secret. Tipo real de la clave sigue sin comprobar; el binding requiere API key backend privilegiada (secret moderna o service_role vigente), no contraseña DB ni token Management.

Guía precisa de acceso seguro, nombres de secretos, matriz remota y efectos comerciales: docs/cloudflare_migration.md, sección Continuación de PR34. Mantener código y PR existentes; no iniciar otra implementación.

## Hechos comprobados

- Supabase `nwsmbemwtexmrtpkgxrz`: activo; 46 productos, 7 perfiles, 8 usuarios Auth, 1 consulta; 0 pedidos/cupones/reviews. RLS activa en las siete tablas públicas. Conteos verificados por SELECT el 2026-10-06.
- `products.marca` es la columna real; HTTP conserva `brand`. No se renombró ninguna columna.
- Railway sin deployment activo, dominio histórico responde 404. No se modificó Railway.
- No existen credenciales Cloudflare en este entorno; búsqueda de integración no devolvió una disponible. Deployment remoto bloqueado hasta disponer de acceso.
- No hay clave Supabase privilegiada local. Las verificaciones contra datos reales usan exclusivamente clave pública y lecturas.
- Suite final: **89/89**, cero fallos/omitidos; check **32 JS/MJS**; audit producción sin vulnerabilidades. Incluye dos pruebas de runtime Workers con fixtures HTTP aisladas, cliente Supabase SDK real, cookies Secure y guard remoto cerrado sin origen.
- Node 24 / pnpm 11.19.0. Aplicación Node no requiere compilación; Workers sí requiere bundle Wrangler.

## Implementación y verificación local

Adaptador Workers `worker/index.mjs` sobre Express con `nodejs_compat`, assets binding, Admin HTML privado empaquetado fuera de public, sesiones aisladas, sin caché compartida privada, entornos preview/production separados. No ejecuta seed ni DDL. Build preview dry-run correcto (31 assets, bundle 2156,08 KiB / gzip 499,93 KiB). No es deploy. Avisos esperados de variables HTTPS remotas aún sin configurar.

Correcciones conservadas de la recuperación autorizada: clientes login/registro/logout por operación, refresh probado, health de columnas/tablas críticas, historial corrupto, reintentos/filtros fuera de orden y manejo de errores Admin, límite home a 8 productos, copy sin promesas demo incorrectas, timeout Mercado Pago.

## Pendientes y límites

Auth remoto/Admin/checkout requieren entorno aislado y credenciales de prueba; no se crearon usuarios ni pedidos reales. Recuperación de contraseña y MFA no tienen flujo UI existente; no inventar su implementación. Mercado Pago carece de tokens verificados. Stock no se reserva/descuenta; idempotencia de creación y límites de uso de cupones siguen pendientes. Imágenes externas problemáticas siguen registradas, sin sustituciones inventadas.

Smoke local ejecutado en workerd mediante harness oficial y salida Node/proxy: 66 navegaciones, 6 viewports, todas 200, sin overflow/pageerror; home 8 y catálogo 46 con marcas. Filtro Byredo, búsqueda Sauvage, reintento tras fallo y quote de carrito pasaron. JSON home 5611 bytes vs catálogo 33566. El wrangler dev directo no conectó Supabase por el proxy local; no confundirlo con un fallo de producción verificado. Evidencia y límites: docs/cloudflare_validation.md.

Procedimiento de preview/promoción/rollback: docs/cloudflare_migration.md. Sin DNS, merge, tráfico nuevo, deploy remoto ni escrituras reales. Railway offline no es rollback operativo hasta restauración verificada.

Próxima acción: habilitar acceso Cloudflare y secreto Supabase por gestor seguro, publicar preview, validar Auth/Admin/pagos con entorno y cuentas de prueba. Presentar resultado y rollback antes de pedir aprobación para cambiar tráfico.
