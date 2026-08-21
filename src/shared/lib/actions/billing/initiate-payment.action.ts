"use server";

import { z } from "zod";

import { createKashierCheckoutUrl, KashierError } from "@/shared/lib/kashier";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { fetchUser } from "@/shared/lib/supabase/services/auth/user/fetch-user.service";

const initiatePaymentSchema = z.object({
    orderId: z.string().uuid(),
    locale: z.enum(["ar", "en"]),
});

export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;

export type InitiatePaymentResult =
    | { success: true; iframeUrl: string }
    | { success: false; error: string };

export async function initiatePaymentAction(
    input: InitiatePaymentInput,
): Promise<InitiatePaymentResult> {
    const parsed = initiatePaymentSchema.safeParse(input);
    if (!parsed.success) {
        return { success: false, error: "Invalid order payload." };
    }

    try {
        const supabase = await createSupabaseServerClient();
        const user = await fetchUser(supabase);

        if (!user) {
            return { success: false, error: "Unauthorized." };
        }

        const [{ data: order, error: orderError }, { data: profile, error: profileError }] =
            await Promise.all([
                supabase
                    .from("orders")
                    .select("id, profile_id, system_id, amount, currency, status")
                    .eq("id", parsed.data.orderId)
                    .eq("profile_id", user.id)
                    .maybeSingle(),
                supabase
                    .from("profiles")
                    .select("first_name, last_name, email, phone, city, country")
                    .eq("id", user.id)
                    .maybeSingle(),
            ]);

        if (orderError) throw orderError;
        if (profileError) throw profileError;

        if (!order) {
            return { success: false, error: "Order not found." };
        }

        if (order.status !== "PENDING") {
            return { success: false, error: "Order is not pending payment." };
        }

        if (order.currency !== "EGP") {
            return { success: false, error: "Kashier only supports EGP orders." };
        }

        if (!profile) {
            return { success: false, error: "Billing profile not found." };
        }

        const email = profile.email ?? user.email;
        if (!email) {
            return { success: false, error: "A billing email is required." };
        }

        const { checkoutUrl } = await createKashierCheckoutUrl({
            orderId: order.id,
            amount: order.amount,
            currency: "EGP",
            customer: {
                firstName: profile.first_name,
                lastName: profile.last_name,
                email,
            },
            profileId: order.profile_id,
            systemId: order.system_id,
            locale: parsed.data.locale,
        });

        const { data: existingPayment, error: existingPaymentError } = await supabase
            .from("payments")
            .select("id")
            .eq("order_id", order.id)
            .maybeSingle();

        if (existingPaymentError) {
            console.error("Error fetching existing payment:", existingPaymentError);
            throw existingPaymentError;
        }

        if (existingPayment) {
            const { error: updateError } = await supabase
                .from("payments")
                .update({
                    provider: "KASHIER",
                    provider_reference: order.id,
                    amount: order.amount,
                    currency: order.currency || "EGP",
                    status: "PENDING",
                    updated_at: new Date().toISOString(),
                })
                .eq("id", existingPayment.id);

            if (updateError) {
                console.error("Payment Update Error:", updateError);
                throw updateError;
            }
        } else {
            const { error: insertError } = await supabase
                .from("payments")
                .insert({
                    order_id: order.id,
                    provider: "KASHIER",
                    provider_reference: order.id,
                    amount: order.amount,
                    currency: order.currency || "EGP",
                    status: "PENDING",
                });

            if (insertError) {
                console.error("Payment Insert Error:", insertError);
                throw insertError;
            }
        }

        return { success: true, iframeUrl: checkoutUrl };
    } catch (error) {
        console.error("Failed to initiate Kashier payment:", error);

        return {
            success: false,
            error:
                error instanceof KashierError
                    ? "Unable to create the payment session. Please try again."
                    : "Failed to initiate payment.",
        };
    }
}