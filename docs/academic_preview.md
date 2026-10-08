# DREAMS — preview académica

## Base y alcance

Rama `codex/academic-access-checkout`, dependiente de PR37 (`ac7e088`), a su vez PR34. Sitio vigente Pages confirmado: fuente `5e3835e`, deployment `444489eb`, backend Worker `dreams-perfumes`. Esta tarea no publica sobre Pages ni sobre ese Worker.

Se reutilizan exclusivamente controlador de carrito y cuatro regresiones de PR35/a5158b0 para impedir respuestas atrasadas después de vaciar/cambiar cantidades. No merge de PR35/36 ni hero animado. Los autores conservan la escritura solicitada: Facundo Martearena y Joaquir Ruas. Contactos públicos centralizados en server/contacts.js; HTML incluye fallback accesible.

## Google y continuidad

Supabase `nwsmbemwtexmrtpkgxrz`, settings Auth leídos: Google deshabilitado, email activo, confirmación requerida. SELECT del usuario `admindreams@gmail.com`: no existe. No se crean usuarios ficticios ni se promueven emails enviados por navegador.

Nuevo acceso centrado con isologo, título y botón Google disponible cuando el proveedor está configurado y GOOGLE_ACCESS_READY=true tras verificar URLs/flujo; hasta entonces el acceso por contraseña permanece visible (instrucción posterior del usuario). También se conserva si la lectura de configuración falla. Métodos globales Auth intactos. Callback PKCE servidor `/api/auth/google/callback`, verificador HttpOnly/Secure/SameSite=Lax durante 10 minutos; canje crea cookies existentes y consulta rol en profiles, nunca user_metadata. Cancelación/error vuelve a cuenta; next limitado a rutas internas concretas. Logs de preview habilitados sin invocation logs y con redact_query_string=true. Wrangler tail no soporta Previews; consultar Observability de preview o API Telemetry. Logs Node ya no incluyen query strings, códigos OAuth ni referers.

