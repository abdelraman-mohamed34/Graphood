"use server";

import { getSystemAction } from "@/shared/lib/actions/developer/systems";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

import {
    DeveloperApiKey,
} from "@/shared/lib/schemas/developer/api-keys";

import {
    createApiKey,
    deleteApiKey,
    getApiKey,
} from "@/shared/lib/supabase/services/developer/api-keys";


export async function regenerateApiKeyAction(
    id: string
): Promise<{
    apiKey: string;
    record: DeveloperApiKey;
}> {
    const supabase =
        await createSupabaseServerClient();

    const currentApiKey =
        await getApiKey(id);

    if (!currentApiKey) {
        throw new Error(
            "API_KEY_NOT_FOUND"
        );
    }

    // Authorization check
    await getSystemAction(
        currentApiKey.system_id,
        supabase
    );

    const result =
        await createApiKey({
            system_id: currentApiKey.system_id,
            name: currentApiKey.name,
            is_active: currentApiKey.is_active,
            expires_at: currentApiKey.expires_at,
        });

    await deleteApiKey(
        currentApiKey.id
    );

    return result;
}