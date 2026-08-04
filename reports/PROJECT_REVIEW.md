# Executive Summary

## What this project is

Graphood is a bilingual (Arabic/English), multi-tenant SaaS marketplace and workspace shell. A developer can define a sellable **System**, publish pricing for subscription/reseller/exclusive licenses, manage coupons and API keys, and expose a small tenant-context API. A customer can register, browse public systems, create an order, obtain a provisioned tenant/workspace, manage its profile and members, and inspect subscription/usage information.

The principal domain chain is:

`Supabase user/profile -> system/order/payment -> subscription -> tenant -> membership`

Invitations, roles, permission overrides, coupons, developer keys, and billing records attach to that chain.

## Current maturity

**Prototype / pre-alpha integration stage, not production-ready.** The repository has meaningful domain modeling and several end-to-end UI flows, but production-critical boundaries are either unsafe or incomplete. Most importantly, any caller can mark an order as paid without authenticating or proving payment; the Paymob webhook is unsigned; the checkout deliberately generates a fake transaction reference; provisioning is not transactional; the database schema and RLS policies are absent from version control; and there are no tests or CI controls.

Release validation is also red: `npm run lint` reports **43 errors and 45 warnings**. `npx tsc --noEmit` passes. `npm run build` could not be completed in the audit environment because `next/font/google` attempted to download Roboto and Roboto Mono and outbound access failed. This is partly an audit-environment limitation, but it also demonstrates a non-hermetic build dependency.

## Overall architecture

- Next.js 16 App Router with locale-first routes and route groups for auth, public/marketplace, tenant dashboard, and developer dashboard.
- Supabase provides authentication, Postgres access, storage, and privileged service-role access.
- Server Actions serve as the main mutation/BFF layer; several services are also imported directly by Client Components and execute through the browser Supabase client.
- TanStack Query supplies browser caching and some server-to-client hydration.
- Zod schemas provide application-level domain and input types, but Supabase itself is untyped because generated database types are absent.
- Authorization combines Supabase RLS (not auditable here), route/layout guards, action-level membership checks, and service-role operations.

## Main technologies

Next.js 16.2.6, React 19.2.4, TypeScript 5, Supabase SSR/JS, next-intl, Tailwind CSS 4, shadcn/Radix UI, TanStack Query/Table, React Hook Form, Zod 4, Motion/Three.js, Recharts, Nodemailer, and Resend.

## General quality assessment

The repository shows good intent: strict TypeScript is enabled; domain schemas are extensive; sensitive prices are recalculated on the server during order creation; tenant membership is checked in several mutation paths; invitation tokens are initially generated securely and stored hashed; API keys are hashed for verification; and UI primitives are centralized.

Those strengths are outweighed by release-blocking correctness and security defects. Financial state can be forged, service-role code bypasses database controls, several multi-step writes can leave contradictory states, plan enforcement is incomplete, invitation handling contains functional and privacy defects, and the actual dashboard is largely template/mock content. Documentation claims AI and GitHub integration that do not exist. The repository is not approvable for a commercial client in its current state.

---

# Project Overview

## Application purpose and users

The application targets two primary user groups:

1. **System developers/vendors** create and list reusable SaaS systems, configure tier/license prices, issue coupons and API keys, and use the developer API/documentation.
2. **Business customers/workspace users** browse the marketplace, purchase a system license, receive a tenant workspace, invite members, assign roles/permissions, edit workspace settings, and view subscription limits.

## Expected workflow

1. A user registers or signs in through Supabase email/password authentication.
2. A vendor creates a System. Creation also generates a default developer API key.
3. The vendor manages coupons and API keys and may publish the System in the marketplace.
4. A customer selects a System, plan/license, and optional coupon.
5. The server validates availability, ownership, prices, and coupon rules and creates pending order/payment rows.
6. A payment provider should verify payment and trigger provisioning.
7. Provisioning creates a subscription, tenant, and owner membership.
8. The customer enters the tenant dashboard, edits settings, manages members/invitations, and consumes developer API capabilities according to the plan.

Steps 1–5 and much of step 8 are partially implemented. Step 6 is currently a developer mock and is critically unsafe. Step 7 exists but lacks atomicity and robust concurrency control. Recurring billing, cancellations, refunds, renewals, entitlement revocation, tax/invoicing, and most tenant-product behavior are absent.

## Business logic

- Systems support `STARTER`, `PRO`, and `BUSINESS` subscription tiers plus `RESELLER` and `EXCLUSIVE` license types (`src/shared/config/plans.ts`, `src/shared/config/licensing.ts`).
- Pricing is stored per system; `create-order.action.ts:161-207` chooses the server-side amount rather than trusting checkout totals.
- Coupons can be scoped by system, license, plan, dates, minimum amount, global usage, and per-user usage.
- Provisioning derives a subscription from a paid order, creates a default workspace, and inserts an owner membership.
- Workspace roles are OWNER, ADMIN, STAFF, and MEMBER with role defaults plus additive per-membership permissions.
- API keys are tied to Systems; requests supply both a bearer key and `tenantSlug`, and context resolution requires that the tenant belongs to the key's System.

## Architectural assessment

The broad route/domain decomposition is understandable, but boundaries are porous. “Services” accept a generic `SupabaseClient` and can run either with a browser session, cookie session, or service-role client. That makes authorization behavior dependent on the caller and undocumented RLS. Some services construct the admin client internally, so their names do not signal privilege. UI hooks import database services directly while mutations generally use Server Actions. This hybrid can work, but here it causes duplicate fetches, inconsistent errors, difficult authorization review, and excessive client-side JavaScript.

---

# Current Features

## Identity and profile

- Email/password registration and login through Supabase.
- Logout.
- Locale-aware auth pages.
- Profile loading and editing.
- Avatar upload, replacement, removal, preview, MIME allow-list, and 5 MB size limit.
- User settings routes for profile and notification UI.
- Google login button/UI exists, but OAuth behavior is not implemented.

## Internationalization and presentation

- Arabic and English message catalogs.
- Locale-prefixed routing through `next-intl`.
- RTL/LTR direction selection.
- Responsive navbar, footer, sidebar, cards, dialogs, tables, forms, charts, and toasts.
- Marketing/home visuals, animation, image slider/gallery, and 3D dependencies.
- Dark-theme-compatible design tokens/components.

## Marketplace and systems

- Public systems listing and client-side name search.
- Public system detail route.
- Vendor system listing, create, read, update, and delete actions.
- System metadata: name, slug, description, category, tags, icon URL, visibility, status, currency, tier prices, reseller price, and exclusive price.
- Default API-key generation during system creation.
- License selection and checkout preparation.

