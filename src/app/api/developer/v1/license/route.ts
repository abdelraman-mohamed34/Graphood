import { withDeveloperContext } from "@/shared/lib/api/developer/with-developer-context";
import { developerSuccess } from "@/shared/lib/api/developer/response";


export const GET = withDeveloperContext(
    async (context) => {

        return Response.json(
            developerSuccess({

                plan:
                    context.subscription.planName,

                status:
                    context.subscription.status,

                licenseType:
                    context.subscription.licenseType,


                capabilities: {
                    api:
                        context.capabilities.api,

                    reports:
                        context.capabilities.reports,

                    wordAssistant:
                        context.capabilities.wordAssistant,
                }

            })
        );

    }
);