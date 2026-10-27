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
