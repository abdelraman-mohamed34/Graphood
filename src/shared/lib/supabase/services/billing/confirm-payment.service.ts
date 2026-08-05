import { createAdminClient } from "../../admin";

import { provisionOrder } from "../order/provision-order.service";
import { applyCoupon } from "../coupons/apply-coupon.service";

async function finalizePayment(
    orderId: string,
    transactionRef: string
) {
    const supabase = createAdminClient();
    const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("id, status, coupon_id, profile_id, system_id")
        .eq("id", orderId)
        .single();

    if (orderError || !order) throw orderError ?? new Error("Order not found.");
    if (order.status !== "PENDING" && order.status !== "PAID") {
        throw new Error("Order is not pending.");
    }

    const now = new Date().toISOString();
    let paidOrder = order;

    if (order.status === "PENDING") {
        const { data: payment, error: paymentError } = await supabase
            .from("payments")
            .update({
                status: "SUCCESS",
                transaction_ref: transactionRef,
                paid_at: now,
                updated_at: now,
            })
            .eq("order_id", order.id)
            .select("id")
            .maybeSingle();

        if (paymentError || !payment) {
            throw paymentError ?? new Error("Payment not found.");
        }

        const { data: updatedOrder, error: updateError } = await supabase
            .from("orders")
            .update({ status: "PAID", updated_at: now })
            .eq("id", order.id)
            .eq("status", "PENDING")
            .select("id, status, coupon_id, profile_id, system_id")
            .maybeSingle();

        if (updateError) throw updateError;

        if (updatedOrder) {
            paidOrder = updatedOrder;
        } else {
            const { data: concurrentOrder, error: concurrentOrderError } = await supabase
                .from("orders")
                .select("id, status, coupon_id, profile_id, system_id")
                .eq("id", order.id)
                .eq("status", "PAID")
                .single();

            if (concurrentOrderError || !concurrentOrder) {
                throw concurrentOrderError ?? new Error("Payment finalization failed.");
            }
            paidOrder = concurrentOrder;
        }
    }

    if (paidOrder.coupon_id) {
        await applyCoupon({
            supabase,
            couponId: paidOrder.coupon_id,
            orderId: paidOrder.id,
            profileId: paidOrder.profile_id,
            systemId: paidOrder.system_id,
        });
    }

    return paidOrder;
}

export async function confirmOrderPayment(
    orderId: string,
    transactionRef: string
) {
    if (!transactionRef.trim()) {
        throw new Error("Invalid transaction reference.");
    }

    const updatedOrder = await finalizePayment(orderId, transactionRef.trim());

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
