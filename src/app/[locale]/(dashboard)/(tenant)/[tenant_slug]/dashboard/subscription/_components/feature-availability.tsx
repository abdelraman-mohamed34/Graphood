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

type FeatureAvailabilityProps = {
    capabilities: any
}

export default function FeatureAvailability({
    capabilities,
}: FeatureAvailabilityProps) {
    const features = [
        {
            name: "Reports",
            enabled: capabilities?.limits?.hasReports ?? false,
        },
        {
            name: "AI Assistant",
            enabled: capabilities?.limits?.hasWordAssistant ?? false,
        },
        {
            name: "API Access",
            enabled: false, // Placeholder
        },
        {
            name: "Multi Members",
            enabled: true, // Placeholder
        },
        {
            name: "White Label",
            enabled: false, // Placeholder
        },
    ]

    return (
        <Card>
            <CardHeader>
                <CardTitle>Feature Availability</CardTitle>
                <CardDescription>
                    Features currently available for your workspace.
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
                                {feature.enabled ? "Enabled" : "Unavailable"}
                            </Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}