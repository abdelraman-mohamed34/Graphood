alter table public.platform_staff
  add column if not exists audit_logs_last_viewed_at timestamp with time zone;

update public.platform_staff
set audit_logs_last_viewed_at = now()
where audit_logs_last_viewed_at is null;

alter table public.platform_staff
  alter column audit_logs_last_viewed_at set default now(),
  alter column audit_logs_last_viewed_at set not null;

create index if not exists audit_logs_created_at_idx
  on public.audit_logs (created_at desc);
