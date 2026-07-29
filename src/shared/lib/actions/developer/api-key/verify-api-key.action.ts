"use server";

import { hashApiKey } from "@/lib/utils/developer/hash-api-key";

import {
    getApiKeyByHash,
    updateApiKeyLastUsed,
} from "@/shared/lib/supabase/services/developer/api-keys";

export async function verifyApiKeyAction(
    apiKey: string
) {
    if (!apiKey) {
        throw new Error("API Key is required");
    }
    const hash = hashApiKey(apiKey);
    const record = await getApiKeyByHash(hash);
    if (!record) {
        throw new Error("Invalid API Key");
    }
    if (!record.is_active) {
        throw new Error("API Key is disabled");
    }

    if (
        record.expires_at &&
        new Date(record.expires_at) < new Date()
    ) {
        throw new Error("API Key has expired");
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