"use client";

import { BanIcon } from "lucide-react";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ConfirmationDialog } from "@/shared/_components/confirmation-dialog";

import { Invitation } from "@/shared/lib/schemas/invitations.schema";
import { useTranslations } from "next-intl";

type Props = {
    invitation: Invitation;

    cancelInvitation: (invitationId: string) => void;

    loading: boolean;
};

export default function CancelInvitation({
    invitation,
    cancelInvitation,
}: Props) {
    const t = useTranslations("dashboard.members");
    return (
        <ConfirmationDialog
            trigger={
                <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-destructive focus:text-destructive"
                >
                    <BanIcon className="me-2 h-4 w-4" />
                    {t("invitations.cancel")}
                </DropdownMenuItem>
            }
            title={t("invitations.cancel")}
            description={
                <>
                    {t.rich("invitations.cancelDescription", {
                        email: invitation.email,
                        strong: (chunks) => <strong>{chunks}</strong>,
                    })}
                </>
            }
            confirmText={t("invitations.cancel")}
            onConfirm={() => cancelInvitation(invitation.id)}
        />
    );
}
