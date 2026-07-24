"use client";

import { MailIcon } from "lucide-react";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

import { Invitation } from "@/shared/lib/schemas/invitations.schema";

type Props = {
    invitation: Invitation;

    resendInvitation: (invitationId: string) => void;

    loading: boolean;
};

export default function ResendInvitation({
    invitation,
    resendInvitation,
    loading,
}: Props) {
    return (
        <DropdownMenuItem
            disabled={loading}
            onClick={() => resendInvitation(invitation.id)}
        >
            <MailIcon className="mr-2 h-4 w-4" />

            <span>
                {loading
                    ? "Resending..."
                    : "Resend Invitation"}
            </span>
        </DropdownMenuItem>
    );
}