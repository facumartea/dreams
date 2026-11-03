# Continuidad oficial — 27 de octubre de 2026

Único destino autorizado: https://dreams-perfumes.pages.dev/. No se crea ni modifica ninguna preview, otro proyecto o sitio. Misma rama/PR56, base PR53; PR54/55 preservadas sin merge. La publicación es parcial y no resuelve Auth ni activa escrituras pendientes.

## Estado y causa comprobados

Pages oficial `f44a6069-a891-4d1b-a035-0e0dc5a00a40`, fuente `461c17dcdce6608e7854d9e72bb8eefed4b73935`; proxy principal `d5df723d-e1f1-4889-ae5b-e79ebfd131cd`, fuente `ec04a35812d044e57196c6a1ca55232e723ff60c`. La PR56/6378101 aún no estaba publicada. CI del mismo SHA SUCCESS39639622599,279 tests; no se repitió esa suite sin cambios. Nueva verificación: [HTTP previo](evidence/official-review-20261027/before-http.json).

- Registro `{}` retorna403 antes de validación: `/api/auth/register` no figura en la excepción del middleware `preview_read_only` del backend oficial. Login vacío400, sesión anónima null, Admin anónimo403. El mismo flag bloquea guardar productos con sesión válida, antes del handler Admin. La UI no puede corregir ese middleware ni suplir autorización.
- Supabase `nwsmbemwtexmrtpkgxrz`/dreams-project ACTIVE_HEALTHY. Lectura oficial `/auth/v1/settings` con clave pública, sin imprimirla:200, `mailer_autoconfirm=false`, `disable_signup=false`. Confirm email activo. Cinco de diez cuentas pendientes, sin borrarlas ni confirmarlas. Nueve perfiles, un Admin; UUID esperado `a88d8d4e-ada3-4bfa-a6f5-db39d2dc9c19`, roladmin y confirmado. Ninguna credencial o rol se cambió.
- Entorno spec141, sin secretos/identidades/bindings; presencia de SUPABASE_ACCESS_TOKEN/SUPABASE_SECRET_KEY/DREAMS_ADMIN_NEW_PASSWORD=false. SQL/proyecto/advisors disponibles; Auth Management no expuesto. Un intento inicial de settings sin stdin útil terminó401; se corrigió el harness y la lectura autenticada con clave pública devolvió200. No fue un fallo de configuración del proveedor.
- No existe sesión Admin/customer real autorizada en la ejecución para probar guardado. No se obtiene acceso leyendo hashes, sesiones o tokens de usuarios ni usando privilegios SQL para fabricarlos. La excepción de registro de PR54/55 está preparada, pero no se promueve con Confirm email activo y QA real bloqueada.

## Correcciones publicables independientes

1. UI Admin de PR56: isologo limpio, siete tarjetas/módulos reales, buscador nombre/marca, stock0–2, recuperación de errores, protección de cambios sin guardar e imágenes. Editar/Eliminar104×44 compartido, estilo destructivo/confirmación conservados. HTML sólo se superpone después de autorización200; nunca sobre401/403/503.
2. Release de Pages retira el `admin_backend_url` del candidato de revisión y conserva el backend oficial d5df723d para TODAS las APIs/sesiones. No se reutiliza ni modifica ningún servicio de preview. Server/app.js de la rama contiene correcciones preparadas, pero el backend publicado sigue ec04a35: no atribuirle esas mejoras servidor.
3. WhatsApp de ficha: antes cancelaba el enlace y esperaba POSTinquiries para window.open; podía perder activación y bloquearse en móvil. Ahora enlace nativo abre durante el gesto; registro de consulta conserva llamada independiente sin bloquearlo. Teléfono inválido/ausente no produce wa.me inválido; configuración fallida no oculta el producto ni impide carrito. Resumen incluye producto, tamaño, cantidad1 y precio mostrado, con Unicode/saltos seguros. No se envió mensaje ni se creó consulta comercial durante QA; endpoints y wa.me interceptados en pruebas de clic.
4. Autofill de cuenta conserva paleta/contraste sin desactivarlo. Reutilizado estilo acotado de PR54; no se retiran mensajes de confirmación mientras el proveedor la exige.

