# Experiencia cinematográfica — sólo preview — 2026-10-20

## Fuente y aislamiento

Rama codex/preview-cinematic-scroll desde PR50/277ae1a, dependiente de PR43/40/38/37/34. PR49/navegación oficial y PR48/Auth quedan fuera. Proyecto Pages destino: dreams-preview en cuenta9f3d7af60fcb0c2b4fff8570843588f9, production_branch técnico codex/animated-preview-pages. La etiqueta «production» de ese proyecto corresponde a la preview, nunca a dreams-perfumes.

Estado antes de editar, verificado por API: dreams-preview.pages.dev operativo, Pages00bbbec5-8211-4ee4-be61-005690e8e05e/644afbb; runtime animado d938a97 con configuración6e5be7b8. Oficial dreams-perfumes.pages.dev: Pages82060492-8f22-4595-81a0-8cb7dc78d526/cd71d12, hero estático. Hash del HTML oficial antes:2e39174fcd88da860b7717130c8cd5e2aa417ce129bbda65b89ac97675c85b9a. La preview Worker anterior conserva su versión; no se publica allí.

Se modifica únicamente la capa visual Pages del inicio y tres archivos nuevos propios. Todas las demás páginas, APIs y medios se transmiten al mismo backend6e5be7b8. No se modifica configuración de Workers, secretos, Auth, Supabase, roles, contactos, autores, catálogo, filtros, carrito, checkout ni Admin. Hoja compartida style.css y scripts compartidos intactos. No usar deploy:pages ni deploy:cloudflare desde esta rama para publicar; build:pages se ejecuta sólo como comprobación de que sigue excluyendo el video de su overlay estático.

## Referencias: observado y propuesto

Revisión mediante Chromium móvil390x844 y escritorio1440x900 el20/10. En https://automobililamborghini.xerjoff.com/en-ar/collaboration observados:

- Hero de video a toda la portada, títulos grandes superpuestos, encuadres cercanos de frasco/mano y cortes a arquitectura/detalles; imágenes con luz cálida naranja, reflejos metálicos y negro profundo.
- Bloques editoriales con espacios amplios y medios recortados geométricamente; imágenes con desplazamiento vertical al hacer scroll. Se observaron estilos transform de parallax y escala1.25; no se deduce un modelo3D del frasco por eso.
- Catálogo con frasco de gran escala sobre panel curvo de color, controles laterales; móvil usa columna/hero más vertical y copy centrada. Navegación fija. El video observado está configurado en loop, distinto del requisito de reproducción única que DREAMS conserva.
- Se observaron bloques de texto al recorrer la página; no se comprobó una animación letra por letra ni una rotación completa vinculada a scroll. La entrada suave de texto y el sticky breve de DREAMS son propuestas propias.

El consentimiento requirió varias pulsaciones «Reject» hasta poder inspeccionar sin overlay. Instagram devolvió200 pero no expuso video reproducible (pantalla de acceso/app y texto de sebastiankra.ia); no se declara visto el reel completo desde Instagram. El adjunto sí se inspeccionó por fotogramas:58,35s,716x1274,H264/AAC,30fps,~597kb/s; trata sobre diseño web y DESIGN.md, no sobre un perfume. Es material de referencia, no instrucciones operativas ni un asset de producto. No se solicita otro archivo porque la referencia Xerjoff accesible basta para esta versión.

## Material real y adaptación

Video DREAMS ya versionado:1280x720,H264,24fps,20s,3950130bytes (~1,58Mb/s), sin audio. SHA256ffab2ba7c3482a1ca0ce8fde75bfff54642fd605a64759d4a0f23e45aff679b8, sin recortar, acelerar, reescalar ni recomprimir. Procedencia y remux anteriores en docs/preview_hero_video.md. Posters WebP primer/final1280x720,12,9/19,3KB, RGB sin transparencia. Imagen portrait1024x1536 y frasco transparente185x272 disponibles; se eligió el fotograma final para mantener el mismo frasco/etiqueta y evitar ampliar el PNG pequeño. No hay modelo3D ni secuencia multivista; no se presume una licencia nueva ni se copian assets de terceros.

