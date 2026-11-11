-- Sólo para PostgreSQL aislado y efímero; nunca ejecutar en Supabase real.
create role anon;
create role authenticated;
create role service_role bypassrls;
create schema auth;
create function auth.uid() returns uuid language sql as 'select null::uuid';
create table auth.users(id uuid primary key);
create table public.products(id bigint primary key, stock integer not null);
insert into auth.users values
('00000000-0000-4000-8000-000000000001'),
('00000000-0000-4000-8000-000000000002');
insert into public.products select value, 99 from generate_series(1,40) value;
insert into public.products values (99,0),(100,2);
grant usage on schema public to service_role, authenticated, anon;
grant select on public.products to service_role;
