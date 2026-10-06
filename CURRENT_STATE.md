# Estado actual — DREAMS

**SEGUÍ EXACTAMENTE DESDE CURRENT_STATE.md.**

## Checkpoint de recuperación — 2026-10-05

- Repositorio real: https://github.com/facumartea/dreams.
- Base verificada: main `4655b0cbdcec8ad2aade4cdde03ef60b22652bf1`, merge de PR #31 (SEO).
- Rama de esta tanda: `codex/restore-schema-continuity`; commit/PR/CI se verifican en GitHub, no asumir el HEAD a partir de este archivo.
- La carpeta de esta conversación no contenía un checkout. Git y pnpm fallaron al crear archivos con ENOENT. Se recuperaron los archivos de texto del SHA base mediante el conector GitHub y apply_patch. La copia local es parcial, sin assets binarios ni dependencias; no es un checkout Git.
- Los registros anteriores de 69/74/76 tests y deploys corresponden a tandas históricas. No prueban el estado actual.
- El 79,39% de PLAN.md es una estimación histórica sin revalidación integral; esta tanda no la incrementa.

## Arquitectura y funcionalidades existentes

Frontend multipágina HTML/CSS/JavaScript en public/, Express 5 en server/app.js, bootstrap en server/server.js, Node 24 y pnpm 11.19.0. El navegador usa /api; Supabase Auth y Postgres permanecen detrás del servidor. Admin se sirve desde views/admin.html después de autorizar el perfil.

Existen catálogo/búsqueda/filtros, detalle/notas, carrito local con cotización de precio/stock server-side, cuenta/registro/login/logout/refresh, opiniones generales, consultas WhatsApp, productos/Admin, cupones/Admin, pedidos/Admin de lectura y checkout demo/Mercado Pago. Favoritos fue retirado previamente por decisión de producto; las rutas históricas redirigen al catálogo y se conserva la tabla vacía. No restaurarlo sin una decisión nueva.

Se preservan logo, isotipo, fuentes, CSS, paletas de colecciones, composición, imágenes y componentes. Ningún archivo visual cambia en esta tanda.

## Base de datos comprobada

Supabase dreams-project, ref nwsmbemwtexmrtpkgxrz, ACTIVE_HEALTHY, Postgres 17.
Conteos SQL: products 46, profiles 7, inquiries 1, favorites 0, reviews 0, orders 0, coupons 0. Son una instantánea de auditoría, no estadísticas comerciales. Los 46 productos tienen image_url no vacío; la carga remota de cada imagen no se verificó.

**Diferencia crítica:** la tabla products real tiene `marca`, no `brand`. El código anterior usaba brand en filtros, búsqueda, cotización, marcas, consultas relacionadas y escrituras Admin. Las migraciones históricas describen brand; no aplicar ni recrear la baseline sobre esta DB.

Esta tanda detecta la columna mediante SELECT al arrancar, acepta marca o brand y mantiene brand en JSON/payloads del navegador y snapshots de pedidos. Traduce exclusivamente en el límite DB. No renombra columnas, no crea tablas y no altera filas.

RLS habilitado en las siete tablas. Relaciones: profiles → auth.users; favorites → profiles/products; reviews → profiles; inquiries → profiles/products; orders → profiles/coupons. Los productos de pedidos se conservan como snapshots JSON.

Advisors de seguridad actuales:
- Protección de contraseñas filtradas desactivada.
- is_dreams_admin() SECURITY DEFINER ejecutable por authenticated. Su cuerpo sólo comprueba el rol del auth.uid() actual y fija search_path vacío; las policies Admin lo necesitan. No revocar EXECUTE ni cambiar a INVOKER sin analizar recursión/policies y probar en entorno aislado.

No hubo DDL, migraciones, seeds, usuarios, productos, pedidos, cupones ni opiniones creados/modificados/eliminados remotamente.

## Autenticación y arranque

