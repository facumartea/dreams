# Auditoría F0 — DREAMS

Fecha de corte: 2026-08-28. Base auditada: `f3533d7fd0efc653eb39a1cfc8b0f39656068254` (`main`).

## Resumen ejecutivo

DREAMS es un proyecto académico migrado parcialmente de SQLite a Supabase. Tiene una tienda catálogo visualmente coherente, filtros, detalle, carrito local, cuenta, favoritos, opiniones, consultas por WhatsApp y un panel Admin. La arquitectura es pequeña y recuperable, pero no está lista para producción.

Los principales bloqueos son XSS almacenado/DOM por renderizado inseguro, un seed que puede sobrescribir datos administrados en cada arranque, un healthcheck que informa éxito sin base de datos, edición Admin rota, dependencia vulnerable sin uso, ausencia total de tests/CI y documentación contradictoria.

## Estado real por área

### Funciona con evidencia local

- Instalación reproducible con `pnpm install --frozen-lockfile`.
- Sintaxis válida en todos los archivos JavaScript.
- Arranque HTTP con variables de entorno sintácticamente válidas.
- Archivos estáticos, `/api/health`, `/api/auth/me`, fallback frontend y 404 API respondieron localmente.
- Catálogo, filtros, detalle, carrito local, cuenta, favoritos, opiniones, consultas y Admin tienen implementación real en código.
- Supabase usa RLS en todas las tablas declaradas y constraints básicos de FK/rangos.
- Cookies son `HttpOnly`, `SameSite=Lax` y `Secure` en producción; Helmet y rate limit de Auth están presentes.
- Railway y lockfile están versionados.

### Funciona a medias

- Healthcheck: responde `200 {status:"ok"}` aunque Supabase no resuelva.
- Auth: guarda access y refresh token, pero nunca usa el refresh; la sesión cae al vencer el access token.
- Registro: crea el perfil desde el servidor, pero ignora el error del `upsert`; puede dejar una cuenta sin perfil.
- Admin: listar, crear y borrar existen; editar está roto porque el formulario no recibe `product-id`.
- Usuarios Admin: el endpoint devuelve siempre `email:null`, por lo que la tabla muestra `null`.
- Carrito: es una selección local para consulta, no un checkout. Precio, stock y datos pueden quedar obsoletos o manipularse en `localStorage`.
- Responsive: hay breakpoints y tablas desplazables, pero no existe evidencia de QA en los viewports requeridos.
- SEO: sólo la portada tiene description; faltan canonical, OpenGraph, sitemap, robots y datos estructurados.

### Roto o riesgoso

- El seed hace `upsert` destructivo de las 31 filas en cada arranque y restaura productos borrados.
- Datos de productos, reseñas, perfiles, consultas y carrito se interpolan en `innerHTML` sin escape.
- El frontend deshabilita el outline de campos sin proveer un foco visible equivalente.
- La carga de reseñas y varios fetch no validan `response.ok` ni tienen estado de error consistente.
- La cantidad del carrito puede superar el stock; no se reconcilia contra servidor.
- El menú móvil no expone `aria-expanded`, no cierra con Escape y no conserva un estado accesible.
- Las políticas SQL no son reejecutables: `create policy` falla si ya existe. No hay migraciones versionadas.

### Simulado, obsoleto o no demostrado

- README y documentación todavía afirman SQLite, bcrypt, express-session, `SESSION_SECRET`, volumen Railway y una API de cotización inexistente.
- No hay pagos, órdenes, checkout transaccional, uploads ni storage; no deben presentarse como terminados.
- No hay pruebas, lint, typecheck, build, CI, PR ni QA documentado.
- El estado del proyecto Supabase, Railway, dominio y logs no pudo verificarse sin acceso a esos servicios.
- La API de GitHub no fue accesible sin autenticación; el remoto Git sí pudo clonarse. Estado de PR/deploy remoto: no verificado.

## Hallazgos por severidad

### Críticos

1. **XSS almacenado/DOM:** datos controlables desde reseñas, perfil y Admin se insertan con `innerHTML`. Un comentario como markup ejecutable puede afectar visitantes y el panel Admin. Evidencia: `public/js/app.js`, `producto.js`, `cuenta.js`, `admin.js`, `carrito.js`.
2. **Integridad de catálogo:** `seed_database` sobrescribe los productos por `(brand,name)` en cada arranque y resucita eliminados. Cambios de precio, stock, imagen y descripción hechos por Admin no son persistentes como fuente de verdad.

### Altos

