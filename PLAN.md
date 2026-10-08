# Tarea académica — 2026-10-08 UTC

- Base PR37 y sitio vigente: VERIFICADOS. Dependencia PR34; selección carrito PR35 sin merge.
- Autores/contactos/acceso centrado/Google PKCE/Admin guard/checkout aislado: IMPLEMENTADOS.
- Google proveedor y cuenta admin: BLOQUEADOS por configuración/identidad inexistente; legacy conservado.
- Checks locales:105/105 y builds; QA móvil/escritorio, push/PR/preview: EN CURSO.
- Producción y DNS: fuera de publicación autorizada actual; conservar sitio.

# DREAMS — plan vigente

2026-10-07. Destino actualizado por el usuario: Cloudflare Workers. Sin porcentajes especulativos. Plan histórico preservado en `docs/history/PLAN_PR33.md`.

## Portada estática autorizada en Pages

- Identificar sitio vigente y rollback: COMPLETADO (Pages ae2f7932, Worker f73d5087).
- Aislar diseño PR36 sin funcionalidades PR35/36: IMPLEMENTADO sobre PR34/8d80fdd.
- Quitar motion/control de hero y conservar interacción compartida: IMPLEMENTADO; QA local seis tamaños y 390/1440 menús/filtros/carrito.
- Checks/build: 35 JS, 95/95, Pages/Workers correctos.
- PR37/push, preview y publicación Pages: COMPLETADOS. Fuente 5e3835e/CI SUCCESS, production 444489eb, backend intacto.
- QA remota tras deploy: COMPLETADA para hero/CTA/menús/filtros y carrito secuencial. Carrera previa de quote/vaciado confirmada y pendiente PR35; no publicada por esta tarea.

## Plan de hosting previo (histórico)

| Paso | Estado | Evidencia / dependencia |
|---|---|---|
| Estado real, Git, PR33, Supabase y Railway | COMPLETADO | Lecturas verificadas; PR32 excluida |
| Recuperar compatibilidad marca y quitar seed | COMPLETADO en base PR33 | Sin DDL ni datos nuevos |
| Aislar sesiones y corregir dependencias | COMPLETADO local | 87 tests; audit prod limpio |
| Adaptador Workers y assets | COMPLETADO local | Express + node:http probado en workerd |
| Tests/regresiones y build Workers | COMPLETADO local | 89/89, check 32, dry-run correcto |
| Smoke/responsive local con datos reales de solo lectura | COMPLETADO | 66 navegaciones; filtros, reintento, quote; sin mutaciones |
| Documentación, variables, cambio de tráfico y rollback | COMPLETADO | docs/cloudflare_migration.md; DNS sin modificar |
| Commit/push/PR | COMPLETADO | f0d52d6, PR34 abierta; CI implementación SUCCESS; no merge |
| Deployment preview Cloudflare | PUBLICADO Y VALIDADO EN LECTURAS/CARRITO | dreams-perfumes; versión 4631190f, health 200, catálogo 46, detalle y persistencia |
| URL solicitada dreams-perfumes.pages.dev | PUBLICADO Y VALIDADO | Pages deployment ae2f7932, Service binding al Worker; health/catalogo/quote/carrito, 390/1440 verificados |
| Smoke remoto Auth/Admin/checkout | PARCIAL | Admin anónimo 403 probado; Auth/Admin autenticados y pagos pendientes de cuentas/proveedor seguros |
| Recuperación operativa de hosting | BLOQUEADO | Runbook documentado; Railway offline/REMOVED sin rollback, Workers sin recuperación ejecutada y comprobada; restauración con costo requiere aprobación y SUCCESS + smoke |
| Promoción de dominio/tráfico | PENDIENTE APROBACIÓN | Sólo después de preview validada y plan presentado |

Supabase se conserva. No migraciones destructivas ni cambios RLS/permisos por hosting. Railway se conserva; actualmente offline y por tanto no constituye un rollback operativo hasta restaurarlo/verificarlo.

Fuera de alcance actual: UI premium, motion PR32, /experiencia, nuevas funcionalidades, MFA/recovery UI, performance avanzada. Mantenerlos como deuda, sin mezclarlos con hosting.
