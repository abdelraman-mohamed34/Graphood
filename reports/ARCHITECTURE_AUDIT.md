# Architecture Audit

## Executive Conclusion

The repository has a recognizable layered intention, but it **does not consistently implement** the stated architecture:

`Client → Hook → Server Action → Service → Supabase`

The dominant mutation path often follows that direction, especially for billing, coupons, profile changes, invitations, systems, and tenant updates. However, reads and several mutations use competing paths:

```text
Client Component → Hook → browser Supabase client → Service → Supabase
Client Component → browser Supabase client → Service → Supabase
Client Page → browser Supabase client → Service → Supabase
Server Page/Layout → Service → Supabase
Route Handler → Service → Supabase
Route Handler → Server Action → Service → Supabase
Server Action → Supabase directly
Server Action → another Server Action → Service
Service → authorization helper → Service/Supabase
```

This is not merely a theoretical purity issue. The same operation can cross different authentication, authorization, validation, caching, and error-handling boundaries depending on its caller. A generic `SupabaseClient` parameter can represent an anonymous browser client, a user cookie client, or the service-role client, so the effective privilege of a service is not visible in its API. The result is a partially layered system with weakly enforced boundaries rather than a dependable architecture.

### Overall assessment

| Dimension | Assessment |
|---|---|
| Intended flow clarity | Moderate |
| Mutation adherence | Moderate; most mutations use Hooks and Actions, with exceptions |
| Read adherence | Low; direct Service/Supabase access is common |
| Layer responsibility | Mixed; Hooks and Actions contain substantial business orchestration |
| Dependency direction | Inconsistent |
| Circular dependencies | Two confirmed hook/barrel cycles |
| Architectural enforceability | Low; no lint/import-boundary rules or CI |
| Overall architecture health | **4/10** |

The current architecture is therefore **not already good enough to approve as a consistently layered production architecture**. Its domain grouping and reusable guards are a useful foundation, but the dependency rules must first be made explicit, pragmatic, and enforceable.

---

# Scope and Method

This audit inspected all TypeScript/TSX application files and classified dependencies among:

- App Router pages, layouts, route handlers, and route-local components
- Shared UI components and providers
- Hooks under `src/shared/lib/hooks`, `src/features`, and `src/hooks`
- Server Actions under `src/shared/lib/actions`
- Supabase services under `src/shared/lib/supabase/services`
- Supabase browser, server-cookie, and admin client factories
- Schemas, types, authorization helpers, configuration, and utilities

The audit used import searches, direct database-call searches, manual flow tracing, file-size/responsibility review, and an internal-import graph traversal. The graph resolved 386 TypeScript/TSX modules and found two cycles. Dynamic imports or runtime dependency injection could evade static analysis, but none materially changed the observed architecture.

Generated UI primitives were not treated as business-layer code. Server-rendered pages/layouts are described separately from browser Client Components because allowing Server Components to call read services directly can be a valid architecture—provided that exception is intentional and documented.

---

# Intended Architecture Versus Actual Architecture

## Intended responsibilities

```text
Client
  Renders state, captures interaction, calls a Hook.
    ↓
Hook
  Adapts UI events to application calls; manages query/mutation lifecycle.
    ↓
Server Action
  Defines the server trust boundary: validate, authenticate, authorize, orchestrate.
    ↓
Service
  Performs one domain/data operation behind a stable server-only interface.
    ↓
Supabase
  Persists/query data and enforces database invariants/RLS.
```

## Actual dominant patterns

### Mutation path

Many mutations correctly resemble:

`Component → Hook → Server Action → Service → Supabase`

Examples include order creation, coupon mutations, tenant updates, profile mutations, and several membership/invitation mutations.

Even here, the pattern is not universal:

- Some Components call Server Actions directly.
- Authentication Hooks call Supabase Auth directly.
- General settings uploads directly through a Service with a browser Supabase client.
- Ownership transfer Action queries Supabase directly.
- Several Actions call other Actions as reusable authorization/application functions.

### Query path

Reads generally do **not** follow the declared architecture:

- Client Hooks call Services with the browser Supabase client.
- A Client Page calls a Service directly.
- Server layouts/pages call Services directly for hydration and authorization.
- Developer route handlers call Services directly.

This can be a defensible command/query split, but no such exception is documented. The repository currently presents one intended flow while implementing at least four.

## Recommended target rule

The architecture should not force every server-rendered read through a Server Action. That adds ceremony without adding a trust boundary. A more appropriate declared rule is:

```text
Browser UI mutation → Hook → Server Action → Application/Domain Service → Repository → Supabase
Browser UI query    → Hook → Route/API or safe query Action → Application/Domain Service → Repository → Supabase
Server Component    → Application query function → Repository → Supabase
Route Handler       → Application use case → Repository → Supabase
```

The essential constraint is that **browser code never imports database clients or repositories**, and **database privilege is explicit**. Server Components and Route Handlers may enter at the application/use-case layer without pretending to be browser Hooks.

---

# Direct Answers to Requested Violation Checks

## 1. Components calling Supabase directly

### Confirmed violations

#### `general-settings-form.tsx` — High

`src/app/[locale]/(dashboard)/(tenant)/[tenant_slug]/dashboard/settings/_components/general-settings-form.tsx:14-42`

This Client Component imports `createClient`, constructs a browser Supabase client, and calls `uploadTenantLogoService` directly. It also exports an `uploadTenantLogo` data-access wrapper from the UI file.

Why this is a problem:

- The UI owns a persistence dependency and chooses the database credential context.
- Logo upload bypasses a Server Action trust boundary.
- Authorization depends entirely on storage RLS that is not visible in this repository.
- Validation and orchestration are split across Component and Service.
- The UI cannot be tested independently of Supabase.

Recommended solution: expose `uploadTenantLogoAction`, call it through a dedicated tenant-settings Hook, authorize tenant membership/permission in the Action, and let a server-only Service/Repository perform storage work.

