# Retirada del bloque de colecciones de Inicio —03/11/2026

Cambio separado, iniciado después del cierre/merge de PR57 (main6865365). Única oficial autorizada: https://dreams-perfumes.pages.dev/.

Retirado completo «Explorá la selección / Tres formas de empezar»: sección, tarjetas, controles Anterior/Siguiente, contador, separadores y espacio. Eliminados sólo setup_collection_carousel y sus callbacks y siete líneasCSS exclusivas. No usa recursos gráficos exclusivos; imágenes/fuentes/estilos compartidos se conservan. Menú y páginas/filtros Mujer/Hombre/Unisex intactos. Portadaestática, productos, SobreDREAMS, opiniones y recientes conservados. Sin cambios de backend/cupón/formulario/Auth/Admin.

Único carrusel implementado: ya no queda otro. Rúbrica R10=NO CUMPLE/PENDIENTE por instrucción expresa, sin ocultar ni reemplazar. WireframeSVG/PNG, manualMD, diseño y defensa actualizados. La evidencia histórica del carrusel anterior conserva su fecha y no acredita la versión resultante.

Local:489testsPASS, sintaxis/buildPagesPASS,117archivos/2147registros/0>40. Chromium390/1440PASS: ausencia del bloque, productos→SobreDREAMS contiguos (gap0), sin overflow/erroresdeconsola, navegación porlos tres enlaces. Capturas local-home-* y local-browser.json son locales. Falta publicar y comprobarlaoficial.

Rollback: Pagesfdd5f665-c7d1-438a-bc3d-e4bb079517fc (cupón/formulario ya verificados) + backendef043065 sin tocar. No otraswebs/previews/domínios, cambioscredenciales ni datoscomerciales.
