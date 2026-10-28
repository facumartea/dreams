# Diagnóstico de credencial del candidato — 2026-10-27

Se continúa desde fd53b15 sin reconectar Pages ni repetir el despliegue fallido.

## Identidad y binding confirmados

- Sitio canónico restaurado: Pagesa3184576; sus bindings efectivos sólo incluyen DREAMS=dreams-perfumes. La configuración de próximos deploys conserva DREAMS_OFFICIAL, pero el canónico restaurado no lo usa.
- Fallo histórico: Pages1e881ec8 → bindingDREAMS_OFFICIAL, servicio dreams-official-backend, entorno API vacío (Worker Production/default, sin entorno nombrado), versión2ef6be90-b8d8-4e03-8bc4-58b36718e6f1, deployment43a8bd54-658a-4240-9327-66e4885c6f78 al100%.
- Clave efectiva: env.SUPABASE_SECRET_KEY, bindingsecret_text en versión2ef6be90. Heredada de939c179c-f0d1-448c-9803-e757c47ea318 del MISMO Worker privado; no del backendlegacy. La versión939c179c se creó desde Dashboard con anotación Add secret:SUPABASE_SECRET_KEY. No se consultó su valor por API.
- SUPABASE_URL plain_text exacta https://nwsmbemwtexmrtpkgxrz.supabase.co; coincide con get_project_url del conector Supabase. La procedencia de una clave opaca sólo se acredita con una lectura aceptada por ese proyecto.

## Código y SDK comprobados

worker/official.mjs pasaba directamente env.SUPABASE_SECRET_KEY como segundo argumento de createClient, sin slice/substr/trim/JSON/atob, comillas añadidas ni fallback a process.env/uotra clave. Clientes independientes por operación, persistSession/autorefresh/detectSessionInUrl=false.

SDK fijado por lockfile2.112.4: RESTfetchWithAuth asigna apikey a la clave completa; sin JWT de usuario, utiliza también esa clave como Bearer por defecto. Con usuario, sólo el Bearer cambia a su JWT; apikey permanece. Nuevo helper official-client.mjs conserva exactamente esta construcción y permite observarla mediante transporte de prueba, sin emitir headers.

Los401 históricos del proyecto muestran UNAUTHORIZED_INVALID_API_KEY/bad_length enapikey yauthorization. No prueban por sí solos que el valor se truncó ni que venga de otro proyecto. Tampoco permiten culpar al SDK: se compara una lecturaHEAD mínima con apikey solamente y la misma lectura por el SDK real.

## Diagnóstico interno preparado

Sin endpointHTTP ni URL pública: handler scheduled opt-in con identificador y vencimiento máximo de una hora; sólo HEAD /rest/v1/products?select=id&limit=1, timeout8s. Usa binding real del privado y constructor compartido del candidato. Informa únicamente tipo/longitud/flags de formato, igualdad de transporte y statusHTTP; nunca valor, fragmentos, huellas, cuerpos de error ni headersdeauth.

Sonda adicionaltrim/unquote únicamente si el formato lo requiere, sin cambiar el Secret almacenado. Proyecto incorrecto bloquea toda solicitud. Cron temporal se restaura a su estado inicial (lista vacía) al obtener evidencia. Oficial/Secrets/Auth/Admin intactos.

Cuatro pruebas nuevas verifican privacidad, formato, transporte sin truncar, JWT limitado, consultas exclusivamente mínimas y negativa de proyecto. Resultado remoto pendiente; no se declara conexión resuelta.

## Resultado recuperado — 2026-10-28

La comprobación scheduled se ejecutó en el candidato62f6bd7c-52a0-4ebb-861d-cfc9116b6286/deployment82492c72-295f-412e-82c0-11285034bd67; código29ee9ea/CI206SUCCESS. Hereda exactamente el binding de2ef6be90 (el fallido), a su vez heredado de939c179c del mismo Worker. No se heredó una credencial del backendlegacy.

Evidencia runtime sanitizada en credential-diagnostic-result.json: clave presente, tipo modern_secret,42caracteresASCII, espacios INTERNOS; sin whitespace exterior, comillas envolventes, asignación, prefijoBearer, enmascarado o caracteresnoASCII. apikey_unchanged=true confirma que el SDK no la trunca ni sustituye. HEADmínimo directo conapikey solamente401/invalid_api_key=true; mismoHEAD porSDK401. Por tanto el rechazo no depende de añadirBearer. No se imprime clave/fragmentos/headers/huellas.

**Causa comprobada:** el valor almacenado y heredado contiene espacios internos incompatibles con una Secret API key íntegra y Supabase lo rechaza directamente. No se puede reconstruir la clave correcta quitando caracteres ni afirmar dónde se introdujeron los espacios. El bad_length del proveedor también está acreditado en logs históricos; truncamiento al copiar es una posibilidad, no un hecho demostrado.

SUPABASE_URL coincide con el proyecto esperado por configuración, conector y destino real de las consultas. La pertenencia de esta clave opaca al proyecto permanece NO VERIFICADA porque ambaslecturas401; no contiene refJWT que permita ni siquiera una comprobación de claims. La solución requiere cargar el valor completo correcto desde el proyecto esperado; no modificarAuth/RLS ni cambiarSDK a ciegas.

La comprobación tenía vencimiento automático. Tras interrupción del chat se recuperaron sus logs; no se repitió deployment/sonda. El28-10 se retiró elCron temporal: API confirmó schedules=[]. No hubo nuevas lecturas después delvencimiento. Oficial sigue canónicaa3184576 conDREAMSlegacy únicamente; candidato62f privado, workers.dev/previews=false. No se publicóPages.

## Corrección segura pendiente del usuario

- Servicio: Worker dreams-official-backend, cuentaCloudflare9f3d7af60fcb0c2b4fff8570843588f9.
- Entorno: Production/default delWorker; no Pages ni Preview.
- Secret: SUPABASE_SECRET_KEY, tiposecret_text/Secret.
- Valor requerido: Secret API key completa de servidor del proyectoSupabase nwsmbemwtexmrtpkgxrz; no publishable/anon, Management token ni contraseñaAdmin.
- Desde celular: Supabase→proyecto correcto→Settings→API Keys→Secret keys→Copiar. Si no es recuperable, crear una adicional conservando todas las claves existentes. Cloudflare→Workers&Pages→dreams-official-backend→Settings→VariablesandSecrets→Production→editarSUPABASE_SECRET_KEY comoSecret→pegar sólo elvalor copiado→Save/Deploy. No comillas, asignación, espacios añadidos, capturas ni chat. No eliminar/revocar claves.
- Después: lectura mínima desde la nueva versión privada, confirmar proyecto/clave con200 y clienteSDK; despuésQA autenticadaAdmin/customer/cartA-B/reviews/compatibilidad. Publicación oficial sólo con esas pruebas,rollbacka3184576 conservado.

## Protección adicional de publicación

Se completa el guard pendiente official-release-gate.mjs: cambiar deployment_ready atrue ya no basta. Exige lectura200 de la versión/proyecto exactos de menos deuna hora y evidenciaQA de registro/sesiones/cartA-B/reviews/Admin/compatibilidad para esa misma versión. Tresregresiones delguard y dosadicionales de formato/claims ya pasaron; resultado final de suite enCI se informa enGitHub. No se repiten QA visual/performance/accesibilidad noafectadas.
