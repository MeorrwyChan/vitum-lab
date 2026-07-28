-- Stop exempting $0-priced line items from stock accounting.
--
-- confirm_order_paid and cancel_order both gated their decrement/increment on
-- `v_price > 0 and v_cart_code <> 'bac-water-free'`. The intent was to skip the
-- free-gift SKU — but that is already fully covered by the cart-code term. The
-- extra price term generalised the exemption to ANY line whose stored unit price
-- is 0, silently disabling stock accounting for it.
--
-- That is reachable: the admin product validator explicitly permits price 0 and
-- sale_price 0. Set `sale_price: 0` on a shippable variant for a "free with
-- purchase" promo and every unit ordered ships without ever decrementing
-- inventory — the SKU can be ordered unbounded times while stock reads unchanged.
--
-- Gate purely on the gift cart code. The null/blank guard preserves the previous
-- (protective) behaviour for malformed legacy line items: `null <> 'x'` is null,
-- so those rows were skipped rather than raising, and they still are.

create or replace function public.confirm_order_paid(
  p_order_id text,
  p_pay_currency text default null,
  p_pay_amount numeric default null,
  p_payment_id text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_order public.orders%rowtype;
  v_item jsonb;
  v_cart_code text;
  v_quantity integer;
begin
  if p_order_id is null or btrim(p_order_id) = '' or (p_pay_amount is not null and p_pay_amount < 0) then
    raise exception 'invalid_payment_confirmation' using errcode = '22023';
  end if;
  select * into v_order from public.orders where id = p_order_id for update;
  if not found or v_order.status <> 'pending' then return false; end if;

  for v_item in select value from jsonb_array_elements(v_order.items) loop
    v_cart_code := v_item ->> 'cartCode';
    v_quantity := (v_item ->> 'quantity')::integer;
    if v_quantity <= 0 then raise exception 'invalid_order_quantity' using errcode = '22023'; end if;
    if v_cart_code is not null and btrim(v_cart_code) <> '' and v_cart_code <> 'bac-water-free' then
      perform public.decrement_stock(v_cart_code, v_quantity);
    end if;
  end loop;

  if v_order.discount_code is not null and exists (select 1 from public.promo_codes where code = upper(v_order.discount_code)) then
    update public.promo_codes
       set used_count = used_count + 1
     where code = upper(v_order.discount_code)
       and (max_uses is null or used_count < max_uses);
    if not found then raise exception 'promo_usage_limit:%', v_order.discount_code using errcode = 'P0001'; end if;
  end if;

  update public.orders
     set status = 'confirmed', confirmed_at = now(),
         pay_currency = p_pay_currency, pay_amount = p_pay_amount, payment_id = p_payment_id
   where id = p_order_id;
  return true;
end;
$function$;

-- Cancellation is the exact inverse of a successful, unshipped confirmation.
create or replace function public.cancel_order(
  p_order_id text,
  p_expected_status text,
  p_reason text,
  p_note text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_order public.orders%rowtype;
  v_item jsonb;
  v_cart_code text;
begin
  if p_order_id is null or p_expected_status is null or p_reason is null or btrim(p_reason) = '' then
    raise exception 'invalid_order_cancellation' using errcode = '22023';
  end if;
  select * into v_order from public.orders where id = p_order_id for update;
  if not found or v_order.status <> p_expected_status or v_order.status = 'cancelled' then return false; end if;

  if v_order.status in ('confirmed', 'finished') and v_order.fulfillment_status = 'unfulfilled' then
    for v_item in select value from jsonb_array_elements(v_order.items) loop
      v_cart_code := v_item ->> 'cartCode';
      if v_cart_code is not null and btrim(v_cart_code) <> '' and v_cart_code <> 'bac-water-free' then
        perform public.increment_stock(v_cart_code, (v_item ->> 'quantity')::integer);
      end if;
    end loop;
  end if;

  if v_order.status in ('confirmed', 'finished') and v_order.discount_code is not null then
    update public.promo_codes set used_count = greatest(0, used_count - 1) where code = upper(v_order.discount_code);
  end if;
  delete from public.discount_redemptions where order_id = p_order_id;
  update public.orders
     set status = 'cancelled', cancelled_at = now(), cancel_reason = left(p_reason, 500),
         admin_notes = case when p_note is null or btrim(p_note) = '' then admin_notes
                            else concat_ws(E'\n\n', nullif(admin_notes, ''), left(p_note, 2000)) end
   where id = p_order_id;
  return true;
end;
$function$;

revoke execute on function public.confirm_order_paid(text, text, numeric, text) from public, anon, authenticated;
grant execute on function public.confirm_order_paid(text, text, numeric, text) to service_role;
revoke execute on function public.cancel_order(text, text, text, text) from public, anon, authenticated;
grant execute on function public.cancel_order(text, text, text, text) to service_role;