#### `marketplace/systems/[system_id]/page.tsx` — High

`src/app/[locale]/(main)/marketplace/systems/[system_id]/page.tsx:2-20`

This Client Page imports `createClient`, constructs Supabase, and calls `getSystemById` inside React Query.

Why this is a problem:

- It explicitly skips Hook and Action layers.
- It duplicates data already fetched and hydrated in the route layout.
- The Component knows query keys, database client construction, and Service semantics.
- The Service name suggests unrestricted “get by ID,” while browser safety actually depends on RLS.

Recommended solution: make the page a Server Component that receives a public DTO, or use a purpose-specific `usePublicSystem(systemId)` Hook backed by a safe query boundary. Do not expose the generic `getSystemById` repository-style function to browser code.

### Supabase usage in Proxy and server layouts

`src/proxy.ts` constructs a Supabase SSR client for cookie refresh/auth routing. This is **not a Component violation**; Proxy is an infrastructure adapter.

Server layouts construct server/admin clients. That violates the literal five-step flow, but is better classified as an undocumented server-read exception rather than “Client calls Supabase.” The serious issue is use of the service-role client in presentation composition, discussed below.

## 2. Components calling Services directly

### Browser Client Components

- `general-settings-form.tsx:17,38-42` calls the tenant-logo storage Service directly.
- `marketplace/systems/[system_id]/page.tsx:7,19` calls the System Service directly.

These are true violations of the intended flow.

### Server Pages and Layouts

The following presentation files call Services directly:

- `src/app/[locale]/layout.tsx` — `fetchUser`, `fetchProfile`, `getMembershipsByProfileId`
- Tenant dashboard layout — `getMembershipsByTenantSlug`
- Quick-view layout — `getSubscriptionByTenantID`
- Workspaces layout — `getMembershipsByProfileId`
- Developer System layouts — `fetchProfile`, `getCurrentSystems`
- Marketplace System layouts/pages — `getSystemById`
- Checkout layout — `fetchUser`, `getOrderById`
- Invitation acceptance page — `getInvitationByToken`, `getWhatByFrom`

Severity: **Medium architecturally**, with individual security severity varying.

Server Components are allowed to query the server directly in Next.js. The problem is not that a Hook was skipped; Hooks are browser/UI adapters and should not be required here. The problem is that these files call low-level, generic Supabase Services rather than explicit application queries, and some construct the service-role client. Presentation code therefore makes privilege and authorization decisions.

Recommended solution: formally allow `Server Component → Query Use Case → Repository`, and add named query functions such as `getPublicSystemDetails`, `getCheckoutForUser`, and `getInvitationPreview`. These functions should return narrow DTOs and encapsulate authorization/client selection.

### Route Handlers

Developer API routes call Services directly. Route Handlers are transport adapters, not UI Components, so this is acceptable only if they call application use cases rather than raw repositories. Current routes mix both:

- `/memberships` and `/tenant` create the admin client and call query Services directly.
- `/me` creates a cookie-bound server client and calls `getSystemById` despite API-key authentication.
- `/health` queries Supabase directly rather than through a health repository.

Severity: **Medium**. Standardize Route Handler entry into application query/use-case functions and remove client selection from handlers.

## 3. Hooks calling Supabase directly

### Confirmed direct Auth/database-client usage

- `src/shared/lib/hooks/auth/use-login.ts:22-26,54-56` — password login and logout directly through Supabase Auth.
- `src/shared/lib/hooks/auth/use-register.ts:16,36-46` — registration directly through Supabase Auth.
- `src/shared/lib/hooks/profile/use-profile.ts:43` — calls `supabase.auth.getUser()` directly.
- `src/shared/lib/hooks/systems/use-system.ts:35,47-55` — calls `supabase.auth.getUser()` directly before loading current Systems.

Severity: **High against the stated architecture**, **Medium if browser Auth is explicitly exempted**.

Supabase Auth browser calls can be a valid adapter choice, but the repository has not declared an Auth exception. The Hooks currently contain provider-specific calls, redirect decisions, invitation auto-accept orchestration, toasts, and query state. This makes Auth behavior difficult to reuse outside React and means server-side auth policies are not a single boundary.

Recommended solution: decide explicitly between:

1. A documented `Auth Hook → Supabase Auth Adapter` exception for login/logout/register, with all post-auth application operations still going through Actions; or
2. Server Actions for password auth and registration.

Either is acceptable if consistent. Do not leave it accidental.

### Hooks constructing Supabase clients for Services

The following Hooks import `createClient` even when the direct `.from()` resides in the Service:

- `use-user.ts`
- `use-profile.ts`
- `use-invitations.ts`
- `use-memberships.ts`
- `use-subscription.ts`
- `use-system.ts`
- `use-tenant.ts`
- `use-tenant-limit.ts`

They choose a database adapter/credential and pass it into Services. Architecturally, this is still direct Hook-to-data-layer coupling.

## 4. Hooks calling Services directly

### Confirmed violations

- `use-user.ts` → `fetchUser`
- `use-profile.ts` → profile fetch/update-related Services in addition to Actions
- `use-invitations.ts` → `getPendingInvitations`
- `use-memberships.ts` → `getMembershipBySlug`, `getMembershipsByTenantSlug`
- `use-subscription.ts` → `getSubscriptionByTenantID`
- `use-system.ts` → `getPublicSystemsClient`, `getCurrentSystems`
- `use-tenant.ts` → `getMembershipBySlug`

Severity: **High relative to the explicitly required flow**.

This pattern is systematic, not isolated. Reads were evidently designed to go directly from React Query to browser-safe Supabase Services, while mutations use Actions. That is a plausible design, but it contradicts the stated architecture and makes RLS the unspoken application layer.

Recommended solution: choose and document one of two models:

