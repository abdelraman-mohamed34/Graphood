import { DeveloperApiErrorCodes } from "@/shared/lib/api/developer/errors";
import { requireSubscription } from "@/shared/lib/auth/requires/require-subscription";
import type { Subscription } from "@/shared/lib/schemas/subscriptions.schema";


export function requireApiAccess(
    context: {
        subscription: {
            plan: string;
            status: string;
            licenseType: string;
        } | null;
    }
) {

    const capabilities = requireSubscription({
        plan_name: context.subscription?.plan,
        status: context.subscription?.status,
        license_type: context.subscription?.licenseType,
    } as Partial<Subscription> as Subscription);


    if (!capabilities.isActive) {
        throw new Error(DeveloperApiErrorCodes.SUBSCRIPTION_INACTIVE);
    }


    if (!capabilities.limits.api) {
        throw new Error(DeveloperApiErrorCodes.API_ACCESS_DENIED);
    }


    return capabilities;
}
