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

## Cierre funcional acreditado — 03/11/2026 UTC

 Secret histórico malformado (reemplazado por usuario; lecturas directa/SDK200 en proyecto esperado); guardado403 porque proxy oficial enviaba Admin al backend legado protegido de preview; stock:null coercionado a0. Corregido enrutamiento específico con roles/origen y validación de tipos antes de convertir. Sin fallback ni reparación de clave eliminando caracteres.

QA final: nueve fases privadas en11477c4f/0368f65 PASS,281 assertions/0fallos; Chromium oficial89casos distintos PASS,92registros conservados. Admin final limpio: alta, edición/imagen/persistencia, borrado y logout PASS; cliente login/recarga/logout PASS. Registro sin confirmación, renovación, carrito aislado, opiniones propias/moderación y checkout académico comprobados. Sin pagos comerciales, mensajes enviados, stock/pedidos comerciales cambiados ni credenciales/roles Admin modificados.

Limpieza completada: entrypoint productivo sin mecanismo QA, Cron vacío, DREAMS_QA_ADMIN_PASSWORD ausente, sólo SUPABASE_SECRET_KEY presente. KV temporal2440c640ebd6493d83b39dddba3cbdb2 eliminado. SesiónAdminQA y clientes cerrados;0productos/cupones/opiniones QA,0sesionescustomerQA. Cuentas de prueba retenidas como customer. Navegador/proceso efímero cerrados; depurador loopback retirado. No solicitar intervención por esos recursos.

Checks:476testsPASS,CI224SUCCESS para e86f434; sintaxis101archivos; inventario115archivos/2111registros/0>40. Extracción de e86f434 sin.git ni secretos: instalación, checks,476tests, builds oficial/Pages PASS; sin ZIP final. Documentación y evidencia en docs/entrega-2026 y docs/evidence/admin-audit-20261102. Mantener historial de fallos, no repetirlos como estado vigente.


Retirada preparada del mecanismo QA en el entrypoint: scheduled queda inerte incluso con variables antiguas. Pendiente desplegar sólo después de completar las nueve fases R3 y casos Admin; heredar únicamente Secret Supabase. Suite476PASS, sintaxis101 y límite40 verificados para este cambio.

# Falla API real de tipos reproducida; parche en validación

SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.

Oficial sigue Pagesb169918f/e544c6c. Backend activo6ac06cff conserva código643c348; read/auth y42casosUI acreditados. R2 privado dejó11 operacionesA en9minutos04:05–04:13UTC: recuperación de carritos+merge+9marcadores de fase, sin reportesCF disponibles por rechazos intermitentes403 de observabilidad; no inventar detalle de logs. Proceso navegador99584 vivo, sesiónr2 recibida cifrada, Adminme realtrue; se restauran42PASS desdeJSON y QA219/220. No perder laclaveprivada ni reiniciar proceso por rutina. KVr1tombstone impide regeneración; se cerróademás sesiónQA3:49exacta regenerada durantepropagaciónCron, sin otras sesionesAdmin.

NUEVA CAUSA DE DATOS: payload() usaba Number(null)/Boolean('false') y coerciones de textos. ReproducidoAPI oficial conAdmin real sobreQA219: PUT stock:null→200, stock0 (FAIL esperado400). RestauradoEXCLUSIVAMENTE QA219 astock3 confirmado. EvidenciaAPI-stock-null/stock-null-restored enbrowser-results.json; no productoscomerciales tocados. Regresiónlocalantes:30casos,20FAIL; después30PASS. Se validan tipos numéricos/texto antesdecoerción y featured booleanopcionalestricto; strings numéricos legítimos/stock0/featuredomitidofalse se conservan. Nuevo testworkerd prueba400antesdeescribir y headerno secreto de versión;4integracionesPASS. Suitecompleta nueva476seacredita al finalizar.

Parcheworker añadeX-Dreams-Backend-Version(UUIDno secreto) paraprobarqué versión respondió realmente; clonadodecookies cubiertoporworkerd. ReportesQA sanitizados se guardanopcionalmenteenel MISMO KV privado (QA_REPORTS_KV), sin endpointpúblico, paranos dependerdeobservabilidad403. Próximo candidato: fuenteparche/CI, heredarSecretsde6ac06cff, QA_RUN_IDr3, SIN QA_BROWSER_PUBLIC_KEY/QA_BROWSER_VAULT (ya hay sesiónr2válidaenRAM), CON QA_REPORTS_KV. MantenerCron activo paraacreditar versiónactual; no interferir snapshots conaltas/borrados desdebrowser. Tras9PASS, confirmarAPI400/parámetrosinválidos y retomar sólo casosrestantes (flaglocaldecontinuación). DespuésLogin/cart/checkoutacadémico/legacyformato ylimpiezaSecret/KV/QA/sesiones. SinAuthconfig/roles/passwordAdmincambiados.

# Oficial publicada; auditoría real42PASS, recuperación de harness en curso

SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.

OFICIAL Pagesb169918f-ce14-4588-a006-6099afba06aa SUCCESS/canónico, fuentee544c6ca8f00927cbe2c92f8c7fa225fff18e4d9, CI221445tests. API/config ya admin_writes_enabled=true conservando preview_read_only=true y lista exacta de rutas; health/DB200 y catálogo46 al publicar. Backend código643c348 (CI220445tests), versión verificada2300a05a con nueve fasesPASS y readSDK/directo200. No nuevo sitio/preview/DNS/pagos comercial ni credencialesAdmin cambiadas.

QA OFICIAL REAL:42 casosPASS guardados en browser-results.json: Admin autorizado, módulos/navegación/reintentos, imágenes/timeout/respuestasviejas, alta dosproductosQA219/220, buscador, edición de TODOSloscampos, persistencia/imagen/catálogo/detalle real/destacadoInicio, stock0/1/2/3, botones iguales, doblePUTúnico, fallo antesdeescribir y recuperación. No repetir esoscasos. OriginalPOST403 fue reproducido con producto ausenteantes/después y configuraciónlegacy; ahora altas/ediciones reales ya funcionan.

El proceso QA murió por error DEL HARNESS (`route.fetch` requería un método interno que el puenteAPI había reemplazado), antesdeacreditar loscasos restantes. No ocultar esto como falloapp ni afirmar cierrecompleto. Se cerró1sesiónAdminQA exacta, única desdeinicio y creada410ms antesdelgrantKV; no otras sesiones/roles/contraseñas. Ciphertextviejo retirado, tombstonekeyr1 para impedir regeneración. Ver harness-interruption.json. ProductosQA219/220 se conservan para retomar, sin stockcomercial cambiado.

Proceso navegador nuevo conserva claveprivada sóloRAM, runpr56-admin-20261102-r2; restaura42PASS desdeJSON y recursos del prefijo r1. Interceptores corregidos usan HTTP porproxy sin reemplazar métodos internos, y erroresasíncronos se sanitizan sin terminar elproceso. Backend recovery6ac06cff-e8e7-4b91-b4b5-3f20c9d33a51/deploymenta137fedf conserva ARTEFACTO idéntico643c348: sólo nuevos parámetrosQA/clavepública receptora, mismosSecrets heredadosde2300a05a. ProgramaQA vuelvea acreditar laversiónnueva; mientras comparar snapshots, NO modificarQA219/220 desdebrowser paraevitarinterferencia. Luego continuar sólo casosrestantes, checkout/cuenta, retirarQA/Secret/KV y verificar backendfinallimpio.

Ticketlegacy previose perdióconelprocesoefímero: noafirmarcompatibilidaddeeseticket. Nueva prueba explícita deFORMATO/verificadorlegacyinmutable sinstock/orders, no otro sitio. Mantenerrollbackb169 y backend probado2300a05a(mismafirmaySecret); a318esemergencialegacy, nodeclararcompatibleconticketsnuevos sinprueba. SinZIPfinal. Publicaciónsí; cierre todavíaPENDIENTE.

# Promoción oficial preparada con evidencia de la misma versión

SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.

Backend privado2300a05a-b179-4ee2-b3ed-bfe017a801d8, deploymentbafb761a, fuente643c348/CI220 aprobada445tests. Lectura directa/SDK200 a03:30:04UTC del proveedor, proyecto esperado, sin transformar la clave. Las nueve fases privadas terminaron PASS a03:38, lista final completa; Cron retirado. Evidencia `docs/evidence/admin-audit-20261102/private-qa.json`. No confundir el contador de assertions con casos distintos ni los arrays truncados de logs con detalle completo.

