import { SupabaseClient } from '@supabase/supabase-js'

export async function getInvitationById(
    supabase: SupabaseClient,
    id: string
) {
    const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('id', id)
        .eq('status', 'PENDING')
        .gt('expires_at', new Date().toISOString())
        .maybeSingle()

    if (error) {
        throw error
    }

    return data
}