"use client";

import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useTenant } from "@/shared/lib/hooks/tenants/use-tenant";
import { LocalizationForm } from "./localization-form";

export function LocalizationSettings() {
    const {
        tenant,
        permissions,
        isLoading,
    } = useTenant();

    useEffect(() => {
        if (!isLoading && !permissions.canManageWorkspace) {
            toast.error("You don't have permission to manage this workspace.");
        }
    }, [isLoading, permissions.canManageWorkspace]);

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