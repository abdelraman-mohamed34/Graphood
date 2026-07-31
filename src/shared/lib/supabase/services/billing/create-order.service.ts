// src/shared/lib/supabase/services/billing/create-order.ts
import { LicenseType } from "@/shared/config/licensing";
import { PlanType } from "@/shared/config/plans";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

interface CreateInitialOrderParams {
    profileId: string;
    systemId: string;

    plan?: string;

    licenseType: string;

    amount: number;
    currency?: string;

    provider: "STRIPE" | "PAYMOB" | "CASH" | "MANUAL";

    description?: string;
}

export async function createPendingOrder({
    profileId,
    systemId,
    plan,
    licenseType,
    amount,
    currency = "EGP",
    provider,
    description,
}: CreateInitialOrderParams) {
    const supabase = await createSupabaseServerClient();

    const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([
            {
                profile_id: profileId,
                system_id: systemId,
                plan,
                license_type: licenseType,

                amount,
                currency,
                status: "PENDING",
                description,
            },
        ])
        .select()
        .single();

    if (orderError) {
        console.error(orderError);
        throw orderError;
    }

    const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .insert([
            {
                order_id: order.id,
                provider,
                amount,
                currency,
                status: "PENDING",
            },
        ])
        .select()
        .single();

    if (paymentError) {
        console.error("Payment Error:", paymentError);

        throw new Error(
            `${paymentError.code} - ${paymentError.message} - ${paymentError.details ?? ""}`
        );
    }

    return { order, payment };
}