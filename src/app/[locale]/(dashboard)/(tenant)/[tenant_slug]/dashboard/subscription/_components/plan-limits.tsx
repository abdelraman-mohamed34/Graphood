"use client"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import {
    Table,
    TableBody,
    TableCell,
    TableRow,
} from "@/components/ui/table"

import type { SubscriptionCapabilities } from "@/shared/lib/auth/requires/require-subscription"


type PlanLimitsProps = {
    capabilities: SubscriptionCapabilities
}


export default function PlanLimits({
    capabilities,
}: PlanLimitsProps) {

    const limits = [
        {
            name: "Administrators",
            value: capabilities.limits.maxAdmins,
        },
    ]

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    Plan Limits
                </CardTitle>

                <CardDescription>
                    Current limits included with your subscription.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <Table>
                    <TableBody>
                        {limits.map(({ name, value }) => (
                            <TableRow key={name}>
                                <TableCell className="font-medium">
                                    {name}
                                </TableCell>

                                <TableCell className="text-right text-muted-foreground">
                                    {value}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}