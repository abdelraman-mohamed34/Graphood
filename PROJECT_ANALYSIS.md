# Project Analysis — "Graphood"

Written for any AI model or engineer picking up this repo cold. It covers what the product is, how it's built, what's solid, what's broken or missing, and what to prioritize to make this competitive with top-tier SaaS platforms. Claims below are grounded in the actual code (paths given) as of 2026-07-07, not assumptions — verify against current code before acting, since this file will go stale as the repo changes.

---

## 1. What this project is

A **multi-system, multi-tenant SaaS platform** (product name "Graphood", per `src/app/layout.tsx` metadata). The domain model (documented in `dumb.txt` — misnamed, see §5):

```
Profile (auth user)
 ├── owns → System        (a sellable SaaS product definition: pricing, billing type)
 ├── owns → Tenant         (an isolated workspace instance of a System)
 └── joins → Membership    (role + permission overrides, scoped to one Tenant)

System  1---N  Tenant  1---N  Membership  N---1  Profile
```

- **System** = the product being sold (e.g. "a CRM", "a booking tool") with its own pricing/billing type (FREE / ONE_TIME / SUBSCRIPTION).
- **Tenant** = one customer's isolated workspace under a System, addressed by a unique slug.
- **Membership** = a Profile's access inside a Tenant: role (`OWNER|ADMIN|STAFF|MEMBER`) plus an array of extra/overridden permissions.
- Billing chain: `Order` → `Payment` (provider: STRIPE/PAYMOB/CASH/MANUAL) → (planned) `Subscription`.
- Planned but not yet implemented: Invitations (schema exists, no service/UI), audit logs, feature flags per tenant.

This is essentially a **workspace-per-tenant SaaS shell** (comparable in shape to Vercel/Linear/Notion-style multi-workspace products), currently in early scaffolding: auth, onboarding, and billing plumbing exist; the actual tenant-facing product (`[tenant_slug]/dashboard` etc.) does **not exist yet** — `[tenant_slug]/` contains only a `layout.tsx` that gatekeeps membership, no pages.

## 2. Stack

- **Next.js 16** (App Router, canary-track — see `AGENTS.md`/`CLAUDE.md`: APIs here can diverge from training data, e.g. `params`/`searchParams` as Promises everywhere). React 19, TypeScript strict mode.
- **Supabase** (Postgres + Auth) via `@supabase/ssr`, split into browser (`shared/lib/supabase/client.ts`) and server/cookie-bound (`shared/lib/supabase/server.ts`) clients.
- **next-intl** for i18n: locales `ar` (default, RTL) and `en`.
- **Tailwind v4** (CSS-first `@theme inline` config) + shadcn/ui (`style: "radix-nova"`, neutral base) + radix-ui primitives + `lucide-react` icons.
- **TanStack Query** for client cache + SSR hydration (`dehydrate`/`HydrationBoundary` pattern in `[tenant_slug]/layout.tsx`).
- **react-hook-form + zod** for forms/validation; zod schemas double as the domain type layer (`src/shared/lib/schemas/*`).
- **motion** (Framer Motion successor) and **three / @react-three/fiber** for a 3D hero (`(main)/_components/hero/Cube.tsx`).
- **sonner** for toasts.

## 3. Structure

```
src/app/[locale]/
  (auth)/login, register              — public auth pages
  (main)/                             — shared Navbar/Footer shell
    onboarding, select-workspace, checkout   — pre-tenant flows
    settings/[tab]                    — dynamic settings tabs
    [tenant_slug]/                    — tenant-scoped app (membership-gated, currently empty shell)
  layout.tsx                          — locale validation, i18n messages, fetches user/profile/memberships, wraps in AppProvider

src/shared/lib/
  supabase/{client,server}.ts         — Supabase client factories
  supabase/services/**/*.service.ts   — all DB access, grouped by domain (auth, tenants, memberships, billing, systems)
  schemas/**                          — zod schemas + inferred types; schemas/public/ holds the permission model
  rbac/                               — permissions.ts (real RBAC logic), membership-context.tsx, hooks
  auth/                               — auth-context.tsx, login/register hooks
  providers/                         — AppProvider composes QueryProvider → AuthProvider → MembershipProvider

src/components/ui/    — shadcn primitives (only button, input, label so far)
src/i18n/             — routing.ts, request.ts, navigation.ts, messages/{ar,en}.json
src/middleware.ts     — next-intl routing + Supabase-cookie auth gating, in one pass
```

Route-local UI lives in `_components/` next to the routes; only cross-route UI belongs in `src/components/`. This is a clean, fairly conventional feature-sliced layout for a Next.js SaaS and easy to navigate.

## 4. What's genuinely good

