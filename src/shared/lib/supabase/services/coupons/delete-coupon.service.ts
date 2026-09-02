import { SupabaseClient } from "@supabase/supabase-js";

interface DeleteCouponParams {
    supabase: SupabaseClient;
    couponId: string;
}

export async function deleteCoupon({
    supabase,
    couponId,
}: DeleteCouponParams) {
    const { error } = await supabase
        .from("coupons")
        .delete()
        .eq("id", couponId);

    if (error) throw new Error("coupons.deleteFailed", { cause: error });

    return true;
}
