# Cupón y formulario académico — cierre comprobado03/11/2026

Oficial exclusiva: https://dreams-perfumes.pages.dev/. PR57 desde main5236ef6, rama codex/cart-coupon-academic-inputs. Frontend publicado97c433355e1da58054620f5446bac2b5b6e7bb7f, Pagesfdd5f665-c7d1-438a-bc3d-e4bb079517fc. Backend fuente08635cdc5c1706ae520cbeec6c9a1b403c4df483, versiónef043065-5d28-45c7-906b-b9e1edb6a5ab, deployment2479eec0-5831-4284-8b7c-0ae8069884a7. Producción/default, Secret heredado sin leer valores. CI228/230/231SUCCESS.

## Implementación

Cupón único mediante quote_cart/resolve_coupon del servidor: estado, vencimiento, mínimo y límites global/por cuenta consultando pedidos aprobados, sin consumir usos. Límites por cuenta requieren sesión. CondicionesJSON especiales no interpretadas se rechazan explícitamente: no se conceden descuentos ignorando reglas. No migraciones ni modificaciones de cupones comerciales. El navegador envía sólo código/IDs/cantidades, nunca decide importes.

Carrito muestra descuento, Envío ($0) y total; revalida ante cantidades, reload y retry. Aplica por Enter/botón, permite quitar/reaplicar sin acumulación, deshabilita compra ante red fallida y no conserva descuento inválido. Se conserva el código al checkout. El ticket firmado incluye cupón/importes/productos y excluye cualquier dato financiero. Payment revalida precio/cantidades/stock/cupón antes del recibo; la referencia diferencia snapshots del cupón y conserva reintentos.

Titular vacío con placeholder CLIENTE DREAMS y etiqueta independiente; Unicode, espacios, guiones y apóstrofes admitidos. Número16dígitos agrupados, MM/AA (mes01–12) y CVV3dígitos: text/inputmode numeric, ceros conservados. Máscaras locales con paste/beforeinput/input y selección. No Luhn, consultas financieras ni pasarela. Ningún número, vencimiento o CVV se transmite, guarda en storage, ticket o recibo. El backend oficial conserva disable_request_log y no recibe esos campos; no se afirma una auditoría integral de todos los logs del proveedor.

## Validación y procedencia

- Suite local488PASS antes del último manejador de pegado; regresión específica de cupones/máscaras12PASS después. CI231 ejecuta la suite completa y builds sobre97c4333 (incluye el caso adicional de pegado). Sintaxis103archivos; inventario117archivos/2166registros/0>40. Builds oficial/PagesPASS.
- [Chromium local390/1440](local-browser.json): fixture QA_ONLY/10% exclusivamente en memoria; no es un cupón productivo creado. Totales180/180/180, envío0, red/storage sin datos financieros. Capturas cart/form sin prefijo official son LOCALES.
- [Chromium oficial390/1440](remote-browser.json): cupón existente sin modificarlo, Enter/botón/quitar/reaplicar/invalidar/cantidades/recarga/fallo de red/reintento; carrito→checkout→confirmación coherentes, referencia estable, doble envío protegido. El cupón existente produjo total0, válido en la simulación; el caso de cantidades compara subtotal, no supone que siempre cambie el total.
- [Casos de entrada oficiales posteriores al último despliegue](remote-input-edges.json): pegado real del portapapeles, letras/signos, longitud, ceros, reemplazo por selección, edición/borrado intermedio y junto a separador, Unicode/nombre/placeholder. PASS. Mes13 rechazado en el recorrido oficial sin peticiones; meses00/13/formatos/longitudes y vencido/inactivo/mínimo/límites/condiciones se cubren además con pruebas de servidor/locales. No se alteraron cupones comerciales para forzar esos estados remotamente.
- Registro normal de customer, login, reload/sesión y logout reales PASS; customerAdmin403. No se recreó la contraseña temporal ni se repitieron escriturasAdmin reales: los controladoresAdmin no se modificaron y la suite conserva sus regresiones de autorización/guardado. [Comparación de BD](business-comparison.json): pedidos, stock y cupones sin cambios;0sesionesQA restantes, cuenta de prueba retenida como customer.
- Petición manipulada con descuento/total no impone importes; session rechaza campos extra400. No compras comerciales, mensajes enviados ni otras webs/previews/DNS.

## Capturas oficiales

[Carrito390](official-coupon-390.png) · [Carrito1440](official-coupon-1440.png) · [Formulario390](official-form-390.png) · [Formulario1440](official-form-1440.png). Capturadas en la oficial sobre9d9cd7b, visual idéntica a97c4333; la última versión añade el manejador de pegado probado por separado, sin cambio visual.

## Incidentes y correcciones

El primer smoke detectó404 del nuevo módulo: faltaba la allowlist y alias de cabeceras del proxy. Corregido y regresión de proxyPASS; módulo200 en la oficial. El test remoto se ajustó a esperar revalidación y comparar subtotal para el cupón existente con descuento total. El pegado mixto era truncado por maxlength antes de normalizar: ahora paste normaliza primero; regresión y portapapeles realPASS. No se presentan intentos intermedios como aprobados.

## Rollback y límites

Conservar Pagesb169918f + backend29b843a0 como rollback previo compatible, con la misma clave/firma, sin pérdida de datos. También queda el snapshot2f6d62d0 con cupón funcionando antes del manejador paste. Ningún Secret nuevo, Cron/KV/QA temporal ni cambio Admin/Auth. El gate del deploy CLI no se habilitó con pruebas históricas: Direct Upload API de producción fue verificado por CI, hashes de artefactos y smoke de este alcance; el archivo conserva el bloqueo de futuros deploys sin evidencia nueva.

Sin pendientes funcionales conocidos del alcance. No se probó Safari físico ni se realizó una auditoría nueva de rendimiento/WCAG. Las condicionesJSON desconocidas se rechazan, no se implementa un motor de promociones arbitrarias. No se inventan códigos/porcentajes comerciales.
