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

## Publicación y evidencia remota

**URL verificada: https://perfume-hero-review-dreams-perfumes.dreams-perfumes.workers.dev/**.

Preview `perfume-hero-review`, id `d147f1fe5f5740bd840401b3f3e28ded`, deployment `697999ef-22de-4b82-ae61-9e8232f94d65`. Commit desplegado **b3f56b5c8e013ac452b662478cd3927653e8880e**, con [CI SUCCESS 37568051539](https://github.com/facumartea/dreams/actions/runs/37568051539) y 100/100 tests, audit, check y builds Workers/Pages. PR visual [#36](https://github.com/facumartea/dreams/pull/36), base PR35 (`codex/cart-checkout-ux`). El checkpoint documental posterior no modifica el código publicado.

QA **remota sin interceptar/sustituir assets**, Chromium Linux:

- 390/430/768/1024/1440/1920×900: imagen cargada, proporción 2:3, pausa sin cambios de transform durante la pausa, reanudación por Enter, reducción de movimiento estática y pausa elegida conservada al cambiar preferencia. Sin pageerror ni overflow.
- CTA y pausa con opacidad 1 desde que el control se instala; pausa fuera del contenedor de entrada. Movimiento automático observado por cambios reales de transform entre dos capturas de estado.
- 390/1440: menú y Escape, búsqueda real/vacía, marca, género, categoría, precio máximo, orden ascendente/descendente y reset. Catálogo real con 46 productos.
- Carrito: agregar dos productos, cantidades +/−, eliminar, vaciar, persistir por reload, contador y subtotal autoritativo; aclaración de envío, checkout deshabilitado. Sin errores JS ni respuestas API fallidas en el recorrido normal. No se crearon pedidos.
- Health 200 `api:true/database:ok`. Cuatro assets (HTML/CSS/motion/hero WebP) coinciden byte por byte con la fuente; imagen sin alterar y frontend modificado sin referencias/patrones de Secret ni SDK privilegiado.
- Cloudflare confirma `SUPABASE_SECRET_KEY` como secret_text, Supabase `nwsmbemwtexmrtpkgxrz`, APP_BASE_URL y APP_ORIGINS exactos de esta preview, CHECKOUT_SCHEMA_READY=false y DEMO_AUTO_CONFIRM_EMAIL=false; sin leer el secreto.

Capturas de escritorio, móvil y móvil reducido, y grabación breve guardadas fuera del repositorio en `/workspace/dreams-visual-evidence/`. Verificación en Chromium emulado; Safari/iOS, dispositivo físico, Core Web Vitals y logs específicos de runtime no comprobados. No ampliar esta evidencia a Auth/Admin autenticados o pagos.

Worker público conserva `f73d5087-ac19-4168-890b-6da3abb6b635` al 100%; Pages conserva `ae2f7932-aefe-48b2-a9e9-8c3597b607f9`; preview carrito conserva deployment `1537279f-9851-4532-b72a-4d60f7132524`. No se cambiaron DNS, tráfico ni datos.

## Configuración y pendientes

No cambiar Worker público, Pages, DNS, tráfico ni preview de carrito. Usar `wrangler preview --env preview --worker-name dreams-perfumes --name perfume-hero-review`, no `wrangler deploy`. Secret servidor heredado de Previews Base, sin leer/exportar su valor; Supabase existente y checkout deshabilitado.

Pagos sandbox y Auth/Admin autenticados continúan pendientes de un entorno y cuentas seguros; WhatsApp no tiene número válido configurado. No se ejecutan pedidos, cobros, mensajes, registros, seeds, migraciones ni escrituras comerciales.

Para video futuro se necesita material autorizado del mismo perfume (filmación real de producto, luz controlada, fondo coherente, alta resolución, encuadres para móvil y escritorio). Una foto única no alcanza para una rotación completa. El carrusel separado sigue pendiente de un segundo banner distinto; recomendado 1024×1536 o mayor, sin promociones inventadas.

Recuperación: retirar/enmendar esta preview aislada o publicar su commit anterior, sin cambiar tráfico. No se presenta Railway offline como respaldo. Producción requiere revisión de la cadena PR34→PR35→esta PR y sus pendientes comerciales/seguridad antes de promover.
