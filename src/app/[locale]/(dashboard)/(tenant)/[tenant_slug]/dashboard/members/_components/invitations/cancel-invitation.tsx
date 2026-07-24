"use client";

import { BanIcon } from "lucide-react";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ConfirmationDialog } from "@/shared/_components/confirmation-dialog";

import { Invitation } from "@/shared/lib/schemas/invitations.schema";

type Props = {
    invitation: Invitation;

    cancelInvitation: (invitationId: string) => void;

    loading: boolean;
};

export default function CancelInvitation({
    invitation,
    cancelInvitation,
    loading,
}: Props) {
    return (
        <ConfirmationDialog
            trigger={
                <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-destructive focus:text-destructive"
                >
                    <BanIcon className="mr-2 h-4 w-4" />
                    Cancel Invitation
                </DropdownMenuItem>
            }
            title="Cancel Invitation"
            description={
                <>
                    Are you sure you want to cancel the invitation sent to{" "}
                    <strong>{invitation.email}</strong>?
                    <br />
                    This user will no longer be able to accept it.
                </>
            }
            confirmText="Cancel Invitation"
            onConfirm={() => cancelInvitation(invitation.id)}
        />
    );
}