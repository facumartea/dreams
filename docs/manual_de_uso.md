# Manual de uso DREAMS

## Visitante

1. Abrir la oficial `https://dreams-perfumes.pages.dev/` o la preview indicada en `rubric_validation.md`. Identificar el entorno antes de probar.
2. Inicio conserva la portada estática y “Descubrir perfumes”. La preview de rúbrica incluye un carrusel manual de productos en Más buscados; usar Anterior/Siguiente con mouse, teclado o toque, o deslizar el listado.
3. En Perfumes, buscar por nombre/marca/familia y filtrar por marca, género, categoría o precio según controles existentes. Cambiar orden y limpiar filtros. Si no hay resultados, ajustar consulta; si falla la red, Reintentar.
4. Abrir un producto para ver imagen, notas, tamaño, intensidad y precio. Agregar productos disponibles al carrito.
5. En Carrito, aumentar/reducir cantidad, eliminar una fila o vaciar. El contador se actualiza y la selección visitante se conserva al recargar en el mismo navegador. El servidor vuelve a consultar disponibilidad/precios; un error impide continuar hasta reintentar.
6. En el flujo académico, envío gratis, total igual a subtotal. Continuar en checkout con los datos necesarios del comprador y ver la confirmación/referencia conservada al recargar. No ingresar una tarjeta real durante QA. La demostración no crea un pedido comercial ni descuenta stock.
7. WhatsApp abre el contacto configurado con resumen; revisar antes de enviar. Las pruebas no envían mensajes. Contactos incluyen los dos correos y teléfonos existentes.
8. Mi cuenta conserva login/registro. Confirmar correo cuando Supabase lo solicite. La sesión habilita opiniones; no inventar reseñas para verificar datos reales. Cerrar sesión al terminar.

## Administrador

1. Entrar por `/cuenta.html?admin=1` con una cuenta realmente autorizada. El panel está en `/admin`; no hay usuario/contraseña en este manual.
2. El servidor verifica el rol del perfil. Un visitante o customer recibe403; ocultar controles no reemplaza esta autorización.
3. Productos: el campo “Buscar por nombre o marca” acepta coincidencia parcial, ignora mayúsculas/tildes/espacios exteriores. Limpiar búsqueda restaura orden/lista. No busca por descripción/precio/stock.
4. Editar conserva ID; completar campos y URL HTTPS directa. Vista previa valida la imagen, muestra error y permite reintento. Un enlace a una página compartida puede no ser una imagen; URLs firmadas pueden vencer aunque carguen hoy. No es obligatorio terminar en .jpg/.png.
5. Guardar espera la comprobación de la URL actual y bloquea doble envío/cambios mientras está pendiente. Editar precio u otros campos conserva la URL existente. Recargar y verificar catálogo/detalle **sólo con producto de prueba autorizado**.
6. Cupones permite operaciones existentes, Opiniones edición/eliminación, Pedidos lectura/estado, Usuarios perfiles y Consultas lectura. Nunca borrar datos reales para demostrar el panel.
7. En preview read-only las escrituras comerciales están bloqueadas incluso para Admin. La QA de guardado de esta revisión se hizo localmente con fixture, no sobre productos reales. No cambiar permisos para poder guardar.
8. Cerrar sesión. Si se olvidó la contraseña, usar el procedimiento seguro de la cuenta confirmada; no puede recuperarse desde un hash. Google/recovery remoto siguen pendientes de configuración/verificación.

La integración de carrito por cuenta está en otra PR y no está activa en esta base: no asumir aislamiento entre cuentas a partir de la selección visitante. Para instalar localmente ver `documentacion.md`; puerto por defecto8080, tests con fixtures sin secretos reales.
