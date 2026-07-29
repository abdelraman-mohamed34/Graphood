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

export default function UsageCards() {
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
                    Usage
                </h2>

                <p className="text-sm text-muted-foreground">
                    Monitor your current workspace
                    limits.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            Administrators
                        </CardTitle>

                        <Shield className="size-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent className="space-y-3">
                        {admins.unlimited ? (
                            <>
                                <div className="text-2xl font-bold">
                                    Unlimited
                                </div>

                                <p className="text-xs text-muted-foreground">
                                    Your license has
                                    unlimited administrator
                                    accounts.
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
                                    {admins.remaining}{" "}
                                    administrator
                                    {admins.remaining === 1
                                        ? ""
                                        : "s"}{" "}
                                    remaining.
                                </p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}