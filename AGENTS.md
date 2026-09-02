# Graphood Agent Guide

## Project

Graphood is a Next.js 16 App Router, TypeScript, multi-tenant SaaS marketplace. Users own or join workspaces (`tenants`) associated with published `systems`; membership roles and permission overrides govern workspace access. The platform also includes subscriptions/orders, developer systems and API keys, platform-admin views, invitations, storage, email, and Kashier billing.

The repository uses the App Router and Next 16 conventions. Before changing Next-specific code, consult the relevant documentation under `node_modules/next/dist/docs/` (the installed package currently exposes `index.md` there rather than the older documentation layout).

## Non-negotiable Architecture

Preserve this application flow:

`Client -> Hook -> Action -> Service -> Supabase`

Before adding code, identify the owning layer, search for an existing implementation, and reuse its patterns. Do not bypass a layer or introduce a second data flow without documenting a genuine exception in the change.

### Layers

- **Client:** React components under `src/app`, `src/features`, `src/components`, and `src/shared/_components`. Client components render UI, collect form input, call hooks, and display translated toast/error states; they should not contain server secrets or privileged database writes.
- **Hooks:** Client hooks under `src/shared/lib/hooks` and feature hooks wrap TanStack Query queries/mutations. They select canonical keys from `src/shared/lib/query/query-keys.ts`, call read services through the browser Supabase client where established, call Server Actions for mutations, and invalidate/update related keys after success.
- **Actions:** Server Actions under `src/shared/lib/actions` are the server boundary for application mutations and protected operations. They parse Zod input, obtain the authenticated user (`requireUser`/`fetchUser`), check tenant membership and permissions where applicable, call a service, and return a small result object or throw/redirect according to the local action pattern. Use `revalidatePath` only where an existing action uses it; client cache invalidation remains common.
- **Services:** Supabase services under `src/shared/lib/supabase/services` contain database/business operations and typed DTO shaping. Services generally accept a typed `SupabaseClient`; some established services create their own server client. Keep queries, selected columns, relation normalization, and database errors here rather than in components.
- **Supabase:** `src/shared/lib/supabase/client.ts` creates the browser anon client; `server.ts` creates the cookie-aware server client; `admin.ts` is server-only and uses the service-role key. RLS is the normal authorization backstop. Admin access is restricted to server-only workflows that already authenticate/authorize or to trusted webhook/cron processing.

The direct browser-hook-to-read-service pattern (for example `useUser`, `useSystems`, and membership/profile queries) is an existing read exception. Mutating UI behavior should continue through actions.

## Repository Layout

- `src/app/[locale]`: localized App Router routes. Route groups divide `(auth)`, `(main)`, `(home)`, `(dashboard)`, tenant dashboards, developer systems/docs, and platform admin pages.
- `src/app/api`: route handlers for developer API endpoints, systems API, cron subscription processing, and the Kashier webhook. `src/proxy.ts` is the request proxy/middleware entry point.
- `src/shared/lib/actions`: domain Server Actions (auth, billing, coupons, developer, invitations, memberships, profile, tenants, platform staff, and admin).
- `src/shared/lib/hooks`: client query/mutation hooks, grouped by domain. `index.ts` files are used as local barrels; preserve nearby import/export style.
- `src/shared/lib/supabase/services`: domain services grouped by database concern (`auth`, `memberships`, `tenants`, `systems`, `billing`, `order`, `storage`, etc.).
- `src/shared/lib/schemas`: Zod domain, public, and input schemas. `src/shared/types/database.types.ts` is the generated typed Supabase schema; do not hand-edit it.
- `src/shared/lib/query`: query client defaults and canonical query/mutation keys.
- `src/shared/lib/auth`: auth context plus `requireUser`, `requireMembership`, permission checks, subscription capabilities, and tenant-limit guards.
- `src/components/ui`: reusable UI primitives; `src/features`: feature-specific UI/hooks; `public`: static assets and locale data; `scripts`: ad-hoc verification scripts.
- `supabase`: CLI config, seed data, and migrations. The first migration is intentionally a no-op baseline marker because the production schema already exists in Supabase; later migrations contain incremental database hardening/functions.

