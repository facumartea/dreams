# Checkout Sandbox — diseño y activación

## Diagnóstico vigente — 2026-10-06 (America/Buenos_Aires)

Pages/Worker publican checkout desactivado (demo, CHECKOUT_SCHEMA_READY=false), sin credenciales Mercado Pago y sin contacto WhatsApp. Las tablas orders/coupons sí existen. No activar demo/sandbox contra datos comerciales: ambos guardan pedidos. La cotización muestra subtotal sin envío; la integración no determina una tarifa. Guía actual y pasos seguros: [cart_checkout_validation.md](cart_checkout_validation.md). URLs Railway de los ejemplos de abajo son históricas, no un destino operativo ni configuración vigente.

## Estado

La aplicación incluye una integración desacoplada de Checkout Pro mediante `server/payments/mercado-pago.js`, pantallas de checkout/resultado, verificación HMAC de Webhooks, consulta server-side del pago y estados `approved`, `rejected`, `pending`, `cancelled` y `error`.

También incluye `server/payments/demo.js`, un proveedor interno sin cobros ni credenciales. El formulario demo valida datos ficticios únicamente en el navegador y envía al servidor sólo `order_id` y un escenario permitido. Nunca transmite ni persiste número de tarjeta, vencimiento o CVV.

Seleccionar proveedor con `CHECKOUT_PROVIDER=demo` o `CHECKOUT_PROVIDER=mercado_pago`. El modo demo sirve para validar UX, estados y persistencia de pedidos, pero no verifica la integración real de Mercado Pago.

El feature flag es cerrado por defecto. `/api/checkout/config` sólo devuelve `enabled: true` cuando coinciden las tres condiciones:

1. para Mercado Pago, `MERCADO_PAGO_ACCESS_TOKEN` y `MERCADO_PAGO_WEBHOOK_SECRET` están configurados en el servidor; el proveedor demo no los usa;
2. `APP_BASE_URL` es un origen HTTPS válido;
3. `CHECKOUT_SCHEMA_READY=true` después de aplicar y verificar la migración.

Nunca activar el flag sólo para mostrar la interfaz. Hasta completar la activación, el carrito permite consulta por WhatsApp únicamente cuando el contacto real está configurado.

## Esquema aplicado

La migración `20260831024826_checkout_orders_and_coupons.sql` fue aplicada el 2026-08-31. Crea `public.orders` y `public.coupons` como tablas server-only con RLS, grants exclusivos para `service_role`, constraints e índices.

`orders` conserva:

- `id uuid primary key`;
- `user_id uuid not null references public.profiles(id)`;
- `provider text not null check (provider in ('mercado_pago','demo'))` después de aplicar `20260831040000_enable_demo_checkout_provider.sql`;
- `provider_preference_id text unique` nullable;
- `provider_payment_id text unique` nullable;
- `status text not null check (status in ('created','approved','rejected','pending','cancelled','error'))`;
- `status_detail text` nullable;
- `currency text not null default 'ARS' check (currency = 'ARS')`;
- `subtotal`, `discount` y `total` con consistencia obligatoria;
- snapshot del código y porcentaje del cupón;
- `items jsonb not null check (jsonb_typeof(items) = 'array')`;
- `paid_at timestamptz` nullable;
- `created_at timestamptz not null default now()`;
- `updated_at timestamptz not null default now()` y trigger existente `set_updated_at` si corresponde;
- índices sobre `user_id, created_at desc`, `provider_payment_id` y `status`.

`coupons` incluye código mayúsculo único, porcentaje mayor que 0 y hasta 100, estado y campos futuros opcionales para vencimiento, límites, mínimo y condiciones. El navegador nunca consulta Supabase directamente.

## Variables Sandbox

```text
APP_BASE_URL=https://drams-production.up.railway.app
CHECKOUT_PROVIDER=mercado_pago
MERCADO_PAGO_MODE=sandbox
MERCADO_PAGO_ACCESS_TOKEN=<credencial de prueba, sólo servidor>
MERCADO_PAGO_WEBHOOK_SECRET=<secreto de Webhooks de prueba>
CHECKOUT_SCHEMA_READY=true
CHECKOUT_SHOW_TEST_DATA=true
```

Para una demostración interna sin cobro:

```text
CHECKOUT_PROVIDER=demo
CHECKOUT_SCHEMA_READY=true
CHECKOUT_SHOW_TEST_DATA=true
```

Configurar en Mercado Pago el evento `payment` hacia:

```text
https://drams-production.up.railway.app/api/payments/webhook
```

Nunca colocar token o secreto en `public/`, GitHub, capturas o documentación versionada. Antes de producción cambiar variables, ocultar datos de prueba, validar dominio/URLs de retorno y ejecutar compras reales de monto mínimo bajo control del propietario.

## QA de activación

1. confirmar migración y advisors;
2. configurar credenciales de prueba y secreto Webhook;
3. crear comprador de prueba en Mercado Pago;
4. probar aprobado, rechazado y pendiente con datos oficiales de prueba;
5. verificar registro de `orders`, importe/moneda/referencia y recepción Webhook;
6. repetir recarga, retorno, doble callback y error de red;
7. confirmar que ninguna operación tiene `live_mode=true` en Sandbox;
8. recién entonces dejar `CHECKOUT_SCHEMA_READY=true`.
