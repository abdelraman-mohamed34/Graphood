"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/shared/lib/auth/requires/require-user";
import { requireMembership } from "@/shared/lib/auth/requires/require-membership";
import { hasAnyPermission } from "@/shared/lib/auth/requires/require-permission";

import { createAdminClient } from "@/shared/lib/supabase/admin";

import { getInvitationById } from "@/shared/lib/supabase/services/invitations/get-invitation-by-id.service";
import { sendInvitationEmail } from "@/shared/lib/supabase/services/invitations/send-invitation-email.service";

type ResendInvitationResult =
    | { success: true }
    | {
        success: false;
        code:
        | "UNAUTHORIZED"
        | "INVALID_INVITATION"
        | "UNKNOWN_ERROR";
    };

export async function resendInvitationAction(
    locale: string,
    tenantSlug: string,
    id: string
): Promise<ResendInvitationResult> {
    try {
        const { user } = await requireUser(locale);

        const supabase = await createAdminClient();

        const membership = await requireMembership({
            supabase,
            tenantSlug,
            userId: user.id,
            redirectTo: `/${locale}/workspaces`,
        });

        if (
            !hasAnyPermission(membership, [
                "members.invite",
                "tenant.manage",
            ])
        ) {
            return {
                success: false,
                code: "UNAUTHORIZED",
            };
        }

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

        await sendInvitationEmail({
            email: invitation.email,
            token: invitation.token,
            locale,
            tenantSlug,
            inviterName: `${user.user_metadata.first_name} ${user.user_metadata.last_name}`,
            message: invitation.message,
        });

        revalidatePath(
            `/${locale}/${tenantSlug}/dashboard/members`
        );

        return {
            success: true,
        };
    } catch (error) {
        console.error("RESEND INVITATION ERROR:", error);

        return {
            success: false,
            code: "UNKNOWN_ERROR",
        };
    }
}