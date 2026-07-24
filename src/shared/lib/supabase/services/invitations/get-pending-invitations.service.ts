import { SupabaseClient } from '@supabase/supabase-js'

type Props = {
    supabase: SupabaseClient
    tenantId: string
}

export async function getPendingInvitations({
    supabase,
    tenantId,
}: Props) {
    const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('status', 'PENDING')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })

    if (error) {
        throw error
    }

    return data
}