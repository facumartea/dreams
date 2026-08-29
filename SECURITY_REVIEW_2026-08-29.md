# Revisión de seguridad y plan de mejora — DREAMS

Fecha de corte: 2026-08-29  
Alcance: repositorio, API Express, Supabase/Postgres, autenticación, Admin, frontend público, Railway y requerimientos visuales nuevos.  
Entorno revisado: producción en `https://drams-production.up.railway.app` y código del commit `08e15128ca28fe6742536043a7de8b90c2d82ede`.

## Límites de esta revisión

- Se inspeccionó código, configuración, esquema, políticas RLS, advisors, dependencias, respuestas HTTP y estado del deploy.
- No se ejecutaron ataques destructivos, carga intensiva, modificación de datos reales ni pruebas con una cuenta Admin real.
- No se leyeron ni copiaron valores secretos. La revisión sólo confirmó nombres, alcance y uso de variables.
- Esta tanda documenta y prioriza. No cambia todavía datos, dominio, variables ni producción.

## Arquitectura real

- Frontend multipágina en HTML, CSS y JavaScript sin framework.
- Backend Node.js 24 con Express 5.
- Supabase Auth y Postgres como fuente de verdad.
- El navegador usa cookies `HttpOnly`; la clave privilegiada de Supabase queda en el servidor.
- Railway construye y despliega `main`; `/api/health` comprueba API y base de datos.

## Controles que ya están bien implementados

- `helmet` con CSP restrictiva, HSTS, `nosniff`, bloqueo de framing y política de referrer.
- Cookies `HttpOnly`, `Secure` en producción y `SameSite=Lax`; respuestas de auth con `no-store`.
- Validación server-side de credenciales, IDs, cantidades, precios, stock, longitudes y URLs.
- Salida dinámica escapada y URLs de imagen limitadas a HTTPS o assets locales.
- Roles obtenidos desde `profiles`, no desde metadatos editables del usuario.
- Endpoints Admin protegidos por sesión y rol.
- Rate limits específicos para auth, consultas y carrito.
- RLS activo en todas las tablas públicas.
- Dependencias de producción sin vulnerabilidades conocidas en `pnpm audit` al momento de la revisión.
- Errores públicos genéricos y logs reducidos que no copian respuestas internas del proveedor.

## Hallazgos priorizados

No se confirmó una vulnerabilidad crítica explotable durante esta revisión. Eso no significa riesgo cero: faltan pruebas autenticadas y de abuso controlado.

### Altos

1. **Ciclo de vida del usuario Admin ligado al arranque.** `seed.js` busca/crea el Admin desde variables de Railway cada vez que inicia el servidor. No resetea una contraseña existente, pero mezcla una tarea privilegiada de una sola vez con el arranque normal. Debe separarse en un comando manual y auditable.
2. **Falta una segunda barrera para operaciones Admin.** No hay MFA, reautenticación reciente ni auditoría de cambios. El impacto de una sesión Admin robada sería alto, especialmente porque el borrado de productos es permanente.

### Medios

1. **No hay verificación explícita de `Origin`/`Referer` en mutaciones con cookie.** `SameSite=Lax` reduce gran parte del CSRF, pero no sustituye una política explícita y testeada; también queda el caso de login CSRF.
2. **Permisos SQL demasiado amplios para `anon` y `authenticated`.** Las tablas públicas tienen grants generales y RLS evita hoy el acceso indebido. Conviene revocar por defecto y conceder sólo los `SELECT` realmente públicos, como segunda barrera.
3. **El email de acceso Admin se expone públicamente.** `/api/config` devuelve `admin_email`. El contacto público y el identificador de administración deben ser variables distintas.
4. **Opiniones sin flujo completo de publicación y moderación.** La API ya persiste opiniones autenticadas y la tabla existe, pero falta el formulario público, política de duplicados/edición, rate limit específico, moderación Admin y pruebas de persistencia después de recargar.
5. **Borrado permanente de productos.** Puede romper referencias históricas y no deja auditoría. Debe reemplazarse por archivado, salvo borrado excepcional y confirmado.
6. **Seguridad de cuenta incompleta.** Falta recuperación de contraseña, configuración de redirects/SMTP, pruebas E2E de refresh/logout y protección reforzada del Admin.
7. **Protección contra contraseñas filtradas desactivada.** El advisor de Supabase lo marca como advertencia. Debe habilitarse si el plan contratado lo permite; si no, documentar la limitación y compensar con MFA Admin y política de contraseñas.

