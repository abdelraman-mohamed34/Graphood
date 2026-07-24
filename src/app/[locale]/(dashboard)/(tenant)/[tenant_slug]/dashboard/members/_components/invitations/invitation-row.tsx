"use client";

import InvitationActions from "./invitation-actions";

import { Invitation } from "@/shared/lib/schemas/invitations.schema";

type Props = {
    invitation: Invitation;

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
    return (
        <tr className="transition-colors hover:bg-muted/30">
            <td className="px-6 py-4">
                <span className="font-medium">
                    {invitation.email}
                </span>
            </td>

            <td className="px-6 py-4">
                <span className="inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase">
                    {invitation.role}
                </span>
            </td>

            <td className="px-6 py-4 text-muted-foreground">
                {new Date(
                    invitation.expires_at
                ).toLocaleDateString()}
            </td>

            <td className="px-4 py-4 text-right">
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