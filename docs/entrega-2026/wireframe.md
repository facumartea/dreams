# Wireframe y conexiones

La imagen adjunta por el usuario es una propuesta, no evidencia de ejecución. Se reconstruyó como [SVG editable](wireframe.svg) y [PNG versionado](wireframe.png), conservando sus nueve pantallas y las conexiones transversales. Esta es una adaptación por IA, no un dibujo atribuido a los alumnos.

Se agregaron las rutas reales (`producto.html?id=…`, `checkout-resultado.html`, `/admin`), opiniones en Inicio y el carrusel de colecciones del candidato. Se aclaró que el checkout académico no crea pedidos comerciales ni modifica stock. La tarjeta de Cuenta no otorga roles: el servidor autoriza cada acceso.

Inicio, Nosotros y footer conectan por navegación global; el usuario puede volver al catálogo desde cualquier pantalla. Los enlaces de colecciones son filtros de `/catalogo.html`, no sitios independientes. Cuenta controla sesión, carrito por UUID y opiniones propias. WhatsApp abre un enlace externo; no es una API de mensajería integrada. No hay Favoritos en la navegación final.

Las rutas están contrastadas con `public/*.html`, `views/admin.html`, `server/app.js` y `pages/official-backend.mjs`. El dibujo representa el candidato; su funcionamiento autenticado remoto sigue bloqueado. El wireframe histórico `docs/wireframe.md` queda sustituido por éste para la entrega 2026.
