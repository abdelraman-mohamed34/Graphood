"use client";

import { LogOutIcon } from "lucide-react";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

import { Membership } from "@/shared/lib/schemas/memberships.schema";

type Props = {
    member: Membership;
    profileId?: string;
    removeMember: (membershipId: string) => void;
};

export default function RemoveMember({
    member,
    profileId,
    removeMember,
}: Props) {
    const isSelf =
        profileId === member.profile_id;

    return (
        <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => removeMember(member.id)}
        >
            <LogOutIcon className="mr-2 h-4 w-4" />

            {isSelf
                ? "Leave Workspace"
                : "Remove Member"}
        </DropdownMenuItem>
    );
}