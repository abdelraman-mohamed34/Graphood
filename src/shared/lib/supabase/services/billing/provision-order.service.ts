import { createMembershipFromTenant } from "./create-membership-from-tenant.service";
import { createSubscription } from "./create-subscription.service";
import { createTenantFromSubscription } from "./create-tenant-from-subscription.service";

export async function provisionOrder({
    orderId,
}: {
    orderId: string;
}) {
    const subscription = await createSubscription({
        orderId,
    });

    const tenant = await createTenantFromSubscription({
        subscriptionId: subscription.id,
    });

    const membership =
        await createMembershipFromTenant({
            tenantId: tenant.id,
        });

    return {
        subscription,
        tenant,
        membership,
    };
}