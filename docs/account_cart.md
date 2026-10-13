# Carrito por cuenta — pendiente de QA autenticada remota

2026-10-13. Rama codex/account-cart-official dependiente de
codex/official-direct-checkout/PR44 (PR42/41/39/38/37/34 conservadas).
Sin merge. Checkout directo de PR43 seleccionado en PR44; video PR40 excluido.
Oficial permanece sin persistencia por cuenta hasta completar QA real.

## Contrato y consistencia

`ACCOUNT_CART_ENABLED=true` requiere clave interna de firma servidor.
GET/POST /api/cart/account usa `request.user.id` de Supabase getUser/refresh,
no metadata editable ni user_id del cliente. Rechaza query IDs y campos
extra; una firma opaca ligada al usuario impide aplicar operaciones de una
cuenta después de que cookies hayan cambiado a otra. API no-store,
mutaciones con Origin exacto y límites. Secret privilegiado sólo servidor.

Migración CLI 20261013032746_account_carts: dos tablas nuevas con RLS y RPC
SECURITY INVOKER/search_path vacío, sólo ejecutable por service_role.
Authenticated sólo SELECT del carrito propio por auth.uid(); sin grants
de escritura ni acceso al registro de operaciones. RPC toma UUID verificado
por servidor; no es una RPC pública autenticada. No changes a Auth/catalogo/
pedidos/stock/políticas existentes. Aplicada mediante integración autorizada.

Operaciones delta/remove/clear/merge/consume serializan con bloqueo de fila.
UUID criptográfico de operación y PK(user,operation) hacen reintentos
idempotentes; reutilización con payload distinto se rechaza. Incrementos
concurrentes se suman; eliminar/vaciar actúan en orden de commit. No envíos
con snapshots completos que sobrescriban otros productos.
Combinación visitante: máximo de cantidades coincidentes, no suma repetida,
con límite stock99 y 30 productos. No añade faltantes/agotados; entries
existentes que dejan de estar disponibles quedan señaladas para revisar,
sin perder el resto ni habilitar Comprar/WhatsApp. No se modifica stock.

Datos catálogo/precios se releen en cada respuesta y cotización. Cliente
usa epoch por cuenta y revisiones monótonas; cola secuencial con IDs guarda
únicamente cantidades pendientes vinculadas al dueño en sessionStorage.
Datos de cuenta no se guardan en localStorage; snapshots UI quedan en memoria.
Visitante conserva carrito local. El merge se persiste antes de consumir
el visitante; reload recupera la cola propia y nunca la transfiere a otra.
Logout aguarda guardado, purga memoria/outbox/recibos y avisa otras pestañas;
focus/pageshow vuelven a verificar identidad. Fallos bloquean checkout y
permiten retry sin limpiar ni duplicar. Sin garantía de guardado de cambios
no confirmados al cerrar el navegador o cerrar sesión desde otro dispositivo.

Confirmación académica verificada usa consume sólo si el snapshot coincide
con carrito actual bajo bloqueo; una adición de otro dispositivo no se borra.
No orders/comercio/stock/pasarela. Tarjetas no en payload ni almacenamiento.
Registro de operaciones no se poda: deuda de retención/crecimiento a definir
sin invalidar reintentos históricos. Datos de cantidades pendientes de una
tab se descartan al logout por privacidad; sólo los confirmados están guardados.

## Verificación realizada

10 pruebas de cliente/API: combinación, segunda instancia, logout/cambio de
cuenta, respuesta perdida tras commit/reload, cantidades rápidas/vaciado,
respuesta vieja de dueño anterior, precios/faltantes, Origin/scope/IDs,
validación payload y lecturas de sesión sin agotar límite de login.
Las lecturas GET /auth no consumen el límite de mutaciones; los intentos
POST de login siguen limitados. Pruebas locales Chromium390/1440 con dos
sesiones fixture y un visitante verificaron UI, nuevo navegador, persistencia,
logout, aislamiento, retry tras respuesta perdida, eliminar/vaciar, sin
pageerrors/overflow. Son fixtures, NO sesiones remotas Supabase.

SQL real dentro de transacción revertida verificó add/replay/merge/stock/
consume obsoleto, RLS propia/ajena y rechazo de UPDATE/RPC autenticados.
Cero filas quedaron; no órdenes ni stock cambiados. No se crearon sesiones
ni se alteraron cuentas reales para esta comprobación SQL.
Advisors: dos WARN preexistentes (helper admin SECURITY DEFINER y protección
de passwords filtradas apagada); nuevo INFO operations RLS sin policies es
intencional por uso server-only/sin grants. No nueva exposición pública.
https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy

## Bloqueo de promoción

