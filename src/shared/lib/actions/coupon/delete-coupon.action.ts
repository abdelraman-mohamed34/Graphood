"use server";

import { z } from "zod";

import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { fetchUser } from "@/shared/lib/supabase/services/auth/user/fetch-user.service";
import { getSystemById } from "@/shared/lib/supabase/services/systems";
import { deleteCoupon, getCouponById } from "../../supabase/services/coupons";

const schema = z.object({
    couponId: z.string().uuid(),
});

export async function deleteCouponAction(
    input: z.infer<typeof schema>
) {
    const parsed = schema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.flatten(),
        };
    }

    const supabase = await createSupabaseServerClient();

    const user = await fetchUser(supabase);

    if (!user) {
        return {
            success: false,
            error: "Unauthorized.",
        };
    }

    const coupon = await getCouponById({
        supabase,
        couponId: parsed.data.couponId,
    });

    if (!coupon) {
        return {
            success: false,
            error: "Coupon not found.",
        };
    }

    const system = await getSystemById(
        coupon.system_id!,
        supabase
    );

    if (!system || system.owner_id !== user.id) {
        return {
            success: false,
            error: "Unauthorized.",
        };
    }

    await deleteCoupon({
        supabase,
        couponId: coupon.id,
    });

    return {
        success: true,
    };
}