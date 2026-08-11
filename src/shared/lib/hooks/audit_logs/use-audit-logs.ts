"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateAuditLogInput } from "../../schemas";
import { createAuditLogAction } from "../../actions/audit-logs/create-audit-log.action";
import { getAuditLogsAction } from "../../actions/audit-logs/get-audit-logs.action";

interface UseAuditLogsOptions {
    locale: string;
    tenantId?: string | null;
    entityType?: string;
    action?: string;
    page?: number;
    limit?: number;
    refetchInterval?: number | false;
}

export function useAuditLogs({
    locale,
    tenantId,
    entityType,
    action,
    page = 1,
    limit = 20,
    refetchInterval = false,
}: UseAuditLogsOptions) {
    const queryClient = useQueryClient();
    const offset = (page - 1) * limit;

    const queryKey = ["audit-logs", { tenantId, entityType, action, page, limit }];

    const {
        data,
        isLoading,
        isFetching,
        error,
        refetch,
    } = useQuery({
        queryKey,
        queryFn: async () => {
            const res = await getAuditLogsAction(
                { limit, offset, entityType, action, tenantId },
                locale
            );

            if (!res.success) {
                throw new Error(res.error || "Failed to fetch audit logs");
            }

            return res;
        },
        refetchInterval,
        refetchOnWindowFocus: true,
        staleTime: 1000 * 30,
    });

    const createLogMutation = useMutation({
        mutationFn: async (input: CreateAuditLogInput) => {
            const res = await createAuditLogAction(input, locale);
            if (!res.success) throw new Error(res.error);
            return res.log;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
        },
    });

    const total = data?.total ?? 0;
    const totalPages = Math.ceil(total / limit);

    return {
        logs: data?.logs ?? [],
        total,
        totalPages,
        isLoading,
        isFetching,
        error: error ? (error as Error).message : null,
        refetch,
        createLog: createLogMutation.mutateAsync,
        isCreating: createLogMutation.isPending,
    };
}