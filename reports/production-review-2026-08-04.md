# Graphood Production Readiness Review

Generated: 2026-08-04

Reviewer: Principal Software Engineer (AI Technical Auditor)

Repository: online-platform (Graphood)

--------------------------------------------------

# Executive Summary

Graphood is a Next.js 16 and Supabase-based multi-tenant SaaS marketplace. It combines authentication, workspace membership and RBAC, developer-owned systems, API keys, subscriptions, payments, coupons, invitations, localization, and tenant dashboards.

The repository demonstrates a credible product model and several good application-level patterns: server-side user verification, explicit membership helpers, Zod validation on important mutations, service modules around Supabase, route-level tenant checks, API response contracts, and React Query hydration. The architecture is recognizable and can be evolved rather than replaced.

It is not production-ready. The current revision contains direct security and integrity blockers: an unauthenticated endpoint and independently callable Server Action can mark arbitrary orders paid and provision tenants; tenant settings authorize users with read-only permission; invitation acceptance trusts a caller-provided tenant instead of binding the invitation to its tenant; and privileged invitation actions do not scope target IDs to the authorized tenant. In addition, the checked revision fails TypeScript and ESLint validation, has no automated tests, contains no database migrations or RLS policies, and has unfinished payment and email integrations.

Overall engineering maturity is prototype/early beta. The domain decomposition is promising, but privileged workflows and operational controls have not yet reached commercial production standards.

Review basis: all repository-owned source/configuration files were inventoried; security-sensitive actions, routes, services, layouts, hooks, schemas, and configuration were inspected in detail. The installed Next.js 16.2.6 documentation for Server/Client Components, mutations, caching, Route Handlers, Proxy, authentication, data security, and the production checklist was used as the framework-specific baseline. No source files were changed. Non-mutating checks were run with `npm run lint` and `npx tsc --noEmit --incremental false`.

--------------------------------------------------

# Overall Scores

Architecture: 6/10

Security: 2/10

Backend: 4/10

Frontend: 5/10

Database: 3/10

Performance: 5/10

Developer Experience: 3/10

Maintainability: 5/10

Production Readiness: 2/10

Overall: 4/10

--------------------------------------------------

# Critical Issues

## 1. Payment can be forged without provider verification

- **Description:** `POST /api/webhooks/paymob` accepts caller-controlled `orderId` and `transactionRef` without a signature, HMAC, provider lookup, amount/currency comparison, event identity, or authentication. It calls `confirmOrderPayment`, which uses the Supabase service-role client to mark payment and order records successful/paid and then provisions a subscription, tenant, and owner membership. The same privileged operation is exported as a `"use server"` action and is called directly by the browser hook `use-complete-payment.ts`, so it is also exposed through the Server Action transport without authorization. The Stripe webhook merely logs its raw payload and acknowledges it.
- **Why it matters:** Any unauthenticated actor who obtains or guesses an order UUID can create paid entitlements without paying. This is a direct revenue, data-integrity, and tenant-provisioning compromise.
- **File(s):** `src/app/api/webhooks/paymob/route.ts`; `src/shared/lib/actions/billing/process-payment-webhook.action.ts`; `src/shared/lib/supabase/services/billing/confirm-payment.service.ts`; `src/shared/lib/supabase/services/billing/provision-order.service.ts`; `src/features/billing/use-complete-payment.ts`; `src/app/api/webhooks/stripe/route.ts`
- **Risk:** Critical — arbitrary payment confirmation and commercial entitlement creation.
- **Recommendation:** Remove client access to payment confirmation. Verify the payment provider's signed raw webhook payload using a server-only secret, validate event type/status/order/amount/currency/provider reference, enforce replay protection with a unique provider event ID, and perform payment/order/coupon/provisioning updates atomically. Treat provider verification as the only path to paid status.

## 2. Invitation token can grant membership in a different tenant

- **Description:** `acceptInvitationAction(token, tenant)` loads an invitation by token, but separately resolves the caller-provided `tenant` slug and inserts membership into that tenant. It never verifies that the resolved tenant ID equals the invitation's `tenant_id`. The admin client bypasses RLS for the insertion.
- **Why it matters:** A valid invitation recipient can reuse their invitation token with a different tenant slug and be inserted into a workspace to which they were never invited, with the invitation's assigned role.
- **File(s):** `src/shared/lib/actions/invitations/accept-invitation.action.ts`; `src/shared/lib/supabase/services/invitations/get-Invitation-by-token.service.ts`; `src/shared/lib/supabase/services/memberships/insert-membership.service.ts`
- **Risk:** Critical — cross-tenant unauthorized access.
- **Recommendation:** Derive the tenant exclusively from the invitation record, reject any route/display slug mismatch, and atomically consume the invitation and create the membership with database constraints preventing duplicate use.

