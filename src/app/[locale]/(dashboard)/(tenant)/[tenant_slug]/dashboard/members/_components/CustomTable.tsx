'use client'

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { hasPermission } from "@/shared/lib/auth/requires/require-permission";
import { useMemberships, useUser } from "@/shared/lib/hooks";
import { Membership } from "@/shared/lib/schemas/memberships.schema";
import { CircleUserRoundIcon, EllipsisVertical, LogOutIcon, PlusIcon } from "lucide-react";

export default function CustomTable() {
    const { memberships, isLoading, removeMember, currentMembership } = useMemberships()
    const { profile } = useUser();

    const canShowMemberActions = (row: Membership) => {
        const isSelf = row.profile_id === profile?.id;

        const canRemoveOthers = !!(
            currentMembership &&
            hasPermission(currentMembership, "members.remove")
        );

        if (isSelf) {
            return currentMembership?.role !== "OWNER";
        }

        return canRemoveOthers;
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-black/70 text-sm">
                    rows <span className="text-xs">({memberships?.length ?? 0})</span>
                </h3>

                <Link href="members/invite">
                    <Button variant="outline" size="sm">
                        <PlusIcon className="mr-2 h-4 w-4" />
                        <span className="hidden lg:inline">
                            Invite
                        </span>
                    </Button>
                </Link>
            </div>

            <div className="w-full overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="border-b border-gray-200 bg-muted/50">
                            <th className="px-6 py-4 text-sm font-semibold">Member</th>
                            <th className="px-6 py-4 text-sm font-semibold">Role</th>
                            <th className="px-6 py-4 text-sm font-semibold">Status</th>
                            <th className="px-6 py-4 text-sm font-semibold">Invited By</th>
                            <th className="w-12 px-4 py-4"></th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4">
                                        <Skeleton className="h-5 w-40" />
                                    </td>

                                    <td className="px-6 py-4">
                                        <Skeleton className="h-6 w-20 rounded-full" />
                                    </td>

                                    <td className="px-6 py-4">
                                        <Skeleton className="h-6 w-24 rounded-full" />
                                    </td>

                                    <td className="px-6 py-4">
                                        <Skeleton className="h-5 w-36" />
                                    </td>

                                    <td className="px-4 py-4">
                                        <Skeleton className="ml-auto h-8 w-8 rounded-md" />
                                    </td>
                                </tr>
                            ))
                        ) : memberships?.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="px-6 py-12 text-center text-sm text-muted-foreground"
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <CircleUserRoundIcon className="h-10 w-10 opacity-50" />

                                        <p className="font-medium">No members found.</p>

                                        <p className="text-xs">
                                            Invite your first member to collaborate on this tenant.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : memberships?.map((row) => (
                            <tr
                                key={row.id}
                                className="transition-colors hover:bg-muted/30"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-medium">
                                            {row.profile
                                                ? `${row.profile.first_name} ${row.profile.last_name}`
                                                : "-"}
                                        </span>
                                    </div>
                                </td>

                                <td className="px-6 py-4">
                                    <span className="inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase">
                                        {row.role}
                                    </span>
                                </td>

                                <td className="px-6 py-4">
                                    <span className="inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase">
                                        {row.status}
                                    </span>
                                </td>

                                <td className="px-6 py-4">
                                    {row.inviter ? (
                                        <div className="flex flex-col">
                                            {row.inviter.first_name} {row.inviter.last_name}
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground">
                                            System
                                        </span>
                                    )}
                                </td>

                                <td className="px-4 py-4 text-right">
                                    {canShowMemberActions(row) && (
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
                                                <DropdownMenuItem
                                                    onClick={() => removeMember(row.id)}
                                                    className="text-destructive focus:text-destructive"
                                                >
                                                    <LogOutIcon className="mr-2 h-4 w-4" />

                                                    <span>
                                                        {profile?.id === row.profile_id
                                                            ? "Exit Tenant"
                                                            : "Remove From Tenant"}
                                                    </span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

    );
}