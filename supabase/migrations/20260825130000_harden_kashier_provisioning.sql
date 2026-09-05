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
  unique (provider, event_key)
);

alter table public.payment_webhook_events enable row level security;
drop policy if exists "service role manages payment webhook events" on public.payment_webhook_events;
create policy "service role manages payment webhook events"
on public.payment_webhook_events for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create unique index if not exists payments_order_id_unique_idx on public.payments(order_id);
create unique index if not exists subscriptions_order_id_unique_idx on public.subscriptions(order_id) where order_id is not null;
create unique index if not exists memberships_profile_tenant_unique_idx on public.memberships(profile_id, tenant_id);
create unique index if not exists tenants_subscription_id_unique_idx on public.tenants(subscription_id);

create or replace function public.record_payment_webhook_event(
  p_provider public.payment_provider,
  p_event_key text,
  p_order_id uuid,
  p_transaction_ref text,
  p_status text,
  p_payload jsonb
) returns table(event_id uuid, is_duplicate boolean, processed_at timestamptz)
language plpgsql security definer set search_path = '' as $$
declare v_event public.payment_webhook_events%rowtype;
begin
  if nullif(trim(p_event_key), '') is null then raise exception 'webhook event key is required'; end if;
  insert into public.payment_webhook_events(provider, event_key, order_id, transaction_ref, status, payload)
  values (p_provider, trim(p_event_key), p_order_id, nullif(trim(coalesce(p_transaction_ref, '')), ''), upper(trim(p_status)), coalesce(p_payload, '{}'::jsonb))
  on conflict (provider, event_key) do update set updated_at = now()
  returning * into v_event;
  event_id := v_event.id;
  is_duplicate := v_event.created_at <> v_event.updated_at;
  processed_at := v_event.processed_at;
  return next;
end; $$;

create or replace function public.mark_payment_webhook_event_processed(p_event_id uuid)
returns void language sql security definer set search_path = '' as $$
  update public.payment_webhook_events
  set processed_at = coalesce(processed_at, now()), error = null, updated_at = now()
  where id = p_event_id;
$$;

create or replace function public.mark_payment_webhook_event_failed(p_event_id uuid, p_error text)
returns void language sql security definer set search_path = '' as $$
  update public.payment_webhook_events
  set error = left(coalesce(p_error, 'Unknown webhook processing error'), 2000), updated_at = now()
  where id = p_event_id;
$$;

