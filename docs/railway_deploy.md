# Publicar DREAMS en Railway

## Precondiciones

1. Revisar `supabase/migrations/` y aplicar la baseline con Supabase CLI sobre un proyecto controlado.
2. Verificar tablas, triggers, RLS y advisors antes de apuntar la aplicación a producción.
3. Mantener una estrategia de rollback y backup acorde al entorno.

## Servicio

Conectar Railway al repositorio. `railway.toml` usa Railpack, arranca con `node server/server.js` y consulta `/api/health`. No crear un Volume: la persistencia pertenece a Supabase.

Configurar como secretos/variables:

- `NODE_ENV=production`
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_NAME`
- `WHATSAPP_NUMBER`

`PORT` lo entrega Railway. No usar `SESSION_SECRET`, `DATABASE_DIR` ni variables de SQLite. Nunca subir `.env` ni exponer `SUPABASE_SECRET_KEY`.

## Validación

Antes de habilitar tráfico, comprobar:

- `/api/health` responde 200 con `{"status":"ok","api":true,"database":"ok"}`.
- Registro, login, renovación y logout.
- Catálogo, favoritos idempotentes, consulta por WhatsApp y CRUD Admin.
- Persistencia tras un redeploy y ausencia de errores/secrets en logs.
- Respuesta 503 del healthcheck cuando Supabase no está accesible.

El despliegue no está certificado sólo porque Railway finalice el build; registrar la evidencia y el rollback en `CURRENT_STATE.md`.
