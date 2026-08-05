'use server'

import { revalidatePath } from 'next/cache'

import { requireMembership } from '@/shared/lib/auth/requires/require-membership'
import { hasAnyPermission } from '@/shared/lib/auth/requires/require-permission'
import { requireUser } from '@/shared/lib/auth/requires/require-user'

import { createAdminClient } from '@/shared/lib/supabase/admin'
import { updateInvitationById } from '@/shared/lib/supabase/services/invitations/update-invitation-by-id.service'
import { getInvitationById } from '../../supabase/services/invitations/get-invitation-by-id.service'
import { z } from 'zod'

const cancelInvitationSchema = z.object({ locale: z.enum(['ar', 'en']), tenantSlug: z.string().min(1).max(100), id: z.string().uuid() }).strict()

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
        const input = cancelInvitationSchema.parse({ locale, tenantSlug, id })
        const { user } = await requireUser(input.locale)
        const supabase = await createAdminClient()

        const membership = await requireMembership({
            supabase,
            tenantSlug: input.tenantSlug,
            userId: user.id,
            redirectTo: `/${locale}/workspaces`,
        })

        const invitation = await getInvitationById(
            supabase,
            input.id
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
            input.id,
            membership.tenant_id,
            "CANCELLED"
        );

        revalidatePath(`/${input.locale}/${input.tenantSlug}/dashboard/members`)

        return {
            success: true,
        }
    } catch {

        return {
            success: false,
            code: "UNKNOWN_ERROR",
        };
    }
}
