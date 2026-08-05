# Graphood Platform Overview

Graphood is a multi-system, multi-tenant SaaS platform. A user owns or joins one or more workspaces, each workspace belongs to a published SaaS system, and membership roles and permissions determine what the user may do inside that workspace.

## Architecture

- **Next.js App Router**: route segments under `src/app/[locale]` provide localized public, authentication, marketplace, dashboard, and developer experiences. Route handlers under `src/app/api` expose the developer API and payment webhooks.
- **Feature-Sliced organization**: reusable domain hooks and server actions live under `src/shared`; product-specific client behavior lives under `src/features`; route composition remains in `src/app`; primitive UI components are in `src/components/ui`.
- **Server boundary**: Supabase services centralize data access, Server Actions validate input and authorize the caller, and API routes use dedicated API-key/webhook guards. Admin Supabase clients are server-only.
- **Client data**: TanStack Query uses the typed factory in `src/shared/lib/query/query-keys.ts` and shared cache defaults from `query-client.ts`. Server-prefetched data uses the same keys as client hooks.

## Core domain

`profiles` represent authenticated users. A `system` is a SaaS product definition owned by a profile. A `tenant` is an isolated workspace belonging to a system. `memberships` connect profiles to tenants and carry a role (`OWNER`, `ADMIN`, `STAFF`, or `MEMBER`) plus permission overrides. Invitations create new memberships after the recipient authenticates and accepts the link.

## Platform modules

- **Workspaces**: tenant settings, branding, members, invitations, ownership transfer, role/permission checks, usage limits, and subscriptions.
- **Marketplace**: public system discovery, tags, checkout, license types, coupons, orders, and subscription provisioning.
- **Developer Systems**: system creation and management, encrypted API-key generation, one-time key display, and the authenticated developer API (`/api/developer/v1`).
- **Billing**: orders, payments, coupon application, subscription and tenant provisioning. Paymob uses a secret-verified webhook; Stripe remains explicitly disabled until signature verification and provider handling are implemented.
- **Internationalization**: `next-intl` provides Arabic and English routing/messages, with locale-aware navigation and RTL/LTR layout behavior.

## Database security

Supabase is the source of truth for authorization. The production RLS migration enables row-level security across profiles, systems, tenants, memberships, invitations, subscriptions, orders, payments, API keys, coupons, coupon usage, tags, and storage objects. Policies enforce authenticated ownership or active tenant membership; privileged service-role calls are limited to server-side workflows that authenticate and authorize before bypassing RLS.

Sensitive fields such as service-role keys, API-key hashes, encrypted API keys, provider credentials, and webhook secrets are server-only environment variables or server-only query results. Client DTOs return only the fields required by the UI.

## Development and verification

Run:

```bash
npx tsc --noEmit
npm run lint
```

The project is intended to deploy only after the production Supabase migrations have been applied and all configured payment providers have verified webhook handling.
