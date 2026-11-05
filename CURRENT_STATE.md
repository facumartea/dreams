# Cierre técnico 2025 — PR #61

SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.

Base main `3e12bc6`. Branch `codex/cierre-tecnico-2025`, PR #61. Limpieza PR60 ya integrada; no repetirla. [Evidencia actual](docs/evidence/cierre-tecnico-20261105/README.md).

Implementado y probado localmente: carrusel manual en Más buscados, empaquetado de todos los scripts propios en Pages. Portada estática y eliminación de Tres formas de empezar conservadas. SQL activo modularizado mediante migración nueva versionada y aplicada; permisos/transacciones y lectura posterior verificados, sin datos migrados. Históricos/rollback excluidos del límite por aclaración docente comunicada por el usuario el 05/11.

QA real Admin con credencial disponible de ejecución, sin secretos temporales en Worker: alta/edición/imágenes, búsqueda, stock bajo, destacado, catálogo, rechazo customer/anónimo y logout. Recursos y cuentas QA retirados; carrito remoto tras migración probado con dos cuentas normales. Backend existente ef043065/fuente08635cd conservado, sin nuevo despliegue ni cambios de Auth o credenciales.

Antes de cierre: CI final, publicación exclusiva en https://dreams-perfumes.pages.dev/ y contraste de hashes, scripts servidos, carrusel/checkout y smoke Admin. Rollback Pages a176fa63 disponible; rollback SQL restaura sólo definición, no borra datos. No generar ZIP ni publicar previews.
