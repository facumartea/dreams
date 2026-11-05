# Auditoría documental2025 — fuente pendiente, sin cambios funcionales

SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.

Rama docs/auditoria-rubrica-2025 desde mainb60e33db5d9c3925808f889f6581a75dc1738ac0 (commit auditado). Sólo documentos nuevos en docs/auditoria-2025 y enlaces/continuidad; aplicación, datos, Auth, credenciales, configuración y despliegues intactos. NoZIP.

BLOQUEO: elPDF2025 solicitado no está disponible; sólo está el2026 anterior. Se pidió adjuntarlo al iniciar. NO se usó2026 como equivalente, NO se transcribieron fechas/puntajes2025 inventados. Matrizprovisional por orden del pedido; la auditoría definitiva por orden delPDF sigueBLOQUEADA hasta recibirlo.

Trabajo independiente:17láminaswireframe escritorio/móvil PDF/PNG/SVG, mapaPDF/PNG/DOT/SVG yDERPDF/PNG/DOT/SVG, con metadatos remotos de9tablas públicas+auth.users.id, claves/cardinalidades/nulabilidad ydiccionario. Documentación retrospectiva, sin retrofechar. PDFsrasterizados e imágenes revisadas visualmente; fuentehistórica conservada.

Hallazgos: carrusel ausente por eliminación solicitada; JSdelrepositorio117archivos/2147registros/máximo40/0excesos; funciónSQL dreams_cart_operation53líneas; checkout.js oficial legadodeec04 difiere demain ysetup_checkout113líneas. No se corrigió ninguno silenciosamente. AdminautenticadoBLOQUEADO sin sesión; GETAdmin403.489testsPASS, check103, buildPages/oficialPASS; inventario e instalación desdeTARsin.gitPASS. Lecturasoficiales390/1440sin erroresJS/overflow; noformularios enviados.

GitHubmainverificado;22PRsabiertas previas:9HEADancestros y13noancestros, listadoySHAenalcance.json. Archivos nuevos no estaban encommit auditado; aparecen enmain sólo tras integrarPR documental conchecks. No nuevas credenciales, noAdminsessions, noSecret/KV/Cron ni publicación. Próxima acción cuando lleguePDF2025: leerlo completo y completar matrizdefinitiva/fechas respetando literal, sin reiniciar gráficos o controles acreditados.

## Historial anterior conservado

# Inicio actualizado y publicado — cierre03/11/2026

SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.

Se terminó primero PR57/cupón-formulario, integrada enmain6865365 conCI232 y publicación97c4333. Después se inició por separado PR58/rama codex/remove-home-collections-carousel, desde esa main. Eliminación completa del bloque «Explorá la selección/Tres formas de empezar», tarjetas, botones, contador, contenedor/separadores y espacio; sóloHTML/CSS/JS exclusivos. Menú y páginas/filtros Mujer/Hombre/Unisex conservados. No cambios de backend/Auth/Admin/cupón/checkout ni otraswebs.

Oficial única https://dreams-perfumes.pages.dev/, frontendd366551a2f8880addd133ace40e5e76f70dd4315, Pagesa176fa63-c0c5-46aa-bb8c-c97d1eb85466 producciónSUCCESS. Backendef043065/08635cd sin tocar. CI234SUCCESS;489testslocalesPASS; sintaxis/buildPagesPASS;117archivos/2147registros/0>40.

QAoficial390/1440PASS: secciónausente, productos→SobreDREAMS contiguos(gap0), sin overflow/erroresdeconsola, tres enlacesmenú abren catálogos con datos. Evidencia/capturas en docs/evidence/home-removal-20261103. WireframeSVG/PNG/manualMD/PDF/auditoría actualizados. Único carrusel retirado: rúbricaR10 NO CUMPLE/PENDIENTE por instrucción expresa, sin ocultarlo ni reemplazarlo. No solicitar otra aprobación para esa eliminación.

Rollbackfdd5f665 + backendef043065 disponible, preserva cupón/formulario. NoSecrets/KV/Cron creados, credencialesAdmin/datoscomerciales intactos. Falta sólo integrar evidencia final de PR58 a main conCI aprobada; consultar fichaGitHub paraSHAexacto. No repetir pruebas aprobadas ni reconfigurar Auth/Secret.

