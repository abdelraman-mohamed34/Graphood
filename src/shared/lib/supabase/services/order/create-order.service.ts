import { SupabaseClient } from "@supabase/supabase-js";

import { LicenseType } from "@/shared/config/licensing";
import { PlanType } from "@/shared/config/plans";
import { roundMoney } from "@/shared/lib/billing/money";

interface CreateInitialOrderParams {
    supabase: SupabaseClient;

    profileId: string;
    systemId: string;

    plan?: PlanType;
    licenseType: LicenseType;

    originalAmount: number;
    discountAmount?: number;
    discountPercentage?: number;
    couponId?: string;

    amount: number;
    currency?: string;

    description?: string;
}

export async function createPendingOrder({
    supabase,

    profileId,
    systemId,

    plan,
    licenseType,

    originalAmount,
    discountAmount = 0,
    discountPercentage,
    couponId,

    amount,
    currency = "EGP",

    description,
}: CreateInitialOrderParams) {
    const normalizedOriginalAmount = roundMoney(originalAmount);
    const normalizedDiscountAmount = roundMoney(discountAmount);
    const normalizedAmount = roundMoney(amount);

    if (normalizedAmount < 0 || normalizedOriginalAmount <= 0) {
        throw new Error("Invalid amount.");
    }

    if (originalAmount < amount) {
        // طبيعي لو فيه خصم
    }

    if (
        normalizedDiscountAmount < 0 ||
        normalizedDiscountAmount > normalizedOriginalAmount ||
        normalizedAmount !== roundMoney(normalizedOriginalAmount - normalizedDiscountAmount)
    ) {
        throw new Error("Invalid order totals.");
    }

    if (couponId && (discountPercentage == null || discountPercentage < 1 || discountPercentage > 100)) {
        throw new Error("Invalid coupon percentage.");
    }

    const { data, error } = await supabase.rpc("checkout_system_atomic", {
        p_profile_id: profileId,
        p_system_id: systemId,
        p_plan: plan ?? null,
        p_license_type: licenseType,
        p_original_amount: normalizedOriginalAmount,
        p_discount_amount: normalizedDiscountAmount,
        p_discount_percentage: discountPercentage ?? null,
        p_coupon_id: couponId ?? null,
        p_amount: normalizedAmount,
        p_currency: currency,
        p_description: description ?? null,
    });

    if (error) throw error;
    const reservation = data?.[0];
    if (!reservation?.order_id || !reservation.payment_id) {
        throw new Error("ATOMIC_CHECKOUT_FAILED");
    }

    return {
        order: { id: reservation.order_id },
        payment: { id: reservation.payment_id },
        isExisting: reservation.is_existing,
    };
}