La integración no recupera microdetalle inexistente ni corrige artefactos de IA del original. Una rotación real requiere modelo3D autorizado con geometría/textura de etiqueta y luz, o filmación multivista del producto. Un video vertical propio1080x1920 con frasco/pulverización íntegros facilitaría mayor escala móvil sin recortar entorno; falta ese material, no se reemplaza por otro perfume.

## Implementación

- Hero full width bajo menú; texto/CTA originales sobre el fondo de video con degradado. Desktop conserva cuadro completo con contain; móvil encuadra hacia83% en una región superior y adapta copy al espacio oscuro. Sólo se recorta entorno, sin estirar el frasco; revisar cada estado en QA. CTA visible desde el inicio; entrada de título breve, desactivada con movimiento reducido.
- Reproducción una vez,20s completos, muted/playsinline, sin loop ni controles nativos. Pausa discreta accesible44px con etiqueta dinámica. Fuente asignada una sola vez; hover/scroll/resume no la reemplazan. Regreso de sesión muestra final estático; BFCache pausa sin autoreanudar; recarga explícita permite nueva reproducción. Póster visible hasta fotograma presentado, mientras carga o si autoplay falla. Reduced motion/save-data no asignan srcMP4.
- Frase editorial existente pasa a una secuencia breve de145svh, sticky en escritorio y flujo normal en móvil. Escala desktop.96→1.035 y desplazamiento±16px; móvil.99→1.01 y±4px. Ambiente dorado CSS y énfasis de texto acompañan scroll; no rotación, filtros de color ni deformación del frasco. Imagen secundaria lazy, dimensiones reservadas; no video adicional ni librerías. Un rAF por evento, eventos pasivos, IntersectionObserver y ningún loop o scroll interceptado.
- Salida con degradado hacia Más buscados y enlaces de categorías existentes; botones permiten ir directo al catálogo o saltar la presentación. Contenido posterior/Autores/Contacto conservados.
- Build exclusivo Pages incrusta HTML/CSS/JS de inicio; allowlist exacta, GET/HEAD solamente, ETag/304, no-cache y políticas upstream preservadas. Nunca reemplaza errores/denegaciones o respuestas API/Admin, ni sigue redirects privados. Medios permanecen streams del backend. Noindex en encabezados/robots y meta del inicio.

## Checks y estado de publicación

142/142 tests PASS, check54 archivos, audit producción sin vulnerabilidades conocidas, builds Workers dry-run/Pages oficial estático/Pages animada correctos. Dos expectativas visuales antiguas (canonical Railway y clase del hero anterior) se actualizaron para verificar canonical preview/noindex y respaldo real; no se eliminaron pruebas. Helpers nuevos y modificados de video/scroll/proxy <=20líneas, comprobación AST ejecutada: máximos16 líneas en helpers nuevos. Pruebas de reproducción/carreras/reduced/frame inicial/error/origen/cookies/autorización/cache y overlay incluidas.

QA local Chromium390x844/1440x900 PASS: inicio/final20s, pausa/tiempo estable, una sola descarga MP4 durante scroll/resume/regreso, búsqueda/marca/carrito persistente/acceso; reducido/autoplay bloqueado/error/carga lenta y geometría320x640/768x1024/844x390/1920x1080 PASS. No errores JS en la suite local. Publicación final9263d168-f2f3-47d5-9640-1e1c0d30cf02 SUCCESS, commit472c289c540d8f847c05d3bbe3764f04ebf33774. QA remota completa repetida en esa versión: móvil/escritorio y fallbacks/geometría PASS en https://dreams-preview.pages.dev/, sin errores JS, mismos recorridos que local. CI39366033247 SUCCESS (142tests/check54/builds/audit). Primera publicación64bb2db5/4aa159c también validada; la final conserva además private/no-store y ambas cookies. Artefacto39907bytes SHA25666060f9feda7f6b3d7971e18f91ea43203bdb92ab1a0f3ce1baee5188cd1b3d2. La sesión de QA local sólo admite GET y quote del carrito contra API pública; no permite otras escrituras ni prueba sesiones reales. Safari/iPhone físico no disponibles; emulación Chromium no equivale a dispositivo real.

