import { createAdminClient } from "../../admin";

import { applyCoupon } from "../coupons";
import { provisionOrder } from "./provision-order.service";

export async function confirmOrderPayment(
    orderId: string,
    transactionRef: string
) {
    if (!transactionRef.trim()) {
        throw new Error("Invalid transaction reference.");
    }

    const supabase = createAdminClient();

    // --------------------------------------------------
    // 1. Load Order
    // --------------------------------------------------

    const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

    if (orderError || !order) {
        throw new Error("Order not found.");
    }

    // --------------------------------------------------
    // 2. Idempotency
    // --------------------------------------------------

    if (order.status === "PAID") {
        const provisioning = await provisionOrder({
            orderId: order.id,
        });

        return {
            order,
            ...provisioning,
        };
    }

    // --------------------------------------------------
    // 3. Load Payment
    // --------------------------------------------------

    const { data: payment, error: paymentFetchError } =
        await supabase
            .from("payments")
            .select("*")
            .eq("order_id", order.id)
            .single();

    if (paymentFetchError || !payment) {
        throw new Error("Payment not found.");
    }

    // --------------------------------------------------
    // 4. Update Payment
    // --------------------------------------------------

    const { error: paymentError } = await supabase
        .from("payments")
        .update({
            status: "SUCCESS",
            transaction_ref: transactionRef,
            paid_at: new Date().toISOString(),
        })
        .eq("id", payment.id);

    if (paymentError) {
        throw paymentError;
    }

    // --------------------------------------------------
    // 5. Update Order
    // --------------------------------------------------

    const {
        data: updatedOrder,
        error: updatedOrderError,
    } = await supabase
        .from("orders")
        .update({
            status: "PAID",
        })
        .eq("id", order.id)
        .select()
        .single();

    if (updatedOrderError || !updatedOrder) {
        throw (
            updatedOrderError ??
            new Error("Failed to update order.")
        );
    }

    // --------------------------------------------------
    // 6. Consume Coupon
    // --------------------------------------------------

    if (updatedOrder.coupon_id) {
        await applyCoupon({
            supabase,
            couponId: updatedOrder.coupon_id,
            orderId: updatedOrder.id,
            profileId: updatedOrder.profile_id,
            systemId: updatedOrder.system_id,
        });
    }

    // --------------------------------------------------
    // 7. Provision
    // --------------------------------------------------

    const provisioning = await provisionOrder({
        orderId: updatedOrder.id,
    });

    return {
        order: updatedOrder,
        ...provisioning,
    };
}