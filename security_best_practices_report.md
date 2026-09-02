# Supabase Schema, RLS, and Service Security Audit

## Executive Summary

The repository does not contain the canonical production schema or its core RLS policies. `supabase/migrations/20260815020000_full_production_schema.sql` is explicitly a no-op, so this audit can verify only incremental database changes and application-side service behavior. The highest-risk issue visible in code is reliance on service-role reads/writes for user-facing data-access services, which bypass RLS and makes authorization correctness depend entirely on every caller. The second major risk is the absence of a checked-in, reproducible RLS/index contract for the core multi-tenant tables.

## Findings

### SUPA-001: Core RLS policy coverage is not reviewable or reproducible

- **Severity:** High
- **Location:** `supabase/migrations/20260815020000_full_production_schema.sql:1-5`
- **Evidence:** The migration says `-- Baseline marker only.` and `-- The production schema already exists in Supabase ... Keep this migration as a no-op`.
- **Impact:** Reviewers and CI cannot prove that `tenants`, `memberships`, `orders`, `subscriptions`, `audit_logs`, `invitations`, `developer_api_keys`, `coupons`, `payments`, `profiles`, or `systems` have RLS enabled and policies scoped to `auth.uid()`/tenant membership. A drifted or missing production policy can expose one workspace's rows to another through the anon client.
- **Fix:** Export the linked production schema/policies into a versioned migration or declarative schema. Add CI checks that every exposed table has RLS enabled and that tenant-owned tables have explicit SELECT/INSERT/UPDATE/DELETE policies. Keep service-role-only tables such as `payment_webhook_events` explicitly deny-by-default.
- **False-positive notes:** Policies may exist in the linked Supabase project; verify with `pg_policies`, `pg_class.relrowsecurity`, and the deployed migration history before treating this as a production incident.

### SUPA-002: User-facing order lookup bypasses RLS with the service-role client

- **Severity:** High
- **Location:** `src/shared/lib/supabase/services/order/get-order-by-id.service.ts:3-12,45-49`
- **Evidence:** `getOrderById` constructs `createAdminClient()` and queries `orders` and `tenants` by only `orderId`/`subscription_id`. The caller later checks `order.profile_id` (`src/shared/lib/actions/billing/get-order.action.ts:30-54`), but the service itself is unscoped.
- **Impact:** Any future caller that forgets the post-query ownership check, or exposes this service through a new route, can read another user's order, payment state, system metadata, and tenant slug. Service-role access also bypasses any corrective RLS policy.
- **Fix:** Split the privileged webhook/provisioning lookup from the user lookup. Make the user-facing service accept `profileId` and query `.eq('profile_id', profileId)` with the session client. Keep an explicitly named admin-only service for webhook code and add tests asserting cross-profile lookups return no row.
- **Mitigation:** Require a profile/tenant scope parameter in the service signature and reject empty scopes.

### SUPA-003: Tenant and subscription context services bypass RLS

- **Severity:** High
- **Location:** `src/shared/lib/supabase/services/tenants/get-tenant-by-slug.service.ts:1-12`; `src/shared/lib/supabase/services/subscriptions/get-subscription-by-system-and-tenant.service.ts:1-12`
- **Evidence:** Both services instantiate `createAdminClient()` and resolve rows from attacker-influenced identifiers without a membership/profile argument. `resolveDeveloperContextAction` calls them after API-key validation (`src/shared/lib/actions/developer/context/resolve-developer-context.action.ts:29-52`).
- **Impact:** The developer path currently checks the system ID, but the services are unsafe reusable primitives. A caller can resolve arbitrary tenant/subscription records by slug/ID, bypassing RLS and potentially returning workspace metadata across tenants.
- **Fix:** Use the session/developer-authorized client for ordinary reads, or make the admin versions private and require an already verified developer context. For subscriptions, constrain by both `subscription_id` and the tenant's `system_id`; for tenant lookup, require the expected system ID as a query predicate.

### SUPA-004: Audit-log service silently drops security-relevant write failures

- **Severity:** Medium
- **Location:** `src/shared/lib/supabase/services/audit-logs/create-audit-log.service.ts:25-46`
- **Evidence:** On insert failure it logs `Audit Log Creation Error` and returns `null` instead of throwing or returning a typed failure.
- **Impact:** Administrative actions can succeed without an audit record, undermining incident response and compliance expectations. Callers cannot distinguish “written” from “write failed”; `createAuditLogAction` always returns `{ success: true, log }` even when `log` is null (`src/shared/lib/actions/audit-logs/create-audit-log.action.ts:18-24`).
- **Fix:** Throw a domain error or return `{ success: false }` from the service/action. Do not report success when persistence failed. Add a test for RLS/DB failure.

### SUPA-005: Generic Supabase helper accepts unrestricted table, column, and select identifiers

