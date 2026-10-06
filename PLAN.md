# DREAMS — plan vigente

2026-10-06. Destino actualizado por el usuario: Cloudflare Workers. Sin porcentajes especulativos. Plan histórico preservado en `docs/history/PLAN_PR33.md`.

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
| Smoke remoto Auth/Admin/checkout | PARCIAL | Admin anónimo 403 probado; Auth/Admin autenticados y pagos pendientes de cuentas/proveedor seguros |
| Recuperación operativa de hosting | BLOQUEADO | Runbook documentado; Railway offline/REMOVED sin rollback, Workers sin recuperación ejecutada y comprobada; restauración con costo requiere aprobación y SUCCESS + smoke |
| Promoción de dominio/tráfico | PENDIENTE APROBACIÓN | Sólo después de preview validada y plan presentado |

Supabase se conserva. No migraciones destructivas ni cambios RLS/permisos por hosting. Railway se conserva; actualmente offline y por tanto no constituye un rollback operativo hasta restaurarlo/verificarlo.

Fuera de alcance actual: UI premium, motion PR32, /experiencia, nuevas funcionalidades, MFA/recovery UI, performance avanzada. Mantenerlos como deuda, sin mezclarlos con hosting.
