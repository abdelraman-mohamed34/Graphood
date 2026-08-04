import { System, SystemUpdate } from "@/shared/lib/schemas/systems.schema";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

export async function updateSystem(
    id: string,
    data: SystemUpdate,
): Promise<System> {

    const payload = {
        name: data.name,
        description: data.description,

        starter_price: data.starter_price,
        pro_price: data.pro_price,
        business_price: data.business_price,
        
        reseller_price: data.reseller_price,
        exclusive_price: data.exclusive_price,

        currency: data.currency,

        tags: data.tags,

        icon_url: data.icon_url,
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
        .select()
        .single();

    if (error) {
        console.error(
            "Error updating system:",
            error
        );

        throw error;
    }

    return record as System;
}
