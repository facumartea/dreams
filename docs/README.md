# DREAMS — Perfumería multimarca

Proyecto académico de una perfumería online multimarca llamada DREAMS.

## Tecnologías

- Node.js
- Express
- SQLite con better-sqlite3
- JavaScript
- HTML5 semántico
- CSS3 responsive
- Fetch API
- API REST propia
- API externa de cotización de moneda para demostrar integración con un servicio externo
- LocalStorage para carrito
- Express Session para login
- bcryptjs para contraseñas
- Helmet y Morgan

## Instalación

1. Instalar Node.js 20 o superior.
2. Abrir una terminal en la carpeta del proyecto.
3. Copiar `.env.example` como `.env`.
4. Ejecutar `npm install`.
5. Ejecutar `npm run seed`.
6. Ejecutar `npm start`.
7. Abrir `http://localhost:3000`.

## Administrador

Correo inicial: `admin@dreamsperfumes.com`

Contraseña inicial: `DreamsAdmin2026!`

Se recomienda cambiar estos datos en `.env` antes de usar el proyecto fuera del entorno académico.

## Panel

Entrar desde `http://localhost:3000/admin` después de iniciar sesión con el correo administrador.

Desde el panel se pueden:

- crear productos
- editar productos
- eliminar productos
- cambiar precios
- cambiar notas
- cambiar intensidad
- cambiar imágenes
- cambiar género
- cambiar categoría
- destacar productos

La información se guarda directamente en SQLite a través de la API REST de Node.js.

## WhatsApp

Las consultas de cada perfume y del carrito apuntan a:

`+54 294 450 2390`

## Imágenes

El proyecto usa URLs externas de imágenes de perfumes y fotografía editorial. Algunas referencias visuales fueron localizadas mediante búsqueda web/Google Images y otras provienen de páginas oficiales o bancos de imágenes como Unsplash. Para un proyecto comercial real se deberían revisar licencias y derechos de uso.
