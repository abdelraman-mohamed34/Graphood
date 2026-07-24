import type { SupabaseClient } from "@supabase/supabase-js";

export async function updateInvitationByToken(
    supabase: SupabaseClient,
    token: string,
    status: 'ACCEPTED' | 'REJECTED' | 'CANCELLED'
) {
    console.log(`[Debug] Attempting to update invitation with token: ${token} to status: ${status}`);

    const { data, error, count } = await supabase
        .from('invitations')
        .update({
            status: status,
            updated_at: new Date().toISOString()
        })
        .eq('token', token)
        .select();

    if (error) {
        console.error('[Supabase Error inside function]:', error);
        return { data: null, error };
    }

    if (!data || data.length === 0) {
        console.warn(`[Supabase Warning]: No invitation found matching token: "${token}". 0 rows updated.`);
        return {
            data: null,
            error: new Error(`No invitation found with the provided token.`)
        };
    }

    console.log('[Supabase Success]: Invitation updated successfully!', data[0]);
    return { data: data[0], error: null };
}