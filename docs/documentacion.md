# Documentación técnica DREAMS

## Arquitectura

El proyecto utiliza una arquitectura cliente-servidor simple.

El frontend está en `public/` y se comunica con Node.js mediante endpoints REST bajo `/api`.

Node.js utiliza Express para recibir solicitudes HTTP y better-sqlite3 para leer y escribir la base de datos SQLite.

## Base de datos

Tablas:

- `users`: usuarios y administradores.
- `products`: catálogo completo.
- `favorites`: relación entre usuarios y perfumes favoritos.
- `reviews`: opiniones publicadas.

## API propia

### Productos

`GET /api/products`

Devuelve todos los perfumes y permite filtros por `search`, `brand`, `gender`, `category` y `sort`.

`GET /api/products/:id`

Devuelve un perfume individual.

`GET /api/brands`

Devuelve las marcas disponibles.

### Autenticación

`POST /api/auth/register`

`POST /api/auth/login`

`POST /api/auth/logout`

`GET /api/auth/me`

### Favoritos

`GET /api/favorites`

`POST /api/favorites/:product_id`

El usuario necesita iniciar sesión.

### Opiniones

`GET /api/reviews`

`POST /api/reviews`

### Administrador

`GET /api/admin/products`

`POST /api/admin/products`

`PUT /api/admin/products/:id`

`DELETE /api/admin/products/:id`

Estos endpoints verifican que el usuario tenga `is_admin = 1`.

## Seguridad básica

- Contraseñas con hash bcrypt.
- Sesiones mediante `express-session`.
- Cookies HTTP-only.
- Validación de permisos para rutas de administrador.
- Helmet para headers de seguridad.
- `.env` para secretos y credenciales.

## Carrito

El carrito se guarda en `localStorage` con la clave `dreams_cart`.

Se actualiza al agregar, eliminar o modificar cantidades.

El total se calcula recorriendo los productos y multiplicando precio por cantidad.

## Diseño

La identidad utiliza una estética minimalista y editorial inspirada en perfumería de lujo.

El logotipo visual de la marca es la palabra DREAMS, mientras que el isotipo de nube y estrellas se conserva como recurso de identidad para futuras aplicaciones.

La tipografía principal del sitio usa Cormorant Garamond para títulos y Inter para interfaz.

## Despliegue en la nube

DREAMS está preparado para Railway. El servidor escucha en `0.0.0.0`, usa `process.env.PORT`, tiene healthcheck en `/api/health` y guarda SQLite en `DATABASE_DIR` o `RAILWAY_VOLUME_MOUNT_PATH`. De esta forma el proyecto puede publicarse con un dominio de Railway y ser utilizado desde otros dispositivos.
