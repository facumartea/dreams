# Auditoría de motion — referencia Xerjoff/Lamborghini

Referencia inspeccionada visualmente: `https://automobililamborghini.xerjoff.com/en-ar/products/avanguardia-eau-de-parfum`.

La referencia se usó únicamente para estudiar comportamiento. No se copiaron colores, tipografías, textos, imágenes, assets, modelos, composición ni código.

| Efecto observado | Coste técnico | Coste performance | Aplicación en DREAMS | Decisión |
|---|---:|---:|---|---|
| Hero a pantalla completa con producto y título en capas | Medio | Bajo/medio | Entrada escalonada y profundidad del hero existente | Sí |
| Producto que se desplaza más lento que el scroll | Medio | Bajo con `transform` | Frasco del hero y pieza editorial | Sí, reducido |
| Título inicial con escala muy marcada | Bajo | Bajo | Reveal por bloque, sin escala extrema | Parcial |
| Imágenes editoriales con desplazamientos opuestos | Medio | Bajo | `split-banner` y detalle de producto | Sí |
| Contenido fijado durante varios viewports | Alto | Medio | Podría dificultar compra y mobile | No |
| Transiciones largas entre escenas | Medio | Medio | Sólo timings breves en hero y headings | Parcial |
| Texto dividido palabra por palabra | Alto | Medio | Demasiado intrusivo para contenido dinámico | No |
| Fondo gráfico y halos propios de la campaña | Medio | Medio | Cambiaría la identidad DREAMS | No |
| WebGL/modelo 3D | Alto | Alto | No hay modelo propio autorizado de calidad | No |

## Implementación seleccionada

- Entrada escalonada de eyebrow, título, copy, CTA e imagen del hero.
- Profundidad por cursor sólo con puntero preciso y movimiento mínimo.
- Desplazamiento ligado al scroll con un único `requestAnimationFrame`.
- Reveal de headings mediante `clip-path`, opacidad y `translate3d`.
- Escala/desplazamiento de la imagen editorial sin modificar el layout.
- Spotlight, magnetic hover y cards existentes conservados y reutilizados.
- Touch elimina seguimiento del cursor y simplifica transformaciones.
- `prefers-reduced-motion` elimina entrada, parallax, zoom y mouse-follow.

## Performance

- Sin dependencias nuevas, WebGL, Three.js ni GSAP.
- `motion.js`: 4.884 → 7.398 bytes sin comprimir.
- `style.css`: 41.586 → 44.378 bytes sin comprimir.
- Total añadido: 5.306 bytes sin comprimir.
- Transferencia actual aproximada con gzip: motion 1.811 bytes; CSS 9.414 bytes.
- Sólo se animan `transform`, `opacity` y `clip-path`; no hay scroll artificial.

