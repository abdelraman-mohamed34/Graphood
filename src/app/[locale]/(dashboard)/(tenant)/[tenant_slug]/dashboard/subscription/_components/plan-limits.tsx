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
import { useTranslations } from "next-intl";

export default function PlanLimits() {
    const t = useTranslations("dashboard.subscription");
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
            name: t("limits.administrators"),
            value: admins.unlimited
                ? t("unlimited")
                : admins.limit,
        },
        {
            name: t("limits.members"),
            value: members.unlimited
                ? t("unlimited")
                : members.limit,
        },
        {
            name: t("limits.storage"),
            value: storage.unlimited
                ? t("unlimited")
                : t("limits.storageValue", { value: storage.limit ?? 0 }),
        },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {t("limits.title")}
                </CardTitle>

                <CardDescription>
                    {t("limits.description")}
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

                                <TableCell className="text-end text-muted-foreground">
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
