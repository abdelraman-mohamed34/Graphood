import type { SupabaseClient } from "@supabase/supabase-js";

export async function updateInvitationByToken(
    supabase: SupabaseClient,
    token: string,
    status: 'ACCEPTED' | 'REJECTED' | 'CANCELLED'
) {

    const { data, error } = await supabase
        .from('invitations')
        .update({
            status: status,
            updated_at: new Date().toISOString()
        })
        .eq('token', token)
        .select("id, status");

    if (error) throw new Error("invitations.updateFailed", { cause: error });

    if (!data || data.length === 0) {
        throw new Error("invitations.notFound");
    }

    return data[0];
}
