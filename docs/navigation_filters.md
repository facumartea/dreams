# Navegación y filtros DREAMS — 2026-10-15

Branch `codex/navigation-filter-dialog`, dependiente de PR44/b33a2ee. Base oficial Pagesac755bbe/c83b148; backend inmutable d5df723d/ec04a35 y pages/official-release.json conservados. PR48/052b224 registro/Auth NO incluida; sin merges ni video.

## Cambios

- Navegación superior sin indicadores inferiores en ningún estado; fondo y contraste marcan sección activa. Foco con outline, hover sólo en puntero fino. En móvil, seis áreas de ancho igual y altura mínima52px con dorado uniforme; escritorio conserva tonos por género. Menú cerrado usa visibility para excluir enlaces del recorrido de teclado.
- Un botón Filtros y conteo aplicado; diálogo nativo modal con encabezado/cierre y acciones visibles, scroll interior, búsqueda de perfume/marca/familia, marcas con búsqueda, radios de género/tipo/orden y precio. No select nativo en el panel.
- Borrador separado. Cambiar controles no consulta productos ni cambia sección/URL hasta Ver resultados. Cerrar/Escape descarta; Limpiar modifica sólo el borrador. Se cuentan los seis controles no predeterminados, incluido orden.
- URL/recarga/atrás/adelante conservados; parámetros ajenos preservados al aplicar, page reiniciado si existiera (catálogo actual sin paginación). Identificador de petición evita resultados o errores atrasados.
- Modalidad/inert nativa, contención explícita Tab/Shift+Tab, Escape, retorno al botón y scroll restaurado. Campos grandes y pie fijo del diálogo, reducido movimiento.
- Marcas cargan independientemente del catálogo y conservan selección frente a llegada asíncrona; estados de error/reintento no bloquean el formulario. HTML dinámico de marcas usa textContent.

## Validaciones y límites iniciales

22 tests focalizados PASS: modelo/URL/limpieza/serialización/carreras y proxy Pages incluyendo nuevo script, autorización, errores, cookies y mutaciones. Suite completa y builds finales en curso. Los helpers de catálogo/modelo/proxy se revisaron con AST de Node24: máximos18/11/16 líneas respectivamente.

QA local usa Chromium390x844/1440x900 con API pública real a través de un proxy de QA que sólo permite GET y quote del carrito; no se crean cuentas/pedidos ni se modifican datos. Móvil pasó flujos principales. Escritorio pendiente de completar medición correcta del cierre/scroll antes de declarar éxito. No extrapolar resultados locales a remoto.

Referencias visuales mencionadas no adjuntas: se implementa especificación y sistema DREAMS existente. No Safari/iPhone físico. Descarga WebKit detectó dependencias del host faltantes; sólo se declarará probado si puede ejecutarse.

## Publicación y recuperación

CLI Wrangler4.147 no tiene sesión; conector Cloudflare sí. OpenAPI oficial consultada: POST /accounts/{account_id}/pages/projects/{project_name}/deployments admite multipart Direct Upload con manifest y _worker.js o _worker.bundle. Build existente produce proxy ES module y assets visuales embebidos; sin Secret/API privilegiada en Pages.

Preview prevista: alias ya permitido https://official-direct-checkout.dreams-perfumes.pages.dev/ del proyecto Pages, separado del alias oficial. Evita modificar APP_ORIGINS o backend para esta tarea. Conservar URL inmutable del deployment de preview y verificar allí; para POST quote usar alias permitido. La metadata de branch de Pages es etiqueta de Direct Upload y no la fuente Git: registrar siempre SHA de codex/navigation-filter-dialog.

Oficial previa y rollback: Pages ac755bbe-f339-422a-91ef-006426abf0bf, URL https://ac755bbe.dreams-perfumes.pages.dev/. Antes de promover, comprobar SUCCESS/health y endpoint POST /accounts/9f3d7af60fcb0c2b4fff8570843588f9/pages/projects/dreams-perfumes/deployments/ac755bbe-f339-422a-91ef-006426abf0bf/rollback. No eliminar deployments. Backend inmutable conserva secretos y Auth. Rollback no ejecutado.

No hay publicación de esta tarea en este checkpoint. Promoción autorizada sólo después de preview/QA satisfactoria. No DNS, datos, roles, configuración Auth ni video alterados.
