"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { getOrderAction } from "@/shared/lib/actions/billing/get-order.action";
import { queryKeys } from "@/shared/lib/query";

export function useOrder(orderId: string) {
    const queryClient = useQueryClient();
    const pollingStartedAt = useRef<number | null>(null);
    const invalidatedPaidOrder = useRef<string | null>(null);

    useEffect(() => {
        pollingStartedAt.current = Date.now();
    }, [orderId]);

    const query = useQuery({
        queryKey: queryKeys.orders.detail(orderId),

        queryFn: async () => {
            const result = await getOrderAction({ orderId });

            if (!result.success) {
                throw new Error(
                    typeof result.error === "string"
                        ? result.error
                        : "Failed to fetch order."
                );
            }

            return result.data;
        },

        enabled: !!orderId,
        refetchInterval: (current) => {
            const status = current.state.data?.status;
            const terminal = ["PAID", "FAILED", "CANCELED", "REFUNDED", "EXPIRED"].includes(
                String(status),
            );

            if (terminal) {
                return false;
            }

            if (
                pollingStartedAt.current !== null &&
                Date.now() - pollingStartedAt.current >= 60_000
            ) return false;

            return 2_500;
        },
    });

    useEffect(() => {
        if (query.data?.status !== "PAID" || invalidatedPaidOrder.current === orderId) return;
        invalidatedPaidOrder.current = orderId;

        void Promise.all([
            queryClient.invalidateQueries({ queryKey: queryKeys.orders.all }),
            queryClient.invalidateQueries({ queryKey: queryKeys.systems.all() }),
            queryClient.invalidateQueries({ queryKey: queryKeys.tenants.all }),
            queryClient.invalidateQueries({ queryKey: queryKeys.profiles.all }),
        ]);
    }, [orderId, query.data?.status, queryClient]);

    return {
        order: query.data,

        isLoading: query.isPending,
        isFetching: query.isFetching,
        error: query.error,

        refetch: query.refetch,
    };
}
