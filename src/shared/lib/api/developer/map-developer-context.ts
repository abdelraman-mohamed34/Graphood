import { DeveloperContext } from "./types";
import { DeveloperSystemInfo } from "./context-response.contract";

interface MapDeveloperContextOptions {
    system: {
        id: string;
        name: string;
        slug: string;
    };
}

export function mapDeveloperContext(
    context: DeveloperContext,
    options: MapDeveloperContextOptions
): DeveloperSystemInfo {
    return {
        system: {
            id: options.system.id,
            name: options.system.name,
            slug: options.system.slug,
        },

        tenant: {
            id: context.tenantId,
            slug: context.tenantSlug,
        },

        subscription: {
            planName: context.subscription.planName,
            status: context.subscription.status,
            licenseType: context.subscription.licenseType,
            billingInterval:
                context.subscription.billingInterval,
        },

        capabilities: {
            api: context.capabilities.api,
            reports: context.capabilities.reports,
            wordAssistant:
                context.capabilities.wordAssistant,
        },
    };
}