Sesión Admin real recibida sólo cifrada por KV privado y descifrada en RAM del navegador; contraseña sólo en Worker. UI oficial legacy reproducida: POST/api/admin/products403, preview_read_only=true y admin_writes_enabled=false; marca/nombre QA ausente antes y después, sin alta oculta ni duplicado. `browser-results.json` BASE4PASS documenta reproducción, NO que el guardado oficial esté resuelto. Node API driver necesitó usar el proxy de esta ejecución; puente HTTP conserva cookies únicamente en RAM, sin omitir TLS ni validaciones.

`pages/official-release.json` habilita promoción con lectura reciente y QA de2300a05a. Oficial todavíaa3184576/7b302cf→d5df; mantener rollback. Próximo: CI del checkpoint, ticket académico legacy en RAM, publicar SOLO producción dreams-perfumes con mismo bindingDREAMS_OFFICIAL ya preparado; luego recorrido Admin real, guardado/imágenes y regresión pública. Retirar después mecanismo, SecretAdmin y KV, verificar backend final limpio y cerrar sesión con botón real. No publicar video, otros sitios/previews/DNS/pagos ni alterar datos comerciales.

# Transporte privado de sesión: fallo reproducido y corregido

SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.

`f3d46ea` está pusheado; CI219 aprobada con444 tests. Candidato privado36c8aa1f, deploymenta4b36341; oficial a3184576 sin cambios. El grant no se emitió: fallo temporal ANTES de Auth, cero sesiones Admin creadas desde la sonda (consulta agregada auth.sessions). Cron pausado, KV temporal aún vacío. No es fallo de Secret ni de configuración Auth.

Causa reproducida en integración workerd local con proveedor fixture: `redirect: 'error'` no es un valor admitido por Request de Workers; se rechazaba antes de hacer signIn (auth_calls=0). Cambiado a `manual`, que impide reenviar contraseñas/cookies mediante redirects; login exige status200 y rol/UUID originales. La nueva regresión recorre dispatcher Node real y cifrado RSA3072/AES, con cero llamadas Supabase reales. Nuevos códigos de etapa son enum sanitizado, nunca error crudo de proveedor. Corregido el mismo modo en logout de recuperación del grant.

No repetir carga de Secret, Auth ni contraseña Admin. Continuar con build/CI, privado nuevo heredando ambos Secrets del36c8aa1f vigente, binding de clave pública del proceso navegador activo y KV privado2440c640ebd6493d83b39dddba3cbdb2. Reproducir guardado403 oficial antes de conectar; completar QA fresca/recorrido oficial y retirar todos los recursos/mecanismo temporales al terminar.

# Correcciones Admin preparadas; publicación todavía pendiente

SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.

Auditoría retomada el02/11 (fecha del cliente). Nuevo checkpoint anterior `2233567`, CI218 aprobada/404 tests. Oficial sigue `a3184576`/`7b302cf` → legacy `d5df723d`; candidato temporal `69298e34`/`77ef7eb9` sólo privado. El intento de traspasar sesión contra login legacy no produjo grant ni sesiones Admin nuevas (consulta agregada auth.sessions: cero desde inicio de sonda); Cron retirado. Se corrige el mecanismo para login NORMAL dentro del candidato mediante fetch_official y Content-Length explícito; no se cambian Auth ni credenciales.

Preparadas correcciones frontend de alcance Admin: lectura antes del alta; recuperación de respuesta perdida sin segundo POST; si hay cambios nuevos usa PUT al ID recuperado, y si hay discrepancias/ambigüedad no sobrescribe. Cupones y opiniones requieren readback de campos antes de anunciar éxito. Borrados requieren ausencia confirmada y se reconcilian tras respuesta perdida. Guardar/eliminar productos se excluyen mutuamente; borrar el producto editado limpia su ID y borrar otro conserva el borrador. No esquema remoto ni datos comerciales modificados. Nuevos DR12/FR25 locales +25 previos de persistencia pasan; suite completa siguiente y CI se acreditan al terminar.

KV privado temporal `2440c640ebd6493d83b39dddba3cbdb2`, título dreams-private-admin-qa-temporary: aún sin grant al último chequeo. Clave privada sólo RAM del proceso navegador QA; nunca archivo/argumentos/logs. Reemplazar binding público efímero al próximo deploy con la clave pública del proceso activo, sin exponer valores servidor. Retirar KV, Cron, mecanismo y SecretAdmin al cerrar. Antes de conectar: lectura fresca directa/SDK y QA de versión vigente. Reproducir oficial403 usando UI y comprobar ausencia del producto antes/después de la solicitud.

# Auditoría Admin retomada: QA histórica completa, oficial aún legacy

SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.

Recuperación de sesión del 02/11/2026 (America/Buenos_Aires). PR56 sigue abierta/draft en `codex/admin-cards-audit`, HEAD `f2efb1d`; no hay commits posteriores remotos. Se preservan los cambios documentales sin commit de la sesión anterior. Oficial: Pages `a3184576`, frontend `7b302cf`, backend legacy `d5df723d`/`ec04a358`; no conectada al candidato. Candidato privado efectivo `fb7d3c95`, deployment `a8d7a52a`, ambos Secrets presentes por nombre/tipo sin valores.

Se recuperaron las NUEVE fases del 29/10: Auth, carrito, opiniones, checkout académico, módulos Admin, persistencia/imágenes, stock/destacados, cupones y moderación: PHASE_PASS/PASS. Terminaron a17:39:25UTC; el proceso se interrumpió antes de publicación y retirada final. Evidencia `docs/evidence/functional-backend-20261027/recovered-nine-phases-20261029.json`. Los arrays de checks fueron truncados por Cloudflare: no inventar totales por caso a partir de ellos. No repetir esas pruebas como análisis inicial; la promoción requiere lectura reciente y comprobación de la versión vigente.

Nuevo alcance prioritario: auditoría funcional completa del Admin oficial, reproducción de guardado bloqueado, corrección específica del enrutamiento sin habilitación indiscriminada. Se prepara canal temporal de sesión RSA-OAEP/AES-GCM por KV PRIVADO, sin endpoint público: contraseña Admin sólo dentro del Worker, clave privada efímera y sesión descifrada sólo en RAM del navegador QA. Capturas sin datos personales, exclusivamente recursos QA. No cambiar contraseña/rol. Al terminar: logout de sesiones de prueba, retirar KV, mecanismo, Cron y `DREAMS_QA_ADMIN_PASSWORD`. Sin sitios/previews/DNS/pagos/seeds/resets nuevos; sin ZIP final.

# Continuidad vigente: clave válida y QA dividida por límites del plan — 2026-10-29

La versión privada `4862a658-f541-40b1-b03a-88327c54579d` (fuente `09ee61a`, CI 216 aprobada, 398 tests) heredó ambos Secrets de `8fcb56e1-b2a5-4cd7-832a-e084b5aab0e1`. Lectura directa y SDK: 200, proyecto esperado, clave sin transformación. No solicitar otra copia ni modificar Auth.

QA remota real: registro normal de A/B con sesión inmediata y perfil customer; logout, login, contraseña incorrecta, renovación y persistencia; Admin denegado a anónimo/customer; combinación idempotente y aislamiento de carrito: PASS. La ejecución completa agotó los 50 subrequests del plan Free antes de terminar. No es un fallo de la clave. Se retiró el Cron. No hubo escrituras comerciales ni pruebas Admin todavía.

Se divide la QA en nueve fases cortas, con marcadores en operaciones del carrito exclusivo QA. Reutilizar las cuentas del run `pr56-09ee61a-r1` mediante `QA_CREDENTIAL_RUN_ID`; limpiar esos carritos y revocar únicamente sus sesiones QA. No cambiar el plan. Cada fase compara stock y pedidos comerciales, limpia sus recursos y cierra las sesiones. Admin usa exclusivamente el Secret temporal autorizado, con login normal y logout local; nunca cambia credenciales/roles.

