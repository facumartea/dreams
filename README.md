# DREAMS · Perfumería multimarca

Sitio académico con HTML, CSS, JavaScript, Node.js/Express y Supabase Auth/PostgreSQL. Catálogo, cuentas, carrito por usuario, opiniones, panel Admin y checkout académico. La portada es estática; no se realizan cobros comerciales y el envío sigue costando $0.

**Oficial:** https://dreams-perfumes.pages.dev/ · **[Documentación de entrega](docs/README.md)** · **[Declaración y registro parcial de IA](DECLARACION_PROMPTS.md)**

## Estructura

```text
DREAMS/
├── README.md                   Guía principal, instalación, manual y API
├── DECLARACION_PROMPTS.md       Declaración de IA y registro parcial de prompts
├── app/                        Aplicación, dependencias, configuración y pruebas
│   ├── public/                 HTML, CSS, JS, imágenes, robots y sitemap
│   ├── server/                 API Express, sesiones, permisos y datos
│   ├── worker/ y pages/        Backend privado y proxy de Cloudflare
│   ├── views/ y templates/     Admin y fragmentos compartidos
│   ├── supabase/               SQL, migraciones y rollback
│   ├── scripts/ y test/        Herramientas, fixtures y regresiones
│   └── package.json, pnpm y Wrangler
├── docs/                       Índice, wireframe, mapa y diseño de base de datos
│   ├── wireframe/              Pantallas y navegación reunidas en un PDF
│   └── base-de-datos/          D.E.R. original en una sola lámina PDF
└── .github/workflows/          CI; GitHub exige esta ubicación
```

Los archivos necesarios no se borran por su extensión: `package.json`, lockfile/workspace, `.gitignore`, `.env.example`, Wrangler, SQL, imágenes y SEO están dentro de `app/`. No hay Python versionado ni se agrega otro lenguaje.

## Instalación y ejecución

Requisitos: Node.js 24.x y pnpm 11.19.0 mediante Corepack. **Desde la raíz, entrar primero en `app/`:**

```sh
cd app
corepack pnpm install --frozen-lockfile
corepack pnpm run check
corepack pnpm run check:functions
corepack pnpm test
corepack pnpm run build:pages
corepack pnpm run build:official
```

Los checks y builds funcionan sin `.git` ni secretos reales y no publican. Los cuatro builds disponibles son `build:cloudflare`, `build:pages`, `build:admin-review` y `build:official`; todos construyen sin desplegar. El inventario de 40 líneas recorre también el resto del repositorio. Los tests SQL necesitan PostgreSQL de prueba; sin configurarlo se omiten esos casos. No ejecutar seeds, resets o migraciones sobre producción para estudiar.

Para arrancar conectado hace falta un proyecto Supabase de desarrollo autorizado, con su estructura ya preparada. No usar la base comercial ni ejecutar seeds o migraciones para probar este README. Copiar el ejemplo desde la carpeta app/:

```sh
cp .env.example .env
```

Completar estas variables en el entorno local o en `.env`, sin subir sus valores a GitHub:

| Variable | Para qué sirve |
|---|---|
| `SUPABASE_URL` | URL del proyecto de desarrollo. |
| `SUPABASE_SECRET_KEY` | Clave de servidor del mismo proyecto, suministrada mediante el gestor seguro del entorno. |
| `PORT` | Puerto local; el ejemplo usa 8080. |
| `APP_BASE_URL`, `APP_ORIGINS` | Dirección y origen local permitidos, ambos `http://localhost:8080`. |
| `NODE_ENV` | Mantener development en local. |
| `CHECKOUT_PROVIDER` | El ejemplo usa demo para el proveedor preparado; no equivale al checkout académico oficial. |
| `CHECKOUT_SCHEMA_READY` | Mantener false si no se verificó el esquema de pedidos del entorno de desarrollo. |
| `PRESENTATION_CHECKOUT_ENABLED`, `PRESENTATION_SIGNING_KEY` | Para probar la simulación académica, usar true y una clave local aleatoria de al menos 32 caracteres cargada en el entorno; no reutilizar la de producción. Sin eso el flujo queda deshabilitado. |

