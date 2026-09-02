"use server";

import { z } from "zod";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { fetchUser } from "@/shared/lib/supabase/services/auth/user/fetch-user.service";
import { getOrderById } from "@/shared/lib/supabase/services/billing";

const checkOrderStatusSchema = z.object({
    orderId: z.string().uuid(),
});

export type CheckOrderStatusInput = z.infer<typeof checkOrderStatusSchema>;

// Keep the action result aligned with the order data-access service. That
// service intentionally returns its joined `systems` and `tenant_slug` DTO,
// which is not the same shape as the base orders schema.
export type CheckOrderStatusData = NonNullable<Awaited<ReturnType<typeof getOrderById>>>;

export type CheckOrderStatusResult =
    | {
        success: true;
        isPaid: true;
        data: CheckOrderStatusData;
    }
    | {
        success: true;
        isPaid: false;
        data: CheckOrderStatusData;
        error: string;
    }
    | {
        success: false;
        isPaid: false;
        error: string;
    };

export async function checkOrderStatusAction(
    input: CheckOrderStatusInput,
): Promise<CheckOrderStatusResult> {
    const parsed = checkOrderStatusSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            isPaid: false,
            error: "Invalid order payload.",
        };
    }

    try {
        const supabase = await createSupabaseServerClient();
        const user = await fetchUser(supabase);

        if (!user) {
            return { success: false, isPaid: false, error: "Unauthorized." };
        }

        const order = await getOrderById({
            orderId: parsed.data.orderId,
            supabase,
            profileId: user.id,
        });

        if (!order) {
            return { success: false, isPaid: false, error: "Order not found." };
        }

        const isPaid = order.status === "PAID";

        if (isPaid) {
            return { success: true, isPaid: true, data: order };
        }

        return {
            success: true,
            isPaid: false,
            data: order,
            error: "Payment is still processing.",
        };
    } catch (error) {
        console.error("Failed to check order status", error);
        return {
            success: false,
            isPaid: false,
            error: "Unable to check payment status. Please try again.",
        };
    }
}
