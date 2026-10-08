# Acceso, idioma y contactos — PR38

Actualizado el 2026-10-08 (America/Buenos_Aires). Continuación de `codex/academic-access-checkout`, base PR37/ac7e088 y dependencia PR34; sin merges. Preview anterior: fuente 87d64d4, deployment 253981ae. Producción Pages 444489eb/5e3835e y Worker f73d5087 se preservan.

## Cambios

- Login por contraseña existente conservado. Retirados DREAMS ACCOUNT y el aviso técnico de Google pendiente. Google permanece preparado en servidor y condicionado a GOOGLE_ACCESS_READY; su configuración pendiente está sólo en documentación, no en el acceso del visitante.
- Nuevo asset `public/assets/dreams-isologo-clean.png`, transparente RGBA de 56×79, derivado de `dreams-isotype.png` (141×110 RGB). Otros assets locales no corresponden a la marca dorada; no se encontró un vector/original transparente más grande. Recorte original x=37, y=20, ancho=56, alto=79 excluye el rótulo. Máscara por diferencia rojo-azul elimina fondo neutral; bordes parcialmente cubiertos se descomponen contra el fondo original para evitar halo oscuro. Los 1074 píxeles opacos conservan RGB exacto; bordes y contraforma transparentes, símbolo completo. No redibujo ni regeneración de marca. Un intento automático alteró el acabado y fue descartado: no forma parte del repositorio.
- Isologo visible a 76–90 px de ancho con altura proporcional; tarjeta máxima 550 px, título y controles ampliados moderadamente. Campos a 16 px, objetivos táctiles de 52 px. La fuente raster pequeña limita nitidez a alta densidad; no se promete resolución vectorial.
- Traducciones: COLLECTION → COLECCIÓN, BACK OFFICE → GESTIÓN, Checkout → Finalizar compra/Pago, DEMO CARD → TARJETA DE PRUEBA, Stock → Disponibilidad, Preview → Vista de revisión. Rótulos de demostración y errores también en español. Estados/proveedores Admin traducidos al renderizar; códigos, rutas, claves, nombres propios y valores DB intactos. EAU DE PARFUM se conserva como denominación del perfume (francés, no inglés).
- Mensajes de validación nativa en español incluso con navegador inglés; limpieza al editar preserva validaciones existentes. Fallos de red/JSON muestran un mensaje español, sin mostrar detalles internos ingleses.
- Correos solicitados preservados. Teléfono confirmado +54 294 4160065 y WhatsApp al mismo número vigentes; enlace tel:+542944160065 y wa.me/542944160065. Inicio/Nosotros muestran WhatsApp acompañado del número. Lista central de teléfonos preparada sin inventar ni duplicar un segundo dato. Consultas del carrito conservan su resumen y destino servidor.

## Datos pendientes

Se formuló una única pregunta por el segundo teléfono y la elección del destino WhatsApp. Sin respuesta confirmada, se mantiene un único teléfono real y el WhatsApp vigente. No crear placeholders ni asumir otro número. Cuando lleguen ambos datos, actualizar server/contacts.js, fallback Inicio/Nosotros y WHATSAPP_NUMBER sólo del entorno autorizado; validar resumen del carrito sin enviar mensajes.

Google sigue deshabilitado y la cuenta admin solicitada no existe. No configurar clientes, crear usuarios ni modificar roles/URLs/Supabase por esta limpieza. Pasos seguros y riesgos previos en docs/academic_preview.md.

## Evidencia antes de publicar

- 111/111 tests, sintaxis 43 archivos, builds Workers/Pages correctos. Dos expectativas literales históricas ajustadas a la traducción sin quitar cobertura; pruebas nuevas de validación/errores de navegador y rótulos Admin sin mutar valores.
- QA local con fixtures: acceso 320/390/1440, proporción correcta/transparencia/carga, ausencia de Google pendiente/ISOTIPO/ACCOUNT, sin overflow; validación española con locale en-US, login erróneo, reintento exitoso y logout. El harness usa una instancia por tamaño para respetar el límite Auth; no se relajó el servidor real.
- Admin local con fixtures: seis módulos, editar/limpiar, 390/1440 sin errores de página ni overflow. Ningún fixture se publica como dato del catálogo.
- Publicación y QA remota de esta fuente se registrarán tras upload. Auth remoto autenticado pendiente por falta de cuenta de prueba legítima; no confundir login fixture con Supabase real. No auditoría completa de performance ni celular físico/Safari.

## Publicación y reversión

Sólo preview academic-review de dreams-perfumes, con `wrangler preview --env preview --name academic-review --tag <SHA>`. Wrangler 4.147.0 y documentación oficial de Previews verificados. Secret Supabase heredado; firma académica existente reutilizada sin leer/recrear/rotar valores. No modificar flags, entorno comercial ni producción. Reversión aislada: redesplegar fuente anterior 87d64d4 sobre ese mismo nombre; sin borrar deployments ni tocar DNS.
