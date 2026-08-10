import { SystemRole } from "@/shared/lib/schemas/public/role-permissions";
import { SupabaseClient } from "@supabase/supabase-js";

interface CheckPlatformRoleParams {
    supabase: SupabaseClient;
    profileId: string;
}

export async function checkPlatformRoleService({
    supabase,
    profileId,
}: CheckPlatformRoleParams): Promise<SystemRole | null> {
    const { data, error } = await supabase
        .from("platform_staff")
        .select("role")
        .eq("profile_id", profileId)
        .maybeSingle();

    if (error || !data) {
        return null;
    }

    return data.role as SystemRole;
}