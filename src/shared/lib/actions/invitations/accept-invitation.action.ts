'use server'

import { revalidatePath } from 'next/cache'
import { updateInvitationByToken } from '../../supabase/services/invitations/update-invitation-by-token.service'
import { getInvitationByToken } from '../../supabase/services/invitations/get-Invitation-by-token.service'
import { fetchUser } from '../../supabase/services/auth/user/fetch-user.service'
import { redirect } from 'next/navigation'
import { createHash } from 'crypto'
import { insertMembership } from '../../supabase/services/memberships/insert-membership.service'
import { getWhatByFrom } from '../../supabase/services/get-what-by-from.service'
import { createAdminClient } from '../../supabase/admin'
import { createSupabaseServerClient } from '../../supabase/server'

export async function acceptInvitationAction(token: string, tenant: string) {
    let shouldRedirect = false
    const supabase = await createSupabaseServerClient()
    try {
        const user = await fetchUser(supabase)

        if (!user) {
            shouldRedirect = true
            throw new Error('AUTH_REQUIRED')
        }

        const supabaseAdmin = await createAdminClient()

        const tokenHash = createHash('sha256')
            .update(token)
            .digest('hex')

        const invitation = await getInvitationByToken(supabaseAdmin, tokenHash)
        if (!invitation) {
            return {
                success: false,
                message: 'Invitation not found or has expired.'
            }
        }

        if (invitation.email !== user.email) {
            return {
                success: false,
                message: 'This invitation was sent to a different email address.'
            }
        }

        if (invitation.status === 'ACCEPTED') {
            return { success: true, message: "Already accepted!" };
        }

        const tenantId = await getWhatByFrom<string>(
            supabaseAdmin,
            'id',
            tenant,
            'slug',
            'tenants'
        )

        if (!tenantId) {
            return {
                success: false,
                message: 'Workspace not found.'
            }
        }

        const { error: memberError } = await insertMembership(supabaseAdmin, {
            profileId: user.id,
            tenantId: tenantId,
            role: invitation.role,
            invited_by: invitation.invited_by,
        })

        if (memberError) {
            console.error('[Supabase Error] Adding member to tenant failed:', memberError)
            return {
                success: false,
                message: 'Could not add you to the workspace. You might already be a member.'
            }
        }

        const { error: updateError } = await updateInvitationByToken(supabaseAdmin, tokenHash, 'ACCEPTED')

        if (updateError) {
            console.error('[Supabase Error] Updating invitation status failed:', updateError)
        }

        revalidatePath(`/invitations/accept`)

        return {
            success: true,
            message: 'You have successfully joined the workspace!',
            data: { userId: user.id, tenantId: tenant }
        }

    } catch (error: any) {
        if (error.message === 'AUTH_REQUIRED') {
        } else {
            console.error('[Server Action Error] acceptInvitationAction:', error)
            return {
                success: false,
                message: 'An unexpected error occurred.'
            }
        }
    }

    if (shouldRedirect) {
        redirect(`/login?token=${token}&tenant=${tenant}`)
    }
}