## Orders, pricing, coupons, and provisioning

- Pending order and payment creation.
- Server-side selection of price from the System record.
- Duplicate/pending-order checks.
- Prevention of purchasing one's own System.
- Coupon creation, listing, deletion, preview validation, and application.
- Coupon restrictions for dates, minimum amount, plan/license, use counts, and per-user use.
- Payment confirmation service and idempotent-looking provisioning helpers.
- Subscription, tenant, and owner-membership creation after an order becomes paid.
- Order checkout/status UI.

These are implemented code paths, not production-complete payment features; the confirmation entry point is unsafe and the UI explicitly uses mock payment.

## Tenant/workspace management

- Workspace selection based on memberships.
- Tenant route guard requiring authenticated membership and `dashboard.read`.
- Workspace general and localization forms.
- Tenant name, slug, contact/location, timezone, branding/logo fields.
- Dashboard shell, sidebar, quick-view page, subscription page, and settings page.
- Membership and invitation tables.
- Member removal/self-leave rules and ownership transfer to an ADMIN.
- Delete-workspace and leave-workspace panels are displayed but explicitly not implemented.

## Invitations and RBAC

- Secure random invitation-token generation and SHA-256 storage.
- Seven-day expiry.
- Email-address binding on acceptance.
- Tenant binding check on acceptance.
- Invitation create, accept, reject, cancel, and resend actions.
- OWNER/ADMIN/STAFF/MEMBER roles.
- Role-default permissions plus additive explicit permissions.
- Tenant and action checks for several member-management operations.

## Developer platform

- API-key create, list, update, delete, and regenerate flows.
- API-key activation, expiry, hash lookup, and last-used tracking.
- Developer API endpoints for health, context/me, tenant, memberships, and subscription/capabilities.
- Bearer authorization wrapper with System/Tenant relationship checks.
- In-product quick start, authentication, response format, errors, endpoint, and changelog documentation pages.
- Coupon administration per System.

---

# Missing Features

## Explicitly incomplete or advertised but absent

- Real Stripe integration. `src/app/api/webhooks/stripe/route.ts` only logs the raw body and acknowledges it.
- Real Paymob signature/HMAC verification and provider event mapping.
- Actual payment-method UI; checkout labels itself “Developer Mock Payment.”
- Recurring subscription charges, provider customer/subscription IDs, renewals, failed-payment handling, grace periods, cancellation, pausing, expiry, upgrades/downgrades, proration, and webhook reconciliation.
- Refunds, chargebacks, receipts/invoices, tax/VAT, payout/commission accounting, and financial audit trail.
- Exclusive-license marketplace removal and reseller-rights workflows.
- Delete workspace and leave workspace (`delete-workspace.tsx:49`, `leave-workspace.tsx:49`).
- Google/OAuth login (`use-login.ts:16-18` only logs).
- Password reset, email change UI, MFA, session/device management, and account deletion.
- AI-powered workflows advertised in README.
- GitHub integration advertised in README.
- Real dashboard/business analytics. Current quick-view cards/charts/table are template/static data; `dashboard/data.json` contains sample records.
- Real notification behavior; notification settings are presentation-only.
- Plan enforcement for members, storage, reports, word assistant, and most routes. Only `maxAdmins` is mapped in `tenant-limit.ts:14-16`.
- Search pagination/filtering/sorting on the server for marketplace and large member lists.
- Audit log, administrator/support console, moderation, compliance export/deletion, and incident/operations tooling.

## Delivery and operations gaps

- Version-controlled database migrations, functions, triggers, indexes, constraints, RLS policies, storage buckets/policies, and seed file. `supabase/config.toml` enables migrations and references `seed.sql`, but neither is present.
- Generated Supabase `Database` types.
- Automated unit, integration, contract, security, or end-to-end tests.
- CI/CD configuration and protected release gates.
- Deployment/runbook documentation, rollback process, backup/restore validation, monitoring, alerting, structured logging, tracing, and error reporting.
- Environment-variable validation at startup and documentation of formats/rotation.
- Local development setup in README, including Supabase and Mailpit prerequisites.
- API versioning/deprecation policy beyond the path name and static changelog page.

---

# Code Quality Review

| Area | Score | Evidence-based assessment |
|---|---:|---|
| Readability | 6/10 | Domain and action names are usually descriptive, but large 250–800 line UI/service files, mixed formatting, stale comments, mojibake comments, and debug logging make important behavior harder to isolate. |
| Maintainability | 3/10 | No tests/CI/database source of truth; authorization depends on call-site client choice and invisible RLS; release lint is red. |
| Consistency | 4/10 | Mixed quote/semicolon/indentation styles; mixed action result shapes (`message`, `error`, `code`, thrown errors); inconsistent file casing such as `get-Invitation-by-token.service.ts` and component capitalization. |
| Modularity | 6/10 | Actions, schemas, services, hooks, configs, and route-local UI are separated, but several components and services are oversized and hooks compose repeated queries. |
| Abstractions | 5/10 | `requireUser`, `requireMembership`, developer response helpers, and plan configs are useful. Generic untyped database helpers and client-agnostic privileged services weaken safety. |
| Separation of concerns | 4/10 | Client hooks directly call database services; email transport and a 180-line HTML template are embedded in one service; payment confirmation also performs coupon consumption and provisioning orchestration without a transaction. |
| Naming | 4/10 | Domain nouns are mostly clear, but `System` is overly generic, “action” is used for non-UI API internals, `getWhatByFrom` hides query semantics, `Dir` is vague, and filenames/casing vary. |
| File organization | 6/10 | Route colocation and domain service folders are navigable. Prototype UI under `_components/test`, public data duplicated as `.json`/`.ts`, raw design assets, and parallel `features` versus `shared/lib/hooks` structures reduce coherence. |

## Specific code-quality concerns

- `npm run lint` fails with 43 errors and 45 warnings, including a conditional hook (`role-select.tsx:35`), explicit `any`, set-state-in-effect problems, invalid internal anchors, and a lowercase component calling a hook.
- TypeScript passes only because database calls are generic/untyped and several application boundaries use `any` or casts (`[locale]/layout.tsx:56`, `app-provider.tsx:23`, developer subscription cast).
- Errors are inconsistently swallowed, logged, rethrown, or returned. `[locale]/layout.tsx:59-66` converts any profile/membership failure into a console message and an apparently logged-out/empty state.
- Numerous `console.log/error/warn` calls include identifiers, tokens, invitation rows, request bodies, and raw provider content. There is no structured logger or redaction policy.
- `send-invitation-email.service.ts` contains a large commented-out Resend implementation followed by a local Nodemailer implementation and an inline HTML document. This is dead code plus mixed responsibilities.
- `data-table.tsx` is 818 lines and includes sample text; `create-coupon-dialog.tsx` is 445 lines; checkout selection is 457 lines. These should be decomposed by behavior, not merely visual fragments.
- UI copy is partly translated and partly hardcoded English. Service errors also become user-facing English strings, undermining Arabic localization.

