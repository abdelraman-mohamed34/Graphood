"use client";

import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useTenant } from "@/shared/lib/hooks/tenants/use-tenant";
import { GeneralSettingsForm } from "./general-settings-form";

export function GeneralSettings() {
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

    useEffect(() => {
        if (!isLoading && !tenant) {
            toast.error("Workspace not found.");
        }
    }, [isLoading, tenant]);

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