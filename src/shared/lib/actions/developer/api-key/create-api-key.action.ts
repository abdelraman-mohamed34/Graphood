"use server";

import { getSystemAction } from "@/shared/lib/actions/developer/systems";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

import {
    DeveloperApiKey,
    DeveloperApiKeyInsert,
    DeveloperApiKeyInsertSchema,
} from "@/shared/lib/schemas/developer/api-keys";

import {
    createApiKey,
} from "@/shared/lib/supabase/services/developer/api-keys";

export async function createApiKeyAction(
    data: DeveloperApiKeyInsert
): Promise<{
    apiKey: string;
    record: Pick<DeveloperApiKey, "id" | "system_id" | "name" | "is_active" | "expires_at" | "created_at">;
}> {
    const payload = DeveloperApiKeyInsertSchema.parse(data);
    const supabase = await createSupabaseServerClient();

    await getSystemAction(
        payload.system_id,
        supabase
    );

    const result = await createApiKey(payload);
    const { id, system_id, name, is_active, expires_at, created_at } = result.record;
    return { apiKey: result.apiKey, record: { id, system_id, name, is_active, expires_at, created_at } };
}
