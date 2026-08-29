# Changelog

Todos los cambios relevantes de DREAMS se registran aquí. El proyecto aún no usa releases semánticos.

## Unreleased

### 2026-08-29 — Opiniones generales persistentes

- Añadido formulario de opinión en homepage con puntuación, comentario, sesión requerida, labels y estado live.
- La publicación usa la API server-side existente, bloquea doble envío y recarga la lista desde Supabase después del alta para confirmar persistencia.
- Visitantes reciben un acceso claro a login/registro; usuarios autenticados ven el nombre con el que publican.
- Añadido rate limit de 5 publicaciones por hora exclusivamente sobre `POST /api/reviews`.
- Alta de opinión devuelve HTTP 201; integración confirma que una opinión autenticada reaparece al volver a consultar la lista.
- Añadida regresión del formulario accesible; check verde y 31/31 tests verdes.
- S2 de grants mínimos no fue iniciado porque el entorno bloqueó la descarga de Supabase CLI; no se inventó una migración ni se cambió la DB remota.
- Progreso ponderado actualizado de 69% a 70%.

### 2026-08-29 — Protección de origen y separación del contacto público

- Añadida verificación central de `Origin`/`Referer` para mutaciones y rechazo de metadata `cross-site` cuando no hay origen.
- Incorporada allowlist exacta mediante `APP_ORIGINS`, preparada para la futura transición de dominio sin comodines.
- `/api/config` dejó de devolver `admin_email` y ahora expone únicamente `contact_email` como dato público.
- Contacto de homepage y catálogo cambiado a `facundo.martearena@dantebariloche.edu.ar` con enlace `mailto:` y configuración dinámica segura.
- Actualizados `.env.example`, README, AGENTS y guía Railway para separar `CONTACT_EMAIL` de `ADMIN_EMAIL`.
- Añadidas 3 pruebas de integración; check verde, 29/29 tests verdes y sin cambios de DB.
- Progreso ponderado actualizado de 68% a 69% por trabajo implementado y verificado.
- PR #4 fusionado en `main` como `203e17b2e535df8df05e799f7b6ba0d91083434e` después de CI #16 verde.
- Railway recibió `CONTACT_EMAIL` y `APP_ORIGINS`; deployment `5269e263-0f88-4ebc-be3a-0992445c8047` terminó SUCCESS.
- Smoke de producción confirmó health/DB, configuración pública sin email Admin, contacto visible, same-origin operativo y bloqueo cross-site.

### 2026-08-29 — Revisión profunda de seguridad y roadmap ampliado

- Auditados frontend, Express, sesiones, Admin, Supabase/RLS/grants, dependencias, cabeceras HTTP, endpoints públicos y estado Railway sin modificar datos reales.
- No se confirmó una vulnerabilidad crítica explotable; se priorizaron provisioning Admin en arranque, MFA/reautenticación, Origin/CSRF, grants mínimos, separación de email público/Admin, opiniones moderadas y archive de productos.
- Confirmado que la API de opiniones ya persiste datos autenticados, pero falta formulario, edición, rate limit dedicado, moderación y pruebas de reload.
- Documentado el plan para cambiar el contacto a `facundo.martearena@dantebariloche.edu.ar` mediante `CONTACT_EMAIL` sin exponer `ADMIN_EMAIL`.
- Definida la evolución visual de `Perfumes de mujer` sin romper la identidad DREAMS.
- Diagnosticada la baja calidad del frasco: asset actual 185×272 ampliado. Planificada recreación 2048×3072 con AVIF/WebP responsivos y lettering nítido separado.
- Confirmado que Railway permite renombrar un dominio proporcionado; planificada transición segura a `dreams-perfumes.up.railway.app` si está disponible.
- Recalibrado el progreso ponderado de 73% a 68% por alcance nuevo y deuda descubierta; no es una regresión de código.
- Añadido `SECURITY_REVIEW_2026-08-29.md` como evidencia y plan operativo.
- Railway confirmó el deployment visual `bbc4aa7f-4d71-40d9-aa21-c6829a473f59` en estado SUCCESS.

### 2026-08-29 — Reglas maestras de continuidad

- Formalizado el prompt maestro permanente en `PROJECT_MASTER_RULES.md` y ampliado `AGENTS.md` con recuperación de contexto, fuentes de verdad, progreso verificable, formato de reporte, checkpoints Git, CI y deploy.
- Confirmado que el CSS premium completo ya está publicado en `main` y coincide exactamente con la rama de continuidad; no se realizaron cambios visuales adicionales ni se tocó Supabase.
- El progreso general permanece en 73% porque esta tanda documenta el proceso y no cierra alcance funcional nuevo.
- Confirmado que producción sigue sirviendo el CSS anterior: no es caché del cliente. Railway dejó `21225...` congelado en `DEPLOYING`; se creó un único redeploy limpio `bbc4...` del SHA visual correcto, que queda en cola hasta cancelar manualmente el deployment bloqueado.
- Smoke final: producción ya entrega el HTML/CSS premium del commit `08e15128...` y `/api/health` responde con API y base de datos OK. Railway aún refleja `bbc4...` como `DEPLOYING` por retraso de dashboard, pero el tráfico público fue actualizado.

