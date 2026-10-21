# Auditoría y mejoras del Admin — 2026-10-21

Rama `codex/admin-cards-audit`, base PR53/c428daf; se seleccionaron y adaptaron los módulos de búsqueda/imágenes de PR46/3365e57, sin merge. Independiente de PR55: no incluye sus cambios de Auth/carrito/opiniones ni video. No cambia configuración Supabase, roles, datos ni DNS.

## Hallazgos y correcciones

- Oficial verificada: Pages f44a6069, fuente461c17d; backend inmutable d5df723d/ec04a35. `/api/config` confirma `preview_read_only=true`: el aviso de escrituras es una protección real vigente. Cambiarla habilitaría mutaciones contra datos reales. Se conserva hasta QA autenticada.
- Encabezado usa el isologo original transparente sin ISOTIPO; se retira la explicación técnica. Asset limpio disponible56×79 RGBA: presentación80×113 escritorio/64×90 móvil, fiel pero limitado en pantallas densas. Falta original SVG o PNG transparente de al menos160×226; no se regeneró la marca ni se inventó resolución.
- Siete tarjetas accesibles reemplazan navegación duplicada: Productos, Usuarios, Consultas, Opiniones, Pedidos, Disponibilidad baja y Cupones. Conteos reales, estado activo textual/aria, foco, recuperación por módulo y de conteos, sin perder navegación ante errores. Respuestas viejas no cambian módulo/foco.
- Buscador existente reutilizado: nombre/marca solamente, parcial, sin tildes/case/espacios exteriores; Buscar/Enter/Limpiar, catálogo completo sin paginación. Conserva búsqueda al editar y combina disponibilidad baja.
- Stock0/1/2 se diferencia; valores inválidos no se convierten en cero, ni en API Admin. Contrato público conservado.
- Formulario protege cambios sin guardar, mantiene imagen al editar otros campos, captura payload y bloquea doble envío. Imagen se valida por sintaxis y carga en navegador; HTTPS sin extensión admitido, HTTP/credenciales/páginas compartidas conocidas rechazadas, advertencia de enlace firmado; timeout/error/reintento y protección de respuestas antiguas. No HEAD ni descarga servidor/SSRF; no existe carga Storage implementada.
- Editar/Eliminar comparten `.admin-product-action`: ambos104×44px, texto centrado y padding igual, foco accesible; Eliminar conserva estilo destructivo y confirmación. Cancelar no envía DELETE, comprobado en móvil y escritorio.
- Cupones conserva sus operaciones y actualiza conteo después de éxito. Otros módulos mantienen acciones existentes y tienen recuperación de carga.

## Evidencia y límites

[Todos los casos y resultados](evidence/admin-audit/matrix.md): mínimo20 casos distintos por área modificada A–F, datos/entornos/resultados. Suite completa279 PASS; sintaxis61 archivos, builds Workers/Pages/candidato Admin PASS. Las dos últimas mejoras (botones y recuperación de conteos) se verificaron adicionalmente en Chromium sin repetir QA ajena. CI del commit se informa en la PR.

Capturas locales: [encabezado escritorio](evidence/admin-audit/desktop-header.png), [móvil](evidence/admin-audit/mobile-header.png), [tarjetas](evidence/admin-audit/desktop-cards.png), [búsqueda/stock](evidence/admin-audit/mobile-low-stock-search.png), [botones](evidence/admin-audit/mobile-equal-product-actions.png). Chromium responsive/táctil/teclado y movimiento reducido; no Safari/iPhone físico ni CWV de campo.

No hay credenciales reales de QA Admin disponibles. Persistencia, permisos positivos y visualización de imágenes después de una escritura real siguen BLOQUEADOS; fixtures no los acreditan. No se publica esta capacidad en la oficial. Worker de revisión sólo admite GET enumerados y login/logout; todas las escrituras Admin/comerciales responden403 antes de tocar DB. HTML Admin sólo se superpone tras autorización200, nunca sobre401/403/503.

Deuda: alta de producto sin idempotencia durable ante respuesta perdida (se informa revisar listado antes de repetir); edición concurrente entre dispositivos sin control de versión; otros módulos no tienen protección completa por recurso contra respuestas atrasadas aunque sí se protege selección/foco; consultas/pedidos limitados a100 sin paginación; perfiles no aportan correo a esa vista. No se amplió el esquema ni se inventaron campos. Revisar estos puntos en una tarea acotada antes de activar escrituras generales.

## Auth y continuidad

PR55 y su preview customer-data-review preservadas. Entorno actual no dispone de SUPABASE_ACCESS_TOKEN ni mecanismo seguro de entrada/reconexión de secretos. El conector SQL no permite Auth Management. Se requiere iniciar una ejecución vinculada al entorno actualizado con el binding seguro; no copiar el token al chat ni usar auto-confirmación administrativa. Registro sin confirmación, sesiones reales y aislamiento A/B siguen pendientes. TRUNCATE anon/authenticated se comprobó retirado, sin repetir la revocación.

## Publicación y rollback

Candidato aislado `admin-cards-review`, sin promover producción. Principal backend conserva d5df723d; sólo Admin y sesión/config se dirigen al candidato read-only. Secret servidor heredado del previews base config, jamás incorporado a Pages. Antes de promoción: sesión real Admin y customer, prueba autorizada de producto exclusivo, revisión origen/cookies y persistencia, QA y revisión completa del diff desde oficial.

Rollback oficial conservado: Pages f44a6069-a891-4d1b-a035-0e0dc5a00a40, backend d5df723d. Recuperación mediante rollback de Pages a ese deployment, sin DB ni DNS. No ejecutado porque oficial no se modifica. El candidato se puede abandonar sin tocar oficial ni PR55. IDs/commits finales se agregan tras publicación real.

## Deployment comprobado

- Preview: https://admin-cards-review.dreams-perfumes.pages.dev/admin (requiere sesión Admin real). Pages `cb0a3ca6-ae1c-4dd6-b4ea-896978166591`, entorno preview SUCCESS, fuente `c0f8bb06540ba9dd1fee8912ad9831c32976eeb2`.
- Backend aislado `0ba07603-8d14-41f2-8953-3e8407e7d3de`, código `83c36ca153ccc868f4a82527213d87e49889cf5c`, secret heredado sin leer/copiar valores. Health200/databaseok.
- PR56 https://github.com/facumartea/dreams/pull/56, draft, sin merge. CI39639266639 SUCCESS sobre c0f8bb0:279 tests, check61, audit sin vulnerabilidades conocidas, tres builds. Primer CI2ab28fb detectó entrypoint aún sin versionar; se corrigió en83c36ca y ambos CI posteriores pasaron.
- Remoto24 PASS/0 FAIL: Admin anónimo y siete APIs403; escrituras Admin403 antes deDB; login vacío400 y origen ajeno403; cuatro assets idénticos por hash, catálogo/cuenta200, noindex y configuración pública idéntica a oficial. El harness inicialmente buscó una cabecera con mayúsculas; HTTP confirmó noindex y se corrigió sólo la lectura del harness.
- Matriz local201 ejecuciones PASS; diez grupos remotos BLOQUEADOS enumerados. No sumar279+201:107 casos de matriz están dentro de suite279. Capturas son locales con fixtures, no sesión real remota.
- Oficial nuevamente confirmada f44a6069/461c17d, sin cambios. Customer preview45d05a7/PR55 y video preview independientes. DEPLOY PREVIEW:SÍ; DEPLOY OFICIAL:NO.
