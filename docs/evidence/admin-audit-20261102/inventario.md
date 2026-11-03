# Inventario de controles Admin y comprobación

Destino exclusivo: https://dreams-perfumes.pages.dev/admin. Fuente: `views/admin.html`, `public/js/admin.js`, `server/app.js`, políticas de origen, rol y RLS. Inventario actualizado para la auditoría retomada el 02/11/2026 (fecha del cliente). Las pruebas anteriores conservan su fecha; no se presentan como ejecuciones nuevas.

| Módulo/control | Acción esperada | Comprobación y evidencia |
|---|---|---|
| Siete tarjetas: Productos, Disponibilidad baja, Usuarios, Consultas, Opiniones, Pedidos, Cupones | Una activa, carga del módulo, foco y `aria-pressed` consistentes | Matriz histórica A; recorrido remoto nuevo pendiente |
| Reintentar conteos / Reintentar módulo | Recuperar de error sin perder navegación | Inyección de error en navegador, luego respuesta real |
| Estadísticas y conteos | Coincidir con API y filas, sin inventar stock | Conteo productos/cuando hay QA y después de eliminar; API real |
| Productos: marca, nombre, género, categoría, tamaño, precio, stock, intensidad, familia, notas de salida/corazón/fondo, descripción, imagen y destacar | Editar cada campo, validar rangos y persistir | Matriz histórica D y 25 casos de readback; crear/editar exclusivamente QA remoto |
| ID oculto de producto | Elegir PUT al editar y no mezclar registros | Cambiar entre QA y otro QA; cancelar cambios; inspeccionar método/ID sin cuerpos privados |
| Guardar producto | Un envío, escritura y lectura de TODOS los campos antes de éxito | Doble clic, fallo antes/después de escritura, readback discrepante y recuperación |
| Editar / Eliminar por fila | Editar el ID correcto; borrar con confirmación y ausencia posterior | Recursos QA; mismas dimensiones; cancelación y doble clic |
| Cancelar edición / Limpiar | Restablecer formulario, ID, preview y etiquetas con aviso de cambios | Matriz D y recorrido remoto; no descartar silenciosamente |
| Buscador, botón Buscar, Enter, Limpiar | Nombre/marca parcial, acentos/espacios/mayúsculas, catálogo completo y estado conservado | Matriz B25 y recorrido remoto con nombres QA controlados |
| Disponibilidad baja / Ver todos | Incluir 0/1/2; excluir 3+, stock inválido no es cero | Matriz C25; productos exclusivos QA para comprobación remota |
| Imagen y Reintentar imagen | Preview validado corresponde a URL enviada; fallos/timeout no habilitan guardado | Matriz E30; fallos de red e imágenes interceptados sólo en navegador, nunca fetch SSRF servidor |
| Destacar | Guardar booleano y reflejar en Inicio | QA con nombre/ID controlado; retirar al limpiar |
| Cupones: código, porcentaje, activo, Guardar, Limpiar, Editar, Activar/Desactivar, Eliminar | Normalizar código, confirmar persistencia, preservar formulario ante error, no duplicar alta incierta | Casos FR nuevos, matriz F histórica y cupón QA inactivo de prueba |
| Opiniones: Buscar, puntuación, comentario, Guardar y Eliminar | Filtrar, validar, confirmar persistencia y moderar sólo opinión QA | Casos FR nuevos; opinión asociada a customer QA; no existe ocultar/publicar |
| Usuarios | Lectura de perfiles/roles autorizada | Abrir y verificar carga; no existe editor de roles/contraseñas |
| Consultas | Lectura; no enviar mensajes | Abrir y verificar carga sin capturar información personal |
| Pedidos | Lectura del historial existente | Abrir y verificar carga; no modificar ni crear pedidos comerciales |
| Cerrar sesión | Revocar sólo sesión QA y retirar cookies; negar Admin al salir | Botón real, red interrumpida y recuperación; verificación anónima |
| Confirmaciones y estados | No anunciar éxito ante HTTP200 discrepante o lectura fallida | Regresiones y fallos interceptados en navegador sobre recursos QA |
| Móvil/escritorio, teclado, foco, hover/táctil | Todos los controles disponibles, sin pérdida de funciones | Matriz previa 390/1440; recorrido remoto nuevo documentado por separado |
| Autorización API y datos | Rechazar anónimo/customer, origen incorrecto, métodos/campos manipulados | Pruebas de política existentes; QA remota sin cambiar Admin |

## Evidencia reutilizada

[201 ejecuciones locales previas](../admin-audit/matrix.md): áreas A28/B25/C25/D27/E30/F24, todas con al menos 20 casos distintos. Los [25 casos de persistencia](../../../test/admin-persistence.test.js) amplían D. Los [casos DR/FR](../../../test/admin-recovery.test.js) comprueban recuperación de altas y confirmación de cambios/borrados en módulos secundarios. Los nuevos resultados remotos se registran en `browser-results.json`; no se suman fixtures como si fueran Supabase real.

## Limitaciones vigentes al preparar este inventario

Publicación, reproducción autenticada del guardado y recorrido remoto final todavía pendientes. Los reportes privados del 29/10 acreditan las nueve fases del candidato, no la interfaz oficial publicada. No se prueba Safari físico ni se certifica una auditoría completa WCAG/performance. No se alteran datos comerciales.
