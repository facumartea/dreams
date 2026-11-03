# Cupón y formulario académico — 03/11/2026

Rama codex/cart-coupon-academic-inputs desde main5236ef6. Implementado cupón único mediante quote_cart/resolve_coupon en servidor, expiración/estado/mínimo/límites de usos aprobados (sin consumirlos). CondicionesJSON desconocidas se rechazan; límites por cuenta requieren sesión. Ticket firmado conserva descuento/cupón/importes; payment revalida antes de recibo, referencia incorpora snapshot del cupón sin datos financieros.

Titular vacío/placeholder, máscaras con cursor y beforeinput, número16dígitos, MM/AA mes01–12 y CVV3dígitos, todos locales. Nombre admite caracteres Unicode y puntuación sin máscara. Ningún campo financiero en peticiones/storage/ticket/recibo. Envío etiqueta única y costo0. Prevención doble envío conservada.

487testsPASS, sintaxis103archivos; inventario40líneas sin violaciones, buildsPages/oficialPASS. Chromium local390/1440 cupón→checkout→confirmación180/180/180 y envío0, datos ficticios ausentes de red/storage. Capturas cart/form en esta carpeta son LOCALES. Falta publicación, smoke oficial y evidencia final.

Rollback conservado: Pagesb169918f y backend29b843a0; se hereda únicamente SUPABASE_SECRET_KEY, sin nueva configuración Auth/Admin/DB. No otras webs/previews ni cupones comerciales modificados.

SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.

# DREAMS — reparación funcional terminada

SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.

Oficial única: https://dreams-perfumes.pages.dev/. Pages b169918f-ce14-4588-a006-6099afba06aa, frontend e544c6ca8f00927cbe2c92f8c7fa225fff18e4d9. Backend privado dreams-official-backend, Production/default: versión29b843a0-d04e-4631-8d52-627d5f598654, deployment31aef453-abc3-44ff-8dc1-659e84553dd3, fuentee86f4343851d9810623996d2b7d13504163340c0. Cabecera de versión exacta y health/DB200. No repetir configuración de Auth, Secret, Admin ni pruebas acreditadas.

Causas comprobadas: Secret histórico malformado (reemplazado por usuario; lecturas directa/SDK200 en proyecto esperado); guardado403 porque proxy oficial enviaba Admin al backend legado protegido de preview; stock:null coercionado a0. Corregido enrutamiento específico con roles/origen y validación de tipos antes de convertir. Sin fallback ni reparación de clave eliminando caracteres.

QA final: nueve fases privadas en11477c4f/0368f65 PASS,281 assertions/0fallos; Chromium oficial89casos distintos PASS,92registros conservados. Admin final limpio: alta, edición/imagen/persistencia, borrado y logout PASS; cliente login/recarga/logout PASS. Registro sin confirmación, renovación, carrito aislado, opiniones propias/moderación y checkout académico comprobados. Sin pagos comerciales, mensajes enviados, stock/pedidos comerciales cambiados ni credenciales/roles Admin modificados.

Limpieza completada: entrypoint productivo sin mecanismo QA, Cron vacío, DREAMS_QA_ADMIN_PASSWORD ausente, sólo SUPABASE_SECRET_KEY presente. KV temporal2440c640ebd6493d83b39dddba3cbdb2 eliminado. SesiónAdminQA y clientes cerrados;0productos/cupones/opiniones QA,0sesionescustomerQA. Cuentas de prueba retenidas como customer. Navegador/proceso efímero cerrados; depurador loopback retirado. No solicitar intervención por esos recursos.

Checks:476testsPASS,CI224SUCCESS para e86f434; sintaxis101archivos; inventario115archivos/2111registros/0>40. Extracción de e86f434 sin.git ni secretos: instalación, checks,476tests, builds oficial/Pages PASS; sin ZIP final. Documentación y evidencia en docs/entrega-2026 y docs/evidence/admin-audit-20261102. Mantener historial de fallos, no repetirlos como estado vigente.

Rollback: Pages b169918f y backend probado con misma clave/firma; a3184576 queda sólo emergencia legacy, sin prometer compatibilidad con tickets nuevos. No pérdida/migración de datos. Publicación funcional terminada. Entrega consolidada en PR56 dirigida a main; consultar su ficha de GitHub para el commit exacto de integración, que se realiza sólo con checks aprobados. El usuario autorizó integración y pidió no generar ZIP final. Supabase aceptado por profesor según usuario; Martearena/Ruas confirmados. Participación, preentregas, licencias no acreditadas y defensa individual siguen documentadas sin inventar evidencia ni nota.
