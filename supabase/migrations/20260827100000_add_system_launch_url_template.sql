alter table public.systems
  add column if not exists launch_url_template text;

comment on column public.systems.launch_url_template is
  'External workspace launch URL. Use {tenantSlug} as the dynamic workspace slug placeholder.';