---

# Architecture Review

## Project structure

The App Router hierarchy is coherent: locale, public/auth, tenant dashboard, and developer dashboard concerns are visually distinct. Route-local `_components` reduce global namespace pollution, while shared schemas/config/UI are centralized. This is one of the repository's stronger qualities.

However, the application lacks a clearly enforced server-only data access layer. `SupabaseClient` parameters erase whether a service is RLS-bound or service-role. Other services silently construct the admin client. A Principal Engineer cannot determine authorization from a service signature, and a future caller can accidentally elevate a read/write simply by passing the wrong client.

## Scalability

- Member/system queries generally fetch full collections without cursor pagination.
- `useSystem` always launches both public-system and current-user-system queries (`use-system.ts:37-58`), even on screens that only need one; unauthenticated marketplace users may receive an avoidable auth error from the unused query.
- The locale layout fetches profile and every membership for every locale route, including public marketing/marketplace pages (`[locale]/layout.tsx:51-67`). This forces request-time auth/database work and sends membership data into a client provider globally.
- The tenant layout prefetches all tenant memberships for every dashboard route (`[tenant_slug]/layout.tsx:51-58`), even routes that do not display members.
- Subscription usage composes tenant, memberships, invitations, and subscription hooks, with repeated `useTenant` calls. Query-key sharing mitigates some requests but the dependency chain still creates client waterfalls.
- No explicit database indexes can be verified for slug, hash, status/expiry, foreign keys, or provider references because migrations are absent.
- Coupon validation/application and payment provisioning rely on read-then-write logic vulnerable to concurrent requests unless database constraints/RPC locking exist externally.

At 1,000 tenants this may be operationally tolerable with strong external RLS/indexes. At 10,000+, unpaginated lists, per-request global membership loads, client waterfalls, and absent cache/invalidation strategy become material. At 100,000+, the lack of reproducible schema, transactional workflows, queues, idempotency/event records, rate limits, and observability is disqualifying.

## Dependency management

- Package versions are locked, and Next/React/eslint-config-next versions align.
- README says Next.js 15 while `package.json` uses 16.2.6.
- `framer-motion` is imported in `workspaces/page.tsx:4`, while the declared direct dependency is `motion`; relying on a transitive package is fragile.
- Large libraries (Three.js, React Three Fiber/Drei, Recharts, TanStack Table, DnD Kit, two icon libraries, Motion) raise bundle cost. There is no bundle analyzer or budget.
- Both Nodemailer and Resend are installed although only local Nodemailer is active.
- No automated dependency-vulnerability scan is configured. This audit did not claim a specific vulnerable version without a registry-backed audit.

## Boundaries, coupling, and cohesion

- Good: schemas/configs isolate domain vocabulary; route guards are reusable; API response contracts are centralized.
- Poor: database services are coupled to raw table/column strings and loosely shaped join results.
- Poor: service-role usage is spread across billing, API keys, tenants, invitations, and developer endpoints.
- Poor: checkout, coupon, and provisioning logic depends on implicit database uniqueness/RLS rules that are not present in source.
- Poor: presentation hooks know Supabase, Server Actions, routing, toasts, and query invalidation simultaneously.

## State management

TanStack Query is appropriate for remote state, and query keys/stale times exist. The implementation has three overlapping client state channels: Auth/Membership/Onboarding contexts, hydrated query state, and fresh browser queries. The same membership can appear under `membership`, `current-membership`, `memberships`, and context state. Mutation invalidation therefore risks updating only one representation.

The root `AppProvider` makes virtually the entire locale subtree a client boundary and serializes profile/memberships to the browser. Providers should be placed as deep as their consumers permit, consistent with the installed Next.js 16 guidance.

## API design

The developer API has consistent JSON helpers and explicit v1 routes, but it has no rate limiting, scopes, pagination, request ID, CORS policy, or documented quotas. Every protected request performs API-key lookup/update, tenant lookup, subscription lookup, and capability evaluation. Updating `last_used_at` synchronously on every call adds write amplification and contention.

`requireApiAccess` throws plain objects (`require-api-access.ts:22-35`), while `withDeveloperContext` recognizes error codes only from `Error.message` (`with-developer-context.ts:86-95`); inactive/denied plans therefore degrade to UNKNOWN_ERROR/500 rather than the intended status. `verifyApiKeyAction` also throws generic strings that are not the defined error-code enum, causing invalid keys to map inconsistently.

The `/me` route uses a cookie-bound Supabase client even though API consumers authenticate with an API key, not a Supabase session (`me/route.ts:13-18`). Depending on RLS, valid API-key requests can fail to retrieve their System. Other endpoints use the admin client, which highlights the inconsistency.

## Database design

The inferred model is reasonable, but a production database review is impossible: migrations, policies, triggers, constraints, functions, indexes, bucket policies, and generated types are missing. The code references an RPC named `transfer_workspace_ownership`, tables and joins that cannot be reproduced, and a configured `supabase/seed.sql` that is absent. This is both a delivery blocker and a security blocker because service-role operations bypass RLS and browser operations rely on it.

Multi-step writes are implemented as application sequences with compensating deletion at best. Order/payment creation, payment/order update, coupon consumption, subscription/order linking, tenant creation, membership creation, avatar replacement, and invitation acceptance can each become partially committed.

---

# Security Review

## Critical findings

### SEC-01 — Payment forgery and unauthorized provisioning

`processPaymentWebhookAction` accepts only an order UUID and arbitrary non-empty transaction reference, performs no authentication/provider verification, and calls `confirmOrderPayment` (`process-payment-webhook.action.ts:27-49`). The checkout calls it directly from the browser and creates `MOCK-${crypto.randomUUID()}` (`use-complete-payment.ts:10-17`). The confirmation service uses the Supabase service role, marks payment successful/order paid, consumes a coupon, and provisions access (`confirm-payment.service.ts:64-120`). An attacker who knows or obtains an order UUID can grant themselves a paid subscription/workspace without paying.

**Required remediation:** remove the public confirmation action; accept state transitions only from signature-verified provider webhooks or a tightly controlled internal/admin path; map provider event amount/currency/order ownership; store/process unique event IDs transactionally; add negative security tests.