## Historia anterior

# Retirada del bloque de colecciones de Inicio —03/11/2026

Cambio separado, iniciado después del cierre/merge de PR57 (main6865365). Única oficial autorizada: https://dreams-perfumes.pages.dev/.

Retirado completo «Explorá la selección / Tres formas de empezar»: sección, tarjetas, controles Anterior/Siguiente, contador, separadores y espacio. Eliminados sólo setup_collection_carousel y sus callbacks y siete líneasCSS exclusivas. No usa recursos gráficos exclusivos; imágenes/fuentes/estilos compartidos se conservan. Menú y páginas/filtros Mujer/Hombre/Unisex intactos. Portadaestática, productos, SobreDREAMS, opiniones y recientes conservados. Sin cambios de backend/cupón/formulario/Auth/Admin.

Único carrusel implementado: ya no queda otro. Rúbrica R10=NO CUMPLE/PENDIENTE por instrucción expresa, sin ocultar ni reemplazar. WireframeSVG/PNG, manualMD, diseño y defensa actualizados. La evidencia histórica del carrusel anterior conserva su fecha y no acredita la versión resultante.

Local:489testsPASS, sintaxis/buildPagesPASS,117archivos/2147registros/0>40. Chromium390/1440PASS: ausencia del bloque, productos→SobreDREAMS contiguos (gap0), sin overflow/erroresdeconsola, navegación porlos tres enlaces. Capturas local-home-* y local-browser.json son locales. Falta publicar y comprobarlaoficial.

Rollback: Pagesfdd5f665-c7d1-438a-bc3d-e4bb079517fc (cupón/formulario ya verificados) + backendef043065 sin tocar. No otraswebs/previews/domínios, cambioscredenciales ni datoscomerciales.

SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.

# Cupón y formulario académico publicados —03/11/2026

SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.

Trabajo nuevo en PR57/rama codex/cart-coupon-academic-inputs desde main5236ef6. Frontend oficial97c4333, Pagesfdd5f665-c7d1-438a-bc3d-e4bb079517fc; backend08635cd, versiónef043065-5d28-45c7-906b-b9e1edb6a5ab, deployment2479eec0-5831-4284-8b7c-0ae8069884a7. URL única https://dreams-perfumes.pages.dev/. Backend saludable/versionado, PagesSUCCESS. CI231SUCCESS;117archivos/2166registros/0>40. Suite local488PASS y12casos dirigidos tras último ajuste, CIejecuta suitecompleta actual.

Cupón real existente validado por servidor hasta ticket/recibo; estado/vencimiento/mínimo/límites, condiciones desconocidas rechazadas. No consumo comercial. Nombrevacío/placeholder, número16/MM-AAmes01–12/CVV3 con ceros, máscaras/paste/ediciónintermedia locales sin datos financieros en red/storage. Envío etiqueta única y costo0. Dos bugs encontrados y corregidos: rutaJS404 y paste truncado antes de normalizar. No reabrirlos ni repetir Auth/Secret/Admin ya acreditados.

Oficial390/1440PASS: cupones Enter/botón/quitar/reaplicar/inválido/cantidades/recarga/red/retry, confirmación/importes/referencia estable; customer normal registro/login/sesión/logout yAdmin403. Pegado portapapeles/selección/borradointermedio/mesinválido/Unicode/placeholderPASS sobre versiónfinal. BD pedidos/stock/cupones intactos;0sesionesQA. Sin cambioscredencialesAdmin ni cuponescomerciales. No otro sitio/preview/pagos/seed/reset. Rollback previo b169918f+29b843a0 conservado.

Evidencia ycapturas en docs/evidence/coupon-academic-20261103; manualMD/PDF actualizado. Falta sólo push de evidencia final, CI e integración autorizada de PR57 a main. Ficha GitHub registraSHAfinal delmerge. No repetir pruebas aprobadas por rutina. CuentasQA retenidas customer/sesionescerradas; no Secret temporalniKV/Cron creados en esta tarea.

## Estado anterior conservado

# Cupón y formulario académico — 03/11/2026

