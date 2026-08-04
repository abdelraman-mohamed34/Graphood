"use client";

import { useQuery } from "@tanstack/react-query";

import { getOrderAction } from "@/shared/lib/actions/billing/get-order.action";

export function useOrder(orderId: string) {
    const query = useQuery({
        queryKey: ["order", orderId],

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
        staleTime: 1000 * 60 * 5,
        refetchInterval: (query) => {
            const order = query.state.data;
            const isPaid = order?.status === "PAID";
            return isPaid && !order.tenant_slug ? 1500 : false;
        },
    });

    return {
        order: query.data,

        isLoading: query.isPending,
        isFetching: query.isFetching,
        error: query.error,

        refetch: query.refetch,
    };
}
