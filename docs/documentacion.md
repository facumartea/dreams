# Documentación técnica DREAMS

## Arquitectura

El frontend multipágina vive en `public/` y consume una API REST Express bajo `/api`. El servidor usa `@supabase/supabase-js` para Postgres y Supabase Auth. Las sesiones se mantienen en cookies HTTP-only de acceso y renovación; el carrito permanece en `localStorage` y no es una orden ni un pago.

La definición versionada de datos está en `supabase/migrations/`. `supabase/schema.sql` es sólo un snapshot legacy y no debe usarse como fuente de despliegue.

## Datos y seguridad

Las tablas activas son `profiles`, `products`, `favorites`, `reviews` e `inquiries`. La baseline declara claves foráneas, unicidad de favorito por usuario/producto, índices, triggers y RLS. La aplicación de servidor usa una clave secreta de Supabase; esa clave jamás debe exponerse al navegador.

Helmet aplica CSP, las escrituras sensibles requieren sesión/rol, auth y consultas tienen rate limit, y los datos dinámicos se escapan antes de insertarse en HTML. Los roles se leen de `profiles.role`, no de metadata controlable por el usuario.

## API

### Catálogo

- `GET /api/products` — filtros `search`, `brand`, `gender`, `category`, `max_price` y `sort`.
- `GET /api/products/:id`
- `GET /api/brands`

### Autenticación

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Favoritos autenticados

- `GET /api/favorites` — productos guardados.
- `GET /api/favorites/ids` — IDs para sincronizar la interfaz.
- `GET /api/favorites/:id/check`
- `PUT /api/favorites/:id` — guarda de forma idempotente.
- `DELETE /api/favorites/:id` — quita de forma idempotente.

### Opiniones y consultas

- `GET /api/reviews`
- `POST /api/reviews` — requiere sesión.
- `POST /api/inquiries`

### Administración

- `GET /api/admin/stats`
- CRUD en `/api/admin/products`
- `GET /api/admin/users`
- `GET /api/admin/inquiries`
- `GET /api/admin/reviews`

Estas rutas exigen un perfil con `role = 'admin'`.

### Operación

- `GET /api/config` — configuración pública permitida.
- `GET /api/health` — readiness de API y Supabase.

## Límites actuales

No existen pagos, órdenes, recuperación de contraseña, uploads ni observabilidad completa. La baseline debe probarse contra un Supabase controlado antes de considerarla verificada en producción. Consultar `CURRENT_STATE.md` y `AUDIT.md` para el detalle vigente.
