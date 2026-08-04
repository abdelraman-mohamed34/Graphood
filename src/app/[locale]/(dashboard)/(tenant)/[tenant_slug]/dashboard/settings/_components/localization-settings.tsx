"use client";

import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useTenant } from "@/shared/lib/hooks/tenants/use-tenant";
import { LocalizationForm } from "./localization-form";
import { useTranslations } from "next-intl";

export function LocalizationSettings() {
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

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-96 w-full rounded-xl" />
            </div>
        );
    }

    if (!permissions.canManageWorkspace || !tenant) {
        return null;
    }

    return <LocalizationForm tenant={tenant} />;
}
