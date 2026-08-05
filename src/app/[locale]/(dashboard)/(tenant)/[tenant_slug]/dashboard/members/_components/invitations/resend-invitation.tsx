"use client";

import { MailIcon } from "lucide-react";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

import type { PendingInvitationListItem } from "@/shared/lib/supabase/services/invitations/get-pending-invitations.service";
import { useTranslations } from "next-intl";

type Props = {
    invitation: PendingInvitationListItem;

    resendInvitation: (invitationId: string) => void;

    loading: boolean;
};

export default function ResendInvitation({
    invitation,
    resendInvitation,
    loading,
}: Props) {
    const t = useTranslations("dashboard.members");
    return (
        <DropdownMenuItem
            disabled={loading}
            onClick={() => resendInvitation(invitation.id)}
        >
            <MailIcon className="me-2 h-4 w-4" />

            <span>
                {loading
                    ? t("invitations.resending")
                    : t("invitations.resend")}
            </span>
        </DropdownMenuItem>
    );
}
