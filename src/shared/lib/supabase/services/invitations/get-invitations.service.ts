import { SupabaseClient } from '@supabase/supabase-js'

type Props = {
    supabase: SupabaseClient
    tenantId: string
    email: string
}

export async function getPendingInvitationByEmail({
    supabase,
    tenantId,
    email,
}: Props) {
    const { data, error } = await supabase
        .from('invitations')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('email', email)
        .eq('status', 'PENDING')
        .gt('expires_at', new Date().toISOString())
        .maybeSingle()

    if (error) {
        throw error
    }

    return data
}
