# DREAMS · Perfumería multimarca

Sitio HTML/CSS/JavaScript que consume una API mediante Node.js/Express y Supabase Auth/PostgreSQL. Es la primera opción tecnológica del PDF 2025: no requiere Flask/SQLite ni una excepción tomada de 2026. La portada es estática y el checkout es académico, sin cobros comerciales.

**Oficial:** https://dreams-perfumes.pages.dev/ · **[Entrega según rúbrica 2025](docs/entrega-2025/INDICE.md)** · [Continuidad](CURRENT_STATE.md)

## Instalación y comprobación

Node.js 24.x y pnpm 11.19.0 mediante Corepack. Desde la raíz, también sin `.git`:

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm check
corepack pnpm check:functions
corepack pnpm test
corepack pnpm build:pages
corepack pnpm build:official
```

Los tests usan fixtures aislados. Los builds indicados no publican. No ejecutar seeds, resets ni despliegues de previews para preparar la entrega. No se genera ZIP en esta tarea.

Para desarrollo conectado, copiar `.env.example` como `.env` y completar un proyecto Supabase de desarrollo mediante un gestor seguro. No versionar claves ni conectar pruebas a datos comerciales. Revisar migraciones y la diferencia `brand`/`marca` antes de reproducir estructura.

```sh
corepack pnpm start
```

Puerto predeterminado 8080, `http://localhost:8080`, modificable con `PORT`. Sin un proyecto de desarrollo configurado no se promete arranque conectado; checks/tests/builds sí funcionan sin secretos reales. El arranque no crea administradores ni carga productos automáticamente.

## Arquitectura y funciones

- `public/`: páginas y controladores de catálogo, cuenta, carrito y checkout.
- `server/`: Express, validación, cookies, autorización y consultas a Supabase.
- `worker/official.mjs`: backend privado de la oficial; `pages/`: proxy y assets públicos empaquetados.
- `supabase/migrations/`: historial necesario de esquema y permisos; no reescribir migraciones aplicadas.
- `test/`, `scripts/`, `.github/`: regresiones y verificación.

El navegador sólo llama a `/api`. La clave de servidor permanece en backend. Supabase gestiona contraseñas; cookies de sesión seguras, guard de origen y roles verificados protegen las operaciones. Admin conserva su cuenta existente. El carrito se vincula al UUID; opiniones propias se restringen también por API/RLS. El checkout intercambia tickets firmados y no transmite campos de tarjeta, no crea pedidos comerciales ni descuenta stock. Envío: $0. WhatsApp prepara un enlace; no envía mensajes automáticamente.

## Documentación y límites de la entrega

[Manual](docs/entrega-2026/manual.md) · [Wireframes y mapa](docs/auditoria-2025/INDICE.md) · [D.E.R.](docs/auditoria-2025/base-de-datos.md) · [API](docs/entrega-2026/api.md) · [Guía de defensa](docs/entrega-2025/defensa.md) ([Word](docs/entrega-2025/defensa.docx) / [PDF](docs/entrega-2025/defensa.pdf)) · [Prompts: registro parcial](docs/entrega-2025/registro-prompts.md).

Se reutilizan manual y gráficos vigentes ubicados en carpetas previas; eso no convierte la rúbrica 2026 en fuente de esta evaluación. Los gráficos retrospectivos conservan su identificación y no se presentan como preentregas originales. Los integrantes confirmados son Martearena y Ruas; su participación y dominio deben acreditarse individualmente.

La PR #61 recupera el carrusel manual en Más buscados, modulariza la RPC activa y alinea los scripts de Pages; [estado de publicación y evidencia](docs/evidence/cierre-tecnico-20261105/README.md). Los históricos y el rollback se excluyen del límite según aclaración docente comunicada por el usuario. No se garantiza aprobación ni se inventan comprobantes de entregas. Las fechas literales de 2025 son 30 de octubre y 12 de noviembre; el profesor debe aclarar calendario aplicable.

