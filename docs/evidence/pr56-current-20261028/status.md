# Acceso existente revisado; intervención mínima — 2026-10-29

SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.

Continuación desde 2b8dcc1, sin repetir CI, matrices, sonda fallida ni publicaciones. Ejecutor operativo y checkout limpio comprobados. Cloudflare conectado respondió GET secrets 200: SUPABASE_SECRET_KEY/secret_text presente en dreams-official-backend. La integración ofrece PUT del Secret creando versión; no hace falta pedir token Cloudflare para esa operación. No se probó escritura con un valor ficticio ni se cambió ningún binding.

Entorno observado actual/ready: SUPABASE_SECRET_KEY protegido y limitado a nwsmbemwtexmrtpkgxrz.supabase.co; su representación local no es una clave servidor exportable (ni modern secret ni JWT). SUPABASE_ACCESS_TOKEN, CLOUDFLARE_API_TOKEN y DREAMS_QA_ADMIN_PASSWORD ausentes. No se mostraron valores, fragmentos ni headers. Supabase conectado sólo expone claves públicas, no lectura de claves servidor; no hay herramienta de navegador autenticado para copiar desde el dashboard. No usar la contraseña destinada a reset como contraseña Admin actual.

La petición anterior de DOS tokens queda reemplazada por UNA intervención concreta: desde Supabase del proyecto nwsmbemwtexmrtpkgxrz copiar una Secret API key de servidor existente completa y cargarla directamente en Cloudflare > Workers & Pages > dreams-official-backend > Settings > Variables and Secrets > Production/default > SUPABASE_SECRET_KEY, tipo Secret; guardar/desplegar sólo ese Worker privado. Nunca pegarla en chat ni reutilizar capturas. No crear/rotar/revocar claves. No ejecutar el reparador de gestión preparado, cuya creación aditiva requiere explicar primero su necesidad.

Después de que el usuario indique carga terminada, continuar sin nueva autorización: observar versión nueva, ejecutar lectura directa y SDK desde candidato, confirmar proyecto, registro normal A/B sin confirmar email, login/sesión/logout, carrito y ownership de opiniones; QA Admin sólo con sesión legítima del Admin existente, sin creación ni cambio de contraseña. No afirmar acceso Admin disponible. Mantener candidato desconectado de oficial hasta QA necesaria acreditada. Rollback a3184576 conservado; ninguna publicación ni otro sitio modificado en esta tanda. Pruebas nuevas: sólo presencia y capacidades; CI209/360 tests previo conservado. Progreso funcional sin variación: reparación de valor pendiente, QA remota/publicación bloqueadas.

# Estado real y pendientes de PR #56

Actualizado el 28 de octubre de 2026. No se ejecutaron nuevamente las matrices acreditadas ni la sonda remota del Secret sin un cambio de versión.

## CI y código servido

- Fallo solicitado: commit `9192d32`, CI #207 / `40723786114`, detenido en audit por qs 6.16.0. Ya corregido en `6f54b0824c269d1435f93f0717d465a97c38537e` con qs 6.16.1; CI #208 / `40724326686` SUCCESS: 355 tests, sintaxis, audit y cuatro builds.
- Frontend oficial: Pages `a3184576-4390-4a71-9205-d9269bd7dfe7`, fuente `7b302cf6b1896cfe500a0643290646b3086cb082`, rama técnica `codex/cloudflare-hosting-migration`.
- Backend usado por ese frontend: pin inmutable `d5df723d-e1f1-4889-ae5b-e79ebfd131cd`, fuente `ec04a35812d044e57196c6a1ca55232e723ff60c`. Verificado contra `pages/official-release.json` del commit servido, no contra el archivo candidato del checkout.
- Backend privado candidato: versión activa y última `62f6bd7c-52a0-4ebb-861d-cfc9116b6286`, deployment `82492c72-295f-412e-82c0-11285034bd67`, código de diagnóstico `29ee9eae72f27e9ee067b270c674804dba3f0f8f`. No recibe el tráfico oficial. El binding `SUPABASE_SECRET_KEY` no cambió desde el diagnóstico con espacios internos/401. Cron sigue vacío; no se repitió sonda ni deployment.

## Estado de los objetivos

