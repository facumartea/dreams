# Revisión de registro y sesión — 2026-10-20

## Fuente y diagnóstico real

Oficial https://dreams-perfumes.pages.dev/cuenta.html: Pagesf44a6069/source461c17d y backendd5df723d/sourceec04a35 confirmados, base de esta tarea. PR48/052b224 sigue abierta/no publicada. La rama `codex/auth-session-review` parte de PR53/c428daf y reutiliza los archivos/handlers y tests de PR48 mediante selección explícita, sin merge ni copiar su configuración Pages antigua. No incluye video ni carrito por cuenta pendiente.

POST oficial register con JSON vacío y Origin oficial devuelve403 y el mensaje comercial genérico, antes de validar el cuerpo. No se envió identidad ni contraseña. Supabaseproyecto nwsmbemwtexmrtpkgxrz/dreams-project ACTIVE_HEALTHY verificado: GET oficial Auth settings con clave publishable (valor no mostrado) da disable_signup=false y mailer_autoconfirm=false. Confirm email continúa activo. No se crearon cuentas reales ni enviaron correos. Login llega a validación; no hay una cuenta con credenciales autorizadas/controladas disponible en el proceso.

## Cambios preparados

- Se reutiliza preview_write_guard de PR48: excepción sólo POST exacto register, no prefijos/otros métodos; origen, validaciones y límites permanecen. Los bloqueos comerciales/Admin tienen mensajes por acción.
- Signup normal del proveedor, name/email/password tipados y acotados, rol customer constante, metadata/rol del cliente rechazados, upsert ignoreDuplicates no reemplaza perfiles existentes. Errores del proveedor no muestran si un correo existe ni detalles privados. Contraseña débil se asocia al campo; caída transitoria devuelve503. Sin sesión no se inventa éxito ni cuenta creada; el mensaje de confirmación depende de la configuración consultada.
- Se conserva el legacy demo interno para compatibilidad de otros entrypoints, pero el nuevo servicio Auth fija demo_auto_confirm_email=false y no puede usarlo. No se cambian credenciales, roles ni usuarios existentes.
- auth-limits separa lecturas120/min de mutaciones20/15min. Antes los GET me/config al navegar consumían los intentos de login/registro. Ambos presupuestos siguen limitados; las escrituras conservan su límite anterior y su verificación de origen. Tests prueban navegación sin agotar registro y rechazo429 en ambos límites.
- Fallos transitorios del SDK o perfil al restaurar sesión producen503 en me y conservan cookies; antes podían aparentar logout o destruir el refresh. Expiración real del refresh sigue borrando ambas cookies y cerrando Admin. Mensajes/logs no incorporan datos privados del proveedor.
- Formularios: autofill oscuro sin desactivarlo; labels/autocomplete/password managers conservados; errores junto al campo y aria-describedby/invalid, resumen anunciado; coincidencia y política básica; ambos submit bloquean doble envío, recuperan controles al fallar y bloquean pestañas mientras procesan. Pestañas con roving tabindex/teclado y limpieza de errores. Estado remoto viejo no pisa una consulta reciente. pageshow de BFCache revalida sin mostrar el estado anterior; logout usa replace.
- El aviso «Si recibís un correo…» **no se elimina mientras Auth lo requiere o no puede consultarse**. GET auth/config sólo devuelve el booleano de configuración del proveedor, nunca una key. No se oculta el403 para aparentar acceso.

## Aislamiento de publicación

`worker/auth-review.mjs` sirve sólo POST register/login/logout y GET me/config/health. Todo lo demás devuelve403. Usa proyecto esperado fijo, Secret de Supabase heredado por referencia segura de la base de previews, HTTPS/orígenes exactos, logs constantes sin cuerpo/tokens/contraseñas, caché no-store y cliente Auth nuevo por operación. No necesita assets ni firma de checkout ni puede ejecutar comercio.

Pages permite un destino Auth HTTPS inmutable separado únicamente para esas cinco rutas `/api/auth/...`. Admin, catálogo, carrito, checkout, imágenes y demás APIs conservan el backend d5df723d/ec04a35. Cookie, Origin y cuerpo se preservan; redirecciones no se siguen y destinos no aprobados fallan cerrados. cuenta.js se incluye explícitamente en el overlay; publicar sólo el formulario sin cambiar el endpoint no corrige la causa. No se amplían permisos ni orígenes de Supabase por este mecanismo.

La oficial no se publica hasta verificar registro real sin correo, sesión/customer, logout/login y aislamiento en preview. Cloudflare disponible; Auth Management ausente: no hay herramienta GET/PATCH de Auth config ni SUPABASE_ACCESS_TOKEN listo en el entorno. La desconexión temporal del executor se recuperó sin perder cambios.

## Intervención externa necesaria

