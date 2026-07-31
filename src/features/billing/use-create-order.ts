// src/features/billing/hooks/use-create-order.ts
"use client";

import { useMutation } from "@tanstack/react-query";

import { createOrderAction } from "@/shared/lib/actions/billing/create-order.action";

import { LicenseType } from "@/shared/config/licensing";
import { PlanType } from "@/shared/config/plans";

type CreateOrderInput = {
    systemId: string;
    licenseType: LicenseType;
    plan?: PlanType;
};

export function useCreateOrder() {
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
    });

    return {
        createOrder: mutation.mutateAsync,
        isCreating: mutation.isPending,

        createOrderResult: mutation.data,
        createOrderError: mutation.error,

        resetCreateOrder: mutation.reset,
    };
}