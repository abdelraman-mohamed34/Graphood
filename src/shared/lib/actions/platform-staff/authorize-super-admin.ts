import "server-only";

import { checkPlatformRoleService } from "@/shared/lib/supabase/services/platform-staff";
import { requireUser } from "../../auth/requires/require-user";

export async function authorizeSuperAdmin() {
    const { user, supabase } = await requireUser()

    const role = await checkPlatformRoleService({
        supabase,
        profileId: user.id,
    });

    if (role !== "SUPER_ADMIN") throw new Error("auth.superAdminRequired");

    return { supabase, user };
}