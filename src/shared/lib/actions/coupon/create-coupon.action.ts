"use server";

import { z } from "zod";

import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { fetchUser } from "@/shared/lib/supabase/services/auth/user/fetch-user.service";
import { getSystemById } from "@/shared/lib/supabase/services/systems";
import { createCoupon } from "@/shared/lib/supabase/services/coupons";

import { createCouponSchema } from "@/shared/lib/schemas/coupon/coupon.schema";

type CreateCouponInput = z.infer<typeof createCouponSchema>;

export async function createCouponAction(
    input: CreateCouponInput
) {
    const parsed = createCouponSchema.safeParse(input);

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

    const {
        system_id,
        code,
        discount_type,
        discount_value,
        max_discount,
        license_type,
        plan,
        min_order_amount,
        max_uses,
        max_uses_per_user,
        one_use_per_system,
        starts_at,
        expires_at,
        is_active,
    } = parsed.data;

    const system = await getSystemById(
        system_id,
        supabase
    );

    if (!system) {
        return {
            success: false,
            error: "System not found.",
        };
    }

    if (system.owner_id !== user.id) {
        return {
            success: false,
            error: "Unauthorized.",
        };
    }

    try {
        const coupon = await createCoupon({
            supabase,

            systemId: system_id,
            createdBy: user.id,

            code,

            discountType: discount_type,
            discountValue: discount_value,

            maxDiscount: max_discount ?? undefined,

            licenseType: license_type ?? undefined,
            plan: plan ?? undefined,

            minOrderAmount: min_order_amount,

            maxUses: max_uses ?? undefined,
            maxUsesPerUser: max_uses_per_user,

            oneUsePerSystem: one_use_per_system,

            startsAt: starts_at ?? undefined,
            expiresAt: expires_at ?? undefined,

            isActive: is_active,
        });;

        return {
            success: true,
            data: coupon,
        };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to create coupon.",
        };
    }
}