Oficial conservada en `a3184576`; no conectar candidato antes de completar QA. Al finalizar: publicar sólo la oficial autorizada, verificar y retirar Cron, mecanismo temporal y `DREAMS_QA_ADMIN_PASSWORD`. Conservar rollback. Documentación en GitHub, sin generar ZIP final. Los registros anteriores debajo son históricos.

# Nueva clave verificada200; corregir transporte de QA — 2026-10-29

SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.

ConexiónRESUELTA para el Secret del usuario8fcb56e1. WorkerQA4d32d704-61bf-467a-aeee-bb78045ecf1a/deployment55c0ba9b heredó AMBOS Secrets explícitamente de8fcb56e1 delMISMO Worker. Reporte16:49:57UTC acredita sourcecommit99ef199, secret_source_version8fcb56e1 y metadatareal4d32d704: directo200/SDK200,apikey_unchanged=true,project_key_pair=verified_by_read,URLesperada ysinwhitespace/controles/comillas. NO pedir copiarclaveotra vez. Evidencia docs/evidence/functional-backend-20261027/new-secret-read-20261029.json.

PrimerQAreal se detuvo enregistro400 ANTESdeAuth: gatewaySupabase mostró sólo lecturas productos/orders, ninguna peticiónAuth. CausaREPRODUCIDA enworkerdlocal: Request sintética interna sinContent-Length no es parseada porExpress; alañadirlongitudJSONUTF8exacta, mismo flujo leeJSON, llamaAuthfixture ydevuelve200/sesión. Se corrige SÓLOtransportedelharness; noAuthconfig/validaciones/roles. Cron retirado al recuperar reporte; snapshotsstock/órdenesunchangedPASS, nocuentascreadasenesaintento. No confundir este400conotrofalloSecret.

Runnercorregido añade Content-Length, marcador de perfilQAporrun paraevitarrepetiraltasdesdeotroisolate, limpieza de sesiónAdmininclusosi fallaantesdecrearproducto ymoderaciónreal sobreopiniónQA. Reintento sóloprivado conSecret8fcbverificado yAdminya disponible; nootrospromptscredenciales. TrasQAcompleta,publicaciónoficialautorizada,smokeycierre/retiradaSecretAdmin/mecanismotemporal. Oficial siguea3184576hastaQA. SinZIP,otros sitios,DNS,pagos,seeds/roles/passwordAdmincambiados. CI215/99ef199397PASS previo; suite/build/CI deesta corrección seacreditanalterminar.

# Segunda copia del Secret recibida; verificar nueva versión — 2026-10-29

SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.

Usuario volvió a copiar mediante Copy de Secret keys/default y desplegó sólo el Worker privado. Confirmado nuevo SUPABASE_SECRET_KEY en8fcb56e1-b2a5-4cd7-832a-e084b5aab0e1, deployment7cc9abf0-3ebd-4d1a-b991-22d035c41849,100%,16:36:22UTC. Historial y bindingProduction/default/proyecto esperados comprobados sin leer valores. SecretAdmin siguepresente. NO atribuirle el fallo anterior de36319df7: necesita nueva prueba de este binding. No pedir otra copia antes de acreditar identidad y prueba nueva.

Se prepara activación deQAinterna acotada con ambosSecrets heredados EXPLÍCITAMENTE de8fcb56e1 delMISMO Worker; metadata deversion y referencia deSecretorigen incluidas enreporteescalar. Primero lectura directa ySDK ytipo servidor; sólo si200, sigue registroA/Bnormal, sesiones, Adminlegítimo yrecursosQA, carrito/opiniones/académico. NoendpointQA público ni impresión de claves/headers/contraseña. Alterminar cerrar sesiones, retirar mecanismo y SecretAdmin según autorización. Oficial aúnrestaurada hastaQA necesaria. No cambiosAuth/roles/contraseñaAdmin, nootros sitios/ZIP/DNS/pagos/seeds.

Código397tests/CI214 previo conservado; nueva modificación sólo añade formato/URL/identidad de binding al reporte para evitar confusión de versiones.12tests focalizadosPASS, inventarioPASS ybuildoficialPASS. CI delnuevo checkpoint acredita esa modificación; no repetir matrices previas. Resultado remoto de8fcb56e1 todavíaPENDIENTE, no afirmar conexión.

# Secret Admin cargado; Supabase sigue bloqueando la QA — 2026-10-29

SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.

Usuario confirmó carga y autorizó usar DREAMS_QA_ADMIN_PASSWORD sólo para QA interna del Adminexistente, sin cambiarla; AL TERMINAR cerrar sesiones y retirar mecanismo temporal y ese Secret. Presencia secret_text comprobada SIN leer valor. Versión activa4e3d734f-a839-4c5c-9b45-afc2dad88741, deployment0b571bac-d239-4482-a167-0c5e32a18936,100%, creada16:15:23UTC al añadir SecretAdmin. No hay otro reemplazo de SUPABASE_SECRET_KEY posterior a0968d006 en el historial consultado: conserva el valor que falló en la sonda36319df7. No repetir sonda por agregar sólo SecretAdmin; no solicitarle de nuevo ese Secret ni usar contraseña de reset.

QAreal todavía NO ejecutada: la lectura directa/SDK del valorSupabaseprobado sigue fallando; no se consumió contraseñaAdmin ni se crearon cuentas/productos remotos. Cron sigue vacío, oficiala3184576conservada, candidato sinURLpública. Prioridad: copia completa segura de Secretkeyservidor a SUPABASE_SECRET_KEY; luego heredar AMBOS Secrets de la nueva versión del mismoWorker. RunnerQA interno preparado conguardas, caducidad, limpieza y comparación de negocio; aún NO desplegado. No crearZIP, modificarAuth, roles o contraseñaAdmin ni publicar antesdeQA.

Validación local del código nuevo: suite395PASS trasprimerasguardas,12tests focalizadosPASS tras endurecer constructor y tipo de clave pública; inventario109archivos/1936registros/cero>40. Check95JS y buildoficialPASS. CI delcheckpoint acredita suitefinal397 y demáschecks cuando termine, no confundir eltotalesperado conresultadoaúnnoobservado. Controles/validezdeheader nuevos en código NO están medidos en la sonda anterior. Fases: preparaciónlocal/documentalavanzada; conexión yQAremotaBLOQUEADAS; publicación/mainpendientes, sinporcentajeficticio.

# Reemplazo del Secret recibido; nuevo valor todavía inutilizable — 2026-10-29

SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.

Usuario informó «ya la cambie». Confirmada versión0968d006/deployment7f754fe2 actualizada por Secret15:53:52UTC. Sonda privada heredó EXACTAMENTE ese binding nuevo del mismoWorker, no el antiguo: versión2f3178eb y luego36319df7/deploymentd7305b8f, extensión acotada por propagaciónCron. Resultado recuperado16:09:32UTC: modern_secret presente, URLproyecto esperada, espaciosINTERNOS y controlASCII (non_ascii histórico incluye controles;42caracteres/42bytes). Directo falla transporte sinHTTP;SDKstatus0/succeededfalse. NO afirmar401nuevo ni clave/proyecto verificados. No quitar caracteres ni mostrar claves/fragmentos/headers. Evidencia docs/evidence/functional-backend-20261027/credential-replacement-20261029.md/.json.

Cron temporal retirado y schedules=[] confirmado; URLs públicas del privado siguen desactivadas. Oficial conserva a3184576/7b302cf y sóloDREAMSlegacy efectivo. No QA autenticada remota iniciada ni cuentas/productos/stock/orders/Auth/Admin/DNS/otros sitios modificados. Se pidió repetir la copia por botón del valor Secretkey existente de Supabase y cargarlo sólo en SUPABASE_SECRET_KEY del privado, sinchat ni capturas. No otra sonda hasta cambio real. Falta además sesiónAdminlegítima: solicitud asíncrona de Secret temporalDREAMS_QA_ADMIN_PASSWORD, contraseñaACTUAL sin cambios; no asumir cargado ni usar variable destinada a reset.

