import { withDeveloperContext } from "@/shared/lib/api/developer/with-developer-context";
import { developerSuccess, developerError } from "@/shared/lib/api/developer/response";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { DeveloperApiErrorCodes } from "@/shared/lib/api/developer/errors";
import { getSystemById } from "@/shared/lib/supabase/services/systems";


export const GET = withDeveloperContext(
    async (context) => {

        const supabase =
            await createSupabaseServerClient();


        const system =
            await getSystemById(
                context.systemId,
                supabase
            );

        if (!system) {
            return Response.json(
                developerError(
                    DeveloperApiErrorCodes.SYSTEM_NOT_FOUND,
                    "System not found"
                ), { status: 404 }
            );
        }

        return Response.json(
            developerSuccess({
                system: {
                    id: system.id,
                    name: system.name,
                    slug: system.slug,
                },
                tenant: {
                    id: context.tenantId,
                    slug: context.tenantSlug,
                },
                subscription: {
                    planName:
                        context.subscription.planName,
                    status:
                        context.subscription.status,
                    licenseType:
                        context.subscription.licenseType,
                }
            })
        );

    }
);