- Strict five-layer model: Hooks call query Actions/Route Handlers; Services are server-only.
- Explicit CQRS model: Hooks call a typed browser query gateway that exposes only RLS-safe, read-only operations; it must be clearly distinct from privileged server Services/Repositories.

Given the absent database policies and generic Services, the strict server-only model is safer until RLS is versioned and tested.

## 5. Server Actions bypassing Services

### Confirmed direct database call

`src/shared/lib/actions/memberships/transfer-ownership.action.ts:51-55` directly queries `memberships` to load the target membership.

Severity: **Medium**.

The Action otherwise delegates ownership mutation to `transferOwnership`. The direct read duplicates repository responsibility and makes the Action depend on table/column details.

Recommended solution: add a tenant-scoped membership query Service/Repository, or make a single ownership-transfer application Service validate and execute the entire use case transactionally.

### Server Actions calling other Server Actions

Confirmed examples:

- API-key create/delete/list/update/regenerate Actions call `getSystemAction` for authorization.
- `resolveDeveloperContextAction` calls `verifyApiKeyAction`.
- Some profile Actions import through action barrels, increasing ambiguous Action-to-Action edges.

Severity: **Medium**.

A Server Action is a transport/trust-boundary entry point, not a reusable domain service. Calling one Action from another couples application logic to framework entry points and creates nested validation/error conventions.

Recommended solution: extract reusable use cases/policies (`requireSystemOwner`, `verifyApiKey`, `resolveDeveloperContext`) into server-only application/domain modules. Both Actions and Route Handlers should call those modules.

### Logic-heavy Actions

Several Actions delegate persistence but still hold most business policy:

- `create-order.action.ts` validates license/plan combinations, checks existing license/order state, selects price, validates coupons, builds descriptions, and chooses provider.
- `create-invitation.action.ts` implements role hierarchy, permissions, plan limits, membership duplication, pending-invitation checks, email orchestration, and cache revalidation.
- `accept-invitation.action.ts` hashes tokens, binds user email and tenant, inserts membership, updates invitation, and redirects.
- Coupon Actions duplicate ownership policy around Services.

This does not bypass Services, but it violates single responsibility for the Action layer. Actions should adapt input/context and invoke application use cases; business rules should be independently testable outside Next.js.

## 6. Services depending on UI or React

No Supabase Service directly imports React components, React Hooks, `sonner`, or route UI. That is positive.

One reverse dependency remains:

`remove-membership-from-tenant.service.ts:2` imports `hasPermission` from `auth/requires/require-permission.ts`.

This is not UI/React, but it is an upward/cross-layer dependency: a data Service depends on an “auth/requires” application policy module. The function is actually pure domain policy and is misplaced.

Severity: **Medium**.

Recommended solution: move permission calculation to a framework-neutral `domain/rbac` or `policies` module. Application use cases depend on it; repositories should generally not perform actor-policy decisions unless the repository method is deliberately tenant-scoped.

## 7. Services containing presentation logic

### `send-invitation-email.service.ts` — High

This 284-line Service contains:

- Email transport construction
- A commented-out alternate provider implementation
- Environment URL composition
- Subject/copy selection
- A complete HTML/CSS email template
- Tenant/inviter/message interpolation
- Logging
- Delivery invocation

It also accepts `locale` but does not use it, and it omits locale from the active URL.

This is the clearest Service-layer presentation violation. Email markup is presentation, transport is infrastructure, and invitation orchestration is application behavior.

Recommended split without rewriting behavior:

- `InvitationEmailTemplate` / renderer: presentation and escaping/localization
- `EmailTransport` adapter: Nodemailer/Resend
- `SendInvitationEmail` application use case: data needed, URL, delivery request
- Configuration module: base URL/from identity/provider

No other Supabase Service contains React/UI markup. Several Services do contain user-facing English error strings; that is presentation leakage at a smaller scale. Prefer typed domain errors/codes and translate at the UI/transport boundary.

## 8. Business logic inside Components or Hooks

### Components

#### Tenant logo upload and validation — High

`general-settings-form.tsx:95-140` validates allowed MIME types and a 2 MB limit, uploads the file, composes the update payload, and triggers tenant mutation. This is application orchestration and duplicated validation, not only presentation.

#### Marketplace System details — Medium

The Client Page owns database query construction and applies display/business fallbacks such as currency and price fields. It also uses `base_price`, a field not present in the reviewed System schema, showing the danger of business/data interpretation in UI.

#### Checkout selection page — Medium

`marketplace/systems/[system_id]/get/page.tsx` contains license/plan selection, price selection, coupon-preview state invalidation, checkout payload composition, and availability decisions. Some view-model logic belongs near UI; authoritative pricing/license rules do not. Similar rules already exist in `create-order.action.ts`.

#### Checkout order page — Medium

`marketplace/checkout/[order_id]/page.tsx:55-60` reconstructs subtotal/discount/tax/total locally and hardcodes discount/tax to zero despite order fields. Financial presentation should consume a server-computed immutable summary DTO.

#### Membership UI policy — Low/Medium

Member tables and invite layouts call `hasPermission` to decide visibility/actions. UI authorization for affordances is appropriate, but it duplicates server authorization and must never be treated as enforcement. Naming/documentation should identify it as capability display only.

### Hooks

#### `useTenantUsage` — High

`src/shared/lib/hooks/tenants/use-tenant-usage.ts:41-117` calculates plan, license, unlimited behavior, admin counts, remaining capacity, percentages, member/storage limits, and feature availability. These are entitlement/business rules in a React Hook.

The server guard implements different logic and does not honor all of these rules. This has already created policy divergence.

Recommended solution: extract a pure `calculateTenantUsage/capabilities` domain function used by both server use cases and UI adapters. The Hook may gather data and call that pure function.

#### `useTenant` — Medium

