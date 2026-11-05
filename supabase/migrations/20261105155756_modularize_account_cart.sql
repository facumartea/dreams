-- Modularización aditiva: no cambia tablas, datos, políticas ni contrato RPC.
-- Las auxiliares conservan SECURITY INVOKER y ejecución exclusiva del servidor.
create function public.dreams_cart_sorted(p_items jsonb)
returns jsonb language sql immutable security invoker set search_path = '' as $$
  select coalesce(jsonb_agg(e order by (e->>'id')::bigint), '[]'::jsonb)
  from jsonb_array_elements(p_items) e;
$$;

create function public.dreams_cart_adjust(p_items jsonb, p_entry jsonb, p_kind text)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  target bigint := (p_entry->>'id')::bigint;
  previous integer;
  quantity integer;
  capacity integer;
  desired jsonb;
begin
  select coalesce((e->>'quantity')::integer, 0) into previous
  from jsonb_array_elements(p_items) e where (e->>'id')::bigint = target;
  previous := coalesce(previous, 0);
  quantity := case when p_kind = 'merge'
    then greatest(previous, (p_entry->>'quantity')::integer)
    else previous + (p_entry->>'delta')::integer end;
  if quantity > previous then
    select greatest(0, least(stock, 99)) into capacity
    from public.products where id = target;
    -- No agrega productos desconocidos o sin stock; conserva entradas anteriores.
    quantity := case when capacity is null or capacity = 0
      then previous else least(quantity, capacity) end;
  end if;
  select coalesce(jsonb_agg(e), '[]'::jsonb) into desired
  from jsonb_array_elements(p_items) e where (e->>'id')::bigint <> target;
  if quantity > 0 then
    desired := desired || jsonb_build_array(
      jsonb_build_object('id', target, 'quantity', least(quantity, 99)));
  end if;
  return desired;
end;
$$;

create function public.dreams_cart_desired(p_items jsonb, p_operation jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  desired jsonb := p_items;
  kind text := p_operation->>'type';
  entry jsonb;
begin
  if kind = 'clear' then
    desired := '[]'::jsonb;
  elsif kind = 'consume' then
    -- Una confirmación anterior nunca vacía cambios hechos desde otro dispositivo.
    if public.dreams_cart_sorted(desired) = public.dreams_cart_sorted(p_operation->'items') then
      desired := '[]'::jsonb;
    end if;
  elsif kind = 'remove' then
    select coalesce(jsonb_agg(e), '[]'::jsonb) into desired
    from jsonb_array_elements(desired) e
    where (e->>'id')::bigint <> (p_operation->>'id')::bigint;
  else
    for entry in select value from jsonb_array_elements(
      case when kind = 'merge' then p_operation->'items'
        else jsonb_build_array(p_operation) end)
    loop
      desired := public.dreams_cart_adjust(desired, entry, kind);
    end loop;
  end if;
  if jsonb_array_length(desired) > 30 then
    raise exception 'Cart limit' using errcode = '22023';
  end if;
  return public.dreams_cart_sorted(desired);
end;
$$;

create or replace function public.dreams_cart_operation(p_user_id uuid, p_operation_id uuid, p_operation jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  cart public.account_carts%rowtype;
  prior jsonb;
  desired jsonb;
  kind text := p_operation->>'type';
begin
  -- La capa HTTP vincula el UUID a Auth; sólo service_role puede ejecutar la RPC.
  if p_user_id is null or p_operation_id is null or kind is null
    or kind not in ('delta', 'remove', 'clear', 'merge', 'consume') then
    raise exception 'Invalid cart operation' using errcode = '22023';
  end if;
  insert into public.account_carts(user_id) values(p_user_id) on conflict do nothing;
  -- El lock dura toda la transacción, incluidas auxiliares y registro idempotente.
  select * into cart from public.account_carts where user_id = p_user_id for update;
  select operation into prior from public.account_cart_operations
  where user_id = p_user_id and operation_id = p_operation_id;
  if found then
    if prior <> p_operation then
      raise exception 'Operation identifier reused' using errcode = '22023';
    end if;
    return jsonb_build_object('items', cart.items, 'revision', cart.revision);
  end if;
  desired := public.dreams_cart_desired(cart.items, p_operation);
  update public.account_carts set items = desired, revision = revision + 1, updated_at = now()
  where user_id = p_user_id returning * into cart;
  insert into public.account_cart_operations(user_id, operation_id, operation)
  values(p_user_id, p_operation_id, p_operation);
  return jsonb_build_object('items', cart.items, 'revision', cart.revision);
end;
$$;

revoke all on function public.dreams_cart_sorted(jsonb) from public, anon, authenticated;
revoke all on function public.dreams_cart_adjust(jsonb,jsonb,text) from public, anon, authenticated;
revoke all on function public.dreams_cart_desired(jsonb,jsonb) from public, anon, authenticated;
revoke all on function public.dreams_cart_operation(uuid,uuid,jsonb) from public, anon, authenticated;
grant execute on function public.dreams_cart_sorted(jsonb) to service_role;
grant execute on function public.dreams_cart_adjust(jsonb,jsonb,text) to service_role;
grant execute on function public.dreams_cart_desired(jsonb,jsonb) to service_role;
grant execute on function public.dreams_cart_operation(uuid,uuid,jsonb) to service_role;
notify pgrst, 'reload schema';