Trabajo independiente: worker/official-qa.mjs prepara runner interno scheduled opt-in, con vencimiento≤30min, sin endpointpúblico ni credenciales enreportes; exige lecturadirecta/SDK200 antesdealta normalA/B. Incluye rolescustomer, login/logout/refresh, aislamiento/mergecart, autoríayborradoopiniones, académico/WhatsApp sinenvío, Adminexistente con Secretopcional, móduloslectura y productos/cuponesQAconlimpieza; compara stockcomercial yorders. No declarar QAreal por existir elrunner. worker/official.mjs comparte fetchconrunner sin habilitarrutasQA. Diagnóstico local ahora distingue controles/whitespaceinterno/header válido; esas nuevasbanderas aún NO desplegadas ni medidas en la muestra citada. Pruebasguardas/scheduledPASS; suite/build/CI final se acreditan encheckpoint.

Supabase aceptado porprofesor segúnusuario; integrantesMartearena/Ruas. NoSQLite niZIPnuevo. Mantener PR56 hasta conexión/QA necesarias; merge/main ypublicación autorizados cuando se resuelvan. Próximo: detectar versión nueva trascopia→readprivado→QAautenticada→oficialúnica conrollback. No repetir matrices previas201/390tests como proceso sin cambio; regresión actual justificada por códigoQA nuevo.

# Supabase aceptado e integrantes confirmados — 2026-10-29

SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.

El usuario confirmó que el profesor aceptó Supabase y los apellidos Martearena y Ruas. Se registra como aceptación docente comunicada por el usuario, sin inventar comprobante adjunto ni equivalencia PostgreSQL/SQLite. SQLite ya no es bloqueo ni requiere migración. Se actualizaron matriz/README/entrega y footer compartido con los apellidos confirmados, sin deducir nombres de pila.

Nueva instrucción: subir todo a GitHub y corregir pendientes; NO generar otro ZIP final. Conservar evidencia histórica de extracción: df70b9c/CI212SUCCESS,390tests, inventario106/1873/cero>40 y cuatrobuilds, ZIP limpio305entradas. No repetir esos procesos por rutina. La actualización actual no cambia Auth, DB, credenciales Admin, Secret ni backend desplegado.

Siguen pendientes conexión del candidato y QA autenticada real: no hay aviso de reemplazo del Secret; no repetir la sonda401 ni conectar candidato a oficial. Mantener rollbacka3184576. Main4655b0c no contiene la entrega; cambios en PR56/codex/admin-cards-audit, con integración autorizada condicionada a resolver dependencias funcionales. Próximo: cargar el valor correcto sólo en dreams-official-backend/Production-default/SUPABASE_SECRET_KEY, lectura directa/SDK desde nueva versión y QA; luego promoción oficial. No nuevos ZIP, otros sitios, DNS, pagos, seeds o resets.

# Checkpoint de entrega verificado en CI y ZIP — 2026-10-29

SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.

Código y entrega en633aec35ce0bb05ad24e29d3c954b6d59b3ff651 pusheados. CI211/40903937335SUCCESS: install,audit,sintaxis,inventario390tests ycuatrobuilds. ZIPextraído limpio sin.git ni secretos reales: installfrozenPASS,sintaxis92PASS,inventario106archivos/1848funciones+25bloques/0>40,390testsPASS0skip,cuatrobuildsPASS. Resultado versionado docs/entrega-2026/verificacion-zip.json; contenidos304entradas sin.env real/node_modules/.git. El checkpoint siguiente sólo acredita documentos/evidencia; archivo final se genera desde eseSHAexacto y se verifica de nuevo. PUSH:SÍ. DEPLOY:NO.

No cambió bloqueo funcional: candidato62f6bd7c mismoSecretmalformado401, oficiala3184576conservada, no merge amain4655b0c porqueSecret/QAreal/SQLitependientes. Apellidos preguntados sinrespuesta; nombreZIPprovisional porSHA. ManualPDF4p y wireframePNG/SVGinspeccionados, capturaslocalesindicadas; ninguna sesiónAdminreal ni autoríaalumnos inventada. Documentación preparada no significa entregaCOMPLETA. Continuar trasreemplazosegurodelSecret sinotraautorización; obtenerlecturadirecta/SDK200 yQAantesdepromover. No otros sitios/Auth/Admin/stock/clientes/pagos/DNSmodificados.

# Entrega2026 preparada; conexión y QA remota bloqueadas — 2026-10-29

SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.

Retomado desde be57610 (posterior a2b8dcc1); PR56 abierta/draft sobre codex/collection-multiselect, predeterminada main4655b0c. GETCloudflare confirma oficial restaurada a3184576/frontend7b302cf con sóloDREAMSlegacy; candidato62f6bd7c/deployment82492c72 sin reemplazo de Secret, bindingProduction/default correcto yURLproyecto esperado. No se repitió sonda401 acreditada ni deployment fallido; noAuth/Admin/DB mutaciones. Se pidió temprano la única intervención: cargar SecretAPIkey existente íntegra en SUPABASE_SECRET_KEY del privado; no tokens adicionales/chat/capturas. QAAdmin requiere sesión legítima existente aún no disponible, sin cambiar credenciales.

Usuario amplió alcance: rúbrica2026 PDF leída y versionada, límite40 sustituye20. Se preguntó aceptación explícita deSQLite y apellidos, sin respuesta todavía. docs/entrega-2026 incluye matriz completa con SQLiteNO CUMPLE, wireframePNG/SVG adaptado de imagen adjunta, manualMD/PDF4p con capturasLOCALES, BD/Mermaid/columnas reales sin filas privadas, API, bitácora honesta, guía defensa, diseño e inventario. README corregido Node24/pnpm11.19/8080/sinseed y hosting real. No se atribuyen aportes/dominio a alumnos ni preentregas sin evidencia.

Implementación: factoriesExpress/Node/Workers/checkout/firmas/helpers y fixtures divididos conservando orden/seguridad; inventarioAcorn8.15fijado recorre sin.git106 archivos/1873registros/cero>40. Programa principal explícito separado de archivo y datos declarativos. Admin confirma lectura posterior de todos los campos antesdeéxito, conservaformulario antefallo;25casos nuevosPASS. Carruselmanual3colecciones accesible sinvideo/autoplay,3testsPASS; doblecarga motion corregida trasdetecciónbrowser. MatrizAdminprevia201 preservada; nuevaáreaD25 casos distintos adicionalessinrepetirinventario completo.

Validación local: suite387PASS antesdetrescasos nuevosdelcarrusel, éstos3PASS; sintaxis91antesdelúltimotest; inventariofinal0>40,auditlimpio,cuatrobuildsPASS. Chromium15comprobacioneslocalesPASS,6anchos,guardadoconimagen/recarga/catálogo/detalle,botones104x44,sinJS,ceroerrors. FixturesnoequivalenQAremota. ZIPexacto/instalaciónlimpia/CI delcheckpoint se acreditarán al concluir. Sin nuevaauditoríaperformance/WCAGcompleta; sinmigración ni escriturascomerciales.

Fases: recuperación/lecturaPDF/local/documentaciónPREPARADAS; conexiónvalorPENDIENTEusuario; registro/login/Adminremotos/carrito/opinionesfinalesBLOQUEADOS; SQLiteyapellidosPENDIENTES; ZIP/CIenverificación; merge/publicaciónBLOQUEADOSporrequisitosnoresueltos. Avance documental y local real; sin porcentaje global inventado ni cierrefuncional. No conectar candidato hasta lectura200directa/SDK yQAnecesaria; rollbacka3184576disponible. DEPLOY:NO. OTROS SITIOS:NO.

# Acceso existente revisado; intervención mínima — 2026-10-29

SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.

Continuación desde 2b8dcc1, sin repetir CI, matrices, sonda fallida ni publicaciones. Ejecutor operativo y checkout limpio comprobados. Cloudflare conectado respondió GET secrets 200: SUPABASE_SECRET_KEY/secret_text presente en dreams-official-backend. La integración ofrece PUT del Secret creando versión; no hace falta pedir token Cloudflare para esa operación. No se probó escritura con un valor ficticio ni se cambió ningún binding.

Entorno observado actual/ready: SUPABASE_SECRET_KEY protegido y limitado a nwsmbemwtexmrtpkgxrz.supabase.co; su representación local no es una clave servidor exportable (ni modern secret ni JWT). SUPABASE_ACCESS_TOKEN, CLOUDFLARE_API_TOKEN y DREAMS_QA_ADMIN_PASSWORD ausentes. No se mostraron valores, fragmentos ni headers. Supabase conectado sólo expone claves públicas, no lectura de claves servidor; no hay herramienta de navegador autenticado para copiar desde el dashboard. No usar la contraseña destinada a reset como contraseña Admin actual.

