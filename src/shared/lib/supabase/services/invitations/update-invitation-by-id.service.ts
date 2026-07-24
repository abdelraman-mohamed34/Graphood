import type { SupabaseClient } from '@supabase/supabase-js'

export async function updateInvitationById(
    supabase: SupabaseClient,
    id: string,
    status: 'ACCEPTED' | 'REJECTED' | 'CANCELLED'
) {
    const { data, error } = await supabase
        .from('invitations')
        .update({
            status,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

    if (error) {
        throw error
    }

    return data
}