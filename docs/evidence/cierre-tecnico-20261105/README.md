# Cierre técnico 2025 — PR #61

Base: `main` en `3e12bc6`. Única oficial: https://dreams-perfumes.pages.dev/. Sin ZIP ni sitios o previews adicionales.

## Diferencia comprobada entre main y oficial

`/js/checkout.js` respondía con SHA-256 `d90d177679399ac9dfb05e0781f1bf9d52a27bb99bb506213f38e57be3681e0e`, idéntico al archivo de `ec04a35812d044e57196c6a1ca55232e723ff60c`. Pages `a176fa63` omitía ese script del overlay y lo reenviaba al backend inmutable `d5df723d`, fijado en ese commit. No era una caché desactualizada: faltaba empaquetarlo.

En main la misma responsabilidad estaba separada en `render_initial_coupon`, `load_checkout`, `checkout_payment_handler`, `install_checkout_fields` y `setup_checkout`; esta última pasa de 113 a 20 líneas. También se maneja por separado el fallo de lectura de configuración. El modo académico conserva su entrada temprana a `PresentationCheckout.setup`, las máscaras en `academic-inputs.js`, tickets/recibos firmados y precios/cupones del servidor. El modo comercial no se habilita.

La corrección incluye todos los scripts propios en el build de Pages y toma headers base del script de aplicación para recursos nuevos, sin depender de que existan en el backend legado. ETag identifica el cuerpo nuevo; la respuesta usa `no-cache`. Auth/API y autorización de Admin conservan su destino privado.

## Carrusel

En la sección existente «Más buscados»: productos reales distintos, Anterior/Siguiente, flechas e Inicio/Fin con el foco en el listado, desplazamiento táctil nativo, móvil/escritorio, sin autoplay y con movimiento reducido. Tarjetas, enlaces y Agregar al carrito se conservan. Portada estática intacta; «Tres formas de empezar» continúa eliminado.

[Prueba local de interfaz con API oficial](browser-local.json): 17 comprobaciones. No equivale al contraste de publicación. Capturas locales identificadas por sufijo `-local`; la evidencia oficial se incorpora después del deployment.

## SQL activo e historial

La consulta de `pg_get_functiondef` confirmó que la RPC antigua de 53 líneas seguía activa. Se creó mediante CLI una migración nueva: `20261105155756_modularize_account_cart.sql`. Tras versionarla y probarla, se aplicó con la conexión Supabase autorizada.

Auxiliares y entrada miden 5/31/32/32 líneas en fuente; PostgreSQL devuelve 10/35/36/36 incluyendo su encabezado normalizado. Todas son SECURITY INVOKER con search_path vacío, sin EXECUTE para PUBLIC, anon o authenticated; sólo service_role. El lock del carrito se conserva hasta terminar la transacción, que incluye auxiliares y registro idempotente. No se cambiaron tablas, RLS, datos, stock ni firmas HTTP.

[Pruebas PostgreSQL 17 aislado](sql-local.json): equivalencia con la definición anterior, reintentos, límites, merge/remove/consume, rollback ante errores, privilegios y 12 incrementos concurrentes sin pérdidas. Las cuatro pruebas pasaron. [Carrito remoto](carrito-remoto.json): 14 comprobaciones con cuentas registradas normalmente, login, escritura, relectura, UUID/scope ajeno rechazado e idempotencia. Cuentas QA retiradas después de logout.

El archivo histórico de 53 líneas queda inmutable y ahora está reemplazado. `supabase/rollback/20261105_account_cart_rpc.sql` permite restaurar únicamente la definición anterior, sin borrar auxiliares ni datos; no se ejecutó. El usuario informó el 05/11 que el profesor excluye migraciones históricas y rollback del límite. Se registra como aclaración comunicada, sin inventar una constancia docente.

## Admin real

[Primer intento](admin-intento-previo.json): alta por UI, edición por UI, imagen recuperada y nueva URL/precio persistidos, búsqueda por nombre/marca. La espera de disponibilidad baja leyó el estado transitorio de carga; se completó esperando su respuesta, sin cambiar Admin. [Casos restantes](admin-remoto.json): 19 comprobaciones reales, disponibilidad baja, destacado visible en Inicio, catálogo actualizado, registro customer normal y rechazo de GET/PUT Admin para customer y anónimo. Productos exclusivos QA retirados y sesiones cerradas. No se muestran contraseñas, cookies ni filas de clientes.

## Validación y publicación

Suite local: 497 casos, 493 aprobados y 4 omitidos si no se configura PostgreSQL. Los cuatro omitidos se ejecutaron aparte y aprobaron en `dreams-sql-qa`. Sintaxis, inventario Acorn, builds Pages/backend privado y diff revisados. No se despliega el backend privado existente, que sigue en `ef043065`/fuente `08635cd`.

Estado de esta revisión: publicación de frontend y contraste remoto pendientes. No declarar cierre del carrusel ni de los scripts servidos hasta incorporar esos resultados.

## Rollback

Deployment anterior de Pages: `a176fa63-c0c5-46aa-bb8c-c97d1eb85466`; compatible con el backend privado conservado y la nueva RPC (mismo contrato). Restaurar ese deployment sólo si las verificaciones fallan, sin tocar DNS, claves ni tablas. La recuperación SQL es independiente y no revierte datos. No ejecutar rollback por rutina.

## Observaciones de seguridad anteriores

Los advisors mantienen avisos previos sobre `is_dreams_admin` y protección de contraseñas filtradas desactivada, además de la tabla de operaciones con RLS y sin políticas de cliente (server-only intencional). No se modifican Auth ni esos permisos ajenos a la migración; las funciones nuevas no usan SECURITY DEFINER. No se afirma ausencia universal de riesgos.
