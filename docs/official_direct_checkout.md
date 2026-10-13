# Promoción aislada de checkout académico a Pages

2026-10-13. Rama `codex/official-direct-checkout`, dependiente de PR42
(`codex/official-navigation-footer`), selección de checkout PR43/d938a97.
No merge de PR43/PR40: el video y sus assets no forman parte del cambio.
Inicio, CSS de hero, menús, filtros, footer/contactos y login permanecen
como la oficial c658e4da/c3cea8c. Sólo se añaden estilos de confirmación.

Publicar el frontend solo sería incompatible con el backend académico v1:
Pages debe fijar un nuevo deployment inmutable de Workers con contrato v2.
Se usan los Secrets existentes únicamente servidor, sin rotarlos/extraerlos.
`PREVIEW_READ_ONLY=true`, `CHECKOUT_SCHEMA_READY=false` y
`PRESENTATION_CHECKOUT_ENABLED=true`; sin pedidos/stock/pasarela comercial.

Cambios: envío gratis/costo0/total=subtotal; Tarjeta sin panel/escenarios
financieros ni lectura de número/vencimiento/CVV; referencia criptográfica
persistida antes del primer envío, replay estable y recibo firmado20min.
Los contratos temporales v1 requieren reiniciar el recorrido, preservando carrito.

Checks locales: 124 tests, check47, audit sin vulnerabilidades, build Workers.
Build Pages también ejecutado; apuntaba inicialmente al backend anterior,
por lo que se reconstruirá tras fijar el nuevo backend.

Rollback oficial recuperable: deployment c658e4da-c854-4b74-ade9-78b5822bffab,
backend40e7b0a3 conservado. Usar POST Pages deployments/{id}/rollback;
no borrar deployments ni cambiar DNS. Verificar home estática, health,
catálogo y cotización. Rollback no ejecutado preventivamente.

Carrito por cuenta separado en rama `codex/account-cart-official`:
NO publicar esa funcionalidad sin QA autenticada remota de dos cuentas.
No hay acceso Auth Admin/clave servidor en este WORK. No crear identidades
verificadas ficticias, habilitar anonymous Auth ni cambiar credenciales para
eludir el bloqueo. La migración aditiva está versionada en esa rama;
pruebas de SQL con rollback no equivalen a login remoto.

Admin auditado por SELECT: admin@dreamsperfumes.com, UUID
 a88d8d4e-ada3-4bfa-a6f5-db39d2dc9c19, perfil admin, sin correo pendiente.
Acceso /cuenta.html → /admin. Contraseña no accesible/verificada en gestor;
no se modificaron correo, contraseña, roles ni sesiones.

Deployment/CI y verificaciones remotas se registrarán al completar promoción.

Backend estático publicado: ec04a35812d044e57196c6a1ca55232e723ff60c,
9ebd8175-1723-4b49-8797-84f6f6b5a386. CI38342951788 SUCCESS.
Secrets heredados, flag carrito por cuenta desactivado. Rollback c658e4da
raíz200/health200 verificados antes de promoción. No rollback ejecutado.

Primera QA candidata falló: /api/checkout/config devolvía enabled:false;
faltaba PRESENTATION_SIGNING_KEY propio del entorno nuevo (Supabase Secret sí
heredado). Generada clave interna independiente por stdin seguro, sin valores
en archivos/argumentos/logs. No rotación de Secrets existentes ni Auth.
Nuevo deployment d5df723d-e1f1-4889-ae5b-e79ebfd131cd, misma app ec04a35.
Pages se fija a esta versión; recorrido remoto debe pasar antes de promover.
