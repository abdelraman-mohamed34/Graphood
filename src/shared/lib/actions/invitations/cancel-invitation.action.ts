'use server'

import { revalidatePath } from 'next/cache'

import { requireMembership } from '@/shared/lib/auth/requires/require-membership'
import { hasAnyPermission } from '@/shared/lib/auth/requires/require-permission'
import { requireUser } from '@/shared/lib/auth/requires/require-user'

import { createAdminClient } from '@/shared/lib/supabase/admin'
import { updateInvitationById } from '@/shared/lib/supabase/services/invitations/update-invitation-by-id.service'
import { getInvitationById } from '../../supabase/services/invitations/get-invitation-by-id.service'

type CancelInvitationResult =
    | { success: true }
    | {
        success: false
        code:
        | 'UNAUTHORIZED'
        | 'INVALID_INVITATION'
        | 'UNKNOWN_ERROR'
    }

export async function cancelInvitationAction(
    locale: string,
    tenantSlug: string,
    id: string
): Promise<CancelInvitationResult> {
    try {
        const { user } = await requireUser(locale)
        const supabase = await createAdminClient()

        const membership = await requireMembership({
            supabase,
            tenantSlug,
            userId: user.id,
            redirectTo: `/${locale}/workspaces`,
        })

        const invitation = await getInvitationById(
            supabase,
            id
        );

        if (!invitation) {
            return {
                success: false,
                code: "INVALID_INVITATION",
            };
        }

        if (invitation.tenant_id !== membership.tenant_id) {
            return {
                success: false,
                code: "UNAUTHORIZED",
            };
        }

        if (!hasAnyPermission(membership, ['members.invite', 'tenant.manage'])) {
            return {
                success: false,
                code: 'UNAUTHORIZED',
            }
        }

        await updateInvitationById(
            supabase,
            id,
            'CANCELLED'
        )

        revalidatePath(`/${locale}/${tenantSlug}/dashboard/members`)

        return {
            success: true,
        }
    } catch (error) {
        console.error("CANCEL INVITATION ERROR:", error);

        return {
            success: false,
            code: "UNKNOWN_ERROR",
        };
    }
}