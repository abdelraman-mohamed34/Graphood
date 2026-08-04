"use client";

import { useInvitations } from "@/shared/lib/hooks";

import InvitationRow from "./invitation-row";
import InvitationsEmpty from "./invitations-empty";
import InvitationsSkeleton from "./invitations-skeleton";
import { useTranslations } from "next-intl";

export default function InvitationsTable() {
    const t = useTranslations("dashboard.members");
    const {
        pendingInvitations,
        cancelInvitation,
        resendInvitation,
        isCancelling,
        isResending,
        isLoading,
        error,
    } = useInvitations();

    if (isLoading) {
        return <InvitationsSkeleton />;
    }

    if (error) {
        return (
            <div className="rounded-lg border border-destructive/30 p-6 text-center text-sm text-destructive">
                {t("invitations.loadError")}
            </div>
        );
    }

    if (!pendingInvitations?.length) {
        return <InvitationsEmpty />;
    }

    return (
        <div className="space-y-3">
            <div>
                <h3 className="text-lg font-semibold">
                    {t("invitations.title")}
                </h3>

                <p className="text-sm text-muted-foreground">
                    {t("invitations.description")}
                </p>
            </div>

            <div className="overflow-hidden rounded-xl border bg-background">
                <table className="w-full border-collapse text-start">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold">
                                {t("table.email")}
                            </th>

                            <th className="px-6 py-4 text-sm font-semibold">
                                {t("table.role")}
                            </th>

                            <th className="px-6 py-4 text-sm font-semibold">
                                {t("invitations.expires")}
                            </th>

                            <th className="w-12 px-4 py-4" />
                        </tr>
                    </thead>

                    <tbody className="divide-y">
                        {pendingInvitations.map((invitation) => (
                            <InvitationRow
                                key={invitation.id}
                                invitation={invitation}
                                resendInvitation={resendInvitation}
                                cancelInvitation={cancelInvitation}
                                loading={
                                    isCancelling ||
                                    isResending
                                }
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