## 3. Read permission authorizes tenant mutation

- **Description:** `updateTenantAction` permits the update when the caller has either `tenant.manage` or `tenant.read`. The `MEMBER` role receives `tenant.read`, so ordinary members can reach a write action that changes tenant name, slug, email, phone, location, timezone, logo URL, and primary color. The input type is trusted at compile time but the action does not call `updateTenantSchema.parse`/`safeParse` at runtime.
- **Why it matters:** A low-privilege tenant user can mutate workspace identity and configuration, and a forged Server Action payload bypasses client-side typing.
- **File(s):** `src/shared/lib/actions/tenants/update-tenant.action.ts`; `src/shared/lib/schemas/public/role-permissions.ts`; `src/shared/lib/schemas/tenants.schema.ts`; `src/shared/lib/supabase/services/tenants/update-tenant.service.ts`
- **Risk:** Critical — broken access control inside every tenant.
- **Recommendation:** Require a write/manage permission only, validate the action payload at runtime, and enforce the same ownership/tenant predicate in the data layer or database policy.

## 4. The checked revision does not pass release validation

- **Description:** `npx tsc --noEmit --incremental false` reports numerous compile-time errors, including broken form controller props, a sidebar type mismatch, a mutation return-type mismatch, invalid component props, and checkout data access. `npm run lint` reports 43 errors and 44 warnings, including a conditional Hook call and React Hooks violations. No production build was run because it would write build artifacts, but the TypeScript errors are independently sufficient to fail a normal Next.js build.
- **Why it matters:** The application cannot be reproducibly promoted from this revision, and conditional Hook ordering can cause runtime corruption even if checks are bypassed.
- **File(s):** `src/components/ui/form.tsx`; `src/app/[locale]/(dashboard)/(system)/developer/system/[system_id]/coupons/_components/create-coupon-dialog.tsx`; `src/app/[locale]/(dashboard)/(system)/developer/system/[system_id]/_components/system-sidebar.tsx`; `src/shared/lib/hooks/systems/use-system.ts`; `src/app/[locale]/(main)/marketplace/checkout/[order_id]/page.tsx`; `src/app/[locale]/(dashboard)/(tenant)/[tenant_slug]/dashboard/members/invite/_components/role-select.tsx`; plus other files listed by lint.
- **Risk:** Critical — non-buildable/unreleasable revision with known React correctness errors.
- **Recommendation:** Establish a clean build gate and resolve every TypeScript and ESLint error before any production approval. Do not disable these checks to ship.

--------------------------------------------------

# High Priority Issues

## 1. Privileged invitation mutations are not tenant-scoped

- **Description:** After proving membership and permission in the tenant named in the request, `cancelInvitationAction` updates any invitation by caller-provided ID through the admin client. `resendInvitationAction` similarly loads any pending invitation by ID and sends its token, without checking `invitation.tenant_id === membership.tenant_id`. The resend URL is constructed with the caller-provided tenant slug.
- **Why it matters:** An inviter/admin in one workspace can cancel invitations belonging to another workspace, or cause another tenant's invitation token to be emailed with a misleading tenant URL.
- **File(s):** `src/shared/lib/actions/invitations/cancel-invitation.action.ts`; `src/shared/lib/actions/invitations/resend-invitation.action.ts`; `src/shared/lib/supabase/services/invitations/get-invitation-by-id.service.ts`; `src/shared/lib/supabase/services/invitations/update-invitation-by-id.service.ts`
- **Risk:** High — cross-tenant integrity and information-boundary violation.
- **Recommendation:** Include tenant ID in every privileged invitation query/update predicate and verify the invitation belongs to the authorized membership before acting.

## 2. Financial provisioning is non-transactional and only partially idempotent

- **Description:** Payment update, order update, coupon application, subscription creation, tenant creation, membership creation, and reverse-link updates are separate service-role operations. Failures can leave payment successful while the order remains pending, or an order paid without complete provisioning. Concurrent webhook delivery can pass the same status checks and create duplicate side effects unless undocumented database constraints happen to reject them.
- **Why it matters:** Payment systems deliver retries and concurrent events. Partial states produce paid customers without access, duplicate entitlements, or double coupon consumption.
- **File(s):** `src/shared/lib/supabase/services/billing/confirm-payment.service.ts`; `provision-order.service.ts`; `create-subscription.service.ts`; `create-tenant-from-subscription.service.ts`; `create-membership-from-tenant.service.ts`; `src/shared/lib/supabase/services/coupons/apply-coupon.service.ts`
- **Risk:** High — revenue reconciliation and entitlement integrity failures.
- **Recommendation:** Move the state transition into one database transaction/RPC with row locking, unique constraints, explicit state-machine checks, and durable idempotency keys. Add retry-safe reconciliation.

