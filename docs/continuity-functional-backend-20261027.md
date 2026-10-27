# Continuidad funcional DREAMS — 2026-10-27 — BLOQUEADO por entorno

SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.

## Avances comprobados que NO deben repetirse

- Usuario desactivó Confirm email, mantuvo registro habilitado y Site URL https://dreams-perfumes.pages.dev/.
- Agente verificó GET /auth/v1/settings con clave pública en memoria (sin imprimir valor): HTTP200, mailer_autoconfirm=true, disable_signup=false. **El bloqueo de Auth config anterior está resuelto.** No pedir otro token Management ni repetir ese ajuste.
- Oficial permanece Pages a3184576-4390-4a71-9205-d9269bd7dfe7, código7b302cf6b1896cfe500a0643290646b3086cb082, API/HTML legacy d5df723d/ec04a35. El403 de register sigue en ese middleware, distinto de Confirm email.
- PR56/rama codex/admin-cards-audit, base remoto anterior68702c832c7c2b19f9c43faf30b725e34f8a8d71, sin merge. PR54/55 preservadas y seleccionadas localmente para composición, sin merge de historial.
- Cloudflare cuenta9f3d7af60fcb0c2b4fff8570843588f9. Nuevo recurso **backend interno autorizado**, nombre dreams-official-backend, ID f4f560d2e4b947c18d8a06b9e4a24961. workers.dev=false y preview_urls=false; SIN DNS, dominio, preview pública ni binding Pages activo.
- Bootstrap privado503 (no aplicación final) versión e45dc51f-b6a9-45cd-9858-1e3f4ad85fe2, deployment dd991607-af4a-4b9d-a135-df7cf2aef15e.
- Usuario guardó SUPABASE_SECRET_KEY en Production del privado. **Verificado** por nombres/tipos solamente: versión939c179c-f0d1-448c-9803-e757c47ea318 (#2), secret_text SUPABASE_SECRET_KEY. Deployment4e35d8e5-9b7f-4c32-96f3-4d6eb02c8d0e activo100%. No leer/copiar el valor. Fuente esperada Supabase nwsmbemwtexmrtpkgxrz.
- Heredar entre Workers diferentes se intentó una vez por API oficial y falló400/10057 (version source no existe en destino). No repetir ni eludir: la carga segura del usuario ya lo resolvió. Para subir ahora nueva versión **del mismo privado**, heredar el Secret de939c179c por type:inherit/version_id en Workers API moderna. No reemplazarlo por bindings vacíos.
- No claves de capturas, ninguna contraseña/rol/correo Admin cambiado. Admin esperado a88d8d4e-ada3-4bfa-a6f5-db39d2dc9c19. Credenciales Admin para QA **todavía no disponibles**; usuario no confirmó ese punto de la pregunta agrupada.
- No nuevos usuarios/productos/opiniones ni pruebas autenticadas remotas en este tramo. No nuevo deployment oficial. Las288 pruebas/38checks remotos del release7b302cf siguen acreditados para el código anterior, no para la composición pendiente.

## Fallo exacto de ejecución

Entorno ccarenv_b64_Y2NhcmVudl9hM2ExMDlkMDhiYzA4MTkxOTRmYWM3MmJmOWE3MzMzZQ, spec141, desired/observed running pero connectivity offline. No secretos/identidades/runtime_variables en ese entorno. Primer error exec-server transport disconnected; failed to resume exec-server session. Un segundo intento devuelve No usable execution environment is available. Diagnósticos retenidos:not_found. Sin herramienta restart/reconnect/create para este runtime; no usar Railway para arreglarlo ni wait_for_environment salvo que el estado cambie a starting.

**No se puede terminar build, commit de la aplicación ni deployment seguro sin entorno operativo.** Este checkpoint usa la integración GitHub, que sí responde. No confundirlo con código funcional publicado.

## Trabajo local a preservar antes de sincronizar

Worktree /workspace/dreams-admin-review, rama codex/admin-cards-audit. Al recuperar, **guardar diff staged + unstaged y archivos sin seguimiento antes de actualizar HEAD**. Este checkpoint remoto sólo añade documentación; no sobrescribir esos archivos ni hacer reset/force push.

Composición ya aplicada limpiamente con git apply --3way del diff c428daff -> 0dbfbbaf311bf07a0f5afa82fa843837c934e2dd (PR55):
- server/app.js
- public/js/app.js, carrito.js, cuenta.js, presentation.js
- public/carrito.html, cuenta.html
- test/app.integration.test.js, academic.integration.test.js

Archivos copiados de esa misma fuentePR55:
- server/account-cart.js, reviews.js, auth-limits.js, customer-registration.js, preview-write-guard.js
- public/js/account-cart.js, reviews.js
- test/account-cart.test.js, customer-registration.integration.test.js, registration-browser.test.js, review-ownership.test.js
- supabase/migrations/20261013032746_account_carts.sql y20261021004927_customer_review_ownership.sql: **YA aplicadas antes**, sólo se seleccionaron sus archivos. No ejecutarlas de nuevo.
- Posteriormente se seleccionó el diff de test/design-system.test.js dePR55: opiniones en módulo reviews.js y aviso de confirmación condicionado, conservando prueba real de Scent Trail de7b302cf.

Conservar del trabajo oficial7b302cf/Admin56: imagen compartida, stockAdmin inválido no convertido a0, tarjetas/buscador/guardado, WhatsApp nativo y validación de teléfono, autofill, lockfile parchado y guard de compresión del proxy. No sustituir app.js entero con PR55: la composición3way ya preservó WhatsApp actual.

## Archivos locales nuevos/modificados específicos del backend

1. server/official-policy.js: origen fijo https://dreams-perfumes.pages.dev; allowlist exacta para lecturas públicas/Auth/cart/reviews/Admin. POSTregister/login/logout/Google/cartquote/cartaccount/reviews/inquiries/presentation y Adminproducts/coupons. PUT/DELETE sólo Adminproducts/coupons/reviews con ID positivo, DELETEopinión propia. No checkout comercial, webhooks, cambios de rol ni prefijos arbitrarios. official_enabled requiere options.official_api===true y app_base_url exacto.
2. preview_write_guard recibió tercer argumento official=false, con excepción de official_route sólo en ese modo. Mantiene preview_read_only=true, protecciones comerciales y comportamiento de previews por defecto. server/app.js pasa official_enabled(options).
3. /api/config añade admin_writes_enabled:official_enabled(options); Admin no debe mostrar aviso readonly cuando esa capacidad específica está activa, aunque pagos sigan cerrados. admin.js condición config.preview_read_only && !config.admin_writes_enabled.
4. worker/official.mjs + wrangler.official.jsonc: privado, sin ASSETS; proyecto/origen exactos, Supabase SDK por operación, sin persistSession/autorefresh, demo_autoconfirm=false, checkout_schema_ready=false, official_api=true, account_cart/customer_data=true, presentation=true. Cookies/roles por handlers existentes. Compilación separada build:official. Logs constantes sin cuerpos/credenciales. HMACs derivados en memoria por propósito, jamás expuestos.
5. Compatibilidad académica: server/presentation-checkout.js recibe issuer opcional; nuevo privado usa dreams-official-v1 en payload firmado y valida issuer. worker/official-legacy.mjs sólo para POSTpresentation/payment y result: lee copia limitada32768bytes, token máx24000; v2 SIN issuer se entrega al verificador inmutable d5df723d (redirecciones manuales), que aún valida firma/cookie/expiración. Nuevo issuer/malformados no van al legado. No hay autorización basada en la carga sin firma; sólo selección del verificador. Motivo: no invalidar confirmaciones/tickets vigentes al cambiar la clave del nuevo backend. No se generó/leyó Secret de firma anterior.
6. pages/official-backend.mjs: binding DREAMS_OFFICIAL sólo para /api*, /admin(.html), /js/admin-console-v3.js. Reescribe URL interna al origen oficial y conserva cuerpo/Cookie/Origin. Static fallback sigue d5df. Falla503 si falta binding, sin volver a API vieja. Usar también este fetch en filtered_catalog/enrich SEO para que todas las lecturas API vayan al backend nuevo.
7. pages/proxy.mjs importa official_options y añade assets cuenta.js/account-cart.js/reviews.js; alias nuevos heredan headers de app.js. **Revisar función create_proxy: la inserción puede superar20 líneas y necesita extracción antes de declarar cumplimiento.**
8. build-pages incluye esos3scripts e incorpora módulo oficial-backend inline, pasa official_service opcional.
9. HTML públicos con app.js recibieron account-cart.js antes; Inicio también reviews.js. No video.
10. release local apunta official_service=dreams-official-backend, official_worker_id=f4f560d2e4b947c18d8a06b9e4a24961, deployment_ready=false, previous_pages_deployment=a3184576. Todavía NO se publica ni actualiza config Pages remoto.
11. pages/wrangler.jsonc añade servicio DREAMS_OFFICIAL al existenteDREAMS (archivo local, remoto sin cambiar).
12. scripts/deploy-pages.mjs impide publicación CLI si deployment_ready no es true y sólo despliega al proyecto/branch técnico oficial conocidos. package deploy:pages apunta a ese guard. CI/build:official añade dry-run de wrangler.official.jsonc. No activar deployment_ready por apariencia.
13. test/official-release.test.mjs fue adaptado para probar legacy sin official_service en la prueba histórica y exigir deployment_ready=false mientras está pendiente.
14. Nuevos test/official-policy.test.js (24casos HTTP+1allowlist) y test/official-binding.test.mjs (4casos) cubren roles/metadata, persistencia fixture, origen, pagos cerrados, binding privado/legacycompat/fallo cerrado.

## Evidencia nueva ejecutada antes de perder el entorno

- Composición Auth/cart/review/registro/WhatsApp:43tests PASS en /tmp/dreams-functional-composition-tests.log.
- Política/binding/compatibilidad:29tests PASS en /tmp/dreams-official-backend-targeted.log. O01–O24 registraron objetivos, esperado/real, entorno fixtures, PASS en /tmp/dreams-official-policy-matrix.json.
- Suite completa de composición se intentó, NO se acreditó verde. Hubo cambios posteriores en design-system/release; repetir esa suite y conservar fallos reales.
- Último check/build privado/tests focalizados empezaron; resultados finales **no recuperables todavía**. No afirmar PASS. Archivos /tmp/dreams-official-backend-check.log, /tmp/dreams-official-private-build.log, /tmp/dreams-official-backend-final-targeted.log. Si el disco vuelve, leerlos; si no, repetir por evidencia faltante.
- Matriz Admin anterior201ejecuciones/local >=20porárea se conserva, no repetir partes idénticas sin motivo.
- No signup/login/Admin/cartA-B/reviews autenticados reales en este tramo: BLOQUEADOS por backend viejo aún servido y ahora runtime offline.

## Procedimiento exacto de continuación

1. Recuperar entorno operativo en la aplicación; no cargar de nuevo Secret ni Confirm email. No herramienta de agente para hacerlo. Si requiere nueva tarea, usar este documento y los SHA de GitHub, no depender de /tmp.
2. Recuperar worktree sin reset. Si se perdió, reconstruir composición desde68702c8 + refs PR55 anteriores y diseño descrito. No tocar otras branches/sitios ni mezclar video.
3. Completar integración y AST<=20, tests relevantes/fullsuite por composición, builds oficial/Pages, revisión de diff. Conservar bloqueos en matriz, no dar PASS por fixtures.
4. Commit/push misma rama/PR56 y CI exacto antes de subir el código privado. La oficial conserva rollbacka3184576. No merge.
5. Subir versión a Worker interno IDf4f560... con compat2026-10-27,nodejs_compat, main_module + módulos Text de Admin del dryrun. Workers API moderna POST /accounts/{account}/workers/workers/{id}/versions acepta JSONmodules content_base64; heredar SUPABASE_SECRET_KEY por type:inherit/version_id939c179c (MISMO Worker) y plain vars SUPABASE_URL/APP_BASE_URL/APP_ORIGINS esperados. Nunca bindings vacíos que pierdan Secret; no leer su valor.
6. Desplegar versión privada por POST /accounts/{account}/workers/scripts/dreams-official-backend/deployments, strategy percentage y versions [{version_id,percentage:100}]. Mantener workers.dev=false/previews_enabled=false. Actualizar anotación commit completo.
7. Preparar Service binding Pages producción DREAMS_OFFICIAL= dreams-official-backend, conservando el existente y demás configuración; verificar esquema oficial de API antes de PATCH. No URL pública adicional. Sólo después de todas las precondiciones configurar deployment_ready y publicar la Pages oficial. Backend nuevo deja cerradas rutas comerciales aunque mantiene Admin por handlers/RLS. Si falla backend/QA material, rollback de Pagesa3184576; datos aditivos no revertir/borrar.
8. Registrar por normal signUp dos identidades exclusivas controladas de QA, contraseñas fuertes en memoria/gestor seguro, sin correos ajenos. Verificar cookie/sesión/logout/login/refresh, UUID/customer/Admindenied; cartA-B y nueva sesión, merge una vez, privacidad; opiniones propias/ajenas víaAPI y moderación conservada.
9. Admin real: no se dispone aún de credenciales autorizadas accesibles al proceso. No suponer contraseña ni cambiarla. Pedir mecanismo seguro una sola vez. Posibilidad a verificar: GitHub Actions Secrets + job QA acotado/manual en PR56, para que la contraseña se use en runner y no se entregue al agente. NO implementado aún; no afirmar herramienta disponible hasta comprobar permisos/flujo. No endpoint anónimo especial con credencialesAdmin en el backend.
10. Pruebas Admin reales sólo con productoQA nuevo, cambios/imagen/stock destacado/reload/catálogo, conservando comerciales y sin borrar productos. Opiniones de QA se pueden eliminar por su dueño. Checkout académico/WhatsApp y matriz final, datos antes/después, cierre COMPLETO sólo si criterios realmente pasan.

## Secretos del entorno: corregir la guía anterior

Documentación oficial https://developers.openai.com/codex/cloud/environments consultada indica que en Codex Cloud los secretos sólo están disponibles en setup scripts y se retiran antes del agente. No prometer que una nueva ejecución los expondrá al agente ni usar runtime variables planas para eludirlo. El gestor de este runtime además reporta secrets[] vacío. Sin tool de secret input/setter/restart. No solicitar tokens/passwords en chat, shell registrado, config.toml o repositorio.

ESTADO GLOBAL:BLOQUEADO por entorno de ejecución offline; Auth config y Secret privado YA RESUELTOS. DEPLOY OFICIAL NUEVO:NO. Recurso interno privado preparado; ninguna nueva web/preview/DNS/hostingpago.
