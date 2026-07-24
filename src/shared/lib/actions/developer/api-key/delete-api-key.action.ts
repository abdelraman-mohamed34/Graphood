import { deleteApiKey } from "@/shared/lib/supabase/services/developer/api-keys";

export async function deleteApiKeyAction(
    id: string
): Promise<void> {
    // TODO:
    // التحقق من صلاحيات المستخدم (Owner/Admin)
    // التحقق أن الـ API Key تتبع نفس الـ System

    await deleteApiKey(id);
}