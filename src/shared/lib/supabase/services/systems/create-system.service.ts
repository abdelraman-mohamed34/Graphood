import {
    type CreateSystemInput,
    type System,
} from "@/shared/lib/schemas/systems.schema";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

export async function createSystem(
    data: CreateSystemInput,
    ownerId: string,
): Promise<System> {

    const supabase =
        await createSupabaseServerClient();

    const internalSlug = (() => {
        try {
            const host = new URL(data.base_launch_url || "").hostname.replace(/^www\./, "");
            return host.split(".")[0].replace(/[^a-z0-9-]/gi, "-").toLowerCase().slice(0, 50) || `system-${Date.now()}`;
        } catch {
            return `system-${Date.now()}`;
        }
    })();

    const {
        data: record,
        error,
    } = await supabase
        .from("systems")
        .insert({
            ...data,
            slug: internalSlug,
            owner_id: ownerId,
        })
        .select("id, name, slug, description, readme, owner_id, currency, status, status_reason, icon_url, image_url, base_launch_url, launch_type, launch_url_template, is_public, starter_price, pro_price, business_price, reseller_price, exclusive_price, tags, created_at, updated_at")
        .single();


    if (error) {


        throw error;
    }


    return record as System;
}
