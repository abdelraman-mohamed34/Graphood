import { UpdateTenant } from "@/shared/lib/schemas/tenants.schema";
import { SupabaseClient } from "@supabase/supabase-js";

type UpdateTenantServiceProps = {
    supabase: SupabaseClient;
    tenantId: string;
    data: UpdateTenant;
};

export async function updateTenantService({
    supabase,
    tenantId,
    data,
}: UpdateTenantServiceProps) {
    const { data: tenant, error } = await supabase
        .from("tenants")
        .update(data)
        .eq("id", tenantId)
        .select("id, system_id, owner_id, subscription_id, name, slug, subdomain, status, logo_url, primary_color, email, phone, country, city, address, timezone, created_at, updated_at")
        .single();
    if (error) {
        console.error("Workspace update database error:", {
            tenantId,
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
        });
        throw error;
    }

    if (!tenant) {
        console.error("Workspace update database error: no row returned", { tenantId });
        throw new Error("Workspace update did not return a tenant.");
    }

    return tenant;
}