### SEC-02 — Unsigned Paymob webhook

`api/webhooks/paymob/route.ts:4-13` trusts caller-provided JSON. There is no HMAC/signature, timestamp/replay protection, provider API verification, amount/currency comparison, or event-type validation. This is a public unauthenticated path into SEC-01.

### SEC-03 — Database/RLS security is unverifiable and unreproducible

The browser directly queries memberships, invitations, systems, subscriptions, profiles, and storage. Correct isolation therefore depends on RLS and storage policies, but none are committed. Service-role operations bypass RLS entirely. Approval cannot be based on policies that are not in the deliverable.

## High findings

### SEC-04 — Financial/provisioning workflows are non-atomic

Payment, order, coupon usage, subscription, tenant, and membership changes are separate statements across multiple clients (`confirm-payment.service.ts`, `provision-order.service.ts`). A failure can leave a paid order without access, a successful payment with pending order, a subscription without tenant, or a tenant without owner. Concurrent events can race before idempotency reads. Use a database transaction/RPC with unique constraints and a durable webhook-event/inbox table; queue retryable provisioning separately if necessary.

### SEC-05 — API keys are recoverable and repeatedly disclosed

Keys are stored both as a verification hash and AES-CBC ciphertext, and list operations decrypt and return every full key (`list-api-keys.action.ts:14-33`). CBC provides no authentication tag. A database plus application-secret compromise exposes all long-lived credentials; merely viewing the key page expands exposure. Store only a keyed verifier/hash, reveal a new key once, show only prefix/last characters later, and rotate atomically.

### SEC-06 — No rate limiting or abuse controls

No rate limiting exists for developer APIs, Server Actions, checkout/order creation, coupon validation, invitations/resends, login UI, or webhooks. Supabase Auth has platform limits, but application and service-role paths do not. Invitation email and synchronous API-key `last_used_at` writes are particularly abusable.

### SEC-07 — HTML injection in invitation emails

`tenantName`, `inviterName`, and user-supplied `message` are interpolated unescaped into HTML (`send-invitation-email.service.ts:234-245`). Mail clients often sanitize scripts, but HTML/link/content injection and phishing-style markup remain possible. Render with an escaping template library and sanitize all untrusted fields.

### SEC-08 — Plan-limit/role logic is incorrect and incomplete

Invitation creation always checks `maxAdmins` regardless of the invited role (`create-invitation.action.ts:86-90`), and `tenant-limit.ts` maps only `maxAdmins` to the entire `memberships` table. The count includes all roles, so a STARTER workspace with one MEMBER can be unable to invite anyone; pending ADMIN invitations are not counted, allowing concurrent oversubscription; reseller/exclusive “unlimited” behavior is only honored in UI usage calculations, not the server guard. Most other entitlements are not enforced server-side.

## Medium findings

- **Invitation resend is broken and leaks hashed credential material into URLs/logs.** Creation stores `tokenHash` but resend passes `invitation.token` to the email (`resend-invitation.action.ts:72-79`), producing a link whose value is hashed again during acceptance and cannot match. Generate and atomically replace a fresh raw/hash pair; never attempt to recover a stored token.
- **Invitation rejection is unauthenticated.** The token is a capability, so unauthenticated rejection can be acceptable, but `tenant` is ignored and status update does not re-check pending/expiry (`reject-invitation.action.ts:8-25`, `update-invitation-by-token.service.ts:10-17`). Define the threat model, scope status transitions, and use a one-time atomic update.
- **Acceptance is non-atomic.** Membership is inserted before invitation status changes; status-update failure is logged but returns success (`accept-invitation.action.ts:89-129`). Retried links then report an insertion failure. Use one database transaction with uniqueness constraints.
- **Sensitive logging.** Stripe logs the entire raw webhook body; invitation update logs token hashes and returned rows; email logs recipient and provider response. Production logs require redaction.
- **Environment validation is absent.** Non-null assertions defer missing Supabase/API encryption configuration to runtime; encryption-secret length/encoding is not validated.
- **Avatar validation trusts MIME metadata.** File size and declared MIME are checked, but magic bytes/decoding are not; extension is taken from the user filename. Validate actual content and re-encode images server-side.
- **No Content Security Policy or explicit defensive headers.** `next.config.ts` defines images/redirects only. Add CSP, frame-ancestors, Referrer-Policy, Permissions-Policy, HSTS at the deployment edge, and document exceptions.
- **Authentication hardening is weak in local config.** Minimum password length is six, no complexity, email confirmation off, secure password change off, CAPTCHA off, MFA disabled. Production settings may differ, but no production baseline is documented.
- **Authorization sometimes uses read-level alternatives for mutations.** Invitations allow `tenant.manage` as an alternative to `members.invite`; ensure broad permissions are intentional. The permission vocabulary contains unused/inconsistently assigned entries (`members.manage`, `tenant.write/delete`, `systems.manage`).
- **Client-visible data is broader than necessary.** The locale layout sends all memberships and profile data into a global Client Component tree on all locale routes. Minimize DTOs and provider scope.

## Injection/XSS/CSRF assessment

- Zod validation is present on many actions and Supabase query builders reduce classic SQL-injection exposure.
- React escapes normal JSX, and no application use of `dangerouslySetInnerHTML` was found outside trusted UI-library chart CSS.
- Email HTML interpolation is an injection boundary and is not escaped.
- Next.js Server Actions provide same-origin checks, but this does not replace authentication/authorization inside each action. The payment action has neither.
- No arbitrary URL redirect was found; however locale/token redirects are inconsistently locale-prefixed and should be constrained/tested.

## Dependency security

No CI vulnerability scan, lockfile policy, SBOM, or update bot exists. A live registry-backed dependency audit was not used as evidence in this repository-only review, so no unsupported claim about a particular CVE is made.

---

# Performance Review

## Rendering and bundle size

- 157 source files declare `use client`. Some are necessarily interactive, but entire pages/layout-adjacent trees and documentation UI are client-rendered even where server rendering would suffice.
- The global AppProvider places Query/Auth/Membership providers around every locale route, increasing hydration scope.
- Three.js/R3F/Drei, Motion, Recharts, TanStack Table, DnD Kit, two icon suites, and Prism are substantial. No dynamic import strategy or bundle budget is documented.
- Raw `<img>` usage generates lint warnings and forfeits Next image optimization in several marketing/auth/system pages.
- Public marketplace `Image` lacks explicit dimensions/fill in the observed card (`marketplace/page.tsx:58-62`), which should be verified for runtime correctness/layout stability.
- Both root and locale layouts instantiate the same Google font families. This duplicates declarations and causes network-dependent builds.

