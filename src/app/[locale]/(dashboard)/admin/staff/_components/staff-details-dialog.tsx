"use client";

import type { ReactNode } from "react";
import { useFormatter, useTranslations } from "next-intl";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import type { PlatformStaff } from "@/shared/lib/schemas/graphood-staff.schema";

export function StaffDetailsDialog({ staff, trigger }: { staff: PlatformStaff; trigger: ReactNode }) {
    const t = useTranslations("AdminStaff");
    const format = useFormatter();

    return (
        <Dialog>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("details.title")}</DialogTitle>
                    <DialogDescription>{t("details.description")}</DialogDescription>
                </DialogHeader>
                <dl className="grid gap-3 rounded-lg border bg-muted/30 p-4 text-sm">
                    <Detail label={t("fields.email")} value={staff.email ?? t("table.emailUnavailable")} ltr />
                    <Detail label={t("table.profileId")} value={staff.profileId} ltr />
                    <Detail label={t("fields.role")} value={t(`roles.${staff.role}`)} />
                    <Detail
                        label={t("table.createdAt")}
                        value={staff.createdAt
                            ? format.dateTime(new Date(staff.createdAt), { dateStyle: "long" })
                            : t("table.unknownDate")}
                    />
                </dl>
            </DialogContent>
        </Dialog>
    );
}

function Detail({ label, value, ltr = false }: { label: string; value: string; ltr?: boolean }) {
    return (
        <div className="flex items-start justify-between gap-4">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="min-w-0 truncate font-medium" dir={ltr ? "ltr" : undefined} title={value}>{value}</dd>
        </div>
    );
}