## Evidencia reutilizada y nueva

Matriz Admin [201 ejecuciones locales anteriores](evidence/admin-audit/matrix.md), A28/B25/C25/D27/E30/F24 casos distintos: mismo código Admin, no se cuentan fixtures como QA real. La capa UI está autorizada; guardado real NO acreditado. Nuevas pruebas Node cubren codificación/destino/ausencia de teléfono/apertura síncrona/fallo de red y aislamiento de rutas oficiales. Funciones nuevas/modificadas <=20 líneas verificadas con AST; sin dependencias nuevas.

[QA local nueva](evidence/official-review-20261027/local-browser-matrix.json):12 PASS sobre Chromium1440×900 y390×844 táctil; enlaces WhatsApp con API fallida/interceptada, carrito/reload, teléfono ausente, validación vacía de acceso, siete tarjetas/búsqueda/acciones104×44, sin pageerrors. Un primer harness buscaba la clase antigua cart-item; corregido a cart-row, no se cambió el carrito por esa espera. Capturas de Admin son fixtures locales, no acceso Admin real. No Safari/iPhone físico.

## Bloqueos y seguridad

- Registro sin confirmación/usuarios previos/sesión real/carrito A–B/own reviews: pendientes PR54/55. No se publican como resueltos.
- Guardado Admin e imagen tras escritura real: BLOQUEADOS. No se habilitan mutaciones sin QA autenticada. Hace falta sesión controlada Admin y cliente y acceso seguro Auth Management del proyecto; no otra autorización por chat ni contraseña/token pegados en conversaciones. La herramienta actual no ofrece entrada secreta o reconexión de bindings. Recuperación propietaria vía GitHub: https://supabase.com/dashboard/sign-in y https://github.com/password_reset.
- SQL confirmó RLS activa en nueve tablas y TRUNCATEreviews false para anon/authenticated, sin repetir revocación. Advisor SECURITYDEFINER is_dreams_admin es la función intencional de comprobación de rol, no se cambia a ciegas; account_cart_operations sin policies es intencional server-only. Protección de contraseñas filtradas pendiente: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection.
- Checkout académico oficial está enabled/presentation_demo: preservar, sin tocar pasarela/stock/pedidos comerciales. Carrito por cuenta no está integrado en la oficial, pendiente PR55. Se reutiliza evidencia anterior del código checkout idéntico; nueva comprobación oficial se registra tras deploy.

## Publicación y rollback

Se publica exclusivamente el build Pages en el proyecto dreams-perfumes con la etiqueta técnica de producción existente `codex/cloudflare-hosting-migration`. No se modifica el Worker, Secret, configuración Auth, DNS, datos ni previews. Diff desde461c17d revisado: Admin UI/estilos/helpers, WhatsApp y autofill; sin video/Auth55. Backend sigue d5df723d/ec04a35.

Rollback: conservar Pagesf44a6069 SUCCESS y el mismo backend; POST `/accounts/9f3d7af60fcb0c2b4fff8570843588f9/pages/projects/dreams-perfumes/deployments/f44a6069-a891-4d1b-a035-0e0dc5a00a40/rollback` si hay regresión material. No DB rollback, no DNS; endpoint verificado en documentación oficial y versión retenida. No se usa Railway ni se elimina deployment alguno. Commit/CI/deployment y matriz remota finales se registran después de ejecutarlos.

## Seguridad de dependencias y API oficial

CI40529678765 se detuvo en audit antes de tests: avisos nuevos GHSA-27r3-jxmh-p828 (body-parser comprimido) y GHSA-rxp7-6hxx-x8q5 (ip-address). Actualización acotada del lockfile:body-parser2.4.0, ip-address10.7.5 y qs6.16.1 requerido por parser; no se cambió Express, no se desactivó audit. `pnpm audit --prod` posterior sin vulnerabilidades conocidas. Los tests HTTP se repiten porque cambiaron dependencias de parseo/rate limiting.

