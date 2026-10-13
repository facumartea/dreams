# Pseudocódigo de los flujos actuales

## Catálogo y carrusel

Leer filtros → sincronizar URL/navegación → incrementar ID de consulta → pedir `/api/products` → ignorar respuesta si hay consulta más reciente → mostrar resultados o error/reintento. Inicio pide hasta ocho productos reales, crea tarjetas y controles del carrusel manual. Al avanzar, desplazar una tarjeta; movimiento reducido usa desplazamiento inmediato. No autoplay.

## Carrito visitante y cotización

Leer almacenamiento con validación → agregar/ajustar/eliminar sin superar límite local → guardar selección y contador → pedir cotización con IDs/cantidades → servidor consulta DB y recalcula stock/precios → ignorar respuestas obsoletas → actualizar filas/resumen o bloquear continuación y ofrecer reintento. En flujo académico, envío cero/total=subtotal. No es aislamiento de carrito por cuenta; esa integración sigue separada.

## Checkout académico

Validar carrito y comprador, sin leer tarjeta → bloquear doble envío → recuperar intento v2 o generar UUID criptográfico → persistir intento antes de pedir sesión → recibir ticket firmado ligado a dueño/vencimiento → conservar ticket para retry → pedir confirmación con ticket → guardar recibo firmado → mostrar referencia estable/productos/envío gratis/total → vaciar selección sólo si coincide con la confirmada. No escribir orders/stock ni llamar a pasarela.

## Acceso y permisos

Enviar credenciales sólo por HTTPS a API → cliente SDK aislado verifica con Supabase Auth → consultar profiles.role → emitir cookies HttpOnly/Secure → responder sólo datos públicos del usuario. Restaurar con getUser/refresh antes de usar rol. Para Admin exigir perfil admin y usar JWT/RLS. Logout revoca sesión local y vence cookies. No hash cliente, ni password en storage/logs/respuestas. Google preparado permanece deshabilitado hasta verificación; recovery público pendiente.

## Buscador Admin e imagen

Cargar listado completo con ID de petición → ignorar respuestas viejas → normalizar consulta NFD/minúsculas/trim → conservar producto si nombre O marca contiene consulta → mostrar conteo/empty/limpiar, manteniendo orden/acciones.

Editar carga mismo ID y URL → al cambiar URL invalidar comprobación inmediatamente → debounce → validar sintaxis HTTPS/local → cargar imagen nativa con token y timeout → ignorar callbacks atrasados → permitir guardar sólo si URL comprobada coincide con la actual → bloquear formulario durante guardado → API valida campos/JWT/RLS → persistir URL sin alterar otros datos → recargar listado. Errores conservan estado útil y permiten reintento; no fetch arbitrario desde servidor.
