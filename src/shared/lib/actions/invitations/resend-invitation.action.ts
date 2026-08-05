"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/shared/lib/auth/requires/require-user";
import { requireMembership } from "@/shared/lib/auth/requires/require-membership";
import { hasAnyPermission } from "@/shared/lib/auth/requires/require-permission";

import { createAdminClient } from "@/shared/lib/supabase/admin";

import { getInvitationById } from "@/shared/lib/supabase/services/invitations/get-invitation-by-id.service";
import { sendInvitationEmail } from "@/shared/lib/supabase/services/invitations/send-invitation-email.service";
import { z } from "zod";

const resendInvitationSchema = z.object({ locale: z.enum(["ar", "en"]), tenantSlug: z.string().min(1).max(100), id: z.string().uuid() }).strict();

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
        const input = resendInvitationSchema.parse({ locale, tenantSlug, id });
        const { user } = await requireUser(input.locale);

        const supabase = await createAdminClient();

        const membership = await requireMembership({
            supabase,
            tenantSlug: input.tenantSlug,
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

        await sendInvitationEmail({
            email: invitation.email,
            token: invitation.token,
            locale: input.locale,
            tenantSlug: input.tenantSlug,
            inviterName: `${user.user_metadata.first_name} ${user.user_metadata.last_name}`,
            message: invitation.message,
        });

        revalidatePath(
            `/${input.locale}/${input.tenantSlug}/dashboard/members`
        );

        return {
            success: true,
        };
    } catch {

        return {
            success: false,
            code: "UNKNOWN_ERROR",
        };
    }
}