## 3. Database security and schema cannot be reproduced or audited

- **Description:** The `supabase/` directory contains configuration but no migration files, DDL, RLS policies, storage policies, indexes, triggers, constraints, or the `transfer_workspace_ownership` RPC definition. Application code relies heavily on browser Supabase access and therefore on RLS, but those controls are absent from version control.
- **Why it matters:** A production environment cannot be recreated or reviewed from the repository. Tenant isolation may depend on unversioned console state, and schema drift can silently invalidate application assumptions.
- **File(s):** `supabase/config.toml`; absence of `supabase/migrations/`; browser query paths under `src/shared/lib/hooks/` and `src/shared/lib/supabase/services/`
- **Risk:** High — unverifiable tenant isolation, disaster recovery, and deployment consistency.
- **Recommendation:** Version the complete schema and all RLS/storage policies, grants, functions, triggers, constraints, and indexes. Test policies with multiple authenticated tenants and anonymous users in CI.

## 4. Long-lived API secrets are reversibly stored and repeatedly returned

- **Description:** API keys are both SHA-256 hashed and AES-256-CBC encrypted. Listing keys decrypts and returns every full secret on each request. CBC provides no authentication tag, the secret is read at module initialization without format validation, and there is no key versioning/rotation design. A test script prints both plaintext keys and records.
- **Why it matters:** A database plus encryption-secret compromise exposes every historical key. Repeatedly rendering full keys broadens exposure through browser memory, screenshots, logs, support tooling, and XSS. Tampering with ciphertext is not authenticated.
- **File(s):** `src/lib/utils/developer/encrypt-api-key.ts`; `decrypt-api-key.ts`; `hash-api-key.ts`; `src/shared/lib/actions/developer/api-key/list-api-keys.action.ts`; `scripts/create-test-api-key.ts`
- **Risk:** High — system-wide API credential disclosure and weak secret lifecycle.
- **Recommendation:** Store only a one-way verifier and reveal plaintext once at creation/rotation. Store a short identifier/prefix for lookup and display. If recovery is a hard requirement, use authenticated encryption via managed KMS/envelope encryption, key versions, audited access, and rotation.

## 5. No application-level rate limiting or abuse controls

- **Description:** Developer API authentication hashes and looks up every submitted key, then updates `last_used_at` on every accepted request. Public webhook, invitation, authentication, coupon, and developer endpoints have no application-level request quotas, replay cache, or abuse control. Supabase auth rate-limit configuration does not protect custom application routes.
- **Why it matters:** Attackers can brute-force/abuse endpoints, amplify database writes, enumerate tenant slugs with valid system keys, and exhaust email or database resources.
- **File(s):** `src/shared/lib/api/developer/with-developer-context.ts`; `src/shared/lib/actions/developer/api-key/verify-api-key.action.ts`; `src/shared/lib/supabase/services/developer/api-keys/update-api-key-last-used.service.ts`; API route and invitation action files.
- **Risk:** High — denial of service, abuse, and cost amplification.
- **Recommendation:** Add distributed per-IP, per-principal, per-key, and per-tenant limits; batch/throttle last-used writes; add replay/idempotency protection; and return consistent `429` responses.

## 6. Production email delivery is configured to localhost

- **Description:** Invitation delivery uses Nodemailer at `127.0.0.1:1025` with a `.local` sender. The Resend implementation is commented out. The generated acceptance URL omits the locale despite the route living under `[locale]` and ignores the `locale` parameter.
- **Why it matters:** Invitations will fail in a typical production runtime or generate unusable links, blocking a core team-management workflow.
- **File(s):** `src/shared/lib/supabase/services/invitations/send-invitation-email.service.ts`; `src/app/[locale]/(main)/invitations/accept/page.tsx`
- **Risk:** High — core production functionality unavailable.
- **Recommendation:** Configure a real transactional email provider with verified domains, deployment-time validation, localized URLs, delivery failure handling, and integration tests.

--------------------------------------------------

# Medium Priority Issues

## 1. Authorization depends too heavily on callers and RLS

