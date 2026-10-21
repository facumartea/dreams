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