create or replace function public.process_kashier_payment_atomic(
  p_order_id uuid, p_transaction_ref text, p_amount numeric, p_currency text, p_status text
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_status text := upper(trim(p_status)); v_payment_status public.payment_status; v_order_status public.order_status; v_payment_id uuid;
begin
  perform 1 from public.orders where id = p_order_id and amount = p_amount and upper(currency) = upper(trim(p_currency)) for update;
  if not found then raise exception 'order % not found', p_order_id; end if;
  if p_amount <= 0 or nullif(trim(p_currency), '') is null then raise exception 'invalid payment amount or currency'; end if;
  if v_status in ('SUCCESS','PAID','COMPLETED') then v_payment_status := 'SUCCESS'; v_order_status := 'PAID';
  elsif v_status = 'FAILED' then v_payment_status := 'FAILED'; v_order_status := 'FAILED';
  elsif v_status in ('CANCELED','CANCELLED') then v_payment_status := 'FAILED'; v_order_status := 'CANCELED';
  else raise exception 'unsupported Kashier status: %', p_status; end if;
  insert into public.payments(order_id, provider, amount, currency, status, transaction_ref, paid_at)
  values (p_order_id, 'KASHIER', p_amount, upper(trim(p_currency)), v_payment_status, nullif(trim(coalesce(p_transaction_ref, '')), ''), case when v_payment_status = 'SUCCESS' then now() end)
  on conflict (order_id) do update set amount = excluded.amount, currency = excluded.currency, status = excluded.status, transaction_ref = coalesce(excluded.transaction_ref, public.payments.transaction_ref), paid_at = coalesce(excluded.paid_at, public.payments.paid_at), updated_at = now()
  returning id into v_payment_id;
  update public.orders set status = v_order_status, updated_at = now() where id = p_order_id;
  return jsonb_build_object('order_id', p_order_id, 'payment_id', v_payment_id, 'order_status', v_order_status, 'payment_status', v_payment_status);
end; $$;

create or replace function public.provision_paid_order_atomic(p_order_id uuid, p_webhook_event_id uuid default null)
returns table(subscription_id uuid, tenant_id uuid, membership_id uuid, is_existing boolean)
language plpgsql security definer set search_path = '' as $$
declare v_order public.orders%rowtype; v_email text; v_subscription_id uuid; v_tenant_id uuid; v_membership_id uuid; v_existing boolean := true; v_now timestamptz := now();
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'order % not found', p_order_id; end if;
  if v_order.status <> 'PAID' then raise exception 'order % is not paid', p_order_id; end if;
  select email into v_email from public.profiles where id = v_order.profile_id;
  if nullif(trim(coalesce(v_email, '')), '') is null then raise exception 'profile % has no email', v_order.profile_id; end if;
  select s.id into v_subscription_id from public.subscriptions s where s.order_id = v_order.id for update;
  if v_subscription_id is null then
    v_existing := false;
    insert into public.subscriptions(order_id, profile_id, system_id, plan_name, license_type, billing_interval, price, currency, status, start_date, auto_renew)
    values(v_order.id, v_order.profile_id, v_order.system_id, case when v_order.license_type = 'SUBSCRIPTION' then coalesce(v_order.plan, 'STARTER') else v_order.license_type end, v_order.license_type, case when v_order.license_type = 'SUBSCRIPTION' then 'MONTHLY' else 'ONE_TIME' end, v_order.amount, coalesce(v_order.currency, 'EGP'), 'ACTIVE', v_now, v_order.license_type = 'SUBSCRIPTION') returning id into v_subscription_id;
    update public.orders set subscription_id = v_subscription_id, updated_at = v_now where id = v_order.id;
  end if;
  if v_order.subscription_id is distinct from v_subscription_id then
    update public.orders set subscription_id = v_subscription_id, updated_at = v_now where id = v_order.id;
  end if;
  select t.id into v_tenant_id from public.tenants t where t.subscription_id = v_subscription_id for update;
  if v_tenant_id is null then
    v_existing := false;
    insert into public.tenants(subscription_id, system_id, owner_id, name, slug, email, status)
    values(v_subscription_id, v_order.system_id, v_order.profile_id, 'Workspace', 'workspace-' || replace(v_subscription_id::text, '-', ''), v_email, 'ACTIVE') returning id into v_tenant_id;
  end if;
  select m.id into v_membership_id from public.memberships m where m.tenant_id = v_tenant_id and m.profile_id = v_order.profile_id for update;
  if v_membership_id is null then
    v_existing := false;
    insert into public.memberships(profile_id, tenant_id, current_tenant_id, role, permissions, status)
    values(v_order.profile_id, v_tenant_id, v_tenant_id, 'OWNER', '{}'::text[], 'ACTIVE') returning id into v_membership_id;
  end if;
  if p_webhook_event_id is not null then update public.payment_webhook_events set processed_at = v_now, error = null, updated_at = v_now where id = p_webhook_event_id; end if;
  subscription_id := v_subscription_id; tenant_id := v_tenant_id; membership_id := v_membership_id; is_existing := v_existing; return next;
end; $$;

revoke all on function public.record_payment_webhook_event(public.payment_provider,text,uuid,text,text,jsonb) from public, anon, authenticated;
revoke all on function public.mark_payment_webhook_event_processed(uuid) from public, anon, authenticated;
revoke all on function public.mark_payment_webhook_event_failed(uuid,text) from public, anon, authenticated;
revoke all on function public.process_kashier_payment_atomic(uuid,text,numeric,text,text) from public, anon, authenticated;
revoke all on function public.provision_paid_order_atomic(uuid,uuid) from public, anon, authenticated;
grant execute on function public.record_payment_webhook_event(public.payment_provider,text,uuid,text,text,jsonb) to service_role;
grant execute on function public.mark_payment_webhook_event_processed(uuid) to service_role;
grant execute on function public.mark_payment_webhook_event_failed(uuid,text) to service_role;
grant execute on function public.process_kashier_payment_atomic(uuid,text,numeric,text,text) to service_role;
grant execute on function public.provision_paid_order_atomic(uuid,uuid) to service_role;
