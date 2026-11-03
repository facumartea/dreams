# Secret reemplazado por el usuario: resultado real ·29/10/2026

El usuario informó haber reemplazado `SUPABASE_SECRET_KEY`. La API confirma versión nueva `0968d006-3f9a-4629-b81f-32d4c2632ce1`, deployment `7f754fe2-c902-4b38-98a5-6571eafa87aa`, anotada como actualización del Secret el29/10/2026 a15:53:52UTC. Es el mismo Worker `dreams-official-backend`, Production/default. No se leyó ni copió su valor.

La sonda privada heredó ese binding del MISMO Worker mediante referencia de versión. Primero `2f3178eb`/`9db4eab1`; se extendió la ventana acotada por la propagación del Cron en `36319df7-8db4-49d8-b3c0-b632227f7be2`, deployment `d7305b8f-f3c3-446e-a6e0-278763362117`. No se heredó la clave antigua rechazada de939c179c. No se publicó Pages ni se habilitaron URLs públicas del candidato.

[Reporte escalar, sin credenciales](credential-replacement-20261029.json). Resultado de la última muestra recuperada16:09:32UTC:

- Binding presente; clasificación `modern_secret`; URL de proyecto coincide con `nwsmbemwtexmrtpkgxrz`.
- Persisten espacios internos: `any_whitespace=true` y `surrounding_whitespace=false`.
- La bandera histórica `non_ascii=true` se define como carácter fuera de ASCII imprimible. En esta muestra, caracteres y bytes UTF-8 son ambos42: por esa combinación se identifica al menos un control ASCII, sin mostrar posición ni carácter. No se atribuye la causa al celular, navegador o SDK sin evidencia de origen.
- Lectura mínima directa: **fallo de transporte**, sin respuesta HTTP acreditada. SDK: `status:0`, `succeeded:false`. No presentar este resultado como otro HTTP401: ahora no hay una respuesta upstream válida.
- La correspondencia clave/proyecto sigue `not_verified`. Tampoco se observó transporte SDK íntegro en esta ejecución fallida; la prueba anterior de SDK sin truncamiento se conserva por separado.
- El Cron produjo tres muestras durante la propagación/ingestión; se retiró al recuperar el primer conjunto de resultados, con `schedules=[]` confirmado. La ventana también vence automáticamente. No volver a ejecutarlo hasta otro cambio real.

La aplicación no recibió una consulta autenticada QA ni creó cuentas/productos en remoto. El mecanismo de QA nueva está preparado localmente, no activado: exige lectura directa y SDK200 antes de cualquier alta. No hay reset o modificación de Auth, roles, credenciales Admin, stock, pedidos, DNS u otros sitios.

## Única corrección necesaria para la conexión

En el proyecto Supabase indicado, **Secret keys → default**, usar el botón para copiar el valor servidor completo y cargarlo directamente en **Cloudflare → dreams-official-backend → Production/default → SUPABASE_SECRET_KEY**, tipo Secret; guardar/desplegar sólo el Worker privado. No copiar desde capturas, escribir a mano, quitar caracteres para reconstruirlo ni pegarlo en chat. No crear, revocar o borrar claves.

Para QA Admin sigue faltando una sesión legítima existente; se pidió `DREAMS_QA_ADMIN_PASSWORD` como Secret protegido del mismo privado, con la contraseña actual, no una nueva. La conexión Supabase tiene prioridad. No usar `DREAMS_ADMIN_NEW_KEY_PASSWORD` como si fuera la actual ni crear administradores adicionales.

La oficial permanece restaurada en Pagesa3184576/frontend7b302cf; que responda no resuelve al candidato. La promoción sigue bloqueada hasta lectura válida y QA real necesaria. No generar otro ZIP final, por instrucción vigente.

## Acceso Admin cargado después de la sonda

Se verificó presencia de `DREAMS_QA_ADMIN_PASSWORD`, tipo Secret, en versión activa `4e3d734f-a839-4c5c-9b45-afc2dad88741`, deployment `0b571bac-d239-4482-a167-0c5e32a18936`,100%, tras carga del usuario16:15:23UTC. No se leyó ni usó su valor. El historial no muestra otro reemplazo Supabase posterior a0968d006: no se repite el diagnóstico por añadir sólo el Secret Admin.

El usuario autorizó expresamente cerrar sesiones y retirar mecanismo temporal y Secret Admin al terminar la QA. Está pendiente ejecutarla después de resolver Supabase; no afirmar Secret retirado mientras siga cargado. No volver a pedir la contraseña ni cambiarla.
