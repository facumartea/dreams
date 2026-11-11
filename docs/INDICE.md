# Documentación de entrega · DREAMS

La aplicación está en app/; la instalación y ejecución se explican en el README raíz. Se aplica la modalidad HTML/CSS/JavaScript consumiendo API de la consigna 2025; no se traslada la exigencia SQLite de otra modalidad o edición. No se incluyen copias de las rúbricas.

## Manual, API y base de datos

- [Manual de uso](manual.md) / [PDF](manual.pdf), sin capturas por solicitud del usuario.
- [API utilizada: enlace público y explicación del recorrido](api.md).
- [D.E.R. y diccionario](base-de-datos.md) / [PDF](base-de-datos/der.pdf) / [PNG](base-de-datos/der.png) / [fuente DOT editable](base-de-datos/der.dot).
- [Esquema estructural e índices](base-de-datos/esquema.json): metadatos documentados, sin datos privados; ver alcance del diccionario.

## Wireframe y conexiones

**Documentación retrospectiva del diseño implementado.** No se presenta como una preentrega anterior al desarrollo ni acredita dominio o participación individual. Las láminas conservan la distribución documentada y sus adaptaciones de escritorio/móvil; no se vuelve a certificar la oficial por reorganizar estos archivos.

- [Wireframe PDF vectorial: 17 láminas](wireframe/wireframes.pdf).
- Mapa de navegación: [PDF](wireframe/mapa-navegacion.pdf), [PNG](wireframe/mapa-navegacion.png), [fuente DOT editable](wireframe/mapa-navegacion.dot).

| Pantalla | Ruta visible | PNG | Fuente SVG editable |
|---|---|---|---|
| Inicio | `/` | [PNG](wireframe/wireframe-01.png) | [SVG](wireframe/01-inicio.svg) |
| Catálogo | `/catalogo.html` | [PNG](wireframe/wireframe-02.png) | [SVG](wireframe/02-catalogo.svg) |
| Diálogo de filtros | `Catálogo → Filtros` | [PNG](wireframe/wireframe-03.png) | [SVG](wireframe/03-filtros.svg) |
| Detalle | `/producto.html?id=…` | [PNG](wireframe/wireframe-04.png) | [SVG](wireframe/04-detalle.svg) |
| Login | `/cuenta.html` | [PNG](wireframe/wireframe-05.png) | [SVG](wireframe/05-login.svg) |
| Registro | `/cuenta.html → Crear cuenta` | [PNG](wireframe/wireframe-06.png) | [SVG](wireframe/06-registro.svg) |
| Carrito | `/carrito.html` | [PNG](wireframe/wireframe-07.png) | [SVG](wireframe/07-carrito.svg) |
| Checkout | `/checkout.html` | [PNG](wireframe/wireframe-08.png) | [SVG](wireframe/08-checkout.svg) |
| Confirmación | `/checkout-resultado.html?presentation=1` | [PNG](wireframe/wireframe-09.png) | [SVG](wireframe/09-confirmacion.svg) |
| Nosotros / contacto | `/nosotros.html` | [PNG](wireframe/wireframe-10.png) | [SVG](wireframe/10-nosotros.svg) |
| Admin · Productos | `/admin · acceso condicionado por rol` | [PNG](wireframe/wireframe-11.png) | [SVG](wireframe/11-admin-productos.svg) |
| Admin · Disponibilidad baja | `/admin · acceso condicionado por rol` | [PNG](wireframe/wireframe-12.png) | [SVG](wireframe/12-admin-disponibilidad-baja.svg) |
| Admin · Cupones | `/admin · acceso condicionado por rol` | [PNG](wireframe/wireframe-13.png) | [SVG](wireframe/13-admin-cupones.svg) |
| Admin · Pedidos | `/admin · acceso condicionado por rol` | [PNG](wireframe/wireframe-14.png) | [SVG](wireframe/14-admin-pedidos.svg) |
| Admin · Usuarios | `/admin · acceso condicionado por rol` | [PNG](wireframe/wireframe-15.png) | [SVG](wireframe/15-admin-usuarios.svg) |
| Admin · Consultas | `/admin · acceso condicionado por rol` | [PNG](wireframe/wireframe-16.png) | [SVG](wireframe/16-admin-consultas.svg) |
| Admin · Opiniones | `/admin · acceso condicionado por rol` | [PNG](wireframe/wireframe-17.png) | [SVG](wireframe/17-admin-opiniones.svg) |

El Admin está condicionado al rol; el checkout conserva su entrada desde el carrito y la salida a confirmación/catálogo. WhatsApp es un enlace externo, sin envío automático. Las rutas de estas láminas siguen siendo las de la aplicación; mover código a app/ no las modifica.

## Estudio y declaración de IA solicitados

- [Guía de defensa](defensa.md), [Word editable](defensa.docx) y [PDF](defensa.pdf): respuestas, archivos reales, funciones y endpoints.
- [Declaración de IA y registro parcial de prompts](registro-prompts.md). Identifica originales, extractos, resúmenes y datos faltantes; también conserva antecedentes únicos de seguridad.

Estos materiales de estudio no demuestran asistencia, preentregas, autoría manual o capacidad individual de defensa. La rúbrica y el profesor determinan la evaluación; no se garantiza una nota ni aprobación. No se genera ZIP ni se envía material a Classroom.
