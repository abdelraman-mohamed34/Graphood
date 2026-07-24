import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
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

        console.error("Error fetching tenant by slug:", error);
        throw error;
    }

    return tenant;
}