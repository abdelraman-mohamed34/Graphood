-- Coupon redemption and payment finalization must commit together. The row locks
-- serialize competing callbacks while the unique index makes retries idempotent.
create unique index if not exists coupon_usages_order_id_key
    on public.coupon_usages (order_id);

create index if not exists coupon_usages_coupon_profile_idx
    on public.coupon_usages (coupon_id, profile_id);

create or replace function public.finalize_order_payment(
    p_order_id uuid,
    p_transaction_ref text
) returns setof public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
    v_order public.orders%rowtype;
    v_coupon public.coupons%rowtype;
    v_user_uses bigint;
    v_discount numeric;
begin
    if nullif(btrim(p_transaction_ref), '') is null then
        raise exception 'INVALID_TRANSACTION_REFERENCE';
    end if;

    select * into v_order from public.orders
    where id = p_order_id for update;
    if not found then raise exception 'ORDER_NOT_FOUND'; end if;

    if v_order.status = 'PAID' then
        return next v_order;
        return;
    end if;
    if v_order.status <> 'PENDING' then raise exception 'ORDER_NOT_PENDING'; end if;

    if v_order.coupon_id is not null then
        select * into v_coupon from public.coupons
        where id = v_order.coupon_id for update;

        if not found or not v_coupon.is_active then raise exception 'COUPON_INACTIVE'; end if;
        if v_coupon.system_id <> v_order.system_id then raise exception 'COUPON_SYSTEM_MISMATCH'; end if;
        if v_coupon.starts_at is not null and v_coupon.starts_at > now() then raise exception 'COUPON_NOT_STARTED'; end if;
        if v_coupon.expires_at is not null and v_coupon.expires_at <= now() then raise exception 'COUPON_EXPIRED'; end if;
        if v_coupon.license_type is not null and v_coupon.license_type <> v_order.license_type then raise exception 'COUPON_LICENSE_MISMATCH'; end if;
        if v_coupon.plan is not null and v_coupon.plan is distinct from v_order.plan then raise exception 'COUPON_PLAN_MISMATCH'; end if;
        if v_order.original_amount < v_coupon.min_order_amount then raise exception 'COUPON_MINIMUM_NOT_MET'; end if;
        if v_coupon.max_uses is not null and v_coupon.used_count >= v_coupon.max_uses then raise exception 'COUPON_LIMIT_REACHED'; end if;

        select count(*) into v_user_uses from public.coupon_usages
        where coupon_id = v_coupon.id and profile_id = v_order.profile_id;
        if v_user_uses >= v_coupon.max_uses_per_user then raise exception 'COUPON_USER_LIMIT_REACHED'; end if;

        if v_coupon.discount_type = 'PERCENT' then
            v_discount := v_order.original_amount * v_coupon.discount_value / 100;
            if v_coupon.max_discount is not null then v_discount := least(v_discount, v_coupon.max_discount); end if;
        else
            v_discount := v_coupon.discount_value;
        end if;
        v_discount := round(least(v_order.original_amount, greatest(0, v_discount)), 2);
        if round(v_order.discount_amount, 2) <> v_discount
            or round(v_order.amount, 2) <> round(v_order.original_amount - v_discount, 2)
        then raise exception 'ORDER_TOTAL_MISMATCH'; end if;

        insert into public.coupon_usages (coupon_id, order_id, system_id, profile_id)
        values (v_coupon.id, v_order.id, v_order.system_id, v_order.profile_id)
        on conflict (order_id) do nothing;

        if found then
            update public.coupons set used_count = used_count + 1 where id = v_coupon.id;
        end if;
    end if;

    update public.payments set
        status = 'SUCCESS', transaction_ref = p_transaction_ref, paid_at = now()
    where order_id = v_order.id and status <> 'SUCCESS';
    if not found and not exists (select 1 from public.payments where order_id = v_order.id and status = 'SUCCESS') then
        raise exception 'PAYMENT_NOT_FOUND';
    end if;

    update public.orders set status = 'PAID'
    where id = v_order.id returning * into v_order;
    return next v_order;
end;
$$;

revoke all on function public.finalize_order_payment(uuid, text) from public, anon, authenticated;
grant execute on function public.finalize_order_payment(uuid, text) to service_role;

-- Ask PostgREST to discover the function immediately after this migration runs.
notify pgrst, 'reload schema';