Use the `@/*` alias (mapped to `src/*`) for application imports. Keep domain code in its existing domain directory and use kebab-case filenames for new files unless the surrounding area clearly uses another established name.

## Authentication, Authorization, and Boundaries

`src/proxy.ts` performs locale routing, refreshes/reads the Supabase auth cookie session, redirects unauthenticated users away from non-public paths, redirects authenticated users away from login/register, honors a profile preferred locale, and applies developer API CORS handling. OAuth/password callback routes establish the session and synchronize `profiles`.

Server code should use `requireUser(locale)` for a redirecting authenticated boundary, or `fetchUser` when an action/route needs a nullable result. Tenant routes use `requireMembership` by tenant slug and then `hasPermission`/`usePermission`; `rolePermissions` defines `SUPER_ADMIN`, `SUPPORT_AGENT`, `OWNER`, `ADMIN`, `STAFF`, and `MEMBER` capabilities, with membership permission arrays acting as additive overrides. Subscription status and plan/feature limits are centralized in `requireSubscription` and `checkTenantLimit`.

Tenant layouts must verify membership and `dashboard.read` before rendering protected workspace UI. Never trust a tenant slug, system ID, role, or client-provided permission: validate identifiers, resolve membership server-side, and let Supabase RLS enforce row ownership/membership as well.

## Data, Validation, and Errors

Use the generated `Database` type with Supabase clients and select only fields needed by the caller. Normalize relation results before validating DTOs (see membership services). Validate action/route input with the nearest Zod schema; use `safeParse` for expected user errors and `parse` when the established action treats malformed input as exceptional. Keep secrets and sensitive API-key fields server-only.

Actions commonly return `{ success: false, ... }` for validation/authorization/business failures; hooks translate these results into localized `sonner` toasts and invalidate or optimistically update canonical keys on success. Services throw database errors after logging useful, non-secret context. Do not expose service-role keys, webhook secrets, encrypted API keys, or raw provider credentials to client DTOs.

## Supabase, Billing, and API Security

The checked-in typed schema describes public tables including profiles, systems, tenants, memberships, invitations, subscriptions, orders, payments, developer API keys, coupons, tags, and audit logs. The production schema/RLS lives in the linked Supabase project rather than the no-op baseline migration. Do not infer that the baseline can recreate production tables, and do not create migrations/RLS changes unless explicitly requested.

Storage operations belong in `src/shared/lib/supabase/services/storage` and their actions. Storage buckets/policies are database-managed; use the existing service/action path for avatar, tenant-logo, and system-image uploads.

Developer API handlers under `/api/developer` use `withDeveloperContext`: require `Authorization: Bearer`, resolve and verify the hashed API key, require a tenant slug, ensure the tenant belongs to the key's system, enforce an active subscription/API entitlement, and return the standard developer JSON/error format. The sandbox header/key path is an intentional documented exception. Keep CORS behavior in `src/proxy.ts` and route guards centralized.

Kashier webhook processing is a trusted Node runtime path. It validates payloads, verifies the provider session/signature, uses the service-role client, records idempotent webhook events, calls atomic SQL RPCs for payment state and order provisioning, and handles duplicate/retry recovery. Subscription cron is protected by `Authorization: Bearer ${CRON_SECRET}` and uses the admin client to warn, mark `PAST_DUE`, and expire subscriptions. Preserve idempotency, amount/currency checks, row locks, and RPC grants when touching billing.

## Routing, i18n, and UI State

Locales are exactly `ar` and `en`, default `en`, configured in `src/i18n/routing.ts` and `src/i18n/request.ts`. Use `src/i18n/navigation.ts` helpers for locale-aware links, redirects, and routers. Messages live in `src/i18n/messages/{ar,en}.json`; add user-facing copy to both locales. The root/locale layouts set `lang`, `dir` (`rtl` for Arabic), locale fonts, `NextIntlClientProvider`, providers, and the toaster.

