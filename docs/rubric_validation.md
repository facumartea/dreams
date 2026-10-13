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

**URL verificada:** https://rubric-review-dreams-perfumes.dreams-perfumes.workers.dev/ · Admin `/admin` (requiere sesión; anónimo403).

Fuente `898813008f8c0afca8ddddfc2cfb09d3303fc87b`, [PR47](https://github.com/facumartea/dreams/pull/47), [CI38428906880 SUCCESS](https://github.com/facumartea/dreams/actions/runs/38428906880). Primera versión `5987bd12-d0e7-42ad-8c65-5228c80cfebb`; actualización sólo firma aislada `0e4e08ae-dec5-4c1b-ade5-81756e8b0626`. Assets/main_module iguales después de configurar firma; secreto Supabase heredado y ambos bindings son secret_text. El proyecto y origen exactos, read_onlytrue/schema_readyfalse/auto_confirmfalse/Googlefalse se verificaron por metadata sin valores secretos. Startup reportado52ms no equivale a medir Core Web Vitals.

QA remota Chromium390/1440: health200/catalogo46, menú/Escape/búsqueda/empty/reset/marca, detalle/recursos, carrito/cantidades/persistencia/contador/WhatsApp-resumen, login legacy visible, AdminHTML/API anónimo403. Cuatro assets críticos igualaron fuente y no tienen literales de secretos; carrusel añade ocho productos distintos, teclado y reduce/no-preference, sin video/autoplay/overflow/pageerror.

Checkout académico remoto: envío0/total, nombre requerido, carrito vacío/cambiado bloqueado, doble clic ignorado, dos fallos de red inyectados antes/después de respuesta conservaron la referencia; confirmación/recarga/vaciado pasaron, sin lecturas/transmisión/storage/consola de tarjeta ni orders/stock/correos/pasarela. Ejemplo real generado en QA: `DREAMS-1475823A93E94359A4EE7DF531CDAB60`. No se envió WhatsApp.

SELECT posterior conserva46productos/8perfiles/0orders/9tablasRLS. Telemetría filtrada a0e4e08ae devolvió0eventos; **cobertura limitada**, no afirmar cero errores de todo el runtime. QA browser sin pageerrors en cobertura ejecutada. Auth/Admin autenticados reales permanecen pendientes.

API Cloudflare confirma oficial Pagesac755bbe/c83b148, preview académica7c3cd341/d938a97 y preview Adminfa8761cd/c574696 intactas. No se publicó Pages, modificó DNS/tráfico ni se hicieron merges. Capturas remotas en `/workspace/dreams-rubric-evidence/remote-390-carousel.png` y `remote-1440-carousel.png` más checkout; se incluyen copias de evidencia en `docs/academico/evidencia/` (local/remote diferenciadas).

## Pendientes y recuperación

- Sesión legítima para QA remoto Auth/Admin: no disponible. No adivinar passwords, cambiar roles ni crear identidades confirmadas ficticias para eludir el bloqueo. Preview read-only protege escrituras comerciales.
- Carrito por cuenta PR45: fuera de base, falta QA con dos sesiones reales; selección actual visitante no acredita aislamiento entre cuentas.
- Cinco imágenes externas previamente detectadas con fallback y401Supabase histórico: pendientes, sin reemplazos o rotación de secretos en esta revisión.
- Logo PNG estricto máximo3colores/licencias y explicación/aportes/asistencia individuales: ver matriz, no asignar calificación ni inventar evidencia escolar.
- Dispositivo físico/Safari, accesibilidad integral y métricas Core Web Vitals no probados.

Rollback operativo de esta **nueva preview**: no enlazarla desde la oficial; si falla, volver a usar la URL oficial/preview anterior ya comprobada, conservadas. La oficial retiene Pagesac755bbe y backendd5df723d, no se ejecutó rollback ni se eliminaron deployments. No hay un respaldo Railway disponible declarado. Una promoción futura requiere QA autenticado y revisión separada; no es parte de esta autorización.

Usuario confirmó aceptación del consumo externo desde servidor/condiciones consultadas y apellidos **Marteaena/Ruas**. ZIP final se exportará desde commit revisado como `Marteaena-Ruas-DREAMS.zip`; no se envía a Classroom. No se recalcula porcentaje global por este refactor ni se confunde CI/push con deploy.
