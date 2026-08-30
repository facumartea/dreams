# Checkout Sandbox — diseño y activación

## Estado

La aplicación incluye una integración desacoplada de Checkout Pro mediante `server/payments/mercado-pago.js`, pantallas de checkout/resultado, verificación HMAC de Webhooks, consulta server-side del pago y estados `approved`, `rejected`, `pending`, `cancelled` y `error`.

El feature flag es cerrado por defecto. `/api/checkout/config` sólo devuelve `enabled: true` cuando coinciden las tres condiciones:

1. `MERCADO_PAGO_ACCESS_TOKEN` está configurado en el servidor;
2. `APP_BASE_URL` es un origen HTTPS válido;
3. `CHECKOUT_SCHEMA_READY=true` después de aplicar y verificar la migración.

Nunca activar el flag sólo para mostrar la interfaz. Hasta completar la activación, el carrito conserva el flujo de consulta por WhatsApp.

## Esquema requerido

Crear primero el archivo con la CLI fijada por el proyecto:

```text
supabase migration new checkout_orders
```

Incorporar en ese archivo una tabla `public.orders` server-only con:

- `id uuid primary key`;
- `user_id uuid not null references public.profiles(id)`;
- `provider text not null check (provider in ('mercado_pago'))`;
- `provider_preference_id text unique` nullable;
- `provider_payment_id text unique` nullable;
- `status text not null check (status in ('created','approved','rejected','pending','cancelled','error'))`;
- `status_detail text` nullable;
- `currency text not null default 'ARS' check (currency = 'ARS')`;
- `total numeric(12,2) not null check (total > 0)`;
- `items jsonb not null check (jsonb_typeof(items) = 'array')`;
- `paid_at timestamptz` nullable;
- `created_at timestamptz not null default now()`;
- `updated_at timestamptz not null default now()` y trigger existente `set_updated_at` si corresponde;
- índices sobre `user_id, created_at desc`, `provider_payment_id` y `status`.

Habilitar RLS. Como el navegador nunca consulta Supabase directamente y el servidor usa la secret key, revocar privilegios de `anon` y `authenticated` sobre `orders`; no crear policies públicas. Verificar advisors y el acceso server-side después de aplicar.

## Variables Sandbox

```text
APP_BASE_URL=https://drams-production.up.railway.app
MERCADO_PAGO_MODE=sandbox
MERCADO_PAGO_ACCESS_TOKEN=<credencial de prueba, sólo servidor>
MERCADO_PAGO_WEBHOOK_SECRET=<secreto de Webhooks de prueba>
CHECKOUT_SCHEMA_READY=true
CHECKOUT_SHOW_TEST_DATA=true
```

Configurar en Mercado Pago el evento `payment` hacia:

```text
https://drams-production.up.railway.app/api/payments/webhook
```

Nunca colocar token o secreto en `public/`, GitHub, capturas o documentación versionada. Antes de producción cambiar variables, ocultar datos de prueba, validar dominio/URLs de retorno y ejecutar compras reales de monto mínimo bajo control del propietario.

## QA de activación

1. aplicar migración y ejecutar advisors;
2. configurar credenciales de prueba y secreto Webhook;
3. crear comprador de prueba en Mercado Pago;
4. probar aprobado, rechazado y pendiente con datos oficiales de prueba;
5. verificar registro de `orders`, importe/moneda/referencia y recepción Webhook;
6. repetir recarga, retorno, doble callback y error de red;
7. confirmar que ninguna operación tiene `live_mode=true` en Sandbox;
8. recién entonces dejar `CHECKOUT_SCHEMA_READY=true`.
