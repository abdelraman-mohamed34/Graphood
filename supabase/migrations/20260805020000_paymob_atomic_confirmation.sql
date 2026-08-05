-- Paymob payment identity and provisioning idempotency.
create unique index if not exists payments_transaction_ref_unique
    on public.payments (transaction_ref)
    where transaction_ref is not null;

create unique index if not exists subscriptions_order_id_unique
    on public.subscriptions (order_id)
    where order_id is not null;

create unique index if not exists memberships_profile_tenant_unique
    on public.memberships (profile_id, tenant_id);

create unique index if not exists coupon_usages_order_id_unique
    on public.coupon_usages (order_id);

create or replace function public.confirm_paymob_payment(
    p_paymob_order_id bigint,
    p_transaction_ref text,
    p_amount_cents integer,
    p_currency text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_payment public.payments%rowtype;
    v_order public.orders%rowtype;
    v_subscription public.subscriptions%rowtype;
    v_tenant public.tenants%rowtype;
    v_profile_email text;
    v_inserted integer;
begin
    if p_transaction_ref is null or length(trim(p_transaction_ref)) = 0 then
        raise exception 'Invalid transaction reference';
    end if;

    select p.* into v_payment
    from public.payments p
    where p.provider = 'PAYMOB'
      and p.provider_reference = p_paymob_order_id::text
    for update;

    if not found then
        raise exception 'Paymob payment not found';
    end if;

    select o.* into v_order
    from public.orders o
    where o.id = v_payment.order_id
    for update;

    if not found or v_order.currency <> p_currency
       or p_currency <> 'EGP'
       or round(v_order.amount * 100) <> p_amount_cents then
        raise exception 'Paymob payment mismatch';
    end if;

    -- A repeated delivery of the same event is a successful no-op. A paid
    -- order is never allowed to have its transaction reference overwritten.
    if v_order.status = 'PAID' then
        if v_payment.transaction_ref is distinct from trim(p_transaction_ref) then
            raise exception 'Order already paid with another transaction';
        end if;
        return jsonb_build_object('duplicate', true, 'order_id', v_order.id);
    end if;

    update public.payments
    set status = 'SUCCESS',
        transaction_ref = trim(p_transaction_ref),
        paid_at = now(),
        updated_at = now()
    where id = v_payment.id;

    update public.orders
    set status = 'PAID', updated_at = now()
    where id = v_order.id;

    select s.* into v_subscription
    from public.subscriptions s
    where s.order_id = v_order.id
    for update;

    if not found then
        insert into public.subscriptions (
            system_id, plan_name, billing_interval, price, currency, status,
            start_date, auto_renew, license_type, profile_id, order_id
        ) values (
            v_order.system_id,
            case when v_order.license_type = 'SUBSCRIPTION' then coalesce(v_order.plan, 'STARTER') else v_order.license_type end,
            case when v_order.license_type = 'SUBSCRIPTION' then 'MONTHLY' else 'ONE_TIME' end,
            v_order.amount, v_order.currency, 'ACTIVE', now(),
            v_order.license_type = 'SUBSCRIPTION', v_order.license_type,
            v_order.profile_id, v_order.id
        ) returning * into v_subscription;
    end if;

    update public.orders
    set subscription_id = v_subscription.id
    where id = v_order.id and subscription_id is distinct from v_subscription.id;

    select email into v_profile_email
    from public.profiles
    where id = v_order.profile_id;

    select t.* into v_tenant
    from public.tenants t
    where t.subscription_id = v_subscription.id
    for update;

    if not found then
        insert into public.tenants (
            system_id, owner_id, name, slug, email, status, subscription_id
        ) values (
            v_order.system_id, v_order.profile_id, 'Workspace',
            'workspace-' || substr(gen_random_uuid()::text, 1, 8),
            coalesce(v_profile_email, 'unknown@example.invalid'), 'ACTIVE', v_subscription.id
        ) returning * into v_tenant;
    end if;

    insert into public.memberships (
        profile_id, tenant_id, current_tenant_id, role, status
    ) values (
        v_order.profile_id, v_tenant.id, v_tenant.id, 'OWNER', 'ACTIVE'
    ) on conflict (profile_id, tenant_id) do nothing;

    if v_order.coupon_id is not null then
        insert into public.coupon_usages (
            coupon_id, order_id, system_id, profile_id
        ) values (
            v_order.coupon_id, v_order.id, v_order.system_id, v_order.profile_id
        ) on conflict (order_id) do nothing;

        get diagnostics v_inserted = row_count;
        if v_inserted = 1 then
            update public.coupons
            set used_count = used_count + 1, updated_at = now()
            where id = v_order.coupon_id;
        end if;
    end if;

    return jsonb_build_object(
        'duplicate', false,
        'order_id', v_order.id,
        'subscription_id', v_subscription.id,
        'tenant_id', v_tenant.id
    );
end;
$$;

revoke all on function public.confirm_paymob_payment(bigint, text, integer, text) from public;
grant execute on function public.confirm_paymob_payment(bigint, text, integer, text) to service_role;

create or replace function public.fail_paymob_payment(
    p_paymob_order_id bigint,
    p_amount_cents integer,
    p_currency text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_payment public.payments%rowtype;
    v_order public.orders%rowtype;
begin
    select p.* into v_payment
    from public.payments p
    where p.provider = 'PAYMOB'
      and p.provider_reference = p_paymob_order_id::text
    for update;

    if not found then raise exception 'Paymob payment not found'; end if;

    select o.* into v_order from public.orders o
    where o.id = v_payment.order_id for update;

    if not found or v_order.currency <> p_currency
       or p_currency <> 'EGP'
       or round(v_order.amount * 100) <> p_amount_cents then
        raise exception 'Paymob payment mismatch';
    end if;

    if v_order.status = 'PENDING' then
        update public.payments
        set status = 'FAILED', updated_at = now()
        where id = v_payment.id and status = 'PENDING';
        update public.orders
        set status = 'FAILED', updated_at = now()
        where id = v_order.id and status = 'PENDING';
    end if;

    return jsonb_build_object('order_id', v_order.id, 'status', 'FAILED');
end;
$$;

revoke all on function public.fail_paymob_payment(bigint, integer, text) from public;
grant execute on function public.fail_paymob_payment(bigint, integer, text) to service_role;
