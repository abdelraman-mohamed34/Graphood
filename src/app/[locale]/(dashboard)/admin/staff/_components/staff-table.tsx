"use client";

import { Eye, MoreHorizontal, ShieldAlert, ShieldCheck, Trash2 } from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePlatformStaff } from "@/shared/lib/hooks/admins/use-platform-staff";
import { DeleteStaffDialog } from "./delete-staff-dialog";
import { StaffDetailsDialog } from "./staff-details-dialog";
import { cn } from "@/lib/utils";

export function StaffTable() {
    const t = useTranslations("AdminStaff");
    const format = useFormatter();
    const { staff, isSuperAdmin, isLoadingStaff, error, refresh } = usePlatformStaff();
    const locale = useLocale();
    const directionText = locale === "ar" ? "text-right" : "text-left";

    if (isLoadingStaff) {
        return <TableLoadingState />;
    }

    if (error) {
        return (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
                <p className="text-sm text-destructive">{t("table.loadError")}</p>
                <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => void refresh()}
                >
                    {t("actions.retry")}
                </Button>
            </div>
        );
    }


    const superAdminCount = staff.filter(
        (member) => member.role === "SUPER_ADMIN",
    ).length;

    return (
        <TooltipProvider>
            <Card>
                <CardHeader>
                    <CardTitle>{t("table.title")}</CardTitle>
                    <CardDescription>{t("table.description")}</CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                <div className="w-full overflow-x-auto border-y">
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
                                <TableHead className="w-20 text-center">{t("table.actions")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {staff.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="h-28 text-center text-muted-foreground"
                                    >
                                        {t("table.empty")}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                staff.map((member) => {
                                    const isLastSuperAdmin =
                                        member.role === "SUPER_ADMIN" && superAdminCount === 1;

                                    return (
                                        <TableRow
                                            className={cn(
                                                directionText,
                                                isLastSuperAdmin && "opacity-60",
                                            )}
                                            key={member.id}
                                        >
                                            <TableCell
                                                className="max-w-52 truncate font-medium"
                                                dir="ltr"
                                            >
                                                {member.email ?? t("table.emailUnavailable")}
                                            </TableCell>
                                            <TableCell
                                                className="hidden font-mono text-xs md:table-cell"
                                                dir="ltr"
                                            >
                                                {member.profileId}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        member.role === "SUPER_ADMIN"
                                                            ? "destructive"
                                                            : "secondary"
                                                    }
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
                                                    ? format.dateTime(new Date(member.createdAt), {
                                                        dateStyle: "medium",
                                                    })
                                                    : t("table.unknownDate")}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" aria-label={t("actions.openMenu")}>
                                                            <MoreHorizontal className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuLabel>{t("table.actions")}</DropdownMenuLabel>
                                                        <StaffDetailsDialog
                                                            staff={member}
                                                            trigger={
                                                                <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                                                                    <Eye />
                                                                    {t("actions.viewDetails")}
                                                                </DropdownMenuItem>
                                                            }
                                                        />
                                                        {isSuperAdmin && <DropdownMenuSeparator />}
                                                        {isSuperAdmin && (isLastSuperAdmin ? (
                                                            <Tooltip delayDuration={300}>
                                                                <TooltipTrigger asChild>
                                                                    <div>
                                                                        <DropdownMenuItem disabled variant="destructive">
                                                                            <Trash2 />
                                                                            {t("delete.confirm")}
                                                                        </DropdownMenuItem>
                                                                    </div>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="left" className="max-w-xs text-xs">
                                                                    {t("table.cannotDeleteLastSuperAdmin")}
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        ) : (
                                                            <DeleteStaffDialog
                                                                staff={member}
                                                                trigger={
                                                                    <DropdownMenuItem
                                                                        variant="destructive"
                                                                        onSelect={(event) => event.preventDefault()}
                                                                    >
                                                                        <Trash2 />
                                                                        {t("delete.confirm")}
                                                                    </DropdownMenuItem>
                                                                }
                                                            />
                                                        ))}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
                </CardContent>
            </Card>
        </TooltipProvider>
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
