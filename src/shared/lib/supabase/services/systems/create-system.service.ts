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

    const {
        data: record,
        error,
    } = await supabase
        .from("systems")
        .insert({
            ...data,
            owner_id: ownerId,
        })
        .select("id, name, slug, description, owner_id, currency, status, icon_url, is_public, starter_price, pro_price, business_price, reseller_price, exclusive_price, tags, created_at, updated_at")
        .single();


    if (error) {


        throw error;
    }


    return record as System;
}
