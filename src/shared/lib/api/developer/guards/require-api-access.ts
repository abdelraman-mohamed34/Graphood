import { DeveloperApiErrorCodes } from "@/shared/lib/api/developer/errors";
import { requireSubscription } from "@/shared/lib/auth/requires/require-subscription";


export function requireApiAccess(
    context: {
        subscription: {
            planName: string;
            status: string;
            licenseType: string;
        } | null;
    }
) {

    const capabilities = requireSubscription({
        plan_name: context.subscription?.planName,
        status: context.subscription?.status,
        license_type: context.subscription?.licenseType,
    } as any);


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