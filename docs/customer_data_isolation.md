# Registro, carrito y opiniones por UUID — 2026-10-20

## Base y alcance

Rama `codex/customer-data-isolation` desde PR54/8548c59; dependencias PR53 y anteriores conservadas sin merges. Reutilización selectiva PR45/dc28c23: carrito, tests y migración ya aplicada, sin release histórico ni video. PR48/052b224 continúa preservada a través de PR54. Oficial comprobada por API Pages: f44a6069/source461c17d. Backend comercial d5df723d/ec04a35 se conserva.

## Diagnóstico real y bloqueo Auth

La oficial no publicó la excepción de registro y devuelve403 antes de validar. El candidato Auth anterior devuelve400 para cuerpo vacío, pero GET auth/config sigue email_confirmation_required=true: el proveedor aún exige correo. Proyecto nwsmbemwtexmrtpkgxrz/dreams-project ACTIVE_HEALTHY. Consulta agregada:10 cuentas,5 pendientes,2 pendientes creadas en30d; no se muestran correos ni se atribuyen intentos a personas. No se borraron, recrearon ni confirmaron cuentas anteriores. Desactivar Confirm email no resuelve automáticamente esas cuentas; requieren recuperación individual con prueba de control, no coincidencia de correo.

Entorno sin secretos/integración Auth Management ni mecanismo de entrada oculta. Usuario no puede usar el gestor web; no volver a pedir token por chat/comandos/config.toml/archivos ni crear un formulario receptor. SUPABASE_SECRET_KEY/SQL no permiten cambiar Auth config. Sigue pendiente acceso real a Management o recuperación del panel vía GitHub, revisar otros consumidores del proyecto, snapshot y cambio autorizado de mailer_autoconfirm. Signup normal y customer, sin bypass administrativo.

## Carrito

PR45 no está integrada ni desplegada en oficial. La BD sí contiene account_carts y account_cart_operations, ambas sin filas al iniciar. RPC dreams_cart_operation SECURITY INVOKER sólo servicio, SELECT dueño y escrituras directas denegadas a clientes. Se recupera por UUID verificado, precios/stock rehidratados, entradas faltantes señaladas. Operaciones UUID criptográfico+PK por dueño, máximo de cantidades para combinación visitante, cola secuencial, generaciones y revisiones contra respuestas viejas. Firma de contexto impide que una petición de A se aplique a B tras cambiar cookies.

Cliente privado en memoria; sessionStorage sólo operaciones pendientes ligadas al dueño, no precios ni catálogo. Visitante en localStorage. Merge registra su ID antes de retirar visitante. Logout/cambio de dueño purga memoria, cola y recibos; avisa otras pestañas con un evento sin identidad/credenciales. Fallos al comprobar identidad ocultan datos anteriores. Cantidades aún no confirmadas pueden descartarse al cerrar sesión; no se afirma persistencia de operaciones no guardadas. Historial de operaciones no tiene poda: deuda de retención.

GET cart/config con límite120/min independiente, operaciones180/15min; cotización conserva30/15min. Se corrigió consumo accidental del presupuesto de quote por navegación/config. Consumo de carrito al confirmar el recorrido académico sólo si coincide snapshot; no pedidos comerciales ni stock ni pasarela.

## Opiniones y autorización

Servidor obtiene user_id y nombre público desde sesión/perfil; rechaza user_id/user_name/role enviados. API pública no muestra UUID, operation_id ni correo; nombres que contienen @ se muestran como Cliente, sin reescribir registros. Opiniones históricas conservadas sin atribución. Confirmación antes de eliminar; petición JWT limitada más filtro id+user_id, y RLS auth.uid()=user_id. Otro cliente404, visitante401; no basta botón oculto. Admin conserva rutas/políticas de moderación existentes.

Publicación con operación UUID y unique(user_id,operation_id) para reintentos sin duplicación; reutilizar una operación con otro texto devuelve409. Límite de publicación5/hora conservado, doble submit bloqueado. Delete sin datos adicionales y con origen exacto; no se aceptan roles del navegador.

