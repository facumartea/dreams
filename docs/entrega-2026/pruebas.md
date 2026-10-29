# Pruebas reales y pendientes · 29/10/2026

## Identidad remota observada, sin nueva publicación

- Oficial https://dreams-perfumes.pages.dev/: Pages canónico `a3184576-4390-4a71-9205-d9269bd7dfe7`, frontend `7b302cf6b1896cfe500a0643290646b3086cb082`, binding efectivo `DREAMS → dreams-perfumes`, entorno vacío/default. GET de configuración Cloudflare200 en esta tanda.
- Backend legacy fijado por el release del frontend servido: `ec04a35812d044e57196c6a1ca55232e723ff60c`, URL inmutable con pin `d5df723d-e1f1-4889-ae5b-e79ebfd131cd`. Es evidencia de pin del frontend; no una nueva verificación independiente del bundle histórico.
- Candidato privado `dreams-official-backend`: `62f6bd7c-52a0-4ebb-861d-cfc9116b6286`, deployment `82492c72-295f-412e-82c0-11285034bd67`,100%. No cambió respecto del diagnóstico.
- Binding `SUPABASE_SECRET_KEY`, tipo secret_text, Production/default; `SUPABASE_URL=https://nwsmbemwtexmrtpkgxrz.supabase.co`. Inspección sólo de nombres/tipos/URL pública. Ningún valor de clave o header se imprimió.
- Evidencia de la MISMA versión conservada: [directo401 y SDK401, espacios internos, clave no truncada por SDK](../evidence/functional-backend-20261027/credential-diagnostic-result.json). No se repitió esa sonda sin cambio de versión. La URL corresponde al proyecto esperado; pertenencia de la clave opaca no verificada porque fue rechazada.
- Constructor `worker/official-client.mjs` usa únicamente el Secret recibido y la URL; no fallback a claves antiguas. El candidato oficial exige origen/proyecto exactos y desactiva bypass administrativo de registro. Ningún cambio Auth, Admin o credenciales.

## Regresión local de esta tanda

- Suite completa inicial387PASS y carrusel3PASS; ejecución conjunta final desde ZIP limpio: **390/390 PASS**,0fallos/0skips, sin.git ni secretos reales. Ver verificacion-zip.json. CI #211 /40903937335 del commit633aec3SUCCESS en instalación, audit, sintaxis, inventario, tests y cuatrobuilds.
- Sintaxis final desde extracción: **92 archivos JS** PASS.
- Inventario final: **106 archivos JS/MJS/CJS/HTML**, **1873 registros** de funciones/callbacks/métodos/bloques, **0 exceden40**. Alcance en funciones.md y detalle JSON; no se requiere `.git`.
- Audit producción: sin vulnerabilidades conocidas.
- Cuatro builds locales PASS: Pages, oficial privado, Worker y Admin read-only dry-run. Ninguno publica un sitio.
- Error detectado durante refactorización de fixture Admin: una referencia de estado quedó fuera de ámbito, causando dos fallos; corregida a `this.state` y suite verde. No se omitieron tests.
- Browser detectó riesgo de doble carga de motion durante parseo; factories conservan ámbito y cargador espera HTML completo. La ejecución final registra cero pageerrors. No se atribuye este chequeo a una publicación remota.

## Matriz Admin existente y ampliación

La [matriz previa](../evidence/admin-audit/matrix.md) de201 ejecuciones locales conserva A28/B25/C25/D27/E30/F24, cada área≥20 casos distintos; no se reinició. La modificación nueva es confirmación de persistencia de productos, áreaD. `test/admin-persistence.test.js` agrega **25 casos PASS**:

| Casos nuevos | Resultado real |
|---|---|
| Discrepancias independientes en brand, name, gender, category, size_ml, price, stock, intensity, family, top_notes, heart_notes, base_notes, description, image_url y featured (15) | Cada discrepancia rechazada sin anunciar éxito. |
| Todos los campos coinciden; normalización de números/texto (2) | Confirmación de lectura aceptada. |
| Producto ausente, respuesta no array, otro ID (3) | Confirmación rechazada. |
| ID ausente, cero, negativo, fraccionario (4) | Rechazo antes de lectura. |
| Red interrumpida después de escribir (1) | Formulario conservado, sin éxito, una sola escritura, aviso de revisar listado. |

Las otras áreas no se modificaron. No presentar estos fixtures como prueba de escritura Supabase real.

## Chromium nuevo:15 comprobaciones PASS

[Resultado estructurado](pruebas-browser-local.json). Entorno: Chromium instalado, HTTP Express local, Auth/BD de memoria con datos exclusivos de prueba; sin proyecto Supabase real.

- Carrusel en390/430/768/1024/1440/1920: controles, contenidos distintos, flechas, vuelta circular y ausencia de overflow.
- Guardado de nombre/precio/imagen por HTTP local; lectura posterior antes del mensaje; recarga conserva imagen; catálogo y detalle reflejan cambio. Editar/Eliminar iguales104×44px (tolerancia de rasterización subpíxel0,1px).
- Sin JS: tres colecciones visibles. Cero pageerrors. Captura de Cuenta sólo documenta la pantalla, no registro real. SVG editable convertido a PNG.

Se inspeccionaron visualmente PNG de wireframe, isologo, captura Admin y primera página del manual PDF; texto del manual legible,4 páginas. No se certifica WCAG completo, performance avanzada ni licencias de fotos externas.

## QA autenticada real: BLOQUEADA

Registro normal sin confirmación, perfil customer, login, persistencia/refresh/logout, customer/anónimo rechazados de Admin, carrito A/B y merge, opiniones propias/ajenas, Admin persistente e imágenes, checkout académico y WhatsApp de la versión final: **pendientes desde el candidato válido**. Existe evidencia histórica de checkout/WhatsApp y matrices locales, pero no la reemplazan. No se crearon cuentas QA remotas ni productos ni se alteraron datos comerciales en esta tanda.

Intervención mínima ya solicitada: reemplazar únicamente `SUPABASE_SECRET_KEY` del candidato privado desde el panel con una Secret API key de servidor existente del proyecto indicado. No tokens de gestión adicionales ni claves por chat. Después continuar sin nueva autorización. Primero lectura directa y SDK desde nueva versión; sólo después cuentas normales de prueba y sesiones. No crear Admin ni cambiar contraseña/rol existente. No afirmar disponible una sesión Admin que todavía no se obtuvo.

## Publicación y entrega

No hubo deployment, conexión del candidato a la oficial, DNS ni otros sitios. Rollback canónico conservado. PR56 sigue draft sobre `codex/collection-multiselect`; no se integró `main` porque las dependencias funcionales siguen abiertas. Los archivos de entrega están en `codex/admin-cards-audit`, no aún en el ZIP predeterminado de GitHub. Ver [ZIP](zip.md) para commit y comprobación de extracción.
