# Portada de video a pantalla completa — estado vigente 2026-10-08

Alcance sólo preview `academic-review`, misma rama `codex/preview-perfume-video`/PR40 dependiente de PR39 → PR38 → PR37 → PR34. Oficial Pages900a4bd8/c22a5d0/backend40e7b0a3/b049934 conserva su hero estático; no ejecutar deploy Pages ni Worker production. Los apartados siguientes sobre veinte segundos/dos columnas/pausa son evidencia histórica sustituida por esta tanda.

Video ocupa ancho completo/altura visible bajo header (100svh menos78px/70px); capas absolutas, object-fit:cover sin deformación/márgenes/recuadro/barras. Texto actual superpuesto con degradado horizontal en escritorio y inferior en móvil, CTA operativo. Posición70% desktop/80% móvil conserva el frasco en el recorte; cover recorta entorno y parte del humo en formato vertical. Menú sigue sticky y navegación disponible; no fullscreen API ni bloqueo de scroll. Ajustes para pantallas bajas/horizontal; sin movimiento CSS adicional.

Fuente original del usuario recortada a segundos12–17, cinco segundos exactos, velocidad24fps original, pulverización principal conservada; no aceleración/interpolación/video ajeno. MP4 H2641280×720/yuv420p/faststart/sin audio,696.507bytes, SHA256cb6aa9a6c29139def4baf5026680276ecb189aefdfd9eb5e56562c08cc484536. Poster14.320bytes/final17.994bytes derivados del nuevo tramo.

Retirados botón, eventos y estilos de pausa/reanudación/reproducir. Sin controls, sin loop; autoplay programático silenciado/playsinline, una vez por carga inicial. Al finalizar conserva frame real; retorno mantiene poster final/sin descarga y recarga explícita permite una reproducción nueva. Memoria sessionStorage v2 separa el nuevo clip del anterior. Reduced-motion/saveData no descargan MP4; autoplay rechazado/error muestran poster sin acción ni reintento automático. Metadata de más de cinco segundos detiene reproducción y usa respaldo para evitar que un asset futuro prolongue movimiento sin pausa. BFCache/pagehide no reanuda automáticamente. Sin storage la memoria entre documentos continúa limitada al soporte disponible.

Cambios versionados: CSS hero, controlador, tres assets, pruebas del controlador, CURRENT_STATE/PLAN/CHANGELOG y este documento; catálogo/carrito/API/Auth/pagos/configuración/Secret sin cambios. Regresión nueva rechaza asset de duración mayor de cinco segundos; prueba de autoplay reemplaza expectativa de botón por respaldo permanente. Check46/121tests/builds Workers y Pages correctos. QA local inicial320/390/768/844horizontal/1440 y final390/1440 con encuadre corregido pasó: reproducción natural5s/frame final/retorno/reload, overlay/CTA y fallback/preferencias. Sin pageerrors/overflow. Pruebas remotas se registran al publicar. Recuperación: redeployar sólo academic-review desde41907ba con su config; deployment anterior70089602/URL inmutable conservados. No tocar oficial/Secrets ni borrar deployments. Rollback no ejecutado.

# Evidencia histórica — primera versión de veinte segundos

# Video DREAMS exclusivo de preview

Rama `codex/preview-perfume-video`, dependiente de PR39 → PR38 → PR37 → PR34, sin merges. Oficial preservada: https://dreams-perfumes.pages.dev/, proxy c22a5d0/deployment 900a4bd8 y backend b049934/deployment 40e7b0a3. Sólo se publica `academic-review`.

## Archivo y composición

Adjunto del usuario `gemini_generated_video_1e78e674.mp4`: H.264 1280×720, 24fps, 20,01s, 4.286.330 bytes, audio AAC. SHA256 `4f7cd94ec3eae0987c68716ec3f78b4ffe197145282a0ec4f11a744570b7b832`. Se inspeccionaron cuatro fotogramas distribuidos: frasco DREAMS/base de piedra/iluminación, movimiento de cámara/tapa propio del material. Material aportado por el usuario; no se presume licencia adicional ni se sustituye el perfume.

Versión web `public/assets/dreams-hero-video.mp4`: H.264/yuv420p 1280×720, 24fps, exactamente20s, 1.778.425bytes; sin pista de audio, faststart, CRF24. SHA256 `174a7e50db232b5973a97ada8cb28b336f80e32fe88d6b979cf0fe0b6246de8f`. Posters WebP son el primer/último fotograma del mismo video, no contenido inventado. Original adjunto conservado fuera del repositorio; no duplicado versionado.

