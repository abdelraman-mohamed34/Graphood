import type { DeveloperContext } from "@/shared/lib/types/developer";
import type { DeveloperContextResponse } from "./context-response.contract";

interface MapDeveloperContextOptions {
    system: {
        id: string;
        name: string;
        slug: string;
        description: string;
        category: string;
        icon_url: string | null;
        is_public: boolean;
    };
}

export function mapDeveloperContext(
    context: DeveloperContext,
    options: MapDeveloperContextOptions
): DeveloperContextResponse {
    return {
        system: options.system,

        tenant: {
            id: context.tenantId,
            slug: context.tenantSlug,
        },

        subscription: {
            plan: context.subscription.plan,
            status: context.subscription.status,
            licenseType: context.subscription.licenseType,
            billingInterval: context.subscription.billingInterval,
        },

        capabilities: context.capabilities,
    };
}