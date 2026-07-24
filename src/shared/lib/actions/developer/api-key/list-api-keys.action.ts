import { getApiKeyBySystemId } from "@/shared/lib/supabase/services/developer/api-keys";

export async function listApiKeysAction(
    systemId: string
) {
    // TODO:
    // التحقق من صلاحيات المستخدم (Owner/Admin)

    const apiKeys =
        await getApiKeyBySystemId(systemId);

    return apiKeys.map((apiKey) => ({
        id: apiKey.id,
        name: apiKey.name,
        isActive: apiKey.is_active,
        lastUsedAt: apiKey.last_used_at,
        expiresAt: apiKey.expires_at,
        createdAt: apiKey.created_at,
    }));
}