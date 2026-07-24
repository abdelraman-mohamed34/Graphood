import { SupabaseClient } from '@supabase/supabase-js'

export async function getInvitationByToken(supabase: SupabaseClient, token: string) {

    const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('token', token)
        .eq('status', "PENDING")
        .gt('expires_at', new Date().toISOString())
        .maybeSingle()

    if (error) {
        throw error
    }

    return data
}