'use client';

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { InlineCode } from "@/shared/_components/inline-code";

export default function EndpointsPage() {
    const t = useTranslations("EndpointsPage");

    const endpoints = [
        {
            method: "GET",
            path: "/health",
            href: "/developer/docs/endpoints/health",
            description: t("table.descriptions.health"),
        },
        {
            method: "GET",
            path: "/me",
            href: "/developer/docs/endpoints/me",
            description: t("table.descriptions.me"),
        },
        {
            method: "GET",
            path: "/tenant",
            href: "/developer/docs/endpoints/tenant",
            description: t("table.descriptions.tenant"),
        },
        {
            method: "GET",
            path: "/memberships",
            href: "/developer/docs/endpoints/memberships",
            description: t("table.descriptions.memberships"),
        },
        {
            method: "GET",
            path: "/subscription",
            href: "/developer/docs/endpoints/subscription",
            description: t("table.descriptions.subscription"),
        },
    ];

    return (
        <div className="w-full max-w-4xl space-y-10 py-6 px-4 sm:px-6">
            {/* Header */}
            <header className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    {t("title")}
                </h1>

                <p className="text-base text-muted-foreground sm:text-lg">
                    {t("description")}
                </p>
            </header>

            {/* Endpoints Table */}
            <section className="space-y-4">
                <div className="overflow-hidden rounded-xl border bg-card">
                    <table className="w-full text-start text-sm">
                        <thead className="border-b bg-muted/50 text-muted-foreground">
                            <tr>
                                <th className="px-5 py-3.5 text-start font-medium">
                                    {t("table.headers.method")}
                                </th>

                                <th className="px-5 py-3.5 text-start font-medium">
                                    {t("table.headers.endpoint")}
                                </th>

                                <th className="px-5 py-3.5 text-start font-medium">
                                    {t("table.headers.description")}
                                </th>

                                <th className="w-16 px-5 py-3.5" />
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-border">
                            {endpoints.map((endpoint) => (
                                <tr
                                    key={endpoint.path}
                                    className="transition-colors hover:bg-muted/30"
                                >
                                    <td className="whitespace-nowrap px-5 py-4">
                                        <InlineCode color="success">
                                            {endpoint.method}
                                        </InlineCode>
                                    </td>

                                    <td className="whitespace-nowrap px-5 py-4">
                                        <InlineCode>{endpoint.path}</InlineCode>
                                    </td>

                                    <td className="px-5 py-4 text-muted-foreground leading-relaxed">
                                        {endpoint.description}
                                    </td>

                                    <td className="whitespace-nowrap px-5 py-4 text-end">
                                        <Link
                                            href={endpoint.href}
                                            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                                        >
                                            {t("table.headers.action")}
                                            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
