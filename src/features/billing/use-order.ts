// src/features/billing/hooks/use-order.ts
"use client";

import { useQuery } from "@tanstack/react-query";

import { getOrderAction } from "@/shared/lib/actions/billing/get-order.action";

export function useOrder(orderId: string) {
    return useQuery({
        queryKey: ["order", orderId],

        queryFn: async () => {
            const result = await getOrderAction({
                orderId,
            });

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
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}