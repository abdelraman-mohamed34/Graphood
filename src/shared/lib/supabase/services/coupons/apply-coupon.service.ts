import { SupabaseClient } from "@supabase/supabase-js";

interface ApplyCouponParams {
    supabase: SupabaseClient;

    couponId: string;
    orderId: string;

    profileId: string;
    systemId: string;
}

export async function applyCoupon({
    supabase,

    couponId,
    orderId,

    profileId,
    systemId,
}: ApplyCouponParams) {
    //----------------------------------
    // Get Coupon
    //----------------------------------

    const { data: coupon, error: couponError } =
        await supabase
            .from("coupons")
            .select("id, used_count")
            .eq("id", couponId)
            .single();

    if (couponError || !coupon) {
        throw new Error("Coupon not found.");
    }

    //----------------------------------
    // Idempotency
    //----------------------------------

    const { data: existingUsage, error: existingError } =
        await supabase
            .from("coupon_usages")
            .select("id")
            .eq("order_id", orderId)
            .maybeSingle();

    if (existingError) {
        throw existingError;
    }

    if (existingUsage) {
        return existingUsage;
    }

    //----------------------------------
    // Record Usage
    //----------------------------------

    const { data: usage, error: usageError } =
        await supabase
            .from("coupon_usages")
            .insert({
                coupon_id: couponId,

                order_id: orderId,

                profile_id: profileId,
                system_id: systemId,
            })
            .select()
            .single();

    if (usageError) {
        throw usageError;
    }

    //----------------------------------
    // Increment Counter
    //----------------------------------

    const { error: updateError } =
        await supabase
            .from("coupons")
            .update({
                used_count: coupon.used_count + 1,
            })
            .eq("id", couponId);

    if (updateError) {
        throw updateError;
    }

    return usage;
}