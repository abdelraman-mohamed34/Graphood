alter table public.subscriptions
  add column if not exists last_expiry_warning_at timestamptz null;

create index if not exists subscriptions_expiry_warning_lookup_idx
  on public.subscriptions (status, end_date)
  where end_date is not null;
