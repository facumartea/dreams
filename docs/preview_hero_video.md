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

QA visual local Chromium390/1440 sobre servidor temporal de visualización: API GET reales de preview con flag local inyectado; todas las escrituras bloqueadas. Reproducción/pausa/resume/fotograma final/retorno/reload y cuatro preferencias/fallos pasaron; fin local se aceleró por seek, no se presenta como espera natural completa. Ahorro de datos/autoplay bloqueado/error de red son inyecciones de navegador, no fallos del proveedor. Sin pageerrors/overflow en tamaños probados. Capturas `/workspace/dreams-video-evidence/local-*.png`; logs `/tmp/dreams-video-local-qa.log`. QA remota y deployment se registran después de publicar.

## Acceso Admin solicitado

Usuario comprobado en Supabase: `admin@dreamsperfumes.com`, perfil admin/Auth confirmado, UUID a88d8d4e-ada3-4bfa-a6f5-db39d2dc9c19. Entrada oficial `/cuenta.html` → `/admin`; Google pendiente. No se dispone de contraseña/sesión legítima para QA autenticado real.

Consulta de solo lectura por integración Railway OAuth: existen nombres ADMIN_EMAIL y ADMIN_PASSWORD en configuración histórica, pero `valuesRedacted=true`; ningún valor fue leído/impreso ni contraseña inventada. No se confirmó que esa variable histórica coincida con la contraseña Auth vigente. El titular puede consultarla privadamente en https://railway.com/project/f375bb47-59c8-4cc1-b0d1-4d83ecae5780/service/c5780bbd-4030-4319-a714-1bc0f564e353?environmentId=39886077-e963-4fec-b3aa-b0e5d38908dd → Variables. No pegarla en chat. Un hash no permite recuperarla.

Si no es válida, recuperación requiere verificar titular/control del correo y presentar impacto/autorización específica de cambio de cuenta compartida. Runbook previo documenta SMTP/callback/UI pendientes. No se cambiaron contraseñas ni revocaron sesiones, enviaron correos, crearon cuentas/roles o reactivaron Railway. No usar 1209 ni accesos por defecto.

## Recuperación de preview

Anterior academic-review b049934/deployment 4ad20144 conservado; URL inmutable https://4ad20144-dreams-perfumes.dreams-perfumes.workers.dev. Revertir sólo esta preview redeployando su SHA con config anterior/nombre academic-review; no usar deploy production/Pages. Si se necesita desactivar sólo video, desplegar academic-review con PREVIEW_HERO_VIDEO:false y mantener todos los Secrets. No borrar deployments. Oficial inmutable permanece independiente.