Cookies HttpOnly, Secure en producción, SameSite=Lax; refresh server-side y autorización basada en profiles.role, no en metadata editable. Se conserva mutation_origin_guard y APP_ORIGINS.

El arranque deja de ejecutar seed_database: no introduce catálogo histórico ni crea/promueve Admin por ADMIN_PASSWORD. La detección del esquema falla ante permisos/conectividad o columnas ausentes antes de escuchar. server/seed.js queda como referencia histórica, fuera del arranque; no ejecutarlo sobre datos reales.

Variables requeridas: SUPABASE_URL, SUPABASE_SECRET_KEY, sólo servidor. Ver .env.example para contacto, orígenes y checkout. No hay secretos de producción en la copia local y no se solicitaron. DEMO_AUTO_CONFIRM_EMAIL debe revisarse antes de habilitar ventas reales.

## Infraestructura y deployment

Railway se conserva como proveedor declarado. railway.toml usa node server/server.js y healthcheck /api/health. No existe script build; no fabricar uno: ejecutar check, tests y validación de arranque.

Dominio documentado: https://dreams-perfumes.up.railway.app.
Smoke actual: /api/health, /api/products, /api/checkout/config, /api/auth/me y /admin devuelven 404 de Railway, con Application not found en las APIs. Esto no es el 404 de Express; no confirma un deploy activo ni permite QA funcional de producción.

No hay herramientas Railway conectadas en esta sesión. No se verificaron variables, logs, dominio activo, deployment ni SHA servido. Los IDs de deploy históricos del changelog no describen el estado actual. No hubo deploy ni cambio de proveedor/dominio.

## Tests y validación de esta tanda

- Node local disponible: 24.19.0.
- Check inicial de los cambios: PASS (27 JavaScript antes de agregar regresiones).
- Nuevas pruebas unitarias del adaptador/detección: PASS en ejecución parcial.
- La ejecución parcial inicial registró 37 PASS y 2 fallos de entorno: asset binario no recuperado y dotenv no instalado. No se borraron tests ni se fabricaron assets.
- pnpm install --frozen-lockfile: bloqueado por ENOENT al crear archivo temporal. La suite completa, integración HTTP, audit y assets se validan en CI del PR; consultar el resultado exacto en GitHub.
- Las nuevas regresiones HTTP cubren marca en catálogo, búsqueda/filtro, marcas, detalle, carrito y create/update/consultas Admin con DB aislada.
- No se ejecutaron mutaciones reales de Supabase ni compras.
- Responsive de seis viewports, consola del navegador, accesibilidad manual, performance y E2E autenticado: pendientes; conservar el diseño hasta poder medir.

## Problemas conocidos y pendientes

1. Restaurar o identificar el dominio/servicio Railway activo mediante acceso al proveedor.
2. Validar CI completo y revisar el diff de este PR antes de integrar; no fusionar main sin evidencia verde.
3. Verificar el arranque con Supabase y las rutas públicas tras desplegar.
4. QA autenticado aislado de roles/Admin/checkout/cupons y matriz responsive definida en PLAN.md.
5. Mercado Pago Sandbox requiere configuración oficial y compra de prueba real; demo no equivale a cobros funcionales.
6. Revisar recuperación de contraseña/SMTP y MFA, límites de cupones, reserva/descuento de stock y concurrencia antes de ventas reales.
7. Revisar grants, advisors y archivo/restore Admin sin borrar datos. Baselines históricas no son instrucciones para recrear producción.
8. Corregir el entorno local de escritura para clonar e instalar con lockfile; no reducir protecciones del sistema automáticamente.

## Próxima acción exacta

Revisar CI y PR codex/restore-schema-continuity, recuperar el servicio/dominio Railway existente y sus variables sin exponer secretos, desplegar la corrección validada y repetir smoke de health, catálogo/marcas/filtro/detalle, cuenta y Admin. Luego probar mutaciones y checkout en entorno aislado. No afirmar DREAMS completamente funcional mientras hosting, pagos y QA integral sigan pendientes.
