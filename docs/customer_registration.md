# Registro customer normal — 2026-10-14

## Estado comprobado

Branch `codex/customer-registration`, dependiente de PR44/`b33a2ee`, PR48 en borrador. Cambios de código hasta `9a78cebf79ec7ec53ee41ceadf3aa3c32a02eb0e`. Sin merges ni incorporación de PR45/46/47 o video.

Cloudflare API confirma que la oficial continúa en Pages `ac755bbe-f339-422a-91ef-006426abf0bf`, fuente `c83b1481fca5d59e1254c6745d168a1c8cf3b800`. Backend inmutable `d5df723d-e1f1-4889-ae5b-e79ebfd131cd`, preview `official-direct`, id `6925a4bfc90145abb6b4b95550db435d`.

Bindings inspeccionados por nombre/tipo: SUPABASE_URL apunta a `nwsmbemwtexmrtpkgxrz`; SUPABASE_SECRET_KEY es secret_text servidor, sin leer su valor. PREVIEW_READ_ONLY=true, DEMO_AUTO_CONFIRM_EMAIL=false, CHECKOUT_SCHEMA_READY=false, GOOGLE_ACCESS_READY=false. Supabase confirma `dreams-project` ACTIVE_HEALTHY.

## Causa y corrección

El frontend envía POST /api/auth/register. El guard oficial no exceptúa esa ruta y emite 403 con “Esta vista de prueba permite consultas; las operaciones comerciales están protegidas” antes de signUp. Causa confirmada por código de origen y bindings remotos; no se reprodujo por HTTP remoto en esta sesión porque el executor todavía no está disponible.

La excepción nueva admite solamente POST exacto /api/auth/register. Mantiene PREVIEW_READ_ONLY, middleware de origen, rate limit de Auth 20/15min, protección Admin y bloqueos de pedidos/pagos, productos, stock, roles, opiniones y consultas. Otros bloqueos tienen mensaje propio por acción y código preview_write_blocked.

El registro normal usa un cliente aislado y Supabase signUp. Sólo envía nombre como metadata; rechaza role/is_admin/app_metadata/user_metadata del formulario. El perfil se crea customer con ignoreDuplicates para no sobrescribir perfiles existentes. Cookies HttpOnly/SameSite=Lax/Secure continúan; no hay credencial privilegiada pública. La rama demo histórica se conserva por compatibilidad y sigue APAGADA: no es la solución ni se activa su bypass.

Se retiró la instrucción previa de correo y el aviso demo. Sesión ausente no se presenta como ingreso exitoso; errores de red/perfil/proveedor se informan sin detalles internos. Doble submit programático queda bloqueado mientras hay una petición pendiente. Campos, coincidencia de contraseñas y validación se conservan.

Los helpers/handlers nuevos y funciones de registro modificadas tienen hasta 20 líneas. La base oficial contiene otras funciones largas heredadas; no se incorpora el refactor general ajeno de PR47 para aparentar cumplimiento global.

## Validación ejecutada y límites

