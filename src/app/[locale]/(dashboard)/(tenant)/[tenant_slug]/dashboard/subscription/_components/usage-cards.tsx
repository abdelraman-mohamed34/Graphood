"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { SubscriptionCapabilities } from "@/shared/lib/auth/requires/require-subscription"
import { Membership } from "@/shared/lib/schemas/memberships.schema"
import { Shield } from "lucide-react"


type UsageCardsProps = {
    capabilities: SubscriptionCapabilities;
    memberships?: Membership[] | null;
};

export default function UsageCards({
    capabilities,
    memberships = [],
}: UsageCardsProps) {

    const adminsUsed = memberships?.length ?? 0;
    const adminsMax = capabilities?.limits?.maxAdmins ?? 0

    const adminsProgress =
        adminsMax > 0
            ? (adminsUsed / adminsMax) * 100
            : 0

    return (
        <section className="space-y-4">
            <div>
                <h2 className="text-lg font-semibold">Usage</h2>
                <p className="text-sm text-muted-foreground">
                    Monitor your current workspace limits.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">

                {/* Admins */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">
                            Administrators
                        </CardTitle>

                        <Shield className="size-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent className="space-y-3">
                        <div className="text-2xl font-bold">
                            {adminsUsed}
                            <span className="text-base font-normal text-muted-foreground">
                                {" "}
                                / {adminsMax}
                            </span>
                        </div>

                        <Progress value={adminsProgress} />

                        <p className="text-xs text-muted-foreground">
                            Admin accounts currently assigned.
                        </p>
                    </CardContent>
                </Card>

            </div>
        </section>
    )
}