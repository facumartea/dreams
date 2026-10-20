# Filtros por colección y diagnóstico de acceso — 2026-10-20

## Alcance y dependencia

Rama `codex/collection-multiselect` desde `5e56469`, PR52 (SEO ya publicado como `e66a4ec`), dependiente de PR49/44/42/39/37/34. Sin merges ni video. No se integra el backend de PR48 ni se reimplementa su corrección: se conserva `052b224` en su rama `codex/customer-registration` para publicarla cuando pueda validarse Auth. No hay cambios en productos, credenciales, roles, datos comerciales o DNS.

## Implementación de filtros

Un solo panel con tokens compartidos. Mujer reutiliza marfil `#f6efe5`/bordó `#8c4450`; Unisex taupe `#302c27`/champagne `#b9a582`. Hombre y catálogo general conservan los colores del panel anterior. Botón, contador, encabezado, cierre, campos, opciones, selección y acciones heredan la misma paleta. Los checkboxes y un contorno reforzado identifican selección sin depender sólo del color. Se mantiene el foco y el modal nativo.

Marca y Género usan listas normalizadas e independientes. Dentro de cada grupo se combina con OR; entre grupos con AND. Todas/Todos y quitar la última opción equivalen a una lista vacía. La búsqueda de marcas sólo oculta opciones; no desmarca las seleccionadas. Tipo y Ordenar siguen siendo radios exclusivos. Cerrar descarta borrador; Limpiar restablece el borrador y Ver resultados confirma. El scroll se restaura sin esperar al evento nativo y un evento de cierre tardío no altera un panel reabierto.

El contador suma **grupos activos**, máximo seis: búsqueda, marcas, géneros, tipo, precio y orden distinto del predeterminado. Dos marcas y dos géneros suman dos, no cuatro. Un género único determina la colección/paleta y un único enlace activo; cero o varios determinan Perfumes/general.

Un valor conserva URLs históricas `brand=Dior&gender=mujer`. Varias opciones se serializan como una lista JSON en **un único parámetro** por grupo; valores únicos, orden estable, sin duplicados. Ejemplo: `brand=["Chanel","Dior"]&gender=["mujer","unisex"]` (codificado por URLSearchParams). Recarga e historial restauran el estado; al aplicar se elimina page. Los filtros combinados quedan noindex y canonical general/con género único, conservando el SEO anterior.

### Fuente de datos y API realmente servida

La oficial es una capa Pages sobre un Worker inmutable (`d5df723d`/`ec04a35`). Su API existente devuelve el catálogo completo sin paginación; se observaron 46 productos y 17 marcas. **No se filtran solamente tarjetas visibles.**

`pages/catalog.mjs` adapta únicamente GET/HEAD de `/api/products` con listas. Consulta el destino HTTPS inmutable aprobado, sin cookies ni Authorization del visitante, conserva búsqueda/tipo/precio/orden del backend y retira marca/género/limit/page antes de consultar. Filtra las listas con igualdad de texto sobre todo el resultado y aplica limit al final. Las listas no se interpolan en SQL/PostgREST. Enlaces antiguos simples mantienen su ruta anterior. POST/PUT/PATCH/DELETE, Admin, sesión y checkout siguen en el backend sin nuevas excepciones.

Límites: 50 elementos por lista, 120 caracteres por valor, géneros enumerados, JSON máximo 1 MiB y timeout de 8 segundos. Datos inválidos/fallidos no aparentan resultados exitosos; respuesta filtrada no-store y sin ETag de un cuerpo distinto. Si el backend devuelve 1000 o más filas, falla cerrado: el límite por defecto de Supabase podría truncarlo y necesitaría paginación explícita antes de ampliar el catálogo. Esto no afecta al catálogo actual de 46; no se declara soporte ilimitado. No se requiere Secret ni configuración nueva en Pages. El backend Node/Worker antiguo por sí solo continúa siendo de selección simple: la adaptación de listas pertenece a la API pública de Pages empaquetada en este release.

## Auth: causa comprobada y estado separado

Lecturas/peticiones remotas sin cuentas ni correos de terceros:

- Proyecto Supabase `nwsmbemwtexmrtpkgxrz`, nombre `dreams-project`, ACTIVE_HEALTHY, confirmado por integración.
- `/api/config` oficial: `preview_read_only=true`, `demo_auto_confirm_email=false`.
- POST oficial `/api/auth/register` con JSON vacío y Origin oficial: **403**, mensaje «Esta vista de prueba permite consultas; las operaciones comerciales están protegidas». No se envió una identidad ni contraseña: se demuestra que el guard bloquea antes de la validación, sin crear usuario ni correo.
- POST `/api/auth/login` con JSON vacío y Origin oficial: **400**, «Ingresá un correo válido y tu contraseña». Login sí alcanza su validación; esto **no verifica una sesión autenticada**.
- GET público oficial de Supabase `/auth/v1/settings`, usando una clave publishable válida obtenida por la integración, sin mostrarla: `disable_signup=false`, proveedor email activo y **mailer_autoconfirm=false**. Confirm email sigue habilitado.
- Cinco assets remotos (catálogo/modelo/navegación/CSS/cuenta.js) coinciden byte a byte con `e66a4ec`. `cuenta.js` y el guard del backend servido son los anteriores a PR48. La PR48 abierta no equivale a un deploy.

**Registro: FALLIDO remotamente (403), además BLOQUEADO para quitar confirmación por falta de acceso Auth Management. Login: formulario/validación comprobados; sesión real, logout/nuevo login y permisos customer/Admin: NO VERIFICADOS.** No se ocultó el mensaje ni se desactivó PREVIEW_READ_ONLY. No se creó cuenta de prueba porque Confirm email continúa activo y falta una identidad controlada/flujo seguro para esa validación.

