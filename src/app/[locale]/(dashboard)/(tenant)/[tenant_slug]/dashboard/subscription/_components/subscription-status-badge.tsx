"use client"

import { Badge } from "@/components/ui/badge"

type SubscriptionStatus =
    | "ACTIVE"
    | "TRIAL"
    | "PAST_DUE"
    | "CANCELED"
    | "EXPIRED"
    | "UNKNOWN"

type SubscriptionStatusBadgeProps = {
    status: SubscriptionStatus
}

export default function SubscriptionStatusBadge({
    status,
}: SubscriptionStatusBadgeProps) {
    const styles: Record<
        SubscriptionStatus,
        { label: string; className: string }
    > = {
        ACTIVE: {
            label: "ACTIVE",
            className:
                "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        },
        TRIAL: {
            label: "TRIAL",
            className:
                "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400",
        },
        PAST_DUE: {
            label: "PAST DUE",
            className:
                "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
        },
        CANCELED: {
            label: "CANCELED",
            className:
                "border-slate-500/20 bg-slate-500/10 text-slate-600 dark:text-slate-400",
        },
        EXPIRED: {
            label: "EXPIRED",
            className:
                "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400",
        },
        UNKNOWN: {
            label: "UNKNOWN",
            className: "border-slate-500/20 bg-slate-500/10 text-slate-600 dark:text-slate-400",
        },
    }

    const current = styles[status]

    return (
        <Badge variant="outline" className={current.className}>
            {current.label}
        </Badge>
    )
}
