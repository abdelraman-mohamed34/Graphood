"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { Shield } from "lucide-react";

import { useTenantUsage } from "@/shared/lib/hooks";
import { useTranslations } from "next-intl";

export default function UsageCards() {
    const t = useTranslations("dashboard.subscription");
    const {
        admins,
        isLoading,
    } = useTenantUsage();

    if (isLoading) {
        return null;
    }

    return (
        <section className="space-y-4">
            <div>
                <h2 className="text-lg font-semibold">
                    {t("usage.title")}
                </h2>

                <p className="text-sm text-muted-foreground">
                    {t("usage.description")}
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            {t("usage.administrators")}
                        </CardTitle>

                        <Shield className="size-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent className="space-y-3">
                        {admins.unlimited ? (
                            <>
                                <div className="text-2xl font-bold">
                                    {t("unlimited")}
                                </div>

                                <p className="text-xs text-muted-foreground">
                                    {t("usage.unlimitedAdministrators")}
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="text-2xl font-bold">
                                    {admins.current}

                                    <span className="text-base font-normal text-muted-foreground">
                                        {" "}
                                        / {admins.limit}
                                    </span>
                                </div>

                                <Progress
                                    value={
                                        admins.percent ?? 0
                                    }
                                />

                                <p className="text-xs text-muted-foreground">
                                    {t("usage.remainingAdministrators", { count: admins.remaining ?? 0 })}
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
