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

Los tests usan fixtures aislados. Los builds indicados no publican. No ejecutar seeds, resets ni despliegues de previews para preparar la entrega. No se generaZIPen esta tarea.

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

[Manual](docs/entrega-2026/manual.md) · [Wireframes y mapa](docs/auditoria-2025/INDICE.md) · [D.E.R.](docs/auditoria-2025/base-de-datos.md) · [API](docs/entrega-2026/api.md) · [Guía de defensa](docs/entrega-2025/defensa.md).

Se reutilizan manual y gráficos vigentes ubicados en carpetas previas; eso no convierte la rúbrica 2026 en fuente de esta evaluación. Los gráficos retrospectivos conservan su identificación y no se presentan como preentregas originales. Los integrantes confirmados son Martearena y Ruas; su participación y dominio deben acreditarse individualmente.

La PR #61 recupera el carrusel manual en Más buscados, modulariza la RPC activa y alinea los scripts de Pages; [estado de publicación y evidencia](docs/evidence/cierre-tecnico-20261105/README.md). Los históricos y el rollback se excluyen del límite según aclaración docente comunicada por el usuario. No se garantiza aprobación ni se inventan comprobantes de entregas. Las fechas literales de 2025 son 30 de octubre y 12 de noviembre; el profesor debe aclarar calendario aplicable.

Railway, código de previews y módulos comerciales son antecedentes conservados; no son destinos autorizados para esta entrega. La única web autorizada es la oficial. La publicación funcional de PR #61 y su contraste se registran en la evidencia actual; no publicar otros sitios. [Históricos](docs/history/) · [Cambios](CHANGELOG.md).
