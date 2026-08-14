import { createAdminClient } from "../../admin";

export type KashierPaymentStatus = "SUCCESS" | "PAID" | "COMPLETED" | "FAILED" | "CANCELED" | "CANCELLED";

export async function processKashierPayment(input: { orderId: string; transactionRef: string; amount: number; currency: string; status: KashierPaymentStatus }) {
    const { data, error } = await createAdminClient().rpc("process_kashier_payment_atomic", {
        p_order_id: input.orderId,
        p_transaction_ref: input.transactionRef,
        p_amount: input.amount,
        p_currency: input.currency,
        p_status: input.status,
    });
    if (error) throw error;
    return data;
}
