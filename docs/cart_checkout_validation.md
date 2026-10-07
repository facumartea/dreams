# Carrito, checkout y presentación — actualizado 2026-10-07 (America/Buenos_Aires)

## Preview real de PR35 — 2026-10-07

**[Abrir DREAMS](https://cart-checkout-review-dreams-perfumes.dreams-perfumes.workers.dev/)**. Preview `cart-checkout-review` id da9e5bd9435f47b1a82da81d137d548c, deployment 1537279f-9851-4532-b72a-4d60f7132524, fuente b75ce0dfcd11b6f4425a3b8193c9d85ad669b34d. URL inmutable: https://1537279f-dreams-perfumes.dreams-perfumes.workers.dev. Se usa el alias para navegar/pagar/POST porque APP_ORIGINS permite únicamente ese origen exacto. No habilitar pagos en esta preview.

El usuario cargó el Secret en Previews Base. Se verificó sólo nombre/tipo secret_text y SUPABASE_URL del proyecto esperado; no se obtuvo su valor. Uso servidor conservado. Se añadió env.preview.previews vacío tras el error específico de Wrangler (ningún deploy durante el intento fallido). Publicación por `wrangler preview --env preview --worker-name dreams-perfumes --name cart-checkout-review`; variables no secretas mediante --var: NODE_ENV production, PRODUCT_BRAND_COLUMN marca, SUPABASE_URL esperado, APP_BASE_URL/APP_ORIGINS igual a URL propia sin slash final, CHECKOUT_PROVIDER demo, CHECKOUT_SCHEMA_READY false, DEMO_AUTO_CONFIRM_EMAIL false, CHECKOUT_SHOW_TEST_DATA false y CONTACT_EMAIL vigente. Nada de cron/colas/integraciones comerciales nuevas; registro y reparación de perfiles siguen pudiendo escribir, por eso no se probaron.

Build Workers correcto y dos tests runtime Workers correctos por cambio de configuración. CI exacto de b75ce0d SUCCESS: https://github.com/facumartea/dreams/actions/runs/37565195401. La suite 98/98 ya estaba acreditada; CI la volvió a ejecutar automáticamente. Commits posteriores exclusivamente documentales no cambian el código desplegado.

**Verificación remota real, sin interceptar assets:** Chromium 390×900 y 1440×900; menús y Escape, 46 productos, búsqueda Ombre (1) y vacía (0), marca/género mujer (10)/categoría (34), máximo 250000 (13), sort asc/desc y reset (46). Agregar dos productos, cantidades +/−, eliminación individual, vaciado, reload, contador y subtotal coherentes; envío no incluido, COMPRAR deshabilitado. Sin pageerror ni API fallidas en este recorrido ni overflow del carrito. Reduced-motion 390×844 mantiene hero visible. Cuatro assets cambiados coinciden byte por byte con fuente, sin patrones sb_secret/SUPABASE_SECRET_KEY/createClient.

**Fallos controlados sobre código remoto:** demoras de requests de quote en navegador hacen llegar respuestas fuera de orden; cantidades nuevas y vaciado se conservan. 503 de cotización inyectado en navegador muestra Reintentar; retirar la inyección vuelve a la API real y recupera el carrito. Ambas pruebas pasaron en móvil/escritorio; el 503 simulado no es un error ocurrido en el servidor.

Auth anónima user=null, Admin 403. Primera consulta real health 503; cuatro consultas posteriores 200, tres medidas entre 0.34 y 0.48 s. Causa inicial no confirmada y queda vigilancia pendiente, no atribuirla a cold start sin evidencia. Tail por version-id no capturó eventos; observabilidad específica **no verificada**, no afirmar cero errores runtime globales. WhatsApp_number vacío: link inválido ausente, consulta real y resumen con destinatario válidos pendientes de contacto; pruebas de formato/resumen del servidor siguen siendo locales.

Worker vigente f73d5087 al 100% comprobado después del deploy; Pages ae2f7932 permanece. Rollback/retirada: esta preview es independiente del tráfico vigente; no promocionarla ni usar commands deploy sobre env.preview (ese entorno nombra al Worker público). Si la preview falla, conservar sitio vigente y corregir/publicar otra versión con wrangler preview. No usar Railway offline como respaldo. Auth/Admin autenticados, pagos/webhooks seguros, segundo banner y observabilidad/readiness siguen pendientes.

## Evidencia del checkpoint anterior (2026-10-06)

## Base y deployment comprobados

La rama `codex/cart-checkout-ux` parte de `8d80fdd5fdf19a562c0fbef1f75cb1bab7f8f82d` de PR #34, todavía abierta. La PR de esta tarea tiene como base `codex/cloudflare-hosting-migration`: depende de #34 y muestra sólo este alcance. Main continúa en `4655b0cbdcec8ad2aade4cdde03ef60b22652bf1`; no se integró PR32 ni otra implementación.

URL vigente: https://dreams-perfumes.pages.dev. API Cloudflare confirmó Pages deployment `ae2f7932-aefe-48b2-a9e9-8c3597b607f9`, fuente `b3cd5f62523d15603078798baa9f31b633692d3f`, proxy DREAMS hacia Worker dreams-perfumes. Backend activo `f73d5087-ac19-4168-890b-6da3abb6b635`, al 100%. CI de la base 8d80fdd SUCCESS, run 37541689220. Estos identificadores no representan un deployment de esta tarea.

## Causa comprobada de COMPRAR deshabilitado

`server/app.js` anuncia checkout habilitado sólo si el proveedor está configurado, APP_BASE_URL es válido y CHECKOUT_SCHEMA_READY es verdadero. `public/js/carrito.js` habilita el enlace únicamente después de una cotización y configuración válidas.

Configuración remota inspeccionada sin valores secretos:

- CHECKOUT_PROVIDER=demo, CHECKOUT_SCHEMA_READY=false, DEMO_AUTO_CONFIRM_EMAIL=false.
- `/api/checkout/config`: enabled=false, provider=null, mode=demo.
- SUPABASE_SECRET_KEY existe como Secret; Supabase apunta a `nwsmbemwtexmrtpkgxrz` y health devuelve api/database ok.
- No bindings MERCADO_PAGO_ACCESS_TOKEN ni MERCADO_PAGO_WEBHOOK_SECRET. El adaptador Mercado Pago sí está implementado, pero no fue llamado por este bloqueo.
- WHATSAPP_NUMBER no está configurado; `/api/config` devuelve whatsapp_number vacío.
- Lectura de information_schema confirmó las columnas existentes de orders y coupons. No se deduce ausencia de tablas del flag false. No se cambiaron tablas, políticas, permisos, flags ni datos.

**Conclusión: bloqueo intencional de configuración, no compra fallida del proveedor ni checkout inexistente.** No se habilitó demo sobre datos comerciales: crear checkout escribe en orders, incluso sin cobrar.

## Correcciones

- Respuestas atrasadas no restauran el carrito vaciado ni pisan cantidades recientes; cambios de storage en otras pestañas disparan revalidación.
- Fallos HTTP, de red o JSON en configuración de pago mantienen una cotización válida, pero compra deshabilitada.
- Error de cotización muestra estado persistente y Reintentar; ninguna acción de compra/consulta usa datos sin verificar.
- WhatsApp sólo se genera con un teléfono de 8–15 dígitos, normalizado desde la configuración real. Browser también rechaza enlaces sin destinatario; enlaces generales no apuntan a wa.me vacío.
- Carrito muestra Subtotal y envío no incluido/a consultar. Checkout y resumen de consulta aclaran que no es un precio final con envío confirmado. No se inventó tarifa ni se cambió importe de productos/pedidos.
- El estado de checkout desactivado no promete WhatsApp cuando ese contacto falta.

## Presentación

La portada publicada y su código tienen una imagen fija, no carrusel. Se inspeccionaron los seis assets locales: logos/isotipos, dos tamaños del mismo hero y un frasco pequeño de la misma composición. No hay segundo banner adecuado. No se duplicó la imagen ni se inventaron promociones. Carrusel y transición entre diapositivas quedan pendientes de al menos **una imagen distinta y pertinente**, con permiso de uso, idealmente 1024×1536 y alternativa recortable para móvil. Textos, imagen, menú y motion/reduced-motion existentes se conservan.

## Evidencia ejecutada

- `pnpm run check`: 36 JS verificados. No hay scripts de lint ni comprobación TypeScript; no se presentan como ejecutados.
- `pnpm test`: 98/98. Regresiones cubren vaciado con respuesta tardía, orden inverso de cotizaciones, configuración de pago fallida, reintento y contacto/precios del servidor; se verifica el gate proveedor/URL/esquema sin acceder a datos comerciales.
- `pnpm run build:cloudflare` y `pnpm run build:pages`: correctos, dry-run sin deployment. `pnpm audit --prod`: sin vulnerabilidades conocidas. `git diff --check`: correcto.
- Chromium 390×900 y 1440×900: menú desktop y apertura/cierre/Escape móvil; búsqueda real (Ombre: 1), búsqueda vacía de resultados (0), marca, género mujer (10), categoría (34), precio máximo 250000 (13), orden asc/desc y limpieza (46). Filtros usan APIs remotas reales y no fueron modificados.
- Carrito: dos productos reales añadidos, +/−, eliminación individual, vaciado, reload, contador y subtotal coherentes. Comprar permanece deshabilitado y se oculta enlace WhatsApp inválido. Sin overflow del carrito ni pageerror ni respuestas API fallidas en este recorrido.
- **QA de frontend modificado: archivos locales interceptados por Playwright sobre el origen Pages y APIs reales de lectura/cotización. No es QA de un deployment nuevo.** Regresión servidor/contacto ejecutada con DB inyectada; no publicada remotamente.
- Prueba de error/duplicado: respuestas de Auth/config/sesión sintéticas, únicamente en contexto de navegador de prueba. Doble clic produce una solicitud interceptada; respuesta 503 permite reintento; nunca se envió checkout/session real ni se simuló compra exitosa. Error de cotización y Reintentar probados en ambos tamaños.
- Reduced motion 390×844: hero existente visible. No se afirma transición de carrusel inexistente.
- Smoke remoto sin interceptar: health 200, sesión anónima user=null, Admin 403. Consola de home/catalogo/producto: cero errores y respuestas fallidas en el muestreo. Tail de Worker: 5 invocaciones observadas, outcome ok en todas, cero logs error/excepciones; no extrapolar a todo el tráfico.
- Auth real autenticada, permisos Admin autenticados, pago sandbox y webhooks remotos pendientes: no hay cuentas ni credenciales de prueba disponibles. No se registraron usuarios, enviaron mensajes/correos, cobraron pagos ni crearon pedidos.

## Configuración segura — bloqueo histórico resuelto el 2026-10-07

En el checkpoint del 2026-10-06 no se había publicado esta rama. Existía autenticación Cloudflare; el Secret del Worker activo está configurado, pero **la base de previews aisladas devuelve lista de secretos vacía** (`wrangler preview base-config secret list --env preview --json`). No se puede recuperar ni copiar el valor del Secret activo. No se reemplazó la versión que sirve Pages para simular una preview.

Para habilitar una preview aislada, desde un terminal privado con Wrangler autenticado y este repositorio:

```sh
pnpm exec wrangler preview base-config secret put SUPABASE_SECRET_KEY --env preview
```

El comando solicita el valor mediante entrada segura; obtenerlo del proyecto esperado en https://supabase.com/dashboard/project/nwsmbemwtexmrtpkgxrz/settings/api-keys. No pegarlo en chat, argumentos, logs o Git. Usar la sección Secret keys, nunca Publishable key. Dashboard del Worker: https://dash.cloudflare.com/9f3d7af60fcb0c2b4fff8570843588f9/workers/services/view/dreams-perfumes/production/settings. Con el Secret disponible, publicar con `wrangler preview --env preview --name cart-checkout-review`, conservar la URL real devuelta y configurar APP_BASE_URL/APP_ORIGINS para **ese origen exacto** más SUPABASE_URL esperado antes de verificar cotización. Mantener checkout desactivado y auto-confirmación false durante QA de lectura; ningún wildcard ni cambio de tráfico de la versión activa.

Para pagos: https://www.mercadopago.com.ar/developers/panel. Usar credenciales/cuentas de prueba de la aplicación del negocio; cargar MERCADO_PAGO_ACCESS_TOKEN y MERCADO_PAGO_WEBHOOK_SECRET como Secrets del entorno de prueba. CHECKOUT_PROVIDER=mercado_pago y MERCADO_PAGO_MODE=sandbox; habilitar CHECKOUT_SCHEMA_READY sólo tras verificar esquema/dependencias y **una base de QA separada de datos comerciales**, porque sandbox también persiste pedidos. No ejecutar migrations, seeds o resets para publicar. Revisar envío pendiente antes de ofrecer compra comercial; la integración actual no cotiza envío.

WHATSAPP_NUMBER requiere el contacto real del negocio, con código de país. Es una variable pública; no inventar número ni enviar mensajes al verificar el enlace.

## Recuperación y pendientes

En el checkpoint local anterior no había nuevo deployment, por lo que no requería rollback: Worker y Pages conservan las versiones iniciales. Una preview aislada futura se retira sin promover ni alterar la versión activa. Revertir commits de esta PR en su rama si es necesario; no force push. Railway no se restauró ni se considera respaldo operativo.

Antes de promover: integrar dependencias por revisión de PRs; resolver Secret de preview, validar el deployment real; prueba Auth/Admin segura, credenciales sandbox y pedidos exclusivamente de QA; reglas de envío, idempotencia server-side de nuevas sesiones/reserva de stock (deuda existente); banner adicional; seguridad de credencial anteriormente expuesta y recuperación operativa. Esta tarea no autoriza producción/merge.