`useTenant.ts:99-132` derives named capabilities from permissions. Pure derivation is reasonable in a view-model Hook, but those capability definitions should come from a shared policy function, not be independently named/mapped in the Hook.

#### `useRegister` — Medium

The Hook decides invitation-aware redirects and immediately invokes invitation acceptance after registration. It mixes authentication adapter, application workflow, navigation, and notification behavior.

#### `useSystem` — Medium

One Hook orchestrates public Systems, current-user Systems, single-System reads, and all CRUD mutations. This is multiple use cases with different authentication and caching requirements.

#### `useMemberships`, `useInvitations`, `useProfile` — Medium

These combine query repositories, mutation Actions, router effects, cache invalidation, error interpretation, and sometimes policy. They are useful UI facades but too broad to be a single-responsibility “Hook layer.”

---

# Layer Responsibility Audit

## Client layer

### Expected responsibility

- Render serializable view data.
- Capture user interaction.
- Maintain ephemeral display state.
- Invoke Hooks.
- Display loading/error/success states.

### Actual responsibility

The Client layer also constructs Supabase clients, calls Services, performs file validation, initiates storage mutations, builds financial summaries, interprets pricing/license choices, and directly calls some Server Actions.

### Single-responsibility verdict

**No — 5/10.** Most components are presentation-oriented, but two direct database/service paths and several business-heavy screens violate the boundary.

## Hook layer

### Expected responsibility

- Present a UI-friendly interface to application operations.
- Manage React Query/mutation state and local view effects.
- Convert typed application results to view state.

### Actual responsibility

Hooks construct browser Supabase clients, call Services directly, call Auth directly, call Actions for mutations, calculate entitlements, derive authorization capabilities, navigate, show toasts, and manage multiple unrelated queries.

### Single-responsibility verdict

**No — 3/10.** Hooks are currently a hybrid of query gateway, application service, view model, and UI-effects layer.

## Server Action layer

### Expected responsibility

- Establish server boundary.
- Parse/validate untrusted input.
- Authenticate and authorize actor/resource.
- Call one application use case.
- Map outcome to a serializable result and invalidate UI cache.

### Actual responsibility

Actions often do validate/authenticate/authorize correctly, which is positive. They also contain substantial pricing, licensing, hierarchy, duplication checks, financial workflow, token workflow, and email orchestration. Some call other Actions; one queries Supabase directly; result/error contracts vary widely.

### Single-responsibility verdict

**Partially — 5/10.** They are the best-defined boundary, but too much application/domain logic resides inside them.

## Service layer

### Expected responsibility

The word “Service” is ambiguous. Under the stated architecture it appears intended to encapsulate Supabase data operations and domain operations behind the Action boundary.

### Actual responsibility

The folder includes at least four different concepts:

1. Thin repositories (`getSystemById`, `getTenantById`).
2. Privileged repositories that construct the admin client internally.
3. Application workflows (`confirmOrderPayment`, `createSubscription`, `createCoupon`).
4. External infrastructure/presentation (`sendInvitationEmail`).

Services accept inconsistent client ownership: some require a caller-supplied client, some always create admin, and some await a synchronous client constructor. Their signatures do not communicate privilege, RLS assumptions, actor, or transaction scope.

### Single-responsibility verdict

**No as a layer — 4/10.** Many individual CRUD Services are small and cohesive, but the folder as a whole conflates repository, application service, policy, and infrastructure.

## Database layer

### Expected responsibility

- Persistence and queries.
- Referential, uniqueness, check, and transaction invariants.
- Tenant isolation through versioned RLS.
- Atomic domain transitions/RPCs where necessary.

### Actual responsibility

Supabase is accessed by browser clients, cookie clients, and service-role clients. Database schema/types/RLS/migrations are absent, so responsibility cannot be audited or reproduced. The application performs many read-then-write workflows outside transactions.

### Single-responsibility verdict

**Unverifiable — 2/10 for repository integration.** Postgres may contain appropriate controls remotely, but they are not part of the delivered architecture.

---

# Duplicated Business Logic

## 1. Subscription capability and limit logic — High

Locations:

- `shared/config/plans.ts` defines plan limits.
- `auth/requires/require-subscription.ts` derives active status, plan, license, and capabilities.
- `auth/guards/tenant-limit.ts` performs server-side usage enforcement.
- `hooks/tenants/use-tenant-usage.ts` independently derives limits, unlimited license behavior, counts, and features.
- Subscription UI components contain placeholder feature availability.

Problem: the implementations already disagree. UI treats reseller/exclusive as unlimited; server `checkTenantLimit` does not. Server maps only `maxAdmins`, while UI exposes members/storage/features.

Recommendation: one pure entitlement policy module plus repository-supplied usage facts. Server enforcement and UI projection must call the same pure functions.

## 2. System ownership authorization — High

Repeated in:

- `get-system.action.ts`
- `update-system.action.ts`
- developer System layout
- coupon create/get/delete Actions
- API-key Actions indirectly via `getSystemAction`
- marketplace redirect logic

Problem: repeated ownership checks produce inconsistent errors and extra queries; some paths use user client, others admin client.

Recommendation: a reusable `requireSystemOwner(actorId, systemId)` application policy/query returning an authorized System DTO. Do not make a Server Action the reusable primitive.

## 3. Authentication lookup — Medium

`requireUser`, direct `fetchUser`, and direct `supabase.auth.getUser()` occur across layouts, Actions, Services, and Hooks.

Problem: authentication behavior and failure semantics vary among redirect, null, thrown Error, and returned error.

Recommendation: define environment-specific adapters: `getOptionalServerActor`, `requireServerActor`, and explicit browser Auth adapter. Actions use the required actor; server reads choose required/optional deliberately.

## 4. Tenant membership/permission checks — Medium

Membership is loaded and permissions checked in tenant layout, invite layout, create/cancel/resend invitation Actions, tenant update, removal, transfer ownership, Hooks, and table UI.

