import { CreatePlatformStaffInput, PlatformStaff } from "@/shared/lib/schemas/graphood-staff.schema";
import { SupabaseClient } from "@supabase/supabase-js";

interface AddPlatformStaffParams {
    supabase: SupabaseClient;
    payload: CreatePlatformStaffInput;
}

export async function addPlatformStaffService({
    supabase,
    payload,
}: AddPlatformStaffParams): Promise<PlatformStaff> {
    const { data, error } = await supabase
        .from("platform_staff")
        .insert({
            profile_id: payload.profileId,
            role: payload.role,
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data as PlatformStaff;
}