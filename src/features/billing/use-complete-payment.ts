"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { processPaymentWebhookAction } from "@/shared/lib/actions/billing/process-payment-webhook.action";

export function useCompletePayment() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (orderId: string) => {
            const transactionRef = `MOCK-${crypto.randomUUID()}`;

            const result = await processPaymentWebhookAction({
                orderId,
                transactionRef,
            });
            
            console.log("PROCESS PAYMENT RESULT:", result);

            if (!result.success) {
                throw new Error(result.error);
            }

            return result.data;
        },

        onSuccess: async (_, orderId) => {
            await queryClient.invalidateQueries({
                queryKey: ["order", orderId],
            });

            toast.success(
                "Payment completed successfully."
            );
        },

        onError: (error) => {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Payment failed."
            );
        },
    });

    return {
        completePayment: mutation.mutateAsync,
        isProcessing: mutation.isPending,
    };
}