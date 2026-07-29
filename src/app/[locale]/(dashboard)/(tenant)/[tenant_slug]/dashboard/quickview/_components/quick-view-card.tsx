"use client";

import {
    CheckCircle2,
    Flame,
    LucideIcon,
    Shield,
    Users,
} from "lucide-react";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { LICENSE_MODELS } from "@/shared/config/licensing";
import { useTenantUsage } from "@/shared/lib/hooks";

function FeatureItem({
    icon: Icon,
    children,
}: {
    icon: LucideIcon;
    children: React.ReactNode;
}) {
    return (
        <li className="flex items-center gap-2 text-muted-foreground">
            <Icon className="h-4 w-4 shrink-0 text-emerald-500" />
            <span>{children}</span>
        </li>
    );
}

export function QuickViewCard() {

    const {
        plan,
        licenseType,
        admins,
        features,
        isLoading,
    } = useTenantUsage();

    if (isLoading) {
        return (
            <Card className="animate-pulse">
                <CardHeader className="space-y-3">
                    <div className="h-6 w-1/4 rounded bg-muted" />
                    <div className="h-4 w-1/3 rounded bg-muted" />
                </CardHeader>

                <CardContent>
                    <div className="h-24 rounded bg-muted" />
                </CardContent>
            </Card>
        );
    }

    const license = LICENSE_MODELS[licenseType];

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <CardTitle>
                            License & Subscription Details
                        </CardTitle>

                        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                    </div>

                    <CardDescription>
                        Manage your workspace limits and active plan capabilities.
                    </CardDescription>
                </div>

                <div className="flex items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        {plan}
                    </span>

                    <span className="flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                        <Shield className="h-3.5 w-3.5" />
                        {license.label}
                    </span>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-4">
                        <Users className="h-5 w-5 text-muted-foreground" />

                        <div>
                            <p className="text-xs text-muted-foreground">
                                Max Administrators
                            </p>

                            <p className="text-sm font-semibold">
                                {admins.unlimited ? (
                                    "Unlimited"
                                ) : (
                                    `${admins.limit!} Administrator${admins.limit! > 1 ? "s" : ""}`
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Active Workspace Features
                    </p>

                    <ul className="grid gap-2.5 text-sm">
                        {features.reports && (
                            <FeatureItem icon={CheckCircle2}>
                                Advanced reporting and interactive performance
                                dashboards
                            </FeatureItem>
                        )}

                        {features.wordAssistant && (
                            <FeatureItem icon={CheckCircle2}>
                                AI-powered Word Assistant and smart editing
                                toolkit
                            </FeatureItem>
                        )}

                        {license.isExclusive && (
                            <li className="flex items-center gap-2 font-medium text-amber-600 dark:text-amber-400">
                                <Flame className="h-4 w-4 shrink-0" />

                                <span>
                                    Lifetime exclusive ownership (No recurring
                                    fees)
                                </span>
                            </li>
                        )}
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}