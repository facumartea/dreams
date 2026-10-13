# Buscador y revisión de imágenes del Admin

2026-10-13, America/Buenos_Aires. Rama `codex/admin-product-search`
desde PR44/b33a2ee; dependencias PR42/41/39/38/37/34 conservadas.
Oficial verificada por API: Pagesac755bbe/c83b148, backendd5df723d/ec04a35.
Sin PR45/persistencia de carrito ni PR40/video; ninguna PR fusionada.

## Listado y búsqueda

GET /api/admin/products usa autorización Admin servidor y cliente JWT con
RLS, SELECT completo ordenado por ID descendente. Sin paginación ni filtros
existentes de productos; catálogo real46, por debajo del límite de filas de
Data API. El buscador filtra toda la respuesta en memoria, sólo name/brand
(HTTP brand corresponde a products.marca real). NFD/sin diacríticos,
minúsculas y trim exterior; coincidencia parcial por uno u otro campo,
no concatenación de campos ni expresión regular. Vacío restaura orden.
Etiqueta/placeholder exacto, Limpiar búsqueda con foco, contador, carga/error/
reintento/no resultados y aria-live/aria-busy. No solicitudes por pulsación:
no debounce de búsqueda remota necesario. Reloads con ID monótono impiden
que respuesta obsoleta reemplace datos nuevos; consulta actual siempre aplicada.

## Recorrido de imágenes y correcciones

Formulario rellena image_url; PUT/POST envían datos del producto; servidor
valida y hace trim antes de guardar mediante JWT/RLS. Catálogo/detalle leen
la misma columna y muestran URL HTTPS/local, con respaldo y texto de error
cuando no carga. No SDK/upload a Storage en este árbol. Enlaces de Storage
externos son sólo URL, no existe gestión de archivos/permisos de bucket.

Fallos corregidos:
- Al cambiar URL, estado válido anterior seguía250ms durante debounce.
  Se invalida inmediatamente, guardado exige URL exacta comprobada y
  callbacks/timers obsoletos no validan ni cancelan comprobación nueva.
- Timeout invalidaba imagen pero respuesta tardía podía cambiar el estado:
  token invalidado al fallar/vencer, reintento explícito de la misma URL.
- with_pending habilitaba Guardar tras reset exitoso a imagen vacía:
  restaura botón según estado actual del formulario de producto.
- Campos ausentes ya no introducen cadena literal undefined al editar.

Helper compartido entre navegador/servidor para sintaxis; HTTPS o ruta local,
sin credenciales embebidas, controles/backslash ni protocol-relative. Mantiene
error servidor existente/contrato. No exige extensión .jpg/.png: navegador
carga GET real del elemento img, no HEAD ni fetch de URL desde servidor.
Páginas compartidas (ej. Google/Drive/Dropbox) que no son bytes de imagen
fallan en vista previa con mensaje claro; sólo rutas Google de resultados
ya conocidas se rechazan por sintaxis. No prometer que cualquier HTTPS sea
imagen real; backend sólo valida sintaxis, no hace SSRF ni determina bytes.
Validación del navegador no sustituye autenticación/autorización servidor.

Mensajes para vacío, HTTP bloqueado, enlace/página/vencido/bloqueo, timeout;
Reintentar imagen. Señales conocidas Supabase sign/token, AWS/GCP, CloudFront
o Azure advierten de caducidad sin cambiar URL ni rechazar por extensión.
Heurística, no garantía de permanencia ni prueba de permisos de Storage.
Fallos conservan campos/URL escrita; sin guardado inválido ni reemplazo masivo.
Editar otros campos conserva image_url. Imágenes existentes rotas deben
corregirse por producto autorizado: no habilitar guardado ignorando el error.

## Otras áreas revisadas y límites

Productos/guardar/editar/reset/preview, navegación de seis módulos,
Cupones/formulario/estado ocupado/errores, Opiniones/edición/eliminación,
Pedidos sólo lectura, Usuarios/roles, Consultas, logout y controles servidor
revisados en código. No otras funciones eliminadas ni permisos ampliados.
Usuarios muestra correo No disponible porque endpoint no expone Auth emails;
no se rellenó con datos inventados. Otros módulos conservan recuperación vía
sus tabs/toast; retry uniforme en otros módulos y control de revisión de producto entre
dos administradores son mejoras mayores pendientes, no afirmar implementadas.
No se prueban escrituras de cupones/pedidos/usuarios reales ni stock.

