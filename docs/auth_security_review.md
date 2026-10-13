# Contraseñas y sesiones — revisión académica

13 de octubre de 2026. Proyecto existente `nwsmbemwtexmrtpkgxrz`. Sin cambios de cuentas, contraseñas, roles, permisos, proveedor ni SMTP.

## Almacenamiento y verificación

DREAMS no implementa un hash propio: `cuenta.js` envía correo y contraseña a `/api/auth/login` o `/api/auth/register` por HTTPS. El servidor llama a `auth.signInWithPassword`/`auth.signUp` en un cliente SDK aislado sin persistencia. Supabase Auth almacena y verifica las contraseñas.

La [documentación oficial vigente de seguridad de contraseñas](https://supabase.com/docs/guides/auth/password-security#how-are-passwords-stored), consultada mediante la integración de documentación, declara **bcrypt**, hashes acompañados de **salt aleatorio**, y aclara que `encrypted_password` es un nombre histórico para un hash. Esto es evidencia del proveedor; no se leyó esa columna ni se inspeccionaron hashes para deducirlo. No se afirma un costo bcrypt concreto ni una auditoría interna del servicio.

Se consultó también el changelog vigente. La deprecación anunciada de suites TLS CBC afecta compatibilidad de clientes; Node 24/fetch moderno se conserva. No se cambió SDK ni proveedor por esa nota. Fortalecer contraseñas/MFA/contraseñas filtradas requiere revisión de configuración y autorización separada; no se debilitó la política para probar.

## Inventario de mecanismos

| Mecanismo | Implementación / estado |
|---|---|
| Login legacy | `public/js/cuenta.js` → servidor `/api/auth/login` → Supabase Auth; funcional con fixtures, QA autenticada real pendiente |
| Registro | `/api/auth/register` → `signUp`; usuario nuevo `customer`; errores públicos genéricos; auto-confirmación demo conservada pero false en preview |
| Logout | `/api/auth/logout`: revoca sesión local mediante cliente aislado y vence ambas cookies; tests de refresh/logout |
| Renovación | Cookies access/refresh, `getUser` y `refreshSession`; lectura del perfil después de validar sesión; sin usar `getSession` como autoridad |
| Admin | `/admin` y `/api/admin/*` requieren `profiles.role === admin`; CRUD usa cliente con JWT para conservar RLS; no depende del correo ni de user_metadata |
| Google | PKCE preparado con cookie HttpOnly temporal y destino allowlist; `GOOGLE_ACCESS_READY=false`; proveedor/cuentas/verificación pendientes, login legacy preservado |
| Recuperación/cambio password | No hay pantalla/endpoint público completo de restablecimiento en esta base; runbook histórico, control de correo/SMTP/callback pendiente; no se enviaron emails |
| Seed/provisioning legacy | `server/seed.js` contiene camino administrativo manual histórico; NO se ejecuta desde `start`, Workers ni despliegues. No usar sobre proyecto real para QA |

## Exposición y aislamiento

- Cookies `HttpOnly`, `SameSite=Lax`, `Secure` en producción; duración diferenciada access/refresh y `no-store` en API/páginas privadas. El frontend no persiste tokens Auth en localStorage/sessionStorage.
- Código cliente no almacena passwords; almacenamiento del navegador se reserva a selección del carrito, recientes, cupón y referencias académicas. Los campos financieros del flujo académico tampoco se leen/transmiten/persisten.
- Logs de API guardan método/ruta/tipo limitado; no cuerpos, headers, contraseñas, mensajes completos del SDK ni secrets. Workers redacta query strings en preview. No se prueban credenciales reales en logs.
- `SUPABASE_SECRET_KEY` existe sólo en servidor/runtime y como Secret Cloudflare; no se imprime, copia a docs ni al bundle público. Tener un binding no acredita por sí solo el valor/permiso de la clave.
- El escaneo de textos versionados no encontró literales de claves privilegiadas fuera de fixtures ni escrituras de passwords en almacenamiento cliente. Los valores sintéticos de tests no son cuentas ni credenciales reales. Esto no equivale a escanear cada commit histórico o sistemas ajenos.
- Mutaciones verifican origen exacto; rutas Admin no se sirven desde un HTML público. `PREVIEW_READ_ONLY=true` bloquea operaciones comerciales, incluso con Admin. No se cambia ese permiso para eludir QA.
- El perfil puede repararse como customer al restaurar una cuenta sin perfil: efecto existente documentado. No se iniciaron sesiones de cuentas desconocidas para provocar escrituras.

## Límites de evidencia

Pruebas locales HTTP/workerd con fixtures acreditan contratos y aislamiento de clientes de autenticación. Admin anónimo remoto debe devolver 403. **No acreditan login/logout ni roles en una sesión real remota**: falta acceso legítimo vía canal seguro. No se solicitaron contraseñas por chat ni se creó/promovió otra cuenta para saltar el bloqueo. La exposición histórica de una clave en una captura del chat no fue una exposición encontrada en código; su evaluación/rotación depende de identificar consumidores y queda fuera de esta tarea.
