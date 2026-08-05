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

    if (error) {
        return { data: null, error };
    }

    if (!data || data.length === 0) {
        return {
            data: null,
            error: new Error(`No invitation found with the provided token.`)
        };
    }

    return { data: data[0], error: null };
}
