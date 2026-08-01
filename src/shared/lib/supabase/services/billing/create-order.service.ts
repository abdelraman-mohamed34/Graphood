import { SupabaseClient } from "@supabase/supabase-js";

import { LicenseType } from "@/shared/config/licensing";
import { PlanType } from "@/shared/config/plans";
import { PaymentProvider } from "@/shared/lib/providers/billings/payment-provider";

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
    if (amount <= 0) {
        throw new Error("Invalid amount.");
    }

    if (originalAmount < amount) {
        // طبيعي لو فيه خصم
    }

    const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
            profile_id: profileId,
            system_id: systemId,

            plan,
            license_type: licenseType,

            original_amount: originalAmount,
            discount_amount: discountAmount,
            coupon_id: couponId ?? null,

            amount,
            currency,

            status: "PENDING",

            description,
        })
        .select()
        .single();

    if (orderError) {
        throw orderError;
    }

    const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .insert({
            order_id: order.id,

            provider,

            amount,
            currency,

            status: "PENDING",
        })
        .select()
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