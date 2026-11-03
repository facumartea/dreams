# Diagnóstico del Secret del backend candidato

Resultado recuperado el 28 de octubre de 2026. Se continúa desde `fd53b15` y `29ee9ea`; no se repitió la publicación fallida.

## Identidad y recorrido efectivos

| Recurso | Versión / deployment | Función |
|---|---|---|
| Worker `dreams-official-backend`, Production/default | `2ef6be90-b8d8-4e03-8bc4-58b36718e6f1` / `43a8bd54-658a-4240-9327-66e4885c6f78` | Backend que recibió las solicitudes fallidas |
| Pages producción fallida | `1e881ec8-7c32-4a2e-9857-ef63bf091c4f` | Usaba `DREAMS_OFFICIAL` para llegar al Worker privado |
| Worker candidato con diagnóstico interno | `62f6bd7c-52a0-4ebb-861d-cfc9116b6286` / `82492c72-295f-412e-82c0-11285034bd67` | Ejecutó la consulta mínima sin pasar por Pages |
| Pages oficial restaurada | `a3184576-4390-4a71-9205-d9269bd7dfe7` | Conserva sólo `DREAMS` hacia el backend legacy como binding efectivo |

El binding de la credencial es `SUPABASE_SECRET_KEY`, tipo `secret_text`, del Worker privado en Production/default (sin entorno nombrado). La versión fallida lo heredó de `939c179c-f0d1-448c-9803-e757c47ea318` del MISMO Worker. El diagnóstico heredó el binding de la versión fallida. No se usó una credencial del backend legacy ni una clave del entorno de ejecución local.

`SUPABASE_URL` es `https://nwsmbemwtexmrtpkgxrz.supabase.co`. Coincide con el proyecto devuelto por el conector Supabase y con el destino real de las consultas. Una clave opaca no codifica el identificador del proyecto: su pertenencia sigue sin acreditarse hasta obtener una lectura aceptada por ese destino.

## Causa comprobada

El valor efectivo almacenado contiene espacios internos. No tiene whitespace exterior, comillas envolventes, una asignación de variable, prefijo Bearer añadido, enmascarado ni caracteres fuera de ASCII imprimible. Los logs históricos del proveedor registran `401 UNAUTHORIZED_INVALID_API_KEY`, con `bad_length` para apikey y authorization.

El candidato realizó exclusivamente `HEAD /rest/v1/products?select=id&limit=1`, con timeout de ocho segundos:

| Prueba desde el candidato | Resultado |
|---|---|
| Petición directa con apikey solamente | 401; proveedor identifica API key inválida |
| Misma lectura por el SDK real | 401 |
| Comparación interna entre el binding y apikey emitido por SDK | Coinciden íntegramente |

El SDK no trunca ni sustituye el valor. El rechazo no depende únicamente de enviar también Bearer. El valor almacenado está malformado y es rechazado directamente por el proveedor. No se puede inferir dónde se introdujeron los espacios, reconstruir la clave quitando caracteres, ni afirmar que ocurrió truncamiento al copiar. La prueba no demuestra que la clave pertenezca a otro proyecto; la pertenencia queda sin verificar.

Evidencia sin credenciales: `credential-diagnostic-result.json`. No se imprimieron valores, fragmentos, hashes, cuerpos de error ni headers de autenticación.

## Código y límites de la comprobación

El código pasa `env.SUPABASE_SECRET_KEY` directamente como segundo argumento de `createClient`, sin slice, trim, JSON, decodificación ni fallback a otra variable. El helper compartido `worker/official-client.mjs` conserva esa construcción para la aplicación y para la sonda. Los clientes son independientes por operación; persistSession, autoRefreshToken y detectSessionInUrl están desactivados.

El SDK resuelto por el lockfile es 2.112.4. Para REST asigna apikey a la clave completa y, sin sesión, también la usa como Bearer. Cuando existe un JWT de usuario, sólo cambia Bearer; apikey permanece. Los tests verifican este comportamiento sin usar credenciales reales.

La sonda se ejecutó por un handler scheduled opt-in en el Worker privado, con vencimiento automático de una hora como máximo y sin endpoint HTTP. Durante la interrupción del chat venció y dejó de consultar. Al recuperar los resultados se retiró el cron temporal; la API confirmó `schedules=[]`. No se repitió el deployment ni se rearmó la sonda. Workers.dev y previews permanecen deshabilitados.

## Corrección requerida por canal seguro

- Servicio: Worker `dreams-official-backend` en Cloudflare.
- Entorno: **Production/default del Worker**, no Pages ni Preview.
- Nombre del Secret: `SUPABASE_SECRET_KEY`; tipo **Secret / secret_text**.
- Tipo de clave: **Secret API key de servidor**, completa, del proyecto Supabase `nwsmbemwtexmrtpkgxrz`. No publishable, anon, Management token ni contraseña del administrador.

Desde el celular:

1. Abrir el proyecto correcto en Supabase → Settings → API Keys → Secret keys y usar **Copiar** sobre una clave de servidor. Si no puede recuperarse, crear una adicional conservando todas las existentes.
2. Abrir Cloudflare → Workers & Pages → `dreams-official-backend` → Settings → Variables and Secrets → Production.
3. Editar `SUPABASE_SECRET_KEY` como Secret. Pegar únicamente el valor completo copiado, sin comillas, asignaciones ni espacios añadidos. Guardar y desplegar sólo ese Worker privado.
4. Avisar que quedó cargada, sin enviar el valor, fragmentos ni capturas al chat. No eliminar ni revocar claves existentes.

Después de la carga se debe comprobar una lectura mínima desde la nueva versión privada. Sólo si funciona corresponde completar QA autenticada de cliente y administrador, carrito A/B, opiniones y compatibilidad académica. No se modifican Auth, RLS ni credenciales del administrador. El rollback oficial `a3184576` permanece disponible.

## Verificación y protección de publicación

Código de diagnóstico `29ee9ea`: 350 tests locales y CI #206 aprobado. Nueve tests focalizados posteriores del diagnóstico y guard de publicación pasaron. La suite final se verifica en CI del checkpoint actual; no se repiten manualmente pruebas ya acreditadas sin un cambio que lo justifique.

El guard `scripts/official-release-gate.mjs` impide publicar cambiando solamente deployment_ready. Exige lectura 200 del proyecto y versión exactos de menos de una hora, además de QA de registro, sesiones, carrito A/B, opiniones, persistencia Admin y compatibilidad académica en esa misma versión.

CI #207 detectó el aviso GHSA-6pq8-jhm2-2vcw en qs 6.16.0 antes de ejecutar tests. Se consolidó únicamente esa dependencia transitiva en qs 6.16.1, ya presente para body-parser. Instalación frozen y audit se verifican; no se desplegó el parche en ningún backend. Esto es independiente del rechazo de la credencial.

La conexión del candidato sigue SIN RESOLVER. No hay nuevo deploy oficial, cambios de datos, Auth, RLS, contraseñas, roles, DNS ni otros sitios. Diseño, responsive, accesibilidad completa y performance no se reevaluaron porque no se modificaron. El progreso se registra por estos estados, sin porcentajes inventados.
