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
import { queryKeys } from "@/shared/lib/query";
import type { CouponListItem } from "@/shared/lib/supabase/services/coupons/get-coupons.service";

export function useCoupons(systemId: string) {
    const t = useTranslations("developerCoupons.feedback");
    const queryClient = useQueryClient();

    const queryKey = queryKeys.systems.coupons(systemId);

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

        onError() {
            toast.error(t("createFailed"));
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

        onMutate: async (couponId) => {
            await queryClient.cancelQueries({ queryKey });
            const previous = queryClient.getQueryData<CouponListItem[]>(queryKey);
            queryClient.setQueryData<CouponListItem[]>(queryKey, (current = []) =>
                current.filter((coupon) => coupon.id !== couponId)
            );
            return { previous };
        },

        onSuccess() {
            toast.success(t("deleted"));
        },

        onError(_error, _couponId, context) {
            if (context?.previous) {
                queryClient.setQueryData(queryKey, context.previous);
            }
            toast.error(t("deleteFailed"));
        },

        onSettled: invalidate,
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
