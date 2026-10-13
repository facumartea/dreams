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

## Publicación y QA remota completadas

URL: https://academic-review-dreams-perfumes.dreams-perfumes.workers.dev/. Fuente d938a97c6c0006411f3404d68b5fb297a36e52c1, deployment7c3cd341-0ce1-4045-a6ec-9b5d5bdad9c9/tagd938a97 confirmado por API. PR43 abierta, CI fuente SUCCESS https://github.com/facumartea/dreams/actions/runs/38339523102 (125tests/check47/audit/builds). Instalación frozen offline propia de la nueva worktree correcta, sin symlink en publicación; árbol limpio. Checkpoint posterior sólo documental, sin nueva publicación.

QA remota Chromium390×900/1440×900 completada, con catálogo real46 productos y datos financieros EXCLUSIVAMENTE ficticios/no válidos: título Tarjeta/panel ausente, envío0/total=subtotal en carrito/checkout/confirmación, resumen WhatsApp gratuito (sin mensajes), productos en confirmación, doble clic, primer intento sin respuesta, segundo intento con respuesta descartada después del procesamiento real, tercero reusando el mismo ticket/referencia. UUID inicial y referencia idénticos en reintento/reload; campos vacíos/inválidos de tarjeta no determinan resultado. Comprador vacío y carrito vacío/ID inválido bloqueados. Menús, búsqueda vacía/reset, marca, cantidades/contador/persistencia y carrito vaciado tras confirmar pasaron. Sin pageerrors/overflow en tamaños probados. Canarios de número/vencimiento/CVV/nombre no en requests a ningún host, browser storage ni consola; bodies sesión exclusivamente items/intent_id. No datos reales de tarjeta solicitados/empleados.

Referencia móvil real de prueba: DREAMS-1A6BBE145B894787941B2225CC3140CF; escritorio DREAMS-F862975DBCC44D41912CEF5E04C03E38. Capturas /workspace/dreams-direct-evidence/remote-{390,1440}-{cart,checkout,result}.png, log /tmp/dreams-direct-remote-qa.log. Primer harness remoto falló porque route.fetch no usó proxy del navegador (ENETUNREACH); reemplazado por descartado de respuesta mediante fetch del propio navegador. No cambio adicional de aplicación. Dos fallos de transporte por recorrido inyectados conscientemente, no atribuibles a deployment/proveedor.

SELECT posterior confirma0orders/46products/fingerprintstock7a58615dd40e0dcfd898a52aa108b820 igual a baseline. API confirma oficialc658e4da/c3cea8c, Worker principalf73d5087 al100%; seis archivos oficiales mantienen hashes, log /tmp/dreams-direct-official-compare.log. Sin publicar Pages, modificar DNS/credenciales/roles/Secret/flags ni datos comerciales.

Consulta Telemetry últimos15min filtrada por service dreams-perfumes devolvió0eventos, sin canarios observados. Invocation logs desactivados: cobertura limitada, no prueba exhaustiva de todas las invocaciones. Código no registra bodies/fields y sólo recibe contratos mínimos. Safari/dispositivo físico/AuthAdmin/CWV no verificados; ausencia de pedido comercial y stock íntegro sí comprobadas por lecturas y cobertura aislada de cero writes.

Estado de este alcance: implementado, probado local/CI y verificado en preview. Oficial intacta. Rollback preview por republicación8d1b4cd sigue disponible según procedimiento anterior, no ejercitado porque no hay regresión material observada. Próximo: revisión de preview desde celular del usuario; no publicar oficial ni hacer merge sin otro pedido.