La petición anterior de DOS tokens queda reemplazada por UNA intervención concreta: desde Supabase del proyecto nwsmbemwtexmrtpkgxrz copiar una Secret API key de servidor existente completa y cargarla directamente en Cloudflare > Workers & Pages > dreams-official-backend > Settings > Variables and Secrets > Production/default > SUPABASE_SECRET_KEY, tipo Secret; guardar/desplegar sólo ese Worker privado. Nunca pegarla en chat ni reutilizar capturas. No crear/rotar/revocar claves. No ejecutar el reparador de gestión preparado, cuya creación aditiva requiere explicar primero su necesidad.

Después de que el usuario indique carga terminada, continuar sin nueva autorización: observar versión nueva, ejecutar lectura directa y SDK desde candidato, confirmar proyecto, registro normal A/B sin confirmar email, login/sesión/logout, carrito y ownership de opiniones; QA Admin sólo con sesión legítima del Admin existente, sin creación ni cambio de contraseña. No afirmar acceso Admin disponible. Mantener candidato desconectado de oficial hasta QA necesaria acreditada. Rollback a3184576 conservado; ninguna publicación ni otro sitio modificado en esta tanda. Pruebas nuevas: sólo presencia y capacidades; CI209/360 tests previo conservado. Progreso funcional sin variación: reparación de valor pendiente, QA remota/publicación bloqueadas.

# Continuación desde 6f54b08; reparación automática preparada — 2026-10-28

SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.

CI #207 de9192d32 ya corregido en6f54b08: CI #208 SUCCESS/355 tests/cuatro builds. Metadatos actuales: frontend oficial7b302cf/Pagesa3184576, backend servido ec04a35/d5df723d; privado62f6bd7c/82492c72 sin cambios de Secret ni cron. No se repitió sonda ni deployment fallido.

Usuario pidió que el agente reemplace el Secret. Autorizado, pero falta capacidad de gestión: Supabase conectado sólo entrega claves públicas; credencial del entorno permite lectura200 por inyección y no es exportable; Cloudflare CLI sin token. Se preparó scripts/repair-official-secret.mjs (transferencia sólo en memoria al privado, sin borrar claves ni publicar Pages) y cinco tests PASS. Intento seguro detenido antes de IO por missing_secure_management_credentials. Se solicitaron por canal protegido del entorno SUPABASE_ACCESS_TOKEN y CLOUDFLARE_API_TOKEN, con enlaces/permisos/destinos exactos en docs/evidence/pr56-current-20261028/status.md. No pedir tokens por chat ni extraerlos de las integraciones. La clave dañada no se reconstruye quitando espacios.

Trabajo independiente: función submit_registration de21 líneas descompuesta sin alterar comportamiento; siete tests de registro PASS. AuditoríaAST19 archivos/284 funciones relevantes sin exceder20 líneas; buildPages PASS. MatrizAdmin previa201 y mínimos A28/B25/C25/D27/E30/F24 conservados, no repetidos. QAAdmin real requiere mecanismo seguro de contraseña actual; se ofreció Secret temporal DREAMS_QA_ADMIN_PASSWORD sólo en el privado, sin cambiar credenciales. No asumir cargado.

Próximo: comprobar readiness de accesos de gestión si el usuario informa carga, ejecutar reparador autorizado, probar desde candidato privado, completar QA real y sólo después publicar oficial. Si no hay accesos, mantener oficial sana y explicar limitación concreta. Registro oficial FAIL en evidencia403; candidato, sesiones y guardado Admin BLOQUEADOS. Auth configuración ya resuelta, no repetir. DEPLOY OFICIAL EN ESTA TANDA:NO; OTROS SITIOS:NO. Estado completo y matriz vigente en docs/evidence/pr56-current-20261028/status.md.

# Parche de audit del checkpoint — 2026-10-28

CI #207 se detuvo antes de los tests por GHSA-6pq8-jhm2-2vcw en qs 6.16.0. Se actualizó sólo la resolución transitiva de Express a qs 6.16.1, que ya estaba presente para body-parser. Instalación frozen y audit sin vulnerabilidades comprobados. No se desplegó ningún backend ni se repitió la sonda. El diagnóstico de espacios internos en el Secret sigue vigente; corrección segura del valor y QA autenticada continúan pendientes. La suite final se acredita por CI del nuevo SHA.

# Diagnóstico confirmado; requiere corrección segura del valor del Secret — 2026-10-28

SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.

Se retomó desde29ee9ea sin repetir eldeployment fallido. Logs de sonda interna62f6bd7c/deployment82492c72 recuperados: SecretSUPABASE_SECRET_KEY de dreams-official-backend/Production-default contiene espaciosINTERNOS. SDK lo envía íntegro (apikey_unchanged=true); HEADmínimo directo sóloapikey401 y mismoHEADporSDK401. Sin whitespaceexterior/comillas/asignación/enmascarado. Causa comprobada: valor almacenado malformado/rechazado, no truncamiento delSDK ni sóloBearer. No se reconstruye quitando caracteres. URLdelproyecto correcta; pertenencia de claveopaca aún noacreditada por ausencia de lectura200.

Cron temporal retirado y schedules=[] confirmado; sonda ya estaba vencida. Privado sigue62f6bd7c, sin workers.dev/previews. Oficiala3184576 conserva sóloDREAMSlegacy efectivo, sin nueva publicación/conexión ni cambiosAuth/Admin/DB/Secrets. deployment_ready=false. Evidencia y pasos exactos de carga segura desdecelular: docs/evidence/functional-backend-20261027/credential-diagnosis.md y credential-diagnostic-result.json. No pedir valorporchat ni eliminarclaves; usuario autorizó pedir reemplazo seguro si es necesario.

Próxima acción: usuario copia SecretAPIkey completa del proyecto nwsmbemwtexmrtpkgxrz al bindingSUPABASE_SECRET_KEY delWorker dreams-official-backend/Production-default, tipoSecret, guardando/desplegando sóloelprivado. Luego probar lectura mínima en nueva versión antesdeQA autenticada y cualquier publicaciónPages. Rollbacka3184576 disponible. QAAdmin existente sigue pendiente, sin cambiarcontraseña.

Fases: identidad/binding/SDK/formato/lectura remota de diagnóstico COMPLETADOS con rechazo401; corrección delvalor PENDIENTEusuario; QAautenticada y promoción BLOQUEADAS. Guardpublicación reforzado exige lectura200 reciente yQAexactaversión. Sin porcentajesglobalesinventados. No nueva revisiónUI/responsive/accesibilidad/performance porque no se modificaron. PUSHdelcódigo diagnóstico:SÍ; DEPLOYsólointerno diagnóstico:SÍ; DEPLOYoficialnuevo:NO.

# Diagnóstico seguro del candidato en curso — 2026-10-27

SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.

Continuación desde fd53b15. Oficiala3184576 conservada; ningún nuevo deployPages. Identidad/binding/URL/SDK auditados en docs/evidence/functional-backend-20261027/credential-diagnosis.md. Se prepara una versión interna de diagnóstico con scheduled temporal opt-in, sin endpoint ni URL pública, para comprobar formato y una lectura mínima desde el binding real. No se modifica Secret/Auth/Admin. Cuatro regresiones nuevasPASS; suite/build/CI y ejecución remota se informan al completarse. No atribuir bad_length a truncamiento o a otro proyecto sin evidencia runtime. deployment_ready=false.

# Resultado vigente: oficial restaurada; candidato bloqueado por rechazo upstream — 2026-10-27

SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.

Entorno de ejecución RECUPERADO. Código funcional reconstruido y pusheado en PR56; CI203/d8fec8f y CI204/232d2dd SUCCESS (346tests,81check,audit y cuatrobuilds). Publicado sólo en la oficial como Pages1e881ec8-7c32-4a2e-9857-ef63bf091c4f desde232d2dd; backend privado2ef6be90/deployment43a8bd54 heredó Secret del MISMO Worker939c179c. No se leyó/copió su valor ni se reconfiguró Auth.

