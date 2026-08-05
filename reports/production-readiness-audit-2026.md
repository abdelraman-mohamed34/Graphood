# Graphood Production Readiness Audit — 2026

## Current status

The application has a functioning Next.js App Router foundation with localized public pages, authentication, tenant dashboards, developer systems, marketplace checkout, subscription provisioning, and payment-provider route handlers.

The codebase is strict-TypeScript clean and ESLint clean at the time of this audit:

- `npx tsc --noEmit` — passed
- `npm run lint` — passed with zero errors and warnings
- Production Next.js build — passed after replacing build-time Google font downloads with local Fontsource assets

The React Query layer now uses a centralized hierarchical key factory, shared stale/gc defaults, consistent server hydration keys, and targeted mutation invalidation. Duplicate API-key hooks and duplicate tenant-membership queries were consolidated.

## Security audit results

### Database and RLS

`supabase/migrations/20260805010000_production_rls.sql` enables RLS for the application tables and storage objects. Policies enforce:

- profile self-access and controlled shared-tenant visibility;
- public-or-owner system access;
- active tenant membership for tenant and membership data;
- manager-only tenant, invitation, and membership mutations;
- owner-scoped developer API keys;
- owner-scoped coupon management and user-scoped coupon usage;
- owner-scoped orders and payments;
- user-rooted avatar paths and manager-controlled tenant-logo paths.

Privileged service-role access is isolated to server-only modules and is used only after an application-layer authentication/authorization check.

### Webhooks and payments

Paymob payloads are schema-validated and protected by a constant-time secret comparison. Browser-callable actions cannot mark an order paid; payment confirmation is reserved for provider-verified webhook processing. Stripe currently returns `503` until signed-event verification and provider processing are implemented.

### Data exposure

Supabase service queries use explicit column selections rather than wildcard rows. API-key mutation responses exclude key hashes and encrypted key material. General invitation, coupon, system, tenant, subscription, and billing services return narrowed shapes where callers do not need the complete database record. Admin clients and encryption utilities are marked server-only.

### Authorization and validation

Server Actions re-check authentication and resource ownership/tenant permissions at their own boundary. UUIDs, locale/tenant context, invitation tokens, files, coupon inputs, and developer API-key payloads are validated with Zod before service calls.

## Remaining work and release gates

1. Apply the production RLS/storage migration to the target Supabase project and verify policies against production roles and storage bucket visibility.
2. Configure and test Paymob webhook delivery with production secrets, replay protection, and provider-specific signature semantics.
3. Implement Stripe signed-event verification and idempotent event handling before enabling the Stripe route.
4. Add production rate limiting and monitoring for email delivery, API-key verification, coupon validation, and payment endpoints.
5. Run end-to-end tests against a staging Supabase project, especially invitation acceptance, ownership transfer, concurrent order payment, coupon idempotency, and RLS cross-tenant denial cases.
6. Confirm environment variables are configured in the deployment platform; never expose service-role, payment, email, encryption, or webhook secrets through `NEXT_PUBLIC_` variables.

## Conclusion

The repository is structurally ready for staging deployment and static verification. Production launch remains gated on applying the database migration, completing provider-specific webhook integrations, and executing staging security/financial workflow tests.