CI [38598281826](https://github.com/facumartea/dreams/actions/runs/38598281826) SUCCESS en código 301fe075: frozen install, audit prod, sintaxis 51 archivos, 137/137 tests, Workers dry-run 2173.41 KiB/gzip504.57, build Pages correcto. Posterior 9a78cebf sólo refuerza la restauración de sesión tras nuevo login; su CI debe confirmarse antes del cierre.

Pruebas nuevas usan fixtures locales ejecutados en GitHub Actions: signup normal/cookies, perfil customer, metadata Admin ignorada/rechazada, Admin403, logout/login/sesión, caminos de escritura bloqueados incluso para Admin en suite académica, origen, datos inválidos, cuenta existente, perfil fallido, sesión ausente, rate limit, doble submit, fallo de red y reintento. Un primer CI falló por un test histórico que esperaba bloquear todo registro; se actualizó para conservar la prueba de rechazo de rol admin, sin borrar cobertura.

No se ejecutaron pruebas en el executor de este chat, git status local, QA visual móvil/escritorio, signup remoto, correos, cobros ni operaciones sobre datos comerciales. No hay una preview nueva ni publicación oficial. El intento de lectura HTTP oficial por la herramienta web no fue accesible; no se declara como prueba exitosa.

## Acceso seguro pendiente: Auth Management

Supabase está instalado/conectado y permite get_project/SQL. La enumeración real de herramientas NO incluye GET/PATCH Auth config ni un iniciador OAuth para ampliarlas. La descripción genérica del plugin no demuestra esas capacidades. Su permiso ChatGPT sigue el default “Allow low-risk actions”; cambiar ese ajuste no crea herramientas ni scopes OAuth.

No hay SUPABASE_ACCESS_TOKEN configurado en el entorno observado; el executor sigue starting/offline, sin secretos listados. SUPABASE_SECRET_KEY o SQL no autorizan la Management API. No se reutilizan tokens de otras conexiones, se leen secretos del Worker ni se intenta modificar Auth por SQL.

Mecanismo oficial:
1. Recuperar acceso de la cuenta propietaria en [sign-in](https://supabase.com/dashboard/sign-in) con su proveedor original (GitHub/ChatGPT/SSO) o [forgot-password](https://supabase.com/dashboard/forgot-password) si usa correo/contraseña. Si no controla ese acceso, recurrir al propietario de la organización o soporte Supabase.
2. Preferir una integración OAuth capaz de Auth read/write si se habilita. El conjunto de herramientas actual no puede iniciar ese flujo.
3. Alternativa autorizada: [token de Management](https://supabase.com/dashboard/account/tokens) scoped sólo al proyecto nwsmbemwtexmrtpkgxrz, expiración corta, Auth Config Read-write y Project Settings Read-write (ambos exigidos por el endpoint). Cargar únicamente como Secret SUPABASE_ACCESS_TOKEN en el gestor seguro del entorno DREAMS, guardar/publicar y reconectar un executor funcional. Nunca enviarlo por chat/argumentos/logs/repositorio. No requiere generar o rotar API keys de datos existentes.
4. Con acceso, GET /v1/projects/nwsmbemwtexmrtpkgxrz/config/auth, proyectar sólo mailer_autoconfirm/site_url/uri_allow_list/disable_signup y política de contraseña, sin imprimir SMTP/OAuth secrets. Revisar consumidores y orígenes ajenos, además de la información del propietario. Si hay apps ajenas, informar impacto antes de PATCH.
5. Registrar mailer_autoconfirm anterior. PATCH únicamente {mailer_autoconfirm:true}; esto desactiva Confirm email para nuevos registros, no equivale a verificar control de un buzón. GET posterior para confirmar, conservando política de contraseñas y demás configuración.

Fuentes: [Auth config GET](https://supabase.com/docs/reference/api/v1-get-auth-service-config), [PATCH](https://supabase.com/docs/reference/api/v1-update-auth-service-config), [permisos de tokens](https://supabase.com/docs/guides/platform/personal-access-tokens), [signUp](https://supabase.com/docs/reference/javascript/auth-signup).

Valor actual de mailer_autoconfirm y uso por aplicaciones ajenas: NO comprobados. No afirmar que Confirm email está desactivado ni que el proyecto sea exclusivo sólo por su nombre.

## Preview, publicación y rollback pendientes

Preparar preview aislada customer-registration desde este código, sin reemplazar official-direct ni academic-review. Heredar Secret Supabase servidor; firma académica propia del entorno si es necesaria; origen HTTPS exacto, PREVIEW_READ_ONLY=true, DEMO_AUTO_CONFIRM_EMAIL=false. Verificar comando con Wrangler instalado/ayuda antes de ejecutar.

Antes de registrar prueba, confirmar por acceso oficial que mailer_autoconfirm=true y no habrá mensajes a direcciones ajenas. Usar una identidad exclusiva de prueba admitida por el proyecto, contraseña fuerte sólo en memoria/gestor, no clientes ni correo de captura. Crear por signUp normal; comprobar perfil customer, sesión inmediata, reload, Admin403, logout/login, formulario/error/red, móvil/escritorio y catálogo/carrito. No crear pedidos comerciales ni alterar stock. Registrar recurso de prueba por UUID sin contraseña.

Sólo tras QA remota exitosa, crear backend inmutable compatible, fijarlo en pages/official-release.json, staging Pages y promover la corrección acotada en la oficial. El proxy fija APIs en un Worker: publicar sólo cuenta.js no corrige el endpoint.

Rollback de código: conservar Pages ac755bbe y backend d5df723d, ambos existentes por API. Verificar la ruta de rollback del deployment Pages inmediatamente antes de promover y hacer smoke de su URL inmutable; no se ejecutó rollback en esta tarea.

Rollback de configuración: después de capturar el valor real anterior, PATCH mailer_autoconfirm a ese valor y GET para confirmar. No revertir otras claves ni marcar cuentas masivamente; las cuentas creadas y sesiones previas requieren revisión independiente. Hasta poder leer el valor anterior, rollback Auth es un procedimiento preparado, no una recuperación probada.

No DNS, datos/esquema/RLS, credenciales existentes, sesiones reales, configuración Auth ni deployments cambiados.
