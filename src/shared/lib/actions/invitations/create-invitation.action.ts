'use server'

import { revalidatePath } from 'next/cache'

import { requireMembership } from '@/shared/lib/auth/requires/require-membership'
import { hasAnyPermission } from '@/shared/lib/auth/requires/require-permission'
import { requireUser } from '@/shared/lib/auth/requires/require-user'

import {
    createInvitationSchema,
    type CreateInvitationInput,
} from '@/shared/lib/schemas/inputs/invitation-inputs.schema'

import { createInvitation } from '@/shared/lib/supabase/services/invitations/create-invitation.service'
import { getPendingInvitationByEmail } from '@/shared/lib/supabase/services/invitations/get-invitations.service'
import { getMembershipBySlug } from '@/shared/lib/supabase/services/memberships/get-membership.service'
import { getWhatByFrom } from '@/shared/lib/supabase/services/get-what-by-from.service'
import { sendInvitationEmail } from '@/shared/lib/supabase/services/invitations/send-invitation-email.service'
import { createAdminClient } from '@/shared/lib/supabase/admin'
import { checkTenantLimit } from '@/shared/lib/auth/guards/tenant-limit'
import { z } from 'zod'

const invitationContextSchema = z.object({ locale: z.enum(['ar', 'en']), tenantSlug: z.string().min(1).max(100) }).strict()

type CreateInvitationResult =
    | {
        success: true
    }
    | {
        success: false
        code:
        | 'INVALID_INPUT'
        | 'UNAUTHORIZED'
        | 'ALREADY_MEMBER'
        | 'INVITATION_EXISTS'
        | 'OVER_LIMIT'
        | 'UNKNOWN_ERROR'
    }

const ROLE_HIERARCHY: Record<string, number> = {
    MEMBER: 1,
    ADMIN: 2,
    OWNER: 3,
}

export async function createInvitationAction(
    locale: string,
    tenantSlug: string,
    input: CreateInvitationInput
): Promise<CreateInvitationResult> {
    try {
        const context = invitationContextSchema.parse({ locale, tenantSlug })
        const parsed = createInvitationSchema.safeParse(input)

        if (!parsed.success) {
            return {
                success: false,
                code: 'INVALID_INPUT',
            }
        }

        // User client (authorization)
        const {
            user,
            supabase,
        } = await requireUser(context.locale)

        const membership = await requireMembership({
            supabase,
            tenantSlug: context.tenantSlug,
            userId: user.id,
            redirectTo: `/${locale}/workspaces`,
        })

        if (
            !hasAnyPermission(membership, [
                'members.invite',
                'tenant.manage',
            ])
        ) {
            return {
                success: false,
                code: 'UNAUTHORIZED',
            }
        }

        // Admin client (privileged operations)
        const admin = await createAdminClient()

        const limitCheck = await checkTenantLimit(
            admin,
            membership.tenant_id,
            'maxAdmins'
        )

        if (!limitCheck.allowed) {
            return {
                success: false,
                code: 'OVER_LIMIT',
            }
        }

        const profileId = await getWhatByFrom<string>(
            admin,
            'id',
            parsed.data.email,
            'email',
            'profiles'
        )

        if (profileId) {
            const existingMembership =
                await getMembershipBySlug({
                    supabase: admin,
                    tenantSlug,
                    userId: profileId,
                })

            if (existingMembership) {
                return {
                    success: false,
                    code: 'ALREADY_MEMBER',
                }
            }
        }

        const pendingInvitation =
            await getPendingInvitationByEmail({
                supabase: admin,
                tenantId: membership.tenant_id,
                email: parsed.data.email,
            })

        if (pendingInvitation) {
            return {
                success: false,
                code: 'INVITATION_EXISTS',
            }
        }

        const inviterRoleWeight =
            ROLE_HIERARCHY[membership.role] ?? 0

        const invitedRoleWeight =
            ROLE_HIERARCHY[parsed.data.role] ?? 0

        if (invitedRoleWeight > inviterRoleWeight) {
            return {
                success: false,
                code: 'UNAUTHORIZED',
            }
        }

        const { token } = await createInvitation({
            supabase: admin,
            tenantId: membership.tenant_id,
            invitedBy: membership.profile_id,
            input: parsed.data,
        })

        await sendInvitationEmail({
            email: parsed.data.email,
            token,
            locale: context.locale,
            tenantSlug: context.tenantSlug,
            inviterName: `${user.user_metadata.first_name} ${user.user_metadata.last_name}`,
            message: parsed.data.message,
        })

        revalidatePath(
            `/${context.locale}/${context.tenantSlug}/dashboard/members`
        )

        return {
            success: true,
        }
    } catch {

        return {
            success: false,
            code: 'UNKNOWN_ERROR',
        }
    }
}
