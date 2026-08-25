import "server-only";

import { z } from "zod";

import { createAdminClient } from "../../admin";

const provisionOrderResultSchema = z.object({
    subscription_id: z.string().uuid(),
    tenant_id: z.string().uuid(),
    membership_id: z.string().uuid(),
    is_existing: z.boolean(),
});

export async function provisionOrder({
    orderId,
    webhookEventId,
}: {
    orderId: string;
    webhookEventId?: string | null;
}) {
    const { data, error } = await createAdminClient().rpc("provision_paid_order_atomic", {
        p_order_id: orderId,
        p_webhook_event_id: webhookEventId ?? null,
    });

    if (error) throw error;

    const parsed = provisionOrderResultSchema.safeParse(data?.[0]);
    if (!parsed.success) {
        throw new Error("Invalid provisioning response from database.");
    }

    return {
        subscription: { id: parsed.data.subscription_id },
        tenant: { id: parsed.data.tenant_id },
        membership: { id: parsed.data.membership_id },
        isExisting: parsed.data.is_existing,
    };
}
