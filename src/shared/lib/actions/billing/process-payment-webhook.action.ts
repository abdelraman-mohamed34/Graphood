"use server";

import { z } from "zod";
import { confirmOrderPayment } from "../../supabase/services/billing";

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
    const parsed =
        processPaymentWebhookSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.message,
        };
    }

    const {
        orderId,
        transactionRef,
    } = parsed.data;

    try {
        const result = await confirmOrderPayment(
            orderId,
            transactionRef
        );

        return {
            success: true,
            data: result,
        };
    } catch (error) {
        console.error("processPaymentWebhookAction:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Payment processing failed.",
        };
    }
}