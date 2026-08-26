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
    try {
        const admin = createAdminClient();
        const { data, error } = await admin.rpc("provision_paid_order_atomic", {
            p_order_id: orderId,
            p_webhook_event_id: webhookEventId ?? null,
        });

        if (error) throw error;

        const parsed = provisionOrderResultSchema.safeParse(data?.[0]);
        if (!parsed.success) {
            throw new Error(`Invalid provisioning response from database: ${parsed.error.message}`);
        }

        return {
            subscription: { id: parsed.data.subscription_id },
            tenant: { id: parsed.data.tenant_id },
            membership: { id: parsed.data.membership_id },
            isExisting: parsed.data.is_existing,
        };
    } catch (error) {
        const details = error instanceof Error
            ? { name: error.name, message: error.message, stack: error.stack }
            : error;
        console.error("CRITICAL_PROVISION_ERROR:", JSON.stringify(details, null, 2));

        if (webhookEventId) {
            try {
                const { error: recordError } = await createAdminClient().rpc("mark_payment_webhook_event_failed", {
                    p_event_id: webhookEventId,
                    p_error: error instanceof Error ? error.message : JSON.stringify(error),
                });
                if (recordError) {
                    console.error("CRITICAL_PROVISION_ERROR: failed to record webhook failure", recordError);
                }
            } catch (recordError) {
                console.error("CRITICAL_PROVISION_ERROR: webhook failure recording threw", recordError);
            }
        }

        throw error;
    }
}