Las variables de contacto son opcionales. No hacen falta contraseña Admin ni tokens de Mercado Pago para arrancar con el proveedor demo del ejemplo. Los campos ADMIN del ejemplo no crean administradores al iniciar. No cambiar `DEMO_AUTO_CONFIRM_EMAIL=false` ni `GOOGLE_ACCESS_READY=false` para sortear Auth.

Luego, desde app/, ejecutar:

```sh
corepack pnpm start
```

Puerto local predeterminado 8080: `http://localhost:8080`. Admin: `/admin`, con una cuenta autorizada existente. No hay contraseña predeterminada ni alta automática de administradores. No usar claves de capturas, no versionar `.env` y no conectar pruebas a datos comerciales. Revisar la diferencia histórica `brand`/`marca` y las migraciones antes de reproducir la estructura.

## Preparar Supabase local temporal

Este procedimiento usa servicios reales de Supabase en Docker, separados del proyecto oficial. No copia usuarios, claves ni datos comerciales. Requiere Docker operativo, Node.js 24 y espacio para las imágenes y volúmenes. No tiene cargos de Supabase; consume recursos del equipo. El CLI probado es 3.1.0 y PostgreSQL 17.

Trabajar en una copia temporal limpia, sin `.git` ni `.env` reales. Desde app/, instalar con el lockfile como se indica arriba. Luego:

```sh
npx --yes supabase@3.1.0 init
```

En el config.toml generado dentro de app/supabase/, asignar un project_id local único para no reutilizar otra instancia. Ajustar sólo esa configuración nueva:

- db.major_version: 17.
- db.seed.enabled: false. No ejecutar el seed de la aplicación.
- auth.site_url: http://localhost:8080.
- auth.email.enable_confirmations: false para el registro normal de esta prueba; no cambiar Auth de producción.

Crear una red local ligada a loopback e iniciar los servicios:

```sh
docker network create -o 'com.docker.network.bridge.host_binding_ipv4=127.0.0.1' dreams-local-qa
npx --yes supabase@3.1.0 start --network-id dreams-local-qa --exclude studio,postgres-meta,realtime,storage-api,imgproxy,edge-runtime,logflare,vector,supavisor
```

El CLI puede descargar imágenes auxiliares para inicializar sus esquemas aunque se excluyan del funcionamiento habitual. Debe terminar con sus controles de salud aprobados; no usar ignore-health-check para aparentar una conexión. Confirmar que las publicaciones de puertos son 127.0.0.1. Documentación del procedimiento: https://supabase.com/docs/guides/local-development/cli/getting-started .

La instancia nueva aplica los ocho archivos de app/supabase/migrations/ en orden. schema.sql es el baseline histórico: no aplicarlo además de esa cadena ni cargar el rollback. Verificar la estructura y que auth.users y public.products estén vacíos antes de preparar datos sintéticos. En esta reproducción el campo de marca es brand; el adaptador del servidor también contempla marca, utilizado por el esquema remoto documentado.

Obtener del CLI la URL y la clave de servidor de esta instancia local y cargarlas sólo en el entorno privado del proceso, como SUPABASE_URL y SUPABASE_SECRET_KEY. No usar la clave de producción ni copiar la salida con claves a logs, capturas, chats o Git. En esta ejecución de prueba se pasaron en memoria, sin guardarlas en el repositorio. Mantener NODE_ENV=development, PORT=8080, APP_BASE_URL y APP_ORIGINS en http://localhost:8080, CHECKOUT_PROVIDER=demo y DEMO_AUTO_CONFIRM_EMAIL=false. Para la presentación académica, usar la opción y clave local indicadas en la tabla de variables.

Con esas variables, arrancar con corepack pnpm start desde app/. El healthcheck está en http://localhost:8080/api/health. El registro debe pasar por el formulario normal y Supabase Auth; no crear ni confirmar cuentas mediante un bypass administrativo.

