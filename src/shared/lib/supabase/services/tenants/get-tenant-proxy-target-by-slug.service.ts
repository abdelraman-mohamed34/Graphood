import type { SupabaseClient } from "@supabase/supabase-js";

export async function getTenantProxyTargetBySlug(
  supabase: SupabaseClient,
  slug: string,
) {
  const { data, error } = await supabase
    .from("tenants")
    .select("id, slug, status, systems!inner(base_launch_url)")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;

  const systems = data?.systems;
  const system = Array.isArray(systems) ? systems[0] : systems;

  return data
    ? { id: data.id, slug: data.slug, status: data.status, targetUrl: system?.base_launch_url ?? null }
    : null;
}
