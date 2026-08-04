import { withDeveloperContext } from "@/shared/lib/api/developer/with-developer-context";
import {
    developerJson,
    developerJsonError,
} from "@/shared/lib/api/developer/response";
import { DeveloperApiErrorCodes } from "@/shared/lib/api/developer/errors";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { getSystemById } from "@/shared/lib/supabase/services/systems";
import { mapDeveloperContext } from "@/shared/lib/api/developer/map-developer-context";

export const GET = withDeveloperContext(
    async (context) => {
        const supabase = await createSupabaseServerClient();

        const system = await getSystemById(
            context.systemId,
            supabase
        );

        if (!system) {
            return developerJsonError(
                DeveloperApiErrorCodes.SYSTEM_NOT_FOUND,
                "System not found",
                404
            );
        }

        return developerJson(
            mapDeveloperContext(context, {
                system: {
                    id: system.id,
                    name: system.name,
                    slug: system.slug,
                    description: system.description,
                    category: system.category,
                    icon_url: system.icon_url,
                    is_public: system.is_public,
                }
            })
        );
    }
);