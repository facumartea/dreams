# Diseños de DREAMS

Documentación retrospectiva del diseño implementado. Esta edición parte de main `3305d56dcf307ee69436d9393adef1b0bd6382b6`; no acredita una preentrega ni una nueva verificación remota.

## Wireframe y navegación

[Wireframe y mapa de conexiones · PDF, 19 páginas](wireframe/wireframes.pdf).

Se retiró únicamente la primera página del PDF anterior: era la portada con introducción e índice, no una pantalla de la aplicación. Permanecen las 17 pantallas de escritorio/móvil y los dos mapas, sin rediseñarlas. Se conserva su carácter retrospectivo y la numeración original de las láminas (2/20 a 20/20). Portada estática, carrusel manual, cuenta, Admin, carrito, cupón y checkout académico siguen representados.

## Diseño de base de datos / D.E.R.

[D.E.R. · una lámina PDF](base-de-datos/der.pdf).

Es exactamente la segunda página del PDF anterior, titulada «DREAMS · D.E.R. remoto verificado 03/11/2026 · sólo metadatos». Se extrajo del original vectorial del repositorio, no de una captura. No tiene portada ni anexos y conserva sus tablas, campos principales, PK/FK y cardinalidades sin recortes. Mantiene su pie original; es una sola página.

El título describe un relevamiento histórico del 03/11/2026, no una consulta nueva a producción ni el esquema interno completo de Supabase. El diagrama separa tablas activas e históricas y muestra sólo auth.users.id como frontera de Auth. Los campos JSON no se convierten en relaciones FK ficticias. El baseline usa brand y el esquema documentado usa marca: el adaptador conserva la API. La documentación completa previa permanece en el [historial del PDF](https://github.com/facumartea/dreams/blob/3305d56dcf307ee69436d9393adef1b0bd6382b6/docs/base-de-datos/der.pdf); no se oculta ni se duplica en otra carpeta.

La estructura ejecutable sigue en [app/supabase](../app/supabase/), sin cambios. Los PDF no reemplazan migraciones ni autorizan aplicarlas.

## Manual, API y declaración

- [Instalación y ejecución local](../README.md#instalación-y-ejecución).
- [Manual de uso](../README.md#manual-de-uso).
- [API externa y recorrido](../README.md#api-externa-y-recorrido).
- [Declaración y bitácora parcial de prompts](../DECLARACION_PROMPTS.md).

Cada carpeta de diseño contiene únicamente su PDF. No se agregan copias, imágenes ni fuentes auxiliares.
