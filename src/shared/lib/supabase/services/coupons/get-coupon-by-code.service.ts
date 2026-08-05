// src/shared/lib/supabase/services/coupons/get-coupon-by-code.service.ts

import { SupabaseClient } from "@supabase/supabase-js";

export async function getCouponByCode(
    supabase: SupabaseClient,
    code: string
) {
    const normalizedCode = code.trim().toUpperCase();

    if (!normalizedCode) {
        throw new Error("Coupon code is required.");
    }

    const { data, error } = await supabase
        .from("coupons")
        .select("id, code, system_id, discount_type, discount_value, max_discount, license_type, plan, min_order_amount, max_uses, max_uses_per_user, used_count, one_use_per_system, starts_at, expires_at, is_active")
        .eq("code", normalizedCode)
        .maybeSingle();

    if (error) {
        throw new Error(
            `Failed to fetch coupon: ${error.message}`
        );
    }

    return data;
}
