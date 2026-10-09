# Navegación y footer oficial — 2026-10-09 UTC

Publicado: https://dreams-perfumes.pages.dev/. Fuente **c3cea8cfd56d790ca170744537705722ab32bd53**, Pages **c658e4da-c854-4b74-ade9-78b5822bffab**, SUCCESS confirmado por API y navegador. Staging del mismo bundle: https://9140ca6f.dreams-perfumes.pages.dev/. PR42/rama codex/official-navigation-footer, dependiente PR41 → PR39/38/37/34, sin merges ni video/PR40. Checkpoint posterior sólo documental.

## Causa y solución

Antes se comparaba sólo pathname: Perfumes/Mujer/Hombre/Unisex quedaban marcados simultáneamente. navigation.js resuelve ruta exacta/género conocido y limpia marcas. Otras páginas no reciben selección. Páginas aria-current=page; colecciones filtradas aria-current=true. URL/filtros e historial sincronizados al cambiar/recargar/volver; marca restaurada tras options asíncronas.

Hover visible con fondo/texto, sólo activo con subrayado persistente/borde. Foco con outline y pulsación con borde interior, geometría fija. Hover de fondo sólo puntero fino, reduced-motion sin transición. Colores existentes de colecciones y dorado general; contrastes calculados general8,33:1/Mujer6,52:1/Hombre5,87:1/Unisex7,46:1. Menú móvil corrige containing block de backdrop-filter: viewport completo y controles por encima al abrirlo.

## Footer e aislamiento

Plantilla única templates/public-footer.html pre-renderizada en ocho páginas: Inicio, catálogo/categorías, detalle, Nosotros, carrito, acceso, checkout y resultado. Sin dependencia/fetch extra/flash. `node scripts/sync-public-footer.mjs` sincroniza copias HTML para Node/Workers; buildPages reutiliza plantilla; tests exigen consistencia. 404/Admin conservan layouts específicos. Correos/teléfonos/WhatsApp542944160065 comprobados contra /api/config y server/contacts.js. Autores conservan literalmente “Facundo Martearena y Joaquir Ruas”; no línea WhatsApp/número en Contacto ni mensajes enviados.

17 archivos publicados coincidían exactamente con f166ba1 antes de editar. Diff revisado: shell HTML/CSS/navegación/filtros, plantilla/build/proxy, tests/documentación. Pages amplía sólo HTML públicos y app/catalogo/navigation.js; nuevo script hereda cabeceras de ruta app.js. Errores/denegaciones upstream no se ocultan. Backend40e7b0a3/b049934, API/Admin/mutaciones/Auth/pagos/datos/Secret/DNS intactos. Previewvideoaf79434d/8d1b4cd y Worker originalf73d5087 al100% intactos por API. Hero oficial estático/imágenes/motion originales.

## Evidencia real

- Local: check45JS,120/120 tests, buildPages. Sin scripts específicos lint/typecheck en proyecto JavaScript.
- CI fuente SUCCESS https://github.com/facumartea/dreams/actions/runs/37881134803: instalación frozen/audit/sintaxis/120tests/buildsWorkersPages.
- Staging y oficial Chromium390×900 táctil/1440×900:11rutas por tamaño, selección única/footers iguales/contactos correctos, cero overflow/pageerror. Hover/foco/pulsación desktop sin saltos; menú móvil/Escape y controles visibles. Historial género atrás/adelante, recarga, búsqueda vacía/limpieza y Byredo tras recarga correctos.
- Oficial carrito: agregar/+/-/persistencia/contador/eliminar/vaciar; WhatsApp con resumen y envío excluido. Checkout académico/formulario/provider presentation_demo comprobados, **sin enviar pago, tarjeta, pedido ni mensaje**. Seis hashes JS funcionales intactos.
- Primer staging mostró menú móvil y marca al recargar fallidos: corregidos antes de promover. Harness ajustó esperas de respuestas/transiciones y dos navegaciones simultáneas durante prueba de pulsación; no atribuibles a app. Request previo a disponibilidad de staging devolvió404; QA final posterior a SUCCESS.
- Capturas /workspace/dreams-navigation-evidence/official-{390,1440}-{menu,footer,checkout}.png. Logs /tmp/dreams-nav-official-{mobile,desktop}.log y stage-{mobile,desktop}.log.
- Capturas de referencia mencionadas no adjuntas: comparación literal no acreditada; composición existente/especificación textual conservadas. No dispositivo físico/Safari/login/Admin autenticados/pago real/CWV verificados. Pendientes anteriores Auth/Google/pagos/seguridad fuera de alcance.

## Rollback

Previo **1eb932f3-529d-40a1-8998-78cafc3c8138**, fuente29aa0bf, conservado SUCCESS. URL https://1eb932f3.dreams-perfumes.pages.dev/ y health/catalogo respondieron200. Endpoint verificado en especificación Cloudflare:

`POST /accounts/9f3d7af60fcb0c2b4fff8570843588f9/pages/projects/dreams-perfumes/deployments/1eb932f3-529d-40a1-8998-78cafc3c8138/rollback`

Usar integración autenticada, comprobar canonical_deployment/SUCCESS, raíz/health/catálogo/carrito y portada estática en alias oficial. Sin borrar deployments/DNS/Worker/DB. No ejecutado: sin regresión material final. Respaldo es Pages/backend fijado, no Railway. Próximo paso: revisión visual del usuario en oficial; sin merges/publicaciones adicionales necesarios para este alcance.