- **Description:** Several service functions accept broad `SupabaseClient` values and issue record mutations by ID without tenant/owner predicates. Safety is split across callers and unknown RLS policies. `list-systems.action.ts` authenticates a user but does not explicitly verify ownership before loading a system's keys; other API-key actions do add that check.
- **Why it matters:** A future caller can easily bypass an intended action-level invariant, and the absent policy definitions prevent verification of defense in depth.
- **File(s):** `src/shared/lib/supabase/services/developer/api-keys/*.ts`; `src/shared/lib/actions/developer/systems/list-systems.action.ts`; `src/shared/lib/supabase/services/memberships/*.ts`
- **Risk:** Medium — fragile access-control composition.
- **Recommendation:** Make the data access layer accept an authorized context and scope every query by owner/tenant; add `server-only`; verify all RLS policies in tests.

## 2. Developer API error mapping is inconsistent

- **Description:** `requireApiAccess` throws plain objects, while `withDeveloperContext` recognizes only `Error` instances and reads `error.message`. Subscription/API denial therefore falls through to `UNKNOWN_ERROR`/500. API-key verification throws free-text errors rather than defined error codes, also producing 500 responses for invalid, disabled, or expired keys.
- **Why it matters:** Clients receive incorrect status codes, monitoring records expected authentication failures as server faults, and API contracts do not match their documented error taxonomy.
- **File(s):** `src/shared/lib/api/developer/guards/require-api-access.ts`; `src/shared/lib/api/developer/with-developer-context.ts`; `src/shared/lib/actions/developer/api-key/verify-api-key.action.ts`; `src/shared/lib/api/developer/errors.ts`
- **Risk:** Medium — unreliable public API behavior and observability.
- **Recommendation:** Use one typed error class/result contract and map all expected failures deterministically.

## 3. Next.js 16 uses the deprecated middleware convention

- **Description:** The installed Next.js 16 guide states that `middleware.ts` has been renamed to `proxy.ts` and the middleware convention is deprecated. The repository still exports `middleware` from `src/middleware.ts`.
- **Why it matters:** The code is already behind the installed framework's migration path and risks future removal or confusing behavior during upgrades.
- **File(s):** `src/middleware.ts`; `package.json`
- **Risk:** Medium — framework compatibility and maintenance risk.
- **Recommendation:** Plan and test the documented Proxy migration after the security blockers are resolved.

## 4. Runtime validation is inconsistent at trust boundaries

- **Description:** Some actions use Zod well, but others accept raw locale, slug, UUID, update objects, tokens, and membership IDs. `systemUpdateSchema` exists but `updateSystemAction` accepts `SystemUpdate` without runtime parsing. Profile avatar validation checks only that input is a `File`; size and MIME constraints are not visible in the action.
- **Why it matters:** TypeScript types do not validate network-supplied Server Action payloads. Malformed data can reach storage/database operations.
- **File(s):** `src/shared/lib/actions/developer/systems/update-system.action.ts`; `delete-system.action.ts`; `src/shared/lib/actions/tenants/update-tenant.action.ts`; `src/shared/lib/actions/profile/upload-avatar.action.ts`; membership/invitation actions.
- **Risk:** Medium — malformed input, storage abuse, and inconsistent errors.
- **Recommendation:** Parse every Server Action and Route Handler input at entry, including identifiers, locale, files, and update allowlists.

## 5. UI and data-fetching boundaries are overly client-heavy

- **Description:** At least 100 files contain `use client`, including whole pages and substantial dashboard/marketplace surfaces. Client hooks directly use Supabase and also invoke Server Actions, producing two data-access styles. The locale layout performs user/profile/membership requests for every localized page, including public routes, and duplicates font/provider setup from the root layout.
- **Why it matters:** This increases client JavaScript, hydration work, database requests, and cognitive load. It also makes authorization correctness depend on both browser RLS and server actions.
- **File(s):** `src/app/[locale]/layout.tsx`; `src/app/layout.tsx`; `src/shared/lib/hooks/**`; client pages under `src/app/[locale]/**`; `src/shared/lib/providers/app-provider.tsx`
- **Risk:** Medium — bundle, rendering, and maintainability overhead.
- **Recommendation:** Measure route bundles; keep static/page shells as Server Components; fetch sensitive initial data in a server-only DAL; reserve React Query for genuinely interactive/revalidated data.

## 6. No error boundaries, loading strategy, or operational instrumentation

