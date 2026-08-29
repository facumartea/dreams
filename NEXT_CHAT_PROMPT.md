# Prompt de continuidad — DREAMS

Seguí exactamente desde `CURRENT_STATE.md` del repositorio `facumartea/drams`. No dependas del historial de chats anteriores.

Tomá DREAMS como un proyecto real de producción. Antes de modificar nada, leé completos `AGENTS.md`, `CURRENT_STATE.md`, `PLAN.md`, `AUDIT.md` y `CHANGELOG.md`; después confirmá el estado remoto de GitHub, CI, Railway y Supabase. No reinicies la auditoría F0 ni repitas trabajo ya cerrado. No inventes porcentajes, QA, tests, CI o deploys.

Contexto obligatorio:

- Repositorio: `https://github.com/facumartea/drams`
- PRs ya fusionados: `#1 — Production audit and critical hardening`, `#2 — Align Railway runtime with Node 24` y `#3 — Refine DREAMS premium visual experience`
- `main`: `08e15128ca28fe6742536043a7de8b90c2d82ede`; rama de continuidad documental: `codex/dreams-premium-visual`
- Producción Railway correcta: proyecto `empowering-rebirth`, servicio `drams`, dominio `https://drams-production.up.railway.app`
- Supabase correcto: proyecto `dreams-project`, ref `nwsmbemwtexmrtpkgxrz`
- La identidad visual debe seguir siendo editorial de lujo, negra y dorada. Mejorarla con criterio, sin rediseñarla ni reemplazarla por una estética SaaS genérica.
- El sistema visual premium ya fue consolidado: tokens negro/marfil/champagne, Cormorant Garamond + Inter, spacing editorial, cards livianas, hero sin recortes, header con scroll, formularios, carrito, cuenta, Nosotros, footer y Admin. No volver a acumular overrides contradictorios en `public/css/style.css`.
- El isotipo suministrado está en `public/assets/dreams-isotype.png` y se usa como favicon/`apple-touch-icon`. No reemplazarlo por un icono genérico.
- Favoritos fue retirado por decisión del usuario. No volver a implementarlo. La tabla `favorites` se conserva vacía e inactiva por seguridad histórica hasta una migración destructiva explícitamente autorizada.
- El carrito es una selección local que genera una consulta por WhatsApp; no es checkout, orden ni pago. No simular pagos ni funcionalidades inexistentes.
- Nunca exponer `SUPABASE_SECRET_KEY`, credenciales, tokens o datos privados en frontend, logs, commits o respuestas.

Estado funcional esperado al tomar el proyecto:

- Login/registro con validación server-side, cookies HttpOnly, refresh server-side, mensajes seguros y redirección explícita.
- El registro con confirmación pendiente devuelve 202 y mantiene visible el mensaje sin recargar.
- Perfil faltante se repara como `customer`; roles se leen de `profiles.role`, nunca de metadata editable.
- Consultas de catálogo críticas reintentan una sola vez únicamente ante `PGRST303` por desfase JWT transitorio.
- Baseline Supabase `production_baseline` aplicada y registrada; RLS e índices verificados.
- Suite mínima esperada: 26/26 pruebas Node y `pnpm run check` verde, además de CI GitHub verde.
- Producción debe responder `/api/health` con `{status:"ok",api:true,database:"ok"}` antes de declararse estable.

Próximo bloque recomendado:

1. Confirmar primero el bloqueo Railway: `21225f51-7484-4bfd-903d-dbb35d294539` es el deployment correcto del SHA `08e15128...`; `65722afb-b9ba-4a4c-bf26-78e2e6a37197` es un redeploy viejo atascado. No crear otro redeploy.
2. Si siguen congelados, cancelar/remover sólo `65722...` desde Railway sin tocar variables, fuente ni Supabase; esperar que `21225...` llegue a SUCCESS.
3. Ejecutar smoke real de portada, favicon, catálogo, producto 31, carrito, cuenta/login, `/api/health`, login inválido, redirección histórica de favoritos y acceso Admin protegido. Confirmar `dreams-isotype` en HTML y `--accent:#c5a46a` en CSS.
4. Completar QA visual real en 390x844, 430x932, 768x1024, 1024x768, 1440x900 y 1920x1080. Revisar especialmente overflow, título del hero, menú móvil, cards, filtros, botones táctiles y formularios.
5. Añadir E2E de cuenta/sesión/Admin con un entorno Supabase controlado; probar refresh, logout, rol customer y rol admin.
6. Medir Lighthouse/performance y cerrar SEO, accesibilidad y QA final sin declarar 100% antes de ejecutar las matrices correspondientes.
7. Implementar recuperación de contraseña sólo cuando esté definida la URL de Auth de producción; definir moderación de opiniones y archive/delete antes de cerrar F5/F7.

En cada tanda: analizar, implementar, ejecutar instalación frozen/check/tests/audit, actualizar `CURRENT_STATE.md` y `CHANGELOG.md`, commit, push, CI verde y smoke post-deploy. Avanzá automáticamente; detenete sólo por decisión de negocio, gasto, credencial externa, acción destructiva o riesgo real de producción.
