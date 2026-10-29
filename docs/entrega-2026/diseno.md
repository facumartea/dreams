# Diseño, contenido y límites de evidencia

DREAMS es la marca de fantasía del proyecto, con una tienda de perfumería multimarca. No se afirma ser fabricante autorizado de las marcas del catálogo. Identidad: negros, marfil y dorado cálido; tipografía editorial para títulos y sans serif legible para interfaz. Las variables y reglas están en `public/css/style.css`.

El isologo limpio existente [PNG](../../public/assets/dreams-isologo-clean.png) conserva una D y un frasco simplificados en dorado sobre transparencia, con negro según el fondo. Se inspeccionó visualmente y no se sustituyó ni deformó. El criterio de máximo tres **colores de diseño** se evalúa por tintas de la marca (dorado/negro/marfil), no contando cada píxel antialias de un raster. La valoración de simplicidad y fidelidad corresponde al docente; no se generó una variante arbitraria.

La navegación incluye botones/enlaces visibles; HTML usa header/nav/main/section/article/footer, formularios con labels y mensajes de estado. El carrusel añadido es manual, con contenido distinto Mujer/Hombre/Unisex, controles con nombres accesibles, navegación por teclado y sin autoplay; no reemplaza la portada por video. Con JS deshabilitado se conservan sus tres enlaces. Los textos no prometen promociones o propiedades nuevas del perfume.

Las imágenes de producto se guardan como URL, con preview y fallback. [Fuentes históricas](../image_sources.md) son una lista de procedencia orientativa, no licencias verificadas por imagen. La licencia individual y derechos de fotos externas siguen **NO VERIFICABLES**; no se declara autorización comercial por ser un trabajo académico.

Las capturas de la entrega provienen del candidato local y datos sintéticos. La matriz anterior conserva pruebas de móvil/escritorio de Admin; las verificaciones nuevas del carrusel y las regresiones se separan en `pruebas.md`. No se afirma accesibilidad completa WCAG ni performance avanzada sólo por pasar tests o tener diseño responsive.

Integrantes confirmados por el usuario el29/10/2026: **Martearena y Ruas**. Se usa esa identificación en el footer compartido, sin deducir nombres de pila de variantes históricas. Esto identifica el grupo; no atribuye automáticamente a sus integrantes los cambios de código realizados por IA.
