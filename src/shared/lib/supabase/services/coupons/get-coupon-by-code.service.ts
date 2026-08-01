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
        .select("*")
        .eq("code", normalizedCode)
        .maybeSingle();

    if (error) {
        throw new Error(
            `Failed to fetch coupon: ${error.message}`
        );
    }

    return data;
}