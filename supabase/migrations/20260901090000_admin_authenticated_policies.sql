-- Admin requests use the authenticated user's JWT so RLS remains the final
-- authorization boundary even when the server API key is rotated.
create or replace function public.is_dreams_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_dreams_admin() from public, anon;
grant execute on function public.is_dreams_admin() to authenticated, service_role;

drop policy if exists products_admin_insert on public.products;
create policy products_admin_insert on public.products
for insert to authenticated with check (public.is_dreams_admin());
drop policy if exists products_admin_update on public.products;
create policy products_admin_update on public.products
for update to authenticated using (public.is_dreams_admin()) with check (public.is_dreams_admin());
drop policy if exists products_admin_delete on public.products;
create policy products_admin_delete on public.products
for delete to authenticated using (public.is_dreams_admin());

drop policy if exists reviews_admin_update on public.reviews;
create policy reviews_admin_update on public.reviews
for update to authenticated using (public.is_dreams_admin()) with check (public.is_dreams_admin());
drop policy if exists reviews_admin_delete on public.reviews;
create policy reviews_admin_delete on public.reviews
for delete to authenticated using (public.is_dreams_admin());

drop policy if exists coupons_admin_all on public.coupons;
create policy coupons_admin_all on public.coupons
for all to authenticated using (public.is_dreams_admin()) with check (public.is_dreams_admin());

drop policy if exists orders_admin_select on public.orders;
create policy orders_admin_select on public.orders
for select to authenticated using (public.is_dreams_admin());

drop policy if exists inquiries_admin_select on public.inquiries;
create policy inquiries_admin_select on public.inquiries
for select to authenticated using (public.is_dreams_admin());

drop policy if exists profiles_admin_select on public.profiles;
create policy profiles_admin_select on public.profiles
for select to authenticated using (public.is_dreams_admin());
