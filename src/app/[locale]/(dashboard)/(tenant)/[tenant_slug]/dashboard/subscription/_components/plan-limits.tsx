"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import {
    Table,
    TableBody,
    TableCell,
    TableRow,
} from "@/components/ui/table";

import { useTenantUsage } from "@/shared/lib/hooks";

export default function PlanLimits() {
    const {
        admins,
        members,
        storage,
        isLoading,
    } = useTenantUsage();

    if (isLoading) {
        return null;
    }

    const limits = [
        {
            name: "Administrators",
            value: admins.unlimited
                ? "Unlimited"
                : admins.limit,
        },
        {
            name: "Members",
            value: members.unlimited
                ? "Unlimited"
                : members.limit,
        },
        {
            name: "Storage",
            value: storage.unlimited
                ? "Unlimited"
                : `${storage.limit} GB`,
        },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    Plan Limits
                </CardTitle>

                <CardDescription>
                    Current limits included with your
                    subscription.
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
    );
}