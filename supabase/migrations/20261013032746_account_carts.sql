-- Additive, isolated carts. No orders, stock, existing tables or Auth changes.
create table public.account_carts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  items jsonb not null default '[]'::jsonb check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) <= 30),
  revision bigint not null default 0 check (revision >= 0),
  updated_at timestamptz not null default now()
);
create table public.account_cart_operations (
  user_id uuid not null references public.account_carts(user_id) on delete cascade,
  operation_id uuid not null,
  operation jsonb not null,
  created_at timestamptz not null default now(),
  primary key (user_id, operation_id)
);
alter table public.account_carts enable row level security;
alter table public.account_cart_operations enable row level security;
revoke all on public.account_carts, public.account_cart_operations from public, anon, authenticated;
grant select on public.account_carts to authenticated;
grant select, insert, update on public.account_carts to service_role;
grant select, insert on public.account_cart_operations to service_role;
create policy account_carts_owner_read on public.account_carts for select to authenticated using ((select auth.uid()) = user_id);

create function public.dreams_cart_operation(p_user_id uuid, p_operation_id uuid, p_operation jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  cart public.account_carts%rowtype;
  prior jsonb;
  desired jsonb;
  entry jsonb;
  target bigint;
  quantity integer;
  capacity integer;
  old_quantity integer;
  kind text := p_operation->>'type';
begin
  -- Invoker is service_role only. The HTTP layer binds p_user_id to verified Auth.
  if p_user_id is null or p_operation_id is null or kind is null or kind not in ('delta','remove','clear','merge','consume') then raise exception 'Invalid cart operation' using errcode='22023'; end if;
  insert into public.account_carts(user_id) values(p_user_id) on conflict do nothing;
  select * into cart from public.account_carts where user_id=p_user_id for update;
  select operation into prior from public.account_cart_operations where user_id=p_user_id and operation_id=p_operation_id;
  if found then
    if prior <> p_operation then raise exception 'Operation identifier reused' using errcode='22023'; end if;
    return jsonb_build_object('items',cart.items,'revision',cart.revision);
  end if;
  desired := cart.items;
  if kind='clear' then desired := '[]'::jsonb;
  elsif kind='consume' then
    -- Never erase another device's changes after an older confirmation.
    if (select jsonb_agg(e order by (e->>'id')::bigint) from jsonb_array_elements(desired) e) is not distinct from (select jsonb_agg(e order by (e->>'id')::bigint) from jsonb_array_elements(p_operation->'items') e) then desired := '[]'::jsonb; end if;
  elsif kind='remove' then
    target := (p_operation->>'id')::bigint;
    select coalesce(jsonb_agg(e order by (e->>'id')::bigint),'[]'::jsonb) into desired from jsonb_array_elements(desired) e where (e->>'id')::bigint <> target;
  else
    for entry in select value from jsonb_array_elements(case when kind='merge' then p_operation->'items' else jsonb_build_array(p_operation) end)
    loop
      target := (entry->>'id')::bigint;
      select coalesce((e->>'quantity')::integer,0) into old_quantity from jsonb_array_elements(desired) e where (e->>'id')::bigint=target;
      old_quantity := coalesce(old_quantity,0);
      quantity := case when kind='merge' then greatest(old_quantity,(entry->>'quantity')::integer) else old_quantity+(entry->>'delta')::integer end;
      if quantity > old_quantity then
        select greatest(0,least(stock,99)) into capacity from public.products where id=target;
        -- Keep unavailable entries, but never add unknown/out-of-stock products.
        quantity := case when capacity is null or capacity=0 then old_quantity else least(quantity,capacity) end;
      end if;
      select coalesce(jsonb_agg(e),'[]'::jsonb) into desired from jsonb_array_elements(desired) e where (e->>'id')::bigint <> target;
      if quantity>0 then desired := desired || jsonb_build_array(jsonb_build_object('id',target,'quantity',least(quantity,99))); end if;
    end loop;
  end if;
  if jsonb_array_length(desired)>30 then raise exception 'Cart limit' using errcode='22023'; end if;
  select coalesce(jsonb_agg(e order by (e->>'id')::bigint),'[]'::jsonb) into desired from jsonb_array_elements(desired) e;
  update public.account_carts set items=desired,revision=revision+1,updated_at=now() where user_id=p_user_id returning * into cart;
  insert into public.account_cart_operations(user_id,operation_id,operation) values(p_user_id,p_operation_id,p_operation);
  return jsonb_build_object('items',cart.items,'revision',cart.revision);
end;
$$;
revoke all on function public.dreams_cart_operation(uuid,uuid,jsonb) from public, anon, authenticated;
grant execute on function public.dreams_cart_operation(uuid,uuid,jsonb) to service_role;
notify pgrst, 'reload schema';
