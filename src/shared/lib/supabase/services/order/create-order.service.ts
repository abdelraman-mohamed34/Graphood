import { SupabaseClient } from "@supabase/supabase-js";

import { LicenseType } from "@/shared/config/licensing";
import { PlanType } from "@/shared/config/plans";
import { PaymentProvider } from "@/shared/lib/providers/billings/payment-provider";
import { roundMoney } from "@/shared/lib/billing/money";

interface CreateInitialOrderParams {
    supabase: SupabaseClient;

    profileId: string;
    systemId: string;

    plan?: PlanType;
    licenseType: LicenseType;

    originalAmount: number;
    discountAmount?: number;
    couponId?: string;

    amount: number;
    currency?: string;

    provider: PaymentProvider;

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
    couponId,

    amount,
    currency = "EGP",

    provider,

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

    const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
            profile_id: profileId,
            system_id: systemId,

            plan,
            license_type: licenseType,

            original_amount: normalizedOriginalAmount,
            discount_amount: normalizedDiscountAmount,
            coupon_id: couponId ?? null,

            amount: normalizedAmount,
            currency,

            status: "PENDING",

            description,
        })
        .select("id")
        .single();

    if (orderError) {
        throw orderError;
    }

    const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .insert({
            order_id: order.id,

            provider,

            amount: normalizedAmount,
            currency,

            status: "PENDING",
        })
        .select("id")
        .single();

    if (paymentError) {
        await supabase
            .from("orders")
            .delete()
            .eq("id", order.id);

        throw paymentError;
    }

    return {
        order,
        payment,
    };
}
