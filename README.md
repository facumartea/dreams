# DREAMS — Perfumería multimarca

DREAMS es una tienda catálogo de perfumes construida con Node.js, Express, JavaScript y Supabase. Permite explorar productos, publicar opiniones, administrar el catálogo y registrar consultas que continúan por WhatsApp. El carrito es local y no constituye un checkout ni procesa pagos.

## Requisitos

- Node.js 20 o superior.
- pnpm 11.19.0 mediante Corepack.
- Un proyecto Supabase controlado para desarrollo.

## Desarrollo local

1. Copiar `.env.example` como `.env` y completar las credenciales de un proyecto Supabase no productivo.
2. Aplicar las migraciones versionadas de `supabase/migrations/` con Supabase CLI.
3. Instalar y arrancar:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm start
```

Abrir `http://localhost:3000`. El servidor inserta el catálogo inicial únicamente cuando la tabla `products` está vacía. Si `ADMIN_PASSWORD` está configurada, también garantiza la cuenta indicada por `ADMIN_EMAIL` y su perfil administrador.

## Verificación

```bash
pnpm run check
pnpm test
pnpm audit --prod
```

El endpoint `GET /api/health` devuelve 200 sólo cuando la API puede consultar Supabase; devuelve 503 si la base no está disponible.

## Variables

`SUPABASE_URL` y `SUPABASE_SECRET_KEY` son obligatorias. La clave secreta es exclusiva del servidor: nunca debe aparecer en JavaScript público, commits, capturas ni mensajes. `NODE_ENV`, `PORT`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` y `WHATSAPP_NUMBER` son operativas; ver `.env.example`.

## Producción

`railway.toml` configura Railpack, `node server/server.js` y el healthcheck real. Railway no necesita un Volume: los datos persisten en Supabase. Antes de desplegar se deben aplicar y verificar las migraciones, RLS y advisors en un entorno controlado, configurar secretos en Railway y ejecutar un smoke test post-deploy.

El estado, los riesgos abiertos y el roadmap verificable están en `CURRENT_STATE.md`, `AUDIT.md` y `PLAN.md`.