Use server components for route/layout data and auth checks. Add `"use client"` only for interactive components/hooks. Tenant layouts prefetch membership lists into a dehydrated TanStack Query boundary; use the same key in the client hook. Query defaults are `staleTime: 5m`, `gcTime: 30m`, no focus refetch, one query retry, and no mutation retries. Always use `queryKeys`/`mutationKeys` factories and invalidate the narrowest affected domain keys.

Forms use React Hook Form and Zod resolvers where present. Keep loading, empty, unauthorized, and failure states explicit and translate all visible messages. Preserve the existing Tailwind/shadcn component conventions and route-local `_components` organization.

## Workflows to Follow

- **Profile update:** settings client -> `useProfile` mutation -> `updateProfileAction` validates and calls `requireUser` -> profile service updates `profiles` with the server client -> hook invalidates `profiles.currentWithAvatar`.
- **Workspace settings:** tenant settings client -> `useTenant` -> `updateTenantAction` validates locale/slug and input, requires user + membership + `tenant.manage`, then uses the authorized admin write service -> hook invalidates the tenant key or replaces the URL when the slug changes.
- **Tenant dashboard read:** tenant layout -> `requireUser` -> `requireMembership` -> `dashboard.read` check -> service prefetch into the canonical key -> `HydrationBoundary` -> client hooks read hydrated state.
- **Marketplace purchase:** checkout client/action -> Zod order validation and authenticated user -> public/active system and existing-order checks -> coupon service if supplied -> pending-order service -> payment initiation; Kashier callback/webhook later verifies and atomically processes/provisions subscription, tenant, and owner membership.
- **Developer API request:** route handler -> `withDeveloperContext` -> API-key/context action and subscription/API guard -> scoped service/admin read -> standard JSON response. Unknown catch-all developer paths return a typed 404.

## Commands and Verification

Available package scripts are `npm run dev`, `npm run build`, `npm start`, and `npm run lint`. The normal static checks are:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

There is no configured unit-test runner in `package.json`. `scripts/test-kashier-webhook.js` and `req_test/api-test.http` are targeted/manual checks. Do not claim tests passed unless you actually ran the relevant command. Do not run migrations or deploy Supabase changes as part of ordinary code work.

## Safe Task Workflow

1. Read this guide and any nearer `AGENTS.md`; inspect the route, hook, action, service, schema, and query key involved.
2. Trace an existing neighboring workflow before introducing an abstraction.
3. Keep server/client boundaries and `Client -> Hook -> Action -> Service -> Supabase` intact.
4. Validate inputs and authorization at the server boundary; rely on RLS rather than client checks alone.
5. Update both locale messages and the relevant query cache behavior for user-facing changes.
6. Run proportionate typecheck/lint/build or the targeted script, then inspect `git diff` and `git status`.

## Maintaining This File

Update this file only when a change introduces a durable architectural rule, project-wide convention, security/performance constraint, dependency/workflow requirement, or domain convention future agents must know. Do not turn it into a changelog, feature list, speculative design document, or copy of the README. Verify every path, command, and architectural claim against 
the current repository before changing it. Keep the core flow documented as `Client -> Hook -> Action -> Service -> Supabase`.

## Active Skills Guardrails

- **Database & Supabase (Postgres Best Practices):**
  - Always enforce explicit `tenant_id` scopes in multi-tenant contexts to satisfy RLS and isolate workspaces.
  - Rely on parameterized queries and Zod boundary validation; avoid raw string concatenation.

- **Security & Threat Model (Security Best Practices):**
  - Treat all input at the Action boundary as untrusted. Keep API secrets, webhooks keys, and service roles server-only.
  - Verify webhook signatures (e.g., Kashier) and enforce idempotency checks on external integration endpoints.

- **UI/UX & Accessibility (Web Quality & Accessibility):**
  - Maintain full RTL layout compliance (Arabic dynamic font, `start`/`end` logical properties).
  - Provide explicit dynamic loading indicators, keyboard-navigable controls, and localized `sonner` toast updates.