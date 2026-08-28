# Supabase, GitHub y Railway

La fuente de verdad de base de datos es `supabase/migrations/`, no `supabase/schema.sql`. Aplicar la migración con Supabase CLI primero en un entorno controlado y revisar el diff antes de promoverla. Después verificar RLS, triggers, integridad, advisors y un flujo autenticado real.

GitHub ejecuta instalación frozen, audit, sintaxis y pruebas en cada cambio cubierto por `.github/workflows/ci.yml`. Sólo integrar una rama cuando CI esté verde y los riesgos pendientes estén documentados.

Railway recibe `SUPABASE_URL` y `SUPABASE_SECRET_KEY` como secretos del servidor, además de las variables operativas de `.env.example`. No requiere Volume. El primer arranque inserta el catálogo únicamente si `products` está vacío y crea/actualiza el administrador sólo si `ADMIN_PASSWORD` está configurada.

Validar el dominio con `/api/health`, luego autenticación, favoritos, Admin y persistencia. Nunca copiar claves secretas a GitHub, frontend, capturas o chat.
