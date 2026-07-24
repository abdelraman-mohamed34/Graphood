import { randomBytes, createHash } from 'crypto'

import { SupabaseClient } from '@supabase/supabase-js'
import { CreateInvitationInput } from '@/shared/lib/schemas/inputs/invitation-inputs.schema'

type Props = {
    supabase: SupabaseClient
    tenantId: string
    invitedBy: string
    input: CreateInvitationInput
}

export async function createInvitation({
    supabase,
    tenantId,
    invitedBy,
    input,
}: Props) {

    const token = randomBytes(32).toString('hex')
    const tokenHash = createHash('sha256')
        .update(token)
        .digest('hex')

    const expiresAt = new Date()

    expiresAt.setDate(expiresAt.getDate() + 7)

    const { data, error } = await supabase
        .from('invitations')
        .insert({
            email: input.email,
            tenant_id: tenantId,
            role: input.role,
            permissions: input.permissions,
            message: input.message,
            invited_by: invitedBy,
            token: tokenHash,
            expires_at: expiresAt.toISOString(),
        })
        .select()
        .single()

    if (error) {
        throw error
    }

    return {
        invitation: data,
        token,
    }
}