## BD: cambio aplicado y verificado

Migración CLI creada y aplicada como `20261021004927_customer_review_ownership.sql` (versión remota corroborada; archivo renombrado al número real). Añade operation_id nullable e índice único parcial, sin modificar opiniones históricas; política DELETE dueño y grant específico. Retira TRUNCATE de anon/authenticated: ese permiso previo omite RLS y permitía vaciar toda la tabla. Verificado después: ambos has_table_privilege=false, RLS=true, policies Admin DELETE/UPDATE intactas. No opiniones eliminadas ni datos comerciales modificados; cero carritos/operaciones/opiniones al inicio.

Advisors: INFO account_cart_operations sin policies es intencional (sólo RPC de servicio); WARN previos is_dreams_admin SECURITY DEFINER y protección de contraseñas filtradas desactivada quedan fuera del cambio. Referencias: https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy ; https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable ; https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection . No se debilita la política para pruebas.

## Validaciones y límites

Pruebas de API/cliente locales comprueban A/B/visitante, nuevo navegador, merge/replay, response perdida, cantidades/eliminar/vaciar, cambio/logout, respuestas antiguas, errores de identidad, scope UTF-8 inválido y precios servidor. Opiniones: autor de sesión, sin datos privados, A elimina propia, B404/visitante401 por petición directa, rol/autor falsos rechazados, reintento idempotente y payload distinto409. Moderación existente cubierta por suite Admin. No equivalen a sesiones remotas de Supabase.

Recorrido Chromium local con proveedor y productos explícitamente ficticios,390×844/1440×900; capturas y log en docs/evidence/customer-data. No emails ni cuentas reales. Safari/iPhone físico no disponibles. Se mantienen funciones/métodos nuevos y helpers de carrito/confirmación <=20 líneas; contenedores legacy create_app y otras funciones no afectadas permanecen como deuda existente.

| Verificación | Local | Remota real |
|---|---|---|
| Signup normal sin confirmación, customer y sesión | PASS fixtures | BLOQUEADA: Confirm email activo/acceso Management |
| Logout/login y recarga/renovación | PASS fixtures | BLOQUEADA |
| A recupera carrito desde otra sesión | PASS fixtures | BLOQUEADA |
| B/visitante separados y merge una vez | PASS fixtures | BLOQUEADA |
| Autor opinión UUID de sesión | PASS fixtures | BLOQUEADA |
| A elimina propia; B y visitante rechazados por petición directa | PASS fixtures404/401 | BLOQUEADA para A/B reales |
| Moderación Admin conservada | PASS suite existente | BLOQUEADA sin cuenta de prueba Admin |
| Policies/privilegios BD | N/A | PASS introspección, no eliminación con usuario real |
| Errores/reintentos/doble envío/respuestas viejas | PASS fixtures | BLOQUEADA para ciclo autenticado |

## Publicación y rollback

Candidato sólo aislado; oficial no se promoverá antes del ciclo real A/B sin correo. El nuevo backend hereda el Secret seguro existente, no lo lee/copia ni envía al bundle público. Rutas limitadas a Auth/carrito/opiniones; PREVIEW_READ_ONLY sigue activo para otras escrituras, Admin y pagos comerciales. Pages mantiene catálogo/filtros/checkout en backend previo. Preview sin indexación; video fuera de rama.

Rollback de código: conservar oficial f44a6069/461c17d y backendd5df723d; restaurar versión Pages por endpoint rollback si se promueve en otra sesión. No borrar deployments. La BD es aditiva: mantener columna/índice sin borrar datos y, si se revierte la función de eliminación propia, retirar sólo reviews_owner_delete mediante migración revisada. No devolver TRUNCATE a clientes. Auth aún sin cambios: guardar estado previo antes del futuro ajuste y revertir sólo mailer_autoconfirm si corresponde. No rollback ejecutado.

Próxima acción dependiente: acceso seguro a Auth Management y control de dos identidades de prueba; no creación administrativa/SQL como sustituto del signup normal ni atribución por correo. Sin ese acceso, registro real y publicación oficial siguen bloqueados.