- **Description:** The repository has no application `error.tsx` or `global-error.tsx`, no instrumentation file, no structured logger, no error tracking, and no web-vitals/telemetry integration. Errors are predominantly written with `console.error`; some sensitive records/tokens are logged.
- **Why it matters:** Failures will have poor user recovery and poor production diagnosis. Logs may expose invitation tokens, API-key records, webhook payloads, and customer data.
- **File(s):** absence under `src/app`; console calls across `src/`; `src/app/api/webhooks/stripe/route.ts`; `src/shared/lib/supabase/services/invitations/update-invitation-by-token.service.ts`; `src/shared/lib/actions/developer/systems/list-systems.action.ts`
- **Risk:** Medium — weak incident response and possible sensitive-data leakage.
- **Recommendation:** Add accessible route/global error UI, structured redacted logging, tracing, error reporting, health/readiness separation, and alerting.

## 7. Subscription lifecycle is incomplete

- **Description:** Subscription creation sets monthly subscriptions active and `auto_renew` true, but no provider subscription identifier, renewal webhook flow, expiration enforcement, cancellation flow, or scheduled reconciliation is present. `requireSubscription` treats only `ACTIVE` and `TRIAL` as active and defaults missing subscriptions to Starter capabilities.
- **Why it matters:** Entitlements can remain active without renewal and lifecycle state can drift from the payment provider.
- **File(s):** `src/shared/lib/supabase/services/billing/create-subscription.service.ts`; `src/shared/lib/auth/requires/require-subscription.ts`; webhook routes.
- **Risk:** Medium — entitlement leakage and billing inconsistency.
- **Recommendation:** Implement a provider-driven subscription state machine, renewal/cancel/refund/dispute events, end dates, grace rules, and reconciliation jobs.

## 8. Documentation and configuration are stale

- **Description:** README claims Next.js 15 while `package.json` pins 16.2.6, lists AI and GitHub capabilities not evident in the repository, and provides no setup, schema bootstrap, test, deployment, architecture, incident, or tenant-isolation documentation. `.env.example` names variables but does not document required formats (notably the 32-byte hex API encryption secret).
- **Why it matters:** Onboarding and safe operations depend on tribal knowledge, increasing deployment and security mistakes.
- **File(s):** `README.md`; `.env.example`; `package.json`; `PROJECT_ANALYSIS.md`
- **Risk:** Medium — unreliable onboarding and deployment.
- **Recommendation:** Maintain accurate setup, architecture, threat model, schema/RLS, environment, payment, deployment, rollback, and runbook documentation.

--------------------------------------------------

# Low Priority Issues

## 1. Repository hygiene contains prototype artifacts

- **Description:** `public/data.ts`, `public/data.json`, a large `repomix-output.xml`, `dumb.txt`, design assets, and `_components/test` prototype components remain in the working repository. Some are ignored only after having existed locally, and naming/casing is inconsistent (`get-Invitation-by-token.service.ts`, `navbar-search-Input.tsx`).
- **Why it matters:** Noise complicates navigation, reviews, and packaging decisions.
- **File(s):** named files and directories above.
- **Risk:** Low — developer friction and accidental asset exposure.
- **Recommendation:** Classify prototype/generated files, keep only intentional runtime assets, and enforce naming conventions.

## 2. Accessibility and navigation quality gates fail

- **Description:** Lint reports raw `<img>` usage, raw anchors for internal navigation, an unescaped entity, and Hook correctness issues. No automated accessibility tests are present.
- **Why it matters:** Performance, keyboard/navigation behavior, and accessibility can regress unnoticed.
- **File(s):** `LoginForm.tsx`; marketplace system page; `Footer.tsx`; invitation acceptance page; lint output.
- **Risk:** Low to Medium — user experience and compliance exposure.
- **Recommendation:** Make accessibility lint/tests a CI gate and add keyboard/screen-reader coverage for dialogs, forms, tables, and navigation.

## 3. Health endpoint exposes unnecessary runtime metadata

- **Description:** The unauthenticated health route returns environment, process uptime, database status, and measured database latency.
- **Why it matters:** This provides modest reconnaissance value and couples liveness to a privileged database query.
- **File(s):** `src/app/api/developer/v1/health/route.ts`
- **Risk:** Low — information disclosure and noisy health semantics.
- **Recommendation:** Separate minimal liveness from protected readiness/diagnostics and avoid exposing runtime details publicly.

--------------------------------------------------

# Architecture Review

The code has a sensible high-level division among App Router routes, shared actions, Supabase services, schemas, hooks, providers, UI primitives, and configuration. Domain folders for billing, memberships, invitations, systems, tenants, coupons, and API keys improve cohesion. Developer API response/context helpers are a good attempt at a consistent boundary.

