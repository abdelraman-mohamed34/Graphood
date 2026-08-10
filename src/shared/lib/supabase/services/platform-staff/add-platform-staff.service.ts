import type {
    CreatePlatformStaffInput,
    PlatformStaff,
} from "@/shared/lib/schemas/graphood-staff.schema";
import type { SupabaseClient } from "@supabase/supabase-js";

interface AddPlatformStaffParams {
    supabase: SupabaseClient;
    payload: CreatePlatformStaffInput;
}

export async function addPlatformStaffService({
    supabase,
    payload,
}: AddPlatformStaffParams): Promise<PlatformStaff> {
    let profileId = payload.profileId;
    let email: string | null = payload.email ?? null;

    if (payload.email) {
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("id, email")
            .ilike("email", payload.email)
            .maybeSingle();

        if (profileError) {
            throw new Error(`profiles.lookupFailed: ${profileError.message}`);
        }
        if (!profile) {
            throw new Error("profiles.notFound");
        }
        if (profileId && profile.id !== profileId) {
            throw new Error("profiles.identifierMismatch");
        }

        profileId = profile.id;
        email = profile.email;
    }

    if (!profileId) {
        throw new Error("validation.identifierRequired");
    }

    if (!email) {
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("email")
            .eq("id", profileId)
            .maybeSingle();

        if (profileError) {
            throw new Error(`profiles.lookupFailed: ${profileError.message}`);
        }
        if (!profile) {
            throw new Error("profiles.notFound");
        }
        email = profile.email;
    }

    const { data, error } = await supabase
        .from("platform_staff")
        .insert({ profile_id: profileId, role: payload.role })
        .select("id, profile_id, role, created_at")
        .single();

    if (error) {
        throw new Error(`staff.addFailed: ${error.message}`);
    }

    return {
        id: data.id,
        profileId: data.profile_id,
        email,
        role: data.role,
        createdAt: data.created_at,
    } as PlatformStaff;
}
