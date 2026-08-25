# DREAMS — Perfumería multimarca

Proyecto académico de e-commerce de perfumes desarrollado con Node.js, Express, SQLite, JavaScript y APIs.

## Funciones

- Catálogo multimarca con 30+ perfumes.
- Diseñadores y nicho: Creed, Xerjoff y Montale.
- Buscador y filtros por marca, género, categoría y precio.
- Página individual con notas e intensidad.
- Favoritos con base de datos.
- Carrito con localStorage, cantidades, eliminación y total.
- Login y registro.
- Panel de administrador con dashboard, CRUD de productos, stock, usuarios, favoritos, opiniones y consultas.
- Consultas por WhatsApp.
- Opiniones.
- API REST propia.
- API externa de cotización USD/ARS.
- Despliegue preparado para Railway.
- SQLite preparada para persistencia en Railway Volume.

## Desarrollo local

```bash
npm install
npm run seed
npm start
```

Abrir `http://localhost:3000`.

## Railway

1. Subir el proyecto a GitHub.
2. Crear un proyecto en Railway y elegir Deploy from GitHub repo.
3. Configurar variables desde `.env.example`.
4. Crear un Volume y montarlo en `/data`.
5. Generar un dominio público.

La app detecta automáticamente `RAILWAY_VOLUME_MOUNT_PATH` y guarda `dreams.db` en el volumen persistente.

## Administrador

La cuenta inicial se crea al arrancar si no existe. Usar las variables `ADMIN_EMAIL` y `ADMIN_PASSWORD` en Railway. No subir un `.env` real a GitHub.
