# Auditoría específica — expansión premium DREAMS

Fecha: 2026-08-31. Esta auditoría amplía el roadmap existente; no reemplaza `AUDIT.md` ni reinicia F0.

## Matriz de estado

| Funcionalidad | Estado actual | Qué se conserva | Qué se modifica | Qué falta | Riesgos |
|---|---|---|---|---|---|
| Hero premium | Existe y funciona; necesitaba mejora | Hero, fotografía responsive, lettering y CTA | Parallax leve, capas, reveal y reducción de movimiento | QA visual en seis viewports y medición FPS | Movimiento excesivo o recorte móvil |
| Cards | Existe y funciona; necesitaba mejora | Una sola `product-card`, navegación, carrito, precio y stock | Hover de imagen/CTA y feedback de carrito | Variantes editorial/related sobre la misma base | Duplicar componentes o esconder acciones en touch |
| Quiz | No existe | Catálogo y campos reales de producto | Compartirá un motor determinístico con el configurador | Preguntas, rangos derivados del catálogo, UI y tests | Coincidencias arbitrarias o preferencias innecesarias |
| Recomendaciones | No existe | `family`, notas, género, intensidad, precio y destacados | Servicio determinístico y explicable | Score, endpoint, fallback y ubicaciones limitadas | Sesgo por datos libres/inconsistentes |
| Dashboard Admin | Existe parcialmente | Panel, autorización y conteos reales actuales | Consultas agregadas sobre pedidos reales | Ingresos, ticket, ventas, cupones, períodos y gráficos | Consultas costosas o métricas engañosas |
| Fidelidad | No existe | Usuarios y pedidos aprobados | Se integrará con pedidos mediante operaciones idempotentes | Reglas de puntos, niveles, historial, tablas y Admin | Requiere definir beneficios comerciales reales |
| Timeline de pedido | Existe base parcial | Pedido, estado y fechas existentes | Historial append-only y UI de seguimiento | Estados logísticos, permisos Admin, tracking e historial | Simular envíos que no ocurrieron |
| 360° / interacción | No hay assets 360 ni modelo 3D | Fotos actuales y hero | Pseudo-3D/spotlight liviano como fallback | 360° real sólo con fotografías o modelo autorizado | Bundle pesado o experiencia falsa |
| Configurador por notas | No existe | Notas de salida/corazón/fondo del catálogo | Compartirá motor con quiz, con control de afinidad | Normalizar taxonomía, UI y resultados vacíos | Notas libres y acentos producen duplicados |
| Tema claro/oscuro | No existe | Tokens oscuros premium actuales | Tokens marfil/carbón, preferencia del sistema y persistencia | Switch, prevención de flash y QA de todas las pantallas | Contraste roto o pantallas parcialmente tematizadas |

## Decisiones de arquitectura

1. Reutilizar `product-card`; no crear componentes paralelos.
2. Quiz y configurador compartirán un motor de recomendación puro, determinístico y testeable.
3. Los porcentajes de compatibilidad sólo se mostrarán si derivan de una fórmula documentada.
4. Puntos, totales, descuentos, métricas y estados se calculan o validan en servidor.
5. No crear un segundo Admin. Las nuevas vistas se integrarán en la navegación actual.
6. No crear un 360° falso. Hasta disponer de assets adecuados, la experiencia usa CSS/JS liviano y fallback estático.
7. No agregar Three.js, GSAP ni una librería de gráficos antes de medir la necesidad y el coste.

## Orden seguro

1. Publicar y verificar checkout demo + motion actual.
2. Crear motor de recomendación puro y taxonomía normalizada sin migración destructiva.
3. Integrar productos relacionados, quiz y configurador sobre el mismo motor.
4. Implementar tema claro/oscuro con tokens existentes.
5. Diseñar historial de estados y fidelidad tras definir reglas comerciales y revisar pedidos reales.
6. Extender Dashboard con agregados reales.
7. Evaluar 360° real únicamente cuando existan assets autorizados.
8. Ejecutar performance, accesibilidad, matriz responsive y QA final.

## APIs públicas evaluadas

Se revisó `public-apis/public-apis` como catálogo, no como dependencia. Geocoding/direcciones y conversión de moneda podrían ser útiles cuando DREAMS tenga logística o múltiples monedas reales, pero hoy no existe ese requerimiento ni un proveedor con SLA acordado. No se integró ninguna API para evitar CORS, privacidad, disponibilidad y mantenimiento sin beneficio funcional comprobable.