La corrección específica ya existente de PR48 permite sólo POST exacto register y mantiene validación, rate limiting, perfil customer, origen y cookies. Debe reutilizarse y desplegarse en un backend aislado; publicar sólo HTML/JS de Pages no corrige ese 403. Su flujo normal usa signUp; el modo administrativo legacy permanece desactivado y no es solución para esta tarea.

### Acceso mínimo pendiente para Auth

Las herramientas instaladas permiten proyecto/SQL/lecturas, pero no exponen GET/PATCH de Auth config ni un iniciador OAuth para ampliarlo. SUPABASE_SECRET_KEY no sustituye un token de Management. El entorno revisado no tiene secretos ni identidades configuradas. No se inspeccionaron secretos del Worker ni se reutilizaron tokens de otra conexión.

Documentación oficial consultada el 2026-10-20: [passwords](https://supabase.com/docs/guides/auth/passwords), [tokens personales](https://supabase.com/docs/guides/platform/personal-access-tokens), [Auth config PATCH](https://supabase.com/docs/reference/api/v1-update-auth-service-config). Actualmente distingue tokens Legacy de acceso completo y **Scoped** limitados a proyecto y permisos. Su tabla/nota 3 exige **Auth Config Read-write y Project Settings Read-write** para Update auth service config. No se infieren estos permisos de SQL o de la descripción genérica del plugin.

Alternativa segura, si no aparece una conexión OAuth con esa capacidad: recuperar el ingreso del propietario [por GitHub en Supabase](https://supabase.com/dashboard/sign-in); crear un token Scoped únicamente para este proyecto en [Access tokens](https://supabase.com/dashboard/account/tokens), con esos dos permisos y duración breve; cargarlo exclusivamente como Secret `SUPABASE_ACCESS_TOKEN` en el gestor seguro del entorno, guardar/publicar y reconectar el executor. Nunca en chat, argumentos ni archivos versionados. No generar/rotar API keys existentes. Antes de PATCH, revisar site_url/uri_allow_list y consumidores reales; el nombre del proyecto no demuestra exclusividad. Si hay aplicaciones ajenas, informar impacto antes del cambio global.

Sólo después de esa revisión: guardar el valor anterior, PATCH únicamente mailer_autoconfirm=true, GET para confirmar y probar signup real mediante cuenta exclusiva autorizada, rol customer, sesión, Admin403, logout/login y errores. No marcar cuentas anteriores ni cambiar roles/contraseñas. Rollback Auth: restaurar únicamente el valor anterior (lectura pública actual false; revalidar vía Management antes de tocar), sin cambios masivos de usuarios.

## Validación y publicación

- Suite local: 153/153 tests; sintaxis de 54 archivos correcta. Regresiones de listas, OR/AND antes del límite, datos hostiles como texto, JSON inválido, errores/truncamiento/red, HEAD, escrituras protegidas, historial/modelo y respuestas atrasadas.
- Workers dry-run y build Pages correctos. No hay tipos/lint separados en scripts del proyecto; se ejecutó check y revisión AST de helpers modificados/nuevos, todos de hasta 20 líneas.
- Chromium local con Worker Pages compilado y lecturas del backend real, 390×844 y 1440×900: tres paletas, multiselección/4 resultados reales Chanel-Dior × mujer-unisex, búsqueda de marcas sin perder selección, borrador/cancelar, Todos/última, radios exclusivos, recarga/historial, vacíos, fallo simulado/reintento, foco/Escape/scroll y carrito visitante/persistencia/acceso legacy. Sin pageerrors ni scroll horizontal en esa cobertura. Primer recorrido detectó el scroll tardío; corregido y recorrido completo repetido con éxito. La inyección de error de catálogo es local y explícita.
- Capturas **locales**, no de un deployment nuevo: `docs/evidence/collection-filters/{mobile,desktop}-{mujer,hombre,unisex}.png`; log local en el mismo directorio. No Safari/iPhone físico ni autenticación remota verificados.
- La oficial conserva hero estático y health200. No se modifica la preview cinematográfica.

El primer intento de publicación quedó bloqueado: Cloudflare execute/search devolvían Internal error aun en lecturas; Wrangler4.147.0 no está autenticado. El usuario reconectó Cloudflare y la consulta posterior confirmó cuenta/proyecto dreams-perfumes, canónico56893d4c/e66a4ec SUCCESS y etiqueta de producción codex/cloudflare-hosting-migration. El acceso mediante integración está restaurado. La reconexión no modifica Auth ni concede una sesión Supabase. Preview nueva y promoción oficial están en preparación, todavía no declaradas publicadas. No se piden secretos por chat.

Con acceso: leer proyecto/canónico actual, publicar primero en branch Pages aislada de esta PR, repetir QA remoto, y sólo después promover el mismo artefacto a la etiqueta de producción vigente. No promover video/Auth ni otros branches. La configuración backend aprobada no cambia.

Rollback preparado: última oficial informada Pages `56893d4c-5a55-44ee-90b5-de0464434e89`/fuente `e66a4ec`, URL inmutable https://56893d4c.dreams-perfumes.pages.dev/ y health **200 comprobados en esta tarea**. Conservarla, reconfirmar id/canónico/estado por API antes de publicar y usar POST `/accounts/9f3d7af60fcb0c2b4fff8570843588f9/pages/projects/dreams-perfumes/deployments/56893d4c-5a55-44ee-90b5-de0464434e89/rollback` sólo si fuera necesario. No ejecutado, no deployments eliminados. Reversión de código adicional: revertir commits propios mediante nuevo commit, nunca force push.
