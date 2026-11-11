-- Minimal Data API privileges for authenticated Admin requests.
-- Existing RLS policies still require public.is_dreams_admin() for every row.

grant select on table public.orders to authenticated;
grant select, insert, update, delete on table public.coupons to authenticated;
grant usage, select on sequence public.coupons_id_seq to authenticated;
