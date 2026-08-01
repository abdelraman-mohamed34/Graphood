"use client";

import { useMutation } from "@tanstack/react-query";

import { validateCouponAction } from "@/shared/lib/actions/billing/validate-coupon.action";

export function useValidateCoupon() {
    const mutation = useMutation({
        mutationFn: validateCouponAction,
    });

    return {
        validateCoupon: mutation.mutateAsync,

        data:
            mutation.data?.success
                ? mutation.data.data
                : undefined,

        error:
            mutation.data?.success === false
                ? mutation.data.error
                : mutation.error,

        isValid: mutation.data?.success === true,

        isInvalid: mutation.data?.success === false,

        isValidating: mutation.isPending,

        isSuccess: mutation.isSuccess,

        isIdle: mutation.isIdle,

        reset: mutation.reset,
    };
}