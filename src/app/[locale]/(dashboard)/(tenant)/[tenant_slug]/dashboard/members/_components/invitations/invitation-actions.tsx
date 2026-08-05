"use client";

import { EllipsisVertical } from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import CancelInvitation from "./cancel-invitation";
import ResendInvitation from "./resend-invitation";

import type { PendingInvitationListItem } from "@/shared/lib/supabase/services/invitations/get-pending-invitations.service";

type Props = {
    invitation: PendingInvitationListItem;

    resendInvitation: (invitationId: string) => void;

    cancelInvitation: (invitationId: string) => void;

    loading: boolean;
};

export default function InvitationActions({
    invitation,
    resendInvitation,
    cancelInvitation,
    loading,
}: Props) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className="rounded-md p-1 transition hover:bg-muted"
                >
                    <EllipsisVertical size={15} />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                sideOffset={4}
                className="min-w-56 rounded-lg"
            >
                <ResendInvitation
                    invitation={invitation}
                    resendInvitation={resendInvitation}
                    loading={loading}
                />

                <CancelInvitation
                    invitation={invitation}
                    cancelInvitation={cancelInvitation}
                    loading={loading}
                />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
