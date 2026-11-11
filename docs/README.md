# Diseños de DREAMS

Esta carpeta conserva sólo el wireframe, el mapa de navegación y el diseño de base de datos, con sus fuentes editables. La instalación, el manual de uso y la explicación de la API están en el [README principal](../README.md). La [declaración de IA y registro parcial de prompts](../DECLARACION_PROMPTS.md) está en la raíz.

## Versión y alcance

Se revisaron los archivos de main `03a0ee1498040b98ddb7ca4126d24631a37b88ed`. Estos diseños son **documentación retrospectiva del diseño implementado**, no una preentrega anterior al desarrollo ni una acreditación de participación individual.

Las láminas vigentes incluyen portada estática, carrusel manual de destacados con indicador sólo accesible, ausencia de vistos recientemente, cabeceras de colecciones sin párrafos, cupón y checkout académico con envío de $0. No se conserva otro wireframe histórico como alternativa vigente. La revisión no modifica la interfaz ni equivale a QA remota autenticada.

## Wireframe de pantallas

[PDF vectorial de 17 láminas](wireframe/wireframes.pdf). Cada lámina incluye distribución de escritorio y una adaptación móvil representativa. Los PNG permiten verlas sin un editor y los SVG son las fuentes editables; no son duplicados exactos.

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

## Mapa de navegación

[PDF](wireframe/mapa-navegacion.pdf) · [PNG](wireframe/mapa-navegacion.png) · [fuente DOT editable](wireframe/mapa-navegacion.dot).

Muestra entrada desde catálogo/detalle al carrito, checkout y confirmación; cuenta y acceso Admin condicionado al rol; y salida externa a WhatsApp. No supone autorización por ocultar botones ni envío automático de mensajes.

## Diseño de base de datos / D.E.R.

[Alcance y diccionario](base-de-datos/README.md) · [PDF](base-de-datos/der.pdf) · [PNG](base-de-datos/der.png) · [fuente DOT editable](base-de-datos/der.dot) · [estructura documentada](base-de-datos/esquema.json).

Se conserva la versión basada en los metadatos estructurales documentados el 03/11/2026: nueve tablas de public y auth.users.id como frontera de Auth. Distingue FK reales, cardinalidades, nulabilidad y asociaciones lógicas dentro de JSON. No es un dump ni el esquema interno completo de producción. No se consultaron datos personales ni se releyó la base remota para esta limpieza.

La migración posterior que modulariza la RPC del carrito no cambia tablas, columnas ni relaciones del diagrama. El diccionario explica la diferencia histórica brand/marca y las tablas históricas o retiradas; no se sustituye ese alcance por una afirmación de esquema remoto completo.

Las migraciones ejecutables permanecen en [app/supabase](../app/supabase/), fuera de esta carpeta. No se alteran código, assets, dependencias, hosting ni configuración de Auth.
