# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

**Before writing any Next.js code, read the relevant guide in `node_modules/next/dist/docs/`.** This project pins a Next.js version whose APIs/conventions may differ from training data (App Router, `params`/`searchParams` as Promises, middleware, adapters, etc.) — verify against the local docs rather than assuming.

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — run production build
- `npm run lint` — ESLint (flat config, `eslint.config.mjs`)

No test runner is configured in this repo yet.

## Project overview

"Graphood" — a multi-tenant SaaS platform. Supabase (Postgres + Auth) is the backend, Next.js App Router is the frontend, next-intl provides `ar`/`en` i18n (Arabic is the default locale, RTL), shadcn/radix-ui + Tailwind v4 for UI, TanStack Query for server-state hydration, react-hook-form + zod for forms.

## Architecture

### Routing structure (App Router, all under `src/app/[locale]/`)

- `(auth)/login`, `(auth)/register` — public auth pages
- `(main)/` — shared layout with Navbar/Footer, wraps most of the app
  - `(main)/Onboarding`, `(main)/select-workspace`, `(main)/checkout` — pre-tenant flows (creating/joining/paying for a workspace)
  - `(main)/[tenant_slug]/` — tenant-scoped pages; `layout.tsx` resolves the tenant from the slug, verifies the user has a membership (prefetched via TanStack Query + `HydrationBoundary`), and redirects to `/Onboarding` if none exists
  - `(main)/settings/[tab]` — dynamic settings tabs
- Route-local UI lives in `_components/` folders next to the routes that use them; only cross-route UI belongs in `src/components/`.

Locale resolution and auth gating both happen in `src/middleware.ts`: it runs `next-intl`'s middleware first, then checks Supabase auth cookies to redirect unauthenticated users to `/login` and authenticated users away from `/login`/`/register`. Public paths (no auth required) are listed inline in the middleware — update that list when adding new public routes.

### Layout chain and data loading

`app/layout.tsx` (fonts only) → `app/[locale]/layout.tsx` (validates locale, loads i18n messages, fetches `user`/`profile`/`memberships` server-side, wraps children in `AppProvider`) → `(main)/layout.tsx` (Navbar/Footer) → `[tenant_slug]/layout.tsx` (membership check per tenant).

`AppProvider` (`src/shared/lib/providers/app-provider.tsx`) composes `QueryProvider` → `AuthProvider` → `MembershipProvider`. Client components read auth/membership state via `useAuth()` (`src/shared/lib/auth/auth-context.tsx`) and `useMembership()` (`src/shared/lib/rbac/membership-context.tsx`) rather than re-fetching.

### `src/shared/lib/` — the core domain layer

- `supabase/client.ts` / `supabase/server.ts` — browser vs. server Supabase client factories (server one is cookie-bound, async).
- `supabase/services/**/*.service.ts` — all DB access goes through named service functions grouped by domain (`auth/`, `tenants/`, `memberships/`, `billing/`, `systems/`). Add new DB operations here rather than calling Supabase directly from components/pages.
- `schemas/**` — zod schemas and inferred types (e.g. `memberships.schema.ts`, `profiles.schema.ts`); `schemas/public/` holds the permissions model (`permissions.ts` = the full permission list, `role-permissions.ts` = default permission sets per role). `schemas/index.ts` only re-exports the input (form) schemas — import other schemas directly from their file.
- `rbac/permissions.ts` — `getUserPermissions`/`hasPermission`/`hasAnyPermission`/`hasAllPermissions` combine a membership's role defaults with per-membership permission overrides. This is the real RBAC implementation.
- `server/get-session.ts` and `server/authorize.ts` are **stub/placeholder code** (hardcoded fake session, duplicated role→permission map) — not wired to Supabase auth. Don't extend them as-is; if session/authorization logic is needed, prefer the real `supabase/services/auth/*` + `rbac/permissions.ts` path, or flag that these stubs need replacing.
- `auth/hooks/` (`useLogin`, `useRegister`) and `rbac/hooks/` (`use-permission`, `use-system`, `use-memberships`) — client hooks over the services/context above.

### i18n

`src/i18n/routing.ts` defines locales; `src/i18n/request.ts` loads `src/i18n/messages/{locale}.json`; `src/i18n/navigation.ts` provides locale-aware `Link`/`router`. Add new UI strings to both `ar.json` and `en.json`. `public/data.ts` also exports a `locales` array used for route validation in layouts — keep it in sync with `i18n/routing.ts`.

### Path aliases

`@/*` → `src/*` (see `tsconfig.json`). shadcn aliases (`components.json`) point `@/components`, `@/lib`, `@/hooks` at `src/*` — new shadcn-generated UI goes to `src/components/ui`; app-specific components stay in `src/shared/lib` or route-local `_components/`.
