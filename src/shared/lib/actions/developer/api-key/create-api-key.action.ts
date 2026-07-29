"use server";

import { getSystemAction } from "@/shared/lib/actions/developer/systems";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

import {
    DeveloperApiKey,
    DeveloperApiKeyInsert,
} from "@/shared/lib/schemas/developer/api-keys";

import {
    createApiKey,
} from "@/shared/lib/supabase/services/developer/api-keys";

export async function createApiKeyAction(
    data: DeveloperApiKeyInsert
): Promise<{
    apiKey: string;
    record: DeveloperApiKey;
}> {

    const supabase = await createSupabaseServerClient();

    await getSystemAction(
        data.system_id,
        supabase
    );

    return createApiKey(data);
}