| Objetivo | Estado real | Evidencia / dependencia |
|---|---|---|
| Registro oficial | FAIL en última evidencia remota | 403 del guard legacy; el mismo backend inmutable sigue servido. No se repitió un caso idéntico ni se creó una cuenta administrativa como bypass. |
| Registro del candidato y perfil customer | BLOQUEADO remoto | Corrección y pruebas de fixtures acreditadas; candidato sin conexión válida. La configuración Auth ya resuelta no se vuelve a modificar. |
| Login, sesión, refresh y logout reales | BLOQUEADO | Falta candidato sano y sesión real controlada; los tests y fixtures no se presentan como QA remota. |
| Admin y guardado real | BLOQUEADO | No se usa ni cambia la contraseña del administrador. Se ofreció Secret temporal `DREAMS_QA_ADMIN_PASSWORD` en el privado como mecanismo de QA interna sin endpoint público. No está acreditado cargado. |
| Carrito A/B, opiniones propias, rechazo customer | BLOQUEADO remoto | Pendientes T06/T07/T09 de la matriz anterior; conservar resultados locales acreditados. |
| UI Admin A–F | PASS local acreditado | A28/B25/C25/D27/E30/F24, 201 ejecuciones; cada área supera 20 casos distintos. Admin no cambió en esta tanda. No se repitieron casos por rutina. |
| Checkout académico y WhatsApp | Evidencia anterior conservada | No se modificaron ni se declaran recorridos nuevos. Compatibilidad del candidato pendiente de prueba autenticada / conexión válida. |
| Dependencias del backend en tráfico | Pendiente de publicación verificada | Un lockfile y CI corregidos no actualizan el bundle legacy desplegado. |

## Trabajo independiente realizado

- Auditoría AST de 19 archivos de producción relevantes: 284 funciones, cero funciones de más de 20 líneas tras extraer `complete_registration` de `submit_registration` (antes 21 líneas). No se reescribe la factory Express histórica ni se atribuye este chequeo al árbol completo.
- Los siete tests existentes de registro en navegador simulado pasaron tras esa extracción. No hay cambio funcional de autenticación ni redirección antes de una sesión real.
- Build de Pages del candidato PASS, sin publicación.
- Reparación automática acotada en `scripts/repair-official-secret.mjs`, con cinco tests nuevos PASS: falta de credenciales detiene sin IO; transferencia privada sin valores en resultados; rechazo de clave inválida; creación adicional sin revocar; valor malformado rechazado sin quitar espacios.
- Credencial configurada del entorno: una lectura mínima al proyecto esperado dio 200. No tiene formato exportable de Secret API key, JWT ni clave temporal: la conexión suministra la credencial para ese destino mediante el gestor seguro. Esto NO acredita ni repara el binding del Worker.
- Se verificaron las herramientas disponibles y se buscó capacidad de gestión mediante Plugin Management. Supabase conectado sólo expone lectura de claves públicas; no entrega ni crea claves secretas de servidor. Cloudflare conectado puede escribir Secrets, pero la CLI no dispone de su token. No se extrajeron tokens de las integraciones ni se utilizaron hashes, Vault, archivos secretos o sesiones ajenas como alternativa.
- Intento del reparador con el entorno actual: `missing_secure_management_credentials`, detenido antes de requests o cambios. No se afirma que el Secret haya sido corregido.

## Alternativa anterior de gestión — REEMPLAZADA por carga directa en panel

El usuario indicó que el agente debe hacer el reemplazo, en lugar de copiar él la clave entre dashboards. Queda autorizado; la limitación actual es de capacidades y credenciales de gestión, no de permiso del usuario.

No solicitar estos dos tokens como intervención mínima. La instrucción vigente es la carga directa descrita arriba. La alternativa histórica era, en los **Secrets protegidos de este entorno**, sin chat ni repositorio:

1. `SUPABASE_ACCESS_TOKEN`: token de https://supabase.com/dashboard/account/tokens con acceso al proyecto y gestión de claves (API `secrets:read` / `secrets:write`); destino autorizado `api.supabase.com`.
2. `CLOUDFLARE_API_TOKEN`: token de https://dash.cloudflare.com/profile/api-tokens con Workers Scripts: Edit para la cuenta `9f3d7af60fcb0c2b4fff8570843588f9`; destino `api.cloudflare.com`.

Avisar sólo que quedaron habilitados. El agente comprobará readiness y ejecutará `node --use-env-proxy scripts/repair-official-secret.mjs --apply` sin pasar valores en argumentos. El script reutiliza una clave de servidor dedicada `dreams_official_backend` o crea una adicional sin revocar ninguna; valida una lectura de origen y escribe sólo `SUPABASE_SECRET_KEY` en el Worker privado Production/default.

La lectura de origen por sí sola NO permite publicar: después se debe probar desde la nueva versión del backend privado, completar QA autenticada y cumplir el guard de publicación. Si las credenciales de gestión no se habilitan, el agente no tiene una vía automática disponible con estas conexiones; no debe afirmar reparación ni solicitar secretos por chat.

No se cambiaron Auth, RLS, credenciales o roles Admin, datos comerciales, DNS, otros sitios ni previews. Rollback oficial a3184576 conservado. DEPLOY OFICIAL REALIZADO EN ESTA TANDA: NO. OTROS SITIOS CREADOS O MODIFICADOS: NO.
