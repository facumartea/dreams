# SQLite y excepción docente comunicada

La rúbrica 2026 exige literalmente un backend donde se implemente **SQLlite** y permite Node.js. El almacenamiento actual es Supabase/PostgreSQL. No son equivalentes. El 29/10/2026 el usuario confirmó expresamente en respuesta a la consulta: **«sisi acepto supabase»**, referido a la aceptación del profesor. Se registra como excepción docente comunicada por el usuario; no como cumplimiento literal de SQLite ni como un comprobante emitido directamente por el profesor. No hay un documento docente adjunto. Esta aclaración resuelve la decisión de motor: se conserva Supabase y no se necesita implementar una base SQLite alternativa.

## Alternativas históricas, ya no pendientes de implementación

Se conservan como análisis previo a la confirmación; no se ejecutarán como sustituto de la decisión aceptada:

| Alternativa | Implementación real necesaria | Alcance y limitación |
|---|---|---|
| Excepción explícita | Conservar Supabase y adjuntar aceptación fechada del profesor | No cumple literalmente SQLite; sólo sería defendible con aceptación acreditada. |
| Adaptador SQLite académico local | Node 24 `node:sqlite`, repositorio de productos con esquema/migraciones/validación, consultas parametrizadas y transacciones; catálogo lee SQLite y Admin escribe esa misma base. Auth sigue en Supabase con token validado en servidor y autorización de perfil existente. Tests HTTP reales de alta, edición, persistencia y rechazo customer. | Cumplimiento funcional local demostrable; no sustituiría automáticamente la base productiva. Datos exclusivamente ficticios o exportación pública revisada, nunca clientes, contraseñas ni tokens. Documentar la diferencia de entornos. |
| SQLite/D1 en backend privado de la misma oficial | Definir repositorio de catálogo sobre SQLite/D1, conservar Auth Supabase, políticas de rol verificadas y migración controlada de datos públicos, reconciliación de relaciones y plan de rollback sin escrituras dobles ambiguas | Requiere diseño y validación de compatibilidad, no un cambio urgente de producción. No crear sitios nuevos. La aceptación de D1 como SQLite también se debe acreditar. |

No se agregó una base vacía ni desconectada, no se migró producción ni se reemplazó Auth. **SQLite deja de ser un bloqueo de implementación por la excepción confirmada por el usuario.** La conexión del candidato y la QA remota siguen pendientes y se evalúan por separado; la aceptación de Supabase no resuelve el Secret ni demuestra registro o guardado remoto.
