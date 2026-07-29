"use server";

import { getSystemAction } from "@/shared/lib/actions/developer/systems";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

import {
    getApiKey,
    deleteApiKey,
} from "@/shared/lib/supabase/services/developer/api-keys";

export async function deleteApiKeyAction(
    id: string
): Promise<void> {

    const supabase = await createSupabaseServerClient();

    const currentApiKey = await getApiKey(id);

    if (!currentApiKey) {
        throw new Error("API_KEY_NOT_FOUND");
    }

    await getSystemAction(
        currentApiKey.system_id,
        supabase
    );

    await deleteApiKey(id);
}