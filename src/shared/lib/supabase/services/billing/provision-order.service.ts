import { createMembershipFromTenant } from "./create-membership-from-tenant.service";
import { createSubscription } from "./create-subscription.service";
import { createTenantFromSubscription } from "./create-tenant-from-subscription.service";

export async function provisionOrder({
    orderId,
}: {
    orderId: string;
}) {

    console.log("PROVISION START", orderId);
    const subscription = await createSubscription({
        orderId,
    });

    console.log(
        "SUBSCRIPTION CREATED",
        subscription.id
    );

    const tenant = await createTenantFromSubscription({
        subscriptionId: subscription.id,
    });


    console.log(
        "TENANT CREATED",
        tenant.id
    );


    const membership =
        await createMembershipFromTenant({
            tenantId: tenant.id,
        });

    console.log(
        "MEMBERSHIP CREATED",
        membership.id
    );

    return {
        subscription,
        tenant,
        membership,
    };
}