Layering is incomplete. Pages and client hooks import database services directly; services sometimes create their own user client, sometimes accept a client, and sometimes create a service-role client. Server Actions are used both as controllers and as internal services. One security-sensitive function is simultaneously a Server Action and webhook business function. Authorization lives in layouts, actions, services, RLS assumptions, and ad hoc owner checks, without a single invariant-bearing data access boundary.

Dependency direction should become: UI/client hooks -> Server Actions/Route Handlers -> authorization-aware domain services -> server-only DAL -> Supabase. Today, UI -> Supabase services and action -> service-role DAL paths coexist. `server-only` markers are absent on secret-bearing modules.

Folder organization is understandable but duplicated (`src/lib` versus `src/shared/lib`, `src/hooks` versus `src/shared/lib/hooks`, `features` versus `shared`) and contains legacy/prototype artifacts. Naming is inconsistent. Cohesion is strongest in billing and developer API folders, though their workflows require transactional hardening.

Reusable UI primitives and shared schemas are positives. Several `any` types and schema-to-database drift errors show that hand-maintained Zod/domain types are not currently aligned with actual query results and component contracts.

--------------------------------------------------

# Security Review

Authentication uses `supabase.auth.getUser()`, which is the correct server-side identity check, in middleware, `requireUser`, and many actions. Middleware is correctly not treated as the sole authorization control in most tenant layouts/actions. However, authentication is missing from the payment confirmation path by design error.

Authorization has useful RBAC primitives and explicit membership checks, but multiple object-level authorization defects exist: `tenant.read` enables writes; invitation acceptance fails to bind token to tenant; cancel/resend invitation operations fail to bind target invitation to tenant. These are concrete broken-access-control paths.

Tenant isolation cannot be approved without versioned RLS policies. Browser clients directly query memberships, tenants, systems, and subscriptions, while admin-client code bypasses RLS. All admin operations must establish tenant scope before executing, and several currently do not.

API-key generation uses 32 cryptographically random bytes and one-way SHA-256 verification, both strong decisions. Storing decryptable copies and repeatedly returning them defeats least exposure. There is no request rate limiting, scope system, audit trail, rotation policy, or constant operational contract visible.

Secrets are ignored correctly (`.env.local` is not tracked; only `.env.example` is tracked). The admin and encryption modules should still be marked server-only and validate secrets early. Security headers such as CSP, frame restrictions, referrer policy, and permissions policy are absent from `next.config.ts`.

Zod validation is present on registration/login, coupons, orders, and some profile actions but is inconsistent on other Server Actions. Email HTML interpolates invitation message and names without escaping, allowing markup injection into outbound email content. Upload validation does not visibly constrain MIME type or size at the action boundary.

The most plausible attacks are free entitlement creation, cross-tenant membership insertion, cross-tenant invitation cancellation/resend, tenant defacement by ordinary members, credential exposure, endpoint abuse, and database-policy bypass caused by future misuse of service-role helpers.

--------------------------------------------------

# Backend Review

The service/action split gives the backend a workable skeleton. Route handlers are small, Zod is used in several externally callable flows, response helpers give the developer API a consistent envelope, and payment provisioning attempts idempotency through existence checks.

REST coverage is narrow and effectively read-only for the developer API. Tenant selection is passed by `tenantSlug` query parameter for GET requests rather than a stable tenant identifier/header/path contract. There is no pagination on memberships, no versioned OpenAPI schema, no request IDs, no cache headers, and no rate-limit metadata. Membership responses expose profile email and identity details to any system API key that can target the tenant; that may be intentional but needs explicit scope/consent documentation.

Business logic is distributed between actions and services. Critical workflows lack transactions. Error handling mixes thrown strings, plain objects, Supabase errors, redirects, and result unions; this already breaks API status mapping. Console logging is pervasive and unstructured.

The public Stripe handler is a stub and Paymob handling is unsafe. Payment provider naming is inconsistent: orders are created with provider `MANUAL`, then processed via a Paymob route. This confirms the billing subsystem is not release-complete.

--------------------------------------------------

# Frontend Review

The application uses the App Router, nested route groups, localized routes, Server Components for several layouts, React Query hydration, React Hook Form/Zod, and a reusable component system. Tenant layout authorization occurs server-side before dashboard rendering, which is a strong pattern.

Client boundaries are much wider than necessary. Whole pages and many display components are client components, and the locale-level provider wraps the entire localized application. The locale layout fetches authentication, profile, memberships, and all translations even for public pages, reducing static rendering and increasing database load. `NextIntlClientProvider` and font setup are duplicated across layouts.

React Query is used consistently enough to establish query keys and invalidation, but it is mixed with direct browser Supabase reads and Server Actions. One query key uses `current-membership` while server hydration uses `membership`, creating avoidable duplicate fetching. Some route changes omit locale (for example `router.push("/workspaces")`).

