import { createAdminClient } from "../../admin";

export async function resolvePayment({
    providerReference,
}: {
    providerReference: string;
}) {
    const supabase = createAdminClient();

    if (!providerReference) {
        throw new Error("Provider reference is required.");
    }

    const { data: payment, error } = await supabase
        .from("payments")
        .select(`
            id,
            order_id,
            provider,
            provider_reference,
            transaction_ref,
            amount,
            currency,
            status
        `)
        .eq("provider_reference", providerReference)
        .single();


    if (error || !payment) {
        throw new Error(
            "Payment not found for provider reference."
        );
    }


    return {
        payment,
        orderId: payment.order_id,
    };
}