# Publicar DREAMS en Railway

La aplicación está preparada para que una persona pueda entrar desde celular, otra computadora o cualquier navegador sin tener el proyecto descargado.

## 1. Crear repositorio

Subir toda la carpeta `dreams_node` a un repositorio de GitHub. El `package.json` debe quedar en la raíz del repositorio.

## 2. Crear proyecto en Railway

En Railway elegir `New Project` → `Deploy from GitHub repo` y seleccionar el repositorio.

Railway detecta una aplicación Node.js y utiliza el `start` de `package.json`.

## 3. Variables

En el servicio abrir `Variables` y crear:

- `NODE_ENV=production`
- `SESSION_SECRET=` una cadena larga y aleatoria
- `ADMIN_EMAIL=` correo del administrador
- `ADMIN_PASSWORD=` contraseña del administrador
- `ADMIN_NAME=Administrador DREAMS`
- `WHATSAPP_NUMBER=542944502390`
- `DATABASE_DIR=/data`

No subir el `.env` real a GitHub.

## 4. Base de datos persistente

Crear un `Volume` en Railway y conectarlo al servicio con mount path `/data`.

La aplicación detecta `RAILWAY_VOLUME_MOUNT_PATH` y utiliza ese directorio para `dreams.db`.

Esto es importante: sin un almacenamiento persistente, una base SQLite dentro del contenedor puede perder cambios al recrearse el servicio.

## 5. Dominio público

En `Settings` → `Networking` elegir `Generate Domain`.

Railway asignará una URL pública tipo:

`https://tu-app.up.railway.app`

Esa URL se puede abrir desde celular y otras computadoras.

## 6. Healthcheck

El archivo `railway.toml` configura:

`/api/health`

como healthcheck.

## 7. Panel admin

Entrar a:

`https://TU-DOMINIO.up.railway.app/admin.html`

Si no hay sesión de administrador, el servidor redirige a `cuenta.html?admin=1`.

## 8. Actualizaciones

Si el servicio está conectado a GitHub, los nuevos commits pueden volver a desplegarse automáticamente.
