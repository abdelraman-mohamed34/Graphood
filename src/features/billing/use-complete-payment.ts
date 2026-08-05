"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { processPaymentWebhookAction } from "@/shared/lib/actions/billing/process-payment-webhook.action";
import { useTranslations } from "next-intl";
import { queryKeys } from "@/shared/lib/query";

export function useCompletePayment() {
    const queryClient = useQueryClient();
    const t = useTranslations("checkout");

    const mutation = useMutation({
        mutationFn: async (orderId: string) => {
            const transactionRef = `MOCK-${crypto.randomUUID()}`;

            const result = await processPaymentWebhookAction({
                orderId,
                transactionRef,
            });

            if (!result.success) {
                throw new Error(result.error);
            }

            return result.data;
        },

        onSuccess: async (_, orderId) => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.orders.detail(orderId),
            });

            toast.success(t("paymentSuccess"));
        },

        onError: () => {
            toast.error(t("paymentFailed"));
        },
    });

    return {
        completePayment: mutation.mutateAsync,
        isProcessing: mutation.isPending,
    };
}
