# DREAMS — plan vigente

2026-10-07. Destino actualizado por el usuario: Cloudflare Workers. Sin porcentajes especulativos. Plan histórico preservado en `docs/history/PLAN_PR33.md`.

## Alcance vigente: carrito y navegación

- Corregir carreras, estados de cotización, WhatsApp inválido y subtotal/envío: PUBLICADO EN PREVIEW AISLADA b75ce0d.
- Verificar menús/filtros y carrito en desktop/móvil: COMPLETADO también remotamente en preview cart-checkout-review (390/1440); 98 tests previos + CI del deployment y dos runtime tests.
- Checkout comercial: BLOQUEADO CONFIGURACIÓN, no habilitado. Proveedor implementado; faltan secretos MP y QA comercial aislada.
- Carrusel: PENDIENTE MATERIAL. Hero fijo; falta un segundo banner distinto.
- Preview aislada: PUBLICADA Y VERIFICADA. Secret configurado por usuario; origen propio exacto, deployment 1537279f. Deployment vigente intacto.
- PR35: ABIERTA, dependiente de #34, base codex/cloudflare-hosting-migration. b75ce0d push + CI SUCCESS; sin PR32 ni merge.
- Observabilidad/readiness: primera health 503 y posteriores 200; causa pendiente, tail específico sin eventos.

## Plan de hosting anterior (conservado como contexto)

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
