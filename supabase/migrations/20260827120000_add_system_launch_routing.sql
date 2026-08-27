alter table public.systems
  add column if not exists base_launch_url text,
  add column if not exists launch_type text not null default 'QUERY_PARAM';

alter table public.systems drop constraint if exists systems_launch_type_check;
alter table public.systems add constraint systems_launch_type_check check (launch_type in ('QUERY_PARAM', 'SUBDOMAIN'));

update public.systems
set base_launch_url = launch_url_template
where base_launch_url is null and launch_url_template is not null;
