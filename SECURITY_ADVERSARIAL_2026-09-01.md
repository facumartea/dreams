# Auditoría adversarial autorizada — DREAMS

Alcance: revisión no destructiva de Auth, autorización, sesiones, Supabase/RLS, API, checkout demo, cupones, pedidos, inputs, headers, secretos y rate limits. No se realizó DoS, acceso a cuentas ajenas, borrado de datos, persistencia maliciosa ni obtención de credenciales.

## Resumen

- Críticos: 0
- Altos: 0
- Medios: 2
- Bajos: 1
- Informativos: 2
- Corregidos en esta tanda: 3

## Hallazgos

### MEDIO — Enumeración parcial mediante confirmación pendiente

- VULNERABILIDAD: el login diferenciaba `email_not_confirmed` de credenciales incorrectas.
- COMPONENTE: `POST /api/auth/login`.
- IMPACTO: permitía inferir que un correo estaba registrado y pendiente de confirmar.
- CONDICIONES: proveedor devolviendo ese código y confirmación habilitada.
- PRUEBA SEGURA REALIZADA: prueba de integración con respuesta simulada del proveedor.
- CORRECCIÓN: en modo demo el mensaje es siempre `Correo o contraseña incorrectos.`.
- REGRESSION TEST: `modo demo no enumera usuarios mediante errores de confirmación`.
- ESTADO: CORREGIDO.

### MEDIO — Carrera al resolver dos veces un pedido demo

- VULNERABILIDAD: dos solicitudes simultáneas podían leer `created` antes de que una actualizara el pedido.
- COMPONENTE: `POST /api/checkout/demo-payment`.
- IMPACTO: estado demo no determinístico y segundo procesamiento innecesario.
- CONDICIONES: mismo usuario, mismo pedido y solicitudes concurrentes.
- PRUEBA SEGURA REALIZADA: revisión de la secuencia read-then-update; no se generó carga concurrente en producción.
- CORRECCIÓN: actualización compare-and-set con `id` y `status = created`; una segunda resolución devuelve 409.
- REGRESSION TEST: invariantes de estado cubiertas por suite de checkout y revisión de consulta condicionada.
- ESTADO: CORREGIDO.

### BAJO — Mutación autenticada sin origen explícito

- VULNERABILIDAD: una mutación con cookie podía continuar si faltaban `Origin`, `Referer` y `Sec-Fetch-Site`.
- COMPONENTE: guard global de mutaciones.
- IMPACTO: defensa CSRF menos estricta en clientes que omiten metadata.
- CONDICIONES: solicitud con cookie de DREAMS y sin headers de origen.
- PRUEBA SEGURA REALIZADA: integración local con cookie ficticia.
- CORRECCIÓN: las mutaciones con cookies DREAMS ahora exigen origen/referer válido.
- REGRESSION TEST: `una mutación autenticada sin Origin ni Referer se rechaza`.
- ESTADO: CORREGIDO.

### INFORMATIVO — Confirmación de correo desactivada para demo

- COMPONENTE: registro.
- IMPACTO: cuentas de prueba se activan sin demostrar control del buzón.
- CONDICIONES: `DEMO_AUTO_CONFIRM_EMAIL=true`.
- CONTROL: alta server-side, rol forzado a `customer`, passwords, rate limit, cookies, autorización y RLS permanecen activos.
- ESTADO: ACEPTADO SÓLO PARA DEMO. Antes de venta real: variable en `false` y `Confirm email` habilitado en Supabase Auth.

### INFORMATIVO — Advisor de Supabase

- RLS está activo en todas las tablas públicas.
- `orders`, `coupons` e `inquiries` no tienen policies públicas porque son server-only y se revocaron privilegios de `anon`/`authenticated`.
- Protección de contraseñas filtradas continúa desactivada; requiere habilitación desde Auth cuando el plan del proyecto la permita.
- Remediación oficial: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

## Controles verificados

- Precios, stock, cantidades, descuento y total se recalculan en servidor.
- Porcentaje del cupón no proviene del cliente.
- Pedidos se consultan por `id` + `user_id`.
- Admin depende del rol almacenado en `profiles`, no de `user_metadata`.
- Tablas de pedidos/cupones mantienen RLS y grants server-only.
- Payload de tarjeta demo es rechazado por el servidor.
- CSP no permite `unsafe-inline`; framing, MIME sniffing y downgrade HTTPS tienen cabeceras defensivas.
- Rate limits separados para Auth, checkout, cupones, carrito, consultas, opiniones y webhook.
- Audit de dependencias de producción: cero vulnerabilidades conocidas.

