-- Public storefront lookup fields and access policy.
alter table public.tenants
  add column if not exists custom_domain text;

create unique index if not exists tenants_slug_idx on public.tenants (slug);
create index if not exists tenants_custom_domain_idx on public.tenants (custom_domain)
  where custom_domain is not null;

alter table public.tenants enable row level security;

drop policy if exists "Public can read active tenant storefronts" on public.tenants;
create policy "Public can read active tenant storefronts"
  on public.tenants
  for select
  to anon, authenticated
  using (status = 'ACTIVE');
