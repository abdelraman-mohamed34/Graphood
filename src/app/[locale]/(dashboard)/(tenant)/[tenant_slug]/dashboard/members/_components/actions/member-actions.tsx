"use client";

import { EllipsisVertical } from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Membership } from "@/shared/lib/schemas/memberships.schema";

import RemoveMember from "./remove-member";
import TransferOwnership from "./transfer-ownership";

type Props = {
    member: Membership;
    currentMembership: Membership | null;
    profileId?: string;
    removeMember: (membershipId: string) => void;
};

export default function MemberActions({
    member,
    currentMembership,
    profileId,
    removeMember,
}: Props) {
    const isOwner = currentMembership?.role === "OWNER";
    const canTransfer =
        isOwner &&
        member.role === "ADMIN";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className="rounded-md p-1 transition hover:bg-muted"
                >
                    <EllipsisVertical size={15} />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="min-w-56"
            >
                {canTransfer && (
                    <TransferOwnership
                        member={member}
                    />
                )}

                <RemoveMember
                    member={member}
                    profileId={profileId}
                    removeMember={removeMember}
                />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}