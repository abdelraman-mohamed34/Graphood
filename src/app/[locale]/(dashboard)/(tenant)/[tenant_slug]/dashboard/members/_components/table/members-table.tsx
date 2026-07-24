"use client";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { PlusIcon } from "lucide-react";

import { Membership } from "@/shared/lib/schemas/memberships.schema";
import { hasPermission } from "@/shared/lib/auth/requires/require-permission";
import { useMemberships, useUser } from "@/shared/lib/hooks";

import MemberRow from "./member-row";
import MembersEmpty from "./members-empty";
import MembersSkeleton from "./members-skeleton";

export default function MembersTable() {
    const {
        memberships,
        currentMembership,
        removeMember,
        isLoading,
    } = useMemberships();

    const { profile } = useUser();

    const canShowMemberActions = (member: Membership) => {
        const isSelf = member.profile_id === profile?.id;

        const canRemoveOthers =
            !!currentMembership &&
            hasPermission(
                currentMembership,
                "members.remove"
            );

        if (isSelf) {
            return currentMembership?.role !== "OWNER";
        }

        return canRemoveOthers;
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-black/70">
                    Members
                    <span className="ml-2 text-xs">
                        ({memberships.length})
                    </span>
                </h3>

                <Link href="members/invite">
                    <Button
                        variant="outline"
                        size="sm"
                    >
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Invite
                    </Button>
                </Link>
            </div>

            <div className="overflow-x-auto rounded-lg border bg-white">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-muted/50">
                            <th className="px-6 py-4 text-left">
                                Member
                            </th>

                            <th className="px-6 py-4 text-left">
                                Role
                            </th>

                            <th className="px-6 py-4 text-left">
                                Status
                            </th>

                            <th className="px-6 py-4 text-left">
                                Invited By
                            </th>

                            <th className="w-12"></th>
                        </tr>
                    </thead>

                    <tbody className="divide-y">
                        {isLoading ? (
                            <MembersSkeleton />
                        ) : memberships.length === 0 ? (
                            <MembersEmpty />
                        ) : (
                            memberships.map((member) => (
                                <MemberRow
                                    key={member.id}
                                    member={member}
                                    currentMembership={
                                        currentMembership
                                    }
                                    profileId={profile?.id}
                                    removeMember={removeMember}
                                    canShowMemberActions={
                                        canShowMemberActions
                                    }
                                />
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}