Habilitar acceso seguro a Auth Management. La documentación oficial consultada [personal access tokens](https://supabase.com/docs/guides/platform/personal-access-tokens) distingue tokens Legacy y Scoped; PATCH Auth config exige **Auth Config Read-write y Project Settings Read-write**. La instrucción previa de cargar SUPABASE_ACCESS_TOKEN en el gestor del entorno quedó bloqueada: el usuario no puede abrir ese gestor y las herramientas actuales no ofrecen entrada oculta ni setter de secretos. No reiterar esa solicitud ni recibir el token por chat, comandos o archivos. La documentación de permisos no implica que exista un canal de carga disponible. Página oficial: https://supabase.com/dashboard/account/tokens (acceso propietario por GitHub). No se pide generar/rotar API keys ni leer secretos del Worker.

Con acceso: consultar config Auth proyectando sólo site_url/uri_allow_list/mailer_autoconfirm/política de contraseña, revisar otros consumidores del proyecto (su nombre no prueba exclusividad), guardar valor anterior y, si no hay apps ajenas afectadas, PATCH sólo mailer_autoconfirm=true y reconsultar. No confirmar cuentas previas masivamente. Luego usar identidad exclusiva controlada/autorizada y signup normal; nunca creación administrativa ni correo de la captura.

## Evidencia local ejecutada

Suite completa final177tests PASS;47 pruebas focalizadas finales PASS después de robustecer errores transitorios. Build Workers normal, build Auth aislado y Pages ejecutados; cifras finales/CI y deployment se agregan en el siguiente checkpoint. Helpers nuevos/modificados de UI/handlers/proxy/entrypoint Auth <=20líneas; create_app/fixtures legacy contienen contenedores largos preexistentes, no se incorpora un refactor global ajeno.

Chromium real con backend Express del proyecto y proveedor **simulado local**,390×844/1440×900: errores de formulario/mismatch, submit, aborto de red/reintento, doble submit, customer, cookies HttpOnly/Lax, sesión/reload/navegación, renovación al retirar cookie access, logout/back/reload, login incorrecto/correcto, cuenta existente segura y Admin403. Autofill probado con pseudoestado forzado de Chromium (color marfil y sombra interior de superficie); no gestor de contraseñas/Safari/dispositivo físico reales. Cookies Secure se verifican en integración producción con fixtures; no se afirman observadas en una cuenta remota. Capturas locales y log sin valores sensibles en docs/evidence/auth-session.

### Matriz de pruebas: local frente a la oficial vigente

| Prueba | Local (fixtures/navegador según corresponde) | Oficial remota |
|---|---|---|
| Register atraviesa guard comercial | PASS | FAIL:403 |
| Registro sin confirmación | PASS con fixture configurado | FAIL:Confirm email activo |
| Alta válida desde UI y sesión posterior | PASS | BLOQUEADA |
| Usuario/perfil customer | PASS | BLOQUEADA |
| Nombre vacío/espacios, correo inválido y campos incompletos | PASS | BLOQUEADA para UI nueva |
| Contraseña corta/larga/política del proveedor | PASS | BLOQUEADA |
| Repetir contraseña diferente | PASS | BLOQUEADA para UI nueva |
| Correo existente, error sin enumeración explícita | PASS | BLOQUEADA |
| Doble clic/submit programático | PASS | BLOQUEADA |
| Fallo de red/reintento | PASS | BLOQUEADA |
| Login válido/incorrecto/vacío | PASS | BLOQUEADA (sólo validación API vacía comprobada) |
| Sesión al recargar/navegar | PASS | BLOQUEADA |
| Renovación | PASS | BLOQUEADA |
| Refresh expirado y cookies eliminadas | PASS | BLOQUEADA |
| Caída SDK no simula logout ni destruye cookies | PASS | BLOQUEADA |
| Logout y atrás/recarga sin recuperar acceso | PASS | BLOQUEADA |
| Customer no accede Admin/API Admin | PASS | BLOQUEADA |
| Anónimo no accede Admin/API Admin | PASS | PASS:403 (base vigente) |
| Cookies HttpOnly/Secure/SameSite y no-store | PASS integración producción | BLOQUEADA (sin sesión legítima) |
| Cambio de pestañas/foco/labels/errores anunciados | PASS | BLOQUEADA para UI nueva |
| Autofill sin desactivarlo | PASS CSS/pseudoestado Chromium | BLOQUEADA para UI nueva |
| Sin passwords/tokens/cookies en evidencia/logs propios | PASS revisión/capturas sin secretos | BLOQUEADA para sesión real; no se generó ninguna |

Pruebas locales no equivalen a autenticación real remota. No se afirma revocación instantánea de JWT ya emitidos ni verificación de toda la infraestructura de logs. El alcance es sesión de navegador/refresh y logout, sin cambiar política de Supabase.

## Rollback y pendientes

Conservar Pagesf44a6069/461c17d y backendd5df723d. Antes de promover, reconfirmar SUCCESS/raíz/health y conservar POST Pages deployments/f44a6069-a891-4d1b-a035-0e0dc5a00a40/rollback. El destino Auth es un campo opcional: revertir release/proxy por nuevo commit restablece todas las rutas al backend anterior. No borrar previews/deployments ni usar force push. No rollback ejecutado.

Auth config: registrar snapshot antes de cambiar; rollback sólo mailer_autoconfirm al valor anterior, sin alterar usuarios existentes o sesiones. No se cambiaron Auth global, permisos, datos comerciales, roles, stock, credenciales ni DNS. Video sólo preview anterior, fuera de esta rama. Próximo: publicar/verificar candidato aislado; resolver acceso Auth Management y únicamente después completar signup real y publicación oficial autorizada.


## Candidato Auth publicado (no oficial)

Backend aislado de37b97d-005c-4db3-8337-c39ca8b61182, preview5abc3210b94b4f26bf2ecbfe8e356db8 auth-session-review, fuente db726a98115a3b9d2773d03633e6eecd1462701b. CI39521339546 SUCCESS177tests/check61 y builds normal/Auth/Pages. BundleAuth2187535bytes SHA256c60414516a6c4cd82cf06794d9609eef398344295706c1c2b082b15846c8724a, sin valores Secret. La base de previews aporta SUPABASE_SECRET_KEY por herencia implícita: un primer intento con type:inherit explícito devolvió404 porque buscaba una versión de producción; se corrigió omitiendo ese override, sin leer/cambiar el secreto ni configuración base.

El release de esta rama añade sólo auth_backend_url/source para un candidato Pages. backend_url principal d5df723d/ec04a35 no cambia. Publicación oficial sigue bloqueada hasta QA autenticada y Auth Management; conservar el nuevo campo en esta rama no significa que la oficial haya cambiado.


## Resultado de Pages y QA remota anónima — 2026-10-21

Preview: https://auth-session-review.dreams-perfumes.pages.dev/cuenta.html. Pages deployment be352ec6-fce8-41a1-b0bc-068675c89251 SUCCESS/preview, fuente de236c6b10580e552311e47119096ab86f776032. Artefacto560732bytes, SHA256a59f331a10146226e843b9e61739633fb22873d484e0eca62fde3f55dc49017a. CI39521612525 SUCCESS al mismo commit:177 tests, check61, auditoría y builds Workers normal/Auth/Pages.

| Verificación del candidato remoto | Resultado |
|---|---|
| GET cuenta/config/me | PASS:200, confirmación requerida true, usuario null |
| POST register vacío con Origin del alias | PASS:400 validación, sin403 comercial |
| POST register vacío con origen ajeno | PASS:403 |
| Admin y API Admin anónimos | PASS:403 |
| UI390×844 y1440×900: vacíos/mismatch, pestañas/teclado, foco, autofill pseudoestado | PASS |
| Scroll horizontal y errores JavaScript en ese recorrido | PASS: ausentes |
| Registro válido sin confirmación y perfil customer reales | BLOQUEADA: Auth config y cuenta controlada pendientes |
| Login, sesión, renovación, expiración y logout reales | BLOQUEADA: sin cuenta legítima de prueba |
| Cookies de sesión remota | BLOQUEADA: no se emitió sesión real |
| Safari/iPhone físico/gestor real de contraseñas | BLOQUEADA: sólo Chromium con viewports y pseudoestado |

Capturas remote-mobile-register/remote-desktop-register y autofill, más remote-anonymous-browser.txt en docs/evidence/auth-session. QA de formularios bloqueó preventivamente POST de signup; se observaron cero solicitudes de alta durante las validaciones inválidas. La comprobación HTTP register vacío se ejecutó por separado, sin identidad ni contraseña. No se afirma que esto pruebe una cuenta real.

## Acceso seguro: limitación concreta

No existe herramienta disponible de entrada enmascarada, carga de secretos al entorno, reconexión con ampliación de permisos Auth ni ejecución de OAuth Management. El estado del entorno no contiene SUPABASE_ACCESS_TOKEN. Un terminal de herramientas o request_user_input de texto no son una entrada secreta para el usuario. No crear un formulario receptor ni usar otra aplicación como depósito de credenciales. No hace falta repetir la clave en ningún canal.

Para continuar hace falta un canal seguro que efectivamente entregue acceso a Auth Management (o recuperar el acceso propietario al panel de Supabase mediante GitHub). Recuperación oficial GitHub: https://github.com/password_reset y guía2FA https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/recovering-your-account-if-you-lose-your-2fa-credentials. Supabase: https://supabase.com/dashboard/sign-in. No se puede eludir esa autenticación ni completar el ajuste sólo con autorización escrita.

Oficial sigue f44a6069/461c17d, no publicada esta corrección. No cambio de Auth global, datos, usuarios, roles, credenciales, DNS ni video. Rollback retenido, no ejecutado. Próxima acción dependiente: habilitar acceso Management real, revisar consumidores, aplicar el ajuste autorizado y validar el ciclo auténtico antes de publicar oficial.
