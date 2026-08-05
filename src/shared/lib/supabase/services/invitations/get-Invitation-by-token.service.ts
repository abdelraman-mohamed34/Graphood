import { SupabaseClient } from '@supabase/supabase-js'

export async function getInvitationByToken(supabase: SupabaseClient, token: string) {

    const { data, error } = await supabase
        .from('invitations')
        .select('id, email, tenant_id, role, invited_by, status')
        .eq('token', token)
        .eq('status', "PENDING")
        .gt('expires_at', new Date().toISOString())
        .maybeSingle()

    if (error) {
        throw error
    }

    return data
}