### Bajos

1. La tabla histórica `favorites` permanece vacía y protegida aunque la función fue retirada. No es una exposición activa, pero agrega superficie innecesaria.
2. Rutas públicas inexistentes pueden terminar en el fallback de `index.html` con 200 en vez de 404, perjudicando observabilidad y SEO.
3. Falta una política documentada de rotación de secretos, respuesta a incidentes y revisión periódica de logs/advisors.
4. No existen tests de integración contra Supabase usando roles `anon`, `authenticated` y servidor privilegiado.

## Estado de las opiniones

La persistencia base **ya existe**:

- `GET /api/reviews` lee `public.reviews`.
- `POST /api/reviews` exige sesión, valida una puntuación de 1 a 5 y un comentario de hasta 1000 caracteres, y guarda usuario, nombre, puntuación y comentario.
- Una publicación anónima fue rechazada correctamente con HTTP 401.
- En producción hay 0 opiniones actualmente.

Lo que falta es la experiencia pública para escribirlas y administrarlas. La implementación recomendada es:

1. mostrar el formulario sólo con sesión iniciada y un CTA de login para visitantes;
2. enviar por la API del servidor, nunca insertar directamente desde el navegador;
3. bloquear doble envío y mostrar estados accesibles de carga, éxito y error;
4. volver a pedir `GET /api/reviews` después del alta para confirmar lo persistido;
5. agregar un límite por usuario e IP;
6. permitir editar la opinión propia;
7. agregar estado `pending`, `published` o `rejected` y moderación Admin;
8. definir si cada opinión es general o pertenece a un producto. La recomendación para ecommerce es una opinión por usuario y producto, editable.

No se debe habilitar una policy pública amplia de `INSERT`: las escrituras deben continuar pasando por el servidor.

## Plan de trabajo por fases

### S0 — Baseline y pruebas de seguridad

- Congelar evidencia actual, añadir matriz de amenazas y casos de abuso.
- Crear tests de `Origin`, CSRF, sesión, roles, errores y límites.
- Añadir integración controlada de RLS con las tres clases de cliente.

**Cierre:** baseline reproducible, tests verdes y ninguna modificación remota.

### S1 — Frontera HTTP y autenticación

- Middleware central para validar `Origin` en todas las mutaciones.
- Mantener cookies seguras y probar renovación, revocación y expiración.
- Separar `CONTACT_EMAIL` de `ADMIN_EMAIL`; retirar `admin_email` de `/api/config`.
- Implementar recuperación de contraseña con redirects permitidos y mensajes no enumerables.
- Preparar MFA obligatorio para Admin y reautenticación para acciones sensibles.

**Cierre:** pruebas de auth/CSRF verdes, cuenta recuperable y ningún dato Admin expuesto públicamente.

### S2 — Supabase y privilegios mínimos

- Migración no destructiva para revocar grants generales.
- Conceder sólo `SELECT` necesario a `products`, opiniones publicadas y perfil propio.
- Mantener `inquiries` y todas las escrituras bajo servidor privilegiado.
- Separar el provisioning Admin del arranque y documentar rotación/revocación.
- Revisar advisors después de la migración.

**Cierre:** migración versionada, prueba de rollback, RLS/grants verificados y advisors revisados.

### S3 — Opiniones persistentes y moderadas

- Definir relación opinión-producto y regla de duplicados.
- Añadir schema de estado/moderación e índices necesarios.
- Crear formulario editorial coherente, edición propia y recarga desde DB.
- Añadir rate limit y panel Admin para aprobar/rechazar/ocultar.
- Probar alta, reload, edición, duplicado, sesión expirada, abuso y XSS.

