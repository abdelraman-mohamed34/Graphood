"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
    addPlatformStaffAction,
    checkPlatformRoleAction,
    fetchPlatformStaffAction,
    removePlatformStaffAction,
    updateSystemStatusAction,
    type UpdateSystemStatusInput,
} from "@/shared/lib/actions/platform-staff";
import { queryKeys } from "@/shared/lib/query";
import type { CreatePlatformStaffInput } from "@/shared/lib/schemas/graphood-staff.schema";

export function usePlatformStaff() {
    const queryClient = useQueryClient();
    const t = useTranslations("AdminStaff");

    const localizedError = (message: string | undefined) => {
        const key = message?.split(":", 1)[0] ?? "errors.unknown";
        return t.has(key) ? t(key) : t("errors.unknown");
    };

    const roleQuery = useQuery({
        queryKey: queryKeys.platformStaff.role(),
        queryFn: async () => {
            const result = await checkPlatformRoleAction();
            if (!result.success) throw new Error(result.error ?? "staff.roleLookupFailed");
            return result.data;
        },
    });

    const staffQuery = useQuery({
        queryKey: queryKeys.platformStaff.list(),
        enabled: roleQuery.data === "SUPER_ADMIN",
        queryFn: async () => {
            const result = await fetchPlatformStaffAction();
            if (!result.success) throw new Error(result.error ?? "staff.fetchFailed");
            return result.data ?? [];
        },
    });

    const addStaffMutation = useMutation({
        mutationFn: async (input: CreatePlatformStaffInput) => {
            const result = await addPlatformStaffAction(input);
            if (!result.success) throw new Error(result.error ?? "staff.addFailed");
            return result.data;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: queryKeys.platformStaff.all() });
            toast.success(t("toast.addSuccess"));
        },
        onError: (error) => toast.error(localizedError(error.message)),
    });

    const removeStaffMutation = useMutation({
        mutationFn: async (staffId: string) => {
            const result = await removePlatformStaffAction(staffId);
            if (!result.success) throw new Error(result.error ?? "staff.removeFailed");
            return result.data;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: queryKeys.platformStaff.all() });
            toast.success(t("toast.removeSuccess"));
        },
        onError: (error) => toast.error(localizedError(error.message)),
    });

    const updateSystemStatusMutation = useMutation({
        mutationFn: async (input: UpdateSystemStatusInput) => {
            const result = await updateSystemStatusAction(input);
            if (!result.success) throw new Error(result.error ?? "errors.unknown");
            return result;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.systems.all() }),
        onError: (error) => toast.error(localizedError(error.message)),
    });

    const error =
        roleQuery.error ??
        staffQuery.error ??
        addStaffMutation.error ??
        removeStaffMutation.error ??
        null;

    return {
        staff: staffQuery.data ?? [],
        role: roleQuery.data ?? null,
        isSuperAdmin: roleQuery.data === "SUPER_ADMIN",
        isSupportAgent: roleQuery.data === "SUPPORT_AGENT",
        isPlatformStaff: Boolean(roleQuery.data),
        isLoadingRole: roleQuery.isLoading,
        isLoadingStaff: staffQuery.isLoading,
        isLoading: roleQuery.isLoading || staffQuery.isLoading,
        roleError: roleQuery.error?.message ?? null,
        error,
        refreshRole: roleQuery.refetch,
        refresh: () =>
            queryClient.invalidateQueries({ queryKey: queryKeys.platformStaff.all() }),
        addStaff: addStaffMutation.mutateAsync,
        isAddingStaff: addStaffMutation.isPending,
        removeStaff: removeStaffMutation.mutateAsync,
        isRemovingStaff: removeStaffMutation.isPending,
        removingStaffId: removeStaffMutation.variables ?? null,
        updateSystemStatus: updateSystemStatusMutation.mutateAsync,
        isUpdatingStatus: updateSystemStatusMutation.isPending,
    };
}
