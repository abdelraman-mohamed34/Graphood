"use client";

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import { useFormatter, useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlatformStaff } from "@/shared/lib/hooks/admins/use-platform-staff";

export function StaffAnalyticsCharts() {
    const t = useTranslations("AdminStaff");
    const format = useFormatter();
    const { staff, isLoadingStaff } = usePlatformStaff();

    if (isLoadingStaff) return <StaffAnalyticsSkeleton />;

    const roleData = [
        {
            role: "SUPER_ADMIN",
            count: staff.filter((member) => member.role === "SUPER_ADMIN").length,
            fill: "var(--color-SUPER_ADMIN)",
        },
        {
            role: "SUPPORT_AGENT",
            count: staff.filter((member) => member.role === "SUPPORT_AGENT").length,
            fill: "var(--color-SUPPORT_AGENT)",
        },
    ];

    const monthlyCounts = new Map<string, number>();
    for (const member of staff) {
        if (!member.createdAt) continue;
        const date = new Date(member.createdAt);
        const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
        monthlyCounts.set(key, (monthlyCounts.get(key) ?? 0) + 1);
    }
    const trendData = [...monthlyCounts.entries()]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([month, count]) => ({
            month: format.dateTime(new Date(`${month}-01T00:00:00Z`), {
                month: "short",
                year: "numeric",
                timeZone: "UTC",
            }),
            count,
        }));

    const roleConfig = {
        count: { label: t("analytics.staffCount") },
        SUPER_ADMIN: { label: t("roles.SUPER_ADMIN"), color: "var(--destructive)" },
        SUPPORT_AGENT: { label: t("roles.SUPPORT_AGENT"), color: "var(--primary)" },
    } satisfies ChartConfig;
    const trendConfig = {
        count: { label: t("analytics.staffCount"), color: "var(--primary)" },
    } satisfies ChartConfig;

    return (
        <div className="grid gap-4 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>{t("analytics.rolesTitle")}</CardTitle>
                    <CardDescription>{t("analytics.rolesDescription")}</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={roleConfig} className="mx-auto h-64 w-full max-w-md">
                        <PieChart accessibilityLayer>
                            <ChartTooltip content={<ChartTooltipContent nameKey="role" />} />
                            <Pie data={roleData} dataKey="count" nameKey="role" innerRadius={58} outerRadius={88} paddingAngle={3}>
                                {roleData.map((entry) => <Cell key={entry.role} fill={entry.fill} />)}
                            </Pie>
                        </PieChart>
                    </ChartContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>{t("analytics.growthTitle")}</CardTitle>
                    <CardDescription>{t("analytics.growthDescription")}</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer
                        config={trendConfig}
                        className="h-64 w-full rounded-lg bg-muted/20 p-3"
                    >
                        <BarChart
                            accessibilityLayer
                            data={trendData}
                            margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
                            barCategoryGap="30%"
                        >
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis dataKey="month" tickLine={false} axisLine tickMargin={8} />
                            <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                            <Bar
                                dataKey="count"
                                fill="var(--primary)"
                                maxBarSize={48}
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    );
}

function StaffAnalyticsSkeleton() {
    return (
        <div className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
                <Card key={index}>
                    <CardHeader><Skeleton className="h-5 w-40" /><Skeleton className="h-4 w-64 max-w-full" /></CardHeader>
                    <CardContent><Skeleton className="h-64 w-full" /></CardContent>
                </Card>
            ))}
        </div>
    );
}
