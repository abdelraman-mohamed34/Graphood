'use server'

import { revalidatePath } from 'next/cache'
import { updateInvitationByToken } from '../../supabase/services/invitations/update-invitation-by-token.service'
import { createAdminClient } from '../../supabase/admin'
import { createHash } from 'crypto'
import { z } from 'zod'
import { getInvitationByToken } from '../../supabase/services/invitations/get-Invitation-by-token.service'
import { getWhatByFrom } from '../../supabase/services/get-what-by-from.service'

const rejectInvitationSchema = z.object({
    token: z.string().min(32).max(512),
    tenant: z.string().trim().min(1).max(100),
}).strict()

export async function rejectInvitationAction(token: string, tenant: string) {
    try {
        const input = rejectInvitationSchema.parse({ token, tenant })
        const supabase = await createAdminClient()
        const tokenHash = createHash('sha256')
            .update(input.token)
            .digest('hex')

        const invitation = await getInvitationByToken(supabase, tokenHash)
        if (!invitation) {
            return { success: false, message: 'Invitation not found or has expired.' }
        }
        const tenantSlug = await getWhatByFrom<string>(
            supabase, 'slug', invitation.tenant_id, 'id', 'tenants'
        )
        if (tenantSlug !== input.tenant) {
            return { success: false, message: 'Invalid invitation link.' }
        }

        await updateInvitationByToken(supabase, tokenHash, 'REJECTED')

        revalidatePath(`/invitations/accept`)

        return {
            success: true,
            message: 'Invitation rejected successfully.',
        }

    } catch {
        return {
            success: false,
            message: 'An unexpected error occurred.'
        }
    }
}
