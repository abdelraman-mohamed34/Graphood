import { SupabaseClient } from '@supabase/supabase-js'
import type { Tables } from '@/shared/types/database.types'

export type PendingInvitationListItem = Pick<
    Tables<'invitations'>,
    'id' | 'email' | 'tenant_id' | 'role' | 'permissions' | 'status' |
    'expires_at' | 'created_at' | 'message'
>

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
        .select('id, email, tenant_id, role, permissions, status, expires_at, created_at, message')
        .eq('tenant_id', tenantId)
        .eq('status', 'PENDING')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })

    if (error) {
        throw error
    }

    return data satisfies PendingInvitationListItem[]
}