No hay integración Google Cloud ni herramienta de configuración Auth Management autorizada disponible. Falta cliente OAuth web y habilitación en [Google provider](https://supabase.com/dashboard/project/nwsmbemwtexmrtpkgxrz/auth/providers?provider=Google). URI Google autorizada: `https://nwsmbemwtexmrtpkgxrz.supabase.co/auth/v1/callback`. En [URLs Auth](https://supabase.com/dashboard/project/nwsmbemwtexmrtpkgxrz/auth/url-configuration) añadir el callback exacto de esta preview y, antes de publicar en Pages, `https://dreams-perfumes.pages.dev/api/auth/google/callback`, conservando URLs/Site URL vigentes. Nunca solicitar secretos por chat.

Después del primer ingreso Google real de la cuenta indicada, verificar su UUID e identidad Google confirmada; `scripts/grant-google-admin.js` opera exclusivamente con variables de un gestor servidor, verifica proyecto/email confirmado/identidad Google y actualiza sólo su profile customer. No ejecutado: identidad inexistente y acceso local al secreto no disponible. Mantener administradores actuales hasta QA de Google/sesión/logout/Admin.

## Auditoría Admin

Módulos reales: dashboard/productos (imagen, stock, alta/edición/eliminación)/usuarios/consultas/opiniones/pedidos de lectura/cupones. Todos los endpoints Admin y páginas usan rol leído en servidor; mutaciones usan cliente JWT y policies. RLS activa en siete tablas. Helper is_dreams_admin() compara auth.uid() y profiles.role con search_path vacío; policies no usan metadata editable. Profiles sólo SELECT para propietarios; promociones no disponibles en API pública. Pedidos Admin tienen sólo SELECT y cupones grants/policies Admin.

Correcciones: respuestas no JSON del Admin producen error controlado; un grid mínimo heredado estiraba formulario/tabla a 574 px sobre pantalla de 390 px. min-width:0 y track minmax(0,1fr) mantienen scroll dentro de la tabla; QA local 390/1440 sin overflow, seis módulos y editar/limpiar. Preview comunica protección de escrituras. PREVIEW_READ_ONLY=true rechaza globalmente escrituras de productos, stock, cupones, reviews, consultas y pedidos, incluso para admin. Login/logout, OAuth, quote y presentación aislada admitidos. Registro por password protegido en preview; Google puede crear usuario/perfil al completar un acceso real, no ejecutado por QA.

Hallazgos pendientes:

- P1: grants históricos TRUNCATE de anon/authenticated en products/profiles/reviews/inquiries/favorites; RLS no protege TRUNCATE. No se comprobó una vía HTTP explotable ni se ejecutó truncado. Reducir grants con migración segura y revisión de dependencias antes de producción; ninguna policy/grant remoto cambiado aquí.
- P1: credencial expuesta en captura histórica: revisar consumidores y reemplazar mediante gestor seguro, fuera de esta tarea, sin revocación ciega.
- P2: Admin permite eliminación física histórica; archive no existe. QA sólo sobre fixtures, jamás catálogo comercial.
- P2: stock no se reserva/descuenta en checkout comercial; cupones carecen de límites concurrentes de uso. No habilitar comercio por este demo.
- Admin autorizado y móvil autenticado remoto pendientes: no hay cuenta de prueba con sesión legítima disponible.

## Checkout elegido: simulación académica aislada

No hay credenciales Mercado Pago Sandbox verificadas. El demo anterior guarda orders en DB real; NO se activa. CHECKOUT_SCHEMA_READY=false, pagos comerciales siguen protegidos. No migraciones/seeds/resets ni escrituras de orders/stock/cupones.

Nueva presentación explícita `PRESENTATION_CHECKOUT_ENABLED=true` más Secret `PRESENTATION_SIGNING_KEY` independiente (al menos 32 caracteres), exclusivamente servidor y exclusiva preview. Sin ambos, COMPRAR permanece cerrado. PREVIEW_READ_ONLY=true bloquea integración comercial/webhooks y cualquier escritura fuera de una allowlist. Variables en env.preview.previews.vars, no en env.production ni en deployment vigente. SUPABASE_SECRET_KEY se hereda de Base de Previews y sólo sirve en servidor; SUPABASE_URL verificado del proyecto existente.

Presentación permite invitado sin simular identidad/Auth ni permisos. Se lee catálogo para calcular subtotal/stock; ticket HMAC firmado y cookie anónima HttpOnly atan intento, escenario, subtotal, productos y vencimiento de 20 minutos. Pago retorna referencia DEMO determinística; repetir mismo ticket devuelve mismo resultado, sin órdenes persistidas. Resultado se verifica en servidor, nunca se aprueba por query string/redirección. Datos de comprador mínimos: nombre ficticio sólo en navegador; no se registra cliente. Número, vencimiento y CVV sólo en memoria DOM, nunca fetch/storage/logs. Body allowlist rechaza campos extra/tarjeta/precios del cliente. Ticket/receipt no contienen datos de tarjeta ni comprador.

Envío continúa A consultar: subtotal de productos, envío excluido y entrega por acordar. La prueba finaliza sobre productos; no confirma importe comercial definitivo ni envío gratis. Cupones comerciales no forman parte de esta presentación. Una marca académica discreta y referencia DEMO distinguen simulación sin banners/popups repetidos. No declarar Mercado Pago integrado/probado.

### Recorrido

1. Abrir preview, catálogo, agregar producto disponible y abrir carrito.
2. COMPRAR lleva al checkout aislado; resumen y precios vienen del servidor.
3. Abrir “Tarjetas ficticias y resultados”, Usar o completar número de prueba.
4. Nombre `CLIENTE DREAMS`, vencimiento `12/30`, CVV `123` (datos ficticios).
5. Continuar → procesamiento → resultado y referencia de prueba.

| Número ficticio | Resultado |
|---|---|
| 4242 4242 4242 4242 | Aprobado |
| 4000 0000 0000 0002 | Rechazado |
| 4000 0000 0000 1000 | Pendiente |
| 4000 0000 0000 9995 | Error |

Son escenarios del simulador DREAMS, no tarjetas oficiales Mercado Pago. Nunca usar una tarjeta real. Rechazo/error/pending conserva carrito y permite otra prueba. Ante red interrumpida se conserva ticket para repetirlo; “Comenzar otra prueba” descarta sólo referencia local. Sólo resultado aprobado verificado limpia carrito cuando su snapshot coincide, una vez por referencia; nunca elimina productos agregados posteriormente. Referencias expiran; no constituyen pedidos comerciales ni historial durable.

## Validación y deployment

Checks locales: sintaxis, suite Node, audit prod y builds Workers/Pages. No scripts independientes lint/TypeScript en este proyecto. Permisos, Google PKCE/cancelación, aislamiento, firma/manipulación/replay/resultados y carrito tardío cubiertos con fixtures. No atribuir estas pruebas a Supabase/Google reales.

Publicación autorizada sólo `wrangler preview --env preview --name academic-review`, Wrangler 4.147.0; hereda secreto Supabase Base. Secret independiente creado con randomBytes y transferido por stdin a `wrangler preview secret put PRESENTATION_SIGNING_KEY --env preview --name academic-review`, sin valores en comandos/archivos/logs. Preview publicada: https://academic-review-dreams-perfumes.dreams-perfumes.workers.dev/. Fuente publicada `87d64d4b1c3a7a0754c247c48a768a198971d045`, [CI 37723212856](https://github.com/facumartea/dreams/actions/runs/37723212856) SUCCESS (108/108); deployment `253981ae-1be2-4b14-ad5c-508ea03fb3cf`. PR38 abierta sobre PR37. El checkpoint documental posterior no modifica el bundle publicado. No divulgar valores de Secrets.

Rollback de esta preview: volver a desplegar su SHA anterior sobre el mismo nombre. Preview nueva no modifica Pages production444489eb ni Worker f73d5087; no requiere tocar DNS/producción. Si se integra posteriormente, revisar diff contra deployment vigente y preparar rollback Pages al deployment444489eb (SUCCESS), sin borrar deployments. Ningún merge autorizado aquí.

Carrusel sigue pendiente de segundo banner original distinto; referencia asset portada 1024×1536, composición 2:3. Para una segunda diapositiva conservar proporción 2:3 y mínimo 1024×1536 con margen para móvil/textos; no duplicar el mismo frasco/promoción inventada. Hero permanece estático.

## Evidencia ejecutada

- Local y CI: 108/108 tests, sintaxis de 43 archivos JS, audit de producción sin vulnerabilidades, builds Workers/Pages correctos. Generación de tipos Wrangler ejecutada fuera del repositorio. SDK Supabase real en workerd prueba generación PKCE/cookie; callback, cancelación y roles con fixtures. No scripts independientes de lint/TypeScript.
- Remoto sobre 3cf7cc8: Chromium 390/1440, contactos/autores/Nosotros, menú/Escape, búsqueda vacía/reset, género/categoría/precio/orden/reset, 46 productos; carrito agregar/cantidades/persistencia/subtotal/WhatsApp 542944160065 con resumen, sin enviar mensajes y sin errores de página.
- Rechazado/error/pendiente conservan carrito; aprobado lo limpia. Inspección de requests confirma sólo items/scenario/intent_id, ticket o receipt; ningún campo de tarjeta transmitido.
- Fallos provocados en navegador contra preview real: quote demorada tras vaciado no restaura producto; aborto de conexión de payment conserva ticket y permite reintento (1 preparación, 2 requests de pago incluyendo la abortada); doble clic no crea segundo intento; recargar recibo antiguo conserva carrito nuevo. Son inyecciones de navegador, no fallos comprobados del proveedor.
- Auth remoto: sesión anónima null/logout 200, Google config false/inicio 503, ocho rutas Admin anónimas 403 y escritura Admin 403. Login/Google/Admin autorizado reales pendientes por falta de cuenta/sesión legítima. UI Admin local con fixture autorizado: seis módulos, edición/limpieza, 390/1440 sin overflow ni errores tras corrección. Sin escrituras comerciales.
- Logs por API Telemetry: una cancelación OAuth esperada en preview, cero eventos de nivel error observados, sin patrones de secretos/tokens/tarjetas. Invocation logs desactivados: no extrapolar a todas las invocaciones ni a períodos sin cobertura. redact_query_string=true confirmado.
- SELECT posterior: cero orders, 46 products y ningún usuario con el email admin solicitado. No DDL, roles, RLS, grants ni datos cambiados.
- Smoke remoto final sobre 87d64d4: hash del CSS servido idéntico al archivo fuente publicado, hero estático, autores, acceso legacy centrado, health DB OK, checkout aprobado y vaciado; cero errores de página en 390/1440. Respecto de 3cf7cc8 sólo cambia CSS Admin/documentación; lógica funcional idéntica.
- Capturas remotas acceso fallback/footer/checkout/resultado en `/workspace/dreams-academic-evidence`. Capturas Admin son fixtures locales, no evidencia de Auth remoto. No prueba en celular físico/Safari ni auditoría de performance completa. Google-only UI pendiente de proveedor, callback, validación y GOOGLE_ACCESS_READY.

Estado: push, PR38, CI y preview efectuados; sin merge ni publicación Pages. Pendientes: cliente web OAuth en [Google Cloud](https://console.cloud.google.com/apis/credentials), proveedor Supabase/URLs, primer ingreso Google verificado y promoción segura por UUID. Sin integración autorizada disponible para configurar Google Cloud; las credenciales se ingresan únicamente en los paneles del proveedor. Estos pendientes no bloquean el checkout invitado aislado.

Antes de comercio real: pagos Sandbox, webhook verificado, stock, idempotencia durable y reducción revisada de grants históricos. Próxima acción: probar la preview en celular y completar el cliente Google en paneles seguros. Avance de esta tarea: de implementación local a preview publicada y QA remoto comprobado; integración Google/Admin real sigue abierta, sin porcentajes especulativos.
