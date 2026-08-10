import "server-only";

import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { checkPlatformRoleService } from "@/shared/lib/supabase/services/platform-staff";

export async function authorizeSuperAdmin() {
    const supabase = await createSupabaseServerClient();
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user) throw new Error("auth.unauthorized");

    const role = await checkPlatformRoleService({
        supabase,
        profileId: user.id,
    });

    if (role !== "SUPER_ADMIN") throw new Error("auth.superAdminRequired");

    return { supabase, user };
}
