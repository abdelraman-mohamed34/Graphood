import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import SubscriptionStatusBadge from "./subscription-status-badge";

type SubscriptionOverviewProps = {
    capabilities: any;
    subscription?: any;
    isLoading: boolean;
};

export default function SubscriptionOverview({
    capabilities,
    subscription,
    isLoading,
}: SubscriptionOverviewProps) {
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
                <CardTitle>Subscription Overview</CardTitle>
                <CardDescription>
                    Manage your current workspace subscription.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Current Plan</CardDescription>
                            <CardTitle>
                                {capabilities?.planName ?? "-"}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>License Type</CardDescription>
                            <CardTitle>
                                {capabilities?.license?.label ?? "-"}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Status</CardDescription>

                            <SubscriptionStatusBadge
                                status={
                                    capabilities?.isActive
                                        ? "ACTIVE"
                                        : "EXPIRED"
                                }
                            />
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Renewal Date</CardDescription>
                            <CardTitle>
                                {subscription?.renewalDate ?? "-"}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Billing Interval</CardDescription>
                            <CardTitle>
                                {subscription?.billingInterval ?? "-"}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>
            </CardContent>
        </Card>
    );
}