Para probar Admin, registrar una cuenta ficticia nueva y preparar su perfil administrador exclusivamente dentro de esta base temporal, identificado por su UUID de prueba. No existe una contraseña Admin predeterminada ni se debe cambiar una cuenta del sitio oficial. Crear productos ficticios, usar los assets locales como imágenes y comprobar guardado mediante recarga y lectura posterior. Las sesiones de prueba deben cerrarse al terminar. Para preparar el único perfil Admin de prueba, usar psql del contenedor local exacto (el sufijo corresponde al project_id nuevo):

```sh
docker exec -it supabase_db_ID_LOCAL_DE_ESTA_PRUEBA psql -U postgres -d postgres
```

Registrar primero «Admin QA local» mediante el formulario normal, identificar su UUID en esa base nueva y aplicar sólo allí:

```sql
update public.profiles
set role = 'admin'
where id = '<uuid de la cuenta sintetica de esta instancia>'
  and name = 'Admin QA local'
  and role = 'customer';
```

Ese paso prepara un fixture local; no agrega una función para elevar roles desde la aplicación. Nunca ejecutarlo contra el proyecto oficial.

Al retirar la instancia, usar el project_id local exacto; no usar la opción all. La opción no-backup borra sólo los datos temporales de esa instancia y debe reservarse para una prueba descartable como esta:

```sh
npx --yes supabase@3.1.0 stop --project-id ID_LOCAL_DE_ESTA_PRUEBA --no-backup
```

En el entorno de esta ejecución, el driver Docker vfs y el proxy requirieron adaptaciones temporales de imágenes: compactar las capas oficiales de PostgreSQL sin cambiar su filesystem/configuración, y permitir loopback en el proxy del healthcheck de Auth. No son cambios de la aplicación ni instrucciones para alterar el daemon o desactivar controles. Una máquina sin recursos suficientes queda BLOQUEADA, no se considera un fallo de DREAMS ni un arranque aprobado.

## Arquitectura y seguridad

Navegador → `/api` → Pages/proxy → Worker privado → Express → Supabase Auth y Data API/PostgreSQL. El arranque local es `app/server/server.js`; la entrada del backend oficial es `app/worker/official.mjs`. La clave de servidor permanece en backend. Se verifican sesión, rol, origen y datos; los permisos no dependen de ocultar botones.

Supabase gestiona contraseñas. Carrito vinculado al UUID, operaciones idempotentes y precios calculados en servidor. Opiniones propias restringidas también por API/RLS. Checkout académico con tickets firmados: no transmite ni guarda datos de tarjeta, no crea pedidos comerciales, no consume usos como compra pagada ni modifica stock. WhatsApp prepara un enlace; no envía mensajes automáticamente.

Esta edición aclara comentarios sin cambiar instrucciones ejecutables, rutas, Auth, datos, credenciales ni configuración. La web oficial se conserva sin desplegar estos comentarios. No se publica por mover archivos. Los comandos de instalación, mantenimiento y futura publicación se ejecutan desde `app/`. Las guardas de publicación siguen vigentes; ninguna receta histórica autoriza activar previews, video u otros sitios.

## Documentación de entrega