Encuadre completo 16:9 con object-fit:contain, sin deformación ni recorte del frasco; en móvil se conserva todo el encuadre horizontal, por lo que el producto se ve más pequeño que la fotografía anterior. Reserva de aspect-ratio desde HTML inicial para evitar cambios de layout al activar video. Textos/CTA originales conservados. Retirados imagen/lettering superpuestos de la variante preview; no movimiento CSS, hover, parallax ni iluminación animada adicional. Control de pausa en área izquierda vacía, mínimo44px/foco visible.

## Reproducción e aislamiento

`PREVIEW_HERO_VIDEO=true` sólo en env.preview.previews; Worker expone booleano `hero_video` desde configuración servidor. Query/hostname no activan esa opción. Oficial usa backend inmutable anterior, sin flag ni nuevos assets. JS empieza silenciado/playsinline/sin loop. Al terminar no seek/reload/source removal: mantiene el último fotograma real; control se oculta. Pausa/continuación manuales conservan currentTime. Autoplay bloqueado ofrece Reproducir video.

Memoria sessionStorage marca sólo el primer playing. Al volver a Inicio dentro de esa sesión se muestra poster final sin nueva descarga/reproducción; recarga explícita permite una carga inicial nueva. BFCache/pagehide pausa y pageshow no reinicia. Sin storage, la protección de una única instalación/documento sigue operando, pero la memoria entre documentos depende del almacenamiento permitido por el navegador. Reduced-motion/saveData detectables no asignan src ni descargan MP4; muestran poster. Error de medio restaura poster. Sin audio ni APIs de pago relacionadas.

El build Pages extrae HTML/CSS/motion desde `pages/official-release.json.source_commit` usando git show, no desde archivos de esta branch. CI usa fetch-depth0 para ese SHA. Regresión del bundle comprueba portada original/CTA y ausencia de video/scripts/activación aun al construir desde la branch video. Pages Direct Upload sin auto-deploy Git; en esta tarea no se ejecuta deploy Pages ni se modifica su proyecto/configuración/DNS/backend. Separación explícita de archivos, flags y deployment.

## Verificaciones locales

Sintaxis 46 JS, 120/120 tests, builds Workers/Pages correctos. Siete regresiones adicionales: autoplay bloqueado/doble interacción, pausa sin seek, frame final, retorno y reload, preferencias, error/storage, opt-in servidor y build Pages estático (cinco tests de controlador + uno API + uno bundle). Test anterior de imagen adaptado a contrato nuevo de poster/reserva/no lettering sin eliminar cobertura.

QA visual local Chromium390/1440 sobre servidor temporal de visualización: API GET reales de preview con flag local inyectado; todas las escrituras bloqueadas. Reproducción/pausa/resume/fotograma final/retorno/reload y cuatro preferencias/fallos pasaron; fin local se aceleró por seek, no se presenta como espera natural completa. Ahorro de datos/autoplay bloqueado/error de red son inyecciones de navegador, no fallos del proveedor. Sin pageerrors/overflow en tamaños probados. Capturas `/workspace/dreams-video-evidence/local-*.png`; logs `/tmp/dreams-video-local-qa.log`. QA remota y deployment registrados a continuación.

## Acceso Admin solicitado

Usuario comprobado en Supabase: `admin@dreamsperfumes.com`, perfil admin/Auth confirmado, UUID a88d8d4e-ada3-4bfa-a6f5-db39d2dc9c19. Entrada oficial `/cuenta.html` → `/admin`; Google pendiente. No se dispone de contraseña/sesión legítima para QA autenticado real.

Consulta de solo lectura por integración Railway OAuth: existen nombres ADMIN_EMAIL y ADMIN_PASSWORD en configuración histórica, pero `valuesRedacted=true`; ningún valor fue leído/impreso ni contraseña inventada. No se confirmó que esa variable histórica coincida con la contraseña Auth vigente. El titular puede consultarla privadamente en https://railway.com/project/f375bb47-59c8-4cc1-b0d1-4d83ecae5780/service/c5780bbd-4030-4319-a714-1bc0f564e353?environmentId=39886077-e963-4fec-b3aa-b0e5d38908dd → Variables. No pegarla en chat. Un hash no permite recuperarla.

Si no es válida, recuperación requiere verificar titular/control del correo y presentar impacto/autorización específica de cambio de cuenta compartida. Runbook previo documenta SMTP/callback/UI pendientes. No se cambiaron contraseñas ni revocaron sesiones, enviaron correos, crearon cuentas/roles o reactivaron Railway. No usar 1209 ni accesos por defecto.

## Recuperación de preview

