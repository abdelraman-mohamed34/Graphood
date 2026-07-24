import {
    DeveloperApiKey,
    DeveloperApiKeyInsert,
} from "@/shared/lib/schemas/developer/api-keys";
import { createApiKey } from "@/shared/lib/supabase/services/developer/api-keys";

export async function createApiKeyAction(
    data: DeveloperApiKeyInsert
): Promise<{
    apiKey: string;
    record: DeveloperApiKey;
}> {
    // TODO:
    // التحقق من صلاحيات المستخدم (Owner/Admin)
    // سيتم إضافته عند ربط Dashboard Authentication

    return createApiKey(data);
}