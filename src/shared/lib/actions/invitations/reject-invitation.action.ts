'use server'

import { revalidatePath } from 'next/cache'
import { updateInvitationByToken } from '../../supabase/services/invitations/update-invitation-by-token.service'
import { createAdminClient } from '../../supabase/admin'
import { createHash } from 'crypto'

export async function rejectInvitationAction(token: string, tenant: string) {
    try {
        const supabase = await createAdminClient()
        const tokenHash = createHash('sha256')
            .update(token)
            .digest('hex')

        const { data, error } = await updateInvitationByToken(supabase, tokenHash, 'REJECTED')

        if (error) {
            console.error('[Supabase Error] Rejecting invitation failed:', error)
            return {
                success: false,
                message: 'Could not reject the invitation.'
            }
        }

        revalidatePath(`/invitations/accept`)

        return {
            success: true,
            message: 'Invitation rejected successfully.',
            data
        }

    } catch (error) {
        console.error('[Server Action Error]:', error)
        return {
            success: false,
            message: 'An unexpected error occurred.'
        }
    }
}