Oficial/preview existentes PREVIEW_READ_ONLY=true bloquean escrituras
comerciales incluso para Admin, intencional; no cambiar este flag en la tarea.
Auth requiere profile.role=admin de UUID getUser/refresh, no user_metadata.
Middleware/rutas Admin/RLS intactos. Nueva validación URL no llama red/HEAD.

## Evidencia ejecutada

- 139 tests Node (15 nuevas regresiones respecto base124), check51 JS,
  audit producción sin vulnerabilidades conocidas, builds Workers/Pages.
- Chromium local390/1440 con sesión **fixture** verificada por servidor:
  nombre/marca parcial/tildes/case/espacios/vacío/limpiar/sin resultados,
  marca ausente, filtro dentro de31productos sin consulta por pulsación,
  orden/edit/reset/delete cancelado, carga/error/retry, customer403,
  sin pageerrors/overflow ni escrituras en el recorrido del buscador.
- Imágenes local390/1440: vacío/malformado/HTTP/HTML compartido/404/lento,
  timeout/late success/retry, extensionless/espacios/signed warning,
  PUT únicamente producto fixture9 (dos por tamaño), conservación de URL
  al cambiar precio, reload/API/listado catálogo/detalle e imágenes cargadas,
  formulario limpio mantiene Guardar deshabilitado. Sin HEAD ni errores JS.
- Primer harness de catálogo carecía de implementación or() en DB fixture:
  corregido sólo harness; no cambio del catálogo real para esa espera.
- Local fixtures NO son sesiones ni escrituras en Supabase real.
  Capturas /workspace/dreams-admin-search-evidence/local-*.png.

Auditoría real sólo lectura:46URLs sintácticamente válidas, ninguna HTTP,
con espacios exteriores o firma reconocida. Chromium recorrió todos los
cards oficiales:41imágenes originales cargadas,5fallbacks IDs21/205/198/197/16,
0pendientes en la muestra. No se estableció causa exacta de proveedor, no se
reemplazaron/borraron enlaces. No afirmar disponibilidad futura permanente.

## Publicación y gate

Se publicará preview Workers aislada `admin-search-review`; no Pages ni
reemplazo de previews actuales. API/header/HTML Admin siguen protegidos.
Configuración Supabase/Secrets existentes sólo servidor; no obtener ni
mostrar valores. Si precisa firma académica, generar independiente sólo en
nuevo entorno por stdin seguro, sin rotar credenciales existentes.

NO publicar oficial hasta CI y verificación autenticada remota exitosa.
No hay sesión Admin ni credenciales en gestor de este entorno (status92,
secrets/runtime_variables vacíos); herramientas disponibles no conectan
sesión del navegador del usuario ni ofrecen Auth Admin. No login adivinado,
reset, usuarios creados ni permisos cambiados para eludir el gate.
Se requiere sesión legítima Admin en preview mediante mecanismo seguro.

Rollback oficial disponible: ac755bbe-f339-422a-91ef-006426abf0bf/backendd5df723d,
conservar deployment y URL; si se promueve después de QA, Pages debe fijar
nuevo backend aprobado (Admin viene del backend, no del overlay público).
POST rollback Pages devuelve versión anterior, sin borrar datos/deployments.
No rollback ejecutado por esta tarea, oficial intacta.

CI/preview y verificaciones remotas se completan en checkpoint final.
Progreso global no recalculado; pendientes Auth/Storage real/escrituras reales
no acreditados. Sin datos, credenciales, roles, esquema, DNS o tráfico alterados.

Revisión final de guardado: formulario de producto bloqueado mientras PUT/POST
está pendiente, Editar/Limpiar no cambian el producto en curso y un onload no
habilita un segundo envío. Se restauran controles al terminar; reset interno
conserva botón deshabilitado para formulario vacío. Regresión de submit repetido
y QA local390/1440 con PUT demorado/doble submit sintético pasaron, dos PUTs
únicamente fixture9 por tamaño, ninguna petición extra por doble submit.
139tests/check51/builds verdes. Se flexibilizó sólo firma de una prueba legacy
de reset para aceptar guard interno, conservando verificaciones de ID/formulario.
El servidor actual usa PUT completo sin revisión optimista; escrituras de dos
Admins pueden sobrescribirse según último guardado. Es deuda preexistente mayor,
no alterar esquema ni habilitar escrituras comerciales para eludirla.
