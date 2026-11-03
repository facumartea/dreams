# DREAMS — recuperación de hosting

Comprobación de sólo lectura: 2026-10-06 UTC. Este documento prepara una recuperación; **no acredita un rollback operativo ni autoriza reactivar servicios o cambiar tráfico**.

## Evidencia actual

- PR34 abierta, rama `codex/cloudflare-hosting-migration`; commit revisado `ae7ae380dea17b55506d5c6559aae96d1c3e2a90`. CI del SHA exacto SUCCESS: [37532206512](https://github.com/facumartea/dreams/actions/runs/37532206512), 89/89 tests y build Workers correcto. No se repitieron tests/build acreditados: esta tanda sólo modifica documentación.
- Wrangler 4.147.0 `whoami`: no autenticado. El gestor del entorno y el proceso no tienen token/cuenta Cloudflare ni clave servidor Supabase. No se reinició OAuth ni se usó una cuenta temporal. Secretos, triggers y versiones remotos de Workers siguen sin inspeccionar. No hay URL ni commit desplegado de preview.
- Railway project `f375bb47-59c8-4cc1-b0d1-4d83ecae5780` (Dreams-perfumes), environment `39886077-e963-4fec-b3aa-b0e5d38908dd` (production), service `c5780bbd-4030-4319-a714-1bc0f564e353` (dreams): API `environment_status` devuelve **offline**, sin deployments activos.
- `list_deployments` devuelve los cinco últimos en **REMOVED**, todos con `canRollback=false`, `canRedeploy=true`. El más reciente es `ca4f7bb2-eb63-476f-b370-da25e4a5b5e0`, commit main `4655b0cbdcec8ad2aade4cdde03ef60b22652bf1`, eliminado el 2026-09-25. Poder reconstruir no demuestra que sea seguro, saludable o gratuito.
- GET `https://dreams-perfumes.up.railway.app/`, `/api/health` y `/api/products`: **404**, JSON de Railway `Application not found`, no una respuesta de DREAMS. No se hicieron solicitudes mutantes.
- `describe_service` conserva un puntero latestDeployment a un FAILED de agosto; la lista cronológica y el estado activo son la evidencia vigente. La palabra `live` de configuración indica que el recurso existe, no que la aplicación esté online.
- Existe patch pendiente `f00657a9-471c-45e7-9fe2-b5c671d3226a`, creado el 2026-08-29: healthcheckTimeout 180. No se aceptó, descartó ni mezcló con esta recuperación.

## Destino de recuperación propuesto

Railway histórico, IDs y dominio anteriores, con el bootstrap Node de PR34 fijado a `ae7ae380dea17b55506d5c6559aae96d1c3e2a90` (o un SHA posterior de la misma implementación con CI verde). Es una **restauración por nuevo deployment**, no rollback de un deployment eliminado. La fuente actual sigue `main`; no se cambió.

No redeployar el último artefacto de main: el diff comprobado muestra que su bootstrap llama `seed_database`, mientras PR34 lo retira y detecta la columna real `marca`. Reutilizar main podría reescribir datos administrados y recuperar código incompatible. Tampoco reejecutar un seed manual.

Configuración necesaria antes de restaurar:

- Node 24, pnpm 11.19.0, instalación frozen-lockfile; `railway.toml` usa RAILPACK, `node server/server.js`, health `/api/health` y timeout 120. Revisar precedencia del patch 180 antes de aplicar cambios; no aplicar todo el patch a ciegas.
- Puerto HTTP 8080 (dominio existente apunta a 8080), NODE_ENV=production. Conservar SUPABASE_URL del proyecto `nwsmbemwtexmrtpkgxrz` y su SUPABASE_SECRET_KEY servidor vigente. Sólo se comprobaron los nombres de las 16 variables del servicio; **no sus valores, validez o correspondencia al proyecto**. Revisar mediante panel seguro antes del deploy; no exportar secretos a Git ni chat.
- APP_BASE_URL y APP_ORIGINS deben cubrir el dominio real de recuperación y conservar los orígenes vigentes necesarios. CONTACT_EMAIL/WHATSAPP_NUMBER deben conservar los datos reales. No reutilizar ADMIN_PASSWORD/ADMIN_EMAIL para provisioning: PR34 no crea administradores al arrancar.
- Mantener CHECKOUT_SCHEMA_READY=false, DEMO_AUTO_CONFIRM_EMAIL=false y CHECKOUT_SHOW_TEST_DATA=false durante validación. Demo también escribiría pedidos si se habilita checkout. Habilitar operaciones comerciales sólo después de comprobar por canal seguro el proveedor, credenciales, destinos de webhook y autorización correspondientes.
- No cambiar Supabase Auth/RLS/tablas, ni adjuntar/eliminar volúmenes por esta recuperación. El servicio describe cero volúmenes montados; no es necesario provisionar almacenamiento para este runtime.

## Impacto y procedimiento pendiente

1. **Antes de reactivar:** presentar para aprobación el nuevo build y la instancia Railway en sfo con una réplica (configuración actual), consumo de CPU/memoria/red y cargos según el plan vigente. No hay estimación monetaria verificada ni presupuesto aprobado. Revisar límites/plan en el panel de facturación; un servicio offline no permite inferir el costo futuro. No provisionar, desplegar ni modificar producción para obtener esa estimación.
2. Con autorización específica, revisar el patch existente por separado y fijar la fuente de este servicio/environment al SHA verificado de PR34. La operación de conectar fuente puede disparar build inmediatamente y puede afectar todos los environments; usar staging limitado al environment y revisar el conjunto exacto antes de aceptar. No seguir main ni commits nuevos sin verificación.
3. Revisar variables y destinos sin imprimir valores, mantener compras deshabilitadas durante el smoke, ejecutar el deployment autorizado y guardar ID, SHA, logs sanitizados y estado terminal **SUCCESS**. No declarar listo si sólo está QUEUED/BUILDING o vuelve a REMOVED.
4. Comprobar por HTTP y navegador el dominio Railway existente: health dependencias 200, catálogo real, detalle/assets/imágenes, carrito/quote sin pedido, Admin anónimo rechazado, cookies/orígenes/no-store. Auth/Admin de lectura requieren cuentas de prueba existentes con perfil; no registrar usuarios, enviar correos, guardar productos ni generar pedidos. Registrar fallos preexistentes de imágenes sin sustituciones.
5. Sólo tras SUCCESS y smoke remoto puede llamarse respaldo operativo. Registrar su SHA/URL y repetir health inmediatamente antes de una futura recuperación. Si se requiere cambiar DNS/tráfico, presentar los registros web y TTL concretos para autorización, conservando MX/TXT y todas las URLs Auth vigentes. Hoy no existe export de DNS ni hostname de producción Cloudflare confirmado; no inventarlos.

**Evidencia de ejecutabilidad actual:** acceso Railway de lectura válido, IDs/fuente/variables por nombre disponibles, API permite reconstruir artefactos históricos; bootstrap Node compatible y CI acreditados en PR34. **Evidencia aún faltante:** presupuesto/aprobación, valores de configuración verificados, nuevo deployment SUCCESS del SHA seguro y smoke remoto. Por eso la recuperación está **diseñada, NO ejecutada y NO comprobada como operativa**. Los artefactos históricos reconstruibles no satisfacen ese requisito.

## Recuperación dentro de Cloudflare

Después de tener una versión realmente publicada y verificada, conservar Worker/environment, account ID, version ID, SHA, URL, bindings y configuración por nombre. No guardar valores secretos. Una versión anterior sólo sirve si pertenece al mismo Worker/environment y conserva bindings/secretos compatibles; probar la recuperación en preview antes de aprobar producción.

Wrangler 4.147.0 acredita la sintaxis `wrangler rollback [version-id] --env <environment>` mediante `--help`; no acredita permisos ni disponibilidad remota. Usar `pnpm exec wrangler rollback <VERSION_ID_VERIFICADO> --env preview` sólo para una versión conocida de preview. Para producción se requiere la aprobación correspondiente y el ID comprobado de ese Worker. No hay hoy version ID verificado ni rollback Cloudflare probado.

Después del rollback comprobar deployment/version activa, health, catálogo, cookies, Admin y errores de runtime. No revertir datos Supabase: esta migración no introduce DDL ni autoriza pérdida de pedidos/usuarios. Volver al 404 de Railway o a una versión Workers nunca validada no es recuperación aceptable.

## Desbloqueo de preview

Configurar desde el gestor seguro de este entorno CLOUDFLARE_API_TOKEN restringido a la cuenta destino (Workers Scripts edit y logs/tail read) y CLOUDFLARE_ACCOUNT_ID real; sin permisos DNS ni Global API Key. Alternativamente completar OAuth cuando el usuario esté disponible, sin repetir intentos caducados.

Con acceso, inspeccionar cuenta, Worker `dreams-migration-preview`, triggers, bindings y **nombres** de secretos. Antes de configurar SUPABASE_SECRET_KEY verificar que la API key backend corresponda al proyecto `nwsmbemwtexmrtpkgxrz`; su tipo/valor real todavía no se pudo comprobar. Configurar Secret mediante panel Cloudflare o entrada interactiva oculta, nunca chat/argumentos/versionado. Revisar acceso restringido a testers antes de exponer endpoints mutantes a la DB comercial. Seguir [cloudflare_migration.md](cloudflare_migration.md) para URL/orígenes reales y deploy. No ejecutar pagos/pedidos/correos reales para acreditar QA.

Matriz remota de Workers: **BLOQUEADO** catálogo/productos/imágenes/carrito, API/Supabase, Auth/sesiones, permisos/Admin, responsive/identidad, runtime/logs; no hay preview. Checkout/webhooks: **PENDIENTE** entorno seguro; recuperación de contraseña UI: **NO IMPLEMENTADA**, no atribuir el faltante a una prueba fallida de hosting.
