# CLAUDE.md

Guidance for AI coding agents working on the Graphood repository.

## Required Next.js guidance

Before writing or changing Next.js code, read the relevant guide in `node_modules/next/dist/docs/`. This project uses the pinned Next.js version in `package.json`; verify current App Router APIs locally instead of relying on assumed conventions.

## Commands

- `npm run dev` — start development
- `npm run build` — create the production build
- `npm run start` — serve the production build
- `npm run lint` — run ESLint
- `npx tsc --noEmit` — run strict TypeScript verification

No automated test runner is currently configured.

## Project architecture

Graphood is a multi-tenant SaaS platform built with Next.js App Router, Supabase, `next-intl`, Tailwind CSS, Radix/shadcn UI, TanStack Query, React Hook Form, and Zod.

- Localized routes live under `src/app/[locale]/`.
- Public/auth/marketplace pages live in route groups under `src/app/[locale]/(main)` and `src/app/[locale]/(auth)`.
- Tenant dashboard routes live under `src/app/[locale]/(dashboard)/(tenant)/[tenant_slug]`.
- Developer system routes live under `src/app/[locale]/(dashboard)/(system)/developer`.
- Route-local components belong in `_components`; reusable primitives belong in `src/components/ui`.
- Domain hooks, actions, schemas, providers, and Supabase services belong under `src/shared/lib`; feature-specific client logic belongs under `src/features`.

## Data and security boundaries

- Browser Supabase access uses `src/shared/lib/supabase/client.ts`.
- Cookie-bound server access uses `src/shared/lib/supabase/server.ts`.
- The service-role client in `src/shared/lib/supabase/admin.ts` is server-only and bypasses RLS. Use it only after explicit authentication/authorization in a server action or route handler.
- Database access belongs in `src/shared/lib/supabase/services/`; components should not issue direct Supabase queries.
- Server Actions are independently callable endpoints. Every action must validate inputs with Zod and repeat authentication, tenant membership, ownership, and permission checks at its own boundary.
- Return minimal DTOs. Never return service-role keys, webhook secrets, API-key hashes, encrypted API keys, or unrelated database metadata to client components.
- RLS policies are defined in `supabase/migrations/20260805010000_production_rls.sql` and must be applied and tested in the target Supabase project before production deployment.

## TanStack Query conventions

- Use the typed hierarchical key factory in `src/shared/lib/query/query-keys.ts`; do not introduce inline array keys.
- Use `createQueryClient()` from `src/shared/lib/query/query-client.ts` for providers and server hydration.
- Keep server-prefetch keys identical to client hook keys.
- Invalidate the narrowest relevant factory prefix after mutations. Use optimistic updates only when the cached shape and rollback behavior are explicit.
- Shared default policy is five-minute `staleTime`, thirty-minute `gcTime`, one retry, and no window-focus refetch. Long-lived reference data may use the `longLived` policy.

## Forms, schemas, and localization

- Define or reuse Zod schemas for all client payloads, URL IDs, locale/tenant context, files, and API inputs.
- Keep inferred TypeScript types close to their schemas.
- Add user-facing strings to both `src/i18n/messages/en.json` and `src/i18n/messages/ar.json`.
- Preserve locale-aware links/navigation from `src/i18n/navigation.ts` and RTL/LTR behavior.

## Production gates

Before handing off a change, run `npx tsc --noEmit` and `npm run lint`. For release work, also run `npm run build`. Payment-provider webhooks must be signature/secret verified and idempotent; Stripe remains disabled until its signed-event implementation is complete.
