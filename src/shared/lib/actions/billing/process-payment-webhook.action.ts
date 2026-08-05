"use server";

import { z } from "zod";
import { confirmOrderPayment } from "../../supabase/services/billing";
import { createSupabaseServerClient } from "../../supabase/server";
import { fetchUser } from "../../supabase/services/auth/user/fetch-user.service";
import { getOrderById } from "../../supabase/services/billing";

const processPaymentWebhookSchema = z.object({
    orderId: z.string().uuid(),
    transactionRef: z.string().min(1),
});

export type ProcessPaymentWebhookInput = z.infer<
    typeof processPaymentWebhookSchema
>;

export type ProcessPaymentWebhookResult =
    | {
        success: true;
        data: Awaited<
            ReturnType<typeof confirmOrderPayment>
        >;
    }
    | {
        success: false;
        error: string;
    };

export async function processPaymentWebhookAction(
    input: ProcessPaymentWebhookInput
): Promise<ProcessPaymentWebhookResult> {
    const parsed = processPaymentWebhookSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.message,
        };
    }

    const { orderId, transactionRef } = parsed.data;

    try {
        const supabase = await createSupabaseServerClient();
        const user = await fetchUser(supabase);
        if (!user) return { success: false, error: "Unauthorized." };

        const order = await getOrderById({ orderId });
        if (!order || order.profile_id !== user.id) {
            return { success: false, error: "Unauthorized." };
        }

        // Payment state is authoritative only when a payment provider calls a
        // signature-verified Route Handler. A browser must never be able to
        // promote its own order to PAID.
        void transactionRef;
        return {
            success: false,
            error: "Payment confirmation is pending provider verification.",
        };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Payment processing failed.",
        };
    }
}
