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
        .select()
        .single();


    if (error) {
        throw error;
    }

    return tenant;
}