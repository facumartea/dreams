# DREAMS · Perfumería multimarca

Sitio académico con HTML, CSS, JavaScript, Node.js/Express y Supabase Auth/PostgreSQL. Catálogo, cuentas, carrito por usuario, opiniones, panel Admin y checkout académico. La portada es estática; no se realizan cobros comerciales y el envío sigue costando $0.

**Oficial:** https://dreams-perfumes.pages.dev/ · **[Documentación de entrega](docs/INDICE.md)** · **[Declaración y registro parcial de IA](docs/registro-prompts.md)**

## Estructura

```text
DREAMS/
├── README.md                   Guía principal: único archivo en la raíz
├── app/                        Aplicación, dependencias, configuración y pruebas
│   ├── public/                 HTML, CSS, JS, imágenes, robots y sitemap
│   ├── server/                 API Express, sesiones, permisos y datos
│   ├── worker/ y pages/        Backend privado y proxy de Cloudflare
│   ├── views/ y templates/     Admin y fragmentos compartidos
│   ├── supabase/               SQL, migraciones y rollback
│   ├── scripts/ y test/        Herramientas, fixtures y regresiones
│   └── package.json, pnpm y Wrangler
├── docs/                       Documentación de entrega y estudio
│   ├── wireframe/              Láminas y mapa, con fuentes editables
│   └── base-de-datos/          D.E.R. y esquema estructural
└── .github/workflows/          CI; GitHub exige esta ubicación
```

Los archivos necesarios no se borran por su extensión: `package.json`, lockfile/workspace, `.gitignore`, `.env.example`, Wrangler, SQL, imágenes y SEO están dentro de `app/`. `.gitattributes` queda en `docs/` para documentación y binarios. No hay Python versionado ni se agrega otro lenguaje.

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

Los checks y builds funcionan sin `.git` ni secretos reales y no publican. El inventario de 40 líneas recorre también el resto del repositorio. Los tests SQL necesitan PostgreSQL de prueba; sin configurarlo se omiten esos casos. No ejecutar seeds, resets o migraciones sobre producción para estudiar.

Para arrancar conectado, copiar **`app/.env.example` a `app/.env`**, completar únicamente un Supabase de desarrollo autorizado y, desde `app/`, ejecutar:

```sh
corepack pnpm start
```

Puerto local predeterminado 8080: `http://localhost:8080`. Admin: `/admin`, con una cuenta autorizada existente. No hay contraseña predeterminada ni alta automática de administradores. No usar claves de capturas, no versionar `.env` y no conectar pruebas a datos comerciales. Revisar la diferencia histórica `brand`/`marca` y las migraciones antes de reproducir la estructura.

## Arquitectura y seguridad

Navegador → `/api` → Pages/proxy → Worker privado → Express → Supabase Auth y Data API/PostgreSQL. El arranque local es `app/server/server.js`; la entrada del backend oficial es `app/worker/official.mjs`. La clave de servidor permanece en backend. Se verifican sesión, rol, origen y datos; los permisos no dependen de ocultar botones.

Supabase gestiona contraseñas. Carrito vinculado al UUID, operaciones idempotentes y precios calculados en servidor. Opiniones propias restringidas también por API/RLS. Checkout académico con tickets firmados: no transmite ni guarda datos de tarjeta, no crea pedidos comerciales, no consume usos como compra pagada ni modifica stock. WhatsApp prepara un enlace; no envía mensajes automáticamente.

Esta reorganización no cambia rutas, funciones, Auth, datos, credenciales, valores de configuración ni la web oficial. No se publica por mover archivos. Los comandos de instalación, mantenimiento y futura publicación se ejecutan desde `app/`. Las guardas de publicación siguen vigentes; ninguna receta histórica autoriza activar previews, video u otros sitios.

## Documentación de entrega

- [Índice](docs/INDICE.md): manual, wireframe/mapa, D.E.R. y API.
- [Manual](docs/manual.md) / [PDF](docs/manual.pdf), sin capturas.
- [Guía de defensa](docs/defensa.md) / [Word](docs/defensa.docx) / [PDF](docs/defensa.pdf).
- [Declaración y registro parcial de IA](docs/registro-prompts.md).

La documentación gráfica es retrospectiva. No hay carpetas de capturas, evidence, history ni entregas separadas por año. Se retiraron reportes de trabajo, inventarios generados, copias de consignas y esquemas visuales antiguos redundantes. El registro de IA conserva los prompts disponibles, sus límites y los antecedentes de seguridad; el historial de Git no se reescribe.

Se conservan código, tests, assets utilizados, SQL/migraciones, lockfile, CI y Wrangler porque son necesarios para ejecutar, verificar o publicar. Se retiraron dos fuentes sin consumidores: la utilidad CLI antigua grant-google-admin.js y el template de tarjeta gráfica social-card.html; la imagen social PNG utilizada sigue presente. No se ejecutó ninguna herramienta de roles ni se cambió la cuenta Admin.

Las imágenes y tipografías de la aplicación no son capturas documentales: permanecen en app/ y en los enlaces externos del HTML. El inventario opcional `check:functions --write` genera su reporte en app/dist/, que está excluido de Git, para no volver a llenar la entrega de archivos generados.

## Fuentes visuales y límites

La documentación previa identificaba referencias de Armani Beauty, Dior Argentina, Chanel, Creed y Unsplash. No se acreditó una licencia individual para cada fotografía; esta lista no concede permisos ni declara autoría sobre imágenes de terceros. Los originales de marca utilizados se conservan en app/public/assets/. Martearena y Ruas son los apellidos informados; participación y defensa deben acreditarse individualmente.

Esta limpieza no cambia el funcionamiento ni la configuración efectiva de la oficial y no requiere deployment. Se conservan las guardas de publicación: otra publicación necesita sus propias verificaciones. No se genera ZIP ni se garantizan notas o aprobación.
