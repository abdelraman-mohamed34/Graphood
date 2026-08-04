"use client";

import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useTenant } from "@/shared/lib/hooks/tenants/use-tenant";
import { GeneralSettingsForm } from "./general-settings-form";
import { useTranslations } from "next-intl";

export function GeneralSettings() {
    const t = useTranslations("dashboard.settings");
    const {
        tenant,
        permissions,
        isLoading,
    } = useTenant();

    useEffect(() => {
        if (!isLoading && !permissions.canManageWorkspace) {
            toast.error(t("feedback.forbidden"));
        }
    }, [isLoading, permissions.canManageWorkspace, t]);

    useEffect(() => {
        if (!isLoading && !tenant) {
            toast.error(t("feedback.notFound"));
        }
    }, [isLoading, tenant, t]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-96 w-full rounded-xl" />
            </div>
        );
    }

    if (!permissions.canManageWorkspace || !tenant) {
        return null;
    }

    return <GeneralSettingsForm tenant={tenant} />;
}