El backend live sigue ec04a35, por lo que cambiar el lockfile NO lo parchea remotamente. Se añade protección en el proxy de esta única oficial: peticiones API con Content-Encoding distinto de identity se rechazan415/no-store antes de tocar el parser legacy. La interfaz envía JSON sin compresión y conserva su funcionamiento. Prueba asegura0 llamadas upstream para gzip/deflate/br/case/lista/desconocido y paso intacto de JSON normal/identity. No se cambia ningún otro sitio o Worker. El backend antiguo y sus otros accesos siguen pendientes de actualización autenticada/validada; no se presenta esta mitigación de Pages como actualización completa del backend.

## Publicación y verificación final ejecutadas

OFICIAL https://dreams-perfumes.pages.dev/ y Admin https://dreams-perfumes.pages.dev/admin. Pagesa3184576-4390-4a71-9205-d9269bd7dfe7 SUCCESS/production/canónico; fuente7b302cf6b1896cfe500a0643290646b3086cb082. Backend sigue d5df723d/ec04a35; no Admin/Auth preview targets en release. PR56 abierta/draft, sin merge. CI40530812778 SUCCESS exacto:288tests/check63/audit limpio/tresbuilds. Checkpoint documental posterior no cambia el artefacto publicado.

[Resultados completos](evidence/official-review-20261027/matrix.md):HTTP26PASS, navegador10PASS, académico2PASS;0 fallos en comprobaciones ejecutadas,1 objetivoFAIL y8BLOQUEADOS explicitados. Los failures previos de CI:39c audit y f446720/e030b7d assert estático de notas tras refactor. Se conserva y mejora esa prueba con renderizado/escape real;40focalizados finales PASS y CI288PASS. AST funciones modificadas/proxy<=20 confirmado después de extracción.

WhatsApp abre con el teléfono configurado y texto correcto en móvil/escritorio, sin depender de API auxiliar, sin mensajes/consultas comerciales; config ausente interceptada mantiene ficha/carrito. Carrito visitante persiste y muestra envío gratis. Académico sin número/vencimiento/CVV:Tarjeta, rechazo de nombre vacío, una session/payment con doble clic, referencia estable/reload, carrito limpiado después de resultado válido,0 POST a checkout comercial. Ejemplo de referencia simulado:DREAMS-2928FC75FEA54ED5ACFFCA83865EB713.

[Escritorio oficial](evidence/official-review-20261027/desktop-cart-official.png), [móvil oficial](evidence/official-review-20261027/mobile-cart-official.png), [confirmación escritorio](evidence/official-review-20261027/desktop-academic-official.png), [confirmación móvil](evidence/official-review-20261027/mobile-academic-official.png). Capturas de Admin anteriores/locales no se presentan como sesión remota.

RLS de productos/cupones exige is_dreams_admin para mutaciones; perfiles sólo SELECT propio/Admin; órdenes SELECT Admin; reviews OWNER DELETE y Admin moderación. Inspección SQL y guardas anónimas no sustituyen QA con JWT real. Cinco cuentas pendientes (una sin perfil), sin promover/borrar/reparar. Datos antes/después idénticos46productos/0pedidos/0reviews/2consultas/10usuarios/stockdigest7a58615dd40e0dcfd898a52aa108b820.

Preview animada ba6891f4/c8439ac reconfirmada intacta por lectura; ninguna preview u otro sitio se creó/modificó. Sin activosMP4 en esta rama/artefacto oficial, sin merge, DNS, roles, credenciales, flags Auth, pagos o migraciones. Patrón sb_secret no encontrado en artefacto público; nunca se leyó/copió secreto servidor a Pages. Runtime logs completos/CWV/Safari físico no evaluados. DEPLOY OFICIAL:SÍ, alcance parcial UI/Admin protegido/WhatsApp/autofill/guard API; registro y escrituras pendientes, no resueltos.