- **Domain model is sound.** System → Tenant → Membership with per-tenant RBAC and permission overrides is a proven shape for multi-tenant SaaS, not over- or under-engineered.
- **RBAC implementation is correct where it's real**: `shared/lib/rbac/permissions.ts` (`getUserPermissions`/`hasPermission`/`hasAnyPermission`/`hasAllPermissions`) merges role defaults (`schemas/public/role-permissions.ts`) with per-membership overrides cleanly — a single source of truth, used consistently by real code.
- **i18n done properly**: locale-first routing, `dir="rtl"` switch based on locale, messages split by locale, locale-aware `Link`/`router` via `src/i18n/navigation.ts`.
- **Zod schemas are thorough** — real constraints (slug regex, uuid validation, min lengths, enums), and types are inferred from schemas rather than hand-duplicated.
- **SSR hydration pattern is correct**: `[tenant_slug]/layout.tsx` prefetches with TanStack Query and hands off via `HydrationBoundary` — the right pattern for server-fetched, client-cached tenant data.
- **Middleware combines i18n + auth in one pass** without excessive overhead — a reasonable, idiomatic approach for this Next.js version.

## 5. Bad / broken — concrete issues found in code

**Authorization has two competing, inconsistent implementations.**
`src/shared/lib/server/get-session.ts` is explicitly labeled `/** Fake example - replace with real JWT/session logic */` and returns a hardcoded demo session reading a `token` cookie that nothing else in the app sets. `src/shared/lib/server/authorize.ts` duplicates its *own* hardcoded role→permission map (`{ADMIN: [...], OWNER: ["*"], MEMBER: [...]}`, missing `STAFF` entirely) instead of using the real one in `schemas/public/role-permissions.ts`. Meanwhile the actual, working auth is Supabase-cookie-based (`middleware.ts`, `supabase/server.ts`). **If anyone wires a real feature to `authorize()`/`getSession()` believing it's live, it will silently no-op against fake data.** Either delete these stubs or rebuild them on top of the real Supabase session + `rbac/permissions.ts`.

**No database schema in version control.** There's no `supabase/migrations` (or any `supabase/` directory) in the repo — the entire DB schema exists only in the live Supabase project and in a prose description (`dumb.txt`). No `database.types.ts` is generated, so every `.from("memberships")`/`.from("tenants")` call is an untyped string — a typo'd column or table name fails silently at runtime, not at compile time, despite the project otherwise investing heavily in zod types. This is the single biggest structural gap for a Supabase-based product.

