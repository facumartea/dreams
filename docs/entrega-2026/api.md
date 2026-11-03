# API externa y recorrido

API externa consumida: **Supabase Data API y Auth**, documentación pública:

- https://supabase.com/docs/guides/api
- https://supabase.com/docs/reference/javascript/select
- https://supabase.com/docs/reference/javascript/auth-signup
- https://supabase.com/docs/reference/javascript/auth-signinwithpassword
- https://supabase.com/docs/guides/database/postgres/row-level-security

El navegador llama al mismo origen `/api`. Pages conserva método, cuerpo, cookies y origen y reenvía a un backend aprobado. Express valida entrada, origen y sesión; el SDK `@supabase/supabase-js` llama a Auth/Data API. PostgreSQL aplica constraints y RLS. El cliente del Admin utiliza JWT de la sesión autorizada; las operaciones privilegiadas se limitan en el backend. Nunca se envía la clave de servidor al navegador.

Ejemplo público sin autenticación:

```sh
curl 'https://dreams-perfumes.pages.dev/api/products?limit=2'
```

Respuesta ilustrativa, no un precio ni un resultado remoto certificado:

```json
[{"id":1,"brand":"Marca de prueba","name":"Producto QA","price":100,"stock":2}]
```

Registro normal: formulario → `POST /api/auth/register` → `auth.signUp` → perfil customer → cookies si Supabase devuelve sesión. Login usa `signInWithPassword`; recarga valida `getUser`, refresh renueva y logout revoca sesión/cookies. No se utiliza `createUser` administrativo como bypass en el candidato oficial. La existencia de estas rutas no acredita QA remota exitosa: ver [pruebas](pruebas.md).

Admin: `GET /api/admin/{stats,products,users,inquiries,reviews,orders,coupons}`. Productos y cupones permiten alta/edición/borrado; opiniones permiten moderación. Usuarios, consultas y pedidos son de lectura: no inventar botones de modificar roles o pedidos. Antes de anunciar guardado, se confirma respuesta y una lectura de todos los campos del producto.

Carrito: `GET/POST /api/cart/account`, operación UUID idempotente sobre RPC, sin precios confiados desde navegador. Opiniones: POST asociado a sesión, DELETE propio validado por API. Checkout académico: `POST /api/presentation/{session,payment,result}` intercambia referencias firmadas; datos ficticios de tarjeta quedan en navegador y no hay orden comercial ni descuento de stock.

**WhatsApp es un enlace `wa.me`**, no una API de mensajería integrada. Abre destinatario y texto preparado; el usuario decide si lo envía. En las pruebas no se enviaron mensajes. Mercado Pago permanece como código histórico/preparado, sin habilitar cobros ni usarlo como API efectivamente probada de esta entrega.
