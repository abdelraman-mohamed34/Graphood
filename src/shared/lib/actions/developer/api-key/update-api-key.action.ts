"use server";

import { getSystemAction } from "@/shared/lib/actions/developer/systems";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

import {
    DeveloperApiKeyUpdate,
    DeveloperApiKeyUpdateSchema,
} from "@/shared/lib/schemas/developer/api-keys";

import {
    getApiKey,
    updateApiKey,
} from "@/shared/lib/supabase/services/developer/api-keys";
import { z } from "zod";

export async function updateApiKeyAction(
    id: string,
    data: DeveloperApiKeyUpdate
): Promise<{ success: true }> {

    const keyId = z.string().uuid().parse(id);
    const payload = DeveloperApiKeyUpdateSchema.omit({ system_id: true }).parse(data);
    const supabase = await createSupabaseServerClient();

    const currentApiKey = await getApiKey(keyId);

    if (!currentApiKey) {
        throw new Error("API_KEY_NOT_FOUND");
    }

    await getSystemAction(
        currentApiKey.system_id,
        supabase
    );

    await updateApiKey(
        keyId,
        payload
    );
    return { success: true };
}