**Smoke FALLÓ**: /api/health503, /api/products500, /api/reviews500. Logs Supabase16:58–17:02UTC: REST401, UNAUTHORIZED_INVALID_API_KEY; apikey_error y authorization_error=bad_length. Esto es validación de uso fallida, distinta de existencia/tipo del Secret ya comprobados. No atribuir al SDK o a Confirm email sin evidencia. No volver a cargar ni solicitar secretos por instrucción del usuario. El bootstrap anterior nunca había acreditado acceso DB real.

**ROLLBACK REALIZADO** a Pagesa3184576-4390-4a71-9205-d9269bd7dfe7/fuente7b302cf. Canónico confirmado y HTTP health200/databaseok, catálogo200/46productos, config200 sin capacidad nueva. El candidato NO queda en tráfico oficial. deployment_ready=false impide publicación CLI hasta resolver y acreditar acceso real. Binding producción DREAMS_OFFICIAL permanece preparado junto a DREAMS; rollback sólo usa DREAMS. Worker privado sigue sin workers.dev/previews.

DB antes/después idéntica:46productos/0orders/0reviews/2inquiries/10usuarios; stockdigest7a58615dd40e0dcfd898a52aa108b820, rolAdmin originaladmin. Ninguna cuentaQA llegó a crearse: el harness abortó en health. Auth/cartA-B/reviews/Admin reales NO ACREDITADOS. No credenciales/correo/rolAdmin, productos, stock, pagos, DNS u otros sitios modificados; sin merge.

Fases: recuperación/composición/local/CI COMPLETADAS; backend privado DESPLEGADO pero accesoDB FALLA; promoción oficial REVERTIDA y restauración VERIFICADA; QA autenticada cliente/Admin BLOQUEADA por acceso del privado. Diseño/accesibilidad completa/performance avanzada sin nueva auditoría; no porcentaje global inventado ni cierre funcional. Evidencia en docs/evidence/functional-backend-20261027/verification.md.

Próxima acción exacta dentro de restricciones: mantener oficial sana y comparar diagnóstico seguro de autorización del backend privado con su proveedor, sin imprimir ni reemplazar credenciales; sólo volver a publicar después de acreditar acceso DB correcto. No repetir configuración Auth ni pedir secretos. Sesión Admin existente sigue pendiente para QA, sin cambiar contraseña. PUSH REALIZADO:SÍ. DEPLOY REALIZADO:SÍ, REVERTIDO; release funcional oficial:NO.

# Backend privado desplegado; publicación Pages preparada — 2026-10-27

SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.

Código d8fec8ffa50f5d8dcb72bfba1e75b4cd28e7e134 pusheado en PR56 sin merge. CI40543798417/#203 SUCCESS:346tests, sintaxis81/audit y cuatrobuilds. Worker privado versión2ef6be90-b8d8-4e03-8bc4-58b36718e6f1, deployment43a8bd54-658a-4240-9327-66e4885c6f78 activo100%; Secret heredado de939c179c del MISMO Worker por API moderna, sin leer/copiar valor. Startup53ms. Workers.dev/previews=false reconfirmados.

Añadido sólo binding producción DREAMS_OFFICIAL=dreams-official-backend, conservando DREAMS y demás configuración. Pages canónico continúa a3184576; ninguna preview nueva. deployment_ready=true tras CI/código privado/binding verificados, para publicación autorizada sólo https://dreams-perfumes.pages.dev/. Requiere CI del checkpoint de release y smoke real; si fallo material usar rollbacka3184576.

Ticket académico legacy capturado antes del cambio para probar continuidad, sin datos financieros ni orders. QA autenticada remota todavía pendiente. Admin real sin sesión acreditada; credenciales originales sin cambios y no se solicitan secretos.

# Recuperación de ejecución y composición — 2026-10-27

SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.

Entorno operativo comprobado; branch PR56 codex/admin-cards-audit recuperada desde a6e97d0. El checkout inicial no contenía continuidad y se informó antes de recuperarla del remoto. Worktree anterior perdido: reconstruida composición selectiva PR55/0dbfbbaf, preservando Admin/WhatsApp/stock/lockfile actuales; sin merge ni force-push.

346/346 pruebas PASS; sintaxis81 JS/MJS, audit sin vulnerabilidades, builds privado/Pages PASS.48 navegaciones Chromium locales/seis tamaños sin pageerrors/overflow;8 comprobaciones del bundle privado en workerd local con Supabase simulado PASS (compatibilidad local máxima10-08, smoke remoto pendiente). Evidencia: docs/evidence/functional-backend-20261027/verification.md.

Auth config y Secret privado ya resueltos: no se reconfiguraron ni solicitaron. No credenciales Admin cambiadas; la variable destinada a nueva contraseña no se usa para reset ni se asume actual. No DDL/seeds, productos, stock, pedidos o DNS modificados. Oficial aún a3184576. deployment_ready=false hasta verificar código privado y CI.

Próximo exacto: push/CI del código reconstruido → privado con Secret heredado del mismo Worker → conservar binding existente y añadir DREAMS_OFFICIAL sólo producción oficial → publicación y QA remoto controlado. Admin real continúa sin sesión acreditada; no declarar persistencia Admin probada por fixtures. Progreso por fases sin porcentaje inventado: recuperación y composición/pruebas locales completas; CI/publicación/QA remoto pendientes; diseño/performance avanzada/accesibilidad completa no reevaluados.

# Continuación funcional — 2026-10-27

- Confirm email/signup: RESUELTOS por usuario y verificados HTTP200/mailer_autoconfirm=true.
- Secret privado: RESUELTO; SUPABASE_SECRET_KEY secret_text versión939c179c en dreams-official-backend privado, sin leer valor.
- Composición PR54/55/Admin56 y nuevo backend: LOCAL, pendiente de preservar/validar/commit;43+29 focalizadas PASS, suite final/build no acreditados.
- Ejecutor: BLOQUEADO, entorno seleccionado unavailable; no herramientas de reinicio. Reapertura de entorno o nueva tarea necesaria, SIN recargar claves.
- Continuidad remota completa: docs/continuity-functional-backend-20261027.md. Guardar diff/untracked antes de sincronizar rama documental.
- Oficial conserva a3184576/7b302cf y backendlegacy; no nueva publicación funcional, ni usuarios/datos/roles/DNS alterados.
- Próximo exacto: entorno operativo → recuperar cambios → completar checks/CI → código privado con Secret heredado del mismo Worker → binding Pagesoficial y QA real. Admin requiere acceso seguro existente, sin cambiar credenciales.

# Publicación oficial parcial y QA comprobadas — 2026-10-27

SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.

OFICIAL https://dreams-perfumes.pages.dev/ Pagesa3184576-4390-4a71-9205-d9269bd7dfe7 SUCCESS/production/canónico, fuente7b302cf6b1896cfe500a0643290646b3086cb082. PR56/rama codex/admin-cards-audit abierta/draft sin merge, basePR53; PR54/55/video excluidos. Backendec04a35/d5df sin cambio; release retira destino Adminpreview. UI Admin/search/stock/acciones104×44 e imágenes/formulario local acreditados, WhatsApp nativo seguro/teléfono validado, autofill y guardcompressedAPI415 publicados. Actualización lockfileparches pero NO backendruntime. CI40530812778 exacto SUCCESS288tests/check63/audit/tresbuilds;40focalizadosfinalesPASS/12QA localnueva/201matrizAdminreutilizada.

Remoto oficial26HTTP+10browser+2académico=38PASS/0FAIL en comprobaciones; objetivo registroFAIL y8objetivosBLOQUEADOS separados en docs/evidence/official-review-20261027/matrix.md. Checkoutacadémico sin datos financieros, dobleclic1operación/referenciareloestable/carritolimpiadotrasresultado/0pasarela. DBantes-después46productos/0pedidos/0reviews/2consultas/10usuarios y stockdigestidéntico. Ninguna cuenta/rol/credencial/stock comercial modificada.

Bloqueos:register403 por PREVIEW_READ_ONLY heredado y Confirm email activo (settings200/mailer_autoconfirmfalse), entorno141 sin SUPABASE_ACCESS_TOKEN ni canal seguro/Management Auth; no sesiónQA Admin/customer real. Guardado y nuevas imágenes reales, sesión/login/logout autenticados, carritoUUID/reviewspropias y parche runtime backend pendientes; no activar sin QA real. AdminUUID y rol confirmados,5cuentaspendientes/1sinperfil/0adminspendientes sólo inspeccionadas. No bypass ni secretos en chat.

