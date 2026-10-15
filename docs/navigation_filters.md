# Navegación y filtros DREAMS — 2026-10-15

Branch `codex/navigation-filter-dialog`, dependiente de PR44/b33a2ee. Base oficial Pagesac755bbe/c83b148; backend inmutable d5df723d/ec04a35 y pages/official-release.json conservados. PR48/052b224 registro/Auth NO incluida; sin merges ni video.

## Cambios

- Navegación superior sin indicadores inferiores en ningún estado; fondo y contraste marcan sección activa. Foco con outline, hover sólo en puntero fino. En móvil, seis áreas de ancho igual y altura mínima52px con dorado uniforme; escritorio conserva tonos por género. Menú cerrado usa visibility para excluir enlaces del recorrido de teclado.
- Un botón Filtros y conteo aplicado; diálogo nativo modal con encabezado/cierre y acciones visibles, scroll interior, búsqueda de perfume/marca/familia, marcas con búsqueda, radios de género/tipo/orden y precio. No select nativo en el panel.
- Borrador separado. Cambiar controles no consulta productos ni cambia sección/URL hasta Ver resultados. Cerrar/Escape descarta; Limpiar modifica sólo el borrador. Se cuentan los seis controles no predeterminados, incluido orden.
- URL/recarga/atrás/adelante conservados; parámetros ajenos preservados al aplicar, page reiniciado si existiera (catálogo actual sin paginación). Identificador de petición evita resultados o errores atrasados.
- Modalidad/inert nativa, contención explícita Tab/Shift+Tab, Escape, retorno al botón y scroll restaurado. Campos grandes y pie fijo del diálogo, reducido movimiento.
- Marcas cargan independientemente del catálogo y conservan selección frente a llegada asíncrona; estados de error/reintento no bloquean el formulario. HTML dinámico de marcas usa textContent.

## Validación y publicación comprobadas

- Commit publicado: `805fcfcb9aa8700fd292252b41b0430e300043b5`; PR49, base PR44/b33a2ee. CI https://github.com/facumartea/dreams/actions/runs/38764353797 SUCCESS.
- 133/133 tests, check50 archivos, auditoría producción sin vulnerabilidades conocidas; builds Workers y Pages correctos. Helpers nuevos/modelo/proxy <=20 líneas comprobados con AST. No se declara cobertura global completa.
- QA local Chromium390x844/1440x900 y remota preview PASS. Oficial PASS en esos dos tamaños: cuatro catálogos, menú/una sección activa, cada filtro y combinaciones, limpieza, orden, vacío, recarga/historial, borrador descartado, Escape/Tab/foco/scroll y carrito visitante persistente/pantalla de acceso. Sin errores JS en la ejecución completa.
- Primera comprobación oficial agotó espera de carga; SHA256 de HTML/scripts servidos coincide y segunda ejecución completa pasó. Causa transitoria no confirmada; no se atribuye a un fallo corregido sin evidencia.
- Preview con fallos de red controlados PASS: error/reintento de marcas/productos, selección asíncrona, resultados tardíos reales descartados. Geometría y movimiento reducido PASS en320x640/390x480/844x390/1440x900, estados hover/selección/foco verificados.
- Capturas oficiales en `docs/evidence/navigation/`. Sin Safari/iPhone físico: WebKit descargado pero no ejecutable por bibliotecas del host faltantes. Teclado móvil real, login/Admin autenticados y CWV no verificados; no necesarios para cambios de permisos porque no se modificaron.
- Referencias visuales mencionadas no estaban adjuntas; comparación con especificación y sistema DREAMS existente.

## Deployment y recuperación

Cloudflare conector autenticado; Wrangler4.147 sin sesión local. API oficial Direct Upload, manifest vacío y _worker.js módulo con assets públicos embebidos; sin secretos en Pages. SHA256 del artefacto176712bytes: `e09914698fab4787b78a5404d3c0928d28a81ef7de10f281274a29940f4293ae`.

Preview final: b3f28d4a-393e-407b-bcee-da5b9cd83eca SUCCESS, https://b3f28d4a.dreams-perfumes.pages.dev y alias https://official-direct-checkout.dreams-perfumes.pages.dev (origen previamente permitido). Oficial: e3399fc9-bc1d-45d8-949f-9e35a47f1baf SUCCESS, https://dreams-perfumes.pages.dev/. Mismo artefacto805fcfc, backend inmutable d5df723d/ec04a35. Etiquetas branch de Pages son del Direct Upload; SHA identifica la fuente real.

Rollback comprobado antes de publicación: deployment anterior ac755bbe-f339-422a-91ef-006426abf0bf SUCCESS, https://ac755bbe.dreams-perfumes.pages.dev/ y health200/databaseOK. Ejecutar con acceso Cloudflare autorizado POST `/accounts/9f3d7af60fcb0c2b4fff8570843588f9/pages/projects/dreams-perfumes/deployments/ac755bbe-f339-422a-91ef-006426abf0bf/rollback`, después verificar canonical_deployment, portada y catálogo. No requiere restaurar Railway ni secretos. Procedimiento disponible, no ejecutado; no se borraron deployments.

Auth/PR48, datos, DNS, roles, checkout y assets del hero intactos respecto a c83b148. Video permanece exclusivamente en la preview animada, cuya nueva dirección se configura en rama separada. Regla duradera de publicación oficial en AGENTS.md.
