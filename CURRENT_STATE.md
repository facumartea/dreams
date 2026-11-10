# Defensa oral y registro de prompts · documentación

SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.

Base main `60451cabe5ff9b78f97777d64120e5ff9a3238b2`; branch `docs/defensa-oral-prompts-20261110`. PR60/61/62 integradas: no repetir limpiezas ni QA funcional ya acreditada. Esta tanda sólo actualiza documentación y retira una captura duplicada sin referencias activas.

Guía ampliada contrastada con código: 43 temas, 13 fichas de funciones y 46 combinaciones API, separadas por habilitación. [Índice y archivos](docs/entrega-2025/INDICE.md). Registro de prompts PARCIAL, con fuentes y fechas no confirmadas explícitas. No se publican transcripción ni audios privados; tampoco se atribuye revisión humana no acreditada. Falta historial original para completar el registro. [Limpieza y conservación](docs/entrega-2025/revision-limpieza-20261110.md).

No se modifica código, DB, Auth, credenciales ni configuración. Sin ZIP ni deployment documental. La oficial conserva Pages `3ad69579-9e5e-450a-abe8-f28faec44c42`, fuente `85147d83eecd868179c03e7b48d826b656c2d3b9`; backend ef043065 y rollback b60383af. No se revalida producción en esta tarea de estudio.

Entrega por [PR #63](https://github.com/facumartea/dreams/pull/63), checkpoint `2cf4eb4`. CI252 aprobado (493 tests, 0 fallidos, 4 omitidos; inventario y builds sin despliegue). El cierre documental sólo añade evidencia y necesita su propio CI antes de integrar; consultar PR para SHA/estado final. Validaciones y estado de GitHub: [verificación documental](docs/entrega-2025/verificacion-defensa-20261110.md). Al completar la entrega iniciar simulacro oral de una pregunta por vez; esperar intento antes de corregir.

## Continuidad anterior (PR62, conservada)

# Ajustes de Inicio y cabeceras — PR #62

Frase de continuidad conservada en la cabecera.

Base main `e6d60bf`. Branch `codex/inicio-cabeceras-sin-extras`. No repetir limpieza PR60 ni cierre técnico PR61. [Evidencia actual](docs/evidence/inicio-cabeceras-20261105/README.md).

Retirados vistos recientemente y su lectura/escritura local; sin borrar claves existentes. Indicador del carrusel sólo para lectores de pantalla, sin espacio visible. Carrusel/productos/controles conservados. Cabeceras Perfumes/Hombre/Mujer/Unisex sin párrafo visible, una columna; SEO independiente del DOM retirado. Portada estática intacta.

QA local: 52 comprobaciones escritorio/móvil sobre API oficial, incluidos filtros, navegación, detalle y carrito. Suite 493 aprobadas, 4 SQL omitidas sin cambio de BD. Manual, wireframes y auditoría actualizados. Publicado y contrastado: Pages `3ad69579-9e5e-450a-abe8-f28faec44c42`, fuente `85147d83eecd868179c03e7b48d826b656c2d3b9`, CI249 aprobado. QA oficial: 52 checks, sin errores JS ni overflow. Los 20 scripts servidos coinciden con la fuente; máximo 38 líneas. Los últimos commits sólo incorporan documentos/evidencia: el SHA de integración se consulta en PR62. No volver a desplegar por esos commits.

Rollback Pages b60383af; backend ef043065 conservado. No cambios de Auth, credenciales, BD, carrito/cuentas ni otros sitios/previews. Sin ZIP.
