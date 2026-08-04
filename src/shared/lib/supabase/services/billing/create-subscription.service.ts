// src/shared/lib/supabase/services/billing/create-subscription.service.ts

import { createAdminClient } from "../../admin";

export async function createSubscription({
    orderId,
}: {
    orderId: string;
}) {
    const supabase = await createAdminClient();

    // 1. Get order
    const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

    if (orderError || !order) {
        throw new Error("Order not found.");
    }


    // 2. Must be paid
    if (order.status !== "PAID") {
        throw new Error("Order is not paid.");
    }

    // 3. Idempotency
    const {
        data: existingSubscription,
        error: existingError,
    } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("order_id", order.id)
        .maybeSingle();


    if (existingError) {
        throw existingError;
    }


    if (existingSubscription) {

        // Ensure reverse relation exists
        if (order.subscription_id !== existingSubscription.id) {

            const { error: linkError } = await supabase
                .from("orders")
                .update({
                    subscription_id: existingSubscription.id,
                })
                .eq("id", order.id);


            if (linkError) {
                throw linkError;
            }
        }
        return existingSubscription;
    }

    const now = new Date().toISOString();

    const { data: subscription, error } = await supabase
        .from("subscriptions")
        .insert({
            order_id: order.id,
            profile_id: order.profile_id,
            system_id: order.system_id,

            // Snapshot from Order
            plan_name:
                order.license_type === "SUBSCRIPTION"
                    ? order.plan ?? "STARTER"
                    : order.license_type,

            license_type: order.license_type,

            billing_interval:
                order.license_type === "SUBSCRIPTION"
                    ? "MONTHLY"
                    : "ONE_TIME",

            price: order.amount,
            currency: order.currency,

            status: "ACTIVE",

            start_date: now,

            auto_renew:
                order.license_type === "SUBSCRIPTION",
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    // 5. Link order -> subscription
    const { error: orderUpdateError } = await supabase
        .from("orders")
        .update({
            subscription_id: subscription.id,
        })
        .eq("id", order.id);



    if (orderUpdateError) {
        throw orderUpdateError;
    }



    return subscription;
}
