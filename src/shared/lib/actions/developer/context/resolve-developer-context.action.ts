import { verifyApiKeyAction } from "@/shared/lib/actions/developer/api-key/verify-api-key.action";
import { getTenantBySlug } from "@/shared/lib/supabase/services/tenants/get-tenant-by-slug.service";
import { getSubscriptionById } from "@/shared/lib/supabase/services/subscriptions";
import { requireSubscription } from "@/shared/lib/auth/requires/require-subscription";
import { DeveloperApiErrorCodes } from "@/shared/lib/api/developer/errors";
import { createAdminClient } from "@/shared/lib/supabase/admin";

interface ResolveDeveloperContextInput {
    apiKey: string;
    tenantSlug: string;
}

export async function resolveDeveloperContextAction(
    input: ResolveDeveloperContextInput
) {
    const { apiKey, tenantSlug } = input;

    if (!apiKey) {
        throw new Error(
            DeveloperApiErrorCodes.INVALID_API_KEY
        );
    }

    if (!tenantSlug) {
        throw new Error(
            DeveloperApiErrorCodes.TENANT_NOT_FOUND
        );
    }

    const admin = createAdminClient();
    const [apiKeyContext, tenant] = await Promise.all([
        verifyApiKeyAction(apiKey),
        getTenantBySlug(admin, tenantSlug),
    ]);

    if (!tenant) {
        throw new Error(
            DeveloperApiErrorCodes.TENANT_NOT_FOUND
        );
    }

    if (tenant.system_id !== apiKeyContext.systemId) {
        throw new Error(
            DeveloperApiErrorCodes.TENANT_NOT_ALLOWED
        );
    }

    if (!tenant.subscription_id) {
        throw new Error(
            DeveloperApiErrorCodes.SUBSCRIPTION_INACTIVE
        );
    }

    const subscription = await getSubscriptionById(admin, tenant.subscription_id);

    if (!subscription) {
        throw new Error(
            DeveloperApiErrorCodes.SUBSCRIPTION_INACTIVE
        );
    }
    const subscriptionCapabilities = requireSubscription(subscription);

    return {
        mode: "live" as const,
        systemId: apiKeyContext.systemId,
        tenantId: tenant.id,
        tenantSlug: tenant.slug,

        subscription: {
            plan: subscriptionCapabilities.planName,
            status: subscription.status ?? "EXPIRED",
            licenseType: subscriptionCapabilities.licenseType,
            billingInterval: subscription.billing_interval,
        },

        capabilities: {
            api: subscriptionCapabilities.limits.api,
            reports: subscriptionCapabilities.limits.hasReports,
            wordAssistant: subscriptionCapabilities.limits.hasWordAssistant,
        },
    };
}
