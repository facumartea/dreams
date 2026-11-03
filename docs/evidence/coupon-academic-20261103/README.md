# Cupón y formulario académico — 03/11/2026

Rama codex/cart-coupon-academic-inputs desde main5236ef6. Implementado cupón único mediante quote_cart/resolve_coupon en servidor, expiración/estado/mínimo/límites de usos aprobados (sin consumirlos). CondicionesJSON desconocidas se rechazan; límites por cuenta requieren sesión. Ticket firmado conserva descuento/cupón/importes; payment revalida antes de recibo, referencia incorpora snapshot del cupón sin datos financieros.

Titular vacío/placeholder, máscaras con cursor y beforeinput, número16dígitos, MM/AA mes01–12 y CVV3dígitos, todos locales. Nombre admite caracteres Unicode y puntuación sin máscara. Ningún campo financiero en peticiones/storage/ticket/recibo. Envío etiqueta única y costo0. Prevención doble envío conservada.

487testsPASS, sintaxis103archivos; inventario40líneas sin violaciones, buildsPages/oficialPASS. Chromium local390/1440 cupón→checkout→confirmación180/180/180 y envío0, datos ficticios ausentes de red/storage. Capturas cart/form en esta carpeta son LOCALES. Falta publicación, smoke oficial y evidencia final.

Rollback conservado: Pagesb169918f y backend29b843a0; se hereda únicamente SUPABASE_SECRET_KEY, sin nueva configuración Auth/Admin/DB. No otras webs/previews ni cupones comerciales modificados.
