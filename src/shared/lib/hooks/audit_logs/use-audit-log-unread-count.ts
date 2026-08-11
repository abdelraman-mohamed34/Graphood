"use client";

import { useLocale } from "next-intl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getUnreadAuditLogCountAction,
    markAuditLogsReadAction,
} from "@/shared/lib/actions/audit-logs/audit-log-read-state.action";
import { queryKeys } from "@/shared/lib/query";

export function useAuditLogUnreadCount() {
    const locale = useLocale();
    const queryClient = useQueryClient();
    const countQuery = useQuery({
        queryKey: queryKeys.auditLogs.unreadCount(),
        queryFn: async () => {
            const result = await getUnreadAuditLogCountAction(locale);
            if (!result.success) throw new Error(result.error);
            return result.count;
        },
        refetchInterval: 10_000,
    });

    const markReadMutation = useMutation({
        mutationFn: async () => {
            const result = await markAuditLogsReadAction(locale);
            if (!result.success) throw new Error(result.error);
            return result.readAt;
        },
        onSuccess: () => {
            queryClient.setQueryData(queryKeys.auditLogs.unreadCount(), 0);
        },
    });

    return {
        unreadCount: countQuery.data ?? 0,
        markAllRead: markReadMutation.mutate,
        isMarkingRead: markReadMutation.isPending,
    };
}