## Publicación y rollback

Build: pnpm run build:pages:animated. Destino exacto dreams-preview, etiqueta branch codex/animated-preview-pages y commit Git real de esta rama en metadata. Conector Cloudflare autenticado, Direct Upload oficial multipart manifest/_worker.js módulo/_routes.json. Ningún secreto requerido en Pages; CLI no necesita login adicional para esta vía.

Antes de promover comprobar build/tests/diff y que el oficial sigue82060492/cd71d12. Recuperar preview anterior mediante POST /accounts/9f3d7af60fcb0c2b4fff8570843588f9/pages/projects/dreams-preview/deployments/00bbbec5-8211-4ee4-be61-005690e8e05e/rollback, después comprobar canonical_deployment, health/catálogo/video/carrito. Deployment anterior retenido, no borrar; rollback no ejecutado. Alternativa operativa: alias Worker anterior activo con video, sin cambios DNS. No restaurar Railway ni tocar proyecto oficial.

Las políticas private/no-store y Set-Cookie del upstream se conservan también cuando el inicio usa overlay; una prueba dedicada conserva ambos tokens ficticios de sesión en headers sin escribirlos a logs ni frontend. No se dispone de credenciales de prueba para validar login/Admin reales; sólo pantalla de acceso y protecciones anónimas, con auth backend intacto.

## Cierre verificado

- URL canonical https://dreams-preview.pages.dev/, deployment inmutable https://9263d168.dreams-preview.pages.dev/. Para recorridos con POST usar canonical, cuyo Origin está permitido; no ampliar orígenes por aliases temporales.
- HTML y CSS servidos coinciden por SHA256 con los archivos del commit publicado. MP4 y medios originales sin modificación ni recompresión. Grabaciones de recorrido móvil/escritorio23,36s en docs/evidence/cinema; grabadas sobre4aa159c, visualmente idéntico a472c289 (éste sólo preserva políticas privadas en el proxy). Exportación MP4 de las grabaciones no modifica el archivo de producto.
- QA remota final: pausa/teclado/foco, fin20s estable, scroll rápido, regreso sin segunda descarga, poster con autoplay bloqueado/error/carga lenta, reduced sinMP4; seis viewports sin overflow. Navegación, búsqueda parcial/restauración/Chanel, catálogo46, carrito persistente/contador/envío gratis y pantalla de acceso PASS. No Safari/iPhone físico, login/refresh/Admin autenticados ni métricas CWV de campo verificados.
- Checkout exclusivamente académico comprobado remoto con proveedor presentation_demo antes de continuar, sin tarjeta: referencia DREAMS-B05476E6EC1C4B978F5A64648E59C29E estable al recargar, cookie segura host-only, únicamente POST quote/presentation. No pedido comercial, pasarela, correo ni stock modificado. GET config/health/checkout y Admin anónimo403/no-store, POST productos/pedidos/registro protegidos403 y Origin ajeno rechazado403 PASS. Registro sigue pendiente en PR48, fuera de este cambio.
- Oficial permanece Pages82060492/cd71d12, SUCCESS, sin video ni scripts cinema. Hash HTML antes/después idéntico2e39174fcd88da860b7717130c8cd5e2aa417ce129bbda65b89ac97675c85b9a. Alias Worker anterior conserva HTML0efb69e9215611db07fed9618f849859e6926c059c5332788aa9c42c3ed07b7b y continúa operativo. Backend6e5be7b8, secrets, DNS, Auth, roles y datos intactos.
- Rollback00bbbec5 retenido y SUCCESS comprobado mediante API, endpoint oficial consultado, no ejecutado. Sin merges. PR51 dependiente de PR50; checkpoints posteriores sólo documentan evidencia y no cambian el deployment.

Próxima acción: revisión del recorrido por el usuario en teléfono. Un giro3D real o un encuadre vertical de mayor escala requiere el material específico descrito arriba; no se promete detalle recuperado ni se genera otra marca/perfume.
