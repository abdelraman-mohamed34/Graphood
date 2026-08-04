"use client";

import { Membership } from "@/shared/lib/schemas/memberships.schema";

import RoleBadge from "./role-badge";
import StatusBadge from "./status-badge";
import MemberActions from "../actions/member-actions";
import { useTranslations } from "next-intl";

type Props = {
    member: Membership;
    currentMembership: Membership | null;
    profileId?: string;
    removeMember: (membershipId: string) => void;
    canShowMemberActions: (member: Membership) => boolean;
};

export default function MemberRow({
    member,
    currentMembership,
    profileId,
    removeMember,
    canShowMemberActions,
}: Props) {
    const t = useTranslations("dashboard.members");
    return (
        <tr className="transition-colors hover:bg-muted/30">
            <td className="px-6 py-4">
                <div className="flex flex-col">
                    <span className="font-medium">
                        {member.profile
                            ? `${member.profile.first_name} ${member.profile.last_name}`
                            : "-"}
                    </span>
                </div>
            </td>

            <td className="px-6 py-4">
                <RoleBadge role={member.role} />
            </td>

            <td className="px-6 py-4">
                <StatusBadge status={member.status} />
            </td>

            <td className="px-6 py-4">
                {member.inviter ? (
                    <>
                        {member.inviter.first_name}{" "}
                        {member.inviter.last_name}
                    </>
                ) : (
                    <span className="text-muted-foreground">
                        {t("system")}
                    </span>
                )}
            </td>

            <td className="px-4 py-4 text-end">
                {canShowMemberActions(member) && (
                    <MemberActions
                        member={member}
                        currentMembership={currentMembership}
                        profileId={profileId}
                        removeMember={removeMember}
                    />
                )}
            </td>
        </tr>
    );
}
