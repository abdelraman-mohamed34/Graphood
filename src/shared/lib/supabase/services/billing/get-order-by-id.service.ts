// src/shared/lib/supabase/services/billing/get-order-by-id.service.ts

import { createAdminClient } from "../../admin";

export async function getOrderById({
    orderId,
}: {
    orderId: string;
}) {
    const supabase = createAdminClient();

    const { data, error } = await supabase
        .from("orders")
        .select(`
        id,
        profile_id,
        status,
        amount,
        currency,
        plan,
        license_type,
        systems (
            id,
            name,
            slug,
            icon_url
        )
    `)
        .eq("id", orderId)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
}