There are no route-level error boundaries and limited loading/Suspense structure. Lint identifies conditional Hook execution and synchronous state changes in effects. Type errors currently break developer system/coupon, ownership-transfer, settings, and checkout surfaces.

Accessibility benefits from Radix/shadcn primitives, semantic form infrastructure, and localized direction handling. Nonetheless, lint failures around navigation/images and the absence of accessibility tests prevent an accessibility approval.

--------------------------------------------------

# Database Review

The inferred model is reasonable: profiles own systems and orders; paid orders create subscriptions; subscriptions create tenants; memberships associate profiles and tenants; invitations and coupons support onboarding and commerce; API keys belong to systems. IDs are UUID-shaped and many domain schemas constrain roles/statuses.

The actual database design is not reviewable because DDL and migrations are absent. No evidence is available for primary/foreign keys, unique constraints, check constraints, cascading behavior, RLS, storage policies, grants, or indexes. Required likely constraints include unique tenant slug/subdomain, unique system slug, unique API key hash, unique subscription per order, unique tenant per subscription, unique membership `(tenant_id, profile_id)`, unique payment provider event/reference, and safe coupon-usage uniqueness. These are recommendations contingent on confirming the live schema, not claims that the live database lacks them.

Common query patterns indicate indexes will be needed on tenant slug, membership tenant/profile pairs, invitation token hash/status/expiry, API key hash/system, order profile/system/created time, subscription tenant/system/order, coupon system/code/status/time, and provider references. Their presence cannot be verified.

Date handling mixes JavaScript `Date` objects and ISO strings; generated Supabase database types are absent. Schema drift is visible in current TypeScript errors and multiple `any` casts.

--------------------------------------------------

# Performance Review

Positive foundations include App Router route splitting, Server Components in key layouts, parallel profile/membership loading, React Query dehydration, five-to-ten-minute stale times, and `next/font`.

Performance risks include global locale-layout user/profile/membership fetching, duplicated membership queries due to inconsistent keys/layout nesting, direct database calls from browser hooks, and a very broad client-component graph. Large UI dependencies (Three.js/react-three, Motion, Recharts, DnD, TanStack Table, Radix/shadcn) warrant route-level bundle measurement; no bundle analysis is configured. Prototype animation/gallery components and large public/design assets should not ship accidentally.

No durable server data caching strategy is present. This is appropriate for authorization-sensitive records by default, but public systems/marketing data could use explicit cache/revalidation semantics. `last_used_at` writes on every developer API request create a write hotspot. Membership list APIs lack pagination and will degrade for large tenants.

Raw `<img>` elements are present in user-facing pages, and lint flags their likely LCP/bandwidth impact. No Web Vitals collection or performance budgets exist.

--------------------------------------------------

# Technical Debt

- Resolve all current TypeScript and ESLint failures and keep both as required CI gates.
- Add unit, integration, RLS isolation, Server Action authorization, webhook signature/replay, end-to-end, accessibility, and load tests.
- Version the Supabase schema, RLS/storage policies, RPCs, seed data, and indexes.
- Consolidate the action/service/DAL boundary and add `server-only` protection.
- Normalize error types and result contracts.
- Replace full-secret API-key recovery with one-time display and rotation.
- Complete real payment and email providers.
- Introduce structured logging, redaction, tracing, alerting, and error boundaries.
- Add distributed rate limiting and idempotency controls.
- Reduce `any`, generate database types, and parse query results at boundaries.
- Reduce client component scope and eliminate duplicate data fetching/provider nesting.
- Align query keys and localized navigation.
- Add pagination to tenant-scale collections.
- Add CSP and other production security headers.
- Migrate deprecated `middleware.ts` to the Next.js 16 Proxy convention.
- Remove or quarantine prototype/test/generated artifacts.
- Update stale README and create operational/deployment documentation.
- Remove sensitive `console.log` calls, especially full webhook bodies, invitation token hashes/records, and API-key records.
- Add file MIME/size validation and storage policy tests.
- Define subscription expiry, renewal, cancellation, refund, dispute, and reconciliation behavior.
- Add backup/restore, migration rollback, secret rotation, and incident-response runbooks.

--------------------------------------------------

# Scalability Review

## 1,000 tenants

The architecture can support this level after the critical authorization/payment defects are fixed and the live schema has correct RLS, constraints, and indexes. Immediate risks are excess global profile/membership fetching, unpaginated member lists, per-request API-key usage writes, and lack of operational visibility. A single managed Supabase project is otherwise a reasonable initial topology.

