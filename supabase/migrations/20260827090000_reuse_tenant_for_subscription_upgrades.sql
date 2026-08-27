create or replace function public.provision_paid_order_atomic(p_order_id uuid, p_webhook_event_id uuid default null)
returns table(subscription_id uuid, tenant_id uuid, membership_id uuid, is_existing boolean)
language plpgsql security definer set search_path = public as $$
declare
  v_order public.orders%rowtype;
  v_email text;
  v_subscription_id uuid;
  v_tenant_id uuid;
  v_previous_subscription_id uuid;
  v_membership_id uuid;
  v_existing boolean := true;
  v_now timestamptz := now();
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'order % not found', p_order_id; end if;
  if v_order.status <> 'PAID' then raise exception 'order % is not paid', p_order_id; end if;
  select email into v_email from public.profiles where id = v_order.profile_id;
  if nullif(trim(coalesce(v_email, '')), '') is null then raise exception 'profile % has no email', v_order.profile_id; end if;

  select id into v_subscription_id from public.subscriptions where order_id = v_order.id for update;
  if v_subscription_id is null then
    v_existing := false;
    insert into public.subscriptions(order_id, profile_id, system_id, plan_name, license_type, billing_interval, price, currency, status, start_date, auto_renew)
    values (v_order.id, v_order.profile_id, v_order.system_id,
      case when v_order.license_type = 'SUBSCRIPTION' then coalesce(v_order.plan, 'STARTER') else v_order.license_type end,
      v_order.license_type,
      case when v_order.license_type = 'SUBSCRIPTION' then 'MONTHLY' else 'ONE_TIME' end,
      v_order.amount, coalesce(v_order.currency, 'EGP'), 'ACTIVE', v_now, v_order.license_type = 'SUBSCRIPTION')
    returning id into v_subscription_id;
    update public.orders set subscription_id = v_subscription_id, updated_at = v_now where id = v_order.id;
  end if;

  select id, subscription_id into v_tenant_id, v_previous_subscription_id
  from public.tenants
  where owner_id = v_order.profile_id and system_id = v_order.system_id
  for update;
  if found then
    if v_previous_subscription_id is distinct from v_subscription_id then
      if v_previous_subscription_id is not null then
        update public.subscriptions set status = 'CANCELED', auto_renew = false, updated_at = v_now
        where id = v_previous_subscription_id and status in ('ACTIVE', 'TRIAL', 'PAST_DUE');
      end if;
      update public.tenants set subscription_id = v_subscription_id, updated_at = v_now where id = v_tenant_id;
    end if;
  else
    v_existing := false;
    insert into public.tenants(subscription_id, system_id, owner_id, name, slug, email, status)
    values (v_subscription_id, v_order.system_id, v_order.profile_id, 'Workspace', 'workspace-' || replace(v_subscription_id::text, '-', ''), v_email, 'ACTIVE')
    returning id into v_tenant_id;
  end if;

  select id into v_membership_id from public.memberships where tenant_id = v_tenant_id and profile_id = v_order.profile_id for update;
  if v_membership_id is null then
    v_existing := false;
    insert into public.memberships(profile_id, tenant_id, current_tenant_id, role, permissions, status)
    values (v_order.profile_id, v_tenant_id, v_tenant_id, 'OWNER', '{}'::text[], 'ACTIVE') returning id into v_membership_id;
  end if;
  if p_webhook_event_id is not null then
    update public.payment_webhook_events set processed_at = v_now, error = null, updated_at = v_now where id = p_webhook_event_id;
  end if;
  subscription_id := v_subscription_id;
  tenant_id := v_tenant_id;
  membership_id := v_membership_id;
  is_existing := v_existing;
  return next;
end; $$;
