# Guía breve para entender y defender DREAMS

Material de práctica basado en el código real. No demuestra que los integrantes ya lo dominen ni atribuye decisiones personales a nadie.

| Tema | Recorrido y archivos | Qué justificar |
|---|---|---|
| Arquitectura/API | Navegador → `/api` → Pages → Worker privado → Express → Supabase; `pages/proxy.mjs`, `worker/official.mjs`, `server/app.js`, `worker/official-client.mjs` | Por qué la clave de servidor no llega al navegador y WhatsApp no es una API de mensajería. |
| Registro/login | `public/js/cuenta.js`, `server/customer-registration.js`, rutas de Auth de `server/app.js`, `server/auth-cookies.js` | Supabase gestiona contraseñas; el servidor valida, crea perfil customer, sólo emite sesión si el proveedor la devuelve y renueva cookies. No se elige rol desde el formulario. |
| Admin | Guard `admin` en `server/app.js`, `admin_database(request)` y políticas SQL | Autorización por sesión y perfil, no por esconder botones ni metadata editable. El JWT limita las consultas administrativas. |
| Productos/imágenes | `public/js/admin.js`, `admin-image-url.js` y rutas de Admin | Una URL de imagen se valida/previsualiza; guardar escribe y hace lectura posterior antes del éxito. No duplicar altas si se pierde una respuesta. |
| Carrito | `public/js/account-cart.js`, `server/account-cart.js`, RPC `dreams_cart_operation` | UUID dueño, contexto firmado, cola/revisión/generación e idempotencia; precios del servidor; merge de visitante sin repetir cantidades. |
| Opiniones propias | `server/reviews.js` | Autor desde sesión, UUID de operación y borrado con JWT más filtro de dueño; RLS no se sustituye por ocultar controles. |
| Checkout académico | `server/presentation-checkout.js`, `public/js/presentation.js`, `academic-inputs.js` | Máscaras sólo locales; no tarjeta en red/storage; cupón/importes revalidados; ticket/recibo firmados, referencia estable y doble envío protegido. No cobro, pedido comercial ni stock descontado. |

## Preguntas de práctica

1. ¿Qué diferencia hay entre un 401 y un 403? ¿Dónde se decide cada uno?
2. ¿Por qué una respuesta 200 aislada no prueba que se guardaron todos los campos?
3. ¿Qué impide que una operación pendiente del carrito A se aplique a B?
4. ¿Por qué `orders.items` y `account_carts.items` no son FK a cada producto?
5. ¿Cómo se preservan los reintentos sin enviar una tarjeta ni consumir usos comerciales?
6. ¿Cómo garantiza el build de Pages que checkout.js y los demás scripts correspondan a la versión aprobada?
7. ¿Qué cambió en la RPC del carrito y por qué se conserva la migración histórica? ¿Cómo se probaron permisos y concurrencia?

## Cambios pequeños y seguros, sólo localmente

- Agregar un caso de test de stock inválido y predecir su respuesta antes de ejecutar.
- Simular un fallo de red con fixtures y comprobar que no se anuncia guardado.
- Cambiar un texto en una copia local y verificar semántica/teclado, sin publicar.
- Ejecutar un test que intente borrar la opinión ajena y explicar el rechazo.
- Dibujar el recorrido de la sesión y señalar qué información nunca debe proyectarse en pantalla.

Cada integrante debe registrar lo que efectivamente practicó, con fecha real. No registrar ejercicios como realizados antes de hacerlos. No ejecutar seeds ni usar datos comerciales, contraseñas o tarjetas reales.
