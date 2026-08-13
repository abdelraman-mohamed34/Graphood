"use server";

import {
    CreateSystemInput,
    createSystemSchema,
} from "@/shared/lib/schemas/systems.schema";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { fetchUser } from "@/shared/lib/supabase/services/auth/user/fetch-user.service";
import { createApiKey } from "@/shared/lib/supabase/services/developer/api-keys";
import { createSystem } from "@/shared/lib/supabase/services/systems";
import { sanitizeMarkdownSource } from "@/shared/lib/markdown";

export async function createSystemAction(
    data: CreateSystemInput
) {
    const supabase = await createSupabaseServerClient();

    const user = await fetchUser(supabase);

    if (!user) {
        throw new Error("Authentication required.");
    }

    const payload = createSystemSchema.parse(data);
    payload.readme = payload.readme ? sanitizeMarkdownSource(payload.readme) : "";

    const system = await createSystem(payload, user.id);

    const apiKey = await createApiKey({
        system_id: system.id,
        name: "Default API Key",
        is_active: true,
        expires_at: null,
    });

    return {
        system: { id: system.id },
        apiKey: apiKey.apiKey,
    };
}
