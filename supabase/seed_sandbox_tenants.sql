-- Creates two active sandbox tenants attached to one dedicated sandbox system.
--
-- This schema does not have plans or billing_statuses tables. Plan selection is
-- snapshotted on orders.plan and subscriptions.plan_name; lifecycle state is
-- stored in the order_status, subscription_status, and global_status enums.
--
-- A public.profiles row is intentionally reused because profiles.id references
-- auth.users.id. Run this only after at least one application user exists.

begin;

do $seed$
declare
    v_owner_id uuid;
    v_system_id constant uuid := 'a1111111-1111-4111-8111-111111111111';
    v_alpha_order_id constant uuid := 'a2111111-1111-4111-8111-111111111111';
    v_beta_order_id constant uuid := 'a2222222-2222-4222-8222-222222222222';
    v_alpha_subscription_id constant uuid := 'a3111111-1111-4111-8111-111111111111';
    v_beta_subscription_id constant uuid := 'a3222222-2222-4222-8222-222222222222';
    v_alpha_tenant_id constant uuid := 'a4111111-1111-4111-8111-111111111111';
    v_beta_tenant_id constant uuid := 'a4222222-2222-4222-8222-222222222222';
begin
    select p.id
      into v_owner_id
      from public.profiles as p
     where p.email is not null
     order by p.created_at, p.id
     limit 1;

    if v_owner_id is null then
        raise exception
            'Sandbox tenant seed requires at least one public.profiles row with an email';
    end if;

    insert into public.systems (
        id, name, slug, description, owner_id, currency, status,
        starter_price, pro_price, business_price, reseller_price, exclusive_price
    ) values (
        v_system_id,
        'Sandbox Test System',
        'sandbox-test-system',
        'Shared application instance for sandbox tenant seeds.',
        v_owner_id,
        'EGP',
        'ACTIVE',
        100,
        200,
        300,
        0,
        0
    )
    on conflict do nothing;

    if not exists (select 1 from public.systems where id = v_system_id) then
        raise exception
            'System slug sandbox-test-system is already assigned to another system id';
    end if;

    -- Orders must exist first with subscription_id null. This breaks the
    -- orders <-> subscriptions foreign-key cycle used by the service layer.
    insert into public.orders (
        id, system_id, subscription_id, profile_id, amount, currency, status,
        description, plan, license_type, original_amount, discount_amount
    ) values
        (
            v_alpha_order_id, v_system_id, null, v_owner_id, 100, 'EGP', 'PAID',
            'Sandbox seed order for center-alpha-test', 'STARTER',
            'SUBSCRIPTION', 100, 0
        ),
        (
            v_beta_order_id, v_system_id, null, v_owner_id, 100, 'EGP', 'PAID',
            'Sandbox seed order for center-beta-test', 'STARTER',
            'SUBSCRIPTION', 100, 0
        )
    on conflict (id) do nothing;

    insert into public.subscriptions (
        id, system_id, plan_name, billing_interval, price, currency, status,
        start_date, auto_renew, license_type, profile_id, order_id
    ) values
        (
            v_alpha_subscription_id, v_system_id, 'STARTER', 'MONTHLY',
            100, 'EGP', 'ACTIVE', now(), true, 'SUBSCRIPTION',
            v_owner_id, v_alpha_order_id
        ),
        (
            v_beta_subscription_id, v_system_id, 'STARTER', 'MONTHLY',
            100, 'EGP', 'ACTIVE', now(), true, 'SUBSCRIPTION',
            v_owner_id, v_beta_order_id
        )
    on conflict (id) do nothing;

    -- Complete the reverse half of the circular relationship.
    update public.orders
       set subscription_id = case id
           when v_alpha_order_id then v_alpha_subscription_id
           when v_beta_order_id then v_beta_subscription_id
       end,
           status = 'PAID',
           updated_at = now()
     where id in (v_alpha_order_id, v_beta_order_id);

    -- tenants.slug is checked by the application but is not UNIQUE in the
    -- captured database schema, so WHERE NOT EXISTS is the conflict guard.
    insert into public.tenants (
        id, system_id, owner_id, subscription_id, name, slug, status,
        email, timezone
    )
    select
        v_alpha_tenant_id, v_system_id, v_owner_id, v_alpha_subscription_id,
        'Center Alpha Test', 'center-alpha-test', 'ACTIVE', p.email,
        'Africa/Cairo'
    from public.profiles as p
    where p.id = v_owner_id
      and not exists (
          select 1 from public.tenants where slug = 'center-alpha-test'
      )
    on conflict (id) do nothing;

    insert into public.tenants (
        id, system_id, owner_id, subscription_id, name, slug, status,
        email, timezone
    )
    select
        v_beta_tenant_id, v_system_id, v_owner_id, v_beta_subscription_id,
        'Center Beta Test', 'center-beta-test', 'ACTIVE', p.email,
        'Africa/Cairo'
    from public.profiles as p
    where p.id = v_owner_id
      and not exists (
          select 1 from public.tenants where slug = 'center-beta-test'
      )
    on conflict (id) do nothing;
end
$seed$;

commit;

select id, slug, status from tenants
where slug in ('center-alpha-test', 'center-beta-test');
