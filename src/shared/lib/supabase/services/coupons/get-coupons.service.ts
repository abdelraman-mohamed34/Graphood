import { SupabaseClient } from "@supabase/supabase-js";
import type { Tables } from "@/shared/types/database.types";

export type CouponListItem = Pick<
    Tables<"coupons">,
    "id" | "code" | "discount_type" | "discount_value" | "is_active" |
    "license_type" | "plan" | "used_count" | "max_uses" | "expires_at"
>;

interface GetCouponsParams {
    supabase: SupabaseClient;
    systemId: string;
}

export async function getCoupons({
    supabase,
    systemId,
}: GetCouponsParams) {
    const { data, error } = await supabase
        .from("coupons")
        .select("id, code, discount_type, discount_value, is_active, license_type, plan, used_count, max_uses, expires_at")
        .eq("system_id", systemId)
        .order("created_at", { ascending: false });

    if (error) {
        throw error;
    }

    return data satisfies CouponListItem[];
}