**No payment webhooks / API routes at all** (`src/app/api` doesn't exist). `create-order.service.ts` and `confirm-payment.service.ts` exist as plain functions, but nothing calls `confirmOrderPayment` automatically — a real Stripe/Paymob integration needs a signature-verified webhook route updating order/payment status server-to-server, not a function waiting to be invoked by client code.

**Silent failure paths:**
- `[locale]/layout.tsx:56-63` — profile/membership fetch errors are swallowed with `catch { console.log('failed') }`; the user gets a broken UI with zero indication anything went wrong.
- `[tenant_slug]/layout.tsx` — `queryClient.prefetchQuery` catches its own errors internally; if `getMembershipBySlug` throws, `getQueryData` just returns `undefined` and the user is silently redirected to onboarding with no error surfaced. Also: `[locale]/layout.tsx` already fetches **all** memberships for the user; this layout does a **second** DB round-trip to fetch by slug instead of filtering the already-fetched list — redundant query on every tenant page load.

**Type safety holes despite the zod investment:** `any` shows up repeatedly — `onError: (error: any)` (`useLogin.ts`, `useRegister.ts`), `memberships.map((membership: any) => ...)` (`onboarding/page.tsx`), `AuthProvider user={profile as any}` (`app-provider.tsx`). Combined with the untyped Supabase client above, the type system has real gaps at exactly the boundaries (auth, tenant data) that matter most.

**i18n is broken at the service layer.** UI strings go through `next-intl` correctly, but thrown errors from services are hardcoded Arabic literals — e.g. `create-tenant.service.ts:27`: `throw new Error("هذا الرابط محجوز مسبقاً، اختر رابطاً آخر.")`. An English-locale user hitting this gets an Arabic toast. Services should throw error codes; translation belongs at the UI boundary.

**Dead/stub code left in place:**
- `useLogin.ts`: `signInWithProvider` is `console.log(...)` only — no real OAuth, despite a `GoogleBtn` component existing in the login UI.
- `onboarding/page.tsx:10`: stray `console.log(memberships)`.
- `.grain-bg`/`.noise-overlay` in `globals.css` are unused anywhere in `src/` (confirmed via search) and `.grain-bg` pulls an image from `transparenttextures.com` — dead CSS with an external dependency if it were ever wired up.

**Repo hygiene:**
- `repomix-output.xml` (a full-repo text dump) and `dumb.txt` (actually the core architecture doc, badly named) are sitting untracked at repo root — the dump shouldn't be committed at all; the doc should move to `docs/architecture.md`.
- `design/` holds raw marketing assets (png/mp4/webp) directly in the repo root rather than under `public/` or an external asset store.
- No `.env.example` — `.env.local` is gitignored (correct) but there's no reference listing which env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, future Stripe/Paymob keys) a new environment needs.

**No safety net at all:** no test runner configured, no CI (no `.github/workflows`), no pre-commit hooks, no Prettier/formatting config — and it shows: indentation is inconsistent file-to-file (4-space in `rbac/permissions.ts`, 2-space in `membership-context.tsx`, etc.).

**Design system is still the shadcn default.** Every color token in `globals.css` has **chroma 0** (pure grayscale oklch values) except `destructive` — this is the unmodified shadcn neutral starter theme, not a designed brand. Only 3 shadcn primitives are generated (`button`, `input`, `label`) despite a form-heavy app (login, register, checkout, settings) — forms are likely hand-rolling markup shadcn already solves (`Form`, `Select`, `Card`, `Dialog`, `Sheet`, `Table`).

## 6. Is the "Next schema" (routing/data architecture) good?

**Routing architecture (App Router structure): good foundation, incomplete product.** Locale-first routing, route groups separating public/auth/tenant concerns, a dedicated membership-gated tenant segment, colocated `_components/` — this is a legitimate, idiomatic multi-tenant Next.js layout, on par with how real multi-tenant SaaS templates are structured. The gap isn't the architecture, it's that the tenant workspace itself (the actual product surface under `[tenant_slug]`) hasn't been built yet, and there are no `loading.tsx`/`error.tsx` route-segment conventions in use anywhere, which this Next.js version supports well and a data-heavy, server-fetching app like this should lean on.

**Data schema (zod/relational model): good shape, missing guardrails.** Profile→System→Tenant→Membership plus Order/Payment/Subscription is a standard, defensible multi-tenant SaaS model — comparable to what Vercel/Linear-style products use. What's missing isn't the shape, it's the guardrails around it: no versioned migrations, no generated types, no invitations flow wired up despite the schema existing, no audit trail, no defined state-transition rules for subscription/tenant status changes.

## 7. Priority list to compete with top-tier SaaS

Ordered roughly by leverage (biggest risk/payoff first):

1. **Version-control the database.** Adopt the Supabase CLI, commit `supabase/migrations/`, run `supabase gen types typescript` into a `database.types.ts`, and type every Supabase client as `SupabaseClient<Database>`. This alone closes the biggest correctness gap in the repo.
2. **Kill or rebuild the fake auth stubs.** Delete `get-session.ts`/`authorize.ts` as-is, or rebuild them on the real Supabase session + `rbac/permissions.ts` so there is exactly one authorization code path.
3. **Wire real payment webhooks.** Add `src/app/api/webhooks/{stripe,paymob}/route.ts` with signature verification and idempotency; never trust client-triggered "confirm payment" calls for money movement.
4. **Add automated testing + CI.** Vitest for schemas/RBAC logic, Playwright for auth → onboarding → tenant-access flows; GitHub Actions running lint + typecheck + test + build on every PR. Right now nothing stops a regression from shipping.
5. **Fix i18n at the service boundary.** Services should throw error codes, not hardcoded human-language strings; translate only at the UI layer. Audit every `throw new Error("...")` in `services/`.
6. **Close the type-safety gaps.** Turn on `@typescript-eslint/no-explicit-any` as an error; fix the handful of existing `any` usages now while the list is still short.
7. **Invest in the design system.** Define an actual brand palette (real hue/chroma, checked for contrast in both themes) instead of the stock shadcn neutral grayscale; generate the missing shadcn primitives (`form`, `select`, `card`, `dialog`, `sheet`, `table`) before more forms get hand-rolled ad hoc.
8. **Add observability.** Error tracking (Sentry or equivalent) and structured logging at minimum — right now failures are caught and either swallowed or `console.log`'d, which is invisible in production.
9. **Repo hygiene pass.** Remove `repomix-output.xml`, move `dumb.txt` → `docs/architecture.md`, relocate `design/` assets, add `.env.example`, add Prettier + a pre-commit hook (husky + lint-staged) and run a one-time reformat.
10. **Build the actual product.** Everything above is scaffolding; `[tenant_slug]/` has no pages yet. Prioritize shipping the first real tenant-facing feature once the above guardrails (especially #1–#4) are in place, so it's built on solid ground instead of adding to the same gaps.

---
*This document reflects a point-in-time read of the codebase. Re-verify specifics (file paths, whether a given stub still exists) before relying on this for planning — code moves faster than docs.*