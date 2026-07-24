'use server'

import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { fetchUser } from "@/shared/lib/supabase/services/auth/user/fetch-user.service";
import { listSystems } from "@/shared/lib/supabase/services/systems";

export async function listSystemsAction() {
    const supabase = await createSupabaseServerClient();
    const user = await fetchUser(supabase);

    if (!user) {
        throw new Error("system error: required user");
    }

    return await listSystems(supabase, user.id);
}