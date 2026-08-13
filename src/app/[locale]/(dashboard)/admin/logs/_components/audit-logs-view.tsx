"use client";

import { useAuditLogs } from "@/shared/lib/hooks/audit_logs/use-audit-logs";
import { useAuditLogUnreadCount } from "@/shared/lib/hooks/audit_logs/use-audit-log-unread-count";
import {
    getAuditLogActionLabel,
    getAuditLogActionTone,
    type AuditLogActionTone,
} from "@/shared/lib/utils/format-audit-log-action";
import { getAuditLogEntityLabel } from "@/shared/lib/utils/format-audit-log-entity";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useFormatter, useTranslations } from "next-intl";
import React, { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";

const actionToneClasses: Record<AuditLogActionTone, string> = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300",
    warning: "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-900 dark:bg-orange-950/50 dark:text-orange-300",
    info: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300",
    neutral: "border-border bg-muted text-foreground",
};

export default function AuditLogsView({ locale }: { locale: string }) {
    const [page, setPage] = useState(1);
    const t = useTranslations("AdminAuditLogs");
    const format = useFormatter();
    const { markAllRead } = useAuditLogUnreadCount();
    const lastMarkedLogId = useRef<string | null>(null);

    const directionText = locale === "ar" ? "text-right" : "text-left";

    const { logs, totalPages, isLoading, error } = useAuditLogs({
        locale,
        tenantId: null,
        page,
        limit: 15,
        refetchInterval: 10000,
    });

    const newestUnreadLog = logs.find((log) => !log.is_read);
    useEffect(() => {
        if (!newestUnreadLog || lastMarkedLogId.current === newestUnreadLog.id) return;
        lastMarkedLogId.current = newestUnreadLog.id;
        markAllRead();
    }, [markAllRead, newestUnreadLog]);

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

            <div className="hidden overflow-hidden rounded-lg border bg-background md:block">
                <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[760px] text-sm text-left rtl:text-right">
                        <thead className="bg-muted text-muted-foreground font-medium border-b">
                            <tr className={directionText}>
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
                                    <tr
                                        key={log.id}
                                        className={cn(
                                            "transition-colors hover:bg-muted/50",
                                            directionText,
                                            !log.is_read && "bg-amber-50/60 hover:bg-amber-50 dark:bg-amber-950/20",
                                        )}
                                    >
                                        <td className="p-3 font-medium">
                                            <Badge
                                                variant="outline"
                                                className={actionToneClasses[getAuditLogActionTone(log.action)]}
                                            >
                                                {getAuditLogActionLabel(log.action, t)}
                                            </Badge>
                                        </td>
                                        <td className="p-3">
                                            {[log.actor?.first_name, log.actor?.last_name].filter(Boolean).join(" ")
                                                || log.actor?.email
                                                || t("table.systemActor")}
                                        </td>
                                        <td className="p-3">
                                            <span className="px-2 py-0.5 rounded text-xs bg-secondary">
                                                {log.entity_type}
                                            </span>
                                        </td>
                                        <td className="max-w-48 p-3 text-xs">
                                            {(() => {
                                                const entity = getAuditLogEntityLabel(log.metadata, log.entity_id);
                                                const reviewUrl = getReviewUrl(log.metadata);
                                                return (
                                                    reviewUrl ? <Link
                                                        href={reviewUrl}
                                                        className="block truncate font-medium text-primary underline-offset-4 hover:underline"
                                                        title={entity.fullValue}
                                                    >{entity.label}</Link> : <span
                                                        className={cn("block truncate", entity.isFallback && "font-mono text-muted-foreground")}
                                                        title={entity.fullValue}
                                                    >
                                                        {entity.label}
                                                    </span>
                                                );
                                            })()}
                                        </td>
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
            </div>

            <div className="space-y-3 md:hidden">
                {logs.length === 0 ? (
                    <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
                        {t("states.empty")}
                    </div>
                ) : logs.map((log) => {
                    const entity = getAuditLogEntityLabel(log.metadata, log.entity_id);
                    const actor = [log.actor?.first_name, log.actor?.last_name].filter(Boolean).join(" ")
                        || log.actor?.email
                        || t("table.systemActor");
                    const reviewUrl = getReviewUrl(log.metadata);

                    return (
                        <article
                            key={log.id}
                            className={cn(
                                "space-y-3 rounded-lg border bg-background p-4",
                                !log.is_read && "border-amber-200 bg-amber-50/60 dark:border-amber-900 dark:bg-amber-950/20",
                            )}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <Badge
                                    variant="outline"
                                    className={actionToneClasses[getAuditLogActionTone(log.action)]}
                                >
                                    {getAuditLogActionLabel(log.action, t)}
                                </Badge>
                                <time className="shrink-0 text-xs text-muted-foreground">
                                    {format.dateTime(new Date(log.created_at), {
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                    })}
                                </time>
                            </div>
                            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
                                <dt className="text-muted-foreground">{t("table.actor")}</dt>
                                <dd className="min-w-0 truncate text-end" title={actor}>{actor}</dd>
                                <dt className="text-muted-foreground">{t("table.entityType")}</dt>
                                <dd className="text-end">{log.entity_type}</dd>
                                <dt className="text-muted-foreground">{t("table.entityId")}</dt>
                                <dd className="min-w-0 truncate text-end" title={entity.fullValue}>{reviewUrl ? <Link href={reviewUrl} className="font-medium text-primary underline-offset-4 hover:underline">{entity.label}</Link> : entity.label}</dd>
                                <dt className="text-muted-foreground">{t("table.ipAddress")}</dt>
                                <dd className="truncate text-end font-mono text-xs" dir="ltr">{log.ip_address ?? "—"}</dd>
                            </dl>
                        </article>
                    );
                })}
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

function getReviewUrl(metadata: unknown): `/admin/systems/${string}/review` | null {
    if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return null;
    const value = (metadata as Record<string, unknown>).review_url;
    return typeof value === "string" && /^\/admin\/systems\/[0-9a-f-]{36}\/review$/i.test(value)
        ? value as `/admin/systems/${string}/review`
        : null;
}
