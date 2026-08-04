import { createAdminClient } from "../../admin";

import { provisionOrder } from "./provision-order.service";

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
    const updatedOrder = Array.isArray(data) ? data[0] : data;
    if (error || !updatedOrder) {
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
