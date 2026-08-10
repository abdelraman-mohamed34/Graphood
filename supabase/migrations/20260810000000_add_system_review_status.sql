alter type public.global_status add value if not exists 'REJECTED';

alter table public.systems
  add column if not exists status_reason text;

alter table public.systems
  drop constraint if exists systems_status_reason_length;

alter table public.systems
  add constraint systems_status_reason_length
  check (status_reason is null or char_length(status_reason) <= 500);
