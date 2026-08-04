"use server";

import { getSystemAction } from "@/shared/lib/actions/developer/systems";
import { getApiKeyBySystemId } from "@/shared/lib/supabase/services/developer/api-keys";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { decryptApiKey } from "@/lib/utils/developer/decrypt-api-key";

export async function listApiKeysAction(
    systemId: string
) {
    const supabase = await createSupabaseServerClient();

    await getSystemAction(systemId, supabase);
    const apiKeys = await getApiKeyBySystemId(systemId);

    return apiKeys.map((apiKey) => {
        if (!apiKey.encrypted_key) {
            throw new Error("API key is missing encrypted key material.");
        }

        return {
        id: apiKey.id,
        name: apiKey.name,
        apiKey: decryptApiKey(apiKey.encrypted_key),
        isActive: apiKey.is_active,
        lastUsedAt: apiKey.last_used_at
            ? new Date(apiKey.last_used_at).toISOString()
            : null,
        expiresAt: apiKey.expires_at
            ? new Date(apiKey.expires_at).toISOString()
            : null,
        createdAt: new Date(
            apiKey.created_at
        ).toISOString(),
        updatedAt: new Date(
            apiKey.updated_at
        ).toISOString(),
        };
    });
}
