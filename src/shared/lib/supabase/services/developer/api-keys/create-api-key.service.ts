import { generateApiKey } from "@/lib/utils/developer/generate-api-key";
import { hashApiKey } from "@/lib/utils/developer/hash-api-key";

import {
    DeveloperApiKey,
    DeveloperApiKeyInsert,
} from "@/shared/lib/schemas/developer/api-keys";

import { encryptApiKey } from "@/lib/utils/developer/encrypt-api-key";
import { createSupabaseServerClient } from "../../../server";

export async function createApiKey(
    data: DeveloperApiKeyInsert
): Promise<{
    apiKey: string;
    record: DeveloperApiKey;
}> {
    const apiKey = generateApiKey();
    const key_hash = hashApiKey(apiKey);
    const encrypted_key = encryptApiKey(apiKey);

    const payload = {
        ...data,
        expires_at: data.expires_at?.toISOString() ?? null,
        key_hash,
        encrypted_key,
    };

    const supabase = await createSupabaseServerClient();

    const { data: record, error } = await supabase
        .from("developer_api_keys")
        .insert([payload])
        .select()
        .single();

    if (error) {
        console.error("Error creating API key:", error);
        throw error;
    }

    return {
        apiKey,
        record,
    };
}