Some duplication is defense-in-depth and appropriate: UI capability visibility plus server enforcement. The problematic duplication is repeated server policy composition and differing permission alternatives.

Recommendation: preserve UI checks as non-authoritative projections; centralize each server policy (`canInviteMember`, `canRemoveMember`, `canManageTenant`) with resource scope.

## 5. Order ownership — Medium

Both `get-order.action.ts` and checkout layout fetch/authenticate/check `order.profile_id`. The layout bypasses the Action and repeats the policy.

Recommendation: `getCheckoutForActor(orderId, actorId)` query use case used by both transport entries.

## 6. Invitation token and state workflow — High

Token hashing appears in invitation page, accept Action, and reject Action. Status/expiry checks live in getter Services, while updates use a less constrained Service. Tenant/email checks live in acceptance Action. Resend incorrectly treats stored hash as raw token.

Recommendation: a cohesive invitation token/state-machine application service with atomic repository operations; presentation receives an invitation-preview DTO.

## 7. Membership removal authorization — Medium

The Action checks `members.remove`; the Service re-authenticates and allows removal only when the actor is OWNER plus permission.

Problem: explicit permission overrides may pass the Action but fail the Service. Duplicate checks encode different policy.

Recommendation: one policy decision in the application use case and one tenant-scoped atomic repository command. Database RLS remains defense-in-depth, not a second divergent business policy.

## 8. Pricing/license selection — High

Pricing/license availability is interpreted in the purchase Client Page and recalculated in `create-order.action.ts`; plan/license types also live in configs and subscription helpers.

Client preview duplication is expected, but it must use a shared pure quote function or an authoritative server quote DTO. Today the Action manually switches on fields and the UI separately selects amounts.

---

# Duplicated Validation

## Avatar validation — Medium

`avatar-card.tsx` and `upload-avatar.service.ts` both define a 5 MB maximum and MIME allow-list. This duplication is reasonable for fast UI feedback plus authoritative server enforcement, but constants already risk drift and should share a neutral contract module. Server validation remains mandatory.

## Tenant logo validation — High

`general-settings-form.tsx` validates a 2 MB PNG/JPEG/JPG/WEBP rule, while `upload-tenant-logo.service.ts` contains its own rules. The validation starts in the Component because the Service is called from the browser; no Action revalidates actor/resource.

Recommendation: shared public constraints for UI hints, authoritative server schema/content validation in Action/use case, and storage Service limited to persistence.

## System/order/coupon schemas — Medium

Several Actions define inline Zod schemas while related domain schemas already exist:

- `createOrderSchema`, `getOrderSchema`, `processPaymentWebhookSchema`, `validateCouponSchema`
- Inline `getCouponsSchema` and delete-coupon schema
- System insertion parses the full insert schema rather than a named Action contract

Not every input contract should reuse a database/domain entity schema, but action contracts should live in a consistent `contracts` or `schemas/inputs` area. Current placement makes discovery and reuse inconsistent.

## Invitation validation — Low/Medium

Invitation creation correctly reuses `createInvitationSchema`, but token string validation in accept/reject/page is ad hoc. URL params are checked for presence, then hashing assumes valid text.

## Database response validation — Inconsistent

`get-membership.service.ts` parses a joined response with Zod, while most Services return unparsed, untyped Supabase rows. This is not duplicate validation; it is inconsistent boundary validation. Decide whether generated database types are trusted internally and Zod is used at external boundaries, or parse all critical joined/domain DTOs.

---

# Duplicated Authorization

## Appropriate duplication

- UI permission checks that hide/disable controls **plus** Action enforcement are appropriate defense-in-depth.
- Route/layout access checks **plus** mutation authorization are appropriate because layouts do not protect independently invoked Server Actions.
- Database RLS **plus** application authorization is appropriate if both express the same policy and are tested.

## Harmful duplication

- System ownership is manually repeated across Actions/layouts.
- Member removal policy differs between Action and Service.
- Invite permission arrays are repeated across layout/create/cancel/resend.
- Order ownership is repeated across layout and Action.
- Authentication is implemented via `requireUser`, `fetchUser`, and raw `auth.getUser` with different semantics.
- Generic admin-backed Services force callers to add authorization manually, making omission easy.

The recommendation is not to remove defense-in-depth. It is to define shared, framework-neutral policies and tenant-scoped repository commands so every layer repeats enforcement intentionally rather than re-implementing policy.

---

# Oversized and Multi-Responsibility Services

## `send-invitation-email.service.ts` — 284 lines — High

Responsibilities: provider selection, transport configuration, URL generation, email localization/copy, HTML/CSS rendering, interpolation, delivery, logging, and dead alternate implementation.

Recommended boundaries: application use case, template renderer, transport adapter, configuration.

## `create-coupon.service.ts` — 255 lines — High

Responsibilities include input normalization, code generation, System lookup/ownership authorization, time/range/business validation, insert construction, database insert, error mapping, and extensive logging.

This duplicates ownership validation in `create-coupon.action.ts`. Split pure coupon policy/normalization from repository insertion. Authorization belongs in the use case, not both Action and persistence Service.

## `validate-coupon.service.ts` — 240 lines — Medium/High

Coupon validation is legitimately rule-heavy, but this Service mixes database lookups/use-count queries with pure eligibility and discount calculations. Its rules are difficult to unit-test without Supabase.

Recommended split: repository loads coupon/usage facts; pure policy returns eligibility/discount; application use case combines them.

## `confirm-payment.service.ts` — 126 lines — Critical responsibility concentration

Loads order/payment, performs idempotency decision, mutates payment/order, consumes coupon, provisions subscription/tenant/membership, and returns aggregate state. Size is not the issue; transactional/business scope is.

Recommended boundary: a `ConfirmPayment` application use case backed by one transactional repository/RPC and durable event semantics.