Rollback anteriorf44a6069/461c17d SUCCESS/raíz200 retenido, no ejecutado. Otros sitios/previews intactos (animadaba6891f4/c8439ac); NO nuevos proyectos/previews/DNS/video/merge/DDL. Documentación y capturas:docs/official_review_20261027.md. Progreso sin porcentaje inventado:antesUI sólo candidato; ahoraUI/WhatsApp mitigaciones oficiales verificadas, Auth/guardado siguen bloqueados. Próxima acciónexacta:acceso seguro a GET/PATCH Auth config del proyecto y sesión controlada Admin/customer, revisar consumidores/Confirm email y validar persistencia antes de habilitar escritura/PR54/55. PUSH y DEPLOY OFICIAL:SÍ, alcanceparcialexplicitado.

# Seguridad detectada durante CI — 2026-10-27

CI39c656c falló en audit por body-parser/ip-address nuevos, antes de tests. Lockfile actualizado sólo a body-parser2.4.0/ip-address10.7.5/qs6.16.1, audit sin vulnerabilidades conocidas. Mitigación Pages oficial rechaza cuerpos API comprimidos415 antes del parser legacy, JSON normal intacto. Backendd5df no se modifica; falta parche runtime, no confundir lockfile con deploybackend. Ningún otro sitio/preview tocado. Repetir sólo validaciones afectadas y CI de nuevo commit antes de publicar Pages.

# Continuación limitada a la OFICIAL — 2026-10-27

SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.

PR56/misma rama codex/admin-cards-audit, sin merges/otras webs/previews nuevas. Oficial f44a6069/461c17d y backendd5df/ec04a35 reconfirmados. ConfigAuth actual: mailer_autoconfirm=false/disable_signup=false, registro403 middleware; entorno141 sin SUPABASE_ACCESS_TOKEN ni canal seguro de carga. AdminUUID/rol confirmados; sin sesión QA real, no activar escrituras. PR54/55 preservadas.

Publicación parcial independiente preparada: Admin UI existente (matriz201 reutilizada), pin de todas las APIs al backend oficial (no candidato), WhatsApp nativo sin esperar consultas y teléfono validado, autofill acotado. Nueva QA local12PASS móvil/escritorio y23tests focalizados PASS; guardas de release y builds en curso. No se atribuyen correcciones servidor a backendec04a35. Docs/evidencia docs/official_review_20261027.md. Próximo: CI/build/revisión final, publicar sólo Pagesoficial autorizado y verificar alcance, conservando rollbackf44a6069. Auth/sesiones/guardado/cartUUID/reviews siguen bloqueados por acceso real; no porcentaje global inventado.

# Candidato Admin publicado, oficial preservada — 2026-10-21

SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.

PR56 draft/rama codex/admin-cards-audit, base PR53; selección PR46, sin mezcla PR55/Auth/video. Pagespreviewcb0a3ca6 fuente c0f8bb06540ba9dd1fee8912ad9831c32976eeb2, https://admin-cards-review.dreams-perfumes.pages.dev/admin, requiere Admin real. Backend0ba07603 fuente83c36ca, read-only salvo login/logout. CI39639266639 SUCCESS279tests/check61/audit/tresbuilds. Local201ejecucionesPASS, A28/B25/C25/D27/E30/F24casosdistintos; remoto24PASS/0FAIL y10gruposBLOQUEADOS. Docs/admin_audit.md y matriz/capturas completas. Editar/Eliminar104×44 compartido, confirmación conservada. PrimerCI falló por entrypoint sin versionar, corregido, posteriores verdes.

Oficialf44a6069/461c17d y backendd5df preservados y rollback retenido. NO DEPLOY OFICIAL, NO merge/DNS/DB/roles/credenciales/datos comerciales. Auth token no disponible en ejecución actual y sin vía segura para actualizar binding; conector no administra Auth. PR55/cart/reviews remotos siguen pendientes, TRUNCATE ya retirado/verificado sin repetición. Sin porcentaje global inventado: implementación y QA local terminadas; preview protegida validada; fase autenticada/promoción BLOQUEADA. Próximo exacto: ejecución vinculada al entorno seguro actualizado y sesión real controlada de QA, completar Auth/A-B y prueba Admin de producto exclusivo antes de promover cada PR por separado. No pedir secretos por chat.

# Actualización Admin — 2026-10-21

Rama codex/admin-cards-audit desde PR53/c428daf, selección PR46 sin merge ni Auth55/video. Encabezado, siete tarjetas, buscador, stock bajo, validación de imágenes, guardado protegido y Editar/Eliminar104×44 implementados. Suite279 PASS y QA local documentados en docs/admin_audit.md y matriz por área. Preview read-only en preparación; NO publicación oficial sin sesión Admin real. Auth Management/token y QA A/B siguen bloqueados, PR55 preservada. Oficial461c17d/f44a6069 y backendd5df intactos. Sin porcentaje global inventado; fase implementación/QA local terminada, fase QA autenticada/publicación bloqueada. Próximo: publicar candidato protegido, verificar guardas remotas y completar acceso seguro de QA.

# Resultado filtros oficiales — 2026-10-20

- PR53/código461c17d/CI39517310148/154tests/check54/audit/builds: COMPLETADOS.
- Paletas/listas/API Pages/URL/menú/scroll y metadatos coherentes: IMPLEMENTADOS.
- QA local/aislada/oficial390-1440 y capturas/HTTP finales: PASS en cobertura documentada.
- Oficialf44a6069/461c17d y rollback56893d4c SUCCESS/health200: COMPLETADOS; no rollback ejecutado.
- Registro403/Confirm email activo: COMPROBADOS, resolución BLOQUEADA por Auth Management; login autenticado/customer/Admin de cuenta nueva NO VERIFICADOS.
- PR48/052b224 preservada, no integrada; video y previewcinemática intactos. Próximo: revisión visual y acceso Auth seguro para continuar esa corrección aparte.

# Filtros multiselección y revisión Auth — 2026-10-20

- Git/base oficial PR52/SEO, instrucciones y aislamiento: COMPLETADOS.
- Paletas compartidas/listas/modelo/API Pages/URL/menú: IMPLEMENTADOS.
- Suite153/check54/builds y QA LOCAL compilada390-1440: PASS, evidencia guardada.
- Registro403 anterior a validación y Confirm email activo: COMPROBADOS remotamente; login autenticado y rol customer no verificados.
- Auth config/corrección PR48: BLOQUEADOS por Management no disponible; no bypass ni cambio global sin revisar consumidores.
- Commit/push/PR/CI: próximos checkpoints; Cloudflare restablecido tras reconexión del usuario, canónico56893d4c/e66a4ec confirmado; publicación aislada/oficial PENDIENTES de QA.
- Rollback anterior56893d4c HTTP200 conservado, reconfirmar API antes de promover. Video sólo preview y demás dependencias intactas.

# SEO/redacción/metadatos oficial — 2026-10-20

- Auditoría oficial y aislamiento de PR49 frente a video/Auth: COMPLETADOS.
- Metadatos HTML/OG, lecturas públicas acotadas, noscript, sitemap, imagen social y guía: IMPLEMENTADOS.
- Checks/CI39454098983/PR52/QA aislada1eb4c3d8/noindex: COMPLETADOS.
- Oficial56893d4c/e66a4ec, QA HTTP/Chromium390-1440/noJS, validadores y evidencia: COMPLETADOS.
- Rollback82060492 disponible/SUCCESS/root-health200; revisión usuario y pendientes de contenido/Auth/redes separados.
- Perfiles sociales reales/aclaración PWA si el profesor la exige: PENDIENTES, no bloquean SEO independiente.

# Navegación y filtros — 2026-10-15

- Aislamiento de oficial/PR48 y cambio visual: COMPLETADOS.
- Tests133/check50/audit/builds/CI, QA local/preview y oficial390/1440: PASS.
- Commitcd71d12/push/PR49 y Pages oficial 82060492: COMPLETADOS. Rollback ac755bbe retenido, no ejecutado.
- Safari físico/login autenticado/CWV: NO VERIFICADOS; no se cambiaron Auth/Admin.
- Preferencia oficial registrada. Nueva dirección preview animada en PR50: PUBLICADA y verificada; Auth autenticado pendiente, ver docs de esa rama. No video en oficial ni merges.

