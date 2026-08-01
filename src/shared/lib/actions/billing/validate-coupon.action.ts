"use server";

import { z } from "zod";

import { licenseTypes } from "@/shared/config/licensing";
import { PLAN_LIMITS } from "@/shared/config/plans";

import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { fetchUser } from "@/shared/lib/supabase/services/auth/user/fetch-user.service";
import { validateCoupon } from "@/shared/lib/supabase/services/coupons";

const validateCouponSchema = z.object({
    code: z.string().trim().min(1),

    systemId: z.string().uuid(),

    amount: z.number().positive(),

    licenseType: z.enum(licenseTypes),

    plan: z
        .enum(
            Object.keys(PLAN_LIMITS) as [
                keyof typeof PLAN_LIMITS
            ]
        )
        .optional(),
});

type ValidateCouponInput = z.infer<
    typeof validateCouponSchema
>;

export async function validateCouponAction(
    input: ValidateCouponInput
) {
    const parsed =
        validateCouponSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.flatten(),
        };
    }

    const {
        code,
        systemId,
        amount,
        licenseType,
        plan,
    } = parsed.data;

    const supabase =
        await createSupabaseServerClient();

    const user = await fetchUser(supabase);

    if (!user) {
        return {
            success: false,
            error: "Unauthorized.",
        };
    }

    try {
        const result = await validateCoupon({
            supabase,

            code,

            profileId: user.id,
            systemId,

            amount,

            licenseType,
            plan,
        });

        return {
            success: true,
            data: result,
        };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to validate coupon.",
        };
    }
}