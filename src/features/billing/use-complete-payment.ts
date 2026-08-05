"use client";

import { useCallback, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { queryKeys } from "@/shared/lib/query";
import { checkOrderStatusAction } from "@/shared/lib/actions/billing/check-order-status.action";

const POLL_INTERVAL_MS = 2_500;
const MAX_POLL_WINDOW_MS = 60_000;

export function useCompletePayment() {
    const queryClient = useQueryClient();
    const t = useTranslations("checkout");
    const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
    const [startedAt, setStartedAt] = useState<number | null>(null);

    const query = useQuery({
        queryKey: queryKeys.orders.paymentStatus(activeOrderId ?? undefined),
        enabled: Boolean(activeOrderId),
        queryFn: async () => {
            const result = await checkOrderStatusAction({ orderId: activeOrderId! });
            if (!result.success) {
                const error = new Error(result.error);
                (error as Error & { code?: string }).code = result.error;
                throw error;
            }
            return result;
        },
        retry: (failureCount, error) => {
            const code = (error as Error & { code?: string }).code;
            if (code === "Unauthorized." || code === "Order not found.") return false;
            return failureCount < 3;
        },
        retryDelay: (attempt) => Math.min(1_000 * 2 ** attempt, 8_000),
        refetchInterval: (current) => {
            const elapsed = startedAt ? Date.now() - startedAt : 0;
            const currentStatus = current.state.data?.success
                ? String(current.state.data.data.status)
                : null;
            if (
                elapsed >= MAX_POLL_WINDOW_MS ||
                currentStatus === "PAID" ||
                currentStatus === "FAILED" ||
                currentStatus === "CANCELED" ||
                currentStatus === "EXPIRED"
            ) return false;
            return POLL_INTERVAL_MS;
        },
    });

    useEffect(() => {
        if (query.data?.success && query.data.isPaid && activeOrderId) {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.orders.detail(activeOrderId),
            });
            toast.success(t("paymentSuccess"));
        }
    }, [activeOrderId, query.data, queryClient, t]);

    useEffect(() => {
        const code = (query.error as (Error & { code?: string }) | null)?.code;
        if (code === "Unauthorized." || code === "Order not found.") {
            toast.error(t("paymentFailed"));
        }
    }, [query.error, t]);

    const completePayment = useCallback(async (orderId: string) => {
        setStartedAt(Date.now());
        setActiveOrderId(orderId);
    }, []);

    return {
        completePayment,
        isProcessing: query.isFetching,
        paymentStatus: query.data,
    };
}
