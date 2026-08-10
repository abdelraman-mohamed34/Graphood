"use client";

import {
    Ban,
    CheckCircle2,
    ExternalLink,
    MoreHorizontal,
    Search,
    XCircle,
} from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Link } from "@/i18n/navigation";
import { useSystems } from "@/shared/lib/hooks/admins/use-systems";
import type { SystemItem, SystemItemStatus } from "@/shared/lib/schemas/systems.schema";
import { TableSkeleton } from "../../staff/_components/table-skeleton";
import { SystemActionDialog, type SystemAction } from "./system-action-dialog";

type SystemFilter = "ALL" | "PENDING" | "ACTIVE" | "SUSPENDED" | "REJECTED";
const filters: SystemFilter[] = ["ALL", "PENDING", "ACTIVE", "SUSPENDED", "REJECTED"];

export function SystemsTable() {
    const t = useTranslations("AdminSystems");
    const format = useFormatter();
    const { systems, isLoading, error, refresh } = useSystems();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<SystemFilter>("ALL");
    const [selectedSystem, setSelectedSystem] = useState<{
        system: SystemItem;
        action: SystemAction;
    } | null>(null);

    const filteredSystems = useMemo(() => {
        const query = searchQuery.trim().toLocaleLowerCase();
        return systems.filter((system) => {
            const matchesStatus = activeFilter === "ALL" || system.status === activeFilter;
            const matchesSearch =
                !query ||
                [system.name, system.slug, system.ownerEmail, system.ownerName]
                    .filter(Boolean)
                    .some((value) => value!.toLocaleLowerCase().includes(query));
            return matchesStatus && matchesSearch;
        });
    }, [activeFilter, searchQuery, systems]);

    if (isLoading) return <TableSkeleton />;

    if (error) {
        return (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
                <p className="text-sm text-destructive">{t("table.loadError")}</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => void refresh()}>
                    {t("actions.retry")}
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
                <div className="relative w-full sm:w-80">
                    <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder={t("search.placeholder")}
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        className="h-9 ps-9"
                    />
                </div>
                <div className="flex w-full items-center gap-1.5 overflow-x-auto pb-1 sm:w-auto sm:pb-0">
                    {filters.map((status) => (
                        <Button
                            key={status}
                            variant={activeFilter === status ? "default" : "outline"}
                            size="sm"
                            onClick={() => setActiveFilter(status)}
                            className="h-8 whitespace-nowrap text-xs"
                        >
                            {t(`filters.${status}`)}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                <div className="overflow-x-auto">
                    <Table className="min-w-[720px]">
                        <TableHeader>
                            <TableRow className="bg-muted/40">
                                <TableHead className="text-start">{t("table.system")}</TableHead>
                                <TableHead className="text-start">{t("table.owner")}</TableHead>
                                <TableHead className="text-start">{t("table.status")}</TableHead>
                                <TableHead className="text-start">{t("table.createdAt")}</TableHead>
                                <TableHead className="w-20 text-center">{t("table.actions")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSystems.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-28 text-center text-muted-foreground">
                                        {t("table.empty")}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredSystems.map((system) => (
                                    <TableRow key={system.id} className="transition-colors hover:bg-muted/20">
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold">{system.name}</span>
                                                <span className="font-mono text-xs text-muted-foreground" dir="ltr">{system.slug}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-sm">
                                                {system.ownerName && <span>{system.ownerName}</span>}
                                                <span className="font-mono text-xs text-muted-foreground" dir="ltr">
                                                    {system.ownerEmail ?? t("table.emailUnavailable")}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell><StatusBadge status={system.status} /></TableCell>
                                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                                            {system.createdAt
                                                ? format.dateTime(new Date(system.createdAt), { dateStyle: "medium" })
                                                : t("table.unknownDate")}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="size-8" aria-label={t("actions.openMenu")}>
                                                        <MoreHorizontal className="size-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-52">
                                                    <DropdownMenuLabel>{t("actions.options")}</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/marketplace/systems/${system.id}`} className="cursor-pointer gap-2">
                                                            <ExternalLink className="size-4 text-muted-foreground" />
                                                            {t("actions.preview")}
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    {system.status === "PENDING" && (
                                                        <>
                                                            <ActionItem icon={CheckCircle2} label={t("actions.activate")} className="text-emerald-600 focus:text-emerald-700" onSelect={() => setSelectedSystem({ system, action: "ACCEPT" })} />
                                                            <ActionItem icon={XCircle} label={t("actions.reject")} className="text-destructive focus:text-destructive" onSelect={() => setSelectedSystem({ system, action: "REJECT" })} />
                                                        </>
                                                    )}
                                                    {system.status === "ACTIVE" && (
                                                        <ActionItem icon={Ban} label={t("actions.suspend")} className="text-orange-600 focus:text-orange-700" onSelect={() => setSelectedSystem({ system, action: "SUSPEND" })} />
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {selectedSystem && (
                <SystemActionDialog
                    isOpen
                    systemId={selectedSystem.system.id}
                    systemName={selectedSystem.system.name}
                    action={selectedSystem.action}
                    onClose={() => setSelectedSystem(null)}
                />
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: SystemItemStatus }) {
    const t = useTranslations("AdminSystems.statuses");
    const styles: Record<SystemItemStatus, string> = {
        PENDING: "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/30",
        ACTIVE: "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30",
        SUSPENDED: "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-950/30",
        REJECTED: "border-red-500 bg-red-50 text-red-700 dark:bg-red-950/30",
        ARCHIVED: "border-slate-500 bg-slate-50 text-slate-700 dark:bg-slate-950/30",
    };
    return <Badge variant="outline" className={styles[status]}>{t(status)}</Badge>;
}

function ActionItem({ icon: Icon, label, className, onSelect }: {
    icon: typeof CheckCircle2;
    label: string;
    className: string;
    onSelect: () => void;
}) {
    return (
        <DropdownMenuItem className={`cursor-pointer gap-2 ${className}`} onSelect={onSelect}>
            <Icon className="size-4" />
            {label}
        </DropdownMenuItem>
    );
}
