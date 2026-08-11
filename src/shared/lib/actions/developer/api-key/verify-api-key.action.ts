"use server";

import { hashApiKey } from "@/lib/utils/developer/hash-api-key";

import {
    getApiKeyByHash,
    updateApiKeyLastUsed,
} from "@/shared/lib/supabase/services/developer/api-keys";
import { DeveloperApiErrorCodes } from "@/shared/lib/api/developer/errors";

export async function verifyApiKeyAction(
    apiKey: string
) {
    if (!apiKey) {
        throw new Error(DeveloperApiErrorCodes.INVALID_API_KEY);
    }
    const hash = hashApiKey(apiKey);
    const record = await getApiKeyByHash(hash);
    if (!record) {
        throw new Error(DeveloperApiErrorCodes.INVALID_API_KEY);
    }
    if (!record.is_active) {
        throw new Error(DeveloperApiErrorCodes.API_KEY_DISABLED);
    }

    if (
        record.expires_at &&
        new Date(record.expires_at) < new Date()
    ) {
        throw new Error(DeveloperApiErrorCodes.API_KEY_EXPIRED);
    }
    await updateApiKeyLastUsed(record.id);

    return {
        id: record.id,
        systemId: record.system_id,
        name: record.name,
        isActive: record.is_active,
        expiresAt: record.expires_at,
    };
}
