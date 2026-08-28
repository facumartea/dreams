# Guía rápida DREAMS

La guía operativa principal está en el `README.md` de la raíz. La arquitectura y los endpoints vigentes están en `docs/documentacion.md`; el despliegue controlado está en `docs/railway_deploy.md`.

Stack actual: Node.js 20+, Express 5, Supabase Auth/Postgres, JavaScript, HTML/CSS, pnpm, Helmet y Morgan. No se usa SQLite, `express-session`, bcrypt ni una API de cotización.

Para ejecutar localmente se necesita un proyecto Supabase de desarrollo, `.env` basado en `.env.example`, la baseline aplicada y:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm start
```

Abrir `http://localhost:3000`; el panel está en `/admin` y requiere iniciar sesión con el administrador configurado. No hay una contraseña predeterminada versionada.
