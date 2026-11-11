# DREAMS · Perfumería multimarca

Sitio académico con HTML, CSS, JavaScript, Node.js/Express y Supabase Auth/PostgreSQL. Catálogo, cuentas, carrito por usuario, opiniones, panel Admin y checkout académico. La portada es estática; no se realizan cobros comerciales y el envío sigue costando $0.

**Oficial:** https://dreams-perfumes.pages.dev/ · **[Documentación de entrega](docs/entrega-2025/INDICE.md)** · **[Declaración y registro parcial de IA](docs/entrega-2025/registro-prompts.md)**

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
├── docs/                       Entrega, fuentes editables y evidencia
│   └── history/                Cuatro archivos históricos consolidados
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

- [Índice de entrega 2025](docs/entrega-2025/INDICE.md) y [matriz de rúbrica](docs/entrega-2025/matriz-rubrica.md).
- [Manual](docs/entrega-2026/manual.md) / [PDF](docs/entrega-2026/manual.pdf).
- [Guía de defensa](docs/entrega-2025/defensa.md) / [Word editable](docs/entrega-2025/defensa.docx) / [PDF](docs/entrega-2025/defensa.pdf).
- [Wireframes y mapa](docs/auditoria-2025/INDICE.md), [D.E.R.](docs/auditoria-2025/base-de-datos.md) y [API](docs/entrega-2026/api.md).
- [Declaración y prompts: historial parcial](docs/entrega-2025/registro-prompts.md).
- [Fuentes visuales y límites de atribución](docs/image_sources.md).
- [Inventario, consolidaciones, alias de duplicados y validaciones](docs/limpieza-20261111.json).

Manual y gráficos reutilizan sus carpetas para evitar duplicados; el nombre entrega-2026 no cambia la rúbrica vigente. Los gráficos son documentación retrospectiva. Los inventarios anteriores conservan su commit y rutas históricas: para código trasladado, la ubicación actual empieza por `app/`. Martearena y Ruas son los apellidos informados; participación, preentregas y dominio individual requieren evidencia humana. No se garantiza nota ni aprobación. No se genera ZIP.

## Históricos conservados en menos archivos

[Continuidad](docs/history/continuidad.html), [auditorías y seguridad](docs/history/auditorias.html), [operación anterior](docs/history/operacion.html) y [entrega anterior](docs/history/entrega-anterior.html). Son HTML sin JavaScript, legibles sin conexión. Cada sección conserva el texto original completo, su ruta, commit y SHA-256; no son instrucciones vigentes ni se oculta el uso de IA. En GitHub se puede descargar el HTML para abrirlo localmente. Railway queda documentado allí como antecedente; no es un hosting activo autorizado.