## Queries and requests

- Global profile/all-memberships load on every locale request.
- Tenant layout fetches all memberships on every tenant route.
- Browser hooks then query membership again under multiple keys.
- Subscription/usage screens request tenant, membership collections, pending invitations, and subscription, primarily after hydration.
- Marketplace search fetches all public systems and filters locally; there is no pagination.
- Developer API verification performs multiple database operations and writes `last_used_at` per request.
- Repeated `.select("*")`/`.select()` transfers more data than endpoint/UI DTOs need.

## Caching

TanStack Query uses five- or ten-minute stale times in several hooks, which is a reasonable start. However, authorization-sensitive membership and subscription changes may remain stale, cache keys overlap inconsistently, and Server Actions invalidate only selected client keys/paths. There is little server-side caching, no tag strategy, and no explicit public-system cache/revalidation policy. Supabase query calls are not automatically cached by Next.js.

## Re-rendering

ESLint identifies synchronous state updates inside effects in chart, checkout, avatar, and mobile hooks. React Compiler skips memoization for React Hook Form `watch` and TanStack Table usage. These are not all catastrophic, but they confirm avoidable cascading renders and complex client state.

## Optimization opportunities

1. Move public/read-heavy data to Server Components and pass minimal interactive props.
2. Scope providers to consumers; stop loading auth membership state for public pages.
3. Prefetch only route-specific data and consolidate membership query keys.
4. Paginate and project columns for systems, memberships, invitations, coupons, and orders.
5. Lazy-load 3D/chart/table/code-highlighting bundles.
6. Self-host/subset fonts and eliminate duplicate font declarations.
7. Add bundle analysis, Web Vitals telemetry, query tracing, and performance budgets before attempting micro-optimization.

---

# Technical Debt

The list is ordered by production risk and delivery leverage.

## P0 — Financial integrity and access provisioning

**Why it matters:** forged payment is equivalent to giving away paid products and corrupting contractual/financial records.

**Impact:** direct revenue loss, fraud, unauthorized tenant creation, corrupted coupons/subscriptions, and potential legal/accounting exposure.

**Suggested fix:** remove mock/public confirmation; implement provider SDK/signature verification; validate immutable server-side order totals against provider events; process unique event IDs transactionally; add reconciliation and exhaustive adversarial tests.

## P0 — Version and secure the database

**Why it matters:** the application's real security model and data invariants live in Postgres/RLS, not in this repository.

**Impact:** environments cannot be reproduced, reviewed, rolled back, or reliably tested; tenant isolation cannot be approved.

**Suggested fix:** commit migrations, RLS/storage policies, functions/RPCs, constraints, indexes, seeds, and generated TypeScript types; recreate a clean environment in CI.

## P0 — Transactional domain workflows

**Why it matters:** payment, invitation, ownership, and provisioning are state machines, not independent CRUD calls.

**Impact:** partial states, duplicate subscriptions/tenants, double coupon use, orphan orders/payments, difficult support recovery.

**Suggested fix:** encode transitions in Postgres transactions/RPCs with unique/check constraints, row locking where needed, event idempotency, and retry-safe orchestration.

## P0 — Automated security/correctness gates

**Why it matters:** current regressions and critical exploits have no safety net.

**Impact:** each change can silently break tenant isolation, money movement, hooks, or core flows.

**Suggested fix:** unit-test schemas/RBAC/pricing; integration-test RLS and DB transactions; contract-test webhooks/developer API; E2E-test auth/purchase/invite; run typecheck, lint, tests, build, migrations, and dependency scanning in CI.

## P1 — Make authorization explicit and server-only

**Why it matters:** generic Supabase clients obscure privilege level.

**Impact:** accidental service-role misuse and reliance on unknown RLS.

**Suggested fix:** create typed `server-only` DAL modules with explicit `userDb` versus `adminDb` naming; require actor/resource context; return minimal DTOs; prohibit admin-client imports outside reviewed modules.

## P1 — Correct API-key lifecycle

**Why it matters:** recoverable full keys increase breach impact.

**Impact:** compromise of DB plus encryption secret yields every integration credential.

**Suggested fix:** one-time reveal, verifier-only storage, scoped keys, prefixes, rotation overlap/revocation, audit records, rate limits, and authenticated encryption only if recovery is truly required.

## P1 — Complete subscription/entitlement lifecycle

**Why it matters:** current “ACTIVE forever” behavior is not a subscription product.

**Impact:** access continues after missed/cancelled payments; limits differ between UI and server.

**Suggested fix:** formal state machine, provider synchronization, server-side centralized entitlement checks, renewal dates, expiry/grace logic, and administrative reconciliation.

## P1 — Fix invitations and production email

**Why it matters:** resends fail; local SMTP cannot deliver; HTML interpolation is unsafe.

**Impact:** onboarding failure, support load, spoofed email content.

**Suggested fix:** production provider configuration, escaped templates, locale-aware URLs/content, fresh token on resend, atomic accept/reject/cancel, delivery status and retry/outbox.

## P1 — Restore release quality gate

**Why it matters:** lint identifies actual hook-rule violations, not cosmetic preferences.

**Impact:** unstable rendering, hidden dead code, inability to enforce quality in CI.

**Suggested fix:** resolve all 43 errors, triage warnings, add explicit `typecheck`/`test` scripts and require clean gates.

## P2 — Consolidate client/server data flow

**Why it matters:** duplicated contexts/queries increase bugs and bundle/request cost.

**Impact:** stale permissions, redundant database traffic, complex invalidation.

**Suggested fix:** use Server Components for initial reads, a canonical key factory, minimal provider DTOs, and client queries only for interactive/refetching needs.

## P2 — Break up oversized files and normalize contracts

**Why it matters:** large mixed-responsibility files slow review and testing.

**Impact:** fragile changes and duplicated error/loading behavior.

**Suggested fix:** split orchestration from UI, extract email template/transport, standardize discriminated action results and domain error codes, adopt formatter conventions.

## P2 — Documentation and repository hygiene

**Why it matters:** README claims incorrect framework version and nonexistent capabilities.

**Impact:** client expectation mismatch and slow onboarding/operations.

**Suggested fix:** document actual features/status, architecture, schema, setup, environment formats, threat model, API, deployment, rollback, and operational ownership; remove/relocate prototype artifacts.

## P3 — Product/UI completion

**Why it matters:** template content makes the product appear more mature than its behavior.

**Impact:** poor client acceptance and misleading demos.

