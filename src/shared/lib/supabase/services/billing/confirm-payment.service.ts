import { createAdminClient } from "../../admin";

export interface ConfirmPaymobPaymentInput {
    paymobOrderId: number;
    transactionRef: string;
    amountCents: number;
    currency: "EGP";
}

/**
 * Payment confirmation and provisioning execute inside the database function.
 * This keeps duplicate webhook deliveries and partial failures transactional.
 */
export async function confirmOrderPayment({
    paymobOrderId,
    transactionRef,
    amountCents,
    currency,
}: ConfirmPaymobPaymentInput) {
    if (
        !Number.isSafeInteger(paymobOrderId) ||
        paymobOrderId <= 0 ||
        !Number.isSafeInteger(amountCents) ||
        amountCents <= 0 ||
        !transactionRef.trim()
    ) {
        throw new Error("Invalid payment confirmation.");
    }

    const { data, error } = await createAdminClient().rpc("confirm_paymob_payment", {
        p_paymob_order_id: paymobOrderId,
        p_transaction_ref: transactionRef.trim(),
        p_amount_cents: amountCents,
        p_currency: currency,
    });

    if (error) throw error;
    return data;
}

export async function failOrderPayment({
    paymobOrderId,
    amountCents,
    currency,
}: Omit<ConfirmPaymobPaymentInput, "transactionRef">) {
    const { data, error } = await createAdminClient().rpc("fail_paymob_payment", {
        p_paymob_order_id: paymobOrderId,
        p_amount_cents: amountCents,
        p_currency: currency,
    });
    if (error) throw error;
    return data;
}
