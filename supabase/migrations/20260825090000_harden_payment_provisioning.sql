-- Harden payment webhook processing and post-checkout provisioning.
-- The webhook handler calls these functions with the Supabase service role only.

create table if not exists public.payment_webhook_events (
  id uuid primary key default uuid_generate_v4(),
  provider public.payment_provider not null,
  event_key text not null,
  order_id uuid references public.orders(id),
  transaction_ref text,
  status text not null,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payment_webhook_events_provider_event_key_key unique (provider, event_key)
);

alter table public.payment_webhook_events enable row level security;

drop policy if exists "service role manages payment webhook events" on public.payment_webhook_events;
create policy "service role manages payment webhook events"
on public.payment_webhook_events
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create unique index if not exists subscriptions_order_id_unique_idx
on public.subscriptions(order_id)
where order_id is not null;

create unique index if not exists memberships_profile_tenant_unique_idx
on public.memberships(profile_id, tenant_id);

create unique index if not exists payments_order_id_unique_idx
on public.payments(order_id);

create unique index if not exists tenants_slug_unique_idx
on public.tenants(slug);

create or replace function public.process_kashier_payment_atomic(
  p_order_id uuid,
  p_transaction_ref text,
  p_amount numeric,
  p_currency text,
  p_status text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_payment_id uuid;
  v_payment_status public.payment_status;
  v_order_status public.order_status;
  v_status text := upper(trim(p_status));
  v_currency text := upper(trim(coalesce(p_currency, '')));
begin
  select *
  into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'order % not found', p_order_id using errcode = 'P0002';
  end if;

  if p_amount <= 0 then
    raise exception 'payment amount must be greater than zero' using errcode = '22023';
  end if;

  if v_currency = '' then
    raise exception 'payment currency is required' using errcode = '22023';
  end if;

  if v_status in ('SUCCESS', 'PAID', 'COMPLETED') then
    v_payment_status := 'SUCCESS'::public.payment_status;
    v_order_status := 'PAID'::public.order_status;
  elsif v_status in ('CANCELED', 'CANCELLED') then
    v_payment_status := 'FAILED'::public.payment_status;
    v_order_status := 'CANCELED'::public.order_status;
  elsif v_status = 'FAILED' then
    v_payment_status := 'FAILED'::public.payment_status;
    v_order_status := 'FAILED'::public.order_status;
  else
    raise exception 'unsupported Kashier payment status: %', p_status using errcode = '22023';
  end if;

  insert into public.payments (
    order_id,
    provider,
    amount,
    currency,
    status,
    transaction_ref,
    paid_at
  )
  values (
    p_order_id,
    'KASHIER'::public.payment_provider,
    p_amount,
    v_currency,
    v_payment_status,
    nullif(trim(coalesce(p_transaction_ref, '')), ''),
    case when v_payment_status = 'SUCCESS'::public.payment_status then now() else null end
  )
  on conflict (order_id) do update set
    amount = excluded.amount,
    currency = excluded.currency,
    status = excluded.status,
    transaction_ref = excluded.transaction_ref,
    paid_at = excluded.paid_at,
    updated_at = now()
  returning id into v_payment_id;

  update public.orders
  set status = v_order_status,
      updated_at = now()
  where id = p_order_id;

  return jsonb_build_object(
    'order_id', p_order_id,
    'payment_id', v_payment_id,
    'order_status', v_order_status,
    'payment_status', v_payment_status
  );
end;
$$;

create or replace function public.record_payment_webhook_event(
  p_provider public.payment_provider,
  p_event_key text,
  p_order_id uuid,
  p_transaction_ref text,
  p_status text,
  p_payload jsonb
)
returns table(
  event_id uuid,
  is_duplicate boolean,
  processed_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event public.payment_webhook_events%rowtype;
begin
  if nullif(trim(p_event_key), '') is null then
    raise exception 'payment webhook event key is required' using errcode = '22023';
  end if;

  insert into public.payment_webhook_events (
    provider,
    event_key,
    order_id,
    transaction_ref,
    status,
    payload
  )
  values (
    p_provider,
    p_event_key,
    p_order_id,
    nullif(trim(coalesce(p_transaction_ref, '')), ''),
    upper(trim(p_status)),
    coalesce(p_payload, '{}'::jsonb)
  )
  on conflict (provider, event_key) do update set
    updated_at = now()
  returning * into v_event;

  event_id := v_event.id;
  is_duplicate := v_event.created_at <> v_event.updated_at;
  processed_at := v_event.processed_at;
  return next;
end;
$$;

create or replace function public.mark_payment_webhook_event_processed(
  p_event_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.payment_webhook_events
  set processed_at = coalesce(processed_at, now()), error = null, updated_at = now()
  where id = p_event_id;
end;
$$;

create or replace function public.mark_payment_webhook_event_failed(
  p_event_id uuid,
  p_error text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.payment_webhook_events
  set error = left(coalesce(p_error, 'Unknown webhook processing error'), 2000), updated_at = now()
  where id = p_event_id;
end;
$$;

create or replace function public.provision_paid_order_atomic(
  p_order_id uuid,
  p_webhook_event_id uuid default null
)
returns table(
  subscription_id uuid,
  tenant_id uuid,
  membership_id uuid,
  is_existing boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_profile_email text;
  v_subscription_id uuid;
  v_tenant_id uuid;
  v_membership_id uuid;
  v_now timestamptz := now();
  v_is_existing boolean := true;
  v_slug text;
begin
  select *
  into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'order % not found', p_order_id using errcode = 'P0002';
  end if;

  if v_order.status <> 'PAID' then
    raise exception 'order % is not paid', p_order_id using errcode = '22023';
  end if;

  if v_order.amount <= 0 then
    raise exception 'order % has invalid amount', p_order_id using errcode = '22023';
  end if;

  select email
  into v_profile_email
  from public.profiles
  where id = v_order.profile_id;

  if nullif(trim(coalesce(v_profile_email, '')), '') is null then
    raise exception 'profile % does not have an email', v_order.profile_id using errcode = '22023';
  end if;

  select id
  into v_subscription_id
  from public.subscriptions
  where order_id = v_order.id
  for update;

  if v_subscription_id is null then
    v_is_existing := false;

    insert into public.subscriptions (
      order_id,
      profile_id,
      system_id,
      plan_name,
      license_type,
      billing_interval,
      price,
      currency,
      status,
      start_date,
      auto_renew
    )
    values (
      v_order.id,
      v_order.profile_id,
      v_order.system_id,
      case
        when v_order.license_type = 'SUBSCRIPTION' then coalesce(v_order.plan, 'STARTER')
        else v_order.license_type
      end,
      v_order.license_type,
      case
        when v_order.license_type = 'SUBSCRIPTION' then 'MONTHLY'::public.billing_interval
        else 'ONE_TIME'::public.billing_interval
      end,
      v_order.amount,
      coalesce(v_order.currency, 'EGP'),
      'ACTIVE'::public.subscription_status,
      v_now,
      v_order.license_type = 'SUBSCRIPTION'
    )
    returning id into v_subscription_id;
  end if;

  if v_order.subscription_id is distinct from v_subscription_id then
    update public.orders
    set subscription_id = v_subscription_id, updated_at = v_now
    where id = v_order.id;
  end if;

  select id
  into v_tenant_id
  from public.tenants
  where public.tenants.subscription_id = v_subscription_id
  for update;

  if v_tenant_id is null then
    v_is_existing := false;
    v_slug := 'workspace-' || replace(v_subscription_id::text, '-', '');

    insert into public.tenants (
      subscription_id,
      system_id,
      owner_id,
      name,
      slug,
      email,
      status
    )
    values (
      v_subscription_id,
      v_order.system_id,
      v_order.profile_id,
      'Workspace',
      v_slug,
      v_profile_email,
      'ACTIVE'::public.global_status
    )
    returning id into v_tenant_id;
  end if;

  select id
  into v_membership_id
  from public.memberships
  where public.memberships.tenant_id = v_tenant_id
    and public.memberships.profile_id = v_order.profile_id
  for update;

  if v_membership_id is null then
    v_is_existing := false;

    insert into public.memberships (
      profile_id,
      tenant_id,
      current_tenant_id,
      role,
      permissions,
      status
    )
    values (
      v_order.profile_id,
      v_tenant_id,
      v_tenant_id,
      'OWNER'::public.membership_role,
      '{}'::text[],
      'ACTIVE'::public.global_status
    )
    returning id into v_membership_id;
  end if;

  if p_webhook_event_id is not null then
    update public.payment_webhook_events
    set processed_at = v_now, error = null, updated_at = v_now
    where id = p_webhook_event_id;
  end if;

  subscription_id := v_subscription_id;
  tenant_id := v_tenant_id;
  membership_id := v_membership_id;
  is_existing := v_is_existing;
  return next;
end;
$$;

revoke all on function public.record_payment_webhook_event(public.payment_provider, text, uuid, text, text, jsonb) from public, anon, authenticated;
revoke all on function public.mark_payment_webhook_event_processed(uuid) from public, anon, authenticated;
revoke all on function public.mark_payment_webhook_event_failed(uuid, text) from public, anon, authenticated;
revoke all on function public.process_kashier_payment_atomic(uuid, text, numeric, text, text) from public, anon, authenticated;
revoke all on function public.provision_paid_order_atomic(uuid, uuid) from public, anon, authenticated;
grant execute on function public.record_payment_webhook_event(public.payment_provider, text, uuid, text, text, jsonb) to service_role;
grant execute on function public.mark_payment_webhook_event_processed(uuid) to service_role;
grant execute on function public.mark_payment_webhook_event_failed(uuid, text) to service_role;
grant execute on function public.process_kashier_payment_atomic(uuid, text, numeric, text, text) to service_role;
grant execute on function public.provision_paid_order_atomic(uuid, uuid) to service_role;
