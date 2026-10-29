# SQLite: discrepancia pendiente

La rúbrica 2026 exige literalmente un backend donde se implemente **SQLlite** y permite Node.js. El almacenamiento actual es Supabase/PostgreSQL. No son equivalentes a efectos de esa consigna. Se preguntó por aceptación explícita del profesor; aún no hay evidencia de excepción.

Alternativas concretas, sin perder datos ni romper Auth:

| Alternativa | Implementación real necesaria | Alcance y limitación |
|---|---|---|
| Excepción explícita | Conservar Supabase y adjuntar aceptación fechada del profesor | No cumple literalmente SQLite; sólo sería defendible con aceptación acreditada. |
| Adaptador SQLite académico local | Node 24 `node:sqlite`, repositorio de productos con esquema/migraciones/validación, consultas parametrizadas y transacciones; catálogo lee SQLite y Admin escribe esa misma base. Auth sigue en Supabase con token validado en servidor y autorización de perfil existente. Tests HTTP reales de alta, edición, persistencia y rechazo customer. | Cumplimiento funcional local demostrable; no sustituiría automáticamente la base productiva. Datos exclusivamente ficticios o exportación pública revisada, nunca clientes, contraseñas ni tokens. Documentar la diferencia de entornos. |
| SQLite/D1 en backend privado de la misma oficial | Definir repositorio de catálogo sobre SQLite/D1, conservar Auth Supabase, políticas de rol verificadas y migración controlada de datos públicos, reconciliación de relaciones y plan de rollback sin escrituras dobles ambiguas | Requiere diseño y validación de compatibilidad, no un cambio urgente de producción. No crear sitios nuevos. La aceptación de D1 como SQLite también se debe acreditar. |

No se agregó una base vacía ni desconectada. No se migró producción ni se reemplazó Auth. Antes de implementar una alternativa debe quedar claro cuál será el sistema evaluado y qué acepta el profesor. Mientras tanto, este requisito es **NO CUMPLE** y bloquea afirmar entrega completa.
