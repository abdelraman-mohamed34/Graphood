import {
    DeveloperApiKey,
    DeveloperApiKeyUpdate,
} from "@/shared/lib/schemas/developer/api-keys";
import { updateApiKey } from "@/shared/lib/supabase/services/developer/api-keys";

export async function updateApiKeyAction(
    id: string,
    data: DeveloperApiKeyUpdate
): Promise<DeveloperApiKey> {
    // TODO:
    // التحقق من صلاحيات المستخدم (Owner/Admin)
    // التحقق أن الـ API Key تتبع نفس الـ System

    return updateApiKey(id, data);
}