# Diseños de DREAMS

Documentación retrospectiva del diseño implementado, consolidada el 11/11/2026 sobre main `6e4647c9c6f44708a4e39a3b26e183718f2314e6`. No se presenta como una preentrega anterior al desarrollo ni acredita participación individual.

## Wireframe y navegación

[Wireframe completo y mapa de conexiones · PDF, 20 páginas](wireframe/wireframes.pdf).

Incluye 17 pantallas con distribución de escritorio y adaptaciones móviles, una introducción de alcance y dos mapas legibles del recorrido público, cuenta y Admin. Conserva portada estática, carrusel manual, cupón, checkout académico y las colecciones accesibles desde el menú. Los rótulos de versión y las antiguas notas de bloqueo Admin se actualizan sin afirmar una nueva QA remota autenticada. El icono de iPhone de PR69 no altera esas distribuciones.

Las láminas de pantallas usan formato horizontal amplio para conservar legibilidad y detalle. El mapa anterior, muy ancho, se reorganiza en dos páginas vectoriales. El PDF tiene marcadores de navegación y puede ampliarse sin perder texto.

## Diseño de base de datos / D.E.R.

[D.E.R., relaciones y estructura documentada · PDF, 15 páginas](base-de-datos/der.pdf).

Incluye el diagrama vectorial, PK/FK, cardinalidades, relaciones, discrepancias brand/marca y baseline/migraciones; las 76 columnas con tipo, nulabilidad y DEFAULT, 48 restricciones y 32 índices del esquema documentado. Distingue tablas activas, historial, asociaciones lógicas en JSON y la frontera auth.users.id.

Los metadatos corresponden al relevamiento documentado del 03/11/2026; esta limpieza no consulta de nuevo producción ni presenta el PDF como dump o esquema interno completo de Supabase. Las migraciones ejecutables permanecen en [app/supabase](../app/supabase/), sin cambios.

## Documentación requerida que sigue disponible

- [Instalación, manual de uso y explicación de la API](../README.md).
- [Declaración de IA y registro parcial de prompts](../DECLARACION_PROMPTS.md).

Por solicitud expresa, cada carpeta de diseño contiene sólo su PDF. Las fuentes y exportaciones auxiliares se retiraron después de consolidar la información necesaria; no se trasladaron a otra carpeta del repositorio. No se publica la web por esta limpieza.
