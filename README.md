# DREAMS · Perfumería multimarca

Sitio HTML/CSS/JavaScript con API Node.js/Express y Supabase (Auth y PostgreSQL). Catálogo, cuenta, carrito, opiniones y Admin; checkout académico sin cobros comerciales. La portada permanece estática.

**Oficial:** https://dreams-perfumes.pages.dev/ · [Entrega 2026](docs/entrega-2026/INDICE.md) · [Estado real y bloqueos](CURRENT_STATE.md).

La oficial restaurada y el candidato de PR #56 son versiones distintas. El backend candidato no está conectado a producción porque su Secret fue rechazado; registro/login/Admin remotos no se declaran resueltos. El usuario confirmó que el profesor aceptó Supabase: se conserva PostgreSQL por esa excepción comunicada, sin presentarlo como SQLite. Ver [registro de la decisión](docs/entrega-2026/sqlite.md).

## Requisitos y verificación sin secretos

Node.js **24.x**, pnpm **11.19.0** mediante Corepack. Desde la raíz, incluso en un ZIP sin `.git`:

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm run check
corepack pnpm run check:functions
corepack pnpm test
corepack pnpm run build:pages
corepack pnpm run build:official
```

Los tests emplean fixtures, no datos comerciales. Los builds son locales; no publican. `build:cloudflare` y `build:admin-review` también son dry-run. Ningún comando de entrega debe ejecutar deploy de previews. El inventario cuenta funciones y bloques principales de hasta 40 líneas: [alcance](docs/entrega-2026/funciones.md).

## Arranque conectado para desarrollo

Copiar `.env.example` como `.env` y completar **un proyecto Supabase de desarrollo** desde un gestor seguro. Nunca versionar ese archivo. Aplicar las migraciones sólo en ese proyecto después de revisar [el esquema](docs/entrega-2026/base-de-datos.md); no ejecutar resets o seeds en producción.

```sh
corepack pnpm start
```

Puerto por defecto **8080** (`http://localhost:8080`), modificable mediante `PORT`. El ejemplo usa el mismo puerto. `SUPABASE_URL` y `SUPABASE_SECRET_KEY` son obligatorios: sin credenciales de desarrollo no se promete arranque conectado; la comprobación sin secretos es la suite y los builds. El arranque no crea productos, cuentas ni administradores y no ejecuta seed. Los módulos históricos de seed y concesión de Admin no forman parte del recorrido de entrega.

Auth usa el proveedor; hashing permanece en Supabase. Cookies HttpOnly/SameSite y Secure en producción, verificación de origen, rate limiting y roles en servidor. No se modifica la contraseña Admin para probar. La configuración académica usa `PRESENTATION_CHECKOUT_ENABLED` y una firma de servidor; nunca se envían números de tarjeta al backend. No habilitar pagos comerciales.

## Hosting y documentación

Cloudflare Pages sirve la oficial y actúa como proxy hacia backend aprobado. El candidato privado `dreams-official-backend` requiere lectura Supabase y QA autenticada antes de promoción. Secret sólo en el backend. [Rollback y proxy](docs/pages_frontdoor.md), [manual](docs/entrega-2026/manual.md), [API](docs/entrega-2026/api.md) y [defensa](docs/entrega-2026/defensa.md).

Railway y los módulos de previews son antecedentes conservados; no son destinos autorizados para esta entrega. Publicación y merge a branch predeterminada siguen pendientes de checks y bloqueos funcionales. Integrantes confirmados: Martearena y Ruas. La entrega se actualiza en GitHub; por pedido del usuario no se genera otro ZIP final. Ver [branch y extracción histórica](docs/entrega-2026/zip.md); la descarga predeterminada no contiene una PR sin integrar.
