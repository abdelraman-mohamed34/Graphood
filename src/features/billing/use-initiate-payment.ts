"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    initiatePaymentAction,
    type InitiatePaymentInput,
} from "@/shared/lib/actions/billing/initiate-payment.action";

export function useInitiatePayment() {
    return useMutation({
        mutationFn: async (input: InitiatePaymentInput) => {
            const result = await initiatePaymentAction(input);

            if (!result.success) {
                throw new Error(result.error);
            }

            return result.iframeUrl;
        },
        onSuccess: (iframeUrl) => {
            window.location.href = iframeUrl;
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to initiate payment session.");
        },
    });
}
