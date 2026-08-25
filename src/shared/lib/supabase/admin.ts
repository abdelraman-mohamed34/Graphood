// src/shared/lib/supabase/admin.ts
import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/shared/types/database.types";
import { getSupabaseAdminEnv } from "@/shared/lib/env/server";

export function createAdminClient() {
    const env = getSupabaseAdminEnv();

    return createClient<Database>(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.SUPABASE_SERVICE_ROLE_KEY,
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            },
        }
    );
}
