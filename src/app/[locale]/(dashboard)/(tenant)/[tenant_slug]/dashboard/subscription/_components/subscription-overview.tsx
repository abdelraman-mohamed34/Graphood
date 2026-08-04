import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { useTenantUsage } from "@/shared/lib/hooks";
import { useTranslations } from "next-intl";

import SubscriptionStatusBadge from "./subscription-status-badge";

interface SubscriptionSummary {
    status?: "ACTIVE" | "TRIAL" | "PAST_DUE" | "CANCELED" | "EXPIRED" | null;
    renewalDate?: string | null;
    billingInterval?: string | null;
}

type SubscriptionOverviewProps = {
    subscription?: SubscriptionSummary | null;
};

export default function SubscriptionOverview({
    subscription,
}: SubscriptionOverviewProps) {
    const t = useTranslations("dashboard.subscription");
    const {
        plan,
        licenseType,
        isLoading,
    } = useTenantUsage();

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-52" />
                    <Skeleton className="h-4 w-80" />
                </CardHeader>

                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <Card key={index}>
                                <CardHeader className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-7 w-20" />
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {t("overview.title")}
                </CardTitle>

                <CardDescription>
                    {t("overview.description")}
                </CardDescription>
            </CardHeader>

            <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>
                                {t("overview.currentPlan")}
                            </CardDescription>

                            <CardTitle>
                                {t.has(`plans.${plan.toLowerCase()}`) ? t(`plans.${plan.toLowerCase()}`) : plan}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>
                                {t("overview.licenseType")}
                            </CardDescription>

                            <CardTitle>
                                {t.has(`licenses.${licenseType.toLowerCase()}`)
                                    ? t(`licenses.${licenseType.toLowerCase()}`)
                                    : licenseType}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>
                                {t("overview.status")}
                            </CardDescription>

                            <SubscriptionStatusBadge
                                status={
                                    subscription?.status ??
                                    "UNKNOWN"
                                }
                            />
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>
                                {t("overview.renewalDate")}
                            </CardDescription>

                            <CardTitle>
                                {subscription?.renewalDate ??
                                    "-"}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>
                                {t("overview.billingInterval")}
                            </CardDescription>

                            <CardTitle>
                                {subscription?.billingInterval
                                    ? (t.has(`intervals.${subscription.billingInterval.toLowerCase()}`)
                                        ? t(`intervals.${subscription.billingInterval.toLowerCase()}`)
                                        : subscription.billingInterval)
                                    : "-"}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>
            </CardContent>
        </Card>
    );
}
