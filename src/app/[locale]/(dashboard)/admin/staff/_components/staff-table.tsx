"use client";

import { ShieldAlert, ShieldCheck } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { usePlatformStaff } from "@/shared/lib/hooks/admins/use-platform-staff";
import { DeleteStaffDialog } from "./delete-staff-dialog";

export function StaffTable() {
    const t = useTranslations("AdminStaff");
    const format = useFormatter();
    const { staff, isSuperAdmin, isLoadingStaff, error, refresh } = usePlatformStaff();

    if (isLoadingStaff) {
        return <TableLoadingState />;
    }

    if (error) {
        return (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
                <p className="text-sm text-destructive">{t("table.loadError")}</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => void refresh()}>
                    {t("actions.retry")}
                </Button>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
            <div className="w-full overflow-x-auto">
                <Table className="min-w-[620px]">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-start">{t("table.email")}</TableHead>
                            <TableHead className="hidden text-start md:table-cell">
                                {t("table.profileId")}
                            </TableHead>
                            <TableHead className="text-start">{t("table.role")}</TableHead>
                            <TableHead className="hidden text-start md:table-cell">
                                {t("table.createdAt")}
                            </TableHead>
                            {isSuperAdmin && (
                                <TableHead className="w-20 text-center">{t("table.actions")}</TableHead>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {staff.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={isSuperAdmin ? 5 : 4} className="h-28 text-center text-muted-foreground">
                                    {t("table.empty")}
                                </TableCell>
                            </TableRow>
                        ) : (
                            staff.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell className="max-w-52 truncate font-medium" dir="ltr">
                                        {member.email ?? t("table.emailUnavailable")}
                                    </TableCell>
                                    <TableCell className="hidden font-mono text-xs md:table-cell" dir="ltr">
                                        {member.profileId}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={member.role === "SUPER_ADMIN" ? "destructive" : "secondary"}
                                            className="gap-1 whitespace-nowrap"
                                        >
                                            {member.role === "SUPER_ADMIN" ? (
                                                <ShieldAlert className="size-3" />
                                            ) : (
                                                <ShieldCheck className="size-3" />
                                            )}
                                            {t(`roles.${member.role}`)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="hidden whitespace-nowrap text-sm text-muted-foreground md:table-cell">
                                        {member.createdAt
                                            ? format.dateTime(new Date(member.createdAt), { dateStyle: "medium" })
                                            : t("table.unknownDate")}
                                    </TableCell>
                                    {isSuperAdmin && (
                                        <TableCell className="text-center">
                                            <DeleteStaffDialog staff={member} />
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

function TableLoadingState() {
    return (
        <div className="overflow-hidden rounded-lg border">
            <div className="space-y-3 p-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-10 w-full" />
                ))}
            </div>
        </div>
    );
}
