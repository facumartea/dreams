# Checkout académico directo

## Alcance y aislamiento

Cambio sólo para la preview academic-review, branch codex/academic-checkout-direct desde PR40/d3ef4e6 (dependencias39/38/37/34), sin merges ni trabajo de navegación/footer oficial PR42. No cambia credenciales/Auth/roles, flags, DNS ni Pages. Backend comercial/SDK Mercado Pago y checkout demo persistente independientes conservan validaciones/escenarios/pruebas.

La presentación no inserta orders, no modifica stock, no llama pasarela y no registra un pago comercial aprobado. PREVIEW_READ_ONLY sigue vigente. Sólo lee productos/cotiza; la confirmación usa snapshots firmados, estado interno completed y simulated=true.

## Contrato

academic_summary(subtotal) centraliza shipping=0, shipping_label="Envío gratis" y total=subtotal. Se usa en quote académico, ticket y resultado; los tres resúmenes y WhatsApp consumen ese contrato. Cupones académicos no se aplican. La variante comercial mantiene envío anterior y descuentos.

Se conserva nombre del comprador como validación de DOM; no existían campos de entrega adicionales. Número/marca/vencimiento/CVV no se leen ni validan en la rama académica; no se transmiten ni persisten. No listeners de máscaras/escenarios/copiar tarjetas en esta rama; panel/instrucciones se retiran del DOM visible y título Tarjeta. La pasarela independiente mantiene su propia validación.

Cliente genera crypto.randomUUID una vez y persiste intent_id/snapshot ANTES de la primera petición. Reintento tras respuesta de sesión perdida reutiliza intent_id; tras respuesta de procesamiento perdida reutiliza ticket. Botón ocupado bloquea doble envío. Sólo se admiten items/intent_id, ticket o receipt en endpoints; campos inesperados, tarjetas/precios/total cliente y escenarios anteriores se rechazan.

Referencia DREAMS- seguida del UUID completo sin guiones:122bits aleatorios, sin Math.random ni truncación. HMAC/cookie vinculan snapshot a sesión; replay de ticket mantiene recibo/estado/referencia. sessionStorage guarda sólo intent/snapshot/ticket/receipt/referencia completada, no campos financieros/nombre. Confirmación consulta recibo firmado y conserva referencia al recargar durante su vigencia20min y la sesión/cookie; no es persistencia indefinida ni historial comercial. Si storage no permite conservar referencia, no finaliza ciegamente. Clear de carrito sólo tras confirmar y si el snapshot corresponde, una sola vez por referencia.

Payload/derivación HMAC v2 rechazan antiguos tickets/recibos v1 de escenarios. No se rota secreto; artefactos académicos temporales anteriores deben reiniciar el recorrido. Datos comerciales y carrito quedan conservados. Carrito vacío, cantidades/stock inválidos, cotización no finita/no positiva y cambios de carrito durante solicitudes no finalizan.

## Evidencia local

125/125 tests, check47JS, builds Workers dry-run y Pages correctos. Pruebas de escenarios académicos actualizadas a completed/replay/alteración/cookie incorrecta y cero writes; escenarios demo comercial y firmas/validaciones MP permanecen cubiertos. Cliente VM falla si se lee un campo financiero; cubre respuesta perdida, UUID estable, doble clic, comprador vacío/carrito cambiado.

QA Chromium390/1440 con productos explícitos de fixture aislado (no catálogo real sustituido): envío/total/Tarjeta, ausencia panel/textos, campos financieros no válidos aceptados, doble clic, pérdida de primera sesión y de respuesta después de procesar, replay estable y reload, carrito/contador/cantidades/filtros/menú y bloqueo empty/ID inválido. Canarios no presentes en red/storage/consola; dos errores de red INYECTADOS por contexto de prueba. Capturas /workspace/dreams-direct-evidence/local-*.png; log /tmp/dreams-direct-local-qa.log. Sin proveedor/DB real en pruebas locales.

Sin analítica/session replay encontrada en ruta/frontend; requests contienen sólo contratos permitidos. Worker logs redactan query y registran método/ruta/tipo/status sin bodies/headers. La inspección de código no equivale a observación exhaustiva de logs de todas invocaciones: verificar runtime remoto después de publicar. Sin medición CWV/Safari/físico/Auth Admin autenticado por esta tarea.

## Publicación y recuperación pendientes

Preview previa af79434d-5333-414d-b2c0-9a7c96c9a11b, fuente8d1b4cd. Oficial c658e4da/c3cea8c, backend40e7b0a3/b049934 y Workerf73d5087 conservados. Baseline de seis archivos públicos oficiales capturada por navegador (/tmp/dreams-direct-official-baseline.json); urllib dio403 del acceso local y se usó Chromium, sin atribuirlo a caída de DREAMS. DB por SELECT:0orders/46products/stock fingerprint7a58615dd40e0dcfd898a52aa108b820. Verificación posterior/publicación/CI/referencia remota pendientes de checkpoint.

Usar exclusivamente `wrangler preview --env preview --name academic-review --tag COMMIT --message ...` (Wrangler4.147.0/help verificado). No `wrangler deploy` real, no Pages. Mantener Secrets/configuración de base existentes. CLI autenticado con permisos Worker scriptwrite; scopes adicionales no necesarios no se pidieron. Dry-run advierte APP_ORIGINS/APP_BASE_URL no heredados del nivel superior; preview los declara explícitamente en env.preview.previews.vars.

Recuperación: republicar el código8d1b4cd en academic-review con bindings/Secret existentes, nunca borrar previews ni alterar producción. Recuperación de este tipo requiere reconstrucción del commit anterior; artefacto anterior existe, no se ejercitó rollback. Confirmar preview/health/carrito y Pages hashes tras recuperarlo. Ejecución/resultado de publicación se añadirán después de QA remota.
