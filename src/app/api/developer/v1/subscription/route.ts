import { withDeveloperContext } from "@/shared/lib/api/developer/with-developer-context";
import { developerJson } from "@/shared/lib/api/developer/response";

export const GET = withDeveloperContext(
    async (context) => {
        return developerJson({
            subscription: {
                plan: context.subscription.plan,
                status: context.subscription.status,
                licenseType: context.subscription.licenseType,
                billingInterval: context.subscription.billingInterval,
            },

            capabilities: {
                api: context.capabilities.api,
                reports: context.capabilities.reports,
                wordAssistant: context.capabilities.wordAssistant,
            },
        });
    }
);