**Suggested fix:** replace mock dashboard content with defined business metrics, complete accessibility/i18n/error/loading states, implement settings actions, and validate with product acceptance criteria.

---

# Refactoring Opportunities

| Opportunity | Estimated impact | Recommendation |
|---|---|---|
| Payment state machine and transactional provisioning | Critical | Move to verified webhook handler + transactional DB function/outbox. |
| Typed server-only DAL | Critical | Generate Supabase types; separate user/admin repositories and DTOs. |
| Canonical authorization policy | High | Centralize actor/resource/permission checks and test every role/resource combination. |
| Unified remote state | High | Remove overlapping Membership/Onboarding/Dashboard state and normalize query keys. |
| Route rendering boundaries | High | Convert static/read-heavy pages to Server Components; keep small interactive islands. |
| Invitation service | High | Separate token lifecycle, state transition, email rendering, transport, and delivery tracking. |
| Entitlement engine | High | Centralize plan/license checks; enforce at server/database boundaries, not UI only. |
| Action/error contracts | Medium | Use typed domain errors and one discriminated result shape; translate at UI edge. |
| Oversized route components | Medium | Split 818-line table, 457-line checkout, 445-line coupon dialog, and email template. |
| Logging/observability | High | Structured/redacted logs, request IDs, metrics, traces, error monitoring, security alerts. |
| Asset/dependency cleanup | Medium | Remove unused/dead imports/packages, lazy-load heavy features, move prototype assets. |
| Configuration validation | Medium | Parse all server/public env at startup and document secret formats/rotation. |

---

# File-Level Observations

- **`src/shared/lib/actions/billing/process-payment-webhook.action.ts`** — public, unauthenticated payment-confirmation primitive; must not be client-callable.
- **`src/features/billing/use-complete-payment.ts`** — explicit forged/mock payment trigger from the browser.
- **`src/app/api/webhooks/paymob/route.ts`** — unsigned, unvalidated webhook body reaches privileged provisioning.
- **`src/app/api/webhooks/stripe/route.ts`** — stub that logs raw provider payload and always returns success.
- **`src/shared/lib/supabase/services/billing/confirm-payment.service.ts`** — service-role financial state changes and provisioning without transaction or provider verification.
- **`src/shared/lib/supabase/services/billing/create-order.service.ts`** — order/payment creation uses compensating delete rather than an atomic transaction; cleanup failure is ignored.
- **`src/shared/lib/supabase/services/billing/provision-order.service.ts`** — sequential subscription/tenant/membership provisioning; partial state likely on error.
- **`src/shared/lib/supabase/services/billing/create-subscription.service.ts`** — creates all subscriptions ACTIVE and monthly/auto-renewing without provider subscription identifiers or end/renewal dates; links order separately.
- **`src/shared/lib/actions/billing/validate-coupon.action.ts`** — accepts `amount` from the client for preview. Final order recalculates amount, which is good, but the preview contract can mislead and duplicates pricing input.
- **`src/shared/lib/supabase/services/coupons/validate-coupon.service.ts` / `apply-coupon.service.ts`** — complex concurrency-sensitive rules require DB constraints/locking; cannot be trusted as read-then-write application logic alone.
- **`src/shared/lib/supabase/services/invitations/create-invitation.service.ts`** — initial raw-token/hash design is good.
- **`src/shared/lib/actions/invitations/resend-invitation.action.ts`** — sends stored hash as token, making resent links invalid.
- **`src/shared/lib/actions/invitations/accept-invitation.action.ts`** — email and tenant checks are positive, but membership/status writes are non-atomic and auth redirect drops locale.
- **`src/shared/lib/actions/invitations/reject-invitation.action.ts`** — unused tenant parameter, no authentication, and no explicit pending/expiry condition during update.
- **`src/shared/lib/supabase/services/invitations/update-invitation-by-token.service.ts`** — logs token hash and complete returned invitation; unconstrained status overwrite.
- **`src/shared/lib/supabase/services/invitations/send-invitation-email.service.ts`** — localhost-only SMTP, locale ignored, locale omitted from acceptance URL, unescaped HTML, large commented dead implementation.
- **`src/shared/lib/actions/invitations/create-invitation.action.ts`** — generally strong authorization checks, but incorrect limit selection/counting and no durable email/outbox handling; DB invitation can persist even if sending fails.
- **`src/shared/lib/auth/guards/tenant-limit.ts`** — incomplete mapping, swallows DB errors as feature-locked, counts all memberships for `maxAdmins`, no atomic reservation.
- **`src/shared/lib/auth/requires/require-permission.ts`** — concise reusable permission merge/check functions; good unit-test candidate. Overrides are additive only, so they cannot revoke role defaults—confirm that business rule.
- **`src/shared/lib/schemas/public/role-permissions.ts`** — centralized defaults are positive, but several declared permissions are never granted/used consistently.
- **`src/shared/lib/actions/memberships/remove-member.action.ts`** — action-level check and service-level re-check are useful; service permits only OWNER to remove others even though action permission model suggests any role with explicit `members.remove` can, creating inconsistent policy.
- **`src/shared/lib/supabase/services/memberships/update-membership-role.service.ts`** — relies on unversioned RPC `transfer_workspace_ownership`; its atomicity/security cannot be reviewed.
- **`src/shared/lib/supabase/admin.ts`** — central constructor is good, but returned client is untyped and not protected by `server-only`.
- **`src/lib/utils/developer/encrypt-api-key.ts` / `decrypt-api-key.ts`** — AES-256-CBC without authentication and no secret validation; architectural issue is recoverable storage itself.
- **`src/shared/lib/actions/developer/api-key/list-api-keys.action.ts`** — returns every full decrypted key, violating least exposure.
- **`src/shared/lib/api/developer/with-developer-context.ts`** — useful central wrapper; no throttling and error-type mismatch converts known plain-object errors to unknown failures.
- **`src/shared/lib/actions/developer/context/resolve-developer-context.action.ts`** — checks System/Tenant binding, a positive isolation control; uses admin tenant/subscription lookups and multiple requests per API call.
- **`src/app/api/developer/v1/me/route.ts`** — cookie-bound database query in API-key-authenticated request is inconsistent with sibling admin-backed endpoints.
- **`src/app/api/developer/v1/health/route.ts`** — sensible dependency health check/status, but exposes environment/uptime and performs a privileged DB query per unauthenticated request; cache/rate limit and minimize metadata.
- **`src/proxy.ts`** — uses the correct Next.js 16 `proxy.ts` convention and refreshes auth cookies. Public-route decisions are coarse string-prefix checks; `/workspaces` is public at proxy level despite its authenticated content expectations, so page/action guards remain mandatory.
- **`src/app/[locale]/layout.tsx`** — duplicate fonts, global auth/membership work, `any[]`, swallowed errors, and large client provider boundary. `lang/dir` are placed on a `div`, while root `<html lang="en">` remains incorrect for Arabic documents.
- **`src/app/[locale]/(dashboard)/(tenant)/[tenant_slug]/layout.tsx`** — strong server-side user/membership/dashboard permission gate and hydration, but unnecessarily prefetches all members for every tenant route.
- **`src/shared/lib/hooks/tenants/use-tenant.ts` / `use-memberships.ts`** — duplicate current membership queries under different keys and overlapping authorization-derived state.
- **`src/shared/lib/hooks/systems/use-system.ts`** — one hook always fetches public and user systems, causing unnecessary work/auth errors; split by use case.
- **`src/app/[locale]/(dashboard)/(tenant)/[tenant_slug]/dashboard/_components/data-table.tsx`** — 818-line template/sample component and significant complexity; likely dead from current quick-view composition.
- **`src/app/[locale]/(dashboard)/(tenant)/[tenant_slug]/dashboard/data.json`** — static sample dataset in production route tree.
- **`src/app/[locale]/(main)/_components/test/`** — production home imports from a folder explicitly named `test`; includes a trivial dead `test.tsx` and prototype components.
- **`src/app/[locale]/(main)/workspaces/page.tsx`** — imports undeclared direct package `framer-motion`; client-only page depends on multiple global providers.
- **`src/app/[locale]/(main)/marketplace/page.tsx`** — client-side full-list search and data load; should be paginated/server-backed as catalog grows.
- **`src/shared/lib/schemas/*`** — broad Zod investment is positive, but DB responses are generally not parsed at runtime and database clients remain untyped.
- **`supabase/config.toml`** — largely default local configuration; migrations and seed are enabled/referenced but absent. Local auth defaults are not a production security baseline.
- **`README.md`** — short and stale: wrong Next.js version, no setup/run/env/schema/deployment/test documentation, and advertises unimplemented AI/GitHub capabilities. Encoding renders emoji as mojibake in the audit shell.
- **`.env.example`** — lists main names but not formats, required/optional status, Paymob variables, SMTP variables, `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`, or validation rules.
- **`package.json`** — only dev/build/start/lint scripts; no typecheck/test/format/DB/CI/audit scripts.
- **`next.config.ts`** — hard-coded Supabase image hostname couples deployment to one project; no security headers or bundle instrumentation.
- **`reports/`, `PROJECT_ANALYSIS.md`, `repomix-output.xml`, `design/`** — prior analysis is stale, generated repository dump is dirty/untracked, and raw design/prototype artifacts reduce delivery hygiene. They should not be treated as authoritative product documentation.

