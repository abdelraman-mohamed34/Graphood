"use server";

import { z } from "zod";

import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { fetchUser } from "@/shared/lib/supabase/services/auth/user/fetch-user.service";
import { getSystemById } from "@/shared/lib/supabase/services/systems";
import { createPendingOrder } from "@/shared/lib/supabase/services/billing/create-order.service";

import { licenseTypes } from "@/shared/config/licensing";
import { PLAN_LIMITS } from "@/shared/config/plans";

const createOrderSchema = z.object({
    systemId: z.string().uuid(),
    plan: z.enum(
        Object.keys(PLAN_LIMITS) as [keyof typeof PLAN_LIMITS]
    ),
    licenseType: z.enum(licenseTypes),
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

    const { systemId, plan, licenseType } = parsed.data;

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

    const currency = system.currency;

    let amount: number;

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
                error: "Invalid plan.",
            };
    }

    if (
        amount === null ||
        amount === undefined ||
        amount <= 0
    ) {
        return {
            success: false,
            error: "Invalid system price.",
        };
    }

    // Reserved for future pricing logic:
    // - Coupons
    // - Promotions
    // - Taxes
    // - License modifiers
    // - Platform commission

    try {
        const { order, payment } =
            await createPendingOrder({
                profileId: user.id,
                systemId: system.id,

                plan,
                licenseType,

                amount,
                currency,

                provider: "MANUAL",

                description: `${system.name} (${plan}) - ${licenseType}`,
            });

        return {
            success: true,

            orderId: order.id,
            paymentId: payment.id,

            amount,
            currency,

            plan,
            licenseType,
        };
    } catch (error) {
        console.error("Create order failed:", error);

        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to create order.",
        };
    }
}