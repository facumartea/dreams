# DREAMS

DREAMS es una perfumería académica con catálogo, cuentas, carrito por usuario, opiniones y panel de administración. El checkout es una simulación: no cobra dinero, no guarda datos de tarjeta ni modifica el stock por una compra. El envío cuesta $0.

**Sitio oficial:** https://dreams-perfumes.pages.dev/

## Tecnologías

HTML, CSS y JavaScript en el navegador; Node.js y Express en el backend; Supabase Auth y PostgreSQL para cuentas y datos; Cloudflare Pages y Workers para la publicación. Node ejecuta JavaScript: el proyecto no utiliza Python.

Las referencias visuales incluyen Armani Beauty, Dior Argentina, Chanel, Creed y Unsplash. No se declara autoría sobre imágenes de terceros ni una licencia individual que no esté acreditada.

## Instalación y ejecución

Requisitos: Node.js **24.x**, pnpm **11.19.0** mediante Corepack y un Supabase de desarrollo con las migraciones de `app/supabase/migrations/` aplicadas en orden. Para usar Supabase local también hace falta Docker.

Desde la raíz:

```sh
cd app
corepack pnpm install --frozen-lockfile
cp .env.example .env
```

Completar `.env` o cargar las variables en el entorno privado del proceso:

| Variable | Uso |
|---|---|
| `SUPABASE_URL` | URL de la instancia de desarrollo. |
| `SUPABASE_SECRET_KEY` | Clave de servidor de esa misma instancia. |
| `NODE_ENV` | `development` para ejecución local. |
| `PORT` | `8080`. |
| `APP_BASE_URL`, `APP_ORIGINS` | `http://localhost:8080`. |
| `PRESENTATION_CHECKOUT_ENABLED` | `true` para probar el checkout académico. |
| `PRESENTATION_SIGNING_KEY` | Clave local aleatoria de al menos 32 caracteres. |
| `ACCOUNT_CART_ENABLED` | `true` para guardar el carrito por cuenta. |
| `ACCOUNT_CART_SIGNING_KEY` | Clave local de al menos 32 caracteres; si se omite, usa la de presentación. |
| `CONTACT_EMAIL`, `WHATSAPP_NUMBER` | Contacto opcional del entorno de desarrollo. |

Mantener `DEMO_AUTO_CONFIRM_EMAIL=false` y `GOOGLE_ACCESS_READY=false`. No usar producción para pruebas de escritura ni subir `.env` o claves a GitHub.

Arrancar desde `app/`:

```sh
corepack pnpm start
```

Abrir **http://localhost:8080**. El archivo de arranque es `app/server/server.js`; el estado de la conexión se consulta en `/api/health`. No se cargan productos ni se crean administradores automáticamente.

### Supabase local

En una copia nueva, desde `app/`:

```sh
npx --yes supabase@3.1.0 init
```

En el `supabase/config.toml` generado, usar un `project_id` exclusivo de desarrollo, `auth.site_url = "http://localhost:8080"` y `auth.email.enable_confirmations = false`. Son claves dentro de sus secciones TOML, no nombres literales de variables. Desactivar `db.seed.enabled` para no cargar datos de ejemplo.

```sh
npx --yes supabase@3.1.0 start --exclude studio,postgres-meta,realtime,storage-api,imgproxy,edge-runtime,logflare,vector,supavisor
```

El CLI aplica las migraciones sobre la instancia nueva. No aplicar además `schema.sql` ni el rollback. Cargar la URL y clave locales que devuelve el CLI mediante el entorno seguro; no copiar su salida en capturas o chats. La base comienza vacía: usar únicamente cuentas y productos ficticios.

Para probar Admin, registrar una cuenta local y asignar el rol a su UUID **solo en esa base de desarrollo**, desde su editor SQL o `psql`:

```sql
update public.profiles set role = 'admin' where id = 'UUID_DE_TU_CUENTA_LOCAL';
```