Anterior academic-review b049934/deployment 4ad20144 conservado; URL inmutable https://4ad20144-dreams-perfumes.dreams-perfumes.workers.dev. Revertir sólo esta preview redeployando su SHA con config anterior/nombre academic-review; no usar deploy production/Pages. Si se necesita desactivar sólo video, desplegar academic-review con PREVIEW_HERO_VIDEO:false y mantener todos los Secrets. No borrar deployments. Oficial inmutable permanece independiente.

## Deployment y validación remota final

Preview: https://academic-review-dreams-perfumes.dreams-perfumes.workers.dev/. Fuente `41907ba1ed43a4ceb0d7f9444d5f9da2038a5167`, deployment `70089602-bc64-4a9a-bcb1-e585b9bb4c13`; URL inmutable https://70089602-dreams-perfumes.dreams-perfumes.workers.dev. [PR40](https://github.com/facumartea/dreams/pull/40), base PR39, dependencias preservadas, sin merge. [CI fuente SUCCESS](https://github.com/facumartea/dreams/actions/runs/37861535878): check46/120tests/audit/builds. Checkpoint final documental no cambia el deployment.

Wrangler4.147.0, sesión OAuth existente, comando verificado `pnpm exec wrangler preview --env preview --name academic-review --tag 41907ba --message 'PR40 once-only silent DREAMS video; official stays pinned static'`. Secrets existentes conservados como secret_text; sin lectura/copias de valores. API confirma PREVIEW_HERO_VIDEO:true, PREVIEW_READ_ONLY:true, CHECKOUT_SCHEMA_READY:false. No cron/integraciones comerciales añadidas.

Chromium remoto390/1440: autoplay silenciado, pausa700ms y continuación sin seek, fin natural20s, frame final inmóvil/control oculto, hover/scroll sin reinicios, navegación a Nosotros/vuelta sin descarga ni reproducción y recarga explícita con nueva reproducción. Sin pageerrors ni overflow. Preferencia reduced-motion emulada por Chromium sin fuente MP4; ahorro de datos, rechazo de autoplay y error de medio inyectados en navegador también pasaron. Estos tres son pruebas controladas, no errores remotos del proveedor. No prueba de Safari/dispositivo físico ni garantía de autoplay en todo navegador.

Regresión remota390/1440: menú móvil/Escape y desktop, búsqueda vacía/reset y filtro Byredo/reset,46productos, contactos/autores/acceso legacy visible; agregar/+/- y vaciar mediante checkout académico, persistencia/contador/subtotal/envío excluido, enlace wa.me542944160065 correcto sin envío. Checkout firmado académico aprobado/vaciado, no cobros ni pedidos/stock. Auth me visitante y ocho rutas Admin403; autenticación Admin real no probada por ausencia de contraseña legítima. Eliminación individual/vaciado manual y carreras/reintentos cubiertos por suite y evidencia previa, no repetidos como prueba de red remota en esta tanda. Sin pageerrors/overflow.

Dos ejecuciones iniciales de activación agotaron30s: logs `/tmp/dreams-video-remote-qa.log` y `/tmp/dreams-video-regression-qa.log`. Causa no comprobada; no atribuirla a propagación como hecho. Diagnóstico posterior confirmó JS200/hash fuente, config200/hero_video:true y video reproduciendo sin error. Repetición completa exitosa: `/tmp/dreams-video-remote-qa-final.log` y `/tmp/dreams-video-regression-qa-final.log`, exit0. No ajuste de código tras deployment. Capturas remotas `/workspace/dreams-video-evidence/remote-390-playing.png`, `remote-1440-playing.png`, versiones ended y fallbacks; contactos/carrito/acceso en `/workspace/dreams-video-regression-evidence`.

Lectura final de Cloudflare: Pages900a4bd8 SUCCESS/c22a5d0, preview70089602/tag41907ba y Worker original f73d5087 al100%. Oficial HTML/CSS/motion idénticos a b049934, sin video/script/layout nuevo; GET asset MP4 oficial404, health200. No publicación oficial durante etapa video. Consulta telemetría últimos15min0eventos nivelerror; invocation logs desactivados, cobertura limitada, no garantía de todas las invocaciones. SQL de solo lectura:46productos/0pedidos/administrador confirmado conservados. Sin escrituras, migraciones, emails ni credenciales alteradas.

Rollback preview anterior conservado, procedimiento documentado arriba, no ejercitado al no observar regresión final. Producción/Pages mantiene su propio runbook y respaldo previo con limitación Supabase401 histórica; no restaurado Railway. Pendientes: revisión del usuario en celular físico, sesión Admin legítima y recuperación, Google/proveedor comercial y seguridad previa. No promover video a oficial sin autorización nueva.