---

# Risks Before Production

## Critical

1. Any caller can forge payment confirmation and trigger privileged provisioning.
2. Paymob webhook has no signature/provider verification.
3. Database schema, RLS, storage policies, constraints, and RPC security are absent and therefore neither reproducible nor auditable.
4. Financial/provisioning state transitions are non-transactional and race-prone.

## High

1. API keys are recoverable and repeatedly returned in plaintext.
2. No automated tests, CI, security tests, or migration checks.
3. No application-level rate limiting/abuse protection.
4. Subscription lifecycle and server-side entitlements are incomplete.
5. Invitation email is local-only; resend is broken; HTML content is unescaped.
6. ESLint fails with 43 errors; a conditional Hook violates React rules.
7. No production observability, reconciliation, durable job/outbox, or incident trail.
8. Multi-step invitation/order/subscription/member workflows can leave partial state.

## Medium

1. Developer API error mapping and client choice are inconsistent.
2. Excessive Client Components and globally loaded membership/profile data hurt performance and data minimization.
3. Unpaginated full-list queries will not scale.
4. No validated environment configuration or secret rotation procedure.
5. Build depends on fetching Google fonts; production build was not reproducible in the restricted audit environment.
6. Arabic document metadata is incorrect because the root `html` remains `lang="en"`; much copy is hardcoded English.
7. Dashboard/analytics and feature availability are mostly mock/static.
8. Missing CSP/security headers and weak documented auth baseline.
9. Avatar content validation is metadata-only.
10. Generic/untyped Supabase clients undermine the otherwise strict TypeScript posture.

## Low

1. Inconsistent formatting, naming, casing, and action result shapes.
2. Dead imports, commented implementations, debug output, prototype/test folders, and sample data.
3. README/version/feature claims are stale.
4. Duplicate public data files and hard-coded remote asset host.
5. Missing SEO assets such as sitemap/robots/OG metadata and missing legal routes referenced by footer.
6. Raw `<img>` usage, minor accessibility/lint defects, and basic loading/error copy.

---

# Positive Aspects

- Domain decomposition—System, Tenant, Membership, Subscription, Order, Payment, Coupon—is commercially understandable and extensible.
- Order creation recalculates price on the server and prevents owner self-purchase; it does not trust the checkout total for final billing.
- Core input schemas use Zod with UUIDs, enums, ranges, slug patterns, email normalization, and coupon constraints.
- Invitation creation uses cryptographically secure random tokens and stores only a SHA-256 digest initially.
- Invitation acceptance binds both authenticated email and tenant slug to the stored invitation.
- System/coupon mutations generally authenticate and verify System ownership.
- Tenant layouts re-authorize user membership and `dashboard.read` on the server, correctly avoiding reliance on Proxy alone.
- Role defaults and permission helpers are centralized and easy to test.
- Developer context verifies that the API-key System matches the target Tenant's System.
- API routes use a common response/error contract and versioned path.
- `strict` TypeScript is enabled and `npx tsc --noEmit` passes.
- Query keys and stale times exist, and the tenant layout demonstrates correct TanStack Query dehydration/hydration mechanics.
- Avatar upload includes ownership-derived path, MIME allow-list, and size cap.
- UI primitives and route-local components provide a visually coherent base rather than a completely ad hoc component layer.
- Current Next.js 16 conventions are partly understood: async params and `proxy.ts` are used.

These positives represent a useful foundation; they do not offset the production blockers.

---

# Improvement Roadmap

## Immediate (before any external/client production access)

