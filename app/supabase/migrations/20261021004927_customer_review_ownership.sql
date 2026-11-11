-- Los valores históricos conservan NULL; no se atribuyen opiniones existentes.
alter table public.reviews add column if not exists operation_id uuid;
create unique index if not exists reviews_owner_operation_unique
    on public.reviews (user_id, operation_id) where operation_id is not null;

-- Mantiene las políticas Admin; no concede edición ni eliminación de otro dueño.
create policy reviews_owner_delete on public.reviews
    for delete to authenticated using ((select auth.uid()) = user_id);
grant delete on public.reviews to authenticated;
-- TRUNCATE omite RLS; ningún cliente debe poder vaciar opiniones ajenas.
-- La moderación Admin usa DELETE limitado, no TRUNCATE.
revoke truncate on public.reviews from anon, authenticated;
