# DREAMS · Perfumería multimarca

DREAMS es un sitio académico de perfumes. Permite ver el catálogo, crear una cuenta, usar un carrito propio, dejar opiniones y gestionar productos desde el panel Admin. La compra es una simulación: no cobra dinero ni descuenta stock comercial. El envío de la simulación cuesta $0.

**Página oficial:** https://dreams-perfumes.pages.dev/

Este README reúne la instalación, el manual de uso y la explicación de la API para no repetirlos en varios documentos. El [diseño de base de datos](docs/base-de-datos.md), el [wireframe](#wireframe-y-mapa-de-navegacion) y la [declaración y registro parcial de prompts](docs/registro-prompts.md) siguen separados. Los diseños son documentación retrospectiva del sitio implementado.

## Qué hay en cada carpeta

```text
DREAMS/
├── README.md                Instalación, manual y explicación general
├── app/                     Aplicación y herramientas necesarias
│   ├── public/              Páginas HTML, estilos, scripts e imágenes
│   ├── server/              API Express: sesiones, permisos y datos
│   ├── worker/              Entrada del backend en Cloudflare
│   ├── pages/               Proxy y metadatos de la web oficial
│   ├── views/               HTML del panel protegido
│   ├── templates/           Pie de página compartido
│   ├── supabase/            Esquema SQL, migraciones y rollback
│   ├── scripts/             Checks, builds y herramientas
│   ├── test/                Pruebas y datos ficticios
│   └── configuración       package.json, pnpm, .env.example y Wrangler
├── docs/
│   ├── base-de-datos.md     Explicación del esquema y sus límites
│   ├── base-de-datos/       D.E.R. y fuente editable
│   ├── wireframe/           Pantallas, mapa y fuentes editables
│   └── registro-prompts.md  Declaración de IA e historial disponible
└── .github/workflows/       Comprobaciones automáticas de GitHub
```

Node.js ejecuta JavaScript; no es Python. Este repositorio no tiene código Python. `server/server.js` arranca el servidor local y `worker/official.mjs` recibe las solicitudes del backend oficial. `server/app.js` organiza Express y las rutas. El HTML del Admin está fuera de `public/` porque necesita control de acceso.

Las funciones propias usan nombres como `agregar_perfume_al_carrito`, `guardar_perfume` y `verificar_acceso_al_panel`. Los guiones bajos separan palabras. Los comentarios explican reglas y cuidados en español, en minúsculas y sin tildes. Los nombres que exige una biblioteca, un método HTTP o un contrato de datos se conservan: por ejemplo `fetch`, `getUser`, `select`, `POST` y `image_url`. Cambiarlos por estética rompería la integración. Las migraciones aplicadas conservan su texto histórico.

## Cómo leer el código para practicar

Una función reúne una tarea y recibe datos entre paréntesis. `return` entrega el resultado; `throw` avisa un error que otra parte debe manejar. `async` y `await` permiten esperar una consulta sin bloquear todo el servidor. En las rutas, `solicitud` contiene los datos recibidos, `respuesta` arma la salida y `siguiente` deja continuar al control que sigue.

Un nombre como `{ create_app: crear_aplicacion }` conserva el nombre de intercambio del módulo y usa uno más claro dentro del archivo. `get`, `post`, `put` y `delete` son métodos de Express: indican leer, crear, actualizar o eliminar según la ruta. No son nombres libres para traducir. Los métodos propios que mantienen una interfaz compartida conservan su nombre y tienen comentarios que explican su tarea. No hay decoradores de Python: las rutas se registran con Express y middleware.

## Instalar y ejecutar localmente

Se necesita Node.js 24.x y pnpm 11.19.0 mediante Corepack. Desde la raíz, entrar primero en `app/`:

```sh
cd app
corepack pnpm install --frozen-lockfile
corepack pnpm run check
corepack pnpm run check:functions
corepack pnpm test
corepack pnpm run build:pages
corepack pnpm run build:official
```

Estos comandos revisan y construyen; no publican. Funcionan desde una carpeta sin `.git` y sin secretos reales. Los casos SQL requieren PostgreSQL aislado de prueba y se omiten si no está configurado. El inventario cuenta líneas físicas de funciones, métodos y callbacks, incluidos comentarios y líneas vacías; el límite es 40. No cuenta dependencias ni generados. El reporte opcional `corepack pnpm run check:functions -- --write` queda en `app/dist/`, fuera de Git.

Para ejecutar el servidor conectado, copiar `app/.env.example` a `app/.env`, completar un proyecto Supabase de desarrollo autorizado y ejecutar, desde `app/`:

```sh
corepack pnpm start
```

La dirección local predeterminada es `http://localhost:8080`; el panel es `/admin`. No hay una contraseña Admin predeterminada. Nunca subir `.env`, usar claves de capturas ni conectar pruebas a datos comerciales. No ejecutar seeds, resets o migraciones sobre producción para practicar. El esquema histórico usa `brand` y la base documentada usa `marca`: revisar el adaptador y las migraciones antes de reproducirla.

## Cómo se conecta la base de datos y qué API usamos

El recorrido es **navegador → `/api` → Pages/proxy → Worker privado → Express → Supabase**. En local, Express atiende directamente. Supabase aporta Auth y la Data API sobre PostgreSQL. El backend crea su cliente con `SUPABASE_URL` y `SUPABASE_SECRET_KEY`; la clave de servidor nunca se entrega al navegador ni se guarda en código. Una página HTML muestra una pantalla; un endpoint recibe una solicitud y devuelve datos o un resultado.

Documentación pública de la API externa:

- [Data API](https://supabase.com/docs/guides/api) y [consulta con select](https://supabase.com/docs/reference/javascript/select).
- [Registro con signUp](https://supabase.com/docs/reference/javascript/auth-signup) y [login con signInWithPassword](https://supabase.com/docs/reference/javascript/auth-signinwithpassword).
- [Permisos RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).

Un ejemplo de lectura pública es `GET /api/products?limit=2`. Registro usa `POST /api/auth/register`; login, `POST /api/auth/login`; sesión, `GET /api/auth/me`; y salida, `POST /api/auth/logout`. Supabase gestiona el hash de contraseñas. HTTPS protege el transporte; no reemplaza los permisos. El control de origen rechaza escrituras desde sitios no permitidos y el servidor comprueba sesión y rol. Ocultar un botón no autoriza una operación.

Admin lee `/api/admin/stats`, `products`, `users`, `inquiries`, `reviews`, `orders` y `coupons`. Productos y cupones permiten alta, edición y borrado; opiniones permiten moderación. Usuarios, consultas y pedidos son de lectura. El carrito usa `GET/POST /api/cart/account`: UUID de sesión, revisión e identificador de operación evitan mezclar cuentas o duplicar cambios. Precios, stock y descuentos se recalculan en servidor. La eliminación de una opinión propia también exige ser su dueño en la API y la base.

El checkout académico usa `POST /api/presentation/session`, `/payment` y `/result`: intercambia tickets y referencias firmadas. No envía ni guarda número de tarjeta, vencimiento o CVV. El código Mercado Pago/demo conservado es independiente y no acredita cobros habilitados en la oficial. **WhatsApp es un enlace `wa.me`, no una API de envío automático.**

## Manual de uso

### Inicio, catálogo y detalle

El menú abre Perfumes, Mujer, Hombre, Unisex, Nosotros, Cuenta y Carrito. En móvil se despliega el menú; con teclado se usa Tab y Enter. La portada sigue siendo estática. El carrusel de productos destacados es manual: Anterior/Siguiente, flechas del teclado con el listado enfocado e Inicio/Fin. En móvil admite deslizamiento. No tiene autoplay y respeta movimiento reducido. El indicador de posición es sólo para lectores de pantalla. No hay sección de vistos recientemente ni bloque «Tres formas de empezar».

En catálogo se busca por nombre o marca y se combinan los filtros disponibles de marca, género, tipo y precio. El selector cambia el orden y Limpiar restablece la búsqueda. Las cabeceras de colecciones conservan título y filtros, sin los párrafos descriptivos retirados. El detalle muestra imagen, tamaño, precio, stock, notas y descripción del producto. Una imagen alternativa no prueba que se haya perdido su URL en la base.

### Registro, login y salida

En Cuenta, elegir Registro y completar nombre, correo, contraseña y repetición. La aplicación sólo anuncia sesión si Supabase realmente la devuelve. Si se interrumpe el registro, revisar el mensaje y probar login antes de repetirlo. Para entrar, usar correo y contraseña; para salir, Cerrar sesión. Las cookies mantienen y renuevan la sesión. Ante un fallo de red al salir, reintentar y comprobar el estado antes de dejar un equipo compartido.

Los botones se bloquean mientras envían. Un visitante y un cliente sin rol no pueden entrar al panel. No se deben editar datos del navegador para intentar cambiar permisos.

### Carrito, cupón y compra académica

Se puede agregar, cambiar cantidades, quitar o vaciar. El visitante conserva un carrito local; al iniciar sesión se combina con el de la cuenta sin repetir una operación ya procesada. Otra cuenta debe mostrar su propio carrito. Esperar la sincronización antes de comprar.

En «Cupón de descuento», escribir un código existente y pulsar Aplicar o Enter. Quitar elimina el descuento; volver a aplicar no lo acumula. El servidor revisa estado, vigencia, mínimo y límites disponibles, también al cambiar cantidades. Si falla la red, usar Reintentar antes de Comprar. Productos, descuento, Envío ($0) y total deben coincidir en carrito, checkout y confirmación.

Comprar abre una simulación. Usar sólo datos ficticios: titular vacío con placeholder CLIENTE DREAMS; número de 16 dígitos; vencimiento MM/AA con mes 01–12; CVV de 3 dígitos, incluidos ceros iniciales. El nombre permite espacios, tildes, guiones y apóstrofes. Se puede pegar y corregir. Sólo se valida el formato local, sin consultar bancos. No ingresar tarjetas reales.

Pulsar Continuar una vez y conservar la referencia. Una recarga retoma el intento sin duplicarlo. Si falla, el carrito se conserva. No se crean pedidos comerciales, no se descuenta stock ni se consumen usos de cupones como compra pagada. WhatsApp abre destinatario y resumen para revisar; el usuario decide si lo envía.

### Opiniones

Con sesión iniciada, elegir puntuación de 1 a 5 y comentario. Se asocia al usuario verificado. Eliminar propio pide confirmación; no se puede borrar una opinión ajena cambiando la petición. Ante un fallo, revisar el listado antes de repetir. Admin conserva su moderación.

### Panel Admin y guardado

Entrar con la cuenta autorizada existente, desde Cuenta o `/admin`. No crear administradores ni cambiar roles o contraseñas para probar. El panel tiene Productos, Usuarios, Consultas, Opiniones, Pedidos, Disponibilidad baja y Cupones. Las tarjetas muestran sus módulos y conteos; Reintentar recupera una carga fallida. Tab y Enter/Espacio permiten navegar.

En Productos, Buscar/Enter filtra nombre o marca; Limpiar restablece. Disponibilidad baja incluye stock de 0, 1 o 2. Para alta o edición se completan marca, nombre, género, tipo, tamaño, precio, stock, intensidad, familia, notas, descripción, imagen y Destacar en Inicio. Precio y stock no pueden ser negativos; stock y tamaño deben ser enteros válidos.

La imagen debe ser una URL HTTPS directa o un asset local permitido. Una página de búsqueda no sirve. La vista previa bloquea Guardar mientras carga o falla; corregir y Reintentar. Una respuesta atrasada no valida una URL nueva. Los enlaces firmados pueden vencer: preferir enlaces permanentes. Editar otro campo conserva la imagen; Cancelar/Limpiar avisa de cambios pendientes. Editar y Eliminar mantienen igual tamaño.

Guardar espera la escritura y una lectura posterior de los campos. Si la comprobación falla, no anuncia éxito y conserva el formulario. Ante un alta incierta, consulta antes de repetirla para evitar duplicados. Recargar y comprobar panel, catálogo, detalle y conteos. Eliminar es permanente y pide confirmación. Practicar sólo con recursos exclusivos de prueba.

Cupones permite crear, editar, guardar, limpiar y eliminar; normaliza el código en mayúsculas y comprueba la persistencia. Opiniones permite editar puntuación/comentario y eliminar, con comprobación posterior. Pedidos, Usuarios y Consultas muestran información existente; no tienen controles para cambiar roles, contraseñas ni estados de pedidos. No generar compras comerciales para llenar el panel.

### Errores habituales

Un 401 indica sesión o credencial no válida; un 403, acceso rechazado; un 503 puede indicar una dependencia no disponible. Revisar el mensaje, la conexión y el listado antes de repetir escrituras. No compartir claves, cookies o headers. Que el catálogo cargue no demuestra que registro, login y guardado funcionen. Estas instrucciones describen el comportamiento del código; no sustituyen una prueba remota autenticada de esta versión.

## Wireframe y mapa de navegación

Documentación retrospectiva: no se presenta como una preentrega anterior al desarrollo ni acredita participación individual.

- [Wireframe PDF, 17 láminas](docs/wireframe/wireframes.pdf).
- Mapa: [PDF](docs/wireframe/mapa-navegacion.pdf), [PNG](docs/wireframe/mapa-navegacion.png), [fuente DOT](docs/wireframe/mapa-navegacion.dot).

| Pantalla | Ruta visible | PNG | Fuente SVG editable |
|---|---|---|---|
| Inicio | `/` | [PNG](docs/wireframe/wireframe-01.png) | [SVG](docs/wireframe/01-inicio.svg) |
| Catálogo | `/catalogo.html` | [PNG](docs/wireframe/wireframe-02.png) | [SVG](docs/wireframe/02-catalogo.svg) |
| Diálogo de filtros | `Catálogo → Filtros` | [PNG](docs/wireframe/wireframe-03.png) | [SVG](docs/wireframe/03-filtros.svg) |
| Detalle | `/producto.html?id=…` | [PNG](docs/wireframe/wireframe-04.png) | [SVG](docs/wireframe/04-detalle.svg) |
| Login | `/cuenta.html` | [PNG](docs/wireframe/wireframe-05.png) | [SVG](docs/wireframe/05-login.svg) |
| Registro | `/cuenta.html → Crear cuenta` | [PNG](docs/wireframe/wireframe-06.png) | [SVG](docs/wireframe/06-registro.svg) |
| Carrito | `/carrito.html` | [PNG](docs/wireframe/wireframe-07.png) | [SVG](docs/wireframe/07-carrito.svg) |
| Checkout | `/checkout.html` | [PNG](docs/wireframe/wireframe-08.png) | [SVG](docs/wireframe/08-checkout.svg) |
| Confirmación | `/checkout-resultado.html?presentation=1` | [PNG](docs/wireframe/wireframe-09.png) | [SVG](docs/wireframe/09-confirmacion.svg) |
| Nosotros / contacto | `/nosotros.html` | [PNG](docs/wireframe/wireframe-10.png) | [SVG](docs/wireframe/10-nosotros.svg) |
| Admin · Productos | `/admin · acceso condicionado por rol` | [PNG](docs/wireframe/wireframe-11.png) | [SVG](docs/wireframe/11-admin-productos.svg) |
| Admin · Disponibilidad baja | `/admin · acceso condicionado por rol` | [PNG](docs/wireframe/wireframe-12.png) | [SVG](docs/wireframe/12-admin-disponibilidad-baja.svg) |
| Admin · Cupones | `/admin · acceso condicionado por rol` | [PNG](docs/wireframe/wireframe-13.png) | [SVG](docs/wireframe/13-admin-cupones.svg) |
| Admin · Pedidos | `/admin · acceso condicionado por rol` | [PNG](docs/wireframe/wireframe-14.png) | [SVG](docs/wireframe/14-admin-pedidos.svg) |
| Admin · Usuarios | `/admin · acceso condicionado por rol` | [PNG](docs/wireframe/wireframe-15.png) | [SVG](docs/wireframe/15-admin-usuarios.svg) |
| Admin · Consultas | `/admin · acceso condicionado por rol` | [PNG](docs/wireframe/wireframe-16.png) | [SVG](docs/wireframe/16-admin-consultas.svg) |
| Admin · Opiniones | `/admin · acceso condicionado por rol` | [PNG](docs/wireframe/wireframe-17.png) | [SVG](docs/wireframe/17-admin-opiniones.svg) |

## Diseño de base de datos y registro de IA

- [Explicación y diccionario](docs/base-de-datos.md), [D.E.R. PDF](docs/base-de-datos/der.pdf), [PNG](docs/base-de-datos/der.png), [fuente DOT](docs/base-de-datos/der.dot) y [esquema documentado](docs/base-de-datos/esquema.json).
- [Declaración de IA y registro parcial de prompts](docs/registro-prompts.md). Conserva originales disponibles, extractos, resúmenes y antecedentes únicos de seguridad; no se presenta como historial completo ni se oculta la asistencia de IA.

## Por qué quedan archivos de otros tipos

SQL conserva la estructura, los permisos y las migraciones; lockfile/workspace de pnpm hacen reproducible la instalación; los YAML de GitHub ejecutan CI; Wrangler JSONC define los builds y el backend; `.gitignore` evita subir secretos y generados; `.env.example` explica variables sin valores reales. Imágenes, logos, robots y sitemap son parte del sitio. Borrarlos sólo por su extensión rompería o debilitaría el proyecto. Los tests y las herramientas necesarias se conservan.

Las migraciones históricas inmutables y los rollback están excluidos del límite académico por la aceptación informada por el usuario. Se conservan visibles. No se usa una base SQLite vacía para aparentar cumplimiento: la modalidad documentada es HTML/CSS/JavaScript consumiendo API.

Esta tarea no cambia Auth, datos, credenciales ni la configuración de producción. No se publica por simplificar documentos o nombres internos. Los builds locales no equivalen a pruebas remotas del Admin. La oficial conserva su despliegue anterior; futuras publicaciones requieren sus verificaciones y rollback compatible.

Las referencias visuales documentadas incluyen Armani Beauty, Dior Argentina, Chanel, Creed y Unsplash. No se acreditó licencia individual de cada fotografía; citarlas no concede permisos ni atribuye autoría. Martearena y Ruas son los apellidos informados. Asistencia, preentregas, participación y defensa individual requieren evidencia de los integrantes o del profesor. No se genera ZIP ni se garantiza aprobación.
