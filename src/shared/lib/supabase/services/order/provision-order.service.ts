import { createAdminClient } from "../../admin";

export async function provisionOrder({
    orderId,
    webhookEventId = null,
}: {
    orderId: string;
    webhookEventId?: string | null;
}) {
    const { data, error } = await createAdminClient().rpc("provision_paid_order_atomic", {
        p_order_id: orderId,
        p_webhook_event_id: webhookEventId,
    });
    if (error) throw error;
    return data?.[0] ?? null;
}
