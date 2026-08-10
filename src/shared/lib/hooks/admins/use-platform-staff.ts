"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    checkPlatformRoleAction,
    addPlatformStaffAction,
    removePlatformStaffAction,
    updateSystemStatusAction,
    UpdateSystemStatusInput,
} from "@/shared/lib/actions/platform-staff";

import { queryKeys } from "@/shared/lib/query";
import { CreatePlatformStaffInput } from "../../schemas/graphood-staff.schema";

export function usePlatformStaff() {
    const queryClient = useQueryClient();

    const roleQuery = useQuery({
        queryKey: queryKeys.platformStaff.role(),
        queryFn: async () => {
            const res = await checkPlatformRoleAction();
            if (!res.success) {
                throw new Error(res.error || "Failed to fetch platform role");
            }
            return res.role;
        },
    });

    const addStaffMutation = useMutation({
        mutationFn: async (data: CreatePlatformStaffInput) => {
            const res = await addPlatformStaffAction(data);
            if (!res.success) {
                throw new Error(res.error || "Failed to add staff member");
            }
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.platformStaff.list(),
            });
        },
    });

    const removeStaffMutation = useMutation({
        mutationFn: async (staffId: string) => {
            const res = await removePlatformStaffAction(staffId);
            if (!res.success) {
                throw new Error(res.error || "Failed to remove staff member");
            }
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.platformStaff.list(),
            });
        },
    });

    const updateSystemStatusMutation = useMutation({
        mutationFn: async (data: UpdateSystemStatusInput) => {
            const res = await updateSystemStatusAction(data);
            if (!res.success) {
                throw new Error(res.error || "Failed to update system status");
            }
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.systems.all,
            });
        },
    });

    return {
        role: roleQuery.data ?? null,
        isSuperAdmin: roleQuery.data === "SUPER_ADMIN",
        isSupportAgent: roleQuery.data === "SUPPORT_AGENT",
        isPlatformStaff: !!roleQuery.data,

        isLoadingRole: roleQuery.isLoading,
        roleError: roleQuery.error?.message ?? null,
        refreshRole: roleQuery.refetch,

        addStaff: addStaffMutation.mutateAsync,
        isAddingStaff: addStaffMutation.isPending,

        removeStaff: removeStaffMutation.mutateAsync,
        isRemovingStaff: removeStaffMutation.isPending,

        updateSystemStatus: updateSystemStatusMutation.mutateAsync,
        isUpdatingStatus: updateSystemStatusMutation.isPending,
    };
}