## `create-subscription.service.ts` — 121 lines — High

Loads/validates paid order, checks idempotency, creates subscription, applies plan/license mapping and dates, and links reverse relation. It is a use case plus repository and should execute transactionally.

## `create-order.service.ts` — 111 lines — Medium/High

Creates order, creates payment, attempts compensating delete, and encodes amount invariants. This is a transaction boundary disguised as a CRUD Service.

## Services that are appropriately small

Many `get-*`, `update-*`, storage, and API-key Services are short single-query wrappers. Their cohesion is good, but their privilege/client contracts remain ambiguous.

---

# Circular Dependency Analysis

Two internal cycles were confirmed.

## Cycle 1 — High

```text
shared/lib/hooks/invitations/index.ts
→ use-invitations.ts
→ shared/lib/hooks/index.ts
→ shared/lib/hooks/invitations/index.ts
```

Cause: `use-invitations.ts:14` imports `useTenant` from the top-level hooks barrel (`@/shared/lib/hooks`) while that barrel re-exports invitations.

Impact: fragile initialization/order, broader bundles, difficult tree-shaking, and hidden coupling. It may work under ESM bundling until a value initialization or refactor turns it into a runtime failure.

Recommended solution: internal modules must import concrete sibling modules (`../tenants/use-tenant`) rather than their own aggregate barrel. Reserve barrels for consumers outside the package boundary.

## Cycle 2 — High

```text
shared/lib/hooks/invitations/index.ts
→ use-invitations.ts
→ shared/lib/hooks/index.ts
→ shared/lib/hooks/tenants/index.ts
→ use-tenant-usage.ts
→ shared/lib/hooks/invitations/index.ts
```

Cause: the same barrel import plus `useTenantUsage` composing `useInvitations`.

Impact and solution are the same. The deeper design issue is mutual feature composition: invitation hooks depend on tenant hooks while tenant-usage depends on invitation hooks. Extract a lower-level tenant context identifier and a pure usage aggregator, or pass tenant facts as arguments instead of importing feature facades in both directions.

No cycle was found among resolved Supabase Service modules. Static analysis cannot prove absence of runtime/dynamic cycles, but no contrary evidence was found.

---

# Dependency Rule Violations

## Severity matrix

| Rule | Status | Severity | Representative evidence |
|---|---|---:|---|
| Client must not import Supabase | Violated | High | General settings form, marketplace System page |
| Client must not import Service | Violated | High | Same two files |
| Client should call Hook, not Action | Violated | Medium | Invite buttons/forms, member row/transfer, account card |
| Hook must not import Supabase | Systematically violated | High | Auth, profile, invitation, membership, subscription, System, tenant Hooks |
| Hook must not import Service | Systematically violated | High | Read/query Hooks |
| Action must not query Supabase directly | Violated | Medium | Transfer ownership Action |
| Action must not call another Action | Violated | Medium | API-key Actions and developer context Action |
| Service must not depend on UI/React | Respected | — | No React/UI imports found |
| Service must not contain presentation | Violated | High | Invitation email HTML/subject/URL |
| Repository privilege must be explicit | Violated | High | Mixed caller-supplied and internally created admin clients |
| Lower layer must not import higher policy layer | Violated | Medium | Membership removal Service imports auth permission helper |
| Internal feature modules must avoid barrel cycles | Violated | High | Two confirmed hook cycles |
| Business policy must be framework-neutral | Violated | High | Entitlements in Hook; pricing/hierarchy in Actions/Components |

## Components calling Actions directly

Although the user's explicit list emphasizes data-layer bypasses, the stated flow also requires Components to call Hooks. Direct Component-to-Action imports include:

- Transfer ownership component
- Member row/removal UI
- Invite-member form
- Accept and Reject invitation buttons
- Profile account card
- Developer System layout

Severity: **Medium**.

For a small one-off form, a direct Server Action can be idiomatic Next.js. Under this project's declared architecture, however, it is inconsistent. Decide whether Hooks are mandatory only when client query/mutation state is needed. If direct form Actions are allowed, document the exception rather than wrapping every button in a ceremonial Hook.

## Server-only protection

Supabase Services and admin/crypto helpers do not consistently import `server-only`. Some are currently imported into Client Components and Hooks, proving that the module graph permits environment leakage.

Severity: **High** for admin/secret-bearing modules, **Medium** for generic repositories.

Recommendation: mark privileged repositories, application services, admin client, email transport, and secret crypto modules `server-only`. Provide explicitly safe browser adapters only if the architecture retains direct RLS-backed reads.

## Generic client injection

Many Services accept `SupabaseClient` without a generated `Database` type or privilege marker. Other Services create `createAdminClient()` internally.

Severity: **High**.

Recommended solution: distinguish types and modules, for example `UserDb`, `AdminDb`, `PublicReadRepository`, and `TenantRepository`, and keep client construction in infrastructure composition roots. A function that requires bypass privileges should state so in its name/type and accept actor/resource context.

---

# Naming and Folder Organization

## Inconsistent Hook locations

Hooks exist in:

- `src/shared/lib/hooks`
- `src/features/billing`
- `src/features/developer/api-keys/hooks`
- `src/hooks`
- Route-local `hooks`

There is no rule explaining which location owns a Hook. This directly contributes to barrel cycles and inconsistent imports.

Recommendation: choose feature-based ownership (`features/<feature>/{ui,hooks,actions,application,infrastructure}`) or a disciplined shared-layer layout. Keep only truly generic Hooks in `src/hooks` or `shared`.

## “Service” means too many things

`src/shared/lib/supabase/services` contains repositories, application workflows, authorization-aware operations, email transport, and presentation templates. It also couples every domain service concept to Supabase in its path, even when the operation is not a Supabase concern.

Recommendation: introduce conceptual folders without an immediate rewrite:

