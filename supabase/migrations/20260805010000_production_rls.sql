-- Production authorization baseline. Service-role clients intentionally bypass
-- these policies; every such call must first authorize in application code.
create schema if not exists private;

create or replace function private.is_tenant_member(target_tenant uuid)
returns boolean language sql stable security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.memberships
    where tenant_id = target_tenant
      and profile_id = (select auth.uid())
      and status = 'ACTIVE'
  );
$$;

create or replace function private.can_manage_tenant(target_tenant uuid)
returns boolean language sql stable security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.memberships
    where tenant_id = target_tenant
      and profile_id = (select auth.uid())
      and status = 'ACTIVE'
      and (role in ('OWNER', 'ADMIN') or permissions && array['tenant.manage', 'members.invite', 'members.remove']::text[])
  );
$$;

revoke all on function private.is_tenant_member(uuid) from public;
revoke all on function private.can_manage_tenant(uuid) from public;
grant usage on schema private to authenticated;
grant execute on function private.is_tenant_member(uuid) to authenticated;
grant execute on function private.can_manage_tenant(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.systems enable row level security;
alter table public.tenants enable row level security;
alter table public.memberships enable row level security;
alter table public.invitations enable row level security;
alter table public.subscriptions enable row level security;
alter table public.orders enable row level security;
alter table public.payments enable row level security;
alter table public.developer_api_keys enable row level security;
alter table public.coupons enable row level security;
alter table public.coupon_usages enable row level security;
alter table public.tags enable row level security;

create policy "profiles_select_self_or_shared_tenant" on public.profiles for select to authenticated
using (id = (select auth.uid()) or exists (
  select 1 from public.memberships mine join public.memberships theirs on mine.tenant_id = theirs.tenant_id
  where mine.profile_id = (select auth.uid()) and theirs.profile_id = profiles.id and mine.status = 'ACTIVE'
));
create policy "profiles_insert_self" on public.profiles for insert to authenticated with check (id = (select auth.uid()));
create policy "profiles_update_self" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "systems_select_public_or_owner" on public.systems for select to anon, authenticated
using ((is_public and status = 'ACTIVE') or owner_id = (select auth.uid()));
create policy "systems_insert_owner" on public.systems for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "systems_update_owner" on public.systems for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "systems_delete_owner" on public.systems for delete to authenticated using (owner_id = (select auth.uid()));

create policy "tenants_select_member" on public.tenants for select to authenticated using (private.is_tenant_member(id));
create policy "tenants_update_manager" on public.tenants for update to authenticated using (private.can_manage_tenant(id)) with check (private.can_manage_tenant(id));

create policy "memberships_select_tenant" on public.memberships for select to authenticated
using (profile_id = (select auth.uid()) or private.is_tenant_member(tenant_id));
create policy "memberships_delete_self_or_manager" on public.memberships for delete to authenticated
using (profile_id = (select auth.uid()) or private.can_manage_tenant(tenant_id));

create policy "invitations_select_recipient_or_manager" on public.invitations for select to authenticated
using (lower(email) = lower(coalesce((select auth.jwt() ->> 'email'), '')) or private.can_manage_tenant(tenant_id));
create policy "invitations_manage_tenant" on public.invitations for all to authenticated
using (private.can_manage_tenant(tenant_id)) with check (private.can_manage_tenant(tenant_id));

create policy "subscriptions_select_owner_or_tenant" on public.subscriptions for select to authenticated
using (profile_id = (select auth.uid()) or exists (select 1 from public.tenants t where t.subscription_id = subscriptions.id and private.is_tenant_member(t.id)));

create policy "orders_select_own" on public.orders for select to authenticated using (profile_id = (select auth.uid()));
create policy "orders_insert_own" on public.orders for insert to authenticated with check (profile_id = (select auth.uid()));
create policy "orders_update_pending_own" on public.orders for update to authenticated
using (profile_id = (select auth.uid()) and status = 'PENDING')
with check (profile_id = (select auth.uid()) and status = 'PENDING');
create policy "orders_delete_pending_own" on public.orders for delete to authenticated using (profile_id = (select auth.uid()) and status = 'PENDING');

create policy "payments_select_own_order" on public.payments for select to authenticated
using (exists (select 1 from public.orders o where o.id = payments.order_id and o.profile_id = (select auth.uid())));
create policy "payments_insert_own_order" on public.payments for insert to authenticated
with check (exists (select 1 from public.orders o where o.id = payments.order_id and o.profile_id = (select auth.uid()) and o.status = 'PENDING'));

create policy "developer_keys_system_owner" on public.developer_api_keys for all to authenticated
using (exists (select 1 from public.systems s where s.id = developer_api_keys.system_id and s.owner_id = (select auth.uid())))
with check (exists (select 1 from public.systems s where s.id = developer_api_keys.system_id and s.owner_id = (select auth.uid())));

create policy "coupons_select_active_or_owner" on public.coupons for select to authenticated
using (is_active or created_by = (select auth.uid()));
create policy "coupons_manage_owner" on public.coupons for all to authenticated
using (created_by = (select auth.uid())) with check (created_by = (select auth.uid()));
create policy "coupon_usages_select_own" on public.coupon_usages for select to authenticated using (profile_id = (select auth.uid()));
create policy "coupon_usages_insert_own" on public.coupon_usages for insert to authenticated with check (profile_id = (select auth.uid()));

create policy "tags_public_read" on public.tags for select to anon, authenticated using (true);

-- Object paths are always rooted in the authenticated owner/resource id.
create policy "avatars_owner_all" on storage.objects for all to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "tenant_logos_member_read" on storage.objects for select to authenticated
using (bucket_id = 'tenant-logos' and private.is_tenant_member(((storage.foldername(name))[1])::uuid));
create policy "tenant_logos_manager_write" on storage.objects for insert to authenticated
with check (bucket_id = 'tenant-logos' and private.can_manage_tenant(((storage.foldername(name))[1])::uuid));
create policy "tenant_logos_manager_update" on storage.objects for update to authenticated
using (bucket_id = 'tenant-logos' and private.can_manage_tenant(((storage.foldername(name))[1])::uuid))
with check (bucket_id = 'tenant-logos' and private.can_manage_tenant(((storage.foldername(name))[1])::uuid));
create policy "tenant_logos_manager_delete" on storage.objects for delete to authenticated
using (bucket_id = 'tenant-logos' and private.can_manage_tenant(((storage.foldername(name))[1])::uuid));
