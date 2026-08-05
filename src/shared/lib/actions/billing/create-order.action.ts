"use server";

import { z } from "zod";

import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { fetchUser } from "@/shared/lib/supabase/services/auth/user/fetch-user.service";
import { getSystemById } from "@/shared/lib/supabase/services/systems";
import { createPendingOrder } from "@/shared/lib/supabase/services/order/create-order.service";

import { licenseTypes } from "@/shared/config/licensing";
import { PLAN_LIMITS } from "@/shared/config/plans";
import { getPendingUserSystemOrder, getUserSystemOrder } from "../../supabase/services/billing";
import { validateCoupon } from "../../supabase/services/coupons";

const createOrderSchema = z.object({
    systemId: z.string().uuid(),
    plan: z
        .enum(
            Object.keys(PLAN_LIMITS) as [keyof typeof PLAN_LIMITS]
        )
        .optional(),
    licenseType: z.enum(licenseTypes),

    couponCode: z.string().trim().optional(),
});

type CreateOrderInput = z.infer<typeof createOrderSchema>;

export async function createOrderAction(
    input: CreateOrderInput
) {
    const parsed = createOrderSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.flatten(),
        };
    }

    const {
        systemId,
        plan,
        licenseType,
        couponCode,
    } = parsed.data;

    if (licenseType === "SUBSCRIPTION" && !plan) {
        return {
            success: false,
            error: "Plan is required for subscription licenses.",
        };
    }

    if (
        licenseType !== "SUBSCRIPTION" &&
        plan !== undefined
    ) {
        return {
            success: false,
            error: "Plan is only allowed for subscription licenses.",
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

    const system = await getSystemById(systemId, supabase);

    if (!system) {
        return {
            success: false,
            error: "System not found.",
        };
    }

    if (system.status !== "ACTIVE") {
        return {
            success: false,
            error: "System is not available.",
        };
    }

    if (!system.is_public) {
        return {
            success: false,
            error: "This system is private.",
        };
    }

    if (system.owner_id === user.id) {
        return {
            success: false,
            error: "You cannot purchase your own system.",
        };
    }

    const pendingOrder = await getPendingUserSystemOrder(user.id, system.id, supabase);
    if (pendingOrder) {
        return {
            success: true,
            orderId: pendingOrder.id,
            isExisting: true,
        };
    }

    const existingOrder = await getUserSystemOrder(
        user.id,
        system.id,
        supabase
    );

    if (existingOrder) {
        if (existingOrder.status === "PAID") {
            switch (existingOrder.license_type) {
                case "SUBSCRIPTION":
                    if (licenseType === "SUBSCRIPTION") {
                        return {
                            success: false,
                            error:
                                "You already have an active subscription for this system.",
                        };
                    }
                    break;

                case "RESELLER":
                    if (licenseType === "SUBSCRIPTION") {
                        return {
                            success: false,
                            error:
                                "You already own the reseller license for this system.",
                        };
                    }

                    if (licenseType === "RESELLER") {
                        return {
                            success: false,
                            error:
                                "You already own the reseller license for this system.",
                        };
                    }

                    break;

                case "EXCLUSIVE":
                    return {
                        success: false,
                        error:
                            "You already own this system exclusively.",
                    };
            }
        }
    }

    const currency = system.currency;

    let amount: number;

    switch (licenseType) {
        case "SUBSCRIPTION":
            switch (plan) {
                case "STARTER":
                    amount = system.starter_price;
                    break;

                case "PRO":
                    amount = system.pro_price;
                    break;

                case "BUSINESS":
                    amount = system.business_price;
                    break;

                default:
                    return {
                        success: false,
                        error: "Invalid subscription plan.",
                    };
            }
            break;

        case "RESELLER":
            amount = system.reseller_price;
            break;

        case "EXCLUSIVE":
            amount = system.exclusive_price;
            break;

        default:
            return {
                success: false,
                error: "Invalid license type.",
            };
    }

    if (amount == null || amount <= 0) {
        return {
            success: false,
            error: "Invalid system price.",
        };
    }


    let originalAmount = amount;
    let discountAmount = 0;
    let couponId: string | undefined;

    if (couponCode) {
        const couponResult = await validateCoupon({
            supabase,
            code: couponCode,
            profileId: user.id,
            systemId: system.id,
            amount,
            licenseType,
            plan,
        });

        originalAmount = couponResult.originalAmount;
        discountAmount = couponResult.discountAmount;
        amount = couponResult.finalAmount;
        couponId = couponResult.coupon.id;
    }

    // Reserved for future pricing logic:
    // - Coupons
    // - Promotions
    // - Taxes
    // - License modifiers
    // - Platform commission


    //-> do action
    try {
        const { order, payment } = await createPendingOrder({
            supabase,
            profileId: user.id,
            systemId: system.id,

            licenseType,

            ...(licenseType === "SUBSCRIPTION"
                ? { plan }
                : {}),

            amount,
            currency,

            provider: "MANUAL",

            originalAmount,
            discountAmount,
            couponId,

            description:
                licenseType === "SUBSCRIPTION"
                    ? `${system.name} (${plan}) - Subscription`
                    : licenseType === "RESELLER"
                        ? `${system.name} - Reseller License`
                        : `${system.name} - Exclusive License`,
        });

        return {
            success: true,
            isExisting: false,

            orderId: order.id,
            paymentId: payment.id,

            originalAmount,
            discountAmount,
            amount,

            couponId,

            currency,

            plan,
            licenseType,
        };
    } catch (error) {

        // A concurrent request may have created the pending order after the
        // preflight lookup. Resume it instead of surfacing a uniqueness error.
        const concurrentPendingOrder = await getPendingUserSystemOrder(user.id, system.id, supabase);
        if (concurrentPendingOrder) {
            return {
                success: true,
                orderId: concurrentPendingOrder.id,
                isExisting: true,
            };
        }

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to create order.",
        };
    }
}
