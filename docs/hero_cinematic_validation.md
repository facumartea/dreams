# Presentación cinematográfica DREAMS

Fecha: 2026-10-07. Rama `codex/perfume-hero-cinema`, base `codex/cart-checkout-ux` de PR35/a04e732. PR35 sigue abierta y depende de PR34; esta mejora visual se revisa contra PR35, sin integrar otras ramas ni tocar checkout.

## Referencia y material existente

Se abrió https://www.apple.com/la/ en Chromium: portada negra, producto dominante, luz contenida, jerarquía clara y CTA contrastado. Se toma esa composición como inspiración, sin copiar contenido, archivos, marca ni animaciones de Apple.

La portada utiliza `public/assets/dreams-hero-1024.webp` (1024×1536 RGB opaco, 41.844 bytes), con derivado 640×960 (18.840 bytes). Fondo, humo y piedra están integrados: no hay recorte transparente, video ni vistas adicionales. CHANGELOG del 2026-08-30 lo describe como producto editorial original; el lettering DREAMS/EAU DE PARFUM ya era HTML. `docs/image_sources.md` describe contexto académico, pero no aporta una licencia individual o autorización comercial verificable para este asset. Se conserva el archivo sin modificar; derechos comerciales específicos siguen pendientes de acreditar.

## Implementación

- Foto y lettering en un único contenedor de proporción 2:3; sin deformación, cambio de colores ni rotación 3D ficticia. Se adapta el marco al fondo integrado y se suavizan únicamente sus bordes.
- Entrada CSS de texto/fotografía de 1–1,2 s; CTA visible y usable desde el inicio; el control de pausa queda fuera del contenedor que aparece animado. No se espera carga de JS para mostrar el CTA y no se bloquea scroll.
- Movimiento vertical total de 6 px en un ciclo de 12 s y luz ambiental discreta. Sin librerías nuevas, audio, video genérico, promociones ni cambios de copy.
- Botón accesible de 44 px para pausar/reanudar, teclado y foco visible. Movimiento continuo sólo empieza después de instalar el control. Pausa automática cuando la portada sale del viewport o la pestaña está oculta; se conserva la pausa elegida por el usuario.
- `prefers-reduced-motion: reduce`: presentación estática, incluso si cambia durante la sesión; conserva el centrado del lettering y no deja títulos invisibles.
- Menús, filtros y carrito permanecen intactos. Ajuste mínimo adicional: el email largo del footer puede partirse para evitar overflow a 1024 px.

## Evidencia local

`pnpm run check`: 37 archivos; `pnpm test`: 100/100 (incluye dos regresiones de pausa/preferencia/visibilidad); `pnpm run build:cloudflare`: correcto. El proyecto no configura lint ni comprobación de tipos independientes.

Chromium 390/430/768/1024/1440/1920×900: fotografía cargada, proporción 2:3, CTA visible, pausa estable, reanudación por Enter, cambio de preferencia reducido estático, sin pageerror ni overflow. Esta prueba usa archivos locales sobre APIs remotas de lectura del preview PR35: no equivale a publicar la mejora. La revisión remota posterior se registra aparte.

## Publicación y pendientes

Preview aislada pendiente de publicar; no cambiar Worker público, Pages, DNS, tráfico ni preview de carrito. Usar `wrangler preview --env preview --worker-name dreams-perfumes --name perfume-hero-review`, no `wrangler deploy`. Secret servidor heredado de Previews Base, sin leer/exportar su valor; Supabase existente y checkout deshabilitado.

Pagos sandbox y Auth/Admin autenticados continúan pendientes de un entorno y cuentas seguros; WhatsApp no tiene número válido configurado. No se ejecutan pedidos, cobros, mensajes, registros, seeds, migraciones ni escrituras comerciales.

Para video futuro se necesita material autorizado del mismo perfume (filmación real de producto, luz controlada, fondo coherente, alta resolución, encuadres para móvil y escritorio). Una foto única no alcanza para una rotación completa. El carrusel separado sigue pendiente de un segundo banner distinto; recomendado 1024×1536 o mayor, sin promociones inventadas.

Recuperación: retirar/enmendar esta preview aislada o publicar su commit anterior, sin cambiar tráfico. No se presenta Railway offline como respaldo. Producción requiere revisión de la cadena PR34→PR35→esta PR y sus pendientes comerciales/seguridad antes de promover.
