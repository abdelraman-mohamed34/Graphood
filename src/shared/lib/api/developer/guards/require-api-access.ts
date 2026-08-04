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
        throw {
            code: DeveloperApiErrorCodes.SUBSCRIPTION_INACTIVE,
            message: "Subscription is inactive",
        };
    }


    if (!capabilities.limits.api) {
        throw {
            code: DeveloperApiErrorCodes.API_ACCESS_DENIED,
            message: "API access is not available for this plan",
        };
    }


    return capabilities;
}
