"use client";

import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import {
    createCouponAction,
    deleteCouponAction,
    getCouponsAction,
} from "../../actions/coupon";
import type { CreateCouponInput } from "@/shared/lib/schemas/coupon/coupon.schema";
import { useTranslations } from "next-intl";

export function useCoupons(systemId: string) {
    const t = useTranslations("developerCoupons.feedback");
    const queryClient = useQueryClient();

    const queryKey = ["coupons", systemId] as const;

    const invalidate = () =>
        queryClient.invalidateQueries({
            queryKey,
        });

    const query = useQuery({
        queryKey,

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
        mutationFn: async (input: CreateCouponInput) => {
            const result = await createCouponAction(input);

            if (!result.success) {
                throw new Error(
                    typeof result.error === "string"
                        ? result.error
                        : "Failed to create coupon."
                );
            }

            return result;
        },

        onSuccess() {
            toast.success(t("created"));
            invalidate();
        },

        onError(error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : t("createFailed")
            );
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (couponId: string) => {
            const result = await deleteCouponAction({ couponId });

            if (!result.success) {
                throw new Error(
                    typeof result.error === "string"
                        ? result.error
                        : "Failed to delete coupon."
                );
            }

            return result;
        },

        onSuccess() {
            toast.success(t("deleted"));
            invalidate();
        },

        onError(error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : t("deleteFailed")
            );
        },
    });

    return {
        coupons: query.data ?? [],

        createCoupon: createMutation.mutateAsync,
        deleteCoupon: deleteMutation.mutateAsync,

        isLoading: query.isPending,
        isFetching: query.isFetching,
        isError: query.isError,

        isCreating: createMutation.isPending,
        isDeleting: deleteMutation.isPending,

        error: query.error,

        refetch: query.refetch,

        query,
    };
}