Usuario autoriza crear dos cuentas exclusivas sin admin, contraseñas fuertes,
sin emails ajenos/confirmaciones inventadas. Integración disponible no tiene
Auth Admin; entorno WORK sin SUPABASE_SECRET_KEY ni gestor con sesiones.
Anonymous sign-in existente deshabilitado: NO habilitado para eludir bloqueo.
No se crearon cuentas ni contraseñas ni se tocaron credenciales admin.

Acceso requerido: configuración servidor segura de SUPABASE_SECRET_KEY del
proyecto nwsmbemwtexmrtpkgxrz accesible al proceso de QA y un mecanismo de
identidades de prueba aprobado/controlado (o dos cuentas de prueba existentes
con login mediante gestor seguro). La clave Worker existente es no recuperable,
no se extrae mediante endpoints ni SQL. No solicitar secretos por chat.
Este WORK sigue fijado a su configuración, sin API de restart/reconnect.

Antes de activar en oficial: dos sesiones reales, recuperación otro browser,
logout/login/cambio de cuenta, RLS/IDOR real HTTP, error/replay/carreras, precios,
productos no disponibles, consume académico y menús/filtros/contactos/Admin.
La preview de esta rama permite examinar UI y bloqueo anónimo, no sustituye
esta matriz. Publicación oficial debe excluir esta rama mientras esté bloqueada.

QA remota visitante inicial detectó que inicializar sin sesión eliminaba
el recibo académico. Corregido: purgar recibos sólo al salir/cambiar dueño
o al encontrar outbox privada de una sesión ausente. Nueva regresión del
visitante conserva intent/receipt. 134tests/check50/builds correctos; nuevo
deploy/QA remota se registran después. Esa prueba no valida sesiones reales.

## Checkpoint remoto

Preview https://account-cart-review-dreams-perfumes.dreams-perfumes.workers.dev/,
fuente736edfdcdc367e7e77040262098901f87b950a40, deployment
5a6b0076-467d-42db-add5-8af0e188ac7d (tag134-tests). PR45 abierta,
CI38343943255 SUCCESS134tests/check50/audit/builds. Secrets existentes de
Supabase heredados y firma interna propia nueva para este entorno, sin rotar
los entornos anteriores. Publicación Workers, no Pages ni producción.

QA remota **visitante**, Chromium390/1440, tras corregir recibo: catálogo46,
menú/Escape, búsqueda vacía/filtros/reset, carrito+/−/contador/persistencia,
envío0/WhatsApp correcto sin mensaje, Tarjeta sin canarios en red/storage/
consola, doble clic y pérdida de respuestas inyectadas, confirmación/recarga
estable/carrito vacío inválido bloqueado. Sinpageerrors/overflow. Health200,
config account_cart:true, GETaccount anónimo401. NO comprobaron persistencia
por usuario ni aislamiento con sesiones reales. Capturas
/workspace/dreams-account-evidence/remote-*.png y local-*.png.

Fuente local/fixture de dos cuentas pasó; no cuentas remotas creadas ni
contraseñas generadas. SQL final0carts/0operations/0orders/46productos y hash
stock7a58615dd40e0dcfd898a52aa108b820. Admin mismo correo/UUID/rol.
Oficial Pagesac755bbe/c83b148 y Workerprincipal f73d5087 al100% confirmados.
Previewacademic-review con video no reemplazada. Sin DNS/merge/credenciales
Auth ni datos comerciales modificados. Advisors/errores anteriores permanecen
limitaciones, no afirmar cobertura Auth o ausencia global de runtime errors.

No hay publicación oficial de carrito por cuenta. Próxima acción concreta:
habilitar al proceso una vía segura a Supabase Auth Admin y las identidades
de prueba controladas, crear/probar dos cuentas sin admin y completar matriz
remota antes de activar. No modificar Auth ni inventar confirmación de correo.

Revisión final: reconciliar una cotización actualiza precio/stock sin reducir
cantidades guardadas; mantiene unavailable si el stock cayó por debajo de
lo solicitado, bloqueando Comprar/WhatsApp. Regresión ampliada/134tests/check50/
builds pasaron; no prueba autenticada remota.

Último deploymentadc45355-a812-4827-8e61-8f0082e10b86, fuente53572ba,
tag53572ba, revisión de stock. Actualización de dependencia basePR44/b33
limita diff a documentación; no merge de PRs GitHub ni otro cambio funcional.

QA remota visitante390/1440 repetida sobre53572ba pasó; CI del checkpoint
1507b81 (código idéntico)/38344683228 SUCCESS134tests/check50/audit/builds.
PR45 mergeable/clean tras resolver únicamente documentos de dependencia.
Carrito autenticado remoto sigue NO VERIFICADO; oficial no lo incluye.
