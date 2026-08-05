"use server";

import { z } from "zod";

import {
    createPaymobPaymentIntent,
    PaymobError,
} from "@/shared/lib/paymob";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { fetchUser } from "@/shared/lib/supabase/services/auth/user/fetch-user.service";

const initiatePaymentSchema = z.object({
    orderId: z.string().uuid(),
    paymentMethod: z.enum(["wallet", "instapay"]),
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

        // Treat the action as a public endpoint: constrain the query itself to
        // the signed-in owner instead of fetching by ID and checking afterward.
        const [{ data: order, error: orderError }, { data: profile, error: profileError }] =
            await Promise.all([
                supabase
                    .from("orders")
                    .select("id, amount, currency, status, payments(id, provider, provider_reference, provider_integration_id, status)")
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

        // Do not reveal whether an ID belonging to another user exists.
        if (!order) {
            return { success: false, error: "Order not found." };
        }

        if (order.status !== "PENDING") {
            return { success: false, error: "Order is not pending payment." };
        }

        if (order.currency !== "EGP") {
            return { success: false, error: "Paymob only supports EGP orders." };
        }

        if (!profile) {
            return { success: false, error: "Billing profile not found." };
        }

        const email = profile.email ?? user.email;
        if (!email) {
            return { success: false, error: "A billing email is required." };
        }

        const existingPayment = Array.isArray(order.payments)
            ? order.payments.find((payment) => payment.status === "PENDING")
            : null;
        const existingPaymobOrderId = existingPayment?.provider === "PAYMOB"
            && existingPayment.provider_reference
            ? Number(existingPayment.provider_reference)
            : undefined;

        if (existingPaymobOrderId !== undefined && !Number.isSafeInteger(existingPaymobOrderId)) {
            return { success: false, error: "Payment session is invalid." };
        }

        const requestedIntegrationId = parsed.data.paymentMethod === "wallet"
            ? Number(process.env.PAYMOB_WALLET_INTEGRATION_ID)
            : Number(process.env.PAYMOB_INSTAPAY_INTEGRATION_ID);
        if (
            existingPayment?.provider === "PAYMOB" &&
            existingPayment.provider_integration_id !== requestedIntegrationId
        ) {
            return { success: false, error: "A payment session already exists for another payment method." };
        }

        const paymentIntent = await createPaymobPaymentIntent({
            orderId: order.id,
            amount: order.amount,
            currency: "EGP",
            paymentMethod: parsed.data.paymentMethod,
            customer: {
                firstName: profile.first_name,
                lastName: profile.last_name,
                email,
                phoneNumber: profile.phone?.trim() || "NA",
                city: profile.city?.trim() || "NA",
                country: profile.country?.trim() || "EG",
            },
        }, { paymobOrderId: existingPaymobOrderId });

        if (paymentIntent.integrationId !== requestedIntegrationId) {
            return { success: false, error: "A payment session already exists for another payment method." };
        }

        const { error: paymentUpdateError } = await supabase
            .from("payments")
            .update({
                provider: "PAYMOB",
                provider_reference: String(paymentIntent.paymobOrderId),
                provider_integration_id: paymentIntent.integrationId,
                updated_at: new Date().toISOString(),
            })
            .eq("order_id", order.id)
            .eq("status", "PENDING");

        if (paymentUpdateError) throw paymentUpdateError;

        return { success: true, iframeUrl: paymentIntent.iframeUrl };
    } catch (error) {
        // Paymob/configuration details stay in server logs and are not exposed
        // through the serialized Server Action result.
        console.error("Failed to initiate Paymob payment", error);

        return {
            success: false,
            error:
                error instanceof PaymobError
                    ? "Unable to create the payment session. Please try again."
                    : "Failed to initiate payment.",
        };
    }
}
