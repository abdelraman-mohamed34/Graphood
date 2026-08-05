"use client";

import InvitationActions from "./invitation-actions";

import type { PendingInvitationListItem } from "@/shared/lib/supabase/services/invitations/get-pending-invitations.service";
import { useLocale, useTranslations } from "next-intl";

type Props = {
    invitation: PendingInvitationListItem;

    resendInvitation: (invitationId: string) => void;

    cancelInvitation: (invitationId: string) => void;

    loading: boolean;
};

export default function InvitationRow({
    invitation,
    resendInvitation,
    cancelInvitation,
    loading,
}: Props) {
    const locale = useLocale();
    const t = useTranslations("dashboard.members");
    const roleKey = `roles.${invitation.role.toLowerCase()}`;
    return (
        <tr className="transition-colors hover:bg-muted/30">
            <td className="px-6 py-4">
                <span className="font-medium">
                    {invitation.email}
                </span>
            </td>

            <td className="px-6 py-4">
                <span className="inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase">
                    {t.has(roleKey) ? t(roleKey) : invitation.role}
                </span>
            </td>

            <td className="px-6 py-4 text-muted-foreground">
                {new Date(
                    invitation.expires_at
                ).toLocaleDateString(locale)}
            </td>

            <td className="px-4 py-4 text-end">
                <InvitationActions
                    invitation={invitation}
                    resendInvitation={resendInvitation}
                    cancelInvitation={cancelInvitation}
                    loading={loading}
                />
            </td>
        </tr>
    );
}
