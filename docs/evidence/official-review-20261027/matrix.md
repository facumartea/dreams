# Matriz consolidada — oficial 2026-10-27

No sumar suites solapadas. CI del commit publicado:288 PASS/0 FAIL; check63, audit y tres builds PASS. Los40 tests focalizados están incluidos en288. Matriz Admin201 ejecuciones locales reutilizada sobre el mismo código Admin, más12 comprobaciones locales nuevas: no son pruebas autenticadas remotas. Cada área Admin conserva al menos20 casos distintos (A28/B25/C25/D27/E30/F24), procedencia [matriz anterior](../admin-audit/matrix.md).

HTTP oficial26 PASS, navegador oficial10 PASS, recorridos académicos2 PASS:38 comprobaciones remotas ejecutadas,0 FAIL en esas comprobaciones. W03 usa configuración interceptada y W01 intercepta wa.me/registro auxiliar, explícitos en las filas; no enviar mensajes ni consultas reales. Chromium390×844 táctil/1440×900, no Safari físico. Los rechazos esperados pasan como controles de protección; eso NO significa que el requisito de registro esté resuelto.

Objetivos restantes:1 FAIL (registro) y8 BLOQUEADAS, sin contar esos objetivos como ejecuciones exitosas. Todo dato de tarjeta permaneció vacío en el checkout real; no se envió ni almacenó. Doble clic:1 session/1 payment, referencia persistente y carrito vacío sólo después de resultado firmado válido. Nombre vacío rechazado; primer harness no vació el nombre predeterminado CLIENTE DREAMS y completó una simulación antes del control previsto; corregido el harness, sin cambio del checkout ni pedido comercial.

## HTTP oficial

| ID | Objetivo | Entorno | Esperado | Real | Estado |
|---|---|---|---|---|---|
| H01 | GET /api/health | HTTP oficial anónimo | 200 | 200 | PASS |
| H02 | GET /admin | HTTP oficial anónimo | 403 | 403 | PASS |
| H03 | GET /admin.html | HTTP oficial anónimo | 403 | 403 | PASS |
| H04 | GET /api/admin/products | HTTP oficial anónimo | 403 | 403 | PASS |
| H05 | GET /api/admin/users | HTTP oficial anónimo | 403 | 403 | PASS |
| H06 | GET /api/admin/stats | HTTP oficial anónimo | 403 | 403 | PASS |
| H07 | GET /api/admin/inquiries | HTTP oficial anónimo | 403 | 403 | PASS |
| H08 | GET /api/admin/reviews | HTTP oficial anónimo | 403 | 403 | PASS |
| H09 | GET /api/admin/orders | HTTP oficial anónimo | 403 | 403 | PASS |
| H10 | GET /api/admin/coupons | HTTP oficial anónimo | 403 | 403 | PASS |
| H11 | POST /api/auth/register | HTTP oficial anónimo | 403 | 403 | PASS |
| H12 | POST /api/auth/login | HTTP oficial anónimo | 400 | 400 | PASS |
| H13 | GET /api/account/cart | HTTP oficial anónimo | 404 | 404 | PASS |
| H14 | GET /assets/dreams-hero.mp4 | HTTP oficial anónimo | 404 | 404 | PASS |
| H15 | Fuente /js/admin-console-v3.js | HTTP oficial | 200 y hash igual al commit | 200; hash igual=True | PASS |
| H16 | Fuente /js/admin-product-search.js | HTTP oficial | 200 y hash igual al commit | 200; hash igual=True | PASS |
| H17 | Fuente /js/admin-image-url.js | HTTP oficial | 200 y hash igual al commit | 200; hash igual=True | PASS |
| H18 | Fuente /css/style.css | HTTP oficial | 200 y hash igual al commit | 200; hash igual=True | PASS |
| H19 | Fuente /js/app.js | HTTP oficial | 200 y hash igual al commit | 200; hash igual=True | PASS |
| H20 | Fuente /js/producto.js | HTTP oficial | 200 y hash igual al commit | 200; hash igual=True | PASS |
| H21 | Cuerpo API comprimido rechazado antes de backend | HTTP oficial anónimo, payload mínimo no comercial | 415/no-store | 415/no-store | PASS |
| H22 | Logout anónimo y expiración segura de cookies | HTTP oficial sin sesión real, datos inválidos/exclusivos de QA | 200 | 200; cookies expiradas con HttpOnly/Secure/SameSiteLax=True | PASS |
| H23 | Origen ajeno rechazado | HTTP oficial sin sesión real, datos inválidos/exclusivos de QA | 403 | 403 | PASS |
| H24 | Carrito vacío rechazado por servidor académico | HTTP oficial sin sesión real, datos inválidos/exclusivos de QA | 409 | 409 | PASS |
| H25 | Ticket inválido rechazado | HTTP oficial sin sesión real, datos inválidos/exclusivos de QA | 400 | 400 | PASS |
| H26 | Alta Admin anónima rechazada sin datos de producto | HTTP oficial sin sesión real, datos inválidos/exclusivos de QA | 403 | 403 | PASS |

## Navegador oficial

