import { SupabaseClient } from "@supabase/supabase-js";

interface GetCouponByIdParams {
    supabase: SupabaseClient;
    couponId: string;
}

export async function getCouponById({
    supabase,
    couponId,
}: GetCouponByIdParams) {
    const { data, error } = await supabase
        .from("coupons")
        .select("id, system_id")
        .eq("id", couponId)
        .maybeSingle();

    if (error) {
        throw new Error("coupons.fetchFailed", { cause: error });
    }

    return data;
}
