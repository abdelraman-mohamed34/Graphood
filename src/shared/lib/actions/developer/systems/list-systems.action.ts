"use server";

import { getApiKeyBySystemId } from "@/shared/lib/supabase/services/developer/api-keys";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { fetchUser } from "@/shared/lib/supabase/services/auth/user/fetch-user.service";

export async function listApiKeysAction(
    systemId: string
) {
    const supabase = await createSupabaseServerClient();

    const user = await fetchUser(supabase);

    if (!user) {
        throw new Error("Authentication required.");
    }

    const apiKeys = await getApiKeyBySystemId(systemId);
    return apiKeys.map((apiKey) => ({
        id: apiKey.id,
        name: apiKey.name,
        isActive: apiKey.is_active,
        lastUsedAt: apiKey.last_used_at,
        expiresAt: apiKey.expires_at,
        createdAt: apiKey.created_at,
    }));
}