import { createAdminClient } from "../../admin";

export async function getTenantBySlug(
    slug: string
) {
    const supabase = await createAdminClient();

    const { data: tenant, error } = await supabase
        .from("tenants")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error) {
        if (error.code === "PGRST116") {
            return null;
        }

        throw error;
    }

    return tenant;
}