## Backend candidato publicado

Worker preview customer-data-review/eb7558bb62454a92a7a8fadd7065e71c, deployment2e099ccd-3d34-44bd-af49-c4ba7b147c7e, fuente9705521eccd5d59d7b686ae7662fa501d6b5636c. Inmutable https://2e099ccd-dreams-perfumes.dreams-perfumes.workers.dev; health200/databaseok, cart/config200 habilitado y reviews200 lista vacía. Bundle2197973bytes SHA2566812adf23bce494c2d19994043a58420b415c626632b0fe8e6a7709b496cbe86. SUPABASE_SECRET_KEY heredado implícitamente de previews_base_config (único Secret por nombre/tipo comprobados), sin lectura ni transferencia de valor. Logs de invocación apagados y query redacted. No configuración comercial/producción modificada.

El release candidato sólo cambia auth_backend_url/source/preview y customer_data=true. Backend principal d5df723d/ec04a35 no cambia. Pages aún pendiente de publicación en este checkpoint. PR55 draft, dependiente PR54, CI en curso; alta real sin correo y datos autenticados siguen bloqueados.

## Primer candidato (histórico; bloqueo de origen corregido en el cierre)

Preview verificada: https://customer-data-review.dreams-perfumes.pages.dev/cuenta.html. Pages b741d630-a80b-40e7-85c2-32febdd624fe SUCCESS/preview, fuente e24d5c54db68c43bc4cb4036c43bad9477517855; backend fuente9705521. Artefacto576563bytes SHA256cbc41cbce65279af093dac95a6bc54ad5a565b42e0a8e355ce4f0a1f4c2e0a6f. CI39524608689 (9705521) y39524717095 (e24d5c5) SUCCESS:197/197, sintaxis67, audit sin vulnerabilidades y builds normal/Auth/Pages. Local196 suite completa antes del último caso,25 focalizadas y8 últimas (incluye proveedor caído503); CI acredita197 del commit desplegado, sin repetir toda la suite local innecesariamente.

| Verificación remota del candidato | Resultado |
|---|---|
| Cuenta/config/me, catálogo y nuevos scripts | PASS200; me null, Confirm email aún requerido |
| Registro vacío/origen ajeno | PASS400 validación /403 origen |
| Formulario inválido/mismatch, pestañas/foco/autofill pseudoestado | PASS390/1440; cero solicitudes de alta |
| Carrito privado anónimo | PASS401 |
| POST opinión y DELETE opinión anónimos | PASS401; no datos escritos/borrados |
| Config carrito y opiniones públicas | PASS200/[] |
| Añadir producto visitante y conservar selección al navegar | PASS localStorage del visitante en origen remoto |
| Cotizar desde nuevo alias / checkout remoto | BLOQUEADA403 por Origin del backend anterior; no se debilita ni se reescribe Origin |
| Admin anónimo | PASS403 |
| Noindex, sin video/credencial servidor en artefacto público | PASS |
| Signup real sin correo, A/B, customer, sesión/logout/login y eliminación ajena autenticada | BLOQUEADA por Auth Management/identidades controladas |

Capturas y log remoto-anónimo guardados por separado; no representan sesiones A/B reales. Safari físico no probado. Body registro vacío se comprobó HTTP por separado, sin identidad/contraseña; durante QA UI se abortaban preventivamente todas las solicitudes de alta. Botón Eliminar usa área táctil44px. Registro de login distingue caída transitoria del proveedor503 de credenciales incorrectas, sin filtrar detalles.

Oficial reconfirmada f44a6069/461c17d; register{}403 y cart/account404 (módulo aún no desplegado), video sólo preview cinematográfica ba6891f4/c8439ac. Código oficial sin despliegue nuevo, DNS y tráfico intactos; BD sí recibió la migración aditiva de seguridad indicada arriba. Pendiente habilitar la cotización del candidato mediante configuración aislada compatible, sin alterar el backend comercial vigente. No promover candidato con ese bloqueo ni antes de QA auténtica. Rollback oficial conservado, no ejecutado.

