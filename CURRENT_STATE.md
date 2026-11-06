# Ajustes de Inicio y cabeceras — PR #62

SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.

Base main `e6d60bf`. Branch `codex/inicio-cabeceras-sin-extras`. No repetir limpieza PR60 ni cierre técnico PR61. [Evidencia actual](docs/evidence/inicio-cabeceras-20261105/README.md).

Retirados vistos recientemente y su lectura/escritura local; sin borrar claves existentes. Indicador del carrusel sólo para lectores de pantalla, sin espacio visible. Carrusel/productos/controles conservados. Cabeceras Perfumes/Hombre/Mujer/Unisex sin párrafo visible, una columna; SEO independiente del DOM retirado. Portada estática intacta.

QA local: 52 comprobaciones escritorio/móvil sobre API oficial, incluidos filtros, navegación, detalle y carrito. Suite 493 aprobadas, 4 SQL omitidas sin cambio de BD. Manual, wireframes y auditoría actualizados. Publicado y contrastado: Pages `3ad69579-9e5e-450a-abe8-f28faec44c42`, fuente `85147d83eecd868179c03e7b48d826b656c2d3b9`, CI249 aprobado. QA oficial: 52 checks, sin errores JS ni overflow. Los 20 scripts servidos coinciden con la fuente; máximo 38 líneas. Los últimos commits sólo incorporan documentos/evidencia: el SHA de integración se consulta en PR62. No volver a desplegar por esos commits.

Rollback Pages b60383af; backend ef043065 conservado. No cambios de Auth, credenciales, BD, carrito/cuentas ni otros sitios/previews. Sin ZIP.