Cerrar sesión e ingresar de nuevo. No hay contraseña Admin predeterminada. La [documentación de Supabase local](https://supabase.com/docs/guides/local-development/cli/getting-started) explica los requisitos de Docker y los servicios.

### Controles disponibles

Desde `app/`:

```sh
corepack pnpm run check
corepack pnpm run check:functions
corepack pnpm run build:cloudflare
corepack pnpm run build:pages
corepack pnpm run build:official
```

También se pueden ejecutar juntos con `corepack pnpm run ci`. Los builds no publican. La suite de tests fue retirada: estos controles comprueban sintaxis, límite de 40 líneas y empaquetado, pero no sustituyen pruebas de los recorridos conectados. El backend oficial entra por `app/worker/official.mjs`; las herramientas de publicación conservan sus verificaciones previas.

## Manual de uso

**Cliente:** en Cuenta, elegir Registro, completar nombre, correo y contraseña y seguir el resultado que devuelva Auth. Para entrar, usar correo y contraseña; para salir, Cerrar sesión. Navegar por Perfumes o las colecciones y combinar búsqueda, filtros y orden. Abrir un producto para ver sus datos o agregarlo al carrito. El carrusel de Inicio se recorre con botones, teclado o deslizamiento.

En el carrito, cambiar cantidades o quitar productos. Aplicar un cupón con el botón o Enter; Quitar cupón lo retira. El servidor confirma disponibilidad y totales. Con sesión, el carrito queda asociado a la cuenta. Comprar abre el checkout académico: usar datos ficticios, continuar y revisar la referencia de confirmación. Ante un error, conservar el carrito y reintentar. WhatsApp abre un enlace con el resumen; no envía mensajes automáticamente. Las opiniones se publican con sesión y cada usuario puede eliminar las propias.

**Administrador:** ingresar con una cuenta autorizada y abrir `/admin`. El panel incluye Productos, Disponibilidad baja, Usuarios, Consultas, Opiniones, Pedidos y Cupones. Usuarios, consultas y pedidos son de lectura. El acceso depende del rol validado en servidor.

En Productos, buscar por nombre o marca; Disponibilidad baja muestra stock de 0, 1 o 2. Para crear o editar, completar marca, nombre, género, tipo, tamaño, precio, stock, notas, descripción e imagen. La imagen se guarda como URL HTTPS directa o ruta de un asset local permitido. Esperar la vista previa válida y pulsar Guardar: el panel vuelve a leer los datos antes de confirmar. Destacar en Inicio incorpora el producto a esa selección. Cancelar o Limpiar sale de la edición; Eliminar solicita confirmación. Los cupones permiten alta, edición y eliminación; las opiniones, moderación. Si falla una carga o guardado, revisar el mensaje y reintentar sin repetir un alta a ciegas.

## API externa y recorrido

Se usa [Supabase](https://supabase.com/docs/reference/javascript/introduction): Auth gestiona registro, login y sesiones; su API de datos permite consultar PostgreSQL mediante `@supabase/supabase-js`. El recorrido es navegador → API Express → Supabase. La clave de servidor queda en backend.

Ejemplos de la API propia: `GET /api/products` consulta el catálogo; `POST /api/auth/login` inicia sesión; `GET/POST /api/cart/account` opera el carrito propio; `POST /api/cart/quote` valida importes y cupón; `POST /api/presentation/session`, `/payment` y `/result` completan la simulación firmada. Las rutas `/api/admin/` exigen rol administrador. WhatsApp es un enlace `wa.me`, no una API de mensajería. No se incluyen proveedores de cobro comercial.

## Documentación

- [Wireframe y mapa de navegación](docs/wireframe/wireframes.pdf).
- [Diseño de base de datos y D.E.R.](docs/base-de-datos/der.pdf).
- [Declaración y registro parcial de prompts](DECLARACION_PROMPTS.md).

## Integrantes

Martearena y Ruas.