## Cierre verificado — 2026-10-21

**Estado vigente:** https://customer-data-review.dreams-perfumes.pages.dev/ y /cuenta.html. Pages6a832bb4-b3cd-4be0-bd49-980803f147f8 SUCCESS/preview sirve45d05a7df340d53f3a9ebc76ddc2cb4c5e1049d4. Backend9f5d442a-bc1d-4348-ba56-4c17245ca866 sirve984d3539529ea0f4a7a9b531ea2e593168d13ce1. PR55draft, sin merges. CI39632902575 SUCCESS al commit Pages publicado:197/197, check67, audit sin vulnerabilidades y tres builds. Ajuste de rutas acreditado además por22 tests pertinentes; no se repitió auditoría/suite local sin motivo.

El403 de cotización del primer candidato quedó **corregido**: Pages redirige únicamente cart/quote, checkout/config y las tres rutas presentation al servicio limitado, junto con Auth/carrito/opiniones. Reutiliza el módulo académico existente, sin cambiar su protocolo. Se permite el origen exacto del candidato; no se reescribe Origin ni se modifica configuración del backend productivo. La firma académica se deriva en memoria con propósito y APP_BASE_URL separados de la firma de contexto del carrito. No comparte recibos con la oficial ni depende de copiar otro Secret. Pagos/webhooks/pedidos comerciales y Admin siguen fuera del servicio limitado; backend comercial d5df723d no cambia. El bloqueo documentado arriba corresponde sólo al despliegue anterior.

Artefacto Pages576692bytes SHA256d26655a28548324c9818326a31b50758df1dec4d1f110d43b116e5f6b6e3d07b; Worker2198307bytes SHA25621d61413392618b335f76c8d12c7341c99ed0991c04bc85b4fea08299ea9d8a0. Secret por herencia segura; sin credencial en frontend. Sin video.

| Prueba final | Estado y evidencia |
|---|---|
| Menú móvil, filtros/vacío/limpiar | PASS remoto390/1440 |
| Visitante agrega, cambia cantidades y conserva al recargar | PASS remoto390/1440 |
| Cotización y envío gratis/total | PASS remoto200; bloqueo de origen resuelto |
| Checkout académico una vez, referencia estable tras recarga | PASS remoto390/1440, una petición payment por operación |
| Llamadas a checkout/pagos comerciales durante QA | PASS: cero; rutas interceptadas preventivamente |
| Errores JS/scroll horizontal | PASS: ausentes en ese recorrido |
| Registro vacío pasa guard y origen ajeno rechazado | PASS remoto400/403 (candidato) |
| Registro real sin correo/customer/login/sesión/logout | BLOQUEADA por Confirm email activo y Auth Management ausente |
| Carrito A/B real y opinión/eliminación ajena con JWT real | BLOQUEADA; sólo pruebas locales con fixtures |
| Privadas anónimas y Admin | PASS remoto401/403 |

Referencias simuladas realmente generadas: DREAMS-B11F17132676474F82AF482624AC8404 (móvil) y DREAMS-0386F49551004BF6837213E610E9D408 (escritorio). Capturas/log finales separados con prefijo final-remote en docs/evidence/customer-data. No se enviaron campos de tarjeta ni correos, ni crearon pedidos comerciales. Consulta después:10 cuentas/5 pendientes/0 carritos/0 operaciones/0 opiniones/0 pedidos comerciales; cuentas previas conservadas.

Oficial reconfirmada por API después de QA: f44a6069/461c17d. No deploy oficial, merge, DNS ni tráfico modificados. BD sí recibió la migración aditiva de seguridad documentada, sin borrar datos. Rollback retenido. Siguiente paso único bloqueante: acceso legítimo a Auth Management, revisión de consumidores y cambio autorizado de Confirm email, más dos identidades controladas para el ciclo real A/B. No pedir token por chat/archivos/comandos ni inventar acceso secreto. Publicar oficial sólo después de esa verificación.
