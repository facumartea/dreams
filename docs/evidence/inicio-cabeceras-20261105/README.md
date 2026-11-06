# Ajustes de Inicio y cabeceras — PR #62

Fecha de trabajo según cliente: 05/11/2026 (America/Buenos_Aires); timestamps de pruebas en UTC. Base `main` en `e6d60bf`. Única oficial: https://dreams-perfumes.pages.dev/.

## Cambios acotados

- El contador del carrusel continúa como live region para lectores de pantalla, con `.sr-only`: posición absoluta, caja de 1px y recorte completo. No reserva un elemento del layout. Anterior/Siguiente, teclado, táctil y productos reales siguen vigentes; sin autoplay.
- Retirada completa de «Tu recorrido / Perfumes que viste recientemente», con su contenedor y llamadas. Se retiraron las tres funciones exclusivas de historial y sus invocaciones desde detalle/Inicio. No había reglas CSS exclusivas adicionales. `create_product_card`, imágenes y estilos de catálogo siguen compartidos. Ya no se lee ni escribe `dreams_recent`; no se borra ese valor ni se afectan otras claves.
- Retirado el párrafo de las cuatro cabeceras. La descripción SEO se obtiene de datos de la colección, sin consultar el párrafo eliminado. Se preservan meta description, OG, Twitter, canonical, identidad, títulos, paletas y filtros. CSS acotado al catálogo en una columna, con espaciado compacto; reglas compartidas de otras páginas conservadas.

## Verificación

[Prueba local con API oficial](local.json): 52 comprobaciones en 1440px y 390px. Ausencia de la sección, caja del indicador fuera del flujo, carrusel, detalle con historial antiguo corrupto, ausencia de nuevas escrituras a ese historial, carrito conservado, cuatro cabeceras sin párrafo, SEO, una columna, filtros, overflow y errores JS. Escritorio aprobado se reutiliza del [primer intento](local-intento.json); en móvil el harness leyó el live region antes del evento scroll, y se completó esperando su actualización. No se corrigió código por ese desfase del harness.

Suite: 497 casos, 493 aprobados y 4 SQL omitidos sin contenedor. No se repite PostgreSQL ni QA Auth/Admin: no se cambian servidor, esquema, permisos, carrito, cuentas o checkout. Las pruebas acreditadas de PR61 siguen con su fecha y versión. Sintaxis, inventario de 40 líneas y build de Pages aprobados. Se sustituyen las pruebas del historial retirado por una regresión de SEO sin el párrafo, conservando los demás tests.

Inicio y catálogo actualizados en wireframes PDF/PNG/fuentes, conservando su carácter retrospectivo. Manual actualizado en su ubicación original, sin duplicar carpetas por edición. Matriz e índice enlazan esta evidencia.

## Publicación

Publicado y comprobado: Production `3ad69579-9e5e-450a-abe8-f28faec44c42`, commit `85147d83eecd868179c03e7b48d826b656c2d3b9`, CI249 aprobado. [Datos de publicación](publicacion.json).

[QA real de la oficial](oficial.json): 52 comprobaciones en 1440px y 390px, todas aprobadas. Cabeceras y recorrido sin errores JS ni overflow; filtros y carrito siguen funcionando. [Scripts servidos](scripts-oficiales.json): 20 hashes coincidentes con la fuente aprobada, máximo 38 líneas, sin excesos.

No se crea ni modifica otra web o preview. Rollback disponible al deployment `b60383af-2676-4781-b7df-339f300cafd1`; backend privado `ef043065` permanece igual. No se despliega nuevamente por los commits finales de documentación/evidencia. No se cambia Auth, BD, credenciales ni datos comerciales.

## Capturas de la oficial

| Pantalla | Escritorio | Móvil |
|---|---|---|
| Inicio completo | [PNG](inicio-completo-escritorio.png) | [PNG](inicio-completo-movil.png) |
| Carrusel conservado sin contador visible | [PNG](inicio-escritorio.png) | [PNG](inicio-movil.png) |
| Perfumes | [PNG](cabecera-perfumes-escritorio.png) | [PNG](cabecera-perfumes-movil.png) |
| Hombre | [PNG](cabecera-hombre-escritorio.png) | [PNG](cabecera-hombre-movil.png) |
| Mujer | [PNG](cabecera-mujer-escritorio.png) | [PNG](cabecera-mujer-movil.png) |
| Unisex | [PNG](cabecera-unisex-escritorio.png) | [PNG](cabecera-unisex-movil.png) |

Capturas y PDFs revisados visualmente. Los archivos `-local` documentan la validación previa; no se presentan como capturas publicadas. Pendientes académicos individuales de la matriz conservados; no se garantiza nota.
