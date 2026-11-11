-- Allow server-side demo orders while keeping Mercado Pago orders intact.
-- The orders table remains protected by RLS and server-only grants.

alter table public.orders
  drop constraint if exists orders_provider_check;

alter table public.orders
  add constraint orders_provider_check
  check (provider in ('mercado_pago', 'demo'));