| ID | Objetivo | Entorno | Esperado | Real | Estado |
|---|---|---|---|---|---|
| W01 | WhatsApp nativo abre con API lenta/fallida y resumen correcto | desktop https://dreams-perfumes.pages.dev | WhatsApp nativo abre con API lenta/fallida y resumen correcto | wa.me interceptado, ningún mensaje; API interceptada | PASS |
| W02 | Carrito conserva producto al recargar; sin overflow | desktop https://dreams-perfumes.pages.dev | Carrito conserva producto al recargar; sin overflow | producto persistido | PASS |
| W03 | Teléfono ausente no crea enlace inválido y mantiene producto/carrito | desktop https://dreams-perfumes.pages.dev | Teléfono ausente no crea enlace inválido y mantiene producto/carrito | config interceptada sin destino; agregar utilizable | PASS |
| W04 | Acceso mantiene labels/autofill y validación de formulario sin alta real | desktop https://dreams-perfumes.pages.dev | Acceso mantiene labels/autofill y validación de formulario sin alta real | registro vacío rechazado en cliente, sin crear cuenta | PASS |
| W05 | Sin errores JS durante el recorrido afectado | desktop https://dreams-perfumes.pages.dev | Sin errores JS durante el recorrido afectado | 0 pageerrors | PASS |
| W01 | WhatsApp nativo abre con API lenta/fallida y resumen correcto | mobile https://dreams-perfumes.pages.dev | WhatsApp nativo abre con API lenta/fallida y resumen correcto | wa.me interceptado, ningún mensaje; API interceptada | PASS |
| W02 | Carrito conserva producto al recargar; sin overflow | mobile https://dreams-perfumes.pages.dev | Carrito conserva producto al recargar; sin overflow | producto persistido | PASS |
| W03 | Teléfono ausente no crea enlace inválido y mantiene producto/carrito | mobile https://dreams-perfumes.pages.dev | Teléfono ausente no crea enlace inválido y mantiene producto/carrito | config interceptada sin destino; agregar utilizable | PASS |
| W04 | Acceso mantiene labels/autofill y validación de formulario sin alta real | mobile https://dreams-perfumes.pages.dev | Acceso mantiene labels/autofill y validación de formulario sin alta real | registro vacío rechazado en cliente, sin crear cuenta | PASS |
| W05 | Sin errores JS durante el recorrido afectado | mobile https://dreams-perfumes.pages.dev | Sin errores JS durante el recorrido afectado | 0 pageerrors | PASS |

## Checkout académico oficial

| ID | Objetivo | Entorno | Esperado | Real | Estado |
|---|---|---|---|---|---|
| P01 | Flujo académico sin tarjeta/pasarela, envío0 y referencia estable tras reload | Chromium desktop oficial | completed simulado, referencia estable, carrito vacío tras éxito, sin datos financieros en POST | PASS; referencia DREAMS-2928FC75FEA54ED5ACFFCA83865EB713; 4 POST académicos;0 POST comerciales;0 pageerrors | PASS |
| P01 | Flujo académico sin tarjeta/pasarela, envío0 y referencia estable tras reload | Chromium mobile oficial | completed simulado, referencia estable, carrito vacío tras éxito, sin datos financieros en POST | PASS; referencia DREAMS-AE1905CD207A450EA077CFEF6E285FAB; 4 POST académicos;0 POST comerciales;0 pageerrors | PASS |

## Objetivos pendientes

| ID | Objetivo | Entorno | Esperado | Real | Estado |
|---|---|---|---|---|---|
| T01 | Registro sin confirmación | Objetivo funcional oficial | Operativo y verificado | POST register403 y mailer_autoconfirm=false; falta Auth Management seguro | FAIL |
| T02 | Login y persistencia de sesión real | Objetivo funcional oficial | Operativo y verificado | Sin credenciales controladas disponibles; no se prueba con hashes ni sesiones ajenas | BLOQUEADA |
| T03 | Logout de sesión autenticada | Objetivo funcional oficial | Operativo y verificado | Sin sesión real; sólo logout anónimo y expiración de cookies verificados | BLOQUEADA |
| T04 | Admin completo con sesión real | Objetivo funcional oficial | Operativo y verificado | Sin acceso Admin real disponible; validación local y guardas anónimas remotas | BLOQUEADA |
| T05 | Guardar producto/imagen y comprobar persistencia real | Objetivo funcional oficial | Operativo y verificado | Backend legacy read-only; no habilitar escrituras sin QA autenticada | BLOQUEADA |
| T06 | Carrito por cuenta e intercambio A–B | Objetivo funcional oficial | Operativo y verificado | PR55 no promovida; visitante sí comprobado | BLOQUEADA |
| T07 | Opiniones propias y rechazo de eliminación ajena remoto | Objetivo funcional oficial | Operativo y verificado | PR55 preservada, faltan sesiones reales | BLOQUEADA |
| T08 | Actualizar dependencias en backend antiguo | Objetivo funcional oficial | Operativo y verificado | Lockfile corregido y proxy oficial mitigado; runtime legacy sin actualizar, no se modifican otros sitios | BLOQUEADA |
| T09 | Permisos con JWT customer real | Objetivo funcional oficial | Operativo y verificado | RLS/server inspeccionados y fixtures válidos; falta cliente real controlado | BLOQUEADA |

## Datos y recuperación

Antes/después:46 productos,0 pedidos,0 opiniones,2 consultas,10 usuarios; mismo stock_digest7a58615dd40e0dcfd898a52aa108b820. Cinco cuentas pendientes, una sin perfil, cero Admin pendientes; sólo inspección. No correos, cobros ni modificación de stock. Rollbackf44a6069 SUCCESS/HTTP200 retenido, no ejecutado.
