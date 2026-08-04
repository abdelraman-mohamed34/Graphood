"use client"

import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { CheckCircle2, XCircle } from "lucide-react"
import type { SubscriptionCapabilities } from "@/shared/lib/auth/requires/require-subscription"
import { useTranslations } from "next-intl"

type FeatureAvailabilityProps = {
    capabilities: SubscriptionCapabilities | null
}

export default function FeatureAvailability({
    capabilities,
}: FeatureAvailabilityProps) {
    const t = useTranslations("dashboard.subscription")
    const features = [
        {
            name: t("features.reports"),
            enabled: capabilities?.limits?.hasReports ?? false,
        },
        {
            name: t("features.aiAssistant"),
            enabled: capabilities?.limits?.hasWordAssistant ?? false,
        },
        {
            name: t("features.apiAccess"),
            enabled: false, // Placeholder
        },
        {
            name: t("features.multiMembers"),
            enabled: true, // Placeholder
        },
        {
            name: t("features.whiteLabel"),
            enabled: false, // Placeholder
        },
    ]

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t("features.title")}</CardTitle>
                <CardDescription>
                    {t("features.description")}
                </CardDescription>
            </CardHeader>

            <CardContent>
                <div className="space-y-3">
                    {features.map((feature) => (
                        <div
                            key={feature.name}
                            className="flex items-center justify-between rounded-lg border p-3"
                        >
                            <div className="flex items-center gap-3">
                                {feature.enabled ? (
                                    <CheckCircle2 className="size-5 text-emerald-500" />
                                ) : (
                                    <XCircle className="size-5 text-red-500" />
                                )}

                                <span className="font-medium">{feature.name}</span>
                            </div>

                            <Badge
                                variant={feature.enabled ? "default" : "secondary"}
                            >
                                {feature.enabled ? t("features.enabled") : t("features.unavailable")}
                            </Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