- `domain/` — pure policies/types
- `application/` — use cases
- `infrastructure/supabase/` — repositories/client factories
- `infrastructure/email/` — transport
- `presentation/` or feature UI — email templates and React

Migrate incrementally when touching files.

## Inconsistent singular/plural naming

- `billing` versus `billings`
- `tenant` versus `tenants`
- `system` versus `systems`
- `api-key` versus `api-keys`
- `profile` versus `profiles.schema`

The distinction sometimes means domain versus collection and sometimes appears accidental.

## Inconsistent casing and suffixes

- `get-Invitation-by-token.service.ts` contains an uppercase `I` unlike peer filenames.
- Components alternate PascalCase filenames (`GoogleBtn.tsx`, `Footer.tsx`, `SnapGallery.tsx`) and kebab/lowercase filenames.
- Actions use both `get-public-system-action.ts` and `*.action.ts` conventions.
- `navbar-search-Input.tsx` has mixed casing.
- `couponUsageSchema.ts` differs from kebab/dotted schema conventions.

## Ambiguous or misleading names

- `System` is a broad platform term and can be confused with runtime/system roles.
- `getWhatByFrom` is a generic dynamic query helper that hides table/column contracts and weakens discoverability/type safety.
- `require-permission.ts` exports pure `get/has` helpers rather than a throwing `requirePermission` function.
- `resolveDeveloperContextAction` is called from a Route Handler as an application function, not used as a UI Server Action.
- `processPaymentWebhookAction` is callable from the Client and is also called by a webhook; its name obscures two incompatible trust sources.
- Route-local `_components/actions` contains React action menus, while `shared/lib/actions` contains Server Actions.
- `src/app/[locale]/(main)/_components/test` holds production marketing components, not tests.

## Cross-root utility placement

Developer key crypto lives in `src/lib/utils/developer`, while most application code lives under `src/shared/lib`. Public locale/sex data is imported into domain schemas from `public/data`, coupling validation to a presentation/static-assets directory.

Recommendation: move domain constants beside schemas/config, and reserve `public` for deployable static assets.

---

# Recommended Improved Architecture

This recommendation does not require a wholesale rewrite. It defines boundaries that can be adopted incrementally.

## 1. Declare two legitimate entry paths

```text
Browser mutation:
Component → Feature Hook → Server Action → Application Use Case → Repository → Supabase

Server read:
Server Component/Route Handler → Application Query → Repository → Supabase
```

For browser reads, choose either a query Route Handler/Action or a narrowly defined, read-only RLS gateway. Do not let generic Supabase Services leak into Hooks.

## 2. Separate four concepts currently called Services

### Domain

Pure, dependency-free rules:

- RBAC and role hierarchy
- Plan/license entitlements
- Pricing quote calculation
- Coupon eligibility/discount calculation
- Invitation and subscription state transitions

These modules may depend on types/config only and should be unit-testable without React, Next.js, or Supabase.

### Application

Use cases that coordinate actor, policy, and repositories:

- `CreateOrder`
- `ConfirmProviderPayment`
- `CreateInvitation`
- `AcceptInvitation`
- `TransferWorkspaceOwnership`
- `UpdateTenantSettings`
- `ResolveDeveloperContext`

Actions and Route Handlers are thin adapters to these use cases.

### Infrastructure

- Typed Supabase repositories
- User/server/admin client adapters
- Email provider adapter
- Clock, ID/token generator, crypto adapter

Repositories return domain/application DTOs, not raw arbitrary joins.

### Presentation

- React components and Hooks
- Email templates
- Localized message mapping
- Toast/navigation behavior

## 3. Make authorization and privilege explicit

- Replace reusable Action-to-Action authorization with policies/use cases.
- Name and type clients by privilege.
- Disallow `createAdminClient` outside infrastructure composition/application modules.
- Every application use case accepts an actor/context and resource identifier.
- Database RLS remains a mandatory second boundary and is committed/tested.

## 4. Keep Hooks thin

A Hook should normally:

- Read params/context needed by UI.
- Call one query/mutation gateway.
- Own React Query keys and invalidation.
- Map typed result to loading/error/view state.

It should not calculate authoritative entitlements, choose database clients, query tables, or implement cross-feature workflows.

Split broad Hooks by use case:

- `usePublicSystems`
- `useOwnedSystems`
- `useSystemDetails`
- `useCreateSystem`
- `useTenantMembership`
- `useTenantMembers`
- `useTenantCapabilities`

## 5. Treat validation by purpose

- UI validation: optional fast feedback using shared public constraints.
- Action/transport validation: mandatory parsing of untrusted input.
- Domain validation: invariant rules in pure functions/value objects.
- Database validation: constraints/types/RLS/transactions.
- Response validation: generated DB types plus selective Zod parsing at external/complex boundaries.

This prevents “deduplication” from accidentally removing necessary defense-in-depth while avoiding separate business-rule implementations.

## 6. Eliminate cycles through import discipline

- No package-internal import from its own barrel.
- Barrels only for external consumers.
- Feature Hooks may depend on lower-level context/query primitives, not mutually composed feature facades.
- Add a cycle check and restricted-import lint rules to CI.

## 7. Enforce the rules mechanically

Recommended checks:

- ESLint `no-restricted-imports` or an architecture-boundary plugin.
- Client files cannot import `infrastructure`, admin, server, or repository modules.
- Hooks cannot import Supabase clients/repositories under the strict model.
- Actions/Route Handlers cannot contain `.from`, `.rpc`, or storage calls.
- Repositories cannot import React, Next navigation/cache, Actions, Hooks, or presentation.
- Domain cannot import application/infrastructure/presentation.
- `server-only` guards on application/infrastructure modules containing secrets or admin access.
- Dependency-cycle check in CI.

## 8. Suggested dependency direction

