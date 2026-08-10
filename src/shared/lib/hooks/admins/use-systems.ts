"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
    fetchSystemsAction,
    updateSystemStatusAction,
} from "@/shared/lib/actions/admin/systems.action";
import { queryKeys } from "@/shared/lib/query";
import type { UpdateSystemStatusInput } from "@/shared/lib/schemas/systems.schema";

export function useSystems(options?: { onStatusUpdated?: () => void }) {
    const queryClient = useQueryClient();
    const t = useTranslations("AdminSystems");

    const localizedError = (message?: string) => {
        const key = message?.split(":", 1)[0] ?? "errors.unknown";
        return t.has(key) ? t(key) : t("errors.unknown");
    };

    const systemsQuery = useQuery({
        queryKey: queryKeys.systems.all(),
        queryFn: async () => {
            const result = await fetchSystemsAction();
            if (!result.success) throw new Error(result.error ?? "systems.fetchFailed");
            return result.data ?? [];
        },
    });

    const updateStatusMutation = useMutation({
        mutationFn: async (input: UpdateSystemStatusInput) => {
            const result = await updateSystemStatusAction(input);
            if (!result.success) throw new Error(result.error ?? "systems.updateFailed");
            return result.data;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: queryKeys.systems.all() });
            toast.success(t("toast.updateSuccess"));
            options?.onStatusUpdated?.();
        },
        onError: (error) => toast.error(localizedError(error.message)),
    });

    return {
        systems: systemsQuery.data ?? [],
        isLoading: systemsQuery.isLoading,
        isFetching: systemsQuery.isFetching,
        error: systemsQuery.error,
        refresh: systemsQuery.refetch,
        updateStatus: updateStatusMutation.mutateAsync,
        updateStatusMutation,
        isUpdatingStatus: updateStatusMutation.isPending,
    };
}