1. **Healthcheck falso positivo:** `/api/health` y el healthcheck Railway en `/` no comprueban Supabase.
2. **Edición Admin rota:** `fill_form` no asigna `product-id`; guardar intenta un POST y choca con el unique `(brand,name)`.
3. **Dependencia vulnerable:** `nodemailer` 7.0.13, además sin uso, produce 1 vulnerabilidad alta, 4 moderadas y 1 baja en `pnpm audit --prod`.
4. **Sin testing ni CI:** no existe una barrera automática contra regresiones de seguridad, auth, datos o Admin.
5. **Sesión incompleta:** el refresh token queda en cookie pero no se utiliza ni revoca en Supabase al hacer logout.
6. **Spam/abuso:** `/api/inquiries` es público y no tiene rate limit específico; permite escrituras ilimitadas con una clave privilegiada del servidor.
7. **Autorización dependiente de perfil:** fallar silenciosamente al crear `profiles` deja estados inconsistentes; no hay trigger DB que garantice el perfil.

### Medios

- Validación de producto acepta `NaN`, infinitos, decimales en stock/tamaño/intensidad y URLs no HTTP(S); longitudes no se limitan.
- IDs inválidos llegan como `NaN` a Supabase en varios endpoints.
- Toggle de favoritos es read-then-write, no atómico ante concurrencia.
- Errores de Supabase se devuelven textualmente en altas/ediciones Admin.
- Carrito no limita cantidad a stock ni refresca precio/stock desde la API.
- Consulta de carrito no incluye su contenido y usa WhatsApp hardcodeado, ignorando `/api/config`.
- CSP está desactivada; faltan política de orígenes para imágenes/fuentes y controles adicionales.
- El borrado de producto es permanente para relaciones de favoritos; falta estrategia de archivo/auditoría.
- Falta índice para orden de reseñas y una estrategia de búsqueda escalable; no existe trigger de `updated_at`.
- No hay migraciones/seeds separados por entorno ni prueba de RLS contra roles reales.
- Estados loading/error/empty son inconsistentes; varias promesas no capturan errores.
- El CSS elimina foco visible en inputs/selects/textarea; botones y tabs necesitan semántica/estado accesible.
- No hay `prefers-reduced-motion`.
- Imágenes externas dependen de Unsplash y no tienen dimensiones declaradas, `srcset` ni política de licencia resuelta para producción.

### Bajos

- Código servidor concentrado y minificado en un solo archivo dificulta pruebas y mantenimiento.
- Cabecera y footer están duplicados en todas las páginas.
- Fuentes declaradas y fuentes realmente cargadas no coinciden (`Playfair Display`/`Montserrat` no se solicitan).
- Fallback SPA devuelve portada con 200 para rutas frontend inexistentes (soft 404).
- Descripciones meta ausentes fuera de portada; falta favicon/manifest.
- Documentación y comandos (`npm run seed`) no coinciden con `package.json`.

## Datos y Supabase

- Tablas: `profiles`, `products`, `favorites`, `reviews`, `inquiries`.
- FKs y checks básicos: presentes.
- RLS: habilitado en las cinco tablas. Lectura pública sólo para productos/reseñas; perfil/favoritos por propietario. Las escrituras normales pasan por servidor con clave secreta.
- Riesgo principal: al usar `SUPABASE_SECRET_KEY`, todos los permisos dependen del servidor; cualquier endpoint débil omite RLS como defensa efectiva.
- No se detectó secreto real versionado.
- No se pudo ejecutar advisor, consultar esquema remoto ni verificar políticas efectivas por falta de conexión/credenciales Supabase.

## Testing y verificaciones F0

- `pnpm install --frozen-lockfile`: OK.
- Política de supply chain del lockfile: OK.
- `node --check` en servidor y frontend: OK.
- Smoke local sin DB real: 200 en `/`, `/api/health`, `/api/auth/me`; 404 correcto en API inexistente.
- `pnpm audit --prod`: FALLA, 6 vulnerabilidades vía `nodemailer`.
- Unit/integration/E2E: no existen.
- Browser QA, responsive, accesibilidad automatizada, CI y producción: no ejecutados.

## Riesgos de deploy

- Railway puede considerar sana una instancia con Supabase caído.
- Seed destructivo en cada reinicio/deploy.
- No hay pin explícito de versión Node más allá de `>=20`.
- No hay CI previo al deploy ni migraciones automatizadas/registradas.
- Dominio, variables, logs y persistencia remotos no verificados.

## Conclusión

La base es rescatable y el alcance comercial actual es una tienda catálogo con consultas, no un e-commerce transaccional. La prioridad correcta es contener XSS y pérdida de datos, reparar Admin/health/auth y construir pruebas/CI antes de cambios visuales.
