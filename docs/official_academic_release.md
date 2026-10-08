# Publicación oficial estática y aislamiento del video

Fuente fijada por Cloudflare API: PR38 `b04993467b820ec3b81af0991fa9cda5ef276dda`, preview `academic-review`, deployment `4ad20144-f896-4ba9-9735-f43c9ffd1603`. CI de esa fuente SUCCESS, 111 tests. Rama de publicación `codex/promote-academic-static-pages`, dependiente de PR38 → PR37 → PR34, sin merges.

## Diff y destinos

Oficial previa: Pages `444489eb-dcfe-4650-b005-acc3469ab02e`, capa visual `5e3835e`, Service binding a Worker `dreams-perfumes` versión `f73d5087`. El diff funcional contra ese backend incluye contactos/autores, acceso limpio/PKCE preparado, traducciones, corrección de respuestas tardías del carrito, Admin móvil y presentación académica firmada. No incluye video. Es la promoción solicitada, no una integración indiscriminada de PRs.

El Service binding previo sigue al Worker activo y no garantiza aislamiento de futuras versiones. El build Pages conserva el overlay estático y fija todas las demás rutas al deployment inmutable `40e7b0a3-022f-491b-9d74-f3fc63f9746f`, creado desde exactamente `b049934`. `pages/official-release.json` registra la URL y origen de código; no se decide por hostname del navegador. El proxy sólo acepta el patrón inmutable del Worker/cuenta esperados, conserva ruta/query/Origin/cuerpo/cookies y nunca sigue redirects con credenciales. Ante fallo responde 503 sin sustituirlo por otro backend. Se conserva el Service binding para que deployments históricos sigan siendo recuperables; el nuevo proxy no lo usa cuando hay destino fijado.

Backend independiente `official-static`: `APP_BASE_URL=https://dreams-perfumes.pages.dev`; `APP_ORIGINS` exactos Pages y su alias Worker. Supabase `nwsmbemwtexmrtpkgxrz`, `SUPABASE_SECRET_KEY` heredado como Secret servidor. Firma interna independiente `PRESENTATION_SIGNING_KEY`, creada en memoria y enviada por stdin a `wrangler preview secret put`, sin rotar claves existentes ni persistir valor. `PREVIEW_READ_ONLY=true`, `PRESENTATION_CHECKOUT_ENABLED=true`, `CHECKOUT_SCHEMA_READY=false`, auto-confirm false, Google-ready false. No cron/colas, seeds, resets, migraciones ni conexiones de pago nuevas.

Se conserva el checkout académico de la preview; no guarda orders ni altera stock/cupones. Admin y otras escrituras comerciales permanecen protegidas como en preview. La publicación no habilita una tienda de pagos reales.

Pages es Direct Upload sin repositorio conectado ni publicación automática: proyecto `dreams-perfumes`, cuenta `9f3d7af60fcb0c2b4fff8570843588f9`, rama de alias raíz `codex/cloudflare-hosting-migration`. El campo branch del upload selecciona el destino, no mezcla ramas Git. Publicación por API autorizada porque OAuth Wrangler no tiene Pages edit; la conexión Cloudflare sí. `pnpm build:pages` produce `_worker.js`/`_routes.json`, manifest vacío, SHA exacto y árbol limpio. DNS sin cambios.

## Admin y recuperación

SELECT Auth/profiles confirma `admin@dreamsperfumes.com`, UUID `a88d8d4e-ada3-4bfa-a6f5-db39d2dc9c19`, correo confirmado y perfil `admin`. `admindreams@gmail.com` no existe. Ingresar por `https://dreams-perfumes.pages.dev/cuenta.html`; login devuelve `/admin` únicamente si el rol leído desde profiles es admin. API/página Admin requieren sesión válida y ese rol; metadata editable no decide permisos. Mutaciones aplican Origin guard, clientes JWT/RLS y protección de escrituras de esta versión académica.

No hay contraseña legítima disponible mediante gestor seguro ni sesión de prueba; no se probará con contraseñas históricas, inventadas o `1209`. Un hash no permite recuperar su contraseña. No se enviaron emails ni cambiaron contraseña/sesiones. Preparación segura: el titular/administrador del proyecto debe verificar control del correo y coordinar el impacto de cambiar una cuenta compartida; revisar SMTP/plantilla recovery/redirects en Supabase y utilizar el flujo oficial de recuperación tras autorización específica. El sitio actual no implementa callback/UI de actualización de contraseña; enviar ahora un recovery al sitio sin ese flujo no se presenta como solución funcional. Panel seguro de usuarios: https://supabase.com/dashboard/project/nwsmbemwtexmrtpkgxrz/auth/users. Buscar el UUID confirmado antes de cualquier acción; no crear/promover otro email.

RLS activa en siete tablas; policies Admin usan `is_dreams_admin()` y perfiles. Persisten grants históricos TRUNCATE anon/authenticated en cinco tablas: RLS no los limita, no se demostró acceso HTTP explotable y no se ejecutó operación destructiva. Requieren revisión/migración separada. Credencial expuesta históricamente también requiere plan separado de reemplazo seguro. Sin cambios a Supabase por esta publicación.

## Rollback operativo

Destino exacto anterior Pages `444489eb-dcfe-4650-b005-acc3469ab02e`, SUCCESS confirmado por API; `https://444489eb.dreams-perfumes.pages.dev` y `/api/health` accesibles, Worker previo health 200. Un primer curl de health dio 503 transitorio; repetir confirmó 200 en antiguo deployment, alias oficial y Worker. No ignorar nuevos errores durante QA.

Para revertir usando la integración Cloudflare autorizada: POST `/accounts/9f3d7af60fcb0c2b4fff8570843588f9/pages/projects/dreams-perfumes/deployments/444489eb-dcfe-4650-b005-acc3469ab02e/rollback`. Endpoint oficial y permisos de publicación disponibles; no se ejecuta salvo regresión material. Luego GET del proyecto debe mostrar ese canonical_deployment, verificar `/api/health`, catálogo, acceso/403 anónimo y hero de alias oficial. El deployment antiguo conserva el Service binding a Worker `f73d5087`, que no fue cambiado. No borrar versiones, reactivar Railway ni tocar DNS. Esta recuperación depende de Cloudflare/Supabase y no es respaldo independiente de esos proveedores.

## Checks y pendientes

Sintaxis 43 JS, 113/113 tests (dos nuevos de pin/headers/fallo cerrado), build Workers dry-run, Pages y audit producción correctos. Sin lint/TypeScript independientes en este proyecto. Tests locales de sesión/Admin/módulos usan fixtures; no equivalen a autenticación remota real. Evidencia remota después de publicar se registra en el checkpoint final.

El video `gemini_generated_video_1e78e674.mp4` no está entre adjuntos/archivos disponibles; falta que el usuario lo adjunte. No se integró material sustituto. Su futura branch será separada y dependiente de esta promoción. Sólo `academic-review` recibirá ese cambio; Pages queda fijado a backend estático y no hay auto-deploy de esa branch. Inspeccionar/optimizar el archivo real antes de implementar reproducción, fotograma final, reduced-motion, ahorro de datos y controles.
