alter table public.payments
    add column if not exists provider_integration_id integer;

create index if not exists payments_provider_integration_reference_idx
    on public.payments (provider, provider_integration_id, provider_reference);