- **Severity:** Medium
- **Location:** `src/shared/lib/supabase/services/get-what-by-from.service.ts:4-22`
- **Evidence:** `from`, `what`, `by`, and `by2` are arbitrary strings passed directly to `.from()`, `.select()`, and `.eq()`.
- **Impact:** Although current call sites are internal, this helper makes it easy for a future action to turn request input into cross-table reads or PostgREST embedded selections. It also defeats static review of tenant scoping.
- **Fix:** Remove the generic helper in favor of typed, per-entity services, or constrain arguments to literal unions and fixed select lists. Never pass request-derived identifiers to this helper.

### SUPA-006: Security-definer payment functions use the exposed `public` search path

- **Severity:** Medium
- **Location:** `supabase/migrations/20260825130000_harden_kashier_provisioning.sql:28-36,50-66,84-87`
- **Evidence:** Functions are `security definer set search_path = public`; the functions execute privileged writes and read `%rowtype` records. Execute is revoked from public roles at lines 120-124, which is good defense-in-depth.
- **Impact:** A security-definer function should use an empty, controlled search path. Keeping `public` in the path increases the risk of name resolution surprises if mutable objects are introduced there later.
- **Fix:** Use `set search_path = ''` and schema-qualify every relation/type/function reference, or move private functions to a non-exposed schema. Retain explicit `REVOKE EXECUTE` and service-role grants.

### SUPA-007: FK-side indexes are not established for most multi-tenant relationships

- **Severity:** Medium (performance; High where RLS policies depend on the columns)
- **Location:** `supabase/migrations/20260825130000_harden_kashier_provisioning.sql:23-26`
- **Evidence:** The migration adds indexes for `payments.order_id`, `subscriptions.order_id`, `memberships(profile_id, tenant_id)`, and `tenants.subscription_id`, but no indexes for the other FK columns represented in `src/shared/types/database.types.ts`: `audit_logs.tenant_id/actor_id`, `invitations.tenant_id/invited_by`, `orders.profile_id/system_id/coupon_id/subscription_id`, `subscriptions.profile_id/system_id`, `tenants.owner_id/system_id`, `developer_api_keys.system_id`, `coupons.system_id/created_by`, `coupon_usages.*`, and `payment_webhook_events.order_id`.
- **Impact:** Tenant membership/RLS checks and common joins can degrade to sequential scans as data grows. Missing indexes on policy predicates can amplify authorization latency and lock contention.
- **Fix:** Compare the live `pg_indexes` catalog with the FK list and add indexes to referencing columns used by joins, filters, or RLS. Avoid duplicate indexes and use partial indexes where status/null predicates justify them.
- **False-positive notes:** The production schema may already define these indexes; this cannot be confirmed from the checked-in files.

### SUPA-008: Service error contracts are inconsistent

- **Severity:** Low/Medium
- **Location:** `src/shared/lib/supabase/services/audit-logs/create-audit-log.service.ts:41-43`; `src/shared/lib/supabase/services/invitations/update-invitation-by-token.service.ts:14-26`; `src/shared/lib/supabase/services/coupons/get-coupon-by-id.service.ts:15-19`; `src/shared/lib/supabase/services/coupons/delete-coupon.service.ts:13-15`
- **Evidence:** Services variously return `null`, return `{ data, error }`, wrap errors in new messages, or throw raw Supabase errors.
- **Impact:** Actions cannot consistently map not-found, authorization, conflict, and database failures to safe responses. Raw database messages can leak implementation details, while silent/null results can be mistaken for success.
- **Fix:** Define a small domain error/result convention per service family: expected not-found as `null`, operational failures as typed errors, and user-facing actions map those errors to stable codes. Preserve the original error as a cause for server logs only.

## Verification Queries

Run these against the linked Supabase project before remediation:

```sql
select c.relname, c.relrowsecurity, c.relforcerowsecurity
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
  and c.relname in ('tenants','memberships','orders','subscriptions','audit_logs',
    'invitations','developer_api_keys','coupons','coupon_usages','payments',
    'payment_webhook_events','profiles','systems');

select schemaname, tablename, policyname, roles, cmd, qual, with_check
from pg_policies where schemaname = 'public';

select conrelid::regclass as table_name,
       conname,
       pg_get_constraintdef(oid) as definition
from pg_constraint
where contype = 'f' and connamespace = 'public'::regnamespace;

select tablename, indexname, indexdef
from pg_indexes where schemaname = 'public';
```

## Positive Controls Observed

- `payment_webhook_events` has RLS enabled and a service-role-only policy in `20260825130000_harden_kashier_provisioning.sql:16-21`.
- Privileged payment/provisioning RPC execution is revoked from `public`, `anon`, and `authenticated` and granted only to `service_role` (`:120-129`).
- Payment/order and membership uniqueness indexes are explicitly added (`:23-26`).
- User-facing order cancellation includes both `order_id` and authenticated `profile_id` predicates (`src/shared/lib/supabase/services/order/cancel-pending-order.service.ts`).
- Developer context checks the API key's system against the tenant system before returning a live context (`src/shared/lib/actions/developer/context/resolve-developer-context.action.ts:40`).

