import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

interface CreateTenantParams {
    userId: string;
    systemId: string;
    name: string;
    slug: string;
    email: string;
}

export async function createTenant({
    userId,
    systemId,
    name,
    slug,
    email
}: CreateTenantParams) {
    const supabase = await createSupabaseServerClient();

    const { data: existingTenant } = await supabase
        .from("tenants")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

    if (existingTenant) {
        throw new Error("هذا الرابط محجوز مسبقاً، اختر رابطاً آخر.");
    }

    const { data: newTenant, error: tenantError } = await supabase
        .from("tenants")
        .insert([
            {
                name,
                slug,
                system_id: systemId,
                owner_id: userId,
                email: email,
                status: "ACTIVE",
                timezone: "Africa/Cairo"
            }
        ])
        .select()
        .single();

    if (tenantError) {
        console.error("Error creating tenant after payment:", tenantError);
        throw tenantError;
    }

    return newTenant;
}