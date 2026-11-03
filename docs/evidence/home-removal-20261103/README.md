# Retirada del bloque de colecciones de Inicio —03/11/2026

Cambio separado, iniciado después del cierre/merge de PR57 (main6865365). Única oficial autorizada: https://dreams-perfumes.pages.dev/.

Retirado completo «Explorá la selección / Tres formas de empezar»: sección, tarjetas, controles Anterior/Siguiente, contador, separadores y espacio. Eliminados sólo setup_collection_carousel y sus callbacks y siete líneasCSS exclusivas. No usa recursos gráficos exclusivos; imágenes/fuentes/estilos compartidos se conservan. Menú y páginas/filtros Mujer/Hombre/Unisex intactos. Portadaestática, productos, SobreDREAMS, opiniones y recientes conservados. Sin cambios de backend/cupón/formulario/Auth/Admin.

Único carrusel implementado: ya no queda otro. Rúbrica R10=NO CUMPLE/PENDIENTE por instrucción expresa, sin ocultar ni reemplazar. WireframeSVG/PNG, manualMD, diseño y defensa actualizados. La evidencia histórica del carrusel anterior conserva su fecha y no acredita la versión resultante.

Local:489testsPASS, sintaxis/buildPagesPASS,117archivos/2147registros/0>40. Chromium390/1440PASS: ausencia del bloque, productos→SobreDREAMS contiguos (gap0), sin overflow/erroresdeconsola, navegación porlos tres enlaces. Capturas local-home-* y local-browser.json son locales. Oficial390/1440PASS: mismos controles de ausencia, gap0, sin overflow/errores de consola y navegación real por las tres colecciones. Ver remote-browser.json y official-home-390.png/official-home-1440.png.

Rollback: Pagesfdd5f665-c7d1-438a-bc3d-e4bb079517fc (cupón/formulario ya verificados) + backendef043065 sin tocar. No otraswebs/previews/domínios, cambioscredenciales ni datoscomerciales.


## Publicación y cierre

Frontend publicado d366551a2f8880addd133ace40e5e76f70dd4315; Pages a176fa63-c0c5-46aa-bb8c-c97d1eb85466, producción/SUCCESS, CI234SUCCESS. Backend ef043065 no se desplegó ni modificó. PR58, posterior a PR57 ya integrada enmain6865365. No hubo superposición de cambios.

[Inicio390](official-home-390.png) · [Inicio1440](official-home-1440.png) · [Evidencia remota](remote-browser.json). ManualMD/PDF y wireframeSVG/PNG sincronizados. Rúbrica R10=NO CUMPLE/PENDIENTE: único carrusel retirado por solicitud expresa, sin contenido oculto ni reemplazo.

El primer arnés remoto verificaba el número de tarjetas de catálogo antes de terminar su carga; se corrigió la espera del arnés, sin cambios de aplicación. La ejecución completa posterior esperó las tarjetas y pasó. No se declara aprobada esa ejecución intermedia.

Rollback disponible: fdd5f665 + backendef043065, con cupón y formulario previamente verificados. CódigoAuth/Admin/carrito/cupón/formulario intacto en este cambio. No auditoría nueva de performance/WCAG ni Safari físico; Chromium390/1440 y suite489PASS. Fuera del requisito de carrusel pendiente por eliminación autorizada, no quedan defectos conocidos en este alcance.
