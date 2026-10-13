# Evidencia de adecuación académica

13 de octubre de 2026. Rama `codex/rubric-academic-review`, dependiente de PR46/base3365e57. Oficial preservada; ningún merge, DNS, credencial, rol, migración ni dato comercial modificado.

## Base y checks ejecutados

| Check | Resultado real |
|---|---|
| Base antes del refactor | 139/139 tests, sintaxis51, 985 funciones JS;78 mayores de20 |
| Instalación final | pnpm11.19.0 frozen/offline, política de supply chain204 entradas aprobada |
| Sintaxis + control20 | 56 JS/MJS;1265 funciones/callbacks JS, máximo20, cero violaciones; SQL3funciones+1DO, máximo18, cero violaciones |
| Suite final | 143/143, cero fallos/omitidos; incluye runtime workerd y nuevas regresiones del medidor/passwords |
| Workers build | dry-run correcto,2200.03KiB/gzip508.82KiB,37 assets; no equivale a deploy |
| Pages build | correcto; backend oficial inmutable aún fijado; NO se publicó ese bundle |
| Audit prod | sin vulnerabilidades conocidas |
| Lint/tipos | JS sin ESLint/tsc independiente; sintaxis/AST y tests ejecutados, no afirmar typecheck inexistente |
| Diff | `git diff --check` correcto; scan de textos sin valores encontró cero secretos privilegiados fuera de fixtures/passwords en storage cliente |

Acorn8.15.0 y libpg-query18.1.5 son dependencias de desarrollo para análisis; no van al navegador ni al runtime Worker. Un parser publicado el mismo día fue rechazado por antigüedad mínima: se reemplazó por libpg-query de septiembre, sin excepciones en pnpm-workspace ni debilitamiento de la política. El refactor inicialmente detectó errores de capturas/registro duplicado de rutas mediante pruebas; se corrigieron antes de esta suite final, sin retirar assertions. El conteo incluye los scripts nuevos. La comparación con la base confirmó las44rutas HTTP con los mismos métodos/paths/número de handlers; todas las assertions existentes se conservaron.

## QA local — no son sesiones reales de Supabase

Chromium con fixtures HTTP autorizadas en127.0.0.1:8864,390×900 y1440×900:

- Admin: búsqueda parcial nombre/marca/case/tildes/trim/empty/limpiar, marca ausente, catálogo completo31fixture, no requests por tecla; orden/editar/reset/cancelar y error/retry/respuesta tardía. Customer fixture403. Sin escrituras en esa prueba.
- Imágenes: URL conservada en edición de precio, dos PUTs **sólo producto fixture9** por tamaño; recarga/Admin/catálogo/detalle confirmaron persistencia. HTTPS sin extensión, vacío/malformado/HTTP/páginaHTML/404/timeout/respuesta tardía/retry/enlace temporal. Sin HEAD ni escrituras a productos reales. Seis módulos navegables. Una ejecución secuencial inicial tuvo timeout del harness; ambos tamaños pasaron luego, escritorio con fixture nueva y espera suficiente.
- Checkout académico: cantidad+/-/recarga/contador/envío0/total, referencia estable, doble envío y fallos de red antes/después de la respuesta, confirmación/recarga/carrito vacío o cambiado. Campos de tarjeta no leídos/persistidos/transmitidos. Sin pedido/stock/pasarela/correo real.
- Carrusel: ocho IDs distintos, teclado Enter/Anterior/Siguiente, estático en hero, sin autoplay,390/1440 y movimiento reduce/no-preference. Sin overflow/pageerror/mutaciones. Primera assertion consultó disabled antes del evento scroll; se esperó el estado observable, sin cambiar código para esa espera.
- Menú/Escape/búsqueda pública/empty/reset/filtro marca y navegación probados. No se presentan fixtures como QA autenticada remota.

Capturas locales en `/workspace/dreams-rubric-evidence/local-390-search.png`, `local-1440-search.png`, `local-390-image.png`, `local-1440-image.png`, `local-390-carousel.png`, `local-1440-carousel.png` y recorridos de checkout. Los logs de ejecución están fuera del repo en `/tmp/dreams-rubric-*.log` y no contienen credenciales reales.

## Preview remota

Publicación aislada/URL/SHA/CI y QA remota se completan después del commit de implementación; no son los resultados locales anteriores. No se reemplaza `academic-review`, `admin-search-review` ni la oficial. SupabaseSecret permanece servidor en base de previews; firma académica nueva sólo para esta preview, ingresada por stdin seguro, sin valores en archivos/args/logs.

## Pendientes y recuperación

- Sesión legítima para QA remoto Auth/Admin: no disponible. No adivinar passwords, cambiar roles ni crear identidades confirmadas ficticias para eludir el bloqueo. Preview read-only protege escrituras comerciales.
- Carrito por cuenta PR45: fuera de base, falta QA con dos sesiones reales; selección actual visitante no acredita aislamiento entre cuentas.
- Cinco imágenes externas previamente detectadas con fallback y401Supabase histórico: pendientes, sin reemplazos o rotación de secretos en esta revisión.
- Logo PNG estricto máximo3colores/licencias y explicación/aportes/asistencia individuales: ver matriz, no asignar calificación ni inventar evidencia escolar.
- Dispositivo físico/Safari, accesibilidad integral y métricas Core Web Vitals no probados.

Rollback operativo de esta **nueva preview**: no enlazarla desde la oficial; si falla, volver a usar la URL oficial/preview anterior ya comprobada, conservadas. La oficial retiene Pagesac755bbe y backendd5df723d, no se ejecutó rollback ni se eliminaron deployments. No hay un respaldo Railway disponible declarado. Una promoción futura requiere QA autenticado y revisión separada; no es parte de esta autorización.

Usuario confirmó aceptación del consumo externo desde servidor/condiciones consultadas y apellidos **Marteaena/Ruas**. ZIP final se exportará desde commit revisado como `Marteaena-Ruas-DREAMS.zip`; no se envía a Classroom. No se recalcula porcentaje global por este refactor ni se confunde CI/push con deploy.
