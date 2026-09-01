# Auditoría de dirección de arte y motion — DREAMS

Fecha: 2026-09-01

## Alcance observado

Se revisaron la portada, catálogo, detalle, carrito, checkout, cuenta y Nosotros, además del sistema visual y motion.js existentes. La referencia externa se utilizó únicamente para estudiar ritmo, profundidad y transiciones; no se copiaron assets, tipografías, composición, código ni branding.

## Inventario y decisión

| Efecto | Estado DREAMS | Coste técnico | Coste performance | Decisión |
|---|---|---:|---:|---|
| Entrada escalonada del hero | Existía y funciona | Bajo | Bajo | Conservar y normalizar timings |
| Profundidad por cursor | Existía y funciona | Bajo | Bajo | Extender con luz radial sutil |
| Parallax de scroll | Existía y funciona | Bajo | Bajo | Conservar; no multiplicar instancias |
| Reveal de títulos y cards | Existía y funciona | Bajo | Bajo | Reutilizar en Scent Trail |
| Spotlight editorial | Existía en banners | Bajo | Bajo | Conservar; no aplicar globalmente |
| Sticky de producto | Existía en detalle | Bajo | Bajo | Conservar sin scroll artificial |
| Storytelling olfativo | Notas planas | Medio | Bajo | Implementar con datos reales |
| WebGL / Three.js | No existe; sin modelo adecuado | Alto | Alto | Descartar |
| Vista 360° | Sin secuencia de imágenes | Alto | Medio/alto | Descartar hasta contar con assets |
| Transiciones largas entre páginas | No existe | Medio | Medio | Descartar: retrasaría la compra |

## Implementación seleccionada

- Tokens centrales para duración y easing, compatibles con las variables existentes.
- Luz champagne muy tenue en el hero, vinculada al mismo requestAnimationFrame del movimiento actual.
- DREAMS Scent Trail en la ficha de producto con las notas reales de salida, corazón y fondo.
- Timeline horizontal en escritorio y vertical en móvil, sin ocultar información detrás de hover.
- Reveals reutilizados mediante el mismo IntersectionObserver.
- Fallback completo con prefers-reduced-motion.

## Performance

- Sin dependencias nuevas.
- Sin WebGL, canvas ni listeners de scroll adicionales.
- El puntero reutiliza el único frame ya programado para el hero.
- CSS después: 46.509 bytes brutos / 9.882 bytes gzip.
- motion.js después: 7.750 bytes brutos / 1.881 bytes gzip.
- Variación gzip frente al checkpoint documentado anterior: aproximadamente +538 bytes combinados.

## Pendientes visuales

- QA visual real de esta implementación después de deploy.
- Matriz responsive completa en 390×844, 430×932, 768×1024, 1024×768, 1440×900 y 1920×1080.
- Medición Lighthouse antes/después en producción.
- No implementar 3D/360° hasta disponer de assets propios y adecuados.
