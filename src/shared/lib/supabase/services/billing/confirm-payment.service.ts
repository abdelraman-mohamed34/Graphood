import { createAdminClient } from "../../admin";

import { provisionOrder } from "../order/provision-order.service";
import { applyCoupon } from "../coupons/apply-coupon.service";

function isMissingFinalizePaymentRpc(error: { code?: string; message?: string } | null) {
    return error?.code === "PGRST202"
        || error?.message?.includes("finalize_order_payment")
        || error?.message?.includes("schema cache");
}

async function finalizePaymentWithoutRpc(
    orderId: string,
    transactionRef: string
) {
    const supabase = createAdminClient();
    const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

    if (orderError || !order) throw orderError ?? new Error("Order not found.");
    if (order.status === "PAID") return order;
    if (order.status !== "PENDING") throw new Error("Order is not pending.");

    if (order.coupon_id) {
        await applyCoupon({
            supabase,
            couponId: order.coupon_id,
            orderId: order.id,
            profileId: order.profile_id,
            systemId: order.system_id,
        });
    }

    const now = new Date().toISOString();
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
        .select()
        .maybeSingle();

    if (updateError) throw updateError;

    if (!updatedOrder) {
        const { data: paidOrder, error: paidOrderError } = await supabase
            .from("orders")
            .select("*")
            .eq("id", order.id)
            .eq("status", "PAID")
            .single();
        if (paidOrderError || !paidOrder) throw paidOrderError ?? new Error("Payment finalization failed.");
        return paidOrder;
    }

    return updatedOrder;
}

export async function confirmOrderPayment(
    orderId: string,
    transactionRef: string
) {
    if (!transactionRef.trim()) {
        throw new Error("Invalid transaction reference.");
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase.rpc("finalize_order_payment", {
        p_order_id: orderId,
        p_transaction_ref: transactionRef.trim(),
    });
    let updatedOrder = Array.isArray(data) ? data[0] : data;

    // Compatibility path for environments where the checked-in RPC migration
    // has not been deployed yet. The database function remains preferred
    // because it completes payment and coupon redemption atomically.
    if (error && isMissingFinalizePaymentRpc(error)) {
        updatedOrder = await finalizePaymentWithoutRpc(orderId, transactionRef.trim());
    } else if (error || !updatedOrder) {
        throw new Error(error?.message ?? "Failed to finalize payment.");
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