Railway, código de previews y módulos comerciales son antecedentes conservados; no son destinos autorizados para esta entrega. La única web autorizada es la oficial. La publicación funcional de PR #61 y su contraste se registran en la evidencia actual; no publicar otros sitios. [Históricos](docs/history/) · [Cambios](CHANGELOG.md).

## Organización y limpieza propuesta

La propuesta parte de main `8ad5401`; no cambia la aplicación ni publica la web. Se revisa en una branch/PR propia y **no se integra mientras existan excepciones pendientes de decisión**. El [inventario completo JSON](docs/limpieza-20261111.json) enumera los 457 archivos de la base, referencias, eliminaciones y alternativas por grupo. No hay Python versionado ni se agrega ese lenguaje.

El README es la entrada de instalación y navegación. Se conserva el [índice académico](docs/entrega-2025/INDICE.md), la [documentación gráfica](docs/auditoria-2025/INDICE.md) y el [histórico](docs/history/). Los manuales y guías antiguos pueden describir Node 20, puerto 3000 u otro hosting: no prevalecen sobre los comandos actuales ni sobre el código. Node 24, pnpm 11.19.0 y puerto 8080 son los actuales. Para Admin local: `http://localhost:8080/admin`, con una cuenta autorizada existente; no hay contraseña predeterminada ni alta automática de administradores. La publicación/rollback requiere las guardas de [Pages](docs/pages_frontdoor.md); Railway es un antecedente, no el destino de esta entrega.

### Consolidado y retirado en esta propuesta

