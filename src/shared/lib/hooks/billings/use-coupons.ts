"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createCouponAction, deleteCouponAction, getCouponsAction } from "../../actions/coupon";

export function useCoupons(systemId: string) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ["coupons", systemId],

        queryFn: async () => {
            const result = await getCouponsAction({
                systemId,
            });

            if (!result.success) {
                throw new Error(
                    typeof result.error === "string"
                        ? result.error
                        : "Failed to load coupons."
                );
            }

            return result.data;
        },

        enabled: !!systemId,
        staleTime: 1000 * 60 * 5,
    });

    const createMutation = useMutation({
        mutationFn: createCouponAction,

        onSuccess(result) {
            if (!result.success) {
                toast.error(
                    typeof result.error === "string"
                        ? result.error
                        : "Failed to create coupon."
                );

                return;
            }

            toast.success("Coupon created.");

            queryClient.invalidateQueries({
                queryKey: ["coupons", systemId],
            });
        },

        onError(error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to create coupon."
            );
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteCouponAction,

        onSuccess(result) {
            if (!result.success) {
                toast.error(
                    typeof result.error === "string"
                        ? result.error
                        : "Failed to delete coupon."
                );

                return;
            }

            toast.success("Coupon deleted.");

            queryClient.invalidateQueries({
                queryKey: ["coupons", systemId],
            });
        },

        onError(error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to delete coupon."
            );
        },
    });

    return {
        coupons: query.data ?? [],

        createCoupon: createMutation.mutateAsync,
        deleteCoupon: deleteMutation.mutateAsync,

        isLoading: query.isPending,
        isFetching: query.isFetching,

        isCreating: createMutation.isPending,
        isDeleting: deleteMutation.isPending,

        refetch: query.refetch,

        error: query.error,
    };
}