**Cierre:** opinión persiste tras recargar, sólo aparece según la regla de moderación y Admin puede gestionarla sin borrar historial.

### S4 — Admin y protección de datos

- Reemplazar delete normal por archive/restore.
- Requerir confirmación fuerte y sesión reciente para operaciones destructivas.
- Crear audit log mínimo para productos, roles y opiniones.
- Completar búsqueda, filtros, loaders y errores sin filtrar datos sensibles.

**Cierre:** CRUD seguro, reversible y auditado con E2E de customer/Admin.

### D1 — Contacto, colección femenina e imagen principal

- Cambiar contacto a `facundo.martearena@dantebariloche.edu.ar` mediante `CONTACT_EMAIL` y enlaces `mailto:` en todas las páginas.
- Para `catalogo.html?gender=mujer`, usar título **Perfumes de mujer**, eyebrow **Colección femenina** y metadata específica.
- Mantener negro, marfil y champagne; sumar sólo en esa cabecera un matiz rosa viejo/taupe cálido muy controlado, luz más suave y composición editorial. No cambiar cards, filtros ni identidad global.
- Recrear el frasco DREAMS desde cero en alta resolución. La referencia actual es 684×1020 y el asset usado por la web es apenas 185×272, por eso se pixela al ampliarlo.
- Crear un master vertical de al menos 2048×3072 y derivados AVIF/WebP de 640, 960 y 1440 px, con `srcset`, dimensiones declaradas y fallback.
- Para evitar texto deformado por generación, producir el frasco/escena sin lettering crítico y superponer la marca DREAMS con SVG/HTML nítido.

**Cierre:** contacto consistente, colección femenina reconocible sin salir de DREAMS, imagen nítida en móvil/desktop y sin regresión de performance.

### D2 — Dominio y SEO técnico

- Comprobar disponibilidad de `dreams-perfumes.up.railway.app` y renombrar el dominio Railway con su operación oficial.
- Antes del cambio, actualizar URL base, canonical, OpenGraph, sitemap, robots y redirects permitidos de Supabase Auth.
- Ejecutar smoke completo en el nuevo dominio y verificar certificado.
- Mantener transición o redirección 301 desde el dominio anterior cuando Railway lo permita; no eliminar el dominio viejo antes de verificar enlaces y auth.
- Si el subdominio gratuito no está disponible, usar una variante corta y coherente o un dominio propio.

**Cierre:** HTTPS válido, auth funcional, canonical único, smoke verde y enlaces anteriores tratados.

### S5 — QA, observabilidad y cierre

- E2E de auth, opiniones, catálogo, carrito, Admin y recuperación.
- QA responsive en 390×844, 430×932, 768×1024, 1024×768, 1440×900 y 1920×1080.
- Accesibilidad automatizada y manual, Lighthouse y presupuesto de imágenes.
- Logs/alertas de 5xx y rate limits, backup/restore documentado y checklist de rollback.

**Cierre:** CI verde, deploy SUCCESS, smoke real, QA documentado y sin bugs conocidos dentro del alcance.

## Orden recomendado de ejecución

1. S0 y S1: cerrar frontera HTTP y exposición del email Admin.
2. S2: privilegios mínimos y provisioning.
3. S3: opiniones completas sobre una base segura.
4. S4: Admin reversible y auditable.
5. D1: contacto, colección femenina e imagen de alta resolución.
6. D2: dominio sólo después de auth/SEO configurados.
7. S5: QA final y cierre.

## Decisión funcional pendiente

Antes de implementar S3 sólo hace falta confirmar una decisión de producto: si las opiniones serán generales sobre DREAMS o asociadas a cada perfume. La recomendación técnica y de UX es asociarlas a cada perfume, con una opinión editable por usuario y producto.

## Fuentes técnicas

- Supabase: Product Security, Row Level Security, Sessions, Password Security, Rate Limits, Security Testing y Production Checklist.
- Railway: `railway domain update old-name.up.railway.app --domain new-name` para renombrar un dominio proporcionado por Railway.