# Resultado oficial — 2026-10-13

- Checkout directo aislado/PR44/CI/Workers/staging/Pages oficial: COMPLETADOS.
- QA remota oficial390/1440 y rollback recuperable: COMPLETADOS en cobertura documentada; rollback no ejecutado.
- Carrito por cuenta PR45: implementación/SQL/pruebas locales completadas; QA autenticada remota y promoción BLOQUEADAS por acceso seguro/identidades controladas.
- Admin original/rol: VERIFICADOS; contraseña/login real: NO disponibles ni verificados, no reset.

# Promoción oficial y carrito por cuenta — 2026-10-13

- Estado oficial/preview/PRs/Admin: VERIFICADOS.
- Checkout directo aislado sin video: IMPLEMENTADO y checks locales COMPLETADOS.
- PR/CI/Workers estático/Pages/QA oficial: PENDIENTES.
- Carrito por cuenta: rama separada; implementación y migración aditiva. Activación oficial BLOQUEADA hasta QA autenticada real.

# Navegación/footer oficial — 2026-10-09 UTC

- Base PR41 y Pages1eb932f3, dependencia PR39/38/37/34, exclusión PR40: VERIFICADAS.
- Selección única, historial de filtros, interacción y plantilla compartida: IMPLEMENTADOS.
- 120tests/sintaxis45/buildPages: COMPLETADOS.
- CI/PR42/staging9140ca6f/QA390-1440/publicación oficialc658e4da/evidencia: COMPLETADOS. Rollback1eb932f3 conservado; revisión del usuario pendiente.
- Auth/Admin/pagos previos fuera de alcance; previewvideo intacta. Sin porcentajes globales inventados.

# Resultado promoción estática — 2026-10-08

- PR39/push/CI y Pages oficial c22a5d0/900a4bd8: COMPLETADOS, sin merge.
- QA remota 390/1440/14 hashes/checkout aprobado/logs: COMPLETADA en cobertura documentada.
- Admin real identificado; sesión autorizada y recuperación funcional: PENDIENTES.
- Video exclusivo preview: BLOQUEADO por MP4 no adjunto. Oficial permanece estática y fijada.

# Promoción oficial y video aislado — 2026-10-08

- Fijar preview b049934 y diff contra oficial: COMPLETADO.
- Auditar Admin/roles/RLS con lecturas: COMPLETADO; sesión remota autorizada PENDIENTE.
- Backend estático inmutable y separación explícita de versiones: IMPLEMENTADOS.
- Checks, tests 113 y builds: COMPLETADOS.
- PR, Pages oficial y QA: EN CURSO.
- Video sólo preview en branch separada: BLOQUEADO por MP4 no adjunto; no impide publicación estática.

# Refinamiento PR38 — 2026-10-08

- Estado/dependencias/preview: VERIFICADOS; misma rama y sin merges.
- Acceso/isologo transparente/idioma: IMPLEMENTADOS; QA local y 111 tests/builds COMPLETADOS.
- Segundo teléfono +54 294 4502390: CONFIRMADO e incorporado; WhatsApp conserva el destino vigente por pedido de cambiar sólo el teléfono.
- Push/CI/preview 7eae7a7 y QA remota de esta tanda: COMPLETADOS (111/111, 390/1440, nueve páginas/404 y hashes de assets).
- Documentación/PR38 actualizadas; publicación sólo preview. Contactos confirmados; Auth/Admin real sigue pendiente.
- Google/Admin remoto autenticado: pendientes técnicos previos, sin avisos de implementación en acceso.

# Tarea académica — 2026-10-08 UTC

- Base PR37 y sitio vigente: VERIFICADOS. Dependencia PR34; selección carrito PR35 sin merge.
- Autores/contactos/acceso centrado/Google PKCE/Admin guard/checkout aislado: IMPLEMENTADOS.
- Google proveedor y cuenta admin: BLOQUEADOS por configuración/identidad inexistente; legacy conservado.
- Checks locales y CI: 108/108, sintaxis 43, audit y builds Workers/Pages: COMPLETADOS.
- Push/PR38 y preview aislada 87d64d4: COMPLETADOS. QA remota Chromium 390/1440 de menús/filtros/carrito y cuatro resultados académicos: COMPLETADA.
- Auth Google/Admin autenticado remoto: PENDIENTES; Admin local con fixtures y denegación anónima remota verificados.
- Documentación/evidencia/rollback de preview: COMPLETADOS; revisión del usuario en celular pendiente.
- Producción y DNS: fuera de publicación autorizada actual; conservar sitio.

# DREAMS — plan vigente

2026-10-07. Destino actualizado por el usuario: Cloudflare Workers. Sin porcentajes especulativos. Plan histórico preservado en `docs/history/PLAN_PR33.md`.

## Portada estática autorizada en Pages

- Identificar sitio vigente y rollback: COMPLETADO (Pages ae2f7932, Worker f73d5087).
- Aislar diseño PR36 sin funcionalidades PR35/36: IMPLEMENTADO sobre PR34/8d80fdd.
- Quitar motion/control de hero y conservar interacción compartida: IMPLEMENTADO; QA local seis tamaños y 390/1440 menús/filtros/carrito.
- Checks/build: 35 JS, 95/95, Pages/Workers correctos.
- PR37/push, preview y publicación Pages: COMPLETADOS. Fuente 5e3835e/CI SUCCESS, production 444489eb, backend intacto.
- QA remota tras deploy: COMPLETADA para hero/CTA/menús/filtros y carrito secuencial. Carrera previa de quote/vaciado confirmada y pendiente PR35; no publicada por esta tarea.

## Plan de hosting previo (histórico)

| Paso | Estado | Evidencia / dependencia |
|---|---|---|
| Estado real, Git, PR33, Supabase y Railway | COMPLETADO | Lecturas verificadas; PR32 excluida |
| Recuperar compatibilidad marca y quitar seed | COMPLETADO en base PR33 | Sin DDL ni datos nuevos |
| Aislar sesiones y corregir dependencias | COMPLETADO local | 87 tests; audit prod limpio |
| Adaptador Workers y assets | COMPLETADO local | Express + node:http probado en workerd |
| Tests/regresiones y build Workers | COMPLETADO local | 89/89, check 32, dry-run correcto |
| Smoke/responsive local con datos reales de solo lectura | COMPLETADO | 66 navegaciones; filtros, reintento, quote; sin mutaciones |
| Documentación, variables, cambio de tráfico y rollback | COMPLETADO | docs/cloudflare_migration.md; DNS sin modificar |
| Commit/push/PR | COMPLETADO | f0d52d6, PR34 abierta; CI implementación SUCCESS; no merge |
| Deployment preview Cloudflare | PUBLICADO Y VALIDADO EN LECTURAS/CARRITO | dreams-perfumes; versión 4631190f, health 200, catálogo 46, detalle y persistencia |
| URL solicitada dreams-perfumes.pages.dev | PUBLICADO Y VALIDADO | Pages deployment ae2f7932, Service binding al Worker; health/catalogo/quote/carrito, 390/1440 verificados |
| Smoke remoto Auth/Admin/checkout | PARCIAL | Admin anónimo 403 probado; Auth/Admin autenticados y pagos pendientes de cuentas/proveedor seguros |
| Recuperación operativa de hosting | BLOQUEADO | Runbook documentado; Railway offline/REMOVED sin rollback, Workers sin recuperación ejecutada y comprobada; restauración con costo requiere aprobación y SUCCESS + smoke |
| Promoción de dominio/tráfico | PENDIENTE APROBACIÓN | Sólo después de preview validada y plan presentado |

Supabase se conserva. No migraciones destructivas ni cambios RLS/permisos por hosting. Railway se conserva; actualmente offline y por tanto no constituye un rollback operativo hasta restaurarlo/verificarlo.

Fuera de alcance actual: UI premium, motion PR32, /experiencia, nuevas funcionalidades, MFA/recovery UI, performance avanzada. Mantenerlos como deuda, sin mezclarlos con hosting.
