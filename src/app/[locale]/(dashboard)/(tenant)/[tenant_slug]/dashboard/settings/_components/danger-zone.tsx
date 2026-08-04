"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useTenant } from "@/shared/lib/hooks/tenants/use-tenant";
import { DeleteWorkspace } from "./delete-workspace";
import { LeaveWorkspace } from "./leave-workspace";
import { useTranslations } from "next-intl";

export function DangerZone() {
    const t = useTranslations("dashboard.settings");
    const {
        permissions,
        isLoading,
    } = useTenant();

    if (isLoading) {
        return (
            <Skeleton className="h-72 w-full rounded-xl" />
        );
    }

    if (!permissions.canManageWorkspace) {
        return null;
    }

    return (
        <div className="space-y-6 rounded-xl border border-destructive/30 p-6">
            <div>
                <h2 className="text-xl font-semibold text-destructive">
                    {t("danger.title")}
                </h2>

                <p className="text-sm text-muted-foreground">
                    {t("danger.description")}
                </p>
            </div>

            <LeaveWorkspace />

            {permissions.canDeleteWorkspace && (
                <DeleteWorkspace />
            )}
        </div>
    );
}