```text
presentation (React, email templates)
        ↓
transport adapters (Actions, Route Handlers)
        ↓
application use cases
        ↓
domain policies/types
        ↑
repository interfaces
        ↑
infrastructure adapters (Supabase, email provider)
```

Infrastructure implements interfaces needed by application/domain; domain never imports infrastructure.

---

# Prioritized Findings

## Critical

### A-01 — Privilege is implicit in generic Services

Services can operate with browser, cookie-user, or admin clients, and some create admin clients internally. This prevents reliable architectural/security reasoning.

**Recommendation:** typed and named privilege-specific repositories; server-only protection; client creation only at composition roots.

## High

### A-02 — Hooks systematically bypass Actions and call Services/Supabase

The query architecture contradicts the declared flow and relies on undocumented RLS.

**Recommendation:** adopt strict server query gateways or explicitly design/test a read-only RLS gateway.

### A-03 — Client Components directly access data Services

Confirmed in tenant logo settings and marketplace System details.

**Recommendation:** move behind Feature Hook and server application boundary.

### A-04 — Business policy is split across UI, Hooks, Actions, and Services

Entitlements, pricing, invitation rules, and ownership are duplicated and divergent.

**Recommendation:** pure domain policy modules and application use cases.

### A-05 — Two Hook dependency cycles

Barrel and mutual feature dependencies create fragile module initialization.

**Recommendation:** concrete internal imports; lower-level tenant context; CI cycle detection.

### A-06 — Email Service mixes infrastructure and presentation

One 284-line module handles provider, configuration, HTML, copy, URL, delivery, and logs.

**Recommendation:** template, transport, and use-case boundaries.

### A-07 — Database layer cannot fulfill its architectural responsibility visibly

No committed schema, generated types, RLS, or transactions exist in the repository.

**Recommendation:** version and test all database architecture.

## Medium

### A-08 — Action-to-Action dependencies

Reusable application logic is exposed as framework entry points.

**Recommendation:** extract `requireSystemOwner`, key verification, and developer context use cases.

### A-09 — Ownership transfer Action queries Supabase directly

**Recommendation:** repository/application transfer use case.

### A-10 — Server presentation files call low-level/admin Services

**Recommendation:** explicit server query use cases returning DTOs; allow this as a documented server-read path.

### A-11 — Hooks are broad multi-use-case facades

**Recommendation:** split queries/mutations by use case and isolate navigation/toast adapters.

### A-12 — Validation and authorization duplication is inconsistent

**Recommendation:** distinguish UI feedback from authoritative validation; centralize server policies without removing defense-in-depth.

### A-13 — Folder/naming rules are unclear

**Recommendation:** choose feature ownership, normalize suffix/casing/singular/plural conventions, and relocate non-Supabase infrastructure.

## Low

### A-14 — Barrels obscure dependencies even where they do not cycle

**Recommendation:** favor direct imports within features and use barrels only at public boundaries.

### A-15 — User-facing errors leak from Services

**Recommendation:** typed domain/application errors translated by UI/API adapters.

---

# Incremental Adoption Plan

## Phase 1 — Document and enforce the boundary

1. Approve the two-path rule for browser mutations and server reads.
2. Mark privileged modules `server-only`.
3. Add restricted-import and cycle checks.
4. Stop adding new direct Client/Hook-to-Supabase dependencies.
5. Commit database types/schema/RLS so browser-read safety can be evaluated.

## Phase 2 — Remove highest-risk violations

1. Move tenant-logo upload behind an authorized Action/use case.
2. Replace marketplace Client Page direct Service access with server query/DTO.
3. Extract payment, invitation, entitlement, and ownership policies/use cases.
4. Remove Action-to-Action calls.
5. Separate invitation template and email transport.

## Phase 3 — Normalize queries and Hooks

1. Split `useSystem` and other broad Hooks by use case.
2. Replace browser Service imports with query gateways or formally safe read repositories.
3. Consolidate query keys and membership state.
4. Break the two Hook cycles and prohibit internal barrel imports.

## Phase 4 — Clarify Service taxonomy

1. Rename thin Supabase Services as repositories.
2. Move workflows to application use cases.
3. Move pure rules to domain modules.
4. Move email/storage/provider mechanics to infrastructure adapters.
5. Normalize folder and filename conventions during touched-file changes rather than a disruptive bulk move.

---

# Architecture Scorecard

| Area | Score |
|---|---:|
| Layer separation | 4/10 |
| Dependency direction | 3/10 |
| Client isolation from persistence | 3/10 |
| Hook cohesion | 3/10 |
| Server Action boundary | 5/10 |
| Service cohesion | 4/10 |
| Domain-policy centralization | 3/10 |
| Authorization architecture | 4/10 |
| Validation architecture | 5/10 |
| Database boundary | 2/10 |
| Naming/folder consistency | 4/10 |
| Circular-dependency control | 3/10 |
| Architectural testability | 3/10 |
| Overall | **4/10** |

---

# Final Verdict

The repository has **an architectural convention, not an enforced architecture**. The intended five-step flow is visible in many mutations, but reads largely follow a different browser-Supabase pattern, server rendering uses direct Services, some Components bypass Hooks, Actions call Actions or query the database, and the Service folder mixes repositories, workflows, authorization, external infrastructure, and presentation.

It would be inaccurate to say the current architecture is already good. It is understandable and recoverable, but its boundaries are too ambiguous for a production multi-tenant platform. The main risk is not the number of layers; it is that authorization and privilege depend on which Supabase client a caller happens to pass, while business rules exist in multiple layers and already disagree.

The recommended improvement is **not** to wrap every read in ceremonial layers. Define a pragmatic command/query architecture, keep browser code away from generic persistence modules, make server privilege explicit, extract pure domain policy, make Actions/Route Handlers thin application adapters, and enforce dependency direction automatically. This can be done incrementally without rewriting the project.

No application code was modified during this audit. The only intended change is this report.
