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
import { z } from "zod";


export async function regenerateApiKeyAction(
    id: string
): Promise<{
    apiKey: string;
    record: Pick<DeveloperApiKey, "id" | "system_id" | "name" | "is_active" | "expires_at" | "created_at">;
}> {
    const keyId = z.string().uuid().parse(id);
    const supabase =
        await createSupabaseServerClient();

    const currentApiKey =
        await getApiKey(keyId);

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
            expires_at: currentApiKey.expires_at
                ? new Date(currentApiKey.expires_at)
                : null,
        });

    await deleteApiKey(
        currentApiKey.id
    );

    const { id: recordId, system_id, name, is_active, expires_at, created_at } = result.record;
    return {
        apiKey: result.apiKey,
        record: { id: recordId, system_id, name, is_active, expires_at, created_at },
    };
}