- [Índice de diseños](docs/README.md): wireframe, mapa de navegación y D.E.R.
- [Manual de uso](#manual-de-uso), integrado completo en este README.
- [API externa y recorrido](#api-externa-y-recorrido), con documentación pública y ejemplos.
- [Declaración y registro parcial de IA](DECLARACION_PROMPTS.md).

La documentación gráfica es retrospectiva. No hay carpetas de capturas, evidence, history ni entregas separadas por año. Se retiraron reportes de trabajo, inventarios generados, copias de consignas y esquemas visuales antiguos redundantes. El registro de IA conserva los prompts disponibles, sus límites y los antecedentes de seguridad; el historial de Git no se reescribe.

Se conservan código, tests, assets utilizados, SQL/migraciones, lockfile, CI y Wrangler porque son necesarios para ejecutar, verificar o publicar. Se retiraron dos fuentes sin consumidores: la utilidad CLI antigua grant-google-admin.js y el template de tarjeta gráfica social-card.html; la imagen social PNG utilizada sigue presente. No se ejecutó ninguna herramienta de roles ni se cambió la cuenta Admin.

Las imágenes y tipografías de la aplicación no son capturas documentales: permanecen en app/ y en los enlaces externos del HTML. El inventario opcional `check:functions --write` genera su reporte en app/dist/, que está excluido de Git, para no volver a llenar la entrega de archivos generados.

## Manual de uso

Este manual describe el comportamiento documentado de la oficial. Esta edición retira las capturas por solicitud del usuario; no implica una QA remota nueva. Para instalar o ejecutar localmente, entrar primero en app/.

### Inicio, catálogo y detalle

Abrir Inicio y usar el menú para entrar a Perfumes, colecciones Mujer/Hombre/Unisex, Nosotros, Cuenta y Carrito. En móvil, desplegar el menú; con teclado usar Tab y Enter. La portada es una imagen estática. Las colecciones Mujer, Hombre y Unisex se abren desde el menú. El bloque «Tres formas de empezar» continúa eliminado. En «Más buscados» hay un carrusel manual de productos reales: Anterior/Siguiente y flechas del teclado al enfocar el listado; Inicio/Fin llevan a sus extremos. En móvil también se puede deslizar horizontalmente. No hay reproducción automática y se respeta movimiento reducido. Las tarjetas conservan sus enlaces y Agregar al carrito. El indicador de posición sólo se anuncia a lectores de pantalla; no aparece ni reserva espacio. La sección de productos vistos recientemente fue retirada: navegar al detalle ya no guarda ese historial. Los valores antiguos de ese historial quedan sin utilizar, sin tocar carrito ni cuentas.

Las cabeceras Perfumes, Hombre, Mujer y Unisex muestran etiqueta y título en una columna, sin párrafo descriptivo. Conservan sus paletas y filtros; los metadatos SEO y las descripciones de los productos continúan disponibles.

En catálogo, escribir nombre o marca y aplicar la búsqueda. Combinar filtros disponibles de marca, género, tipo y precio, y ordenar por los criterios del selector. Limpiar filtros para volver a todo el catálogo. Abrir una tarjeta para ver imagen, tamaño, precio, stock, intensidad y notas. Una imagen rota muestra un fallback; no prueba que se haya perdido su URL en base.

### Crear cuenta, iniciar y cerrar sesión

En Cuenta elegir Registro, completar nombre, correo, contraseña y repetición. Respetar las validaciones del formulario; no usar credenciales reutilizadas. En la configuración solicitada no se requiere confirmación de correo, pero la aplicación sólo anuncia sesión activa si el proveedor realmente la devuelve. No volver a registrar repetidamente una cuenta si la respuesta se interrumpe: probar login o revisar el mensaje.

Para login, completar correo y contraseña. Si son incorrectos, corregirlos sin revelar la contraseña. Recargar o navegar debe conservar la sesión mediante cookies; si vence se intenta renovar. Cerrar sesión desde Cuenta y comprobar que ya no aparecen los datos personales ni el acceso Admin. Si la red falla al salir, reintentar y comprobar el estado antes de usar un equipo compartido.

Los botones se bloquean durante envío para evitar duplicación; los mensajes indican errores de formato, acceso o conexión. Ante fallo de red, conservar los datos, revisar conectividad y reintentar una sola vez después de comprobar si se completó la operación. Un customer y un visitante no pueden entrar al Admin. No se debe editar localStorage para elevar permisos.

### Carrito por cuenta y checkout académico

Agregar productos disponibles desde catálogo o detalle; abrir Carrito para aumentar/reducir cantidades, quitar o vaciar. El servidor recalcula precio y disponibilidad. En visitante se conserva el carrito local; al entrar, la aplicación combina con el de la cuenta sin sumar duplicados por repetir la misma operación. Cambiar a otra cuenta debe mostrar su propio carrito, nunca el de la anterior. Si queda una operación pendiente, esperar la sincronización antes de comprar.

Comprar abre el checkout académico: revisar resumen, total y Envío de $0 de esa simulación; completar sólo datos ficticios de tarjeta válidos para el formulario (por ejemplo la tarjeta de prueba 4242 4242 4242 4242, vencimiento futuro y CVV ficticio). Nunca ingresar una tarjeta real. El nombre es obligatorio; los campos financieros no se procesan ni se envían. Sólo el ticket firmado viaja al backend. No se valida ni autoriza una tarjeta bancaria. Continuar una sola vez, esperar el resultado y conservar la referencia estable. Si se recarga durante una espera, el intento se retoma sin crear un segundo resultado para el mismo ticket. El flujo no cobra dinero, no crea pedidos comerciales ni descuenta stock.

No confundir los módulos históricos Mercado Pago/demo con la simulación académica de la oficial: no habilitar pagos comerciales para demostrar este manual.

### WhatsApp y opiniones

En detalle o carrito, WhatsApp abre el destinatario y el resumen preparado. Revisar producto, cantidades, precio y total antes de decidir enviar. Esta integración no envía mensajes automáticamente. Las verificaciones del proyecto sólo abren/inspeccionan el enlace.

Para publicar una opinión, iniciar sesión y volver a Inicio. Elegir puntuación 1–5, comentario y publicar. La opinión queda asociada al usuario verificado. El botón Eliminar propio pide confirmación; no se permite borrar una opinión ajena mediante API aunque se modifique el navegador. Si el servidor o la red fallan, revisar la lista antes de repetir la publicación. Admin conserva moderación de edición/borrado.

### Entrar al panel Admin

Usar la cuenta administradora ya existente. Entrar desde Cuenta o `/admin`; el servidor valida el rol. Este manual no contiene contraseñas y no crea administradores. Si aparece acceso reservado, comprobar que la sesión pertenece a la cuenta autorizada; no cambiar roles ni contraseñas para sortearlo.

El panel tiene tarjetas de Productos, Usuarios, Consultas, Opiniones, Pedidos, Disponibilidad baja y Cupones. Una tarjeta activa muestra su módulo; los conteos provienen del servidor. Si falla la carga, usar Reintentar. Con teclado, Tab enfoca la tarjeta y Enter/Espacio la activa.

### Productos e imágenes: alta, edición y guardado

En Productos, buscar por nombre o marca con Buscar/Enter. Limpiar restablece el listado. Disponibilidad baja incluye **0, 1 o 2 unidades**; un valor desconocido no se inventa como cero.

Para alta, completar marca, nombre, género, tipo, tamaño en ml, precio, stock, intensidad, familia, notas, descripción e imagen. Precio y stock no pueden ser negativos; stock y tamaño deben ser enteros válidos. Destacar en Inicio controla la selección destacada, no garantiza un orden promocional inventado.

Usar una URL HTTPS directa a imagen o un asset local permitido. No pegar una página de búsqueda, credenciales en URL o enlace HTTP. La vista previa comprueba la imagen y bloquea Guardar si falta, falla o todavía está pendiente. Un enlace temporal firmado puede vencer y muestra aviso: preferir URL permanente. Tras un error, corregir el enlace y Reintentar; la respuesta atrasada de una imagen anterior no debe validar la nueva.

Editar carga el producto existente, incluida su URL. Cambiar otro campo conserva esa imagen. Cancelar/Limpiar permite salir de la edición con aviso de cambios sin guardar. Editar y Eliminar conservan las mismas dimensiones. Eliminar es permanente y pide confirmación; para practicar sólo usar productos exclusivos de prueba.

Antes de una nueva alta se revisa el listado. Si la respuesta de un alta se pierde, Reintentar consulta su marca/nombre y sus campos antes de crear: recupera el ID existente sin otro POST; si hay discrepancias o ambigüedad no sobrescribe. Guardar espera la escritura y una lectura posterior que confirme todos los campos. Si esa lectura falla, el formulario conserva los datos y no anuncia éxito: revisar el listado antes de repetir un alta. Después de confirmar, recargar y comprobar Admin, catálogo, detalle y conteos. Para practicar, usar exclusivamente productos de prueba y comprobar la lectura posterior; no modificar productos comerciales.

### Otros módulos Admin

- **Pedidos:** listar y revisar referencia, fecha, estado y totales existentes. No generar una compra comercial para poblarlo. La simulación académica no crea filas aquí.
- **Cupones:** crear/editar código, porcentaje y activo, guardar o limpiar; el código se normaliza en mayúsculas. El carrito permite aplicar un cupón existente: estado, vencimiento, mínimo y límites se validan en servidor. La simulación no consume usos comerciales. Condiciones especiales no implementadas se rechazan con un mensaje. La confirmación incluye una lectura posterior de código, porcentaje y activo; un alta incierta se recupera sin duplicar el código.
- **Usuarios:** lectura de perfiles y roles; esta UI no permite crear Admin ni cambiar contraseñas/roles.
- **Consultas:** lectura de consultas existentes y producto asociado, sin enviar WhatsApp automáticamente.
- **Opiniones:** buscar, editar puntuación/comentario o eliminar con confirmación. No hay ocultamiento/publicación por estado en el modelo y no se simula. Guardar confirma puntuación y comentario con una lectura posterior; eliminar confirma ausencia en el listado.

### Errores y recuperación

Un 401 indica sesión/credencial no válida; un 403 indica operación no autorizada; un 503 puede indicar dependencia no disponible. No pegar valores de claves ni headers en capturas. Si el catálogo funciona pero el registro falla, no dar por sana toda la aplicación. Ante fallo de imagen revisar URL, permisos y disponibilidad del hosting de la foto; ante guardado dudoso revisar listado antes de repetir.

El operador conserva el frontend publicado y una versión probada del backend con la misma clave y firmas como rollback compatible; el frontend legacy restaurado queda como recuperación de emergencia. Los usuarios no tienen que reconfigurar Supabase ni Cloudflare. La documentación no garantiza aprobación ni reemplaza la práctica individual.

### Cupón y formato local del formulario

En el resumen del carrito, ingresar el código en «Cupón de descuento» y pulsar Aplicar o Enter. Quitar cupón elimina su descuento; volver a aplicar no lo acumula. El servidor revalida al cambiar cantidades y al confirmar. Un error de red bloquea Comprar hasta Reintentar; un cupón inválido no conserva descuento. El cupón aplicado se mantiene al recargar y pasar al checkout. Productos, descuento, Envío ($0) y total deben coincidir hasta la confirmación.

El titular empieza vacío, con placeholder CLIENTE DREAMS. Permite espacios, tildes, guiones y apóstrofes. Número: 16 dígitos, agrupados; vencimiento MM/AA (mes 01–12); CVV: 3 dígitos, incluidos ceros iniciales. Se puede pegar, seleccionar y editar en medio. Son validaciones de formato locales, sin verificación bancaria; usar sólo datos ficticios. Nunca se envían ni guardan estos campos.

## API externa y recorrido

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

Registro normal: formulario → `POST /api/auth/register` → `auth.signUp` → perfil customer → cookies si Supabase devuelve sesión. Login usa `signInWithPassword`; recarga valida `getUser`, refresh renueva y logout revoca sesión/cookies. No se utiliza `createUser` administrativo como bypass en el backend oficial. La existencia de estas rutas no acredita QA remota exitosa: ver [pruebas](https://github.com/facumartea/dreams/blob/305c5fd6ca0f5a72792c4f5e64fa60ac13a70828/docs/history/entrega-anterior.html#fuente-0a164ff09539).

Admin: `GET /api/admin/{stats,products,users,inquiries,reviews,orders,coupons}`. Productos y cupones permiten alta/edición/borrado; opiniones permiten moderación. Usuarios, consultas y pedidos son de lectura: no inventar botones de modificar roles o pedidos. Antes de anunciar guardado, se confirma respuesta y una lectura de todos los campos del producto.

Carrito: `GET/POST /api/cart/account`, operación UUID idempotente sobre RPC, sin precios confiados desde navegador. Opiniones: POST asociado a sesión, DELETE propio validado por API. Checkout académico: `POST /api/presentation/{session,payment,result}` intercambia referencias firmadas; datos ficticios de tarjeta quedan en navegador y no hay orden comercial ni descuento de stock.

**WhatsApp es un enlace `wa.me`**, no una API de mensajería integrada. Abre destinatario y texto preparado; el usuario decide si lo envía. En las pruebas no se enviaron mensajes. Mercado Pago permanece como código histórico/preparado, sin habilitar cobros ni usarlo como API efectivamente probada de esta entrega.

## Fuentes visuales y límites

La documentación previa identificaba referencias de Armani Beauty, Dior Argentina, Chanel, Creed y Unsplash. No se acreditó una licencia individual para cada fotografía; esta lista no concede permisos ni declara autoría sobre imágenes de terceros. Los originales de marca utilizados se conservan en app/public/assets/. Martearena y Ruas son los apellidos informados; participación y defensa deben acreditarse individualmente.

Esta limpieza y revisión de comentarios conserva el funcionamiento y la configuración efectiva de la oficial. No se publica por rutina un cambio de comentarios. Se conservan las guardas de publicación: otra publicación necesita sus propias verificaciones. No se genera ZIP ni se garantizan notas o aprobación.


## Evidencia de arranque local

La revisión inicial del 11/11/2026 estaba bloqueada por falta de un proyecto de desarrollo. Esa revisión ya acreditó instalación, checks, límite de 40 líneas, 497 tests y builds; no se repiten aquí. Los cuatro tests PostgreSQL que habían quedado omitidos se ejecutaron por separado y aprobaron en un contenedor aislado, con evidencia conservada.

La continuación del 12/11/2026 verificó una copia limpia del commit da5df12, con instalación congelada y servicios reales locales de Supabase: PostgreSQL 17.11, GoTrue Auth 2.197.0 y PostgREST 16.5, preparados con CLI 3.1.0. Las ocho migraciones aplicaron en una base inicialmente vacía. No se aplicaron también el schema histórico o rollback ni se copiaron datos de producción.

Resultado: **46 comprobaciones locales PASS**. Incluyen arranque con pnpm start en localhost:8080 y health 200; catálogo en móvil/escritorio; registro normal sin confirmación, perfil customer, login, cookies HttpOnly, recarga, navegación, refresh real y logout con revocación; acceso Admin, lectura de sus módulos, búsqueda y stock bajo; alta, guardado y cambio de imágenes, conservación de imagen al editar precio, persistencia tras recarga y actualización en catálogo, detalle, destacados y estadísticas. Customer y anónimo no accedieron al Admin.

Se conserva un incidente del arnés: esperaba volver a Cuenta al salir de Admin, mientras el código vuelve a Inicio. Se corrigió la expectativa y se completó sólo el cierre pendiente; no se cambió la aplicación ni se ocultó el resultado original. El primer intento de preparación también encontró límites de vfs y del proxy, resueltos sólo en las imágenes temporales como se explica arriba.

La base tuvo únicamente tres cuentas y nueve productos sintéticos. Se cerraron/revocaron las sesiones de prueba, se detuvieron los procesos y se retiraron contenedores, volúmenes de datos y red de esa instancia. **No quedan recorridos bloqueados de este alcance local.** No es una nueva prueba de la oficial ni de todas las funciones comerciales o de checkout. La oficial, Auth, credenciales y configuración de producción permanecieron intactos; no hubo deployment.

La bitácora sigue siendo parcial: quedan 17 fechas y el mensaje original del pedido 1 por acreditar. La fecha de esta prueba técnica no se asigna a esos prompts ni demuestra una preentrega o participación individual.