- `docs/entrega-2026/bitacora-ia.md`: cuerpo histórico preservado íntegramente en [la sección F del registro único](docs/entrega-2025/registro-prompts.md#f-bitácora-histórica-consolidada), con procedencia y límites. Se mantiene el carácter parcial del historial y no se atribuye revisión humana no acreditada.
- `docs/README.md`: navegación y advertencias repetidas consolidadas aquí. No se retira el índice académico detallado.
- `scripts/install_and_run.txt`: instrucciones repetidas consolidadas aquí; ningún import, test, CI o build lo consume.

Los inventarios históricos mantienen sus rutas originales como evidencia de su commit; el inventario de esta limpieza documenta las equivalencias. No se borran documentos exigidos, archivos dudosos, seguridad, tests ni migraciones. Los dos pares de archivos idénticos con procedencia local/remota distinta se conservan para decisión explícita.

### Excepciones agrupadas: requieren decisión antes de eliminar

Esta es la única lista de decisión; el JSON añade los nombres de cada archivo y las dependencias encontradas. Todos estos grupos se conservan mientras se revisa la propuesta.

| Grupo | Archivo o grupo | Función y pérdida si se retira | Alternativa y recomendación |
|---|---|---|---|
| E01 | `public/assets/`: PNG y WebP (8) | Marca, iconos, portada y tarjeta social; quitar usados rompe imágenes. No hay fuentes locales versionadas. | Conservar; revisar variantes una a una. Las tipografías se enlazan desde HTML. |
| E02 | `supabase/**/*.sql`, `supabase/schema.sql`, `test/fixtures/cart-postgres.sql` (11) | Estructura, permisos, historial, rollback y prueba SQL. | Conservar; no convertir SQL ni reescribir migraciones aplicadas. |
| E03 | `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `.github/workflows/ci.yml` | Instalación reproducible, builds permitidos y CI. | Conservar; no renombrar ni cambiar gestor en esta limpieza. |
| E04 | `wrangler.jsonc`, `wrangler.official.jsonc`, `pages/wrangler.jsonc` | Builds, compatibilidad y bindings de Cloudflare. | Conservar las tres configuraciones sin cambios. |
| E05 | `.env.example`, `.gitignore`, `.gitattributes` | Configuración sin valores, exclusión de secretos/generados y tratamiento de texto/binarios. | Conservar; nunca incorporar .env real. |
| E06 | `public/robots.txt`, `public/sitemap.xml` | SEO y entradas explícitas requeridas por build-pages. | Conservar; su retirada afecta código/build y no está autorizada aquí. |
| E07 | Manual, guía oral, rúbrica, matriz, API, pseudocódigo, wireframe, mapa y D.E.R.; PDF, PNG, SVG, DOT, MMD, DOCX, TXT, CSV y Markdown | Requisitos/evidencia académica, lectura offline y fuentes editables. | Conservar lo vigente; decidir qué antecedentes mantener antes de reducirlos. No es seguro dejar sólo capturas o sólo PDFs. |
| E08 | `docs/evidence/`, `docs/history/`, `AUDIT.md`, `SECURITY_*.md` | Evidencia única y antecedentes de seguridad/recuperación; no son dependencias de ejecución sólo por existir. | Conservar ahora; una futura consolidación debe preservar procedencia y contenido único. No exigido por la rúbrica no significa inútil. |
| E09 | `AGENTS.md`, `CURRENT_STATE.md`, `PLAN.md`, `CHANGELOG.md` | Instrucciones de agentes y referencias de continuidad; no los usa el servidor, pero quitarlos solos rompe instrucciones vigentes. | Decidir si se autoriza dejar AGENTS mínimo y consolidar continuidad en README/registro antes de retirar los otros. Se preservan hasta la respuesta. |
| E10 | `railway.toml` | Receta histórica; no es el hosting oficial. | Puede retirarse con autorización, manteniendo referencia al commit histórico. Se conserva por ahora. |
| E11 | `docs/image_sources.md` | Fuentes visuales y límites de licencias; no acredita permisos inexistentes. | Conservar o consolidar fielmente en README con decisión explícita. No hay LICENSE independiente en esta base. |
| E12 | Otras guías técnicas Markdown en `docs/` | Publicación, rollback, recuperación y arquitectura; algunas contienen información única. | Consolidar partes vigentes antes de retirar cada guía. Se conservan hasta revisar la selección. |

La estructura final propuesta mantiene código y tests, README y un registro de IA; las configuraciones, recursos y documentos necesarios quedan como excepciones expresas. Esta fase no elimina todos los demás Markdown a ciegas.

### Árbol propuesto y validación

```text
DREAMS/
├── README.md
├── docs/
│   ├── entrega-2025/registro-prompts.md  (declaración y registro único)
│   ├── entrega-2025/, auditoria-2025/   (entrega y fuentes: E07)
│   ├── entrega-2026/                   (manual reutilizado/antecedentes: E07)
│   ├── evidence/, history/             (evidencia: E08)
│   └── limpieza-20261111.json          (inventario y decisiones de esta PR)
├── public/, server/, worker/, pages/, views/, templates/
├── scripts/, test/                     (sin retirar tests)
├── supabase/                           (SQL: E02)
├── package.json y archivos pnpm        (E03)
└── configuración, SEO, instrucciones y atribuciones (E04–E06, E09–E12)
```

Propuesta de esta fase: 457 archivos de base → 455, contando el nuevo inventario JSON. Se retiraron tres documentos redundantes; no se considera aprobada la eliminación de ninguna excepción. No se agregan lenguajes ni se cambia una extensión para aparentar una simplificación.

Validación local posterior en carpeta limpia sin `.git`, dependencias previas ni secretos de producción: instalación con lockfile congelado, sintaxis de 107 JS, inventario de 121 archivos/2200 registros sin excesos, 493 tests aprobados y 4 SQL omitidos por no disponer de PostgreSQL de prueba. Los cuatro builds son sin deployment. El artefacto Pages coincide byte a byte con el generado desde la base 8ad5401. Se comprobaron 108 enlaces de documentos modificados, conservación del cuerpo histórico y ausencia de patrones sensibles nuevos. Resultados por comando en el JSON; CI de la PR se consulta en GitHub. La oficial no se modifica.