## 10,000 tenants

The current code is not ready. Required work includes verified composite indexes, bounded/paginated queries, rate limiting, transactional billing, background job processing for email/provisioning/reconciliation, connection and query monitoring, cache strategy for public catalog data, API usage metering, and automated tenant-isolation tests. Service-role operations need centralized, auditable policy enforcement.

## 100,000 tenants

The current architecture has no demonstrated readiness. At this scale, the team would need measured database capacity plans, workload partitioning, queue-backed workflows, provider/webhook ingestion durability, cache and CDN strategy, read/write hotspot removal, observability SLOs, disaster recovery, audit logs, data retention, regional/compliance strategy, and likely separation of control-plane, marketplace, billing, and tenant data workloads. Tenant slug lookup and membership/API usage patterns must be benchmarked with production-shaped data before deciding whether partitioning or service separation is necessary.

--------------------------------------------------

# Strengths

- The domain model covers the right commercial SaaS concepts: systems, orders, subscriptions, tenants, memberships, invitations, coupons, licenses, and API access.
- Server-side `supabase.auth.getUser()` is used instead of trusting a cookie/session payload directly.
- Tenant dashboard layout performs both authentication and membership authorization before rendering.
- RBAC permissions are centralized and composable through `hasPermission`, `hasAnyPermission`, and `hasAllPermissions`.
- Several sensitive actions explicitly verify system ownership before mutation.
- Important order and coupon inputs use Zod and server-derived prices rather than trusting a client-supplied checkout price.
- API keys use cryptographically secure randomness and one-way hashes for verification.
- Invitation tokens are hashed for lookup, and acceptance verifies the authenticated user's email.
- Developer API routes share context resolution and response-envelope helpers.
- Payment provisioning attempts idempotent existence checks, showing awareness of retry behavior even though atomicity is not complete.
- React Query server hydration and parallel data fetching are used in tenant views.
- App Router route groups provide a clear separation among public, authentication, tenant dashboard, and developer dashboard experiences.
- The UI builds on accessible component primitives and supports English/Arabic directionality.
- Environment files are ignored correctly; the committed example contains names rather than secrets.
- TypeScript strict mode is enabled and dependencies are pinned through a lockfile.

--------------------------------------------------

# Recommended Roadmap

1. Freeze release and close the four critical blockers: authenticated provider-verified payments, invitation-to-tenant binding, correct tenant write authorization, and a clean type/lint/build gate.
2. Audit every Server Action and service-role operation for authentication, permission, ownership, tenant scope, runtime validation, and safe return values. Add regression tests for every discovered access-control defect.
3. Commit the complete Supabase schema/RLS/storage/RPC migration history and create multi-tenant policy tests. Do not proceed without verifying browser-client access against these policies.
4. Make billing transactional, idempotent, replay-safe, provider-driven, and reconcilable. Complete subscription lifecycle handling.
5. Replace localhost email and stub Stripe behavior with production integrations and integration tests.
6. Redesign API-key storage/display, add key scopes/audit/rotation, and implement distributed rate limits.
7. Establish CI for clean install, lint, type check, production build, unit/integration/E2E/security tests, dependency scanning, and migration validation.
8. Add structured redacted telemetry, error boundaries, health/readiness separation, SLOs, alerts, backups, and operational runbooks.
9. Consolidate the server-only DAL and error contracts; generate database types and remove unsafe `any` casts.
10. Profile client bundles and database queries, narrow client boundaries, paginate collections, align cache/query keys, and load-test at 1,000-tenant production shapes.
11. Update framework conventions and documentation, then remove prototype artifacts and naming inconsistencies.

--------------------------------------------------

# Final Verdict

**Would I approve this project for production?** No. The current payment path permits unpaid provisioning, cross-tenant access defects are present, and the revision fails static release checks. These are unequivocal production blockers.

**Would I approve this codebase for my engineering team?** Conditionally, as an early-stage codebase under a remediation plan—not as a production baseline. The domain decomposition and core stack are reasonable, but the team must first institute security review, database versioning, tests, and release gates.

**Would I invest in this architecture?** Conditionally. I would invest in the product model and evolve the modular monolith rather than rewrite it. Investment would be milestone-based on closing broken access control, proving RLS isolation, and making billing transactional and provider-verified.

**Would I continue building on top of it?** Yes, after a feature freeze focused on remediation. The existing App Router/Supabase architecture can support the next stage, but adding features before securing the trust boundaries and making deployments reproducible would compound risk and rework.

The release decision is **REJECT / NO-GO** until all Critical Issues are closed and independently verified.
