"use client";

import { useAuditLogs } from "@/shared/lib/hooks/audit_logs/use-audit-logs";
import { useFormatter, useTranslations } from "next-intl";
import React, { useState } from "react";

export default function AuditLogsView({ locale }: { locale: string }) {
    const [page, setPage] = useState(1);
    const t = useTranslations("AdminAuditLogs");
    const format = useFormatter();

    const { logs, totalPages, isLoading, error } = useAuditLogs({
        locale,
        tenantId: null,
        page,
        limit: 15,
        refetchInterval: 10000,
    });

    if (isLoading) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                {t("states.loading")}
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-red-500 rounded-md bg-red-50 border border-red-200">
                {t("states.error", { error })}
            </div>
        );
    }

    return (
        <div className="space-y-4">

            <div className="border rounded-lg overflow-hidden bg-background">
                <table className="w-full text-sm text-left rtl:text-right">
                    <thead className="bg-muted text-muted-foreground font-medium border-b">
                        <tr>
                            <th className="p-3">{t("table.action")}</th>
                            <th className="p-3">{t("table.actor")}</th>
                            <th className="p-3">{t("table.entityType")}</th>
                            <th className="p-3">{t("table.entityId")}</th>
                            <th className="p-3">{t("table.ipAddress")}</th>
                            <th className="p-3">{t("table.date")}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-6 text-center text-muted-foreground">
                                    {t("states.empty")}
                                </td>
                            </tr>
                        ) : (
                            logs.map((log) => (
                                <tr key={log.id} className="hover:bg-muted/50 transition-colors">
                                    <td className="p-3 font-medium">{log.action}</td>
                                    <td className="p-3">
                                        {log.actor?.full_name || log.actor?.email || t("table.systemActor")}
                                    </td>
                                    <td className="p-3">
                                        <span className="px-2 py-0.5 rounded text-xs bg-secondary">
                                            {log.entity_type}
                                        </span>
                                    </td>
                                    <td className="p-3 font-mono text-xs">{log.entity_id ?? "-"}</td>
                                    <td className="p-3 font-mono text-xs">{log.ip_address ?? "-"}</td>
                                    <td className="p-3 text-xs text-muted-foreground">
                                        {format.dateTime(new Date(log.created_at), {
                                            dateStyle: "medium",
                                            timeStyle: "short",
                                        })}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex justify-between items-center pt-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="px-3 py-1.5 border rounded text-xs disabled:opacity-50"
                    >
                        {t("pagination.previous")}
                    </button>
                    <span className="text-xs text-muted-foreground">
                        {t("pagination.page", { page, totalPages })}
                    </span>
                    <button
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => p + 1)}
                        className="px-3 py-1.5 border rounded text-xs disabled:opacity-50"
                    >
                        {t("pagination.next")}
                    </button>
                </div>
            )}
        </div>
    );
}
