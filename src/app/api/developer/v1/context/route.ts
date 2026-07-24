import { withDeveloperContext } from "@/shared/lib/api/developer/with-developer-context";
import { developerSuccess } from "@/shared/lib/api/developer/response";
import { mapDeveloperContext } from "@/shared/lib/api/developer/map-developer-context";
import { DeveloperApiErrorCodes } from "@/shared/lib/api/developer/errors";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { getSystemById } from "@/shared/lib/supabase/services/systems";

export const POST = withDeveloperContext(
    async (context) => {
        const supabase =
            await createSupabaseServerClient();

        const system = await getSystemById(
            context.systemId,
            supabase
        );

        if (!system) {
            throw new Error(
                DeveloperApiErrorCodes.SYSTEM_NOT_FOUND
            );
        }

        return Response.json(
            developerSuccess(
                mapDeveloperContext(
                    context,
                    {
                        system: {
                            id: system.id,
                            name: system.name,
                            slug: system.slug,
                        },
                    }
                )
            )
        );
    }
);