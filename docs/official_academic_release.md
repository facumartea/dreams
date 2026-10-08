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

Destino exacto anterior Pages `444489eb-dcfe-4650-b005-acc3469ab02e`, SUCCESS confirmado por API; `https://444489eb.dreams-perfumes.pages.dev` y `/api/health` accesibles, Worker previo health 200. Un primer curl de health dio 503; Telemetry confirmó HTTP 401 de Supabase en Worker anterior f73d5087. Lecturas posteriores health/catalogo dieron 200 en deployment antiguo, alias oficial y Worker. La causa del 401 no está resuelta: limita la fiabilidad de ese respaldo; no se afirma disponibilidad continua.

Para revertir usando la integración Cloudflare autorizada: POST `/accounts/9f3d7af60fcb0c2b4fff8570843588f9/pages/projects/dreams-perfumes/deployments/444489eb-dcfe-4650-b005-acc3469ab02e/rollback`. Endpoint oficial y permisos de publicación disponibles; no se ejecuta salvo regresión material. Luego GET del proyecto debe mostrar ese canonical_deployment, verificar `/api/health`, catálogo, acceso/403 anónimo y hero de alias oficial. El deployment antiguo conserva el Service binding a Worker `f73d5087`, que no fue cambiado. No borrar versiones, reactivar Railway ni tocar DNS. Esta recuperación depende de Cloudflare/Supabase y no es respaldo independiente de esos proveedores.

## Checks y pendientes

Sintaxis 43 JS, 113/113 tests (dos nuevos de pin/headers/fallo cerrado), build Workers dry-run, Pages y audit producción correctos. Sin lint/TypeScript independientes en este proyecto. Tests locales de sesión/Admin/módulos usan fixtures; no equivalen a autenticación remota real. Evidencia remota después de publicar se registra en el checkpoint final.

El video `gemini_generated_video_1e78e674.mp4` no está entre adjuntos/archivos disponibles; falta que el usuario lo adjunte. No se integró material sustituto. Su futura branch será separada y dependiente de esta promoción. Sólo `academic-review` recibirá ese cambio; Pages queda fijado a backend estático y no hay auto-deploy de esa branch. Inspeccionar/optimizar el archivo real antes de implementar reproducción, fotograma final, reduced-motion, ahorro de datos y controles.

## Publicación y evidencia final

Oficial https://dreams-perfumes.pages.dev/, deployment `900a4bd8-0baa-4c64-926f-12a25836d7c2` SUCCESS, SHA proxy `c22a5d0e3efed323088761fadfc5d68cb6df2351`. CI [37852300142](https://github.com/facumartea/dreams/actions/runs/37852300142) SUCCESS. Staging del mismo bundle `2c801831-01fb-494c-8581-a2afc0401640`, verificado antes de promover. PR [39](https://github.com/facumartea/dreams/pull/39), sin merge. Documentación posterior no cambia bundle desplegado.

Chromium remoto 390/1440: imagen hero cargada, sin video/control pausa/motion tras espera/hover/scroll; textos/CTA y contacto/autores; móvil menú/Escape, escritorio navegación visible. Catálogo 46, búsqueda sin resultados/reset y Byredo/reset. Login legacy visible, isologo transparente y sin avisos técnicos; ocho rutas Admin anónimas 403. Login/logout/Admin autorizados remotos pendientes por falta de sesión legítima; permisos y módulos probados localmente con fixtures en suite, no atribuidos a datos reales.

Carrito remoto agrega, aumenta/disminuye, persiste tras recarga, contador y subtotal; WhatsApp conserva teléfono 542944160065 y resumen con envío excluido, sin enviar mensaje. Checkout presentación aprobado con datos ficticios y carrito vaciado; tarjeta permanece DOM y no se escribe pedido/stock. Escenarios restantes cubiertos por tests locales y QA anterior de PR38, no repetidos remotamente aquí. Cero pageerror/overflow en cobertura final. El harness inicialmente consultó /api/admin/dashboard inexistente (404) y contador ausente en página de resultado; se ajustó a /api/admin/stats y carrito/storage reales, sin cambios de aplicación.

14 hashes de HTML/JS/CSS/isologo remotos coinciden con archivos fuente; assets usan must-revalidate y portada no-cache. API health/config/datos reales correctos. SELECT post-publicación: 0orders, 46productos, rol admin conservado. Telemetry desde publicación: cero eventos error observados, sin invocation logs: cobertura limitada, no auditoría completa de todas las invocaciones.

Preview academic-review continúa `b049934`/`4ad20144`, health200 y portada sin video; Worker f73d5087 permanece activo al100%. No DNS/Supabase/merge ni despliegue de video. El MP4 sigue ausente; la única intervención para esa etapa es adjuntar el archivo solicitado.

Capturas oficiales en `/workspace/dreams-official-evidence`: 390/1440-home.png, -access.png, -contacts.png, -cart.png y -academic-result.png. Resultado JSON `/tmp/dreams-official-final-qa.log`; QA staging `/tmp/dreams-official-staged-qa.log`, checks/builds en `/tmp/dreams-promotion-*.log`. No celular físico/Safari ni performance integral verificados.