Rama codex/cart-coupon-academic-inputs desde main5236ef6. Implementado cupón único mediante quote_cart/resolve_coupon en servidor, expiración/estado/mínimo/límites de usos aprobados (sin consumirlos). CondicionesJSON desconocidas se rechazan; límites por cuenta requieren sesión. Ticket firmado conserva descuento/cupón/importes; payment revalida antes de recibo, referencia incorpora snapshot del cupón sin datos financieros.

Titular vacío/placeholder, máscaras con cursor y beforeinput, número16dígitos, MM/AA mes01–12 y CVV3dígitos, todos locales. Nombre admite caracteres Unicode y puntuación sin máscara. Ningún campo financiero en peticiones/storage/ticket/recibo. Envío etiqueta única y costo0. Prevención doble envío conservada.

487testsPASS, sintaxis103archivos; inventario40líneas sin violaciones, buildsPages/oficialPASS. Chromium local390/1440 cupón→checkout→confirmación180/180/180 y envío0, datos ficticios ausentes de red/storage. Capturas cart/form en esta carpeta son LOCALES. Falta publicación, smoke oficial y evidencia final.

Rollback conservado: Pagesb169918f y backend29b843a0; se hereda únicamente SUPABASE_SECRET_KEY, sin nueva configuración Auth/Admin/DB. No otras webs/previews ni cupones comerciales modificados.

SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.

# DREAMS — reparación funcional terminada

SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.

Oficial única: https://dreams-perfumes.pages.dev/. Pages b169918f-ce14-4588-a006-6099afba06aa, frontend e544c6ca8f00927cbe2c92f8c7fa225fff18e4d9. Backend privado dreams-official-backend, Production/default: versión29b843a0-d04e-4631-8d52-627d5f598654, deployment31aef453-abc3-44ff-8dc1-659e84553dd3, fuentee86f4343851d9810623996d2b7d13504163340c0. Cabecera de versión exacta y health/DB200. No repetir configuración de Auth, Secret, Admin ni pruebas acreditadas.

Causas comprobadas: Secret histórico malformado (reemplazado por usuario; lecturas directa/SDK200 en proyecto esperado); guardado403 porque proxy oficial enviaba Admin al backend legado protegido de preview; stock:null coercionado a0. Corregido enrutamiento específico con roles/origen y validación de tipos antes de convertir. Sin fallback ni reparación de clave eliminando caracteres.

QA final: nueve fases privadas en11477c4f/0368f65 PASS,281 assertions/0fallos; Chromium oficial89casos distintos PASS,92registros conservados. Admin final limpio: alta, edición/imagen/persistencia, borrado y logout PASS; cliente login/recarga/logout PASS. Registro sin confirmación, renovación, carrito aislado, opiniones propias/moderación y checkout académico comprobados. Sin pagos comerciales, mensajes enviados, stock/pedidos comerciales cambiados ni credenciales/roles Admin modificados.

Limpieza completada: entrypoint productivo sin mecanismo QA, Cron vacío, DREAMS_QA_ADMIN_PASSWORD ausente, sólo SUPABASE_SECRET_KEY presente. KV temporal2440c640ebd6493d83b39dddba3cbdb2 eliminado. SesiónAdminQA y clientes cerrados;0productos/cupones/opiniones QA,0sesionescustomerQA. Cuentas de prueba retenidas como customer. Navegador/proceso efímero cerrados; depurador loopback retirado. No solicitar intervención por esos recursos.

Checks:476testsPASS,CI224SUCCESS para e86f434; sintaxis101archivos; inventario115archivos/2111registros/0>40. Extracción de e86f434 sin.git ni secretos: instalación, checks,476tests, builds oficial/Pages PASS; sin ZIP final. Documentación y evidencia en docs/entrega-2026 y docs/evidence/admin-audit-20261102. Mantener historial de fallos, no repetirlos como estado vigente.

Rollback: Pages b169918f y backend probado con misma clave/firma; a3184576 queda sólo emergencia legacy, sin prometer compatibilidad con tickets nuevos. No pérdida/migración de datos. Publicación funcional terminada. Entrega consolidada en PR56 dirigida a main; consultar su ficha de GitHub para el commit exacto de integración, que se realiza sólo con checks aprobados. El usuario autorizó integración y pidió no generar ZIP final. Supabase aceptado por profesor según usuario; Martearena/Ruas confirmados. Participación, preentregas, licencias no acreditadas y defensa individual siguen documentadas sin inventar evidencia ni nota.
