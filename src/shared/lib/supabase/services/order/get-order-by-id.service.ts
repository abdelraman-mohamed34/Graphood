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
        subscription_id,
        status,
        original_amount,
        discount_amount,
        coupon_id,
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

    if (!data?.subscription_id || data.status !== "PAID") {
        return data ? { ...data, tenant_slug: null } : null;
    }

    const { data: tenant, error: tenantError } = await supabase
        .from("tenants")
        .select("slug")
        .eq("subscription_id", data.subscription_id)
        .maybeSingle();

    if (tenantError) throw tenantError;

    return {
        ...data,
        tenant_slug: tenant?.slug ?? null,
    };
}
