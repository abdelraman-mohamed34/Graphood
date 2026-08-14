import { System, SystemUpdate } from "@/shared/lib/schemas/systems.schema";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

export async function updateSystem(
    id: string,
    data: SystemUpdate,
): Promise<System> {

    const payload = {
        name: data.name,
        description: data.description,
        readme: data.readme,

        starter_price: data.starter_price,
        pro_price: data.pro_price,
        business_price: data.business_price,
        
        reseller_price: data.reseller_price,
        exclusive_price: data.exclusive_price,

        currency: data.currency,

        tags: data.tags,

        icon_url: data.icon_url,
        image_url: data.image_url,
        is_public: data.is_public,
        status: data.status,

        updated_at: new Date().toISOString(),
    };

    const supabase =
        await createSupabaseServerClient();

    const {
        data: record,
        error,
    } = await supabase
        .from("systems")
        .update(payload)
        .eq("id", id)
        .select("id, name, slug, description, readme, owner_id, currency, status, status_reason, icon_url, image_url, is_public, starter_price, pro_price, business_price, reseller_price, exclusive_price, tags, created_at, updated_at")
        .single();

    if (error) {

        throw error;
    }

    return record as System;
}

export async function submitPendingReadme(
    id: string,
    readme: string,
    submitterId: string,
): Promise<void> {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
        .from("systems")
        .update({
            pending_readme: readme,
            pending_readme_submitted_at: new Date().toISOString(),
            pending_readme_submitted_by: submitterId,
        })
        .eq("id", id);

    if (error) throw error;
}