### 2026-08-29 — Refinamiento visual premium DREAMS

- Consolidado el CSS acumulado en un sistema visual único con tokens de color, tipografía, spacing, bordes, transiciones y contenedores.
- Conservada la identidad negra, marfil y champagne de DREAMS, reduciendo el uso decorativo del dorado y mejorando jerarquía editorial.
- Refinados header con estado de scroll, hero sin recortes, grillas, cards, catálogo, detalle, carrito, cuenta, Nosotros, opiniones, footer y panel Admin.
- Añadidos estados de carga tipo skeleton, estados vacíos editoriales y recuperación visible ante fallos del catálogo.
- Mejorados foco visible, menú móvil, bloqueo de scroll, cierre con Escape, tamaños táctiles y `prefers-reduced-motion`.
- Integrado el isotipo suministrado como favicon y `apple-touch-icon` en todas las páginas públicas y Admin.
- Añadidas 2 pruebas de regresión del sistema visual y del favicon; suite local ampliada de 24 a 26 pruebas verdes.
- No se modificaron APIs, autenticación, lógica de carrito, esquema, datos ni configuración Supabase.
- PR #3 fusionado con GitHub Actions CI #14 verde; `main` quedó en `08e15128ca28fe6742536043a7de8b90c2d82ede`.
- Railway construyó la imagen del commit correcto en el deployment `21225f51-7484-4bfd-903d-dbb35d294539`, pero su promoción quedó bloqueada detrás del redeploy viejo `65722afb-b9ba-4a4c-bf26-78e2e6a37197`; producción continúa disponible con la versión anterior y el smoke del nuevo frontend queda pendiente hasta SUCCESS real.

### 2026-08-28 — Cuenta estable, retiro de favoritos y deploy preparado

- Retirada la función de favoritos de navegación, tarjetas, detalle, cuenta, Admin y API; `/favoritos` y `/favoritos.html` redirigen permanentemente al catálogo.
- Eliminados `public/favoritos.html` y `public/js/favoritos.js`; la tabla histórica vacía permanece protegida por RLS para evitar un borrado destructivo no autorizado.
- Registro y login validan correo/contraseña, diferencian confirmación pendiente de sesión activa y devuelven una redirección explícita.
- Corregida la pérdida del mensaje de confirmación: un alta `202` ya no recarga la página.
- La cuenta maneja errores de red, reintento, doble envío, estado ocupado, mensajes live y cierre de sesión fallido.
- Cookies de auth pasan por respuestas `Cache-Control: no-store`; refresh inválido elimina cookies caducadas.
- Añadido un único reintento acotado para consultas afectadas por el error transitorio Supabase `PGRST303` (`JWT issued at future`) observado en Railway.
- Pulida la estética editorial negra/dorada existente: tipografías unificadas, navegación activa, tarjetas, botones, formularios, cuenta, focus y responsive.
- Baseline `production_baseline` aplicada al Supabase `dreams-project`; triggers, RLS e índices de claves foráneas verificados sin cambiar datos del catálogo.
- Advisors posteriores: sin claves foráneas sin índice; quedan protección de contraseñas filtradas desactivada (WARN), tabla `inquiries` sin policy pública (INFO, intencional por uso server-only) e índices nuevos aún sin uso (INFO esperable).
- Suite ampliada de 20 a 24 pruebas con regresiones de auth, confirmación, cookies, retiro de favoritos y retry transitorio.
- `check` y 24/24 tests locales verdes antes de publicación.
- Runtime de producción fijado a Node 24 para eliminar la advertencia de deprecación de Node 20 emitida por `@supabase/supabase-js` en Railway y alinear deploy con CI.
- PR #1 y PR #2 fusionados con CI #10/#12 verdes. Railway desplegó `87f9e8d2` en `f89bba83-0b45-4ba1-894c-cd7dab060d39` usando Node 24.19.0; healthcheck y smoke de producción pasaron.

### 2026-08-28 — Auditoría F0

- Documentada la arquitectura real Node/Express/Supabase y la migración incompleta desde SQLite.
- Creado roadmap ponderado con progreso general inicial de 33%.
- Registrados hallazgos de seguridad, datos, backend, frontend, Admin, UX, accesibilidad, responsive, performance, SEO, CI y deploy.
- Verificada instalación frozen, sintaxis y smoke HTTP local.
- Detectadas 6 vulnerabilidades de producción en `nodemailer`, dependencia sin uso.
- Confirmados XSS por renderizado inseguro, seed destructivo, healthcheck falso positivo y edición Admin rota.
- Sin cambios funcionales, migraciones ni deploys en esta tanda de auditoría.

### 2026-08-28 — Hardening crítico F1/F3

- Neutralizado renderizado XSS de productos, opiniones, usuarios, consultas, errores y carrito; URLs de imagen restringidas a rutas locales/HTTPS.
- Añadida CSP sin `unsafe-inline` y retirados handlers inline.
- Eliminada dependencia `nodemailer` sin uso; audit de producción pasó de 6 vulnerabilidades a cero conocidas.
- Seed del catálogo cambiado para insertar sólo cuando la tabla está vacía, sin sobrescribir cambios Admin ni restaurar borrados.
- Reparada edición Admin al conservar `product-id`.
- Endurecida validación server-side de números, enteros, longitudes y URL de imagen.
- Añadido rate limit específico para consultas públicas.
- Readiness ahora consulta Supabase, devuelve 503 si falla y Railway usa `/api/health`.
- Añadidos 7 tests con Node y verificación de sintaxis reproducible.
- Creado workflow CI con instalación frozen, audit, check y tests.
- Corregido overflow de portada en 390, 430, 768, 1024, 1440 y 1920 px.
- Añadidos foco visible, `prefers-reduced-motion` y estado/escape de menú móvil en portada.
- Corregido el estado de error de opiniones cuando la API no está disponible.
- Rama `codex/production-hardening` publicada; PR #1 abierto contra `main`.
- GitHub Actions CI run #1 completó correctamente sobre `6b596947`.
- Sin migraciones remotas ni deploy en esta tanda.

### 2026-08-28 — Sesiones, IDs y baseline Supabase

- Añadida renovación server-side mediante refresh token y cookies con expiraciones separadas.
- Logout revoca la sesión actual en Supabase cuando hay un access token válido.
- Perfiles faltantes se crean/reparan siempre con rol `customer`; los errores de perfil ya no se ignoran.
- Mensajes de registro dejaron de filtrar errores internos del proveedor.
- IDs inválidos de productos, favoritos, consultas y Admin ahora devuelven 400.
- Creada con Supabase CLI 2.116.0 la migración `20260828144944_production_baseline.sql`.
- La baseline agrega RLS idempotente, trigger seguro de perfil, trigger `updated_at` e índices de catálogo/orden.
- `supabase/schema.sql` marcado como snapshot legacy y `supabase/.temp` ignorado.
- Suite ampliada a 11 pruebas, incluidas invariantes de seguridad/no destrucción de la baseline; audit continúa sin vulnerabilidades conocidas.
- Migración no aplicada ni declarada verificada: falta Postgres/Docker local o conexión controlada al remoto.
- GitHub Actions CI run #3 completó correctamente sobre `3a36ba27`.

### 2026-08-28 — Favoritos idempotentes y documentación operativa

- Reemplazado el toggle read-then-write por `PUT`/`DELETE` idempotentes; el alta usa `upsert` sobre la unicidad usuario/producto.
- Añadido `GET /api/favorites/ids` para sincronizar el estado visual con una sola consulta por página.
- Botones de favoritos ahora exponen `aria-pressed`, etiqueta contextual y bloqueo durante la escritura.
- Añadidas pruebas aisladas de la escritura de favoritos y smoke de rutas API para IDs, autenticación y 404.
- Suite ampliada a 13 pruebas; sintaxis y audit de producción continúan verdes.
- README, documentación técnica, guías Railway/Supabase y scripts de instalación alineados con el stack real; retiradas instrucciones activas de SQLite, Volume, bcrypt y `express-session`.
- El carrito se reconcilia mediante `POST /api/cart/quote`: precio, stock, productos agotados y faltantes se resuelven con datos del servidor antes de habilitar WhatsApp.
- La consulta de carrito incluye cantidades, productos y total autoritativo; el frontend deja de confiar en precio/stock de `localStorage` para esa salida.
- Enlaces y detalle dejaron de fijar el número de WhatsApp en JavaScript/HTML y consumen `/api/config` o la URL emitida por el servidor.
- Baseline Supabase y deploy remoto siguen sin aplicarse: requieren un entorno controlado y credenciales fuera del chat.

### 2026-08-28 — API inyectable y errores uniformes

- Separada la construcción de Express en `server/app.js`; `server/server.js` conserva únicamente configuración real, Supabase, escucha y seed.
- Añadida `create_app` con inyección explícita de base de datos, factory de cliente auth, configuración y logger para pruebas aisladas.
- Todas las rutas async pasan por un adaptador común que deriva rechazos al middleware central de errores.
- Errores inesperados devuelven `{ "error": "No se pudo completar la operación." }` sin filtrar mensajes internos de Supabase.
- Logs de error conservan método, ruta y clase/código limitado, sin copiar el mensaje interno del proveedor.
- Eliminada la filtración del mensaje de Supabase que permanecía en el alta Admin de productos.
- Añadidas 6 pruebas de integración HTTP con DB falsa: factory obligatoria, catálogo, error explícito, rechazo de promesa, readiness y CSP.
- Suite completa ampliada a 20 pruebas; check de sintaxis y audit de producción continúan verdes.
- Sin cambios en Supabase remoto ni deploy.
