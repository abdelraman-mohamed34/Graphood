import type { SupabaseClient } from "@supabase/supabase-js";

export type TenantProxyTargetResult =
  | { kind: "tenant-not-found" }
  | { kind: "tenant-inactive"; status: string | null }
  | { kind: "system-not-found"; tenantId: string }
  | { kind: "target-missing"; tenantId: string }
  | {
      kind: "ready";
      tenantId: string;
      slug: string;
      status: string;
      targetUrl: string;
    };

export async function getTenantProxyTargetBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<TenantProxyTargetResult> {
  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select("id, slug, status, system_id")
    .eq("slug", slug)
    .maybeSingle();

  if (tenantError) throw tenantError;
  if (!tenant) return { kind: "tenant-not-found" };
  if (tenant.status !== "ACTIVE") {
    return { kind: "tenant-inactive", status: tenant.status };
  }
  if (!tenant.system_id) {
    return { kind: "system-not-found", tenantId: tenant.id };
  }

  const { data: system, error: systemError } = await supabase
    .from("systems")
    .select("base_launch_url")
    .eq("id", tenant.system_id)
    .maybeSingle();

  if (systemError) throw systemError;
  if (!system) return { kind: "system-not-found", tenantId: tenant.id };
  if (!system.base_launch_url) {
    return { kind: "target-missing", tenantId: tenant.id };
  }

  return {
    kind: "ready",
    tenantId: tenant.id,
    slug: tenant.slug,
    status: tenant.status,
    targetUrl: system.base_launch_url,
  };
}
