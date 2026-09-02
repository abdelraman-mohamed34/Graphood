"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createHash } from "crypto";

import { createAdminClient } from "../../supabase/admin";
import { createSupabaseServerClient } from "../../supabase/server";

import { fetchUser } from "../../supabase/services/auth/user/fetch-user.service";
import { getInvitationByToken } from "../../supabase/services/invitations/get-Invitation-by-token.service";
import { updateInvitationByToken } from "../../supabase/services/invitations/update-invitation-by-token.service";
import { insertMembership } from "../../supabase/services/memberships/insert-membership.service";
import { getWhatByFrom } from "../../supabase/services/get-what-by-from.service";
import { z } from "zod";

const acceptInvitationSchema = z.object({
    token: z.string().min(32).max(512),
    tenant: z.string().trim().min(1).max(100),
}).strict();

export async function acceptInvitationAction(
    token: string,
    tenant: string
) {
    const input = acceptInvitationSchema.parse({ token, tenant });
    let shouldRedirect = false;

    const supabase = await createSupabaseServerClient();

    try {
        const user = await fetchUser(supabase);

        if (!user) {
            shouldRedirect = true;
            throw new Error("AUTH_REQUIRED");
        }

        const supabaseAdmin = await createAdminClient();

        const tokenHash = createHash("sha256")
            .update(input.token)
            .digest("hex");

        const invitation = await getInvitationByToken(
            supabaseAdmin,
            tokenHash
        );

        if (!invitation) {
            return {
                success: false,
                message: "Invitation not found or has expired.",
            };
        }

        if (invitation.email !== user.email) {
            return {
                success: false,
                message:
                    "This invitation was sent to a different email address.",
            };
        }

        if (invitation.status === "ACCEPTED") {
            return {
                success: true,
                message: "Already accepted!",
            };
        }

        // Source of truth comes from the invitation itself.
        const tenantSlug = await getWhatByFrom<string>(
            supabaseAdmin,
            "slug",
            invitation.tenant_id,
            "id",
            "tenants"
        );

        if (!tenantSlug) {
            return {
                success: false,
                message: "Workspace not found.",
            };
        }

        // Prevent tampering with the tenant slug in the URL.
        if (tenantSlug !== input.tenant) {
            return {
                success: false,
                message: "Invalid invitation link.",
            };
        }

        const { error: memberError } = await insertMembership(
            supabaseAdmin,
            {
                profileId: user.id,
                tenantId: invitation.tenant_id,
                role: invitation.role,
                invited_by: invitation.invited_by,
            }
        );

        if (memberError) {

            return {
                success: false,
                message:
                    "Could not add you to the workspace. You might already be a member.",
            };
        }

        await updateInvitationByToken(
            supabaseAdmin,
            tokenHash,
            "ACCEPTED"
        );

        revalidatePath("/invitations/accept");

        return {
            success: true,
            message: "You have successfully joined the workspace!",
            data: {
                userId: user.id,
                tenantId: invitation.tenant_id,
                tenantSlug,
            },
        };
    } catch (error: unknown) {
        if (!(error instanceof Error) || error.message !== "AUTH_REQUIRED") {

            return {
                success: false,
                message: "An unexpected error occurred.",
            };
        }
    }

    if (shouldRedirect) {
        redirect(`/login?token=${encodeURIComponent(input.token)}&tenant=${encodeURIComponent(input.tenant)}`);
    }
}
