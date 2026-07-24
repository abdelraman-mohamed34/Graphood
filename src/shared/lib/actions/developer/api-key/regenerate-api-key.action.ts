import {
    DeveloperApiKey,
} from "@/shared/lib/schemas/developer/api-keys";
import { createApiKey, deleteApiKey, getApiKey } from "@/shared/lib/supabase/services/developer/api-keys";

export async function regenerateApiKeyAction(
    id: string
): Promise<{
    apiKey: string;
    record: DeveloperApiKey;
}> {
    // TODO:
    // التحقق من صلاحيات المستخدم (Owner/Admin)
    // التحقق أن المفتاح يتبع نفس الـ System

    const currentApiKey = await getApiKey(id);

    if (!currentApiKey) {
        throw new Error("API_KEY_NOT_FOUND");
    }

    const result = await createApiKey({
        system_id: currentApiKey.system_id,
        name: currentApiKey.name,
        is_active: currentApiKey.is_active,
        expires_at: currentApiKey.expires_at,
    });

    await deleteApiKey(currentApiKey.id);

    return result;
}