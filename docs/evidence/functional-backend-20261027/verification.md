# Recuperación funcional — 2026-10-27

- Entorno nuevo ejecuta comandos. Checkout original work/4655b0c limpio; continuidad ausente allí, recuperada de PR56/a6e97d0 antes de reconstruir.
- Rama codex/admin-cards-audit; composición selectiva c428daff→0dbfbbaf de PR55, sin merge; no existe worktree anterior. Admin/stock/WhatsApp/lockfile oficiales conservados.
- Suite completa reconstruida: 346/346 PASS (Node24, fixtures). Política/binding nuevos:19 incluidos en346, no sumarlos de nuevo.
- Sintaxis:81 JS/MJS PASS. Audit de producción: sin vulnerabilidades conocidas. Bundle privado dry-run y Pages PASS.
- Chromium local:48 navegaciones, ocho páginas en390/430/768/1024/1440/1920, cero pageerrors/overflow en esa cobertura. Datos fixtures, no acredita autenticación remota.
- Bundle privado ejecutado en workerd local:8 comprobaciones (products/config/cartconfig/Admin/registro inválido/Admin write/pagos/webhook), PASS; Supabase simulado por outboundService, ninguna credencial real. Binario local admite compatibilidad máxima2026-10-08; publicación configurada2026-10-27 requiere smoke remoto.
- Corregidos descarte de cuerpo académico grande sin esperar cancelación de tee y referencia global de reviews en páginas que no cargan el módulo.
- Lectura DB previa:46productos/0orders/0reviews/2inquiries/10users. Stock digest7a58615dd40e0dcfd898a52aa108b820. Admin original conserva roladmin. RLS activo en products/profiles/reviews/account_carts; RPC dreams_cart_operation existente. No DDL, seeds, Auth config ni credenciales modificados.
- Cloudflare reconfirmó Pages canónicoa3184576 y privado workers.dev/previews=false; sólo DREAMS en binding Pages antes del despliegue nuevo. Rollbacka3184576 conservado.
- Pendiente: CI exacto, subir privado heredando Secret del mismo Worker, binding Pages y publicación autorizada oficial, QA remota Auth/cartA-B/reviews/compatibilidad. Admin real sin sesión acreditada; no usar variable de nueva contraseña para cambiar credenciales ni asumir que es la actual.

## Publicación y rollback reales

CI203/40543798417 (d8fec8f) y CI204/40544184279 (232d2dd) SUCCESS. Worker privado2ef6be90-b8d8-4e03-8bc4-58b36718e6f1, deployment43a8bd54-658a-4240-9327-66e4885c6f78 activo100%; Secret heredado del mismo Worker939c179c sin leer valor. Pages producción1e881ec8-7c32-4a2e-9857-ef63bf091c4f SUCCESS/plataforma, pero smoke de aplicación FAIL (health503/catalog500/reviews500). No confundir despliegue aceptado con aplicación sana.

Logs del proveedor:401 UNAUTHORIZED_INVALID_API_KEY, bad_length en apikey/authorization. Ningún valor/prefijo de clave consultado. Se restauró canónicoa3184576, confirmado por API y HTTPhealth200/catálogo200/46/config200. deployment_ready=false. No se pidió ni cambió configuración de secretos/Auth. Backend privado conserva versión fallida para diagnóstico, sin URL pública.

Pruebas remotas cliente/Admin, carrito porUUID y opiniones propias: BLOQUEADAS; harness abortó antes de signup. DB final idéntica a inicial, incluido digeststock/10usuarios y rolAdmin. Generalización de acceso físico/Safari/medicionesCWV/accesibilidad completa:NO VERIFICADOS.

Restauración visual: portada oficial390/1440, HTTP200, cero pageerrors/overflow; capturas restored-390.png/restored-1440.png. Chromium directo no confía en CA del proxy del entorno; se transportaron recursos reales mediante Node fetch con CA/TLS verificados y route.fulfill, sin deshabilitar validaciónTLS. Esto verifica renderizado del contenido oficial por ese transporte, no la confianza de certificados del navegador directo.
