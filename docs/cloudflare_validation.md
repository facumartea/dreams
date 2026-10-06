# DREAMS — evidencias y límites de validación

2026-10-06 UTC. Pruebas locales sobre rama `codex/cloudflare-hosting-migration`. No hay URL Cloudflare remota publicada ni validación de dominio productivo.

## Resultado local

- Recuperación funcional: 87 tests pasaron; la suite final incorpora además pruebas en workerd. Suite final local: 89/89, sin fallos ni omitidos; consultar CURRENT_STATE para CI del commit publicado.
- `pnpm run check`: 32 archivos JS/MJS, incluido Worker y tests.
- `pnpm audit --prod`: sin vulnerabilidades conocidas; es un resultado de dependencias de producción, no certificación global de seguridad.
- `pnpm run build:cloudflare`: Wrangler 4.147.0, preview dry-run, assets y bundle compilados. Tamaño observado ~2.156 MiB sin comprimir / ~500 KiB gzip. No se publicaron recursos. Aviso esperado: APP_BASE_URL y APP_ORIGINS remotos aún faltan y no heredan localhost.
- Runtime real workerd: Express, Supabase SDK, assets, 404/redirect, Admin protegido y autorizado, JWT por petición para Admin, dos sesiones independientes, cliente privilegiado sin contaminación, cookies HttpOnly/SameSite/Secure, logout y no-store. Backend remoto sustituido por fixtures HTTP aisladas sólo en tests; no se usaron usuarios ni pedidos reales para esas mutaciones. Otro test verifica 503 cerrado sin origen HTTPS de preview.

Bootstrap Node original también ejecutado sin seed: home/health/productos/marcas 200, Admin anónimo 403 y página inexistente 404; ocho productos reales normalizados. No se rompió el arranque existente.

## Datos reales, sin mutaciones

Se usó el harness oficial `createTestHarness` de Wrangler con salida Node/proxy y clave pública Supabase. Runtime Worker real; DB/Auth real sólo para lecturas. El `wrangler dev` directo sirvió HTML/config pero no pudo acceder a Supabase por la salida de red de este entorno (health 503); no se deshabilitó TLS ni modificó código productivo para el proxy. Lectura a través del harness: health 200, catálogo 46, home 8 y 17 marcas.

Chromium navegó 11 rutas × seis viewports (360×800, 390×844, 768×1024, 1024×768, 1440×900, 1920×1080): 66 respuestas 200, cero errores pageerror y cero desbordes horizontales. Todas las home mostraron 8 cards y los catálogos 46, sin marca vacía. Se precargó `dreams_recent={}` para comprobar tolerancia a storage corrupto. Esto verifica comportamiento local y overflow; no equivale a auditoría completa de accesibilidad ni revisión visual en dispositivos físicos.

Pruebas adicionales reales: filtro Byredo devuelve su único producto, búsqueda Sauvage devuelve su producto; fallo de red inyectado en filtro muestra reintento y recupera el resultado; carrito conserva un artículo en localStorage, quote 200 con un item y precios/stock de servidor. Quote no inserta un pedido. Auth/Admin remotos y MP sandbox no se ejecutaron por falta de credenciales/cuentas de prueba. No se enviaron correos ni cobros.

Payload JSON observado: catálogo completo 33.566 bytes; home limitada 5.611 bytes (~83,3% menos). No se ejecutó Lighthouse ni se midieron Core Web Vitals o CPU de producción. CSS/HTML públicos y assets visuales no fueron rediseñados.

## Supabase verificado y preservado

RLS activa en products, profiles, inquiries, reviews, favorites, orders y coupons. Conteos: productos 46, perfiles 7, Auth 8, consultas 1, pedidos/cupones/reviews 0. Columna `marca` real, `brand` inexistente. No se ejecutó seed ni SQL de escritura/DDL.

Migrations remotas y locales difieren en algunos timestamps; NO reejecutar la baseline sobre la DB real ni renombrar versiones/aplicar repair sin comparar SQL y dependencias:

| Migración | Versión remota | Archivo local |
|---|---|---|
| production_baseline | 20260828191602 | 20260828144944_production_baseline.sql |
| checkout_orders_and_coupons | 20260831024826 | 20260831024826_checkout_orders_and_coupons.sql |
| enable_demo_checkout_provider | 20260831192352 | 20260831040000_enable_demo_checkout_provider.sql |
| admin_authenticated_policies | 20260901204014 | 20260901090000_admin_authenticated_policies.sql |
| admin_orders_coupons_grants | 20260902021425 | 20260902090000_admin_orders_coupons_grants.sql |

Políticas reales: productos/reviews lectura pública; Admin autentificado tiene mutaciones de productos/reviews, lectura consultas/pedidos/perfiles y CRUD cupones; perfiles lectura propia; favorites propietario. Orders no es accesible por anon; Admin usa JWT/RLS. La etiqueta antigua «orders/coupons server-only» no describe todos los grants actuales.

Triggers reales: creación de perfil desde Auth; updated_at en products/orders/coupons. Helper is_dreams_admin SECURITY DEFINER tiene search_path vacío y depende de roles reales de profiles; es usado por políticas Admin. No cambiar a INVOKER/revocar a ciegas (recursión/rotura de permisos).

Advisor actual: dos WARN de seguridad ([helper ejecutable por authenticated](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable), [protección de contraseñas filtradas deshabilitada](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)). Requieren revisión aparte, no alteración por hosting. Grants TRUNCATE/REFERENCES/TRIGGER a anon/authenticated sobre cinco tablas históricas son deuda de mínimo privilegio; no se revocaron. Advisor performance: diez índices sin uso INFO y dos políticas SELECT permisivas de profiles WARN; no eliminar índices por falta de uso en un dataset pequeño.

## Pendientes preexistentes

- Imágenes externas de IDs 197/198/205 respondieron 404 en auditoría; otras fuentes pueden bloquear hotlink. Fallback existente conservado. No inventar imágenes, ni sustituir URLs en la DB para esta migración.
- Sin flujo UI de password recovery/MFA; no declarar cobertura de funciones inexistentes.
- Stock sin reserva/descuento; límites de uso de cupones e idempotencia de creación de pedidos requieren diseño seguro antes de comercio real.
- Mercado Pago: tokens/webhook no verificados, sin transacción sandbox real. Timeout ahora 15 s; firma HMAC existente se conserva. No afirmar cobros listos.
- Rate limits Express por isolate necesitan controles de abuso a nivel Cloudflare antes de promoción.
- Cuenta/token Cloudflare, secreto Supabase, contactos comerciales, preview HTTPS, Auth redirects, DNS y plan del servicio no verificados. Cuotas/CPU/startup no medidos en Cloudflare remoto.
- Railway offline, deployments recientes REMOVED. No se eliminó ni desactivó hosting/volumen; primero verificar un destino operativo para rollback.
