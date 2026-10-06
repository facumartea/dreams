Documentación vigente de hosting: [Cloudflare: migración y rollback](cloudflare_migration.md) y [evidencias y pendientes](cloudflare_validation.md). El estado de sesión está en ../CURRENT_STATE.md. Los documentos Railway se conservan como referencia histórica.

# Guía rápida DREAMS

Consultar primero `CURRENT_STATE.md`, `AGENTS.md` y las guías Cloudflare enlazadas arriba. `docs/documentacion.md` y `docs/railway_deploy.md` conservan información histórica que debe contrastarse con el código actual.

Stack actual: Node.js 20+, Express 5, Supabase Auth/Postgres, JavaScript, HTML/CSS, pnpm, Helmet y Morgan. No se usa SQLite, `express-session`, bcrypt ni una API de cotización.

Para ejecutar localmente se necesita un proyecto Supabase de desarrollo, `.env` basado en `.env.example`, la baseline aplicada y:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm start
```

Abrir `http://localhost:3000`; el panel está en `/admin` y requiere iniciar sesión con el administrador configurado. No hay una contraseña predeterminada versionada.
