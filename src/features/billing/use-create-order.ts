// src/features/billing/hooks/use-create-order.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createOrderAction } from "@/shared/lib/actions/billing/create-order.action";
import { cancelOrderAction } from "@/shared/lib/actions/billing/pending-order.action";

import { LicenseType } from "@/shared/config/licensing";
import { PlanType } from "@/shared/config/plans";
import { queryKeys } from "@/shared/lib/query";

type CreateOrderInput = {
    systemId: string;
    licenseType: LicenseType;
    plan?: PlanType;
    couponCode?: string;
};

export function useCreateOrder() {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: async (data: CreateOrderInput) => {
            const result = await createOrderAction(data);

            if (!result.success) {
                throw new Error(
                    typeof result.error === "string"
                        ? result.error
                        : "Failed to create order."
                );
            }

            return result;
        },
        onSuccess: async (result, variables) => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.orders.pendingForSystem(variables.systemId),
            });
            await queryClient.invalidateQueries({
                queryKey: queryKeys.orders.detail(result.orderId),
            });
        },
    });

    const cancelMutation = useMutation({
        mutationFn: async ({ orderId }: { orderId: string; systemId: string }) => {
            const result = await cancelOrderAction(orderId);
            if (!result.success) throw new Error(result.error);
            return result;
        },
        onSuccess: async (_, { systemId }) => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.orders.pendingForSystem(systemId),
            });
        },
    });

    return {
        createOrder: mutation.mutateAsync,
        isCreating: mutation.isPending,

        createOrderResult: mutation.data,
        createOrderError: mutation.error,

        resetCreateOrder: mutation.reset,

        cancelOrder: cancelMutation.mutateAsync,
        isCancellingOrder: cancelMutation.isPending,
        cancelOrderError: cancelMutation.error,
    };
}
