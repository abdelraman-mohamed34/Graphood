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
    record: Pick<DeveloperApiKey, "id" | "system_id" | "name" | "is_active" | "expires_at" | "created_at">;
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
        .select("id, system_id, name, is_active, expires_at, created_at")
        .single();

    if (error) {
        throw error;
    }

    return {
        apiKey,
        record,
    };
}