1. Disable mock checkout and both payment-confirmation entry points.
2. Implement verified Stripe/Paymob webhook handling with amount/currency/order checks, replay defense, event storage, and transactional state transitions.
3. Export and commit the full Supabase schema/RLS/storage/RPC definition; generate database types; prove clean-environment restore.
4. Add tests for forged payments, cross-tenant access, RLS, duplicate events, concurrency, invitation tokens, and ownership transfer.
5. Fix all ESLint errors and establish CI gates for lint, typecheck, test, build, and migrations.
6. Replace local SMTP, repair resend token lifecycle, escape email templates, and make invitation acceptance atomic.
7. Stop listing/decrypting historical API keys; rotate any keys exposed during development.
8. Add rate limiting to auth-adjacent, email, payment, developer API, and expensive service-role operations.
9. Add structured/redacted error reporting and audit records around privileged/financial changes.

## Short Term (next 2–4 weeks)

1. Establish a typed server-only DAL with explicit user/admin capabilities and minimal DTOs.
2. Implement a formal subscription/entitlement state machine and enforce every limit server-side.
3. Consolidate query keys/providers and move initial reads to Server Components.
4. Add pagination/projection to systems, members, invitations, coupons, orders, and API responses.
5. Complete OAuth/password recovery/account security or remove the unfinished UI claims.
6. Add environment schema validation, production auth configuration, security headers, CSP, secret rotation, and deployment documentation.
7. Create unit/integration/E2E suites and test fixtures based on committed migrations.
8. Add payment reconciliation/admin recovery tooling for partial or disputed states.

## Medium Term (1–3 months)

1. Implement upgrades/downgrades, renewal/failure/cancellation/refund/chargeback flows, invoices/tax, and provider reconciliation.
2. Replace mock dashboard and feature cards with defined, query-backed business metrics.
3. Finish leave/delete workspace, notification behavior, legal/privacy routes, and complete localization/accessibility review.
4. Introduce async jobs/outbox for email, provisioning, webhook retries, and audit events.
5. Add bundle analysis, lazy loading, self-hosted fonts, Web Vitals, query metrics, and performance budgets.
6. Add API scopes, pagination, quotas, request IDs, documentation generation, and backward-compatibility policy.
7. Decompose oversized components/services and standardize domain error/result contracts.

## Long Term (3+ months)

1. Add vendor/customer administration, support tooling, moderation, audit exports, and compliance lifecycle.
2. Validate tenancy strategy and database capacity with load tests at expected scale.
3. Build disaster recovery, backup restore drills, regional/data-residency strategy, SLOs, alerting, and incident runbooks.
4. Add key-management/KMS strategy, security review cadence, penetration testing, SBOM/signing, and supply-chain controls.
5. Only advertise and implement AI/GitHub features after threat modeling, privacy controls, usage metering, and clear product requirements.

---

# Senior Engineer Scorecard

| Category | Score | Rationale |
|---|---:|---|
| Architecture | 4/10 | Sound domain/route foundation, but unsafe privilege boundaries and no database source of truth. |
| Code Quality | 4/10 | Useful schemas and decomposition; lint fails badly, large files and inconsistent contracts remain. |
| Scalability | 3/10 | Unpaginated reads, client waterfalls, synchronous write amplification, no queues/rate limits. |
| Maintainability | 3/10 | No tests/CI/migrations; overlapping state and untyped DB calls. |
| Performance | 4/10 | Query caching exists, but client scope and heavy dependencies are excessive and unmeasured. |
| Security | 1/10 | Direct payment forgery plus unsigned webhook is a decisive critical failure. |
| Documentation | 2/10 | README is stale and lacks setup/architecture/operations; in-app API docs are a positive exception. |
| Developer Experience | 3/10 | Conventional structure and strict TS help; missing setup, DB schema, scripts, formatter, tests, and clean lint hurt. |
| Testing | 1/10 | No automated tests or test runner; only a manual API-key script and prototype “test” UI folder. |
| Production Readiness | 1/10 | Critical security, data, delivery, observability, and lifecycle blockers. |
| Overall Project Health | 3/10 | Promising pre-alpha foundation, unsafe as a commercial production deliverable. |

---

# Final Verdict

## Is this project production ready?

**No.** It is not close enough for a conditional approval. The repository implements a credible SaaS skeleton and several real workflows, but its most sensitive workflow—payment to entitlement—is deliberately bypassable from the browser. A product that can be “paid” with a caller-generated mock reference cannot be delivered as a production commercial marketplace.

## Would I approve it?

**No. I would reject the current release.** I would permit only isolated development/demo use with mock payment clearly disabled from any shared or public environment and with non-production data.

## What blocks approval?

The non-negotiable blockers are payment authenticity, signed webhooks, transactional/idempotent provisioning, committed and tested database/RLS definitions, correct key/invitation security, production email, comprehensive automated tests/CI, clean release checks, subscription entitlement lifecycle, rate limiting, and production observability/recovery.

## What must be done before shipping?

Complete the Immediate roadmap, then demonstrate the following in a clean environment created solely from the repository:

1. Database migrations and policies deploy successfully and enforce cross-tenant isolation under adversarial integration tests.
2. Forged, replayed, mismatched, duplicated, and out-of-order payment events cannot grant access or corrupt money state.
3. Every multi-step financial/invitation/ownership transition is atomic or durably retryable.
4. All lint, typecheck, unit, integration, E2E, migration, dependency, and production-build checks pass in CI.
5. Subscription cancellation/failure actually revokes or limits entitlement according to a documented state machine.
6. Secrets/keys are minimally exposed, rotated, audited, and rate-limited.
7. Monitoring, alerting, reconciliation, backup/restore, rollback, and incident procedures are exercised—not merely documented.

Until those conditions are satisfied, presenting this repository as “production-grade” would expose the client to preventable security, revenue, data-integrity, and operational risk.

---

## Audit Scope and Verification Notes

This review covered repository documentation, package/configuration files, environment example, Next.js 16 local guidance, App Router routes/layouts/handlers, components, hooks/providers, schemas/types/configs, Supabase clients/services, Server Actions, developer API, payment webhooks, scripts, public/static data, Supabase configuration, and the presence/absence of tests, migrations, CI, and deployment artifacts. Generated third-party code in `node_modules` was not audited as application source; relevant installed Next.js 16 guides were consulted as required by `AGENTS.md`. Stock shadcn/Radix UI primitives were assessed structurally rather than treated as bespoke business logic.

Commands executed on 2026-08-04:

- `npm run lint` — failed: 43 errors, 45 warnings.
- `npx tsc --noEmit` — passed.
- `npm run build` — inconclusive for application compilation because restricted network access prevented `next/font/google` from downloading Roboto and Roboto Mono. This should be rerun in CI and made hermetic where practical.

No application code was modified as part of this audit. The only intended repository change is this report.
