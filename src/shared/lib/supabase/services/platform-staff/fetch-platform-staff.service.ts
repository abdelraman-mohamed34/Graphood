import type { PlatformStaff } from "@/shared/lib/schemas/graphood-staff.schema";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function fetchPlatformStaffService({
    supabase,
}: {
    supabase: SupabaseClient;
}): Promise<PlatformStaff[]> {
    const { data: staffRows, error: staffError } = await supabase
        .from("platform_staff")
        .select("id, profile_id, role, created_at")
        .order("created_at", { ascending: false });

    if (staffError) {
        throw new Error(`staff.fetchFailed: ${staffError.message}`);
    }
    if (!staffRows?.length) return [];

    const profileIds = staffRows.map((row) => row.profile_id);
    const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", profileIds);

    if (profilesError) {
        throw new Error(`profiles.lookupFailed: ${profilesError.message}`);
    }

    const emailByProfileId = new Map(
        (profiles ?? []).map((profile) => [profile.id, profile.email]),
    );

    return staffRows.map((row) => ({
        id: row.id,
        profileId: row.profile_id,
        email: emailByProfileId.get(row.profile_id) ?? null,
        role: row.role,
        createdAt: row.created_at,
    })) as PlatformStaff[];
}
