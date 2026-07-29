"use server";

import { getSystemAction } from "@/shared/lib/actions/developer/systems";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

import {
    DeveloperApiKey,
    DeveloperApiKeyUpdate,
} from "@/shared/lib/schemas/developer/api-keys";

import {
    getApiKey,
    updateApiKey,
} from "@/shared/lib/supabase/services/developer/api-keys";

export async function updateApiKeyAction(
    id: string,
    data: DeveloperApiKeyUpdate
): Promise<DeveloperApiKey> {

    const supabase = await createSupabaseServerClient();

    const currentApiKey = await getApiKey(id);

    if (!currentApiKey) {
        throw new Error("API_KEY_NOT_FOUND");
    }

    await getSystemAction(
        currentApiKey.system_id,
        supabase
    );

    return updateApiKey(
        id,
        data
    );
}