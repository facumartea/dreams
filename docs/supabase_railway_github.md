# Publicación de DREAMS

## 1. Supabase `dreams-project`

En el proyecto **dreams-project**, abrí **SQL Editor**, pegá y ejecutá `supabase/schema.sql` completo. Crea las tablas, índices y políticas RLS; no elimina datos existentes.

En **Settings → API**, copiá la URL del proyecto y la clave `secret` (o la `service_role` legacy). Esta clave es solo del servidor: nunca la incluyas en frontend, commits ni capturas.

## 2. Variables de Railway

En el servicio DREAMS creá estas variables, tomando los nombres de `.env.example`:

- `NODE_ENV=production`
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD` (contraseña inicial del administrador; guardala en Railway, no en Git)
- `ADMIN_NAME`
- `WHATSAPP_NUMBER=542944502390`

El primer inicio carga los 31 perfumes y crea el administrador indicado. Los siguientes despliegues no duplican el catálogo.

## 3. GitHub y Railway

Subí el contenido de esta carpeta a la rama principal del repositorio existente. Railway detecta `pnpm-lock.yaml` y el `railway.toml`; no requiere Volume porque SQLite ya no se usa. Después, en Railway, elegí ese repositorio como fuente y generá un dominio público desde **Settings → Networking → Generate Domain**.

Comprobación final: abrí `https://TU-DOMINIO/api/health`. Debe responder `database: "supabase"`. Luego registrá una cuenta, marcá un favorito y verificá que siga presente tras recargar.
