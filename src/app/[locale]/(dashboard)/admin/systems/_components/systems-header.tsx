"use client";

import { AlertTriangle, CheckCircle2, Clock, Server } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSystems } from "@/shared/lib/hooks/admins/use-systems";

export function SystemsHeader() {
    const t = useTranslations("AdminSystems");
    const { systems, isLoading } = useSystems();
    const stats = [
        { key: "total", value: systems.length, icon: Server, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40" },
        { key: "pending", value: systems.filter((item) => item.status === "PENDING").length, icon: Clock, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40" },
        { key: "active", value: systems.filter((item) => item.status === "ACTIVE").length, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40" },
        { key: "inactive", value: systems.filter((item) => item.status === "SUSPENDED" || item.status === "REJECTED").length, icon: AlertTriangle, color: "text-red-600 bg-red-50 dark:bg-red-950/40" },
    ] as const;

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-1 border-b pb-4 text-start">
                <div className="flex items-center gap-2">
                    <Server className="size-6 text-primary" />
                    <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{t("header.title")}</h1>
                </div>
                <p className="text-sm text-muted-foreground">{t("header.description")}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                {stats.map(({ key, value, icon: Icon, color }) => (
                    <Card key={key} className="border shadow-none">
                        <CardContent className="flex items-center justify-between p-4">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground">{t(`stats.${key}`)}</p>
                                {isLoading ? <Skeleton className="h-8 w-10" /> : <p className="text-2xl font-bold">{value}</p>}
                            </div>
                            <div className={`rounded-xl p-2.5 ${color}`